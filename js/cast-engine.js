/* =========================================================
   VIEVS 2.0 AIRCAST • LIVE IN-APP SCREEN MIRROR & SOUND ENGINE
   True Screen Mirroring • YouTube Feed & Player Live Mirror • Single Master Audio
   Works seamlessly: Home, Music, Cinema/YouTube, Settings
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

  // Active User & Companion Profiles
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
    mySentInviteId: null,
    currentScreenState: {
      view: 'feed', // 'feed' | 'player'
      section: 'cinema',
      chip: 'All',
      scrollTop: 0,
      video: null
    },
    receiverMuted: true // Single Master Audio: Muted on receiver by default to prevent echo/lag!
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

    // 1. Local Broadcast Channel (instant 0ms multi-tab in same browser)
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

        // Check if this invite is from companion or targeted at us
        const isFromOther = evt.caster && (evt.caster.role !== self.role || evt.caster.code !== self.code);
        const isTargetMe = !evt.target || evt.target.role === self.role || evt.target.code === self.code;

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

      case 'mirror_state': {
        if (state.isReceiving) {
          renderMirrorState(evt.screenState || evt);
        }
        break;
      }

      case 'sync': {
        if (state.isReceiving && evt.video) {
          syncReceiverPlayback(evt.video);
        }
        break;
      }

      case 'reaction': {
        spawnReactionParticle(evt.reaction);
        break;
      }

      case 'end':
      case 'stop':
      case 'ended': {
        // Stop on receiver IMMEDIATELY: close theater, wipe iframe, stop all audio
        closeFullscreenReceiverTheater('Companion stopped casting');
        if (state.isCasting) {
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
      es.addEventListener('mirror_state', (e) => handleIncomingCastEvent({ action: 'mirror_state', ...JSON.parse(e.data) }));
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
            // Instant stop on both sides
            closeFullscreenReceiverTheater('Companion stopped casting');
            if (state.isCasting) stopCasting(false);
          }

          // Live sync screen state (feed vs player)
          if (state.isReceiving && sess.screenState) {
            renderMirrorState(sess.screenState);
          }

          // Live sync video playback
          if (state.isReceiving && sess.video && sess.video.id) {
            if (sess.video.id !== state.lastSyncedVideoId || sess.status === 'sync') {
              syncReceiverPlayback(sess.video);
            }
          }
        }
      }
    } catch (_) {}

    // Faster polling rate (600ms) when active or waiting, 1200ms when idle
    const pollDelay = (state.isCasting || state.isReceiving || state.activeInvite) ? 600 : 1200;
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

    // Check if a video is ALREADY playing in the cinema lounge
    let isVideoPlayingNow = false;
    let currentVideo = null;

    if (window.getCurrentCinemaPlayingVideo) {
      currentVideo = window.getCurrentCinemaPlayingVideo();
      if (currentVideo && currentVideo.id && currentVideo.isPlaying) {
        isVideoPlayingNow = true;
      }
    }

    // Determine current view: If video is playing -> 'player'; If browsing feed -> 'feed'
    const cinemaScreenEl = document.getElementById('cinema-screen');
    const activeChipEl = document.querySelector('#cinema-category-chips .active-chip');
    const chipName = activeChipEl ? activeChipEl.textContent.trim() : 'All';

    state.currentScreenState = {
      view: isVideoPlayingNow ? 'player' : 'feed',
      section: 'cinema',
      chip: chipName,
      scrollTop: cinemaScreenEl ? cinemaScreenEl.scrollTop : 0,
      video: isVideoPlayingNow ? currentVideo : null
    };

    // Switch modal to waiting state
    const initialView = document.getElementById('cinema-cast-initial-view');
    const waitingView = document.getElementById('cinema-cast-waiting-state');
    const waitingText = document.getElementById('cinema-cast-waiting-text');
    if (initialView) initialView.style.display = 'none';
    if (waitingView) waitingView.style.display = 'flex';
    if (waitingText) waitingText.textContent = `Beaming invite to ${companion.name}... Waiting for acceptance`;

    // Emit cast invite across all layers (NO auto-play of any random song!)
    emitCastEvent('invite', {
      inviteId,
      caster: self,
      target: companion,
      screenState: state.currentScreenState,
      video: state.currentScreenState.video
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

    // Broadcast initial screen state to companion
    setTimeout(() => {
      emitCastEvent('mirror_state', {
        screenState: state.currentScreenState
      });
    }, 300);
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
    if (heading) heading.textContent = `${casterName} wants to share her screen ✨`;
    if (subtext) subtext.textContent = `${casterName} is inviting you to watch her YouTube screen live with sound.`;

    if (evt.video && evt.video.id) {
      if (previewCard) previewCard.style.display = 'flex';
      if (thumb) thumb.src = `https://img.youtube.com/vi/${evt.video.id}/hqdefault.jpg`;
      if (videoTitle) videoTitle.textContent = evt.video.title || 'Live YouTube Video';
    } else {
      if (previewCard) previewCard.style.display = 'none';
    }

    overlay.style.display = 'block';
    overlay.classList.add('is-visible');

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

    // Send both 'accepted' and 'respond' actions
    const acceptPayload = {
      accepted: true,
      inviteId: state.activeInvite.inviteId,
      target: state.activeInvite.target,
      caster: state.activeInvite.caster
    };
    emitCastEvent('accepted', acceptPayload);
    emitCastEvent('respond', acceptPayload);

    // Open Fullscreen Live Mirror Theater over whichever section user is in
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

  // --- FULLSCREEN LIVE MIRROR THEATER (RECEIVER SIDE) ---
  let receiverIframe = null;

  function openFullscreenReceiverTheater(invite) {
    const theater = document.getElementById('viev-cast-fullscreen-theater');
    if (!theater) return;

    const { companion } = getProfiles();
    const caster = invite.caster || companion || { name: 'Digi', avatar: 'song/Screenshot 2026-10-24 224431.png' };

    const avatar = document.getElementById('viev-fullscreen-user-avatar');
    const name = document.getElementById('viev-fullscreen-user-name');
    const title = document.getElementById('viev-fullscreen-video-title');
    const mirrorAvatar = document.getElementById('viev-mirror-avatar');

    if (avatar && caster.avatar) avatar.src = caster.avatar;
    if (mirrorAvatar && caster.avatar) mirrorAvatar.src = caster.avatar;
    if (name) name.textContent = `${caster.name}'s YouTube`;

    theater.style.display = 'flex';
    theater.classList.add('is-active');

    // Populate the mirror feed cards from active feed data
    populateMirrorFeedCards();

    // Check what view caster is currently on (player vs feed)
    const initialScreen = invite.screenState || { view: (invite.video && invite.video.id) ? 'player' : 'feed', video: invite.video };
    renderMirrorState(initialScreen);

    // Attempt browser Fullscreen API
    try {
      if (theater.requestFullscreen) {
        theater.requestFullscreen().catch(() => {});
      } else if (theater.webkitRequestFullscreen) {
        theater.webkitRequestFullscreen();
      }
    } catch (_) {}
  }

  // Populate Feed Cards inside the Live Mirror Viewport
  function populateMirrorFeedCards() {
    const container = document.getElementById('viev-mirror-cards-container');
    if (!container) return;

    // Read real cards from DOM or from VIRAT_YOUTUBE_FEED
    const realCards = document.querySelectorAll('#cinema-video-feed-grid .cinema-feed-card');
    if (realCards && realCards.length > 0) {
      let html = '';
      realCards.forEach((card, idx) => {
        if (idx > 12) return;
        const thumb = card.querySelector('.cinema-feed-thumb');
        const title = card.querySelector('.cinema-feed-title');
        const channel = card.querySelector('.cinema-feed-channel-name');
        const views = card.querySelector('.cinema-feed-views');
        const duration = card.querySelector('.cinema-feed-duration');
        const avatar = card.querySelector('.cinema-feed-avatar');

        html += `
          <div class="viev-mirror-card">
            <div class="viev-mirror-card-thumb-wrap">
              <img src="${thumb ? thumb.src : ''}" alt="" class="viev-mirror-card-thumb">
              ${duration ? `<span class="viev-mirror-card-duration">${duration.textContent}</span>` : ''}
            </div>
            <div class="viev-mirror-card-meta">
              <img src="${avatar ? avatar.src : 'song/Screenshot 2026-10-24 224431.png'}" alt="" class="viev-mirror-card-avatar">
              <div class="viev-mirror-card-info">
                <div class="viev-mirror-card-title">${title ? title.textContent : ''}</div>
                <div class="viev-mirror-card-sub">${channel ? channel.textContent : ''} • ${views ? views.textContent : ''}</div>
              </div>
            </div>
          </div>
        `;
      });
      container.innerHTML = html;
    } else if (window.VIRAT_YOUTUBE_FEED && window.VIRAT_YOUTUBE_FEED.length > 0) {
      let html = '';
      window.VIRAT_YOUTUBE_FEED.slice(0, 10).forEach(vid => {
        html += `
          <div class="viev-mirror-card">
            <div class="viev-mirror-card-thumb-wrap">
              <img src="${vid.thumb}" alt="" class="viev-mirror-card-thumb">
              <span class="viev-mirror-card-duration">♪ Video</span>
            </div>
            <div class="viev-mirror-card-meta">
              <img src="${vid.avatar || 'song/Screenshot 2026-10-24 224431.png'}" alt="" class="viev-mirror-card-avatar">
              <div class="viev-mirror-card-info">
                <div class="viev-mirror-card-title">${vid.title}</div>
                <div class="viev-mirror-card-sub">${vid.channel} • ${vid.views || '1M views'}</div>
              </div>
            </div>
          </div>
        `;
      });
      container.innerHTML = html;
    }
  }

  // Render Caster's exact view on Receiver's screen (Feed vs Player)
  function renderMirrorState(screenState) {
    if (!screenState) return;

    const feedWrap = document.getElementById('viev-mirror-feed-wrap');
    const videoWrap = document.getElementById('viev-fullscreen-video-wrap');
    const titleEl = document.getElementById('viev-fullscreen-video-title');
    const statusLabel = document.getElementById('viev-mirror-status-label');
    const { companion } = getProfiles();
    const casterName = (state.caster && state.caster.name) ? state.caster.name : companion.name;

    // View A: Caster is playing a Video
    if (screenState.view === 'player' && screenState.video && screenState.video.id) {
      if (feedWrap) feedWrap.style.display = 'none';
      if (videoWrap) videoWrap.style.display = 'block';

      if (titleEl) {
        titleEl.textContent = `${casterName} is watching: ${screenState.video.title || 'YouTube'}`;
      }

      // Sync and play the exact video!
      syncReceiverPlayback(screenState.video);
      return;
    }

    // View B: Caster is browsing YouTube Feed
    if (videoWrap) {
      videoWrap.style.display = 'none';
      // Blank out video so no audio plays while browsing!
      videoWrap.innerHTML = '';
      receiverIframe = null;
    }

    if (feedWrap) {
      feedWrap.style.display = 'flex';
    }

    if (titleEl) {
      titleEl.textContent = `${casterName}'s YouTube • Live Screen Mirror`;
    }

    if (statusLabel) {
      statusLabel.textContent = `${casterName} is browsing YouTube feed...`;
    }

    // Sync active category chip
    if (screenState.chip) {
      const chips = document.querySelectorAll('.viev-mirror-chip');
      chips.forEach(c => {
        const isMatch = c.textContent.trim().toLowerCase() === screenState.chip.toLowerCase();
        c.classList.toggle('is-active', isMatch);
      });
    }

    // Sync scrolling
    if (typeof screenState.scrollTop === 'number') {
      const scrollEl = document.getElementById('viev-mirror-feed-scroll');
      if (scrollEl) {
        scrollEl.scrollTop = screenState.scrollTop;
      }
    }
  }

  // Live video player sync (Single Master Audio: Caster plays audio, Receiver muted by default to eliminate echo!)
  function syncReceiverPlayback(video) {
    if (!video || !video.id) return;

    const titleEl = document.getElementById('viev-fullscreen-video-title');
    const glow = document.getElementById('viev-fullscreen-glow-layer');
    const { companion } = getProfiles();
    const casterName = (state.caster && state.caster.name) ? state.caster.name : companion.name;

    if (titleEl && video.title) {
      titleEl.textContent = `${casterName} is watching: ${video.title}`;
    }

    const container = document.getElementById('viev-fullscreen-video-wrap');
    const feedWrap = document.getElementById('viev-mirror-feed-wrap');

    if (feedWrap) feedWrap.style.display = 'none';
    if (container) container.style.display = 'block';

    // If video changed, load the new video!
    if (video.id !== state.lastSyncedVideoId) {
      state.lastSyncedVideoId = video.id;
      if (glow) glow.style.backgroundImage = `url('https://img.youtube.com/vi/${video.id}/hqdefault.jpg')`;

      const originParam = (window.location.origin && window.location.origin !== 'null' && window.location.protocol.startsWith('http'))
        ? `&origin=${encodeURIComponent(window.location.origin)}`
        : '';
      const startParam = video.currentTime ? `&start=${Math.floor(video.currentTime)}` : '';

      // Default mute=1 on receiver: Single Master Audio eliminates echo/lag!
      const muteParam = state.receiverMuted ? '&mute=1' : '&mute=0';

      if (container) {
        container.innerHTML = `
          <iframe id="viev-fullscreen-receiver-iframe" 
                  class="viev-fullscreen-iframe" 
                  src="https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&enablejsapi=1${originParam}${startParam}${muteParam}&controls=1&playsinline=1&rel=0&modestbranding=1" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  allowfullscreen></iframe>
          <div class="viev-fullscreen-sync-overlay">
            <div class="viev-sync-indicator-dot"></div>
            <span class="viev-sync-text">Live Mirrored with ${casterName}</span>
            <button type="button" class="viev-audio-mode-pill" id="viev-receiver-audio-toggle">
              ${state.receiverMuted ? '🔊 Unmute Local Audio' : '🔇 Mute Local Audio (Master Active)'}
            </button>
          </div>
        `;

        receiverIframe = document.getElementById('viev-fullscreen-receiver-iframe');
        if (receiverIframe) {
          receiverIframe.onload = () => {
            try {
              receiverIframe.contentWindow.postMessage('{"event":"listening"}', '*');
              if (!state.receiverMuted) {
                receiverIframe.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*');
                receiverIframe.contentWindow.postMessage('{"event":"command","func":"setVolume","args":[100]}', '*');
              } else {
                receiverIframe.contentWindow.postMessage('{"event":"command","func":"mute","args":""}', '*');
              }
              receiverIframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
            } catch (_) {}
          };
        }

        // Hook up audio toggle button
        const audioToggleBtn = document.getElementById('viev-receiver-audio-toggle');
        if (audioToggleBtn) {
          audioToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            state.receiverMuted = !state.receiverMuted;
            audioToggleBtn.textContent = state.receiverMuted ? '🔊 Unmute Local Audio' : '🔇 Mute Local Audio (Master Active)';
            if (receiverIframe && receiverIframe.contentWindow) {
              try {
                if (state.receiverMuted) {
                  receiverIframe.contentWindow.postMessage('{"event":"command","func":"mute","args":""}', '*');
                } else {
                  receiverIframe.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*');
                  receiverIframe.contentWindow.postMessage('{"event":"command","func":"setVolume","args":[100]}', '*');
                }
              } catch (_) {}
            }
          });
        }
      }
      return;
    }

    // If same video, sync play/pause & seek time
    if (receiverIframe && receiverIframe.contentWindow) {
      try {
        if (video.isPlaying === false) {
          receiverIframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        } else {
          receiverIframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        }

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

  // Close receiver theater immediately and kill all audio/iframes
  function closeFullscreenReceiverTheater(reason) {
    state.isReceiving = false;
    state.lastSyncedVideoId = null;
    state.activeInvite = null;

    const theater = document.getElementById('viev-cast-fullscreen-theater');
    if (theater) {
      theater.classList.remove('is-active');
      theater.style.display = 'none';
    }

    // Blank out iframe to STOP ALL AUDIO IMMEDIATELY!
    const container = document.getElementById('viev-fullscreen-video-wrap');
    if (container) container.innerHTML = '';
    receiverIframe = null;

    const feedWrap = document.getElementById('viev-mirror-feed-wrap');
    if (feedWrap) feedWrap.style.display = 'none';

    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch (_) {}

    if (reason && window.showHUD) {
      window.showHUD('Cast Disconnected', reason, 'info');
    }
  }

  // --- HOOKS EXPOSED TO CINEMA.JS & APPLICATION ---
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
    // Called whenever caster scrolls, clicks chips, or switches views
    notifyScreenState: (screenData) => {
      if (!state.isCasting) return;
      state.currentScreenState = Object.assign(state.currentScreenState, screenData);
      emitCastEvent('mirror_state', {
        screenState: state.currentScreenState
      });
    },
    // Called by cinema.js when a video plays, ticks, or seeks
    notifyPlaybackState: (playback) => {
      if (!state.isCasting) return;
      const now = Date.now();
      if (playback.id !== state.lastSyncedVideoId || (now - state.lastSyncTimestamp > 950)) {
        state.lastSyncedVideoId = playback.id;
        state.lastSyncTimestamp = now;

        state.currentScreenState.view = 'player';
        state.currentScreenState.video = playback;

        emitCastEvent('sync', { video: playback });
        emitCastEvent('mirror_state', { screenState: state.currentScreenState });
      }
    },
    // Test simulator
    simulateTestReceiver: () => {
      closeCastModal();
      const { companion, self } = getProfiles();
      const mockInvite = {
        action: 'invite',
        inviteId: 'mock_' + Date.now(),
        caster: companion,
        target: self,
        screenState: {
          view: 'feed',
          section: 'cinema',
          chip: 'All',
          scrollTop: 0
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

    // 4. Floating Caster HUD Stop Button (DIGI CLICKS STOP CAST)
    const hudStopBtn = document.getElementById('viev-hud-stop-btn');
    if (hudStopBtn) {
      hudStopBtn.addEventListener('click', () => {
        stopCasting(true);
      });
    }

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
