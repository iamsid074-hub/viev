/* =========================================================
   VIEVS 2.0 AIRCAST • REAL-TIME SCREEN & SOUND MIRROR ENGINE
   Multi-Transport Signaling: BroadcastChannel • Storage Events • SSE • Smart Polling
   Works anywhere: Home, Music, Cinema/YouTube, Settings, Modals
   ========================================================= */

(function() {
  'use strict';

  // Unique Tab ID to prevent self-loopback across multi-tab testing
  const TAB_ID = 'tab_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();

  // Audio Chime Synthesizer using Web Audio API
  let audioCtx = null;
  function playAppleChime() {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }
      const now = audioCtx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.65);
      });
    } catch (_) {}
  }

  // Active User & Companion Profiles (Supports multi-tab isolation via sessionStorage)
  function getProfiles() {
    let sess = null;
    try {
      sess = window.__vievActiveSession 
        || JSON.parse(sessionStorage.getItem('viev_auth_session') || 'null')
        || JSON.parse(localStorage.getItem('viev_auth_session') || '{}');
    } catch (_) {}

    const isDigi = !!(sess && (sess.code === '3011' || sess.code === '3009' || sess.role === 'digi'));

    const digiProfile = {
      role: 'digi',
      code: (sess && sess.code === '3009') ? '3009' : '3011',
      name: (sess && isDigi && sess.name) ? sess.name : 'Digi',
      channelName: 'DIGI (Avneet)',
      handle: '@avneetsaini7070',
      avatar: 'song/Screenshot 2026-10-24 224431.png'
    };

    const viratProfile = {
      role: 'user',
      code: '1711',
      name: (sess && !isDigi && sess.name) ? sess.name : 'Virat',
      channelName: 'VIRAT PLAYS',
      handle: '@viratplaystdm',
      avatar: 'song/virat_plays_avatar.png'
    };

    return isDigi 
      ? { self: digiProfile, companion: viratProfile }
      : { self: viratProfile, companion: digiProfile };
  }

  // Cast Engine State
  const state = {
    isCasting: false,
    isReceiving: false,
    activeInvite: null,
    target: null,
    caster: null,
    lastSyncedVideoId: null,
    lastSyncedTime: 0,
    lastSyncTimestamp: 0,
    mySentInviteId: null
  };

  // Broadcast Channels & Server SSE Connection
  let broadcastChannel = null;
  if (typeof BroadcastChannel !== 'undefined') {
    broadcastChannel = new BroadcastChannel('viev_2_aircast_channel');
  }

  function emitCastEvent(action, payload) {
    const data = Object.assign({
      action,
      tabId: TAB_ID,
      senderTabId: TAB_ID,
      timestamp: Date.now()
    }, payload);

    // 1. Local Broadcast Channel (instant multi-tab in same browser)
    if (broadcastChannel) {
      try { broadcastChannel.postMessage(data); } catch (_) {}
    }

    // 2. localStorage Event fallback (instant cross-tab storage event)
    try {
      localStorage.setItem('viev_aircast_event', JSON.stringify(data));
      setTimeout(() => {
        try { localStorage.removeItem('viev_aircast_event'); } catch (_) {}
      }, 80);
    } catch (_) {}

    // 3. Server HTTP POST for cross-device / WiFi / Cloud sync
    fetch('/api/cast/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(() => {});
  }

  // Handle incoming cast events from any source (BroadcastChannel, SSE, Polling, Storage)
  let lastHandledInviteId = null;

  function handleIncomingCastEvent(evt) {
    if (!evt || !evt.action) return;
    // Don't process events emitted by this exact tab
    if (evt.senderTabId && evt.senderTabId === TAB_ID) return;
    if (evt.tabId && evt.tabId === TAB_ID) return;

    const { self } = getProfiles();

    switch (evt.action) {
      case 'invite': {
        // Did THIS tab send the invite?
        if (state.isCasting && evt.inviteId && evt.inviteId === state.mySentInviteId) {
          return;
        }

        // Avoid duplicate triggers for the same invite
        if (evt.inviteId && evt.inviteId === lastHandledInviteId && state.activeInvite) {
          return;
        }

        // Check if this invite is from the companion or targeted at us
        const isFromOther = evt.caster && (evt.caster.role !== self.role || evt.caster.code !== self.code);
        const isTargetMe = !evt.target || evt.target.role === self.role || evt.target.code === self.code;

        // If not casting, we are ready to receive invites anywhere in the app!
        if (isFromOther || isTargetMe || !state.isCasting) {
          if (evt.inviteId) lastHandledInviteId = evt.inviteId;
          state.activeInvite = evt;
          showIncomingInviteBanner(evt);
        }
        break;
      }

      case 'respond':
      case 'accepted': {
        const isAccepted = evt.action === 'accepted' || (evt.action === 'respond' && evt.accepted);
        if (isAccepted) {
          if (state.isCasting) {
            onCastAcceptedByCompanion(evt);
          }
        } else {
          if (state.isCasting) {
            onCastDeclinedByCompanion(evt);
          }
        }
        break;
      }

      case 'declined': {
        if (state.isCasting) {
          onCastDeclinedByCompanion(evt);
        }
        break;
      }

      case 'sync': {
        if (state.isReceiving) {
          syncReceiverPlayback(evt.video);
        }
        break;
      }

      case 'reaction': {
        spawnReactionParticle(evt.reaction);
        break;
      }

      case 'end':
      case 'ended': {
        if (state.isReceiving) {
          closeFullscreenReceiverTheater('Companion stopped casting');
        } else if (state.isCasting) {
          stopCasting(false);
        }
        hideIncomingInviteBanner();
        break;
      }
    }
  }

  // Setup Broadcast Channel Listener
  if (broadcastChannel) {
    broadcastChannel.onmessage = (e) => handleIncomingCastEvent(e.data);
  }

  // Setup Storage Listener for same-origin tabs
  window.addEventListener('storage', (e) => {
    if (e.key === 'viev_aircast_event' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        handleIncomingCastEvent(parsed);
      } catch (_) {}
    }
  });

  // Setup Server-Sent Events (SSE) for Network / Multi-Device
  function initSSE() {
    if (typeof EventSource === 'undefined') return;
    try {
      const es = new EventSource('/api/cast/events');
      es.addEventListener('init', (e) => {
        try {
          const sess = JSON.parse(e.data);
          if (sess && sess.status === 'invited' && sess.active) {
            handleIncomingCastEvent({ action: 'invite', ...sess });
          }
        } catch (_) {}
      });
      es.addEventListener('invite', (e) => handleIncomingCastEvent({ action: 'invite', ...JSON.parse(e.data) }));
      es.addEventListener('accepted', (e) => handleIncomingCastEvent({ action: 'accepted', ...JSON.parse(e.data) }));
      es.addEventListener('declined', (e) => handleIncomingCastEvent({ action: 'declined', ...JSON.parse(e.data) }));
      es.addEventListener('respond', (e) => handleIncomingCastEvent({ action: 'respond', ...JSON.parse(e.data) }));
      es.addEventListener('sync', (e) => handleIncomingCastEvent({ action: 'sync', ...JSON.parse(e.data) }));
      es.addEventListener('reaction', (e) => handleIncomingCastEvent({ action: 'reaction', ...JSON.parse(e.data) }));
      es.addEventListener('ended', (e) => handleIncomingCastEvent({ action: 'ended', ...JSON.parse(e.data) }));
      es.onerror = () => {
        es.close();
        setTimeout(initSSE, 7000);
      };
    } catch (_) {}
  }
  initSSE();

  // Smart Polling Loop (Essential fallback for Vercel, static servers, mobile browsers)
  let lastSeenUpdate = 0;
  async function pollCastStatus() {
    try {
      const res = await fetch('/api/cast/status?_t=' + Date.now(), { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const sess = data.session;
        if (sess && sess.lastUpdate && sess.lastUpdate > lastSeenUpdate) {
          lastSeenUpdate = sess.lastUpdate;

          if (sess.status === 'invited' && sess.active) {
            if (sess.inviteId && sess.inviteId !== lastHandledInviteId) {
              handleIncomingCastEvent(Object.assign({ action: 'invite' }, sess));
            }
          } else if (sess.status === 'accepted') {
            if (state.isCasting) {
              handleIncomingCastEvent(Object.assign({ action: 'accepted' }, sess));
            }
          } else if (sess.status === 'declined') {
            if (state.isCasting) {
              handleIncomingCastEvent(Object.assign({ action: 'declined' }, sess));
            }
          } else if (sess.status === 'ended') {
            handleIncomingCastEvent(Object.assign({ action: 'ended' }, sess));
          } else if (sess.status === 'sync' && state.isReceiving) {
            handleIncomingCastEvent(Object.assign({ action: 'sync' }, sess));
          }
        }
      }
    } catch (_) {}

    // Faster polling rate (650ms) when waiting for response or casting, 1200ms when idle
    const pollDelay = (state.isCasting || state.isReceiving || state.activeInvite) ? 650 : 1200;
    setTimeout(pollCastStatus, pollDelay);
  }
  setTimeout(pollCastStatus, 800);

  // Floating Reaction Particle Effect
  function spawnReactionParticle(emoji) {
    if (!emoji) return;
    const particle = document.createElement('div');
    particle.className = 'viev-floating-particle';
    particle.textContent = emoji;

    const minX = window.innerWidth * 0.35;
    const maxX = window.innerWidth * 0.85;
    const randomX = Math.floor(Math.random() * (maxX - minX)) + minX;
    const bottomY = window.innerHeight - 100;

    particle.style.left = `${randomX}px`;
    particle.style.top = `${bottomY}px`;

    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 2300);
  }

  // --- CAST MODAL (WHO TO CAST WITH) ---
  function openCastModal() {
    const modal = document.getElementById('cinema-cast-modal');
    if (!modal) return;

    const { companion } = getProfiles();

    // Populate Companion Card
    const avatarEl = document.getElementById('cast-partner-avatar');
    const nameEl = document.getElementById('cast-partner-name');
    const handleEl = document.getElementById('cast-partner-handle');
    const statusEl = document.getElementById('cast-partner-status');
    const actionBtn = document.getElementById('cinema-start-cast-btn');
    const titleEl = document.getElementById('cinema-cast-title');

    if (avatarEl && companion.avatar) avatarEl.src = companion.avatar;
    if (nameEl) nameEl.textContent = companion.name;
    if (handleEl) handleEl.textContent = `${companion.channelName} • ${companion.handle}`;
    if (statusEl) statusEl.textContent = '🟢 Online on VIEVS • Ready for Cast';
    if (titleEl) titleEl.textContent = `Cast to ${companion.name}`;
    if (actionBtn) {
      actionBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"></path>
          <line x1="2" y1="20" x2="2.01" y2="20"></line>
        </svg>
        <span>Start Live Cast to ${companion.name}</span>
      `;
    }

    // Reset initial view
    const initialView = document.getElementById('cinema-cast-initial-view');
    const waitingView = document.getElementById('cinema-cast-waiting-state');
    if (initialView) initialView.style.display = 'block';
    if (waitingView) waitingView.style.display = 'none';

    modal.classList.add('is-open');
  }

  function closeCastModal() {
    const modal = document.getElementById('cinema-cast-modal');
    if (modal) modal.classList.remove('is-open');
  }

  // --- START CASTING ---
  function startCasting() {
    const { self, companion } = getProfiles();
    const inviteId = 'cast_' + Date.now();
    state.isCasting = true;
    state.target = companion;
    state.caster = self;
    state.mySentInviteId = inviteId;

    // Grab current playing video state from Cinema if available
    let currentVideo = {
      id: 'kJQP7kiw5Fk',
      title: 'Trending Bollywood & India Hits',
      channel: 'YouTube',
      avatar: self.avatar,
      currentTime: 1,
      duration: 300,
      isPlaying: true
    };

    const mainIframe = document.getElementById('cinema-inapp-iframe');
    const theaterTitle = document.getElementById('cinema-theater-title');
    const theaterChannel = document.getElementById('cinema-theater-channel');
    const theaterAvatar = document.getElementById('cinema-theater-avatar');

    if (mainIframe && mainIframe.src) {
      const match = mainIframe.src.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
      if (match) currentVideo.id = match[1];
      if (theaterTitle && theaterTitle.textContent) currentVideo.title = theaterTitle.textContent;
      if (theaterChannel && theaterChannel.textContent) currentVideo.channel = theaterChannel.textContent;
      if (theaterAvatar && theaterAvatar.src) currentVideo.avatar = theaterAvatar.src;
    }

    // Switch modal to waiting state
    const initialView = document.getElementById('cinema-cast-initial-view');
    const waitingView = document.getElementById('cinema-cast-waiting-state');
    const waitingText = document.getElementById('cinema-cast-waiting-text');
    if (initialView) initialView.style.display = 'none';
    if (waitingView) waitingView.style.display = 'flex';
    if (waitingText) waitingText.textContent = `Beaming invite to ${companion.name}... Waiting for acceptance`;

    // Emit cast invite across all layers
    emitCastEvent('invite', {
      inviteId,
      caster: self,
      target: companion,
      video: currentVideo
    });

    // Update Cast Button in header to pulsing
    const castHeaderBtn = document.getElementById('yt-header-cast-btn');
    if (castHeaderBtn) castHeaderBtn.classList.add('is-active');

    if (window.showHUD) {
      window.showHUD('Beaming AirCast', `Request sent to ${companion.name}...`, 'cast');
    }
  }

  function onCastAcceptedByCompanion(evt) {
    closeCastModal();
    const { companion } = getProfiles();
    const partnerName = (evt.target && evt.target.name) ? evt.target.name : companion.name;

    // Show floating caster HUD
    const hud = document.getElementById('viev-casting-floating-hud');
    const hudPartner = document.getElementById('viev-hud-partner-name');
    if (hud) hud.classList.add('is-visible');
    if (hudPartner) hudPartner.textContent = `Casting to ${partnerName} (Active)`;

    // Play chime sound on acceptance!
    playAppleChime();

    if (window.showHUD) {
      window.showHUD('Cast Connected', `Live screen mirror active with ${partnerName}`, 'cast');
    }

    // Send immediate sync update of current video
    setTimeout(() => {
      if (window.vievAirCast && window.vievAirCast.notifyPlaybackState) {
        const mainIframe = document.getElementById('cinema-inapp-iframe');
        let currentId = 'kJQP7kiw5Fk';
        if (mainIframe && mainIframe.src) {
          const match = mainIframe.src.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
          if (match) currentId = match[1];
        }
        window.vievAirCast.notifyPlaybackState({
          id: currentId,
          currentTime: 1,
          isPlaying: true
        });
      }
    }, 400);
  }

  function onCastDeclinedByCompanion(evt) {
    closeCastModal();
    stopCasting(false);
    const { companion } = getProfiles();
    const partnerName = (evt.target && evt.target.name) ? evt.target.name : companion.name;
    if (window.showHUD) {
      window.showHUD('Cast Declined', `${partnerName} is not available right now`, 'info');
    }
  }

  function stopCasting(emit = true) {
    state.isCasting = false;
    state.target = null;
    state.mySentInviteId = null;
    closeCastModal();

    const hud = document.getElementById('viev-casting-floating-hud');
    if (hud) hud.classList.remove('is-visible');

    const castHeaderBtn = document.getElementById('yt-header-cast-btn');
    if (castHeaderBtn) castHeaderBtn.classList.remove('is-active');

    if (emit) {
      emitCastEvent('end', {});
    }
  }

  // --- RECEIVER INVITATION BANNER (Appears anywhere in VIEVS: Home, Music, Cinema, Settings) ---
  let inviteAutoDismissTimer = null;

  function showIncomingInviteBanner(evt) {
    playAppleChime();

    const overlay = document.getElementById('viev-cast-invitation-overlay');
    if (!overlay) return;

    const avatar = document.getElementById('viev-invite-avatar');
    const heading = document.getElementById('viev-invite-heading');
    const subtext = document.getElementById('viev-invite-subtext');
    const previewCard = document.getElementById('viev-invite-preview-card');
    const thumb = document.getElementById('viev-invite-thumb');
    const videoTitle = document.getElementById('viev-invite-video-title');

    const { companion } = getProfiles();
    const caster = evt.caster || companion || { name: 'Companion', avatar: 'song/virat_plays_avatar.png' };
    const casterName = caster.name || 'Companion';

    if (avatar && caster.avatar) avatar.src = caster.avatar;
    if (heading) heading.textContent = `${casterName} wants to show you something ✨`;
    if (subtext) subtext.textContent = `${casterName} is inviting you to watch live screen with synchronized audio.`;

    if (evt.video && evt.video.id) {
      if (previewCard) previewCard.style.display = 'flex';
      if (thumb) thumb.src = `https://img.youtube.com/vi/${evt.video.id}/hqdefault.jpg`;
      if (videoTitle) videoTitle.textContent = evt.video.title || 'Live YouTube Video';
    } else {
      if (previewCard) previewCard.style.display = 'none';
    }

    // Ensure overlay is brought to front and animated into view
    overlay.style.display = 'block';
    overlay.classList.add('is-visible');

    // Auto-dismiss after 60 seconds if no action taken
    if (inviteAutoDismissTimer) clearTimeout(inviteAutoDismissTimer);
    inviteAutoDismissTimer = setTimeout(() => {
      hideIncomingInviteBanner();
    }, 60000);
  }

  function hideIncomingInviteBanner() {
    if (inviteAutoDismissTimer) {
      clearTimeout(inviteAutoDismissTimer);
      inviteAutoDismissTimer = null;
    }
    const overlay = document.getElementById('viev-cast-invitation-overlay');
    if (overlay) {
      overlay.classList.remove('is-visible');
      setTimeout(() => {
        if (!overlay.classList.contains('is-visible')) {
          overlay.style.display = 'none';
        }
      }, 450);
    }
  }

  function acceptIncomingCast() {
    hideIncomingInviteBanner();
    if (!state.activeInvite) return;

    state.isReceiving = true;
    state.caster = state.activeInvite.caster;

    // 1. Pause background music player so audio does not collide
    try {
      if (typeof audio !== 'undefined' && audio && !audio.paused) {
        audio.pause();
      }
      if (typeof isPlaying !== 'undefined') {
        isPlaying = false;
      }
      const playBtn = document.getElementById('play-btn');
      if (playBtn) playBtn.classList.remove('playing');
    } catch (_) {}

    // 2. Send both 'accepted' and 'respond' actions to ensure all server/client models accept it
    const acceptPayload = {
      accepted: true,
      inviteId: state.activeInvite.inviteId,
      target: state.activeInvite.target,
      caster: state.activeInvite.caster
    };
    emitCastEvent('accepted', acceptPayload);
    emitCastEvent('respond', acceptPayload);

    // 3. Open Fullscreen Live Mirror Theater over whichever section user is in
    openFullscreenReceiverTheater(state.activeInvite);
  }

  function declineIncomingCast() {
    hideIncomingInviteBanner();
    if (state.activeInvite) {
      const declinePayload = {
        accepted: false,
        inviteId: state.activeInvite.inviteId,
        target: state.activeInvite.target,
        caster: state.activeInvite.caster
      };
      emitCastEvent('declined', declinePayload);
      emitCastEvent('respond', declinePayload);
    }
    state.activeInvite = null;
  }

  // --- FULLSCREEN LIVE MIRROR THEATER (RECEIVER) ---
  let receiverIframe = null;

  function openFullscreenReceiverTheater(invite) {
    const theater = document.getElementById('viev-cast-fullscreen-theater');
    if (!theater) return;

    const { companion } = getProfiles();
    const caster = invite.caster || companion || { name: 'Companion', avatar: 'song/Screenshot 2026-10-24 224431.png' };
    const video = invite.video || { id: 'kJQP7kiw5Fk', title: 'Live Stream', currentTime: 0 };

    const avatar = document.getElementById('viev-fullscreen-user-avatar');
    const name = document.getElementById('viev-fullscreen-user-name');
    const title = document.getElementById('viev-fullscreen-video-title');
    const glow = document.getElementById('viev-fullscreen-glow-layer');

    if (avatar && caster.avatar) avatar.src = caster.avatar;
    if (name) name.textContent = `${caster.name}'s YouTube`;
    if (title) title.textContent = video.title || 'YouTube Live Cast';
    if (glow && video.id) {
      glow.style.backgroundImage = `url('https://img.youtube.com/vi/${video.id}/hqdefault.jpg')`;
    }

    // Embed YouTube Player with full sound unmuted!
    const container = document.getElementById('viev-fullscreen-video-wrap');
    if (container) {
      const originParam = (window.location.origin && window.location.origin !== 'null' && window.location.protocol.startsWith('http'))
        ? `&origin=${encodeURIComponent(window.location.origin)}`
        : '';
      const startParam = video.currentTime ? `&start=${Math.floor(video.currentTime)}` : '';

      container.innerHTML = `
        <iframe id="viev-fullscreen-receiver-iframe" 
                class="viev-fullscreen-iframe" 
                src="https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&enablejsapi=1${originParam}${startParam}&controls=0&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowfullscreen></iframe>
        <div class="viev-fullscreen-sync-overlay">
          <div class="viev-sync-indicator-dot"></div>
          <span class="viev-sync-text">Live Synchronized • Sound Active 🔊</span>
        </div>
      `;

      receiverIframe = document.getElementById('viev-fullscreen-receiver-iframe');
      if (receiverIframe) {
        receiverIframe.onload = () => {
          try {
            receiverIframe.contentWindow.postMessage('{"event":"listening"}', '*');
            // Unmute and maximize audio
            receiverIframe.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*');
            receiverIframe.contentWindow.postMessage('{"event":"command","func":"setVolume","args":[100]}', '*');
            receiverIframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
          } catch (_) {}
        };
      }
    }

    state.lastSyncedVideoId = video.id;
    state.lastSyncedTime = video.currentTime || 0;
    theater.classList.add('is-active');

    // Attempt browser Fullscreen API for authentic theater immersion
    try {
      if (theater.requestFullscreen) {
        theater.requestFullscreen().catch(() => {});
      } else if (theater.webkitRequestFullscreen) {
        theater.webkitRequestFullscreen();
      }
    } catch (_) {}
  }

  function syncReceiverPlayback(video) {
    if (!video || !video.id) return;
    const title = document.getElementById('viev-fullscreen-video-title');
    const glow = document.getElementById('viev-fullscreen-glow-layer');
    if (title && video.title) title.textContent = video.title;

    // If video changed, load the new video!
    if (video.id !== state.lastSyncedVideoId) {
      state.lastSyncedVideoId = video.id;
      if (glow) glow.style.backgroundImage = `url('https://img.youtube.com/vi/${video.id}/hqdefault.jpg')`;

      const originParam = (window.location.origin && window.location.origin !== 'null' && window.location.protocol.startsWith('http'))
        ? `&origin=${encodeURIComponent(window.location.origin)}`
        : '';
      const startParam = video.currentTime ? `&start=${Math.floor(video.currentTime)}` : '';

      if (receiverIframe) {
        receiverIframe.src = `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&enablejsapi=1${originParam}${startParam}&controls=0&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3`;
        receiverIframe.onload = () => {
          try {
            receiverIframe.contentWindow.postMessage('{"event":"listening"}', '*');
            receiverIframe.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*');
            receiverIframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
          } catch (_) {}
        };
      }
      return;
    }

    // If same video, sync play/pause & seek
    if (receiverIframe && receiverIframe.contentWindow) {
      try {
        if (video.isPlaying === false) {
          receiverIframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        } else {
          receiverIframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        }

        // Only seek if drift is greater than 2.5 seconds to keep playback smooth
        if (typeof video.currentTime === 'number') {
          const drift = Math.abs(video.currentTime - state.lastSyncedTime);
          if (drift > 2.5) {
            receiverIframe.contentWindow.postMessage(JSON.stringify({
              event: 'command',
              func: 'seekTo',
              args: [video.currentTime, true]
            }), '*');
            state.lastSyncedTime = video.currentTime;
          }
        }
      } catch (_) {}
    }
  }

  function closeFullscreenReceiverTheater(reason) {
    state.isReceiving = false;
    const theater = document.getElementById('viev-cast-fullscreen-theater');
    if (theater) theater.classList.remove('is-active');

    // Blank out iframe to stop audio immediately
    const container = document.getElementById('viev-fullscreen-video-wrap');
    if (container) container.innerHTML = '';
    receiverIframe = null;

    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch (_) {}

    if (reason && window.showHUD) {
      window.showHUD('Cast Ended', reason, 'info');
    }
  }

  // --- HOOK INTO CINEMA.JS & GLOBAL WINDOW TO STREAM PLAYBACK ---
  window.vievAirCast = {
    openModal: openCastModal,
    closeModal: closeCastModal,
    startCast: startCasting,
    stopCast: stopCasting,
    acceptInvite: acceptIncomingCast,
    declineInvite: declineIncomingCast,
    sendReaction: (emoji) => {
      spawnReactionParticle(emoji);
      emitCastEvent('reaction', { reaction: emoji });
    },
    // Called by cinema.js whenever video changes or time ticks
    notifyPlaybackState: (playback) => {
      if (!state.isCasting) return;
      const now = Date.now();
      if (playback.id !== state.lastSyncedVideoId || (now - state.lastSyncTimestamp > 950)) {
        state.lastSyncedVideoId = playback.id;
        state.lastSyncTimestamp = now;
        emitCastEvent('sync', { video: playback });
      }
    },
    // Test simulator: simulates incoming request from companion
    simulateTestReceiver: () => {
      closeCastModal();
      const { companion, self } = getProfiles();
      const mockInvite = {
        action: 'invite',
        inviteId: 'mock_' + Date.now(),
        caster: companion,
        target: self,
        video: {
          id: 'BddP6PYo2gs',
          title: 'Ve Kamleya (Full Video) | Arijit Singh, Shreya Ghoshal | Alia, Ranveer',
          channel: 'Sony Music India',
          avatar: companion.avatar,
          currentTime: 14,
          duration: 246,
          isPlaying: true
        }
      };
      state.activeInvite = mockInvite;
      showIncomingInviteBanner(mockInvite);
    }
  };

  // Wire up DOM Listeners on page load
  document.addEventListener('DOMContentLoaded', () => {
    // 1. YouTube Header Cast Button
    const castHeaderBtn = document.getElementById('yt-header-cast-btn');
    if (castHeaderBtn) {
      castHeaderBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (state.isCasting) {
          stopCasting(true);
        } else {
          openCastModal();
        }
      });
    }

    // 2. Music Player AirPlay button triggers AirCast modal directly from Music Screen!
    const musicAirplayBtn = document.getElementById('music-airplay-btn');
    if (musicAirplayBtn) {
      musicAirplayBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (state.isCasting) {
          stopCasting(true);
        } else {
          openCastModal();
        }
      });
    }

    // 3. Cast Modal Controls
    const closeCastBtn = document.getElementById('cinema-cast-close-btn');
    if (closeCastBtn) closeCastBtn.addEventListener('click', closeCastModal);

    const startCastBtn = document.getElementById('cinema-start-cast-btn');
    if (startCastBtn) startCastBtn.addEventListener('click', startCasting);

    const cancelCastBtn = document.getElementById('cinema-cancel-cast-btn');
    if (cancelCastBtn) cancelCastBtn.addEventListener('click', () => stopCasting(true));

    const testModeBtn = document.getElementById('cinema-cast-test-mode-btn');
    if (testModeBtn) testModeBtn.addEventListener('click', window.vievAirCast.simulateTestReceiver);

    // 4. Floating Caster HUD Stop Button
    const hudStopBtn = document.getElementById('viev-hud-stop-btn');
    if (hudStopBtn) hudStopBtn.addEventListener('click', () => stopCasting(true));

    // 5. Incoming Invitation Accept & Decline
    const acceptBtn = document.getElementById('viev-invite-accept-btn');
    if (acceptBtn) acceptBtn.addEventListener('click', acceptIncomingCast);

    const declineBtn = document.getElementById('viev-invite-decline-btn');
    if (declineBtn) declineBtn.addEventListener('click', declineIncomingCast);

    // 6. Fullscreen Receiver Theater Controls
    const fsExitBtn = document.getElementById('viev-fullscreen-exit-btn');
    if (fsExitBtn) fsExitBtn.addEventListener('click', () => closeFullscreenReceiverTheater('Exited fullscreen view'));

    const fsDisconnectBtn = document.getElementById('viev-fullscreen-disconnect-btn');
    if (fsDisconnectBtn) {
      fsDisconnectBtn.addEventListener('click', () => {
        emitCastEvent('end', {});
        closeFullscreenReceiverTheater('Disconnected live cast');
      });
    }

    // 7. Reaction Emoji Buttons
    const emojiBtns = document.querySelectorAll('.viev-reaction-emoji-btn');
    emojiBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const emoji = btn.textContent.trim();
        window.vievAirCast.sendReaction(emoji);
      });
    });
  });

})();
