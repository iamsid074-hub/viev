/* =========================================================
   VIEVS EXXCLUSIVE - CURVED OLED CINEMA ENGINE
   Direct YouTube Video Integration ("Jab Saiyaan" - 0uR45roIGA4)
   Controls for Massive Curved OLED Screen, Custom Timeline,
   Audio-Muting Handshake, Landscape Mode & Panoramic Theater
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const YOUTUBE_VIDEO_ID = '0uR45roIGA4';
  const ytIframe = document.getElementById('exxclusive-yt-iframe');
  const localVideo = document.getElementById('exxclusive-video');
  const playToggleBtn = document.getElementById('oled-play-toggle');
  const muteToggleBtn = document.getElementById('oled-mute-toggle');
  const landscapeToggleBtn = document.getElementById('oled-landscape-toggle');
  const theaterExpandBtn = document.getElementById('oled-theater-expand');
  const cinemaCloseBtn = document.getElementById('oled-cinema-close-trigger');
  const scrubber = document.getElementById('oled-scrubber');
  const timeCurrent = document.getElementById('oled-time-current');
  const timeDuration = document.getElementById('oled-time-duration');
  const placeholderOverlay = document.getElementById('oled-placeholder-overlay');
  const viewport = document.getElementById('oled-theater-viewport');
  const subpageContainer = document.getElementById('subpage-exxclusive');
  const playIcon = document.querySelector('.oled-icon-play');
  const pauseIcon = document.querySelector('.oled-icon-pause');
  const volIcon = document.querySelector('.oled-icon-volume');
  const mutedIcon = document.querySelector('.oled-icon-muted');

  let isYtLoaded = false;
  let isYtPlaying = false;
  let isYtMuted = false;
  let ytCurrentTime = 0;
  let ytDuration = 227; // "Jab Saiyaan" default duration (~3:47)

  function formatTime(sec) {
    if (isNaN(sec) || !isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function updatePlayState(isPlaying) {
    if (playIcon) playIcon.style.display = isPlaying ? 'none' : 'block';
    if (pauseIcon) pauseIcon.style.display = isPlaying ? 'block' : 'none';
  }

  function updateMuteState(isMuted) {
    if (volIcon) volIcon.style.display = isMuted ? 'none' : 'block';
    if (mutedIcon) mutedIcon.style.display = isMuted ? 'block' : 'none';
  }

  // Send PostMessage commands to YouTube IFrame API
  function sendYtCommand(func, args) {
    if (!ytIframe || !ytIframe.contentWindow) return;
    try {
      const msg = {
        event: 'command',
        func: func,
        args: Array.isArray(args) ? args : (args !== undefined && args !== '' ? [args] : [])
      };
      ytIframe.contentWindow.postMessage(JSON.stringify(msg), '*');
    } catch (_) {}
  }

  // Start / Play YouTube video directly
  function startYouTubePlayback() {
    if (placeholderOverlay) placeholderOverlay.classList.add('is-hidden');

    // Pause any background music playing in VIEVS
    if (typeof window.userExplicitPause !== 'undefined') {
      window.userExplicitPause = true;
    }
    if (typeof pauseTrack === 'function') {
      pauseTrack();
    } else {
      const audio = document.getElementById('audio-player') || window.audio;
      if (audio && !audio.paused) audio.pause();
    }

    if (!isYtLoaded && ytIframe) {
      isYtLoaded = true;
      const originParam = (window.location.origin && window.location.origin !== 'null' && window.location.protocol.startsWith('http'))
        ? `&origin=${encodeURIComponent(window.location.origin)}`
        : '';
      ytIframe.src = `https://www.youtube-nocookie.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&enablejsapi=1${originParam}&controls=0&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&fs=0&disablekb=1`;
      ytIframe.onload = () => {
        try {
          ytIframe.contentWindow.postMessage('{"event":"listening"}', '*');
          ytIframe.contentWindow.postMessage('{"event":"command","func":"listening","args":""}', '*');
        } catch (_) {}
      };
    } else {
      sendYtCommand('playVideo');
    }

    isYtPlaying = true;
    updatePlayState(true);
  }

  // Toggle Play / Pause
  function togglePlayback() {
    if (typeof triggerHaptic === 'function') triggerHaptic('light');
    if (!isYtLoaded) {
      startYouTubePlayback();
      return;
    }

    if (isYtPlaying) {
      sendYtCommand('pauseVideo');
      isYtPlaying = false;
      updatePlayState(false);
    } else {
      sendYtCommand('playVideo');
      isYtPlaying = true;
      updatePlayState(true);
      if (typeof pauseTrack === 'function') pauseTrack();
    }
  }

  // Toggle Mute / Unmute
  function toggleMute() {
    if (typeof triggerHaptic === 'function') triggerHaptic('light');
    isYtMuted = !isYtMuted;
    sendYtCommand(isYtMuted ? 'mute' : 'unMute');
    updateMuteState(isYtMuted);
  }

  // Click on placeholder overlay starts video
  if (placeholderOverlay) {
    placeholderOverlay.addEventListener('click', () => {
      if (typeof triggerHaptic === 'function') triggerHaptic('medium');
      startYouTubePlayback();
    });
  }

  // Play / Pause button
  if (playToggleBtn) {
    playToggleBtn.addEventListener('click', togglePlayback);
  }

  // Mute / Unmute button
  if (muteToggleBtn) {
    muteToggleBtn.addEventListener('click', toggleMute);
  }

  // Scrubber Seeking
  if (scrubber) {
    scrubber.addEventListener('input', () => {
      if (!ytDuration) return;
      const targetTime = (scrubber.value / 100) * ytDuration;
      sendYtCommand('seekTo', [targetTime, true]);
      if (timeCurrent) timeCurrent.textContent = formatTime(targetTime);
    });
  }

  // Listen for YouTube Iframe API playback updates
  window.addEventListener('message', (event) => {
    if (!ytIframe || !ytIframe.contentWindow) return;
    if (event.source !== ytIframe.contentWindow) return;
    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      if (!data) return;

      if ((data.event === 'infoDelivery' || data.event === 'initialDelivery') && data.info) {
        if (typeof data.info.duration === 'number' && data.info.duration > 0) {
          ytDuration = Math.round(data.info.duration);
          if (timeDuration) timeDuration.textContent = formatTime(ytDuration);
        }
        if (typeof data.info.currentTime === 'number') {
          ytCurrentTime = data.info.currentTime;
          if (scrubber && !scrubber.matches(':active') && ytDuration > 0) {
            scrubber.value = (ytCurrentTime / ytDuration) * 100;
          }
          if (timeCurrent) timeCurrent.textContent = formatTime(ytCurrentTime);
        }
        if (typeof data.info.playerState === 'number') {
          const state = data.info.playerState;
          if (state === 1) { // PLAYING
            isYtPlaying = true;
            updatePlayState(true);
            if (placeholderOverlay) placeholderOverlay.classList.add('is-hidden');
          } else if (state === 2 || state === 0) { // PAUSED or ENDED
            isYtPlaying = false;
            updatePlayState(false);
          }
        }
      } else if (data.event === 'onStateChange' && typeof data.info === 'number') {
        const state = data.info;
        if (state === 1) {
          isYtPlaying = true;
          updatePlayState(true);
          if (placeholderOverlay) placeholderOverlay.classList.add('is-hidden');
        } else if (state === 2 || state === 0) {
          isYtPlaying = false;
          updatePlayState(false);
        }
      }
    } catch (_) {}
  });

  // Dedicated Cinema Back Button
  if (cinemaCloseBtn) {
    cinemaCloseBtn.addEventListener('click', () => {
      if (typeof triggerHaptic === 'function') triggerHaptic('light');
      const settingsBackBtn = document.getElementById('settings-back-btn');
      if (settingsBackBtn) {
        settingsBackBtn.click();
      } else {
        window.vievExxclusive.pauseVideo();
        if (subpageContainer) subpageContainer.style.display = 'none';
      }
    });
  }

  // Landscape Cinema Orientation Mode Toggle
  if (landscapeToggleBtn && subpageContainer) {
    landscapeToggleBtn.addEventListener('click', () => {
      if (typeof triggerHaptic === 'function') triggerHaptic('medium');
      const isForced = subpageContainer.classList.toggle('is-force-landscape');
      
      // Attempt hardware screen orientation lock if supported
      if (screen.orientation && typeof screen.orientation.lock === 'function') {
        if (isForced) {
          screen.orientation.lock('landscape').catch(() => {});
        } else {
          try { screen.orientation.unlock(); } catch (e) {}
        }
      }

      if (typeof window.setFloatingNavVisible === 'function') {
        window.setFloatingNavVisible(!isForced);
      }
    });
  }

  // Full Panoramic Curved Theater Mode Toggle
  if (theaterExpandBtn && viewport) {
    theaterExpandBtn.addEventListener('click', () => {
      if (typeof triggerHaptic === 'function') triggerHaptic('medium');
      const isPanoramic = viewport.classList.toggle('is-panoramic');
      if (typeof window.setFloatingNavVisible === 'function') {
        window.setFloatingNavVisible(!isPanoramic);
      }
    });
  }

  // Global pause hook when navigating away
  window.vievExxclusive = {
    pauseVideo() {
      sendYtCommand('pauseVideo');
      isYtPlaying = false;
      updatePlayState(false);

      if (localVideo && !localVideo.paused) {
        localVideo.pause();
      }
      if (viewport && viewport.classList.contains('is-panoramic')) {
        viewport.classList.remove('is-panoramic');
      }
      if (subpageContainer && subpageContainer.classList.contains('is-force-landscape')) {
        subpageContainer.classList.remove('is-force-landscape');
        try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch (e) {}
      }
      if (typeof window.setFloatingNavVisible === 'function') {
        window.setFloatingNavVisible(true);
      }
    }
  };
});
