/* =========================================================
   VIEVS EXXCLUSIVE - NATIVE 1080P CURVED OLED CINEMA ENGINE
   Direct Native 1080p Video ("Chhod Diya" - video/exxclusive.mp4)
   Dolby Cinema 3D DSP Audio Engine (Sub-Bass Resonator + Vocal Clarity + Binaural Haas)
   Real-Time Dynamic & Audio-Reactive Multi-Zone Ambilight Pulsing
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
  const ambilightWrap = document.getElementById('oled-ambilight-wrap');
  const floorReflectionCanvas = document.getElementById('oled-floor-reflection-canvas');
  const floorReflectionCtx = floorReflectionCanvas ? floorReflectionCanvas.getContext('2d', { willReadFrequently: true }) : null;
  const cinemaSeatsRow = document.getElementById('oled-cinema-seats-row');

  // Web Audio Context & Dolby Cinema 3D DSP Audio Engine
  let audioCtx = null;
  let mediaSource = null;
  let bassFilter = null;
  let vocalFilter = null;
  let airFilter = null;
  let compressor = null;
  let analyserNode = null;
  let audioFreqData = null;
  let smoothedBass = 0;
  let smoothedMid = 0;

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

  // Initialize Dolby Cinema 3D Acoustic DSP Chain
  function initDolbyAudioDSP() {
    if (!video) return;
    try {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtxClass) return;

      if (!audioCtx) {
        audioCtx = new AudioCtxClass();
      }

      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      if (!mediaSource) {
        mediaSource = audioCtx.createMediaElementSource(video);

        // 1. Sub-Bass Theater Resonator (Low-Shelf at 60Hz, +5.5dB for movie-theater acoustic weight)
        bassFilter = audioCtx.createBiquadFilter();
        bassFilter.type = 'lowshelf';
        bassFilter.frequency.value = 60;
        bassFilter.gain.value = 5.5;

        // 2. Vocal Brilliance / Dialogue Clarity (Peaking at 3200Hz, +3.6dB, Q: 1.1)
        vocalFilter = audioCtx.createBiquadFilter();
        vocalFilter.type = 'peaking';
        vocalFilter.frequency.value = 3200;
        vocalFilter.gain.value = 3.6;
        vocalFilter.Q.value = 1.1;

        // 3. Acoustic Sparkle & Spatial Air (High-Shelf at 10500Hz, +2.4dB)
        airFilter = audioCtx.createBiquadFilter();
        airFilter.type = 'highshelf';
        airFilter.frequency.value = 10500;
        airFilter.gain.value = 2.4;

        // 4. Studio Dynamics Limiter / Dolby Volume Leveler
        compressor = audioCtx.createDynamicsCompressor();
        compressor.threshold.value = -18;
        compressor.knee.value = 20;
        compressor.ratio.value = 4;
        compressor.attack.value = 0.005;
        compressor.release.value = 0.22;

        // 5. AnalyserNode for Real-Time Audio-Reactive Multi-Zone Ambilight
        analyserNode = audioCtx.createAnalyser();
        analyserNode.fftSize = 128;
        analyserNode.smoothingTimeConstant = 0.82;
        audioFreqData = new Uint8Array(analyserNode.frequencyBinCount);

        // 6. Binaural Theater Soundstage Spatial Widener (Haas Effect Matrix)
        const splitter = audioCtx.createChannelSplitter(2);
        const merger = audioCtx.createChannelMerger(2);

        const directGainL = audioCtx.createGain();
        const directGainR = audioCtx.createGain();
        directGainL.gain.value = 0.88;
        directGainR.gain.value = 0.88;

        const delayLtoR = audioCtx.createDelay(0.05);
        const delayRtoL = audioCtx.createDelay(0.05);
        delayLtoR.delayTime.value = 0.016; // 16ms Haas delay
        delayRtoL.delayTime.value = 0.016;

        const crossGainLtoR = audioCtx.createGain();
        const crossGainRtoL = audioCtx.createGain();
        crossGainLtoR.gain.value = 0.20;
        crossGainRtoL.gain.value = 0.20;

        // Routing Chain: Source -> Bass -> Vocal -> Air -> Compressor -> Analyser -> Splitter
        mediaSource.connect(bassFilter);
        bassFilter.connect(vocalFilter);
        vocalFilter.connect(airFilter);
        airFilter.connect(compressor);
        compressor.connect(analyserNode);
        analyserNode.connect(splitter);

        splitter.connect(directGainL, 0);
        splitter.connect(delayLtoR, 0);
        delayLtoR.connect(crossGainLtoR);

        splitter.connect(directGainR, 1);
        splitter.connect(delayRtoL, 1);
        delayRtoL.connect(crossGainRtoL);

        directGainL.connect(merger, 0, 0);
        crossGainRtoL.connect(merger, 0, 0);

        directGainR.connect(merger, 0, 1);
        crossGainLtoR.connect(merger, 0, 1);

        merger.connect(audioCtx.destination);
      }
    } catch (e) {
      console.warn('Dolby Audio DSP init notice:', e);
    }
  }

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

  // Real-Time Dynamic & Audio-Reactive Multi-Zone Ambilight Loop
  function updateAmbilight() {
    if (!video || video.paused || video.ended || !ambilightCtx) {
      stopAmbilight();
      return;
    }

    const now = performance.now();

    // 1. Audio Frequency Analysis (runs at smooth 60fps for breathing/reactive pulsing)
    if (analyserNode && audioFreqData) {
      analyserNode.getByteFrequencyData(audioFreqData);

      // Sub-bass / kick frequency bins (~20Hz - 140Hz)
      let bassSum = 0;
      for (let i = 0; i < 4; i++) bassSum += audioFreqData[i] || 0;
      const targetBass = bassSum / (4 * 255); // 0.0 to 1.0

      // Mid-vocal frequency bins (~200Hz - 2500Hz)
      let midSum = 0;
      for (let i = 4; i < 20; i++) midSum += audioFreqData[i] || 0;
      const targetMid = midSum / (16 * 255);

      // Smooth attack & decay filter
      smoothedBass += (targetBass - smoothedBass) * 0.18;
      smoothedMid += (targetMid - smoothedMid) * 0.15;

      // Modulate Ambilight Halo Geometry & Luminance
      const bassScale = 1.0 + (smoothedBass * 0.11);
      const blurPx = Math.round(62 + smoothedBass * 20);
      const satPct = Math.round(210 + smoothedBass * 42);
      const brightVal = (1.22 + (smoothedBass * 0.40) + (smoothedMid * 0.16)).toFixed(2);

      if (ambilightCanvas) {
        ambilightCanvas.style.transform = `scale(${bassScale.toFixed(3)}) translateZ(0)`;
        ambilightCanvas.style.filter = `blur(${blurPx}px) saturate(${satPct}%) brightness(${brightVal})`;
      }

      if (ambilightWrap) {
        ambilightWrap.style.transform = `scale(${(1.0 + smoothedBass * 0.035).toFixed(3)})`;
      }

      // Modulate Cinema Seats Rim Highlight dynamically with audio swell
      if (cinemaSeatsRow) {
        const rimOpacity = (0.24 + smoothedBass * 0.42 + smoothedMid * 0.16).toFixed(2);
        cinemaSeatsRow.style.setProperty('--seat-rim-opacity', rimOpacity);
      }
    }

    // 2. Video color & stage floor reflection sampling (~24fps)
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

        // Mirror video onto the glossy auditorium stage floor
        if (floorReflectionCtx && floorReflectionCanvas) {
          try {
            floorReflectionCtx.drawImage(video, 0, 0, floorReflectionCanvas.width, floorReflectionCanvas.height);
          } catch (err) {}
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
      ambilightCanvas.style.transform = '';
      ambilightCanvas.style.filter = '';
    }
    if (floorReflectionCtx && floorReflectionCanvas) {
      floorReflectionCtx.clearRect(0, 0, floorReflectionCanvas.width, floorReflectionCanvas.height);
    }
    if (cinemaSeatsRow) {
      cinemaSeatsRow.style.setProperty('--seat-rim-opacity', '0.24');
    }
    if (ambilightWrap) {
      ambilightWrap.style.transform = '';
    }
    if (ambilightDiffuser) {
      ambilightDiffuser.classList.remove('is-dimmed');
    }
    smoothedBass = 0;
    smoothedMid = 0;
  }

  if (video) {
    video.addEventListener('play', startAmbilight);
    video.addEventListener('pause', stopAmbilight);
    video.addEventListener('ended', () => {
      stopAmbilight();
      if (placeholderOverlay) placeholderOverlay.classList.remove('is-hidden');
    });
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

    // Initialize Dolby Cinema 3D DSP on first user interaction
    initDolbyAudioDSP();
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

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
      initDolbyAudioDSP();
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
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

    // If mobile device in landscape, or supports orientation locking on interaction
    if (screen.orientation && screen.orientation.lock && window.innerWidth < 768) {
      screen.orientation.lock('landscape').catch(() => {});
    }
  }

  function exitCinema(callback) {
    if (isClosing) return;
    isClosing = true;

    // Release orientation lock and exit fullscreen if active
    if (screen.orientation && screen.orientation.unlock) {
      try { screen.orientation.unlock(); } catch (e) {}
    }
    if (document.fullscreenElement) {
      const exitFS = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
      if (exitFS) {
        try { exitFS.call(document); } catch (e) {}
      }
    }

    stopAmbilight();
    document.documentElement.classList.add('is-exxclusive-closing');
    if (subpageContainer) subpageContainer.classList.remove('is-visible');

    setTimeout(() => {
      window.vievExxclusive.pauseVideo();
      if (placeholderOverlay) placeholderOverlay.classList.remove('is-hidden');
      if (video) video.currentTime = 0;
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

  // Rotate to Landscape Pill Button (Mobile Portrait Mode)
  const rotateHintBtn = document.getElementById('oled-rotate-hint');
  if (rotateHintBtn) {
    rotateHintBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (typeof triggerHaptic === 'function') triggerHaptic('medium');
      try {
        if (!document.fullscreenElement) {
          const docEl = document.documentElement;
          const reqFS = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
          if (reqFS) {
            await reqFS.call(docEl);
          }
        }
        if (screen.orientation && screen.orientation.lock) {
          await screen.orientation.lock('landscape');
        }
      } catch (err) {
        console.log('Landscape switch attempt:', err);
      }
    });
  }

  window.addEventListener('resize', () => {
    initCurvedDuration();
    updateCurvedDuration();
  });

  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      initCurvedDuration();
      updateCurvedDuration();
    }, 180);
  });

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
