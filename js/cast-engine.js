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

  // --- SCREEN SHARE MODAL (WHO TO SHARE WITH) ---
  function openCastModal() {
    const modal = document.getElementById('cinema-cast-modal');
    if (!modal) return;

    try {
      const { companion } = getProfiles();

      // Populate Companion Card
      const avatarEl = document.getElementById('cast-partner-avatar');
      const nameEl = document.getElementById('cast-partner-name');
      const handleEl = document.getElementById('cast-partner-handle');
      const statusEl = document.getElementById('cast-partner-status');
      const actionBtn = document.getElementById('cinema-start-cast-btn');
      const titleEl = document.getElementById('cinema-cast-title');

      const companionName = (companion && companion.name) ? companion.name : 'Companion';
      const companionAvatar = (companion && companion.avatar) ? companion.avatar : 'song/virat_plays_avatar.png';
      const companionHandle = (companion && companion.handle) ? `${companion.channelName} • ${companion.handle}` : 'Companion';

      if (avatarEl) avatarEl.src = companionAvatar;
      if (nameEl) nameEl.textContent = companionName;
      if (handleEl) handleEl.textContent = companionHandle;
      if (statusEl) statusEl.textContent = '🟢 Online on VIEVS • Ready for Screen Share';
      if (titleEl) titleEl.textContent = `Share Screen with ${companionName}`;
      if (actionBtn) {
        actionBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
            <path d="M12 7l4 4-4 4"></path>
            <path d="M8 11h8"></path>
          </svg>
          <span>Start Screen Share with ${companionName}</span>
        `;
      }
    } catch (e) {
      console.warn('Error populating profiles:', e);
    }

    // Reset initial view
    const initialView = document.getElementById('cinema-cast-initial-view');
    const waitingView = document.getElementById('cinema-cast-waiting-state');
    if (initialView) initialView.style.display = 'block';
    if (waitingView) waitingView.style.display = 'none';

    modal.style.display = 'flex';
    void modal.offsetWidth; // Force reflow
    modal.classList.add('is-open');
  }

  function closeCastModal() {
    const modal = document.getElementById('cinema-cast-modal');
    if (modal) {
      modal.classList.remove('is-open');
      setTimeout(() => {
        if (!modal.classList.contains('is-open')) {
          modal.style.display = 'none';
        }
      }, 350);
    }
  }

  // --- START SCREEN SHARE ---
  function startCasting() {
    const { self, companion } = getProfiles();
    const inviteId = 'share_' + Date.now();
    state.isCasting = true;
    state.target = companion;
    state.caster = self;
    state.mySentInviteId = inviteId;

    // Grab full live snapshot (active video if any, real feed cards, active category chip, scroll position)
    let snapshot = null;
    if (typeof window.getScreenShareSnapshot === 'function') {
      snapshot = window.getScreenShareSnapshot();
    }
    if (!snapshot) {
      snapshot = {
        view: 'feed',
        section: 'cinema',
        activeChip: 'All',
        scrollTop: 0,
        feedCards: window.CURRENT_CINEMA_FEED || [],
        player: null
      };
    }
    state.currentScreenState = snapshot;

    // Switch modal to waiting state
    const initialView = document.getElementById('cinema-cast-initial-view');
    const waitingView = document.getElementById('cinema-cast-waiting-state');
    const waitingText = document.getElementById('cinema-cast-waiting-text');
    if (initialView) initialView.style.display = 'none';
    if (waitingView) waitingView.style.display = 'flex';
    if (waitingText) waitingText.textContent = `Sending screen share invitation to ${companion.name}... Waiting for acceptance`;

    // Emit screen share invite across all layers (NO auto-play of any random song!)
    emitCastEvent('invite', {
      inviteId,
      caster: self,
      target: companion,
      screenState: snapshot,
      video: snapshot.player
    });

    // Update Cast Button in header to pulsing
    const castHeaderBtn = document.getElementById('yt-header-cast-btn');
    if (castHeaderBtn) castHeaderBtn.classList.add('is-active');

    if (window.showHUD) {
      window.showHUD('Sharing Screen', `Request sent to ${companion.name}...`, 'cast');
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
    if (hudPartner) hudPartner.textContent = `Sharing screen to ${partnerName} (Active)`;

    // Play chime sound on acceptance!
    playAppleChime();

    if (window.showHUD) {
      window.showHUD('Screen Share Active', `Live streaming screen to ${partnerName}`, 'cast');
    }

    // Broadcast full live screen state to companion
    setTimeout(() => {
      if (typeof window.getScreenShareSnapshot === 'function') {
        state.currentScreenState = window.getScreenShareSnapshot();
      }
      emitCastEvent('mirror_state', {
        screenState: state.currentScreenState
      });
    }, 200);
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

  // --- FULLSCREEN LIVE SCREEN SHARE VIEWER (RECEIVER SIDE) ---
  let receiverIframe = null;

  function openFullscreenReceiverTheater(invite) {
    const theater = document.getElementById('viev-cast-fullscreen-theater');
    if (!theater) return;

    const { companion } = getProfiles();
    const caster = invite.caster || companion || { name: 'Digi', avatar: 'song/Screenshot 2026-10-24 224431.png' };

    const avatar = document.getElementById('viev-fullscreen-user-avatar');
    const name = document.getElementById('viev-fullscreen-user-name');
    const mirrorAvatar = document.getElementById('viev-mirror-avatar');

    if (avatar && caster.avatar) avatar.src = caster.avatar;
    if (mirrorAvatar && caster.avatar) mirrorAvatar.src = caster.avatar;
    if (name) name.textContent = `${caster.name}'s Screen`;

    // Audio Pill Setup
    updateReceiverAudioUI();
    const audioToggleBtn = document.getElementById('viev-audio-toggle-btn');
    if (audioToggleBtn && !audioToggleBtn._hasBound) {
      audioToggleBtn._hasBound = true;
      audioToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleReceiverAudio();
      });
    }

    theater.style.display = 'flex';
    theater.classList.add('is-active');

    // Render initial screen state (feed cards + player if active)
    const initialScreen = invite.screenState || {
      view: (invite.video && invite.video.id) ? 'player' : 'feed',
      player: invite.video,
      feedCards: []
    };
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

  function updateReceiverAudioUI() {
    const icon = document.getElementById('viev-audio-pill-icon');
    const label = document.getElementById('viev-audio-pill-label');
    if (icon) icon.textContent = state.receiverMuted ? '🔈' : '🔊';
    if (label) label.textContent = state.receiverMuted ? 'Sound Muted' : 'Sound Active';
  }

  function toggleReceiverAudio() {
    state.receiverMuted = !state.receiverMuted;
    updateReceiverAudioUI();
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
  }

  // Render Sharer's exact view on Receiver's screen (100% replica)
  function renderMirrorState(screenState) {
    if (!screenState) return;

    const { companion } = getProfiles();
    const casterName = (state.caster && state.caster.name) ? state.caster.name : companion.name;

    const titleEl = document.getElementById('viev-fullscreen-video-title');
    const statusLabel = document.getElementById('viev-mirror-status-label');
    const mirrorAvatar = document.getElementById('viev-mirror-avatar');
    if (mirrorAvatar && state.caster && state.caster.avatar) {
      mirrorAvatar.src = state.caster.avatar;
    }

    // 1. Sync Active Category Chip
    if (screenState.activeChip) {
      const chips = document.querySelectorAll('.viev-clone-chip');
      chips.forEach(c => {
        const isMatch = c.textContent.trim().toLowerCase() === screenState.activeChip.toLowerCase();
        c.classList.toggle('is-active', isMatch);
      });
    }

    // 2. Video Player Stage Sync
    const playerStage = document.getElementById('viev-clone-player-stage');
    const iframeBox = document.getElementById('viev-clone-iframe-box');
    const playerTitle = document.getElementById('viev-clone-player-title');
    const channelName = document.getElementById('viev-clone-channel-name');
    const channelAvatar = document.getElementById('viev-clone-channel-avatar');
    const channelSubs = document.getElementById('viev-clone-channel-subs');
    const likesVal = document.getElementById('viev-clone-likes-val');

    const isPlayerActive = screenState.player && screenState.player.id;

    if (isPlayerActive) {
      const p = screenState.player;
      if (playerStage) playerStage.style.display = 'block';

      if (playerTitle) playerTitle.textContent = p.title || 'YouTube Video';
      if (channelName) channelName.textContent = p.channel || 'YouTube';
      if (channelAvatar && p.avatar) channelAvatar.src = p.avatar;
      if (channelSubs) channelSubs.textContent = p.subs || '185M subscribers';
      if (likesVal) likesVal.textContent = p.likes || '50K';

      if (titleEl) titleEl.textContent = `${casterName} is watching: ${p.title || 'YouTube'}`;
      if (statusLabel) statusLabel.textContent = `${casterName} is watching ${p.title || 'YouTube'}`;

      // If video ID changed, inject new player
      if (p.id !== state.lastSyncedVideoId) {
        state.lastSyncedVideoId = p.id;
        state.lastSyncedTime = p.currentTime || 0;

        const originParam = (window.location.origin && window.location.origin !== 'null' && window.location.protocol.startsWith('http'))
          ? `&origin=${encodeURIComponent(window.location.origin)}`
          : '';
        const startParam = p.currentTime ? `&start=${Math.floor(p.currentTime)}` : '';
        const muteParam = state.receiverMuted ? '&mute=1' : '&mute=0';

        if (iframeBox) {
          iframeBox.innerHTML = `
            <iframe id="viev-clone-receiver-iframe"
                    src="https://www.youtube-nocookie.com/embed/${p.id}?autoplay=1&enablejsapi=1${originParam}${startParam}${muteParam}&controls=0&playsinline=1&rel=0&modestbranding=1&fs=0&disablekb=1"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen></iframe>
          `;
          receiverIframe = document.getElementById('viev-clone-receiver-iframe');
          if (receiverIframe) {
            receiverIframe.onload = () => {
              try {
                receiverIframe.contentWindow.postMessage('{"event":"listening"}', '*');
                if (state.receiverMuted) {
                  receiverIframe.contentWindow.postMessage('{"event":"command","func":"mute","args":""}', '*');
                } else {
                  receiverIframe.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*');
                  receiverIframe.contentWindow.postMessage('{"event":"command","func":"setVolume","args":[100]}', '*');
                }
                receiverIframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
              } catch (_) {}
            };
          }
        }
      } else if (receiverIframe && receiverIframe.contentWindow) {
        // Sync play / pause / seek
        try {
          if (p.isPlaying === false) {
            receiverIframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
          } else {
            receiverIframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
          }
          if (typeof p.currentTime === 'number') {
            const drift = Math.abs(p.currentTime - state.lastSyncedTime);
            if (drift > 2.5) {
              receiverIframe.contentWindow.postMessage(JSON.stringify({
                event: 'command',
                func: 'seekTo',
                args: [p.currentTime, true]
              }), '*');
              state.lastSyncedTime = p.currentTime;
            }
          }
        } catch (_) {}
      }

    } else {
      // Sharer is browsing feed -> hide player stage and blank out iframe! ZERO auto-play!
      if (playerStage) playerStage.style.display = 'none';
      if (iframeBox) iframeBox.innerHTML = '';
      receiverIframe = null;
      state.lastSyncedVideoId = null;

      if (titleEl) titleEl.textContent = `${casterName}'s Screen • Live Mirror`;
      if (statusLabel) statusLabel.textContent = `${casterName} is browsing YouTube feed...`;
    }

    // 3. Render Real Feed Cards (from Digi's feed)
    if (screenState.feedCards && Array.isArray(screenState.feedCards) && screenState.feedCards.length > 0) {
      renderClonedFeedCards(screenState.feedCards);
    }

    // 4. Synchronize Scroll Position
    if (typeof screenState.scrollTop === 'number') {
      const scrollContainer = document.getElementById('viev-screenshare-clone-scroll');
      if (scrollContainer) {
        scrollContainer.scrollTop = screenState.scrollTop;
      }
    }
  }

  function renderClonedFeedCards(cards) {
    const container = document.getElementById('viev-mirror-cards-container');
    if (!container) return;

    let html = '';
    cards.forEach(card => {
      const safeTitle = (card.title || 'YouTube Video').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      const safeChannel = (card.channel || 'Channel').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      const safeViews = card.views || '';
      const safePub = card.pub || '';
      const safeDuration = card.duration || 'Video';
      const thumb = card.thumb || (card.id ? `https://i.ytimg.com/vi/${card.id}/hqdefault.jpg` : '');
      const avatar = card.avatar || 'song/Screenshot 2026-10-24 224431.png';

      html += `
        <div class="viev-clone-card" data-videoid="${card.id || ''}">
          <div class="viev-clone-thumb-wrap">
            <img src="${thumb}" alt="${safeTitle}" class="viev-clone-thumb" loading="lazy">
            <span class="viev-clone-duration">${safeDuration}</span>
          </div>
          <div class="viev-clone-card-details">
            <img src="${avatar}" alt="" class="viev-clone-card-avatar">
            <div class="viev-clone-card-text">
              <h3 class="viev-clone-card-title">${safeTitle}</h3>
              <div class="viev-clone-card-meta">${safeChannel} • ${safeViews} ${safePub ? '• ' + safePub : ''}</div>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
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
    const iframeBox = document.getElementById('viev-clone-iframe-box');
    if (iframeBox) iframeBox.innerHTML = '';
    const container = document.getElementById('viev-fullscreen-video-wrap');
    if (container) container.innerHTML = '';
    receiverIframe = null;

    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch (_) {}

    if (reason && window.showHUD) {
      window.showHUD('Screen Share Ended', reason, 'info');
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
      if (typeof window.getScreenShareSnapshot === 'function') {
        const snap = window.getScreenShareSnapshot();
        state.currentScreenState = Object.assign(snap, screenData || {});
      } else {
        state.currentScreenState = Object.assign(state.currentScreenState, screenData || {});
      }
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

        if (typeof window.getScreenShareSnapshot === 'function') {
          state.currentScreenState = window.getScreenShareSnapshot();
        } else {
          state.currentScreenState.view = 'player';
          state.currentScreenState.player = playback;
        }

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
          activeChip: 'All',
          scrollTop: 0,
          feedCards: (typeof window.getScreenShareSnapshot === 'function' ? window.getScreenShareSnapshot().feedCards : null) || window.DIGI_YOUTUBE_FEED || [],
          player: null
        }
      };
      state.activeInvite = mockInvite;
      showIncomingInviteBanner(mockInvite);
    }
  };

  window.vievScreenShare = window.vievAirCast;

  // Wire up DOM Listeners (Capture phase delegation so nothing can block or swallow clicks)
  document.addEventListener('click', (e) => {
    // 1. YouTube Header Cast/Screen Share Button
    const castHeaderBtn = e.target.closest('#yt-header-cast-btn') || e.target.closest('.yt-cast-btn');
    if (castHeaderBtn) {
      e.preventDefault();
      e.stopPropagation();
      openCastModal();
      return;
    }

    // 2. Music Player AirPlay button
    const musicAirplayBtn = e.target.closest('#music-airplay-btn');
    if (musicAirplayBtn) {
      e.preventDefault();
      e.stopPropagation();
      openCastModal();
      return;
    }

    // 3. Modal Close Button
    const closeCastBtn = e.target.closest('#cinema-cast-close-btn');
    if (closeCastBtn) {
      e.preventDefault();
      e.stopPropagation();
      closeCastModal();
      return;
    }

    // 4. Modal Start Screen Share Button
    const startCastBtn = e.target.closest('#cinema-start-cast-btn');
    if (startCastBtn) {
      e.preventDefault();
      e.stopPropagation();
      startCasting();
      return;
    }

    // 5. Modal Cancel Button
    const cancelCastBtn = e.target.closest('#cinema-cancel-cast-btn');
    if (cancelCastBtn) {
      e.preventDefault();
      e.stopPropagation();
      stopCasting(true);
      return;
    }

    // 6. Test Mode Button
    const testModeBtn = e.target.closest('#cinema-cast-test-mode-btn');
    if (testModeBtn) {
      e.preventDefault();
      e.stopPropagation();
      window.vievAirCast.simulateTestReceiver();
      return;
    }

    // 7. Floating Caster HUD Stop Button (Stop Sharing)
    const hudStopBtn = e.target.closest('#viev-hud-stop-btn');
    if (hudStopBtn) {
      e.preventDefault();
      e.stopPropagation();
      stopCasting(true);
      return;
    }

    // 8. Incoming Invitation Accept & Decline
    const acceptBtn = e.target.closest('#viev-invite-accept-btn');
    if (acceptBtn) {
      e.preventDefault();
      e.stopPropagation();
      acceptIncomingCast();
      return;
    }

    const declineBtn = e.target.closest('#viev-invite-decline-btn');
    if (declineBtn) {
      e.preventDefault();
      e.stopPropagation();
      declineIncomingCast();
      return;
    }

    // 9. Fullscreen Receiver Theater Exit / Disconnect
    const fsExitBtn = e.target.closest('#viev-fullscreen-exit-btn');
    if (fsExitBtn) {
      e.preventDefault();
      e.stopPropagation();
      closeFullscreenReceiverTheater('Exited fullscreen view');
      return;
    }

    const fsDisconnectBtn = e.target.closest('#viev-fullscreen-disconnect-btn') || e.target.closest('.disconnect-btn');
    if (fsDisconnectBtn) {
      e.preventDefault();
      e.stopPropagation();
      emitCastEvent('end', {});
      closeFullscreenReceiverTheater('Disconnected live screen share');
      return;
    }

    // 10. Reaction Emoji Buttons
    const emojiBtn = e.target.closest('.viev-reaction-emoji-btn');
    if (emojiBtn) {
      e.preventDefault();
      e.stopPropagation();
      const emoji = emojiBtn.textContent.trim();
      window.vievAirCast.sendReaction(emoji);
      return;
    }

    // 11. Modal Backdrop Click -> Close
    const modal = document.getElementById('cinema-cast-modal');
    if (modal && e.target === modal) {
      closeCastModal();
    }
  }, true); // useCapture = true: catches clicks first before any other handler

  // Mobile Touch Support
  document.addEventListener('touchend', (e) => {
    const castHeaderBtn = e.target.closest('#yt-header-cast-btn') || e.target.closest('.yt-cast-btn');
    if (castHeaderBtn) {
      e.preventDefault();
      openCastModal();
    }
  }, { passive: false, capture: true });

})();
