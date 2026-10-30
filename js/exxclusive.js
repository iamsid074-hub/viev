/* =========================================================
   VIEVS EXXCLUSIVE - NATIVE 1080P CURVED OLED CINEMA ENGINE
   Direct Native 1080p Video ("Jab Saiyaan" - video/exxclusive.mp4)
   Real-Time Dynamic Ambilight Engine & Acoustic Theater Architecture
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('exxclusive-video');
  const cinemaExitBtn = document.getElementById('oled-cinema-exit-btn');
  const placeholderOverlay = document.getElementById('oled-placeholder-overlay');
  const curvedFrameWrap = document.getElementById('oled-curved-frame-wrap');
  const subpageContainer = document.getElementById('subpage-exxclusive');
  const ambilightCanvas = document.getElementById('oled-ambilight-canvas');
  const ambilightDiffuser = document.getElementById('oled-ambilight-diffuser');

  let ambilightCtx = ambilightCanvas ? ambilightCanvas.getContext('2d', { willReadFrequently: true }) : null;
  let ambilightAnimId = null;
  let lastDrawTime = 0;

  // Real-Time Dynamic Ambilight Rendering Loop
  function updateAmbilight() {
    if (!video || video.paused || video.ended || !ambilightCtx) {
      stopAmbilight();
      return;
    }

    const now = performance.now();
    // Efficiently sample at ~24fps (every 40ms)
    if (now - lastDrawTime > 40) {
      lastDrawTime = now;
      if (video.readyState >= 2) {
        try {
          ambilightCtx.drawImage(video, 0, 0, ambilightCanvas.width, ambilightCanvas.height);
          if (!ambilightCanvas.classList.contains('is-active')) {
            ambilightCanvas.classList.add('is-active');
          }
          if (ambilightDiffuser && !ambilightDiffuser.classList.contains('is-dimmed')) {
            ambilightDiffuser.classList.add('is-dimmed');
          }
        } catch (err) {
          // Keep running even if single frame sample encounters temporary lock
        }
      }
    }

    ambilightAnimId = requestAnimationFrame(updateAmbilight);
  }

  function startAmbilight() {
    if (ambilightAnimId) cancelAnimationFrame(ambilightAnimId);
    ambilightAnimId = requestAnimationFrame(updateAmbilight);
  }

  function stopAmbilight() {
    if (ambilightAnimId) {
      cancelAnimationFrame(ambilightAnimId);
      ambilightAnimId = null;
    }
    if (ambilightCanvas) {
      ambilightCanvas.classList.remove('is-active');
    }
    if (ambilightDiffuser) {
      ambilightDiffuser.classList.remove('is-dimmed');
    }
  }

  if (video) {
    video.addEventListener('play', startAmbilight);
    video.addEventListener('pause', stopAmbilight);
    video.addEventListener('ended', stopAmbilight);
  }

  // Start or resume video playback
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

    if (video) {
      video.play().then(() => {
        startAmbilight();
      }).catch(() => {});
    }
  }

  // Toggle playback on screen tap
  function togglePlayback() {
    if (typeof triggerHaptic === 'function') triggerHaptic('light');
    if (!video) return;

    if (placeholderOverlay && !placeholderOverlay.classList.contains('is-hidden')) {
      startPlayback();
      return;
    }

    if (video.paused) {
      if (typeof pauseTrack === 'function') pauseTrack();
      video.play().then(() => {
        startAmbilight();
      }).catch(() => {});
    } else {
      video.pause();
      stopAmbilight();
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
    curvedFrameWrap.addEventListener('click', (e) => {
      if (e.target.closest('#oled-cinema-exit-btn')) return;
      togglePlayback();
    });
  }

  // Minimal Top-Right Exit Button
  if (cinemaExitBtn) {
    cinemaExitBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof triggerHaptic === 'function') triggerHaptic('light');
      stopAmbilight();
      const settingsBackBtn = document.getElementById('settings-back-btn');
      if (settingsBackBtn) {
        settingsBackBtn.click();
      } else {
        window.vievExxclusive.pauseVideo();
        if (subpageContainer) subpageContainer.style.display = 'none';
      }
    });
  }

  // Keyboard shortcut (Escape exits cinema)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const settingsBackBtn = document.getElementById('settings-back-btn');
      if (settingsBackBtn && subpageContainer && subpageContainer.style.display !== 'none') {
        stopAmbilight();
        settingsBackBtn.click();
      }
    }
  });

  // Global pause hook when navigating away
  window.vievExxclusive = {
    pauseVideo() {
      stopAmbilight();
      if (video && !video.paused) {
        video.pause();
      }
      if (typeof window.setFloatingNavVisible === 'function') {
        window.setFloatingNavVisible(true);
      }
      document.body.classList.remove('is-exxclusive-active');
      document.documentElement.classList.remove('is-exxclusive-active');
    }
  };
});
