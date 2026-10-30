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
  const ambilightWrap = document.getElementById('oled-ambilight-wrap');
  const ambilightCanvas = document.getElementById('oled-ambilight-canvas');
  const ambilightDiffuser = document.getElementById('oled-ambilight-diffuser');
  const floorCanvas = document.getElementById('theater-floor-canvas');
  const floorMirrorWrap = document.getElementById('stage-floor-mirror-wrap');

  let ambilightCtx = ambilightCanvas ? ambilightCanvas.getContext('2d', { willReadFrequently: true }) : null;
  let floorCtx = floorCanvas ? floorCanvas.getContext('2d') : null;
  let ambilightAnimId = null;
  let lastDrawTime = 0;

  // Real-Time 4-Zone Ambilight & Glossy Floor Reflection Loop
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
          const w = ambilightCanvas.width;
          const h = ambilightCanvas.height;

          // 1. Draw frame into central halo canvas
          ambilightCtx.drawImage(video, 0, 0, w, h);
          if (!ambilightCanvas.classList.contains('is-active')) {
            ambilightCanvas.classList.add('is-active');
          }
          if (ambilightWrap && !ambilightWrap.classList.contains('is-active')) {
            ambilightWrap.classList.add('is-active');
          }
          if (ambilightDiffuser && !ambilightDiffuser.classList.contains('is-dimmed')) {
            ambilightDiffuser.classList.add('is-dimmed');
          }

          // 2. Extract 4-Zone Edge Colors (Top, Bottom, Left, Right)
          const imgData = ambilightCtx.getImageData(0, 0, w, h);
          const data = imgData.data;

          // Top Edge Zone
          let tr = 0, tg = 0, tb = 0, tCount = 0;
          for (let y = 0; y < 4; y++) {
            for (let x = 6; x < w - 6; x += 2) {
              const idx = (y * w + x) * 4;
              tr += data[idx];
              tg += data[idx + 1];
              tb += data[idx + 2];
              tCount++;
            }
          }

          // Bottom Edge Zone
          let br = 0, bg = 0, bb = 0, bCount = 0;
          for (let y = h - 4; y < h; y++) {
            for (let x = 6; x < w - 6; x += 2) {
              const idx = (y * w + x) * 4;
              br += data[idx];
              bg += data[idx + 1];
              bb += data[idx + 2];
              bCount++;
            }
          }

          // Left Flank Zone
          let lr = 0, lg = 0, lb = 0, lCount = 0;
          for (let y = 4; y < h - 4; y += 2) {
            for (let x = 0; x < 6; x++) {
              const idx = (y * w + x) * 4;
              lr += data[idx];
              lg += data[idx + 1];
              lb += data[idx + 2];
              lCount++;
            }
          }

          // Right Flank Zone
          let rr = 0, rg = 0, rb = 0, rCount = 0;
          for (let y = 4; y < h - 4; y += 2) {
            for (let x = w - 6; x < w; x++) {
              const idx = (y * w + x) * 4;
              rr += data[idx];
              rg += data[idx + 1];
              rb += data[idx + 2];
              rCount++;
            }
          }

          if (ambilightWrap && tCount > 0) {
            ambilightWrap.style.setProperty('--amb-top', `rgba(${Math.round(tr / tCount)}, ${Math.round(tg / tCount)}, ${Math.round(tb / tCount)}, 0.85)`);
            ambilightWrap.style.setProperty('--amb-bottom', `rgba(${Math.round(br / bCount)}, ${Math.round(bg / bCount)}, ${Math.round(bb / bCount)}, 0.85)`);
            ambilightWrap.style.setProperty('--amb-left', `rgba(${Math.round(lr / lCount)}, ${Math.round(lg / lCount)}, ${Math.round(lb / lCount)}, 0.85)`);
            ambilightWrap.style.setProperty('--amb-right', `rgba(${Math.round(rr / rCount)}, ${Math.round(rg / rCount)}, ${Math.round(rb / rCount)}, 0.85)`);
          }

          // 3. Render Glossy Stage Floor Reflection
          if (floorCtx && video.videoWidth > 0) {
            const vW = video.videoWidth;
            const vH = video.videoHeight;
            const srcY = vH * 0.52;
            const srcH = vH * 0.48;
            floorCtx.drawImage(video, 0, srcY, vW, srcH, 0, 0, floorCanvas.width, floorCanvas.height);
            if (floorMirrorWrap && !floorMirrorWrap.classList.contains('is-active')) {
              floorMirrorWrap.classList.add('is-active');
            }
          }
        } catch (err) {
          // Keep running smoothly even on temporary video buffer locks
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
    if (ambilightWrap) {
      ambilightWrap.classList.remove('is-active');
    }
    if (floorMirrorWrap) {
      floorMirrorWrap.classList.remove('is-active');
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
