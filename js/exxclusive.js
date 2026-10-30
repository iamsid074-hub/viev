/* =========================================================
   VIEVS EXXCLUSIVE - PURE AUTO-LANDSCAPE CINEMA ENGINE
   Direct YouTube Video Integration ("Jab Saiyaan" - 0uR45roIGA4)
   Massive Screen Tap-to-Play, Pure Black Cinema, Zero Clutter
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const YOUTUBE_VIDEO_ID = '0uR45roIGA4';
  const ytIframe = document.getElementById('exxclusive-yt-iframe');
  const localVideo = document.getElementById('exxclusive-video');
  const cinemaCloseBtn = document.getElementById('oled-cinema-close-trigger');
  const placeholderOverlay = document.getElementById('oled-placeholder-overlay');
  const curvedFrameWrap = document.getElementById('oled-curved-frame-wrap');
  const subpageContainer = document.getElementById('subpage-exxclusive');

  let isYtLoaded = false;
  let isYtPlaying = false;

  // PostMessage sender for YouTube iframe
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

  // Start or resume YouTube playback
  function startPlayback() {
    if (placeholderOverlay) placeholderOverlay.classList.add('is-hidden');

    // Pause any background audio in VIEVS
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
  }

  // Toggle playback on screen tap
  function togglePlayback() {
    if (typeof triggerHaptic === 'function') triggerHaptic('light');
    if (!isYtLoaded) {
      startPlayback();
      return;
    }

    if (isYtPlaying) {
      sendYtCommand('pauseVideo');
      isYtPlaying = false;
    } else {
      sendYtCommand('playVideo');
      isYtPlaying = true;
      if (typeof pauseTrack === 'function') pauseTrack();
    }
  }

  // Tap on poster starts video
  if (placeholderOverlay) {
    placeholderOverlay.addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof triggerHaptic === 'function') triggerHaptic('medium');
      startPlayback();
    });
  }

  // Tap on curved display frame toggles play/pause
  if (curvedFrameWrap) {
    curvedFrameWrap.addEventListener('click', () => {
      togglePlayback();
    });
  }

  // YouTube postMessage event listener
  window.addEventListener('message', (event) => {
    if (!ytIframe || !ytIframe.contentWindow) return;
    if (event.source !== ytIframe.contentWindow) return;
    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      if (!data) return;

      if ((data.event === 'infoDelivery' || data.event === 'initialDelivery') && data.info) {
        if (typeof data.info.playerState === 'number') {
          const state = data.info.playerState;
          if (state === 1) { // PLAYING
            isYtPlaying = true;
            if (placeholderOverlay) placeholderOverlay.classList.add('is-hidden');
          } else if (state === 2 || state === 0) { // PAUSED / ENDED
            isYtPlaying = false;
          }
        }
      } else if (data.event === 'onStateChange' && typeof data.info === 'number') {
        const state = data.info;
        if (state === 1) {
          isYtPlaying = true;
          if (placeholderOverlay) placeholderOverlay.classList.add('is-hidden');
        } else if (state === 2 || state === 0) {
          isYtPlaying = false;
        }
      }
    } catch (_) {}
  });

  // Dedicated Floating Cinema Back Button
  if (cinemaCloseBtn) {
    cinemaCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
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

  // Global pause hook when navigating away
  window.vievExxclusive = {
    pauseVideo() {
      sendYtCommand('pauseVideo');
      isYtPlaying = false;

      if (localVideo && !localVideo.paused) {
        localVideo.pause();
      }
      if (typeof window.setFloatingNavVisible === 'function') {
        window.setFloatingNavVisible(true);
      }
      document.body.classList.remove('is-exxclusive-active');
      document.documentElement.classList.remove('is-exxclusive-active');
    }
  };
});
