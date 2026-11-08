/* =========================================================
   VIEV OS 3.0: EXXCLUSIVE CINEMA & SMART LIBRARY
   1. Netflix-Style Signature Opening Animation + Web Audio "Ta-Dum"
   2. Aura Smart Media Library (Portrait Mode, Fast & Fluid)
   3. Luxury Airbnb Curved Charcoal Home Cinema Lounge (Landscape Mode)
   4. Real-Time Adaptive Ambilight, Floor Mirror Reflection & Liquid Glass UI
   ========================================================= */

(function () {
  'use strict';

  // --- CATALOG OF MEDIA (Zero-latency local HD & 4K assets) ---
  const EXXCLUSIVE_MEDIA = [
    {
      id: 'chhod-diya',
      title: 'Chhod Diya • Kanika Kapoor & Arijit Singh',
      sub: 'Baazaar • 4K Remastered Dolby Atmos',
      category: ['4k', 'romantic', 'atmospheric'],
      badge: '4K UHD',
      duration: '4:12',
      poster: 'https://img.youtube.com/vi/7DzWXIE4Pj0/maxresdefault.jpg',
      posterFallback: 'song/Chhod Diya.jpg',
      src: 'video/exxclusive.mp4',
      isFeatured: true
    },
    {
      id: 'kesariya',
      title: 'Kesariya • Arijit Singh',
      sub: 'Brahmāstra • 4K HDR TrueColor',
      category: ['4k', 'romantic', 'trending'],
      badge: '4K MASTER',
      duration: '4:28',
      poster: 'song/Kesariya.jpg',
      src: 'song/Kesariya.mp4'
    },
    {
      id: 'sawan-aaya-hai',
      title: 'Sawan Aaya Hai • Creature 3D',
      sub: 'Arijit Singh • Dolby Cinema 3D Binaural',
      category: ['dolby', 'romantic', 'atmospheric'],
      badge: 'DOLBY 3D',
      duration: '4:45',
      poster: 'song/Sawan Aaya Hai.jpg',
      src: 'song/Sawan Aaya Hai.mp4'
    },
    {
      id: 'sooiyan',
      title: 'Sooiyan • Guddu Rangeela',
      sub: 'Arijit Singh & Chinmayi • Acoustic Spatial',
      category: ['atmospheric', 'trending'],
      badge: '1080P',
      duration: '3:58',
      poster: 'song/Sooiyan.jpg',
      src: 'song/Sooiyan.mp4'
    },
    {
      id: 'yaad-hai-na',
      title: 'Yaad Hai Na • Raaz Reboot',
      sub: 'Arijit Singh • 4K Ultra Wide Soundscape',
      category: ['4k', 'atmospheric', 'romantic'],
      badge: '4K UHD',
      duration: '4:03',
      poster: 'song/Yaad Hai Na.jpg',
      src: 'song/Yaad Hai Na.mp4'
    },
    {
      id: 'ek-dil-ek-jaan',
      title: 'Ek Dil Ek Jaan • Padmaavat',
      sub: 'Deepika Padukone & Shahid Kapoor • Epic Cinema',
      category: ['4k', 'romantic', 'trending'],
      badge: '4K MASTER',
      duration: '5:10',
      poster: 'song/Screenshot 2026-10-24 224316.png',
      src: 'video/exxclusive.mp4'
    },
    {
      id: 've-haaniyaan',
      title: 'Ve Haaniyaan • Ravi Dubey & Sargun',
      sub: 'Danny & Avvy Sra • Pure Melody',
      category: ['trending', 'romantic'],
      badge: 'DOLBY 3D',
      duration: '4:05',
      poster: 'song/Screenshot 2026-10-24 224355.png',
      src: 'song/Sawan Aaya Hai.mp4'
    },
    {
      id: 'khairiyat',
      title: 'Khairiyat • Chhichhore',
      sub: 'Sushant Singh Rajput • Soulful Spatial Audio',
      category: ['atmospheric', 'romantic'],
      badge: '1080P',
      duration: '4:40',
      poster: 'song/Screenshot 2026-10-24 224416.png',
      src: 'song/Kesariya.mp4'
    }
  ];

  // State
  let activeFilter = 'all';
  let searchQuery = '';
  let currentMedia = EXXCLUSIVE_MEDIA[0];
  let isLoungeOpen = false;
  let hudInactivityTimer = null;
  let isDraggingScrubber = false;
  let audioEqMode = 0; // 0: Dolby 3D, 1: Spatial Air, 2: Deep Bass
  const EQ_MODES = ['DOLBY 3D', 'SPATIAL AIR', 'DEEP BASS'];
  let cinemaBootTimer = null;
  let audioFadeTimer = null;

  // DOM Elements
  let introEl = null;
  let libraryEl = null;
  let loungeEl = null;
  let videoEl = null;
  let ambilightCanvas = null;
  let ambilightCtx = null;
  let floorCanvas = null;
  let floorCtx = null;
  let hudEl = null;
  let centerPlayBtn = null;
  let stepBackBtn = null;
  let stepFwdBtn = null;
  let volumeSlider = null;
  let timelineTrack = null;
  let timelineFill = null;
  let timelineDot = null;
  let timeCountdown = null;
  let exitBtn = null;
  let searchInput = null;
  let searchClearBtn = null;
  let mediaGridEl = null;
  let filterChips = [];
  let quickCinemaBtn = null;
  let audioEqBtn = null;
  let audioEqLabel = null;

  // Web Audio & Dolby DSP
  let audioCtx = null;
  let mediaSource = null;
  let bassFilter = null;
  let vocalFilter = null;
  let airFilter = null;
  let compressor = null;
  let analyserNode = null;
  let freqByteData = null;
  let renderRafId = null;

  // --- 1. WEB AUDIO SYNTHESIZER: NETFLIX "TA-DUM" SIGNATURE SOUND ---
  function playNetflixSignatureSound() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      if (!audioCtx) audioCtx = new AudioContextClass();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const now = audioCtx.currentTime;

      // Master output limiter
      const masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.85, now);
      masterGain.connect(audioCtx.destination);

      // --- TA-DUM IMPACT 1: Sub Bass Deep Punch (60Hz -> 32Hz) ---
      const subOsc = audioCtx.createOscillator();
      const subGain = audioCtx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(75, now);
      subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.45);

      subGain.gain.setValueAtTime(0.9, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      subOsc.connect(subGain);
      subGain.connect(masterGain);
      subOsc.start(now);
      subOsc.stop(now + 0.7);

      // --- TA-DUM IMPACT 2: Resonant Cinema Drone (Ta-DUM accent at t + 0.22s) ---
      const droneTime = now + 0.22;
      const droneOsc = audioCtx.createOscillator();
      const droneGain = audioCtx.createGain();
      droneOsc.type = 'triangle';
      droneOsc.frequency.setValueAtTime(98, droneTime);
      droneOsc.frequency.exponentialRampToValueAtTime(48, droneTime + 1.2);

      droneGain.gain.setValueAtTime(0.001, droneTime);
      droneGain.gain.linearRampToValueAtTime(0.8, droneTime + 0.05);
      droneGain.gain.exponentialRampToValueAtTime(0.001, droneTime + 1.6);

      droneOsc.connect(droneGain);
      droneGain.connect(masterGain);
      droneOsc.start(droneTime);
      droneOsc.stop(droneTime + 1.7);

      // --- METALLIC SHIMMER CHORD: Rising Cinema Bloom (t + 0.26s) ---
      const shimmerNotes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C major spatial chord
      shimmerNotes.forEach((freq, idx) => {
        const shimOsc = audioCtx.createOscillator();
        const shimGain = audioCtx.createGain();
        const bandPass = audioCtx.createBiquadFilter();

        shimOsc.type = idx % 2 === 0 ? 'sawtooth' : 'sine';
        shimOsc.frequency.setValueAtTime(freq, droneTime + (idx * 0.02));

        bandPass.type = 'bandpass';
        bandPass.frequency.setValueAtTime(freq * 1.5, droneTime);
        bandPass.Q.setValueAtTime(3.0, droneTime);

        shimGain.gain.setValueAtTime(0.001, droneTime);
        shimGain.gain.linearRampToValueAtTime(0.12, droneTime + 0.15);
        shimGain.gain.exponentialRampToValueAtTime(0.0001, droneTime + 1.4);

        shimOsc.connect(bandPass);
        bandPass.connect(shimGain);
        shimGain.connect(masterGain);

        shimOsc.start(droneTime);
        shimOsc.stop(droneTime + 1.5);
      });
    } catch (e) {
      console.warn('[Exxclusive 3.0] Audio synthesis skipped or blocked by browser policy:', e);
    }
  }

  // Dismiss intro and reveal Smart Library
  function dismissIntro() {
    if (!introEl || introEl.classList.contains('is-dismissed')) return;
    introEl.classList.add('is-dismissed');
    setTimeout(() => {
      introEl.style.display = 'none';
    }, 700);
  }

  function triggerIntroAnimation() {
    if (!introEl) return;
    introEl.style.display = 'flex';
    introEl.classList.remove('is-dismissed');
    playNetflixSignatureSound();

    // Auto dismiss after signature intro animation completes (2.4s)
    setTimeout(() => {
      dismissIntro();
    }, 2400);
  }

  // --- 2. DOLBY CINEMA 3D DSP ACOUSTIC CHAIN ---
  function setupDolbyAudioDSP() {
    if (!videoEl) return;
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
        mediaSource = audioCtx.createMediaElementSource(videoEl);

        // 1. Sub-Bass Cinema Resonator (60Hz Low-Shelf)
        bassFilter = audioCtx.createBiquadFilter();
        bassFilter.type = 'lowshelf';
        bassFilter.frequency.value = 60;
        bassFilter.gain.value = 6.0;

        // 2. Dialogue & Vocal Clarity (3200Hz Peaking)
        vocalFilter = audioCtx.createBiquadFilter();
        vocalFilter.type = 'peaking';
        vocalFilter.frequency.value = 3200;
        vocalFilter.gain.value = 3.8;
        vocalFilter.Q.value = 1.1;

        // 3. Acoustic Air & Spatial Sparkle (10500Hz High-Shelf)
        airFilter = audioCtx.createBiquadFilter();
        airFilter.type = 'highshelf';
        airFilter.frequency.value = 10500;
        airFilter.gain.value = 2.5;

        // 4. Cinema Dynamic Limiter Compressor
        compressor = audioCtx.createDynamicsCompressor();
        compressor.threshold.value = -14;
        compressor.knee.value = 18;
        compressor.ratio.value = 4.2;
        compressor.attack.value = 0.004;
        compressor.release.value = 0.18;

        // 5. Spectrum Analyser for Beat-Reactive Ambilight
        analyserNode = audioCtx.createAnalyser();
        analyserNode.fftSize = 64;
        analyserNode.smoothingTimeConstant = 0.82;
        freqByteData = new Uint8Array(analyserNode.frequencyBinCount);

        // Connect chain: Video -> Bass -> Vocal -> Air -> Compressor -> Analyser -> Output
        mediaSource.connect(bassFilter);
        bassFilter.connect(vocalFilter);
        vocalFilter.connect(airFilter);
        airFilter.connect(compressor);
        compressor.connect(analyserNode);
        analyserNode.connect(audioCtx.destination);
      }
    } catch (e) {
      console.warn('[Exxclusive 3.0] Web Audio DSP attach error:', e);
    }
  }

  function applyEqMode(modeIndex) {
    audioEqMode = modeIndex % EQ_MODES.length;
    if (audioEqLabel) audioEqLabel.textContent = EQ_MODES[audioEqMode];

    if (!bassFilter || !vocalFilter || !airFilter) return;

    if (audioEqMode === 0) {
      // DOLBY 3D
      bassFilter.gain.value = 6.0;
      vocalFilter.gain.value = 3.8;
      airFilter.gain.value = 2.8;
    } else if (audioEqMode === 1) {
      // SPATIAL AIR
      bassFilter.gain.value = 2.0;
      vocalFilter.gain.value = 4.5;
      airFilter.gain.value = 5.2;
    } else if (audioEqMode === 2) {
      // DEEP BASS
      bassFilter.gain.value = 8.5;
      vocalFilter.gain.value = 1.5;
      airFilter.gain.value = 1.0;
    }
  }

  // --- 3. AURA SMART LIBRARY RENDERING ---
  function renderMediaGrid() {
    if (!mediaGridEl) return;
    const q = searchQuery.toLowerCase().trim();

    const filtered = EXXCLUSIVE_MEDIA.filter(item => {
      // Category match
      if (activeFilter !== 'all') {
        const matchesCategory = item.category.some(c => c.toLowerCase() === activeFilter.toLowerCase());
        if (!matchesCategory) return false;
      }
      // Search match
      if (q) {
        const text = (item.title + ' ' + item.sub + ' ' + item.badge).toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      mediaGridEl.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 48px 16px; text-align: center; color: rgba(255,255,255,0.4);">
          <div style="font-size: 32px; margin-bottom: 8px;">🎬</div>
          <div style="font-size: 15px; font-weight: 600; color: #fff;">No titles found</div>
          <div style="font-size: 12px; margin-top: 4px;">Try searching another song or genre.</div>
        </div>
      `;
      return;
    }

    mediaGridEl.innerHTML = filtered.map(item => `
      <div class="aura-media-card" data-media-id="${item.id}" role="button" tabindex="0">
        <div class="aura-card-thumb-wrap">
          <img src="${item.poster}" alt="${item.title}" class="aura-card-img" loading="lazy" onerror="this.src='${item.posterFallback || 'song/virat_plays_avatar.png'}'">
          <div class="aura-card-badge-top">${item.badge}</div>
          <div class="aura-card-duration-bottom">${item.duration}</div>
        </div>
        <div class="aura-card-meta">
          <h4 class="aura-card-title">${item.title}</h4>
          <span class="aura-card-sub">${item.sub}</span>
        </div>
      </div>
    `).join('');

    // Attach click handlers to cards
    mediaGridEl.querySelectorAll('.aura-media-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-media-id');
        const media = EXXCLUSIVE_MEDIA.find(m => m.id === id);
        if (media) {
          openCurvedCinemaLounge(media);
        }
      });
    });
  }

  // --- 4. LUXURY AIRBNB CURVED CHARCOAL HOME CINEMA LOUNGE ---
  function openCurvedCinemaLounge(media) {
    if (!loungeEl || !videoEl) return;
    currentMedia = media || currentMedia;

    // Clear any previous transition timers
    if (cinemaBootTimer) {
      clearTimeout(cinemaBootTimer);
      cinemaBootTimer = null;
    }
    if (audioFadeTimer) {
      clearInterval(audioFadeTimer);
      audioFadeTimer = null;
    }

    // Set video source
    if (videoEl.src !== media.src && !videoEl.src.endsWith(media.src)) {
      videoEl.src = media.src;
    }

    // Prepare cinema dark state for dramatic 1.4s fade-in sequence
    videoEl.currentTime = 0;
    videoEl.volume = 0;
    videoEl.style.opacity = '0';
    videoEl.style.transition = 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
    updatePlayPauseButton(false);

    // Show lounge environment with opening fade animation
    loungeEl.classList.remove('is-closing');
    loungeEl.classList.add('is-active');
    isLoungeOpen = true;

    // Show HUD controls
    showControlsHud();

    // Start 1.4 second cinematic wait, then smoothly fade in video & audio
    cinemaBootTimer = setTimeout(() => {
      if (!isLoungeOpen) return;

      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setupDolbyAudioDSP();
          updatePlayPauseButton(true);

          // Smooth visual fade-in
          videoEl.style.opacity = '1';

          // Smooth acoustic fade-in from 0 to target volume over 1.2s
          const targetVol = volumeSlider ? parseFloat(volumeSlider.value) : 0.9;
          let currentVol = 0;
          const fadeSteps = 24;
          const stepInterval = 1200 / fadeSteps; // ~50ms
          const volStep = targetVol / fadeSteps;

          if (audioFadeTimer) clearInterval(audioFadeTimer);
          audioFadeTimer = setInterval(() => {
            if (!isLoungeOpen || !videoEl) {
              clearInterval(audioFadeTimer);
              return;
            }
            currentVol = Math.min(targetVol, currentVol + volStep);
            videoEl.volume = currentVol;
            if (currentVol >= targetVol) {
              clearInterval(audioFadeTimer);
              audioFadeTimer = null;
            }
          }, stepInterval);
        }).catch(err => {
          console.log('[Exxclusive 3.0] Autoplay prevented, waiting for tap:', err);
          updatePlayPauseButton(false);
          videoEl.style.opacity = '1';
          if (volumeSlider) videoEl.volume = parseFloat(volumeSlider.value);
        });
      }

      // Start Ambilight & Floor Reflection Canvas Loop
      startLoungeRenderLoop();
    }, 1400);
  }

  function closeCurvedCinemaLounge() {
    if (!loungeEl || !videoEl) return;

    if (cinemaBootTimer) {
      clearTimeout(cinemaBootTimer);
      cinemaBootTimer = null;
    }
    if (audioFadeTimer) {
      clearInterval(audioFadeTimer);
      audioFadeTimer = null;
    }

    // Smooth theatrical exit fade-out
    loungeEl.classList.add('is-closing');
    setTimeout(() => {
      loungeEl.classList.remove('is-active');
      loungeEl.classList.remove('is-closing');
      isLoungeOpen = false;

      // Pause video & reset opacity
      if (videoEl) {
        videoEl.pause();
        videoEl.style.opacity = '0';
        updatePlayPauseButton(false);
      }

      // Stop render loop
      if (renderRafId) {
        cancelAnimationFrame(renderRafId);
        renderRafId = null;
      }
    }, 320);
  }

  function updatePlayPauseButton(isPlaying) {
    if (!centerPlayBtn) return;
    if (isPlaying) {
      centerPlayBtn.innerHTML = `
        <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16" rx="1.5"></rect>
          <rect x="14" y="4" width="4" height="16" rx="1.5"></rect>
        </svg>
      `;
    } else {
      centerPlayBtn.innerHTML = `
        <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      `;
    }
  }

  function togglePlayPause() {
    if (!videoEl) return;
    if (videoEl.paused) {
      setupDolbyAudioDSP();
      videoEl.play();
      updatePlayPauseButton(true);
    } else {
      videoEl.pause();
      updatePlayPauseButton(false);
    }
  }

  function stepTime(seconds) {
    if (!videoEl) return;
    showControlsHud();
    videoEl.currentTime = Math.max(0, Math.min(videoEl.duration || 0, videoEl.currentTime + seconds));
  }

  // Format time as negative countdown "-MM:SS" (e.g. "-42:10" from Image 2)
  function formatCountdownTime(currentTime, duration) {
    if (!duration || isNaN(duration)) return '-00:00';
    const remaining = Math.max(0, duration - currentTime);
    const mins = Math.floor(remaining / 60);
    const secs = Math.floor(remaining % 60);
    return `-${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`;
  }

  function updateTimelineUI() {
    if (!videoEl || isDraggingScrubber) return;
    const curr = videoEl.currentTime || 0;
    const dur = videoEl.duration || 0;
    const pct = dur > 0 ? (curr / dur) * 100 : 0;

    if (timelineFill) timelineFill.style.width = `${pct}%`;
    if (timelineDot) timelineDot.style.left = `${pct}%`;
    if (timeCountdown) timeCountdown.textContent = formatCountdownTime(curr, dur);
  }

  // --- 5. REAL-TIME AMBILIGHT & LIVE FLOOR REFLECTION ENGINE ---
  function startLoungeRenderLoop() {
    if (renderRafId) cancelAnimationFrame(renderRafId);

    // Initialize canvases
    if (ambilightCanvas && !ambilightCtx) {
      ambilightCtx = ambilightCanvas.getContext('2d', { willReadFrequently: true });
    }
    if (floorCanvas && !floorCtx) {
      floorCtx = floorCanvas.getContext('2d', { willReadFrequently: true });
    }

    if (ambilightCanvas) ambilightCanvas.classList.add('is-active');

    let lastDraw = 0;

    function renderLoop(now) {
      if (!isLoungeOpen) return;

      // Throttle canvas processing to 30fps on mobile to preserve 60fps UI butter
      if (now - lastDraw > 32) {
        lastDraw = now;

        if (videoEl && !videoEl.paused && videoEl.readyState >= 2) {
          // A. Real-Time Adaptive Ambilight Canvas
          if (ambilightCtx && ambilightCanvas) {
            try {
              ambilightCtx.drawImage(videoEl, 0, 0, ambilightCanvas.width, ambilightCanvas.height);
            } catch (_) {}
          }

          // B. Real-Time Glossy Floor Live Mirror Reflection Canvas
          if (floorCtx && floorCanvas) {
            try {
              // Draw bottom portion of video, flipped vertically with glossy blur
              floorCtx.save();
              floorCtx.clearRect(0, 0, floorCanvas.width, floorCanvas.height);
              floorCtx.translate(0, floorCanvas.height);
              floorCtx.scale(1, -1);
              floorCtx.drawImage(
                videoEl,
                0, videoEl.videoHeight * 0.45, videoEl.videoWidth, videoEl.videoHeight * 0.55,
                0, 0, floorCanvas.width, floorCanvas.height
              );
              floorCtx.restore();
            } catch (_) {}
          }

          // C. Audio-Reactive Ambilight Pulse
          if (analyserNode && freqByteData && ambilightCanvas) {
            try {
              analyserNode.getByteFrequencyData(freqByteData);
              // Sub-bass frequency average (bins 0 - 3)
              const bassEnergy = (freqByteData[0] + freqByteData[1] + freqByteData[2] + freqByteData[3]) / 4;
              const scale = 1.0 + (bassEnergy / 255) * 0.14;
              const brightness = 1.1 + (bassEnergy / 255) * 0.45;
              ambilightCanvas.style.transform = `scale(${scale.toFixed(3)})`;
              ambilightCanvas.style.filter = `blur(64px) saturate(240%) brightness(${brightness.toFixed(2)})`;
            } catch (_) {}
          }
        }
      }

      // 60 FPS Continuous Butter-Smooth Scrubber Sync
      if (videoEl && !videoEl.paused && !isDraggingScrubber) {
        updateTimelineUI();
      }

      renderRafId = requestAnimationFrame(renderLoop);
    }

    renderRafId = requestAnimationFrame(renderLoop);
  }

  // --- 6. INVISIBLE CONTROLS & HUD GESTURES ---
  function showControlsHud() {
    if (!hudEl) return;
    hudEl.classList.remove('is-hidden');
    if (hudInactivityTimer) clearTimeout(hudInactivityTimer);

    // Auto-hide controls after 2.6 seconds of inactivity during playback
    hudInactivityTimer = setTimeout(() => {
      if (videoEl && !videoEl.paused && !isDraggingScrubber) {
        hudEl.classList.add('is-hidden');
      }
    }, 2600);
  }

  // --- INITIALIZATION ---
  function init() {
    introEl = document.getElementById('exxclusive-netflix-intro');
    libraryEl = document.getElementById('exxclusive-smart-library');
    loungeEl = document.getElementById('curved-charcoal-lounge');
    videoEl = document.getElementById('lounge-video-player');
    ambilightCanvas = document.getElementById('lounge-ambient-canvas');
    floorCanvas = document.getElementById('lounge-floor-canvas');
    hudEl = document.getElementById('lounge-glass-hud');
    centerPlayBtn = document.getElementById('lounge-play-btn');
    stepBackBtn = document.getElementById('lounge-step-back-btn');
    stepFwdBtn = document.getElementById('lounge-step-fwd-btn');
    volumeSlider = document.getElementById('lounge-volume-slider');
    timelineTrack = document.getElementById('lounge-timeline-bar-box');
    timelineFill = document.getElementById('lounge-timeline-fill');
    timelineDot = document.getElementById('lounge-timeline-dot');
    timeCountdown = document.getElementById('lounge-time-countdown');
    exitBtn = document.getElementById('cinema-nav-back-btn') || document.getElementById('lounge-exit-btn');
    searchInput = document.getElementById('aura-search-input');
    searchClearBtn = document.getElementById('aura-search-clear-btn');
    mediaGridEl = document.getElementById('aura-media-grid');
    filterChips = Array.from(document.querySelectorAll('.aura-filter-chip'));
    quickCinemaBtn = document.getElementById('aura-quick-cinema-btn');
    audioEqBtn = document.getElementById('lounge-eq-pill-btn');
    audioEqLabel = document.getElementById('lounge-eq-pill-label');

    // Canvas internal buffer resolutions (optimized for 60fps blur)
    if (ambilightCanvas) {
      ambilightCanvas.width = 64;
      ambilightCanvas.height = 36;
    }
    if (floorCanvas) {
      floorCanvas.width = 160;
      floorCanvas.height = 90;
    }

    // Intro skip / dismissal
    if (introEl) {
      introEl.addEventListener('click', dismissIntro);
      const skipHint = introEl.querySelector('.netflix-skip-hint');
      if (skipHint) skipHint.addEventListener('click', dismissIntro);
    }

    // Quick Cinema button
    if (quickCinemaBtn) {
      quickCinemaBtn.addEventListener('click', () => {
        openCurvedCinemaLounge(EXXCLUSIVE_MEDIA[0]);
      });
    }

    // Search input
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        if (searchClearBtn) {
          searchClearBtn.style.display = searchQuery.length > 0 ? 'block' : 'none';
        }
        renderMediaGrid();
      });
    }

    if (searchClearBtn) {
      searchClearBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        searchQuery = '';
        searchClearBtn.style.display = 'none';
        renderMediaGrid();
      });
    }

    // Filter chips
    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeFilter = chip.getAttribute('data-filter') || 'all';
        renderMediaGrid();
      });
    });

    // Lounge Controls
    if (centerPlayBtn) {
      centerPlayBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePlayPause();
      });
    }

    if (stepBackBtn) {
      stepBackBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        stepTime(-15);
      });
    }

    if (stepFwdBtn) {
      stepFwdBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        stepTime(15);
      });
    }

    // Volume Slider
    if (volumeSlider) {
      volumeSlider.addEventListener('input', (e) => {
        e.stopPropagation();
        showControlsHud();
        if (videoEl) {
          videoEl.volume = parseFloat(e.target.value);
          videoEl.muted = false;
        }
      });
    }

    // Audio EQ Mode Pill
    if (audioEqBtn) {
      audioEqBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showControlsHud();
        applyEqMode(audioEqMode + 1);
      });
    }

    // Timeline Scrubbing (Butter-Smooth 60/120 FPS Orientation-Aware Engine)
    if (timelineTrack) {
      function getScrubFraction(e) {
        if (!timelineTrack) return 0;
        const rect = timelineTrack.getBoundingClientRect();
        let clientX = e.clientX;
        let clientY = e.clientY;
        if (e.touches && e.touches.length > 0) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else if (e.changedTouches && e.changedTouches.length > 0) {
          clientX = e.changedTouches[0].clientX;
          clientY = e.changedTouches[0].clientY;
        }
        if (clientX === undefined) clientX = 0;
        if (clientY === undefined) clientY = 0;

        // Check if lounge is rotated 90deg (in mobile portrait mode, rect.height is the track length)
        if (rect.width >= rect.height) {
          if (rect.width <= 0) return 0;
          return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        } else {
          if (rect.height <= 0) return 0;
          return Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
        }
      }

      const applyScrub = (e) => {
        if (!videoEl || !videoEl.duration || !isFinite(videoEl.duration)) return;
        const frac = getScrubFraction(e);
        const targetTime = frac * videoEl.duration;

        // Instant visual feedback for track and remaining time
        const pct = frac * 100;
        if (timelineFill) timelineFill.style.width = `${pct}%`;
        if (timelineDot) timelineDot.style.left = `${pct}%`;
        if (timeCountdown) timeCountdown.textContent = formatCountdownTime(targetTime, videoEl.duration);

        // Update video playback position directly
        videoEl.currentTime = targetTime;
      };

      const onScrubStart = (e) => {
        isDraggingScrubber = true;
        showControlsHud();
        if (e.cancelable) e.preventDefault();
        applyScrub(e);
        if (e.pointerId && timelineTrack.setPointerCapture) {
          try { timelineTrack.setPointerCapture(e.pointerId); } catch (_) {}
        }
      };

      const onScrubMove = (e) => {
        if (!isDraggingScrubber) return;
        if (e.cancelable) e.preventDefault();
        applyScrub(e);
      };

      const onScrubEnd = (e) => {
        if (isDraggingScrubber) {
          applyScrub(e);
          isDraggingScrubber = false;
          showControlsHud();
        }
      };

      // Pointer events with desktop & mobile stylus support
      timelineTrack.addEventListener('pointerdown', onScrubStart);
      window.addEventListener('pointermove', onScrubMove, { passive: false });
      window.addEventListener('pointerup', onScrubEnd);
      window.addEventListener('pointercancel', onScrubEnd);

      // Dedicated Touch listeners for resilient mobile dragging without browser scroll hijacking
      timelineTrack.addEventListener('touchstart', onScrubStart, { passive: false });
      window.addEventListener('touchmove', onScrubMove, { passive: false });
      window.addEventListener('touchend', onScrubEnd, { passive: false });
      window.addEventListener('touchcancel', onScrubEnd, { passive: false });
    }

    // Video events
    if (videoEl) {
      videoEl.addEventListener('timeupdate', updateTimelineUI);
      videoEl.addEventListener('play', () => updatePlayPauseButton(true));
      videoEl.addEventListener('pause', () => updatePlayPauseButton(false));
      videoEl.addEventListener('ended', () => {
        updatePlayPauseButton(false);
        showControlsHud();
      });
    }

    // Exit Button
    if (exitBtn) {
      exitBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeCurvedCinemaLounge();
      });
    }

    // Lounge Stage Tap: Show / Toggle HUD
    if (loungeEl) {
      loungeEl.addEventListener('pointerdown', (e) => {
        if (e.target.closest('.lounge-glass-hud > *') || e.target.closest('.cinema-floating-dock') || e.target.closest('.lounge-exit-btn')) {
          return;
        }
        if (hudEl && hudEl.classList.contains('is-hidden')) {
          showControlsHud();
        } else {
          showControlsHud();
        }
      });

      loungeEl.addEventListener('mousemove', showControlsHud);
    }

    // Render initial grid
    renderMediaGrid();
  }

  // Tab switch hook: trigger signature intro on first visit
  let hasVisitedCinema = false;
  window.onExxclusiveTabActivated = function () {
    renderMediaGrid();
    if (!hasVisitedCinema) {
      hasVisitedCinema = true;
      triggerIntroAnimation();
    }
  };

  window.onExxclusiveTabDeactivated = function () {
    if (isLoungeOpen) {
      closeCurvedCinemaLounge();
    }
  };

  // Expose global interface
  window.vievExxclusive3 = {
    openLounge: openCurvedCinemaLounge,
    closeLounge: closeCurvedCinemaLounge,
    playIntro: triggerIntroAnimation,
    getMedia: () => EXXCLUSIVE_MEDIA
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

