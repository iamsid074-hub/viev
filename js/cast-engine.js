/* =========================================================
   VIEVS 2.0 AIRCAST • REAL-TIME YOUTUBE MIRROR & SOUND ENGINE
   Bidirectional BroadcastChannel • Server-Sent Events (SSE) • Fullscreen Live Mirror
   ========================================================= */

(function() {
  'use strict';

  // Audio Chime Synthesizer using Web Audio API
  let audioCtx = null;
  function playAppleChime() {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const now = audioCtx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.22, now + idx * 0.08 + 0.02);
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
      sess = JSON.parse(localStorage.getItem('viev_auth_session') || '{}');
    } catch (_) {}

    const isDigi = sess && (sess.code === '3011' || sess.code === '3009' || sess.role === 'digi');

    const digiProfile = {
      role: 'digi',
      code: '3011',
      name: 'Digi',
      channelName: 'DIGI (Avneet)',
      handle: '@avneetsaini7070',
      avatar: 'song/Screenshot 2026-10-24 224431.png'
    };

    const viratProfile = {
      role: 'user',
      code: '1711',
      name: 'Virat',
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
    lastSyncTimestamp: 0
  };

  // Broadcast Channels & Server SSE Connection
  let broadcastChannel = null;
  if (typeof BroadcastChannel !== 'undefined') {
    broadcastChannel = new BroadcastChannel('viev_2_aircast_channel');
  }

  function emitCastEvent(action, payload) {
    const data = Object.assign({ action, timestamp: Date.now() }, payload);

    // 1. Local Broadcast Channel (instant multi-tab)
    if (broadcastChannel) {
      try { broadcastChannel.postMessage(data); } catch (_) {}
    }

    // 2. localStorage Event fallback
    try {
      localStorage.setItem('viev_aircast_event', JSON.stringify(data));
    } catch (_) {}

    // 3. Server HTTP POST for cross-device WiFi sync
    fetch('/api/cast/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(() => {});
  }

  // Handle incoming cast events from any source
  function handleIncomingCastEvent(evt) {
    if (!evt || !evt.action) return;
    const { self } = getProfiles();

    switch (evt.action) {
      case 'invite': {
        // Only show invite if this client is the designated target OR in test mode
        if (evt.target && evt.target.role === self.role) {
          state.activeInvite = evt;
          showIncomingInviteBanner(evt);
        }
        break;
      }
      case 'accepted': {
        if (state.isCasting && evt.caster && evt.caster.role === self.role) {
          onCastAcceptedByCompanion(evt);
        }
        break;
      }
      case 'declined': {
        if (state.isCasting && evt.caster && evt.caster.role === self.role) {
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
      case 'ended': {
        if (state.isReceiving) {
          closeFullscreenReceiverTheater('Companion stopped casting');
        } else if (state.isCasting) {
          stopCasting(false);
        }
        break;
      }
    }
  }

  // Setup Broadcast Channel & Server SSE Listeners
  if (broadcastChannel) {
    broadcastChannel.onmessage = (e) => handleIncomingCastEvent(e.data);
  }

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
      es.addEventListener('invite', (e) => handleIncomingCastEvent({ action: 'invite', ...JSON.parse(e.data) }));
      es.addEventListener('accepted', (e) => handleIncomingCastEvent({ action: 'accepted', ...JSON.parse(e.data) }));
      es.addEventListener('declined', (e) => handleIncomingCastEvent({ action: 'declined', ...JSON.parse(e.data) }));
      es.addEventListener('sync', (e) => handleIncomingCastEvent({ action: 'sync', ...JSON.parse(e.data) }));
      es.addEventListener('reaction', (e) => handleIncomingCastEvent({ action: 'reaction', ...JSON.parse(e.data) }));
      es.addEventListener('ended', (e) => handleIncomingCastEvent({ action: 'ended', ...JSON.parse(e.data) }));
      es.onerror = () => {
        es.close();
        setTimeout(initSSE, 6000);
      };
    } catch (_) {}
  }
  initSSE();

  // Floating Reaction Particle Effect
  function spawnReactionParticle(emoji) {
    if (!emoji) return;
    const particle = document.createElement('div');
    particle.className = 'viev-floating-particle';
    particle.textContent = emoji;

    // Random horizontal position around center/right
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

    const { self, companion } = getProfiles();

    // Populate Companion Card
    const avatarEl = document.getElementById('cast-partner-avatar');
    const nameEl = document.getElementById('cast-partner-name');
    const handleEl = document.getElementById('cast-partner-handle');
    const statusEl = document.getElementById('cast-partner-status');
    const actionBtn = document.getElementById('cinema-start-cast-btn');
    const titleEl = document.getElementById('cinema-cast-title');

    if (avatarEl) avatarEl.src = companion.avatar;
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
    state.isCasting = true;
    state.target = companion;
    state.caster = self;

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

    // Emit cast invite
    emitCastEvent('invite', {
      caster: self,
      target: companion,
      video: currentVideo
    });

    // Update Cast Button in header to pulsing
    const castHeaderBtn = document.getElementById('yt-header-cast-btn');
    if (castHeaderBtn) castHeaderBtn.classList.add('is-active');
  }

  function onCastAcceptedByCompanion(evt) {
    closeCastModal();
    const { companion } = getProfiles();

    // Show floating caster HUD
    const hud = document.getElementById('viev-casting-floating-hud');
    const hudPartner = document.getElementById('viev-hud-partner-name');
    if (hud) hud.classList.add('is-visible');
    if (hudPartner) hudPartner.textContent = `Casting to ${companion.name} (Active)`;

    if (window.showHUD) {
      window.showHUD('Cast Connected', `Live screen mirror active with ${companion.name}`, 'cast');
    }
  }

  function onCastDeclinedByCompanion(evt) {
    closeCastModal();
    stopCasting(false);
    if (window.showHUD) {
      window.showHUD('Cast Declined', 'Companion is not available right now', 'info');
    }
  }

  function stopCasting(emit = true) {
    state.isCasting = false;
    state.target = null;
    closeCastModal();

    const hud = document.getElementById('viev-casting-floating-hud');
    if (hud) hud.classList.remove('is-visible');

    const castHeaderBtn = document.getElementById('yt-header-cast-btn');
    if (castHeaderBtn) castHeaderBtn.classList.remove('is-active');

    if (emit) {
      emitCastEvent('end', {});
    }
  }

  // --- RECEIVER INVITATION BANNER ---
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

    const casterName = evt.caster ? evt.caster.name : 'Digi';
    if (avatar && evt.caster && evt.caster.avatar) avatar.src = evt.caster.avatar;
    if (heading) heading.textContent = `${casterName} wants to show you something ✨`;
    if (subtext) subtext.textContent = `${casterName} is inviting you to watch her YouTube screen live with sound.`;

    if (evt.video && evt.video.id) {
      if (previewCard) previewCard.style.display = 'flex';
      if (thumb) thumb.src = `https://img.youtube.com/vi/${evt.video.id}/hqdefault.jpg`;
      if (videoTitle) videoTitle.textContent = evt.video.title || 'Live YouTube Video';
    } else {
      if (previewCard) previewCard.style.display = 'none';
    }

    overlay.classList.add('is-visible');
  }

  function hideIncomingInviteBanner() {
    const overlay = document.getElementById('viev-cast-invitation-overlay');
    if (overlay) overlay.classList.remove('is-visible');
  }

  function acceptIncomingCast() {
    hideIncomingInviteBanner();
    if (!state.activeInvite) return;

    state.isReceiving = true;
    state.caster = state.activeInvite.caster;

    // Send accept response
    emitCastEvent('respond', {
      accepted: true,
      target: state.activeInvite.target,
      caster: state.activeInvite.caster
    });

    // Open Fullscreen Live Mirror Theater
    openFullscreenReceiverTheater(state.activeInvite);
  }

  function declineIncomingCast() {
    hideIncomingInviteBanner();
    if (state.activeInvite) {
      emitCastEvent('respond', {
        accepted: false,
        target: state.activeInvite.target,
        caster: state.activeInvite.caster
      });
    }
    state.activeInvite = null;
  }

  // --- FULLSCREEN LIVE MIRROR THEATER (RECEIVER) ---
  let receiverIframe = null;

  function openFullscreenReceiverTheater(invite) {
    const theater = document.getElementById('viev-cast-fullscreen-theater');
    if (!theater) return;

    const caster = invite.caster || { name: 'Digi', avatar: 'song/Screenshot 2026-10-24 224431.png' };
    const video = invite.video || { id: 'kJQP7kiw5Fk', title: 'Live Stream', currentTime: 0 };

    const avatar = document.getElementById('viev-fullscreen-user-avatar');
    const name = document.getElementById('viev-fullscreen-user-name');
    const title = document.getElementById('viev-fullscreen-video-title');
    const glow = document.getElementById('viev-fullscreen-glow-layer');

    if (avatar) avatar.src = caster.avatar;
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

        // Only seek if drift is greater than 2.5 seconds to keep playback super smooth
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

  // --- HOOK INTO CINEMA.JS TO STREAM CASTER'S PLAYBACK CHANGES ---
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
      // Throttle sync to once per 1 second unless video changed
      if (playback.id !== state.lastSyncedVideoId || (now - state.lastSyncTimestamp > 950)) {
        state.lastSyncedVideoId = playback.id;
        state.lastSyncTimestamp = now;
        emitCastEvent('sync', { video: playback });
      }
    },
    // Test simulator: simulates incoming request from companion
    simulateTestReceiver: () => {
      closeCastModal();
      const { companion } = getProfiles();
      const mockInvite = {
        action: 'invite',
        caster: companion,
        target: getProfiles().self,
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

    // 2. Cast Modal Controls
    const closeCastBtn = document.getElementById('cinema-cast-close-btn');
    if (closeCastBtn) closeCastBtn.addEventListener('click', closeCastModal);

    const startCastBtn = document.getElementById('cinema-start-cast-btn');
    if (startCastBtn) startCastBtn.addEventListener('click', startCasting);

    const cancelCastBtn = document.getElementById('cinema-cancel-cast-btn');
    if (cancelCastBtn) cancelCastBtn.addEventListener('click', () => stopCasting(true));

    const testModeBtn = document.getElementById('cinema-cast-test-mode-btn');
    if (testModeBtn) testModeBtn.addEventListener('click', window.vievAirCast.simulateTestReceiver);

    // 3. Floating Caster HUD Stop Button
    const hudStopBtn = document.getElementById('viev-hud-stop-btn');
    if (hudStopBtn) hudStopBtn.addEventListener('click', () => stopCasting(true));

    // 4. Incoming Invitation Accept & Decline
    const acceptBtn = document.getElementById('viev-invite-accept-btn');
    if (acceptBtn) acceptBtn.addEventListener('click', acceptIncomingCast);

    const declineBtn = document.getElementById('viev-invite-decline-btn');
    if (declineBtn) declineBtn.addEventListener('click', declineIncomingCast);

    // 5. Fullscreen Receiver Theater Controls
    const fsExitBtn = document.getElementById('viev-fullscreen-exit-btn');
    if (fsExitBtn) fsExitBtn.addEventListener('click', () => closeFullscreenReceiverTheater('Exited fullscreen view'));

    const fsDisconnectBtn = document.getElementById('viev-fullscreen-disconnect-btn');
    if (fsDisconnectBtn) {
      fsDisconnectBtn.addEventListener('click', () => {
        emitCastEvent('end', {});
        closeFullscreenReceiverTheater('Disconnected live cast');
      });
    }

    // 6. Reaction Emoji Buttons
    const emojiBtns = document.querySelectorAll('.viev-reaction-emoji-btn');
    emojiBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const emoji = btn.textContent.trim();
        window.vievAirCast.sendReaction(emoji);
      });
    });
  });

})();
