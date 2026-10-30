/* =========================================================
   VIEVS EXXCLUSIVE - NATIVE 1080P CURVED OLED CINEMA ENGINE
   Direct Native 1080p Video ("Jab Saiyaan" - video/exxclusive.mp4)
   Real-Time Dynamic Ambilight Engine & Acoustic Theater Architecture
   Cinematic Fade In / Fade Out Transitions & Curved Duration Bar
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('exxclusive-video');
  const cinemaExitBtn = document.getElementById('oled-cinema-exit-btn');
  const placeholderOverlay = document.getElementById('oled-placeholder-overlay');
  const curvedFrameWrap = document.getElementById('oled-curved-frame-wrap');
  const subpageContainer = document.getElementById('subpage-exxclusive');
  const ambilightCanvas = document.getElementById('oled-ambilight-canvas');
  const ambilightDiffuser = document.getElementById('oled-ambilight-diffuser');

  // Curved Duration Bar Elements
  const curvedDurationFill = document.getElementById('oled-curved-duration-fill');
  const curvedDurationHead = document.getElementById('oled-curved-duration-head');
  const curvedDurationHit = document.getElementById('oled-curved-duration-hit');
  const timeCurrEl = document.getElementById('oled-time-curr');
  const timeTotalEl = document.getElementById('oled-time-total');

  let ambilightCtx = ambilightCanvas ? ambilightCanvas.getContext('2d', { willReadFrequently: true }) : null;
  let ambilightAnimId = null;
  let lastDrawTime = 0;
  let totalPathLength = 0;
  let isClosing = false;
  let isDraggingScrubber = false;

  // Initialize SVG Curved Duration Geometry
  function initCurvedDuration() {
    if (curvedDurationFill) {
      try {
        const len = curvedDurationFill.getTotalLength();
        if (len && len > 10) {
          totalPathLength = len;
          curvedDurationFill.style.strokeDasharray = `${totalPathLength} ${totalPathLength}`;
          updateCurvedDuration();
        }
      } catch (e) {}
    }
  }

  function formatTime(sec) {
    if (!sec || isNaN(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  // Update Curved Progress Bar & Glowing Head Dot
  function updateCurvedDuration() {
    if (!video || isDraggingScrubber) return;
    const curr = video.currentTime || 0;
    const dur = video.duration || 0;
    const pct = dur > 0 ? Math.min(1, Math.max(0, curr / dur)) : 0;

    if (curvedDurationFill && totalPathLength > 0) {
      const offset = totalPathLength * (1 - pct);
      curvedDurationFill.style.strokeDashoffset = offset;

      if (curvedDurationHead) {
        try {
          const pt = curvedDurationFill.getPointAtLength(totalPathLength * pct);
          curvedDurationHead.setAttribute('cx', pt.x.toFixed(2));
          curvedDurationHead.setAttribute('cy', pt.y.toFixed(2));
        } catch (e) {}
      }
    }

    if (timeCurrEl) timeCurrEl.textContent = formatTime(curr);
    if (timeTotalEl && dur > 0) timeTotalEl.textContent = formatTime(dur);
  }

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
        } catch (err) {}
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
    video.addEventListener('timeupdate', updateCurvedDuration);
    video.addEventListener('loadedmetadata', () => {
      initCurvedDuration();
      updateCurvedDuration();
    });
    video.addEventListener('durationchange', () => {
      initCurvedDuration();
      updateCurvedDuration();
    });
  }

  // Interactive Scrubbing along the Curved Arc
  if (curvedDurationHit) {
    function seekFromEvent(e) {
      if (!video || !video.duration || !curvedDurationHit) return;
      const rect = curvedDurationHit.getBoundingClientRect();
      const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
      const clickX = clientX - rect.left;
      const pct = Math.max(0, Math.min(1, clickX / rect.width));
      video.currentTime = pct * video.duration;
      updateCurvedDuration();
    }

    curvedDurationHit.addEventListener('click', (e) => {
      e.stopPropagation();
      seekFromEvent(e);
      if (typeof triggerHaptic === 'function') triggerHaptic('light');
    });

    curvedDurationHit.addEventListener('touchstart', (e) => {
      e.stopPropagation();
      isDraggingScrubber = true;
      seekFromEvent(e);
      if (typeof triggerHaptic === 'function') triggerHaptic('light');
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (!isDraggingScrubber) return;
      seekFromEvent(e);
    }, { passive: true });

    window.addEventListener('touchend', () => {
      if (isDraggingScrubber) {
        isDraggingScrubber = false;
        updateCurvedDuration();
      }
    });
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
      if (e.target.closest('#oled-cinema-exit-btn') || e.target.closest('#oled-curved-duration-wrap')) return;
      togglePlayback();
    });
  }

  // Buttery Smooth Cinematic Fade Transitions
  function enterCinema() {
    isClosing = false;
    document.documentElement.classList.remove('is-exxclusive-closing');
    if (subpageContainer) {
      subpageContainer.style.display = 'flex';
      // Force layout calculation for smooth transition
      void subpageContainer.offsetHeight;
      subpageContainer.classList.add('is-visible');
    }
    setTimeout(initCurvedDuration, 80);
  }

  function exitCinema(callback) {
    if (isClosing) return;
    isClosing = true;

    stopAmbilight();
    document.documentElement.classList.add('is-exxclusive-closing');
    if (subpageContainer) subpageContainer.classList.remove('is-visible');

    setTimeout(() => {
      window.vievExxclusive.pauseVideo();
      if (subpageContainer) subpageContainer.style.display = 'none';
      document.documentElement.classList.remove('is-exxclusive-closing');
      document.documentElement.classList.remove('is-exxclusive-active');
      document.body.classList.remove('is-exxclusive-active');
      if (typeof window.setFloatingNavVisible === 'function') {
        window.setFloatingNavVisible(true);
      }
      isClosing = false;
      if (typeof callback === 'function') callback();
    }, 420);
  }

  // Minimal Top-Right Exit Button
  if (cinemaExitBtn) {
    cinemaExitBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof triggerHaptic === 'function') triggerHaptic('light');
      const settingsBackBtn = document.getElementById('settings-back-btn');
      if (settingsBackBtn) {
        settingsBackBtn.click();
      } else {
        exitCinema();
      }
    });
  }

  // Keyboard shortcut (Escape exits cinema)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const settingsBackBtn = document.getElementById('settings-back-btn');
      if (settingsBackBtn && subpageContainer && subpageContainer.style.display !== 'none') {
        settingsBackBtn.click();
      }
    }
  });

  // Global hooks
  window.vievExxclusive = {
    enterCinema,
    exitCinema,
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

  // Initial geometry check
  initCurvedDuration();
});
