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

  // Video Source & YouTube State
  let currentSource = 'library'; // 'library' | 'youtube'
  let ytFeedVideos = [];
  let ytLoadedIds = new Set();
  let ytPage = 1;
  let ytIsLoading = false;
  let currentYtQuery = 'all';
  let isYtPlaying = false;
  let ytDebounceTimer = null;
  let ytScrollThrottleTimer = null;

  // DOM Elements
  let introEl = null;
  let libraryEl = null;
  let loungeEl = null;
  let videoEl = null;
  let ambilightCanvas = null;
  let ambilightCtx = null;
  let ytAmbientPalette = { color1: '#ff2d55', color2: '#ff9500', color3: '#5856d6' };
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

  // DISCO ARCHITECTURAL 4-CORNER RUNNING BEAM LASER SYSTEM
  let laserCorners = { left: null, ceiling: null, right: null, floor: null };
  let laserCornerLengths = { left: 750, ceiling: 1020, right: 530, floor: 1500 };
  let laserPillBtn = null;
  let laserPillLabel = null;
  let laserPillPulse = null;
  let isLaserSyncEnabled = true;
  let lastLaserTriggerTime = 0;
  let discoPaletteIndex = 0;
  let discoPatternStep = 0;

  const DISCO_PALETTES = [
    { c1: '#00f0ff', c2: '#b000ff' }, // Cyber Cyan & Electric Violet
    { c1: '#ff0055', c2: '#ffcc00' }, // Tokyo Hot Pink & Laser Gold
    { c1: '#00ff88', c2: '#00ccff' }, // Electric Mint & Ice Blue
    { c1: '#ff3300', c2: '#ff00aa' }, // Solar Flare & Deep Magenta
    { c1: '#7928ca', c2: '#ff0080' }, // Midnight Club
    { c1: '#ffffff', c2: '#00f0ff' }  // White Hot Strobe & Cyan
  ];

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

  // --- 1. WEB AUDIO SYNTHESIZER: NETFLIX "TUDUM" DEEP CINEMA RESONANCE ---
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

      // --- TUDUM LAYER 1: Deep Hollywood Sub-Bass Drop (68Hz -> 28Hz) ---
      const subOsc = audioCtx.createOscillator();
      const subGain = audioCtx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(68, now);
      subOsc.frequency.exponentialRampToValueAtTime(28, now + 0.6);

      subGain.gain.setValueAtTime(0.001, now);
      subGain.gain.linearRampToValueAtTime(0.95, now + 0.025);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      subOsc.connect(subGain);
      subGain.connect(masterGain);
      subOsc.start(now);
      subOsc.stop(now + 0.9);

      // --- TUDUM LAYER 2: Resonant Cinema Drone (Ta-DUM accent at t + 0.20s) ---
      const droneTime = now + 0.20;
      const droneOsc = audioCtx.createOscillator();
      const droneGain = audioCtx.createGain();
      const droneFilter = audioCtx.createBiquadFilter();

      droneOsc.type = 'triangle';
      droneOsc.frequency.setValueAtTime(84, droneTime);
      droneOsc.frequency.exponentialRampToValueAtTime(42, droneTime + 1.2);

      droneFilter.type = 'lowpass';
      droneFilter.frequency.setValueAtTime(380, droneTime);

      droneGain.gain.setValueAtTime(0.001, droneTime);
      droneGain.gain.linearRampToValueAtTime(0.7, droneTime + 0.06);
      droneGain.gain.exponentialRampToValueAtTime(0.001, droneTime + 1.5);

      droneOsc.connect(droneFilter);
      droneFilter.connect(droneGain);
      droneGain.connect(masterGain);
      droneOsc.start(droneTime);
      droneOsc.stop(droneTime + 1.6);

      // --- TUDUM LAYER 3: Ethereal Spatial Shimmer Bloom (t + 0.28s) ---
      const shimmerNotes = [261.63, 392.00, 523.25]; // Warm harmonic triad
      shimmerNotes.forEach((freq, idx) => {
        const shimOsc = audioCtx.createOscillator();
        const shimGain = audioCtx.createGain();
        const shimFilter = audioCtx.createBiquadFilter();

        shimOsc.type = 'sine';
        shimOsc.frequency.setValueAtTime(freq, droneTime + (idx * 0.03));

        shimFilter.type = 'lowpass';
        shimFilter.frequency.setValueAtTime(1400, droneTime);

        shimGain.gain.setValueAtTime(0.001, droneTime);
        shimGain.gain.linearRampToValueAtTime(0.12, droneTime + 0.18);
        shimGain.gain.exponentialRampToValueAtTime(0.0001, droneTime + 1.3);

        shimOsc.connect(shimFilter);
        shimFilter.connect(shimGain);
        shimGain.connect(masterGain);

        shimOsc.start(droneTime);
        shimOsc.stop(droneTime + 1.4);
      });
    } catch (e) {
      console.warn('[Exxclusive 3.0] Audio synthesis skipped or blocked by browser policy:', e);
    }
  }

  // Zero-Lag 3D Multi-Color Ribbon Stream (24 Ultra-Optimized Hardware-Accelerated Lines)
  function buildRibbonBurst() {
    const stage = document.getElementById('netflix-ribbon-stage');
    if (!stage) return;
    stage.innerHTML = '';

    const colors = ['red', 'purple', 'cyan'];
    const totalRibbons = 24; // 8 red, 8 purple, 8 cyan - 60 FPS rock solid

    for (let i = 0; i < totalRibbons; i++) {
      const ribbon = document.createElement('div');
      const color = colors[i % 3];
      ribbon.className = `netflix-burst-ribbon color-${color}`;

      // Fan-out horizontally from center
      const spreadFactor = (i - (totalRibbons / 2)) / (totalRibbons / 2);
      
      const xStart = (spreadFactor * 20).toFixed(1);
      const xMid = (spreadFactor * 120).toFixed(1);
      const xEnd = (spreadFactor * 320).toFixed(1);
      const xExit = (spreadFactor * 580).toFixed(1);

      ribbon.style.setProperty('--x-start', `${xStart}px`);
      ribbon.style.setProperty('--x-mid', `${xMid}px`);
      ribbon.style.setProperty('--x-end', `${xEnd}px`);
      ribbon.style.setProperty('--x-exit', `${xExit}px`);

      ribbon.style.left = '50%';

      const widths = [2, 2.8, 3.5];
      ribbon.style.width = `${widths[i % widths.length]}px`;

      // Fast staggered delay
      const delay = (i % 6) * 0.022;
      ribbon.style.animationDelay = `${delay.toFixed(3)}s`;

      stage.appendChild(ribbon);
    }
  }

  // Dismiss intro and reveal Smart Library
  function dismissIntro() {
    if (!introEl || introEl.classList.contains('is-dismissed')) return;
    introEl.classList.add('is-dismissed');
    setTimeout(() => {
      introEl.style.display = 'none';
    }, 450);
  }

  function triggerIntroAnimation() {
    if (!introEl) return;
    buildRibbonBurst();

    // Re-trigger letter-by-letter cascade animation
    const letters = document.querySelectorAll('.netflix-brand-title .intro-letter');
    letters.forEach(letter => {
      letter.style.animation = 'none';
      void letter.offsetHeight;
      letter.style.animation = '';
    });

    introEl.style.display = 'flex';
    introEl.classList.remove('is-dismissed');
    playNetflixSignatureSound();

    // Auto dismiss after letter cascade completes and holds proudly (2.4s)
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
          <div class="aura-card-play-hover">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="6 3 20 12 6 21 6 3"></polygon>
            </svg>
          </div>
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

  // --- YOUTUBE BROWSER-BASED INFINITE FEED & SOURCE SWITCHER ---
  function extractYouTubeId(url) {
    if (!url) return null;
    url = url.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
    const m1 = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (m1) return m1[1];
    const m2 = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (m2) return m2[1];
    const m3 = url.match(/\/(embed|shorts)\/([a-zA-Z0-9_-]{11})/);
    if (m3) return m3[2];
    return null;
  }

  function getFallbackVideos() {
    if (window.VIRAT_YOUTUBE_FEED && Array.isArray(window.VIRAT_YOUTUBE_FEED) && window.VIRAT_YOUTUBE_FEED.length > 0) {
      return window.VIRAT_YOUTUBE_FEED;
    }
    return [
      { id: 'c64I9HNpiOY', title: 'Ek Dil Ek Jaan • Padmaavat (Deepika Padukone, Shahid Kapoor)', channel: 'T-Series', views: '112M views', pub: '2 years ago', duration: '5:10', thumb: 'https://i.ytimg.com/vi/c64I9HNpiOY/hqdefault.jpg', avatar: 'song/virat_plays_avatar.png' },
      { id: 'BddP6PYo2gs', title: 'Kesariya • Brahmāstra (Arijit Singh, Ranbir Kapoor)', channel: 'Sony Music India', views: '640M views', pub: '1 year ago', duration: '4:28', thumb: 'https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg', avatar: 'song/virat_plays_avatar.png' },
      { id: 'E_SbwSe15y0', title: 'Ve Haaniyaan • Ravi Dubey & Sargun Mehta', channel: 'Dreamiyata Music', views: '396M views', pub: '8 months ago', duration: '4:05', thumb: 'https://i.ytimg.com/vi/E_SbwSe15y0/hqdefault.jpg', avatar: 'song/virat_plays_avatar.png' },
      { id: 'Z4aMdO8K0XE', title: "India's Got Latent Episode 8 • Samay Raina & MC Stan", channel: 'Samay Raina', views: '48M views', pub: '1 month ago', duration: '42:15', thumb: 'https://i.ytimg.com/vi/Z4aMdO8K0XE/hqdefault.jpg', avatar: 'song/virat_plays_avatar.png' },
      { id: 'GsOBaZh6cZo', title: 'So Swaezy • Yo Yo Honey Singh & Hommie Dilliwala', channel: 'Yo Yo Honey Singh', views: '26M views', pub: '3 weeks ago', duration: '3:45', thumb: 'https://i.ytimg.com/vi/GsOBaZh6cZo/hqdefault.jpg', avatar: 'song/virat_plays_avatar.png' },
      { id: '7DzWXIE4Pj0', title: 'Chhod Diya • Kanika Kapoor & Arijit Singh', channel: 'Zee Music Company', views: '185M views', pub: '3 years ago', duration: '4:12', thumb: 'https://i.ytimg.com/vi/7DzWXIE4Pj0/hqdefault.jpg', avatar: 'song/virat_plays_avatar.png' }
    ];
  }

  function getFallbackBatch(query, page, count = 6) {
    const pool = getFallbackVideos();
    let filtered = pool;
    if (query && query !== 'all') {
      const qLower = query.toLowerCase().trim();
      const tokens = qLower.split(/\s+/).filter(Boolean);
      filtered = pool.filter(v => {
        const text = ((v.title || '') + ' ' + (v.channel || '')).toLowerCase();
        return tokens.some(t => text.includes(t));
      });
      if (filtered.length === 0) filtered = pool;
    }

    const total = filtered.length;
    if (total === 0) return [];

    const startIndex = ((page - 1) * count) % total;
    let batch = filtered.slice(startIndex, startIndex + count);
    if (batch.length < count) {
      batch = batch.concat(filtered.slice(0, count - batch.length));
    }
    return batch.map(v => ({
      id: v.id,
      title: v.title || 'YouTube Video',
      channel: v.channel || 'YouTube',
      views: v.views || '100K views',
      pub: v.pub || '',
      duration: v.duration || 'HD',
      thumb: v.thumb || `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
      avatar: v.avatar || 'song/virat_plays_avatar.png'
    }));
  }

  function generateYtCardHtml(vid) {
    const thumbUrl = vid.thumb || `https://i.ytimg.com/vi/${vid.id}/hqdefault.jpg`;
    const avatarUrl = vid.avatar || 'song/virat_plays_avatar.png';
    const channel = (vid.channel || 'YouTube').replace(/"/g, '&quot;');
    const title = (vid.title || 'YouTube Video').replace(/"/g, '&quot;');
    const views = vid.views || '';
    const pub = vid.pub || '';
    const duration = vid.duration || 'HD';

    return `
      <div class="aura-yt-card" data-video-id="${vid.id}" role="button" tabindex="0">
        <div class="aura-yt-thumb-wrap">
          <img src="${thumbUrl}" alt="${title}" class="aura-yt-thumb-img" loading="lazy" onerror="this.src='https://i.ytimg.com/vi/${vid.id}/hqdefault.jpg'">
          <div class="aura-yt-badge-top">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            <span>YOUTUBE</span>
          </div>
          <div class="aura-yt-duration">${duration}</div>
        </div>
        <div class="aura-yt-details-row">
          <img src="${avatarUrl}" class="aura-yt-avatar" alt="${channel}" onerror="this.src='song/virat_plays_avatar.png'">
          <div class="aura-yt-info">
            <h3 class="aura-yt-title">${title}</h3>
            <div class="aura-yt-meta">
              <span class="aura-yt-channel">${channel}</span>
              ${views ? `<span class="aura-yt-dot">•</span><span class="aura-yt-views">${views}</span>` : ''}
              ${pub ? `<span class="aura-yt-dot">•</span><span class="aura-yt-pub">${pub}</span>` : ''}
            </div>
          </div>
          <div class="aura-yt-more-btn" aria-label="More options">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2"></circle>
              <circle cx="12" cy="12" r="2"></circle>
              <circle cx="12" cy="19" r="2"></circle>
            </svg>
          </div>
        </div>
      </div>
    `;
  }

  function attachYtCardClickListener(card) {
    if (!card) return;
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-video-id');
      const vid = ytFeedVideos.find(v => v.id === id);
      if (vid) {
        openCurvedCinemaLounge({
          id: 'yt-' + vid.id,
          youtubeId: vid.id,
          type: 'youtube',
          title: vid.title,
          sub: (vid.channel || 'YouTube') + (vid.views ? ' • ' + vid.views : ''),
          poster: vid.thumb || `https://i.ytimg.com/vi/${vid.id}/hqdefault.jpg`,
          duration: vid.duration || 'HD'
        });
      }
    });
  }

  function appendYouTubeCards(videos) {
    const ytGridEl = document.getElementById('aura-yt-feed-grid');
    if (!ytGridEl || !videos || videos.length === 0) return;

    const temp = document.createElement('div');
    temp.innerHTML = videos.map(generateYtCardHtml).join('');

    const children = Array.from(temp.children);
    children.forEach(card => {
      attachYtCardClickListener(card);
      ytGridEl.appendChild(card);
    });
  }

  function renderYouTubeGrid() {
    const ytGridEl = document.getElementById('aura-yt-feed-grid');
    if (!ytGridEl) return;

    if (ytFeedVideos.length === 0) {
      ytGridEl.innerHTML = `
        <div style="padding: 48px 16px; text-align: center; color: rgba(255,255,255,0.4);">
          <div style="font-size: 32px; margin-bottom: 8px;">🎬</div>
          <div style="font-size: 15px; font-weight: 600; color: #fff;">No YouTube videos found</div>
          <div style="font-size: 12px; margin-top: 4px;">Try searching another keyword or song.</div>
        </div>
      `;
      return;
    }

    ytGridEl.innerHTML = ytFeedVideos.map(generateYtCardHtml).join('');
    ytGridEl.querySelectorAll('.aura-yt-card').forEach(attachYtCardClickListener);
  }

  async function loadYouTubeFeed(query = 'all', append = false) {
    if (ytIsLoading) return;
    ytIsLoading = true;
    currentYtQuery = query;

    const loaderEl = document.getElementById('aura-yt-loader');

    if (!append) {
      ytPage = 1;
      ytLoadedIds.clear();
      ytFeedVideos = [];
      if (loaderEl) loaderEl.style.display = 'none';

      // 0ms instant display of first 6 real mobile cards
      const initialBatch = getFallbackBatch(query, 1, 6);
      initialBatch.forEach(v => ytLoadedIds.add(v.id));
      ytFeedVideos = [...initialBatch];
      renderYouTubeGrid();
    } else {
      if (loaderEl) loaderEl.style.display = 'flex';
    }

    // Try live fetch with 2s timeout
    let liveVideos = [];
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2000);
      const qParam = query === 'all' ? 'trending music hindi' : query;
      const apiUrl = `/api/youtube/search?q=${encodeURIComponent(qParam)}&page=${ytPage}`;
      const res = await fetch(apiUrl, { signal: controller.signal });
      clearTimeout(timer);

      if (res && res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.videos) && data.videos.length > 0) {
          liveVideos = data.videos.map(v => ({
            id: v.id,
            title: v.title || 'YouTube Video',
            channel: v.channel || 'YouTube',
            views: v.views || 'Trending',
            pub: v.pub || '',
            duration: v.duration || 'HD',
            thumb: v.thumb || `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
            avatar: v.avatar || 'song/virat_plays_avatar.png'
          }));
        }
      }
    } catch (_) {
      // Live search failed or offline, fallback handles smoothly
    }

    // Determine batch to display
    let newBatch = [];
    if (liveVideos.length > 0) {
      newBatch = liveVideos.filter(v => !ytLoadedIds.has(v.id));
    }
    // If live produced nothing new, take from local catalog
    if (newBatch.length === 0) {
      const fallbackList = getFallbackBatch(query, ytPage + 1, 6);
      newBatch = fallbackList.filter(v => !ytLoadedIds.has(v.id));
      if (newBatch.length === 0) {
        newBatch = fallbackList; // Wrap-around for infinite scroll
      }
    }

    // Add minimal 350ms delay for smooth animation when scrolling
    if (append) {
      await new Promise(r => setTimeout(r, 350));
    }

    if (newBatch.length > 0) {
      newBatch.forEach(v => ytLoadedIds.add(v.id));
      if (!append) {
        if (liveVideos.length > 0) {
          ytFeedVideos = newBatch.slice(0, 8);
          renderYouTubeGrid();
        }
      } else {
        ytFeedVideos.push(...newBatch);
        appendYouTubeCards(newBatch);
      }
    }

    ytIsLoading = false;
    if (loaderEl) loaderEl.style.display = 'none';
  }

  function setVideoSource(source) {
    currentSource = source;
    const sourceSwitcherEl = document.getElementById('aura-source-switcher');
    const sourceActiveLabel = document.getElementById('aura-source-active-label');
    const sourceActiveIcon = document.getElementById('aura-source-active-icon');
    const sourceOptLibrary = document.getElementById('source-opt-library');
    const sourceOptYoutube = document.getElementById('source-opt-youtube');
    const viewLibraryEl = document.getElementById('aura-view-library');
    const viewYoutubeEl = document.getElementById('aura-view-youtube');

    if (sourceSwitcherEl) sourceSwitcherEl.classList.remove('is-open');

    if (source === 'youtube') {
      if (sourceActiveLabel) sourceActiveLabel.textContent = 'YouTube';
      if (sourceActiveIcon) {
        sourceActiveIcon.className = 'aura-source-btn-icon is-yt';
        sourceActiveIcon.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`;
      }
      if (sourceOptLibrary) sourceOptLibrary.classList.remove('active');
      if (sourceOptYoutube) sourceOptYoutube.classList.add('active');

      if (viewLibraryEl) viewLibraryEl.style.display = 'none';
      if (viewYoutubeEl) {
        viewYoutubeEl.style.display = 'flex';
        viewYoutubeEl.classList.add('active');
      }

      if (ytFeedVideos.length === 0) {
        loadYouTubeFeed('all');
      }
    } else {
      if (sourceActiveLabel) sourceActiveLabel.textContent = 'Added Videos';
      if (sourceActiveIcon) {
        sourceActiveIcon.className = 'aura-source-btn-icon';
        sourceActiveIcon.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 2v20M8 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5"></path></svg>`;
      }
      if (sourceOptLibrary) sourceOptLibrary.classList.add('active');
      if (sourceOptYoutube) sourceOptYoutube.classList.remove('active');

      if (viewYoutubeEl) {
        viewYoutubeEl.style.display = 'none';
        viewYoutubeEl.classList.remove('active');
      }
      if (viewLibraryEl) {
        viewLibraryEl.style.display = 'flex';
        viewLibraryEl.classList.add('active');
      }
    }
  }

  // True 16:9 Cinema Fitting (Option A): Video matches 16:9 curved screen bezel-to-bezel with zero crop
  function fitYouTubePlayerToScreen() {
    const ytPlayer = document.getElementById('lounge-youtube-player');
    if (!ytPlayer) return;
    ytPlayer.style.width = '100%';
    ytPlayer.style.height = '100%';
    ytPlayer.style.position = 'absolute';
    ytPlayer.style.left = '0';
    ytPlayer.style.top = '0';
    ytPlayer.style.transform = 'none';
  }

  // --- 4. LUXURY AIRBNB CURVED CHARCOAL HOME CINEMA LOUNGE ---
  function openCurvedCinemaLounge(media) {
    if (!loungeEl) return;
    currentMedia = media || currentMedia;
    const ytPlayer = document.getElementById('lounge-youtube-player');
    const isYouTube = currentMedia && (currentMedia.type === 'youtube' || !!currentMedia.youtubeId);

    // Clear any previous transition timers
    if (cinemaBootTimer) {
      clearTimeout(cinemaBootTimer);
      cinemaBootTimer = null;
    }
    if (audioFadeTimer) {
      clearInterval(audioFadeTimer);
      audioFadeTimer = null;
    }

    // Show lounge environment with opening fade animation
    loungeEl.classList.remove('is-closing');
    loungeEl.classList.add('is-active');
    isLoungeOpen = true;

    // Switch main floating navbar into Cinema Mode (4 tabs morph into single 'Back to Library' button)
    const floatingDock = document.getElementById('apple-floating-dock');
    const floatingNav = document.getElementById('apple-floating-navbar');
    if (floatingDock) {
      floatingDock.classList.remove('hud-hidden');
      floatingDock.classList.add('is-cinema-mode');
    }
    if (floatingNav) floatingNav.classList.add('is-cinema-mode');

    // Show HUD controls
    showControlsHud();

    if (isYouTube) {
      // YOUTUBE MODE: Play in curved concave iframe with strict-origin-when-cross-origin
      if (videoEl) {
        try { videoEl.pause(); } catch (_) {}
        videoEl.style.display = 'none';
      }
      const ytId = currentMedia.youtubeId || extractYouTubeId(currentMedia.src);

      if (ytPlayer) {
        ytPlayer.style.display = 'block';
        // youtube-nocookie.com avoids cookie/anti-tracker conflicts and passes origin
        const originParam = (window.location.protocol.startsWith('http') && window.location.origin && window.location.origin !== 'null')
          ? `&origin=${encodeURIComponent(window.location.origin)}`
          : '';
        ytPlayer.src = `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&enablejsapi=1&playsinline=1&rel=0&modestbranding=1${originParam}`;

        // Compute edge-to-edge covering dynamically so video fills curved screen with zero black bars
        fitYouTubePlayerToScreen();
        setTimeout(fitYouTubePlayerToScreen, 50);
        setTimeout(fitYouTubePlayerToScreen, 150);
        setTimeout(fitYouTubePlayerToScreen, 350);
      }

      isYtPlaying = true;
      updatePlayPauseButton(true);

      // Start Real-Time Intelligent Dynamic YouTube Ambient Lighting
      updateYouTubePalette(currentMedia);
      startLoungeRenderLoop();
    } else {
      // DIRECT MP4 4K MASTER MODE
      if (ytPlayer) {
        ytPlayer.src = '';
        ytPlayer.style.display = 'none';
      }
      if (videoEl) {
        videoEl.style.display = 'block';
        if (videoEl.src !== media.src && !videoEl.src.endsWith(media.src)) {
          videoEl.src = media.src;
        }

        // Prepare cinema dark state for dramatic 1.4s fade-in sequence
        videoEl.currentTime = 0;
        videoEl.volume = 0;
        videoEl.style.opacity = '0';
        videoEl.style.transition = 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
        updatePlayPauseButton(false);

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
    }
  }

  function closeCurvedCinemaLounge() {
    if (!loungeEl || !isLoungeOpen) return;

    if (cinemaBootTimer) {
      clearTimeout(cinemaBootTimer);
      cinemaBootTimer = null;
    }
    if (audioFadeTimer) {
      clearInterval(audioFadeTimer);
      audioFadeTimer = null;
    }
    if (hudInactivityTimer) {
      clearTimeout(hudInactivityTimer);
      hudInactivityTimer = null;
    }

    // 1. Immediately cancel heavy canvas render loop to free 100% GPU/CPU for exit animation
    if (renderRafId) {
      cancelAnimationFrame(renderRafId);
      renderRafId = null;
    }

    // 2. Immediately stop both video and YouTube iframe
    const ytPlayer = document.getElementById('lounge-youtube-player');
    if (ytPlayer) {
      ytPlayer.src = '';
      ytPlayer.style.display = 'none';
    }
    isYtPlaying = false;

    if (ambilightCanvas) {
      ambilightCanvas.classList.remove('is-active');
      ambilightCanvas.style.transform = 'scale(1)';
    }

    // Deactivate and reset all disco corner lasers
    Object.values(laserCorners).forEach(el => el && el.classList.remove('is-chasing', 'is-chasing-rev', 'is-active'));

    if (videoEl) {
      try {
        videoEl.pause();
      } catch (_) {}
    }

    const floatingDock = document.getElementById('apple-floating-dock');
    const floatingNav = document.getElementById('apple-floating-navbar');

    // 3. Smooth exit transition - back button fades with lounge
    loungeEl.classList.add('is-closing');
    if (floatingDock) {
      floatingDock.classList.add('hud-hidden');
    }

    // 4. Clean up after exit animation finishes (280ms)
    setTimeout(() => {
      loungeEl.classList.remove('is-active', 'is-closing');
      isLoungeOpen = false;

      if (videoEl) {
        videoEl.currentTime = 0;
        videoEl.style.opacity = '0';
        updatePlayPauseButton(false);
      }

      if (floatingDock) {
        floatingDock.classList.remove('is-cinema-mode', 'hud-hidden');
      }
      if (floatingNav) {
        floatingNav.classList.remove('is-cinema-mode');
      }

      if (window.syncCinemaTabVisibility) {
        try { window.syncCinemaTabVisibility(); } catch (_) {}
      }
    }, 280);
  }

  // --- INTELLIGENT DYNAMIC YOUTUBE AMBIENT LIGHTING ENGINE ---
  function updateYouTubePalette(media) {
    if (!media) return;
    const title = (media.title || '').toLowerCase();
    const sub = (media.sub || '').toLowerCase();
    const combo = title + ' ' + sub;

    // A. Intelligent Genre & Artist-Aware Signature Palettes
    if (combo.includes('latent') || combo.includes('samay') || combo.includes('comedy') || combo.includes('stan')) {
      ytAmbientPalette = {
        color1: 'rgb(142, 68, 240)',  // Electric studio violet
        color2: 'rgb(24, 140, 255)',  // Vivid cyan blue
        color3: 'rgb(255, 45, 120)'   // Neon pink accent
      };
    } else if (combo.includes('honey') || combo.includes('swaezy') || combo.includes('party') || combo.includes('hip hop') || combo.includes('badshah')) {
      ytAmbientPalette = {
        color1: 'rgb(46, 213, 115)',  // Neon lime green
        color2: 'rgb(255, 71, 87)',   // Crimson punch
        color3: 'rgb(255, 168, 1)'    // Amber gold
      };
    } else if (combo.includes('arijit') || combo.includes('kesariya') || combo.includes('ve haaniyaan') || combo.includes('chhod diya') || combo.includes('dil') || combo.includes('ishq') || combo.includes('romantic')) {
      ytAmbientPalette = {
        color1: 'rgb(255, 59, 92)',   // Warm ruby crimson
        color2: 'rgb(255, 159, 26)',  // Sunset golden amber
        color3: 'rgb(108, 92, 231)'   // Deep acoustic indigo
      };
    } else if (combo.includes('padmaavat') || combo.includes('classical') || combo.includes('sufi') || combo.includes('shreya')) {
      ytAmbientPalette = {
        color1: 'rgb(255, 159, 26)',  // Royal saffron
        color2: 'rgb(235, 77, 75)',   // Deep vermilion
        color3: 'rgb(249, 202, 36)'   // Shimmering gold
      };
    } else {
      // Deterministic harmonious chromatic hash based on media ID + title
      let hash = 0;
      const seed = (media.id || '') + (media.title || '') + (media.youtubeId || '');
      for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0;
      }
      const baseHue = Math.abs(hash) % 360;
      const hue1 = baseHue;
      const hue2 = (baseHue + 50) % 360;
      const hue3 = (baseHue + 170) % 360;
      ytAmbientPalette = {
        color1: `hsl(${hue1}, 90%, 54%)`,
        color2: `hsl(${hue2}, 95%, 48%)`,
        color3: `hsl(${hue3}, 85%, 45%)`
      };
    }

    // B. Also attempt safe thumbnail color sampling (if CORS allows)
    const posterUrl = media.poster || (media.youtubeId ? `https://i.ytimg.com/vi/${media.youtubeId}/hqdefault.jpg` : '');
    if (posterUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const off = document.createElement('canvas');
          off.width = 16;
          off.height = 9;
          const ctx = off.getContext('2d');
          ctx.drawImage(img, 0, 0, 16, 9);
          const p1 = ctx.getImageData(3, 4, 1, 1).data;
          const p2 = ctx.getImageData(12, 4, 1, 1).data;
          const p3 = ctx.getImageData(8, 2, 1, 1).data;
          if (p1[0] + p1[1] + p1[2] > 30) {
            ytAmbientPalette = {
              color1: `rgb(${p1[0]}, ${p1[1]}, ${p1[2]})`,
              color2: `rgb(${p2[0]}, ${p2[1]}, ${p2[2]})`,
              color3: `rgb(${p3[0]}, ${p3[1]}, ${p3[2]})`
            };
          }
        } catch (_) {}
      };
      img.src = posterUrl;
    }
  }

  // --- DISCO ARCHITECTURAL 4-CORNER RUNNING BEAM LASER ENGINE ---
  function initArchitecturalLasers() {
    laserCorners.left = document.getElementById('laser-corner-1');
    laserCorners.ceiling = document.getElementById('laser-corner-2');
    laserCorners.right = document.getElementById('laser-corner-3');
    laserCorners.floor = document.getElementById('laser-corner-4');

    laserPillBtn = document.getElementById('lounge-laser-pill-btn');
    laserPillLabel = document.getElementById('lounge-laser-pill-label');
    laserPillPulse = document.getElementById('laser-pill-pulse');

    // Dynamically calculate exact SVG path lengths
    Object.keys(laserCorners).forEach(key => {
      const g = laserCorners[key];
      if (g) {
        const path = g.querySelector('.track-core') || g.querySelector('path');
        if (path && path.getTotalLength) {
          try {
            laserCornerLengths[key] = Math.round(path.getTotalLength());
          } catch (_) {}
        }
      }
    });

    if (laserPillBtn) {
      laserPillBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDiscoLaserSync();
        if (window.vievHaptics && window.vievHaptics.impactLight) {
          window.vievHaptics.impactLight();
        }
      });
    }
  }

  function toggleDiscoLaserSync(forcedState) {
    if (forcedState !== undefined) {
      isLaserSyncEnabled = !!forcedState;
    } else {
      isLaserSyncEnabled = !isLaserSyncEnabled;
    }

    if (laserPillBtn) {
      if (isLaserSyncEnabled) {
        laserPillBtn.classList.remove('is-disabled');
        if (laserPillLabel) laserPillLabel.textContent = 'Disco Lasers: Beat Sync';
      } else {
        laserPillBtn.classList.add('is-disabled');
        if (laserPillLabel) laserPillLabel.textContent = 'Disco Lasers: OFF';
      }
    }
  }

  function triggerLaserBeam(cornerKey, reverse = false, durationMs = 520) {
    if (!isLaserSyncEnabled) return;
    const el = laserCorners[cornerKey];
    if (!el) return;

    const length = laserCornerLengths[cornerKey] || 800;
    const beamLen = Math.max(160, Math.round(length * 0.35));
    const palette = DISCO_PALETTES[discoPaletteIndex];

    el.style.setProperty('--beam-c1', palette.c1);
    el.style.setProperty('--beam-c2', palette.c2);
    el.style.setProperty('--dash-start', `${length + beamLen}`);
    el.style.setProperty('--dash-end', `${-beamLen}`);
    el.style.setProperty('--chase-duration', `${(durationMs / 1000).toFixed(2)}s`);

    const tracks = el.querySelectorAll('.laser-track');
    tracks.forEach(track => {
      track.style.strokeDasharray = `${beamLen} ${length * 2}`;
    });

    // Reset and trigger CSS animation
    el.classList.remove('is-chasing', 'is-chasing-rev');
    void el.offsetWidth; // force reflow for instantaneous re-trigger
    el.classList.add('is-active');
    el.classList.add(reverse ? 'is-chasing-rev' : 'is-chasing');

    clearTimeout(el._laserTimer);
    el._laserTimer = setTimeout(() => {
      el.classList.remove('is-chasing', 'is-chasing-rev', 'is-active');
    }, durationMs + 40);
  }

  function fireDiscoBurst(intensity = 1.0) {
    if (!isLaserSyncEnabled || !isLoungeOpen) return;

    // Advance to next disco palette for sensational color changes on each beat
    discoPaletteIndex = (discoPaletteIndex + 1) % DISCO_PALETTES.length;
    discoPatternStep = (discoPatternStep + 1) % 4;

    if (intensity > 1.35) {
      // MASSIVE BEAT DROP: All 4 corners rush simultaneously!
      triggerLaserBeam('left', false, 480);
      triggerLaserBeam('ceiling', false, 540);
      triggerLaserBeam('right', false, 460);
      triggerLaserBeam('floor', false, 560);
      return;
    }

    switch (discoPatternStep) {
      case 0:
        // Pattern A: Left Arch shoots up -> Ceiling Cove cascades across
        triggerLaserBeam('left', false, 460);
        setTimeout(() => triggerLaserBeam('ceiling', false, 500), 160);
        break;
      case 1:
        // Pattern B: Floor crevice sweeps -> Shoots up Right Shelf
        triggerLaserBeam('floor', false, 500);
        setTimeout(() => triggerLaserBeam('right', true, 440), 160);
        break;
      case 2:
        // Pattern C: Dual Vertical Surge (Left & Right simultaneously)
        triggerLaserBeam('left', false, 450);
        triggerLaserBeam('right', false, 450);
        break;
      case 3:
      default:
        // Pattern D: Ceiling Cove Laser Sweep + Floor Crevice Flash
        triggerLaserBeam('ceiling', false, 480);
        triggerLaserBeam('floor', false, 520);
        break;
    }
  }

  function renderDynamicYouTubeAmbient(now) {
    if (!ambilightCtx || !ambilightCanvas) return;
    const w = ambilightCanvas.width;
    const h = ambilightCanvas.height;

    const t = now * 0.001;
    const p = ytAmbientPalette;

    // Organic floating light anchors with sinusoidal cinematic motion
    const x1 = w * (0.30 + 0.16 * Math.sin(t * 0.70));
    const y1 = h * (0.45 + 0.18 * Math.cos(t * 0.50));
    const r1 = w * (0.55 + 0.10 * Math.sin(t * 0.90));

    const x2 = w * (0.70 - 0.16 * Math.cos(t * 0.75));
    const y2 = h * (0.45 + 0.18 * Math.sin(t * 0.60));
    const r2 = w * (0.55 + 0.10 * Math.cos(t * 0.85));

    const x3 = w * (0.50 + 0.15 * Math.sin(t * 0.45));
    const y3 = h * (0.22 + 0.10 * Math.cos(t * 0.65));
    const r3 = w * 0.48;

    ambilightCtx.clearRect(0, 0, w, h);

    // Anchor 1: Left Wall Glow
    const g1 = ambilightCtx.createRadialGradient(x1, y1, 0, x1, y1, r1);
    g1.addColorStop(0, p.color1);
    g1.addColorStop(1, 'rgba(0,0,0,0)');
    ambilightCtx.fillStyle = g1;
    ambilightCtx.fillRect(0, 0, w, h);

    // Anchor 2: Right Wall Glow (Screen blend)
    ambilightCtx.globalCompositeOperation = 'screen';
    const g2 = ambilightCtx.createRadialGradient(x2, y2, 0, x2, y2, r2);
    g2.addColorStop(0, p.color2);
    g2.addColorStop(1, 'rgba(0,0,0,0)');
    ambilightCtx.fillStyle = g2;
    ambilightCtx.fillRect(0, 0, w, h);

    // Anchor 3: Cove Ceiling Accent
    const g3 = ambilightCtx.createRadialGradient(x3, y3, 0, x3, y3, r3);
    g3.addColorStop(0, p.color3);
    g3.addColorStop(1, 'rgba(0,0,0,0)');
    ambilightCtx.fillStyle = g3;
    ambilightCtx.fillRect(0, 0, w, h);
    ambilightCtx.globalCompositeOperation = 'source-over';

    // Cinematic breathing bloom
    const breathe = 1.15 + 0.20 * Math.sin(t * 1.30);
    const scale = 1.02 + 0.03 * Math.cos(t * 0.90);
    ambilightCanvas.style.filter = `blur(54px) saturate(240%) brightness(${breathe.toFixed(2)})`;
    ambilightCanvas.style.transform = `scale(${scale.toFixed(3)})`;
    ambilightCanvas.classList.add('is-active');

    // Disco Architectural Lasers: Rhythmic Musical Drops & Beat Chase Sync (YouTube)
    if (isLaserSyncEnabled && isYtPlaying) {
      const nowMs = performance.now();
      if (nowMs - lastLaserTriggerTime > 900) {
        // Multi-frequency harmonic oscillator simulating live musical kicks & hook drops
        const beatOsc = Math.sin(nowMs * 0.0052) * 0.6 + Math.cos(nowMs * 0.0026) * 0.4;
        if (beatOsc > 0.40) {
          lastLaserTriggerTime = nowMs;
          fireDiscoBurst(beatOsc > 0.72 ? 1.45 : 1.0);
        }
      }
    }
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
    const ytPlayer = document.getElementById('lounge-youtube-player');
    const isYouTube = currentMedia && (currentMedia.type === 'youtube' || !!currentMedia.youtubeId);
    if (isYouTube && ytPlayer && ytPlayer.contentWindow) {
      isYtPlaying = !isYtPlaying;
      const cmd = isYtPlaying ? 'playVideo' : 'pauseVideo';
      ytPlayer.contentWindow.postMessage(JSON.stringify({ event: 'command', func: cmd, args: [] }), '*');
      updatePlayPauseButton(isYtPlaying);
      if (isYtPlaying) {
        showControlsHud();
        startLoungeRenderLoop();
      } else {
        Object.values(laserCorners).forEach(el => el && el.classList.remove('is-chasing', 'is-chasing-rev', 'is-active'));
        if (ambilightCanvas) {
          ambilightCanvas.style.filter = 'blur(60px) saturate(180%) brightness(0.70)';
        }
      }
      return;
    }
    if (!videoEl) return;
    if (videoEl.paused) {
      setupDolbyAudioDSP();
      videoEl.play();
      updatePlayPauseButton(true);
    } else {
      videoEl.pause();
      updatePlayPauseButton(false);
      Object.values(laserCorners).forEach(el => el && el.classList.remove('is-chasing', 'is-chasing-rev', 'is-active'));
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

  // --- 5. REAL-TIME AMBILIGHT ENGINE (MP4 + YOUTUBE) ---
  function startLoungeRenderLoop() {
    if (renderRafId) cancelAnimationFrame(renderRafId);

    // Initialize canvas
    if (ambilightCanvas && !ambilightCtx) {
      ambilightCtx = ambilightCanvas.getContext('2d', { willReadFrequently: true });
    }

    if (ambilightCanvas) ambilightCanvas.classList.add('is-active');

    let lastDraw = 0;

    function renderLoop(now) {
      if (!isLoungeOpen) return;

      // Throttle canvas processing to 30fps on mobile to preserve 60fps UI butter
      if (now - lastDraw > 32) {
        lastDraw = now;

        const isYouTube = currentMedia && (currentMedia.type === 'youtube' || !!currentMedia.youtubeId);

        if (isYouTube && isYtPlaying) {
          // A. Real-Time Intelligent Dynamic YouTube Ambient Lighting
          renderDynamicYouTubeAmbient(now);
        } else if (videoEl && !videoEl.paused && videoEl.readyState >= 2) {
          // B. Real-Time Adaptive Ambilight Canvas (MP4)
          if (ambilightCtx && ambilightCanvas) {
            try {
              ambilightCtx.drawImage(videoEl, 0, 0, ambilightCanvas.width, ambilightCanvas.height);
            } catch (_) {}
          }

          // C. Audio-Reactive Beat Laser Chase (MP4)
          if (analyserNode && freqByteData) {
            try {
              analyserNode.getByteFrequencyData(freqByteData);
              const bassEnergy = (freqByteData[0] + freqByteData[1] + freqByteData[2] + freqByteData[3]) / 4;
              const snareEnergy = (freqByteData[8] + freqByteData[9]) / 2;
              const beatEnergy = bassEnergy * 0.75 + snareEnergy * 0.25;

              // Dynamic Audio Pulse for Ambilight Canvas
              if (ambilightCanvas) {
                const scale = 1.0 + (bassEnergy / 255) * 0.14;
                const brightness = 1.1 + (bassEnergy / 255) * 0.45;
                ambilightCanvas.style.transform = `scale(${scale.toFixed(3)})`;
                ambilightCanvas.style.filter = `blur(64px) saturate(240%) brightness(${brightness.toFixed(2)})`;
              }

              // Real-time Running Beam Chase on Superb Timing / Beats
              const nowPerf = performance.now();
              if (beatEnergy > 145 && (nowPerf - lastLaserTriggerTime > 380) && isLaserSyncEnabled) {
                lastLaserTriggerTime = nowPerf;
                fireDiscoBurst(beatEnergy / 150);
              }
            } catch (_) {}
          }
        }
      }

      // 60 FPS Continuous Butter-Smooth Scrubber Sync (MP4)
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

    const floatingDock = document.getElementById('apple-floating-dock');
    if (floatingDock && isLoungeOpen) {
      floatingDock.classList.remove('hud-hidden');
    }

    if (hudInactivityTimer) clearTimeout(hudInactivityTimer);

    // Auto-hide controls after 2.6 seconds of inactivity during playback (Works for both MP4 & YouTube)
    hudInactivityTimer = setTimeout(() => {
      const isYouTube = currentMedia && (currentMedia.type === 'youtube' || !!currentMedia.youtubeId);
      const isPlaying = isYouTube ? isYtPlaying : (videoEl && !videoEl.paused);
      if (isPlaying && !isDraggingScrubber) {
        hudEl.classList.add('is-hidden');
        if (floatingDock && isLoungeOpen) {
          floatingDock.classList.add('hud-hidden');
        }
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
    hudEl = document.getElementById('lounge-glass-hud');
    centerPlayBtn = document.getElementById('lounge-play-btn');
    stepBackBtn = document.getElementById('lounge-step-back-btn');
    stepFwdBtn = document.getElementById('lounge-step-fwd-btn');
    volumeSlider = document.getElementById('lounge-volume-slider');
    timelineTrack = document.getElementById('lounge-timeline-bar-box');
    timelineFill = document.getElementById('lounge-timeline-fill');
    timelineDot = document.getElementById('lounge-timeline-dot');
    timeCountdown = document.getElementById('lounge-time-countdown');
    exitBtn = document.getElementById('nav-cinema-back-btn') || document.getElementById('cinema-nav-back-btn') || document.getElementById('lounge-exit-btn');
    searchInput = document.getElementById('aura-search-input');
    searchClearBtn = document.getElementById('aura-search-clear-btn');
    mediaGridEl = document.getElementById('aura-media-grid');
    filterChips = Array.from(document.querySelectorAll('.aura-filter-chip'));
    quickCinemaBtn = document.getElementById('aura-quick-cinema-btn');
    audioEqBtn = document.getElementById('lounge-eq-pill-btn');
    audioEqLabel = document.getElementById('lounge-eq-pill-label');

    // Disco Architectural 4-Corner Running Beam Lasers
    initArchitecturalLasers();

    // Canvas internal buffer resolutions (optimized for 60fps blur)
    if (ambilightCanvas) {
      ambilightCanvas.width = 64;
      ambilightCanvas.height = 36;
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

    // Video Source Switcher (Added Videos vs YouTube)
    const sourceSwitcherEl = document.getElementById('aura-source-switcher');
    const sourceToggleBtn = document.getElementById('aura-source-toggle-btn');
    const sourceOptLibrary = document.getElementById('source-opt-library');
    const sourceOptYoutube = document.getElementById('source-opt-youtube');

    if (sourceToggleBtn && sourceSwitcherEl) {
      sourceToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sourceSwitcherEl.classList.toggle('is-open');
      });

      document.addEventListener('click', (e) => {
        if (sourceSwitcherEl && !sourceSwitcherEl.contains(e.target)) {
          sourceSwitcherEl.classList.remove('is-open');
        }
      });
    }

    if (sourceOptLibrary) {
      sourceOptLibrary.addEventListener('click', () => {
        setVideoSource('library');
      });
    }

    if (sourceOptYoutube) {
      sourceOptYoutube.addEventListener('click', () => {
        setVideoSource('youtube');
      });
    }

    // YouTube Search & Category Chips
    const ytSearchInput = document.getElementById('aura-yt-search-input');
    const ytSearchClearBtn = document.getElementById('aura-yt-search-clear-btn');
    const ytChips = Array.from(document.querySelectorAll('#aura-yt-chips .yt-chip'));

    if (ytSearchInput) {
      ytSearchInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (ytSearchClearBtn) {
          ytSearchClearBtn.style.display = val.length > 0 ? 'block' : 'none';
        }

        // Direct YouTube link pasted? Play immediately in cinema lounge!
        const pastedId = extractYouTubeId(val);
        if (pastedId) {
          openCurvedCinemaLounge({
            id: 'yt-' + pastedId,
            youtubeId: pastedId,
            type: 'youtube',
            title: 'YouTube Stream',
            sub: 'Direct Playback',
            poster: `https://i.ytimg.com/vi/${pastedId}/hqdefault.jpg`,
            duration: 'Live / HD'
          });
          return;
        }

        if (ytDebounceTimer) clearTimeout(ytDebounceTimer);
        ytDebounceTimer = setTimeout(() => {
          ytPage = 1;
          loadYouTubeFeed(val || 'all');
        }, 300);
      });

      ytSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const val = ytSearchInput.value.trim();
          const pastedId = extractYouTubeId(val);
          if (pastedId) {
            openCurvedCinemaLounge({
              id: 'yt-' + pastedId,
              youtubeId: pastedId,
              type: 'youtube',
              title: 'YouTube Stream',
              sub: 'Direct Playback',
              poster: `https://i.ytimg.com/vi/${pastedId}/hqdefault.jpg`,
              duration: 'Live / HD'
            });
          } else {
            ytPage = 1;
            loadYouTubeFeed(val || 'all');
          }
        }
      });
    }

    if (ytSearchClearBtn) {
      ytSearchClearBtn.addEventListener('click', () => {
        if (ytSearchInput) ytSearchInput.value = '';
        ytSearchClearBtn.style.display = 'none';
        ytPage = 1;
        loadYouTubeFeed('all');
      });
    }

    ytChips.forEach(chip => {
      chip.addEventListener('click', () => {
        ytChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const q = chip.getAttribute('data-query') || 'all';
        ytPage = 1;
        if (ytSearchInput) {
          ytSearchInput.value = '';
          if (ytSearchClearBtn) ytSearchClearBtn.style.display = 'none';
        }
        loadYouTubeFeed(q);
      });
    });

    // YouTube Infinite Scroll on Library container (Throttled, smooth appending, zero stutter)
    if (libraryEl) {
      libraryEl.addEventListener('scroll', () => {
        if (currentSource !== 'youtube' || ytIsLoading) return;
        if (ytScrollThrottleTimer) return;

        ytScrollThrottleTimer = setTimeout(() => {
          ytScrollThrottleTimer = null;
          if (currentSource !== 'youtube' || ytIsLoading) return;

          const scrollDistanceToBottom = libraryEl.scrollHeight - (libraryEl.scrollTop + libraryEl.clientHeight);
          if (scrollDistanceToBottom < 480) {
            ytPage++;
            loadYouTubeFeed(currentYtQuery, true);
          }
        }, 180);
      });
    }

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
      videoEl.addEventListener('pause', () => {
        updatePlayPauseButton(false);
        showControlsHud();
      });
      videoEl.addEventListener('ended', () => {
        updatePlayPauseButton(false);
        showControlsHud();
      });
    }

    // Exit Buttons (Both Top-Right HUD button and Floating Nav button)
    const loungeTopBackBtn = document.getElementById('lounge-top-back-btn');
    if (loungeTopBackBtn) {
      loungeTopBackBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeCurvedCinemaLounge();
      });
    }

    if (exitBtn) {
      exitBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeCurvedCinemaLounge();
      });
    }

    // Lounge Stage Tap: Show / Toggle HUD
    if (loungeEl) {
      loungeEl.addEventListener('pointerdown', (e) => {
        if (e.target.closest('.lounge-glass-hud > *') || e.target.closest('#apple-floating-dock') || e.target.closest('.cinema-floating-dock') || e.target.closest('.lounge-exit-btn') || e.target.closest('#nav-cinema-back-btn') || e.target.closest('#lounge-top-back-btn')) {
          return;
        }
        if (hudEl) {
          if (hudEl.classList.contains('is-hidden')) {
            showControlsHud();
          } else {
            hudEl.classList.add('is-hidden');
            const floatingDock = document.getElementById('apple-floating-dock');
            if (floatingDock && isLoungeOpen) floatingDock.classList.add('hud-hidden');
            if (hudInactivityTimer) clearTimeout(hudInactivityTimer);
          }
        }
      });

      loungeEl.addEventListener('mousemove', showControlsHud);
    }

    // YouTube IFrame State Synchronization (Auto-sync play/pause & trigger HUD auto-hide)
    window.addEventListener('message', (event) => {
      if (!event.data || typeof event.data !== 'string') return;
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'onStateChange') {
          // 1: PLAYING, 2: PAUSED, 0: ENDED
          if (data.info === 1) {
            isYtPlaying = true;
            updatePlayPauseButton(true);
            showControlsHud();
            startLoungeRenderLoop();
          } else if (data.info === 2 || data.info === 0) {
            isYtPlaying = false;
            updatePlayPauseButton(false);
            showControlsHud();
            Object.values(laserCorners).forEach(el => el && el.classList.remove('is-chasing', 'is-chasing-rev', 'is-active'));
            if (ambilightCanvas) {
              ambilightCanvas.style.filter = 'blur(60px) saturate(180%) brightness(0.70)';
            }
          }
        }
      } catch (_) {}
    });

    // Fit YouTube player on screen resize & orientation change
    window.addEventListener('resize', fitYouTubePlayerToScreen);
    window.addEventListener('orientationchange', () => {
      setTimeout(fitYouTubePlayerToScreen, 100);
      setTimeout(fitYouTubePlayerToScreen, 300);
    });

    // ResizeObserver on screen frame for continuous edge-to-edge covering
    const screenFrameEl = document.querySelector('.lounge-screen-frame');
    if (screenFrameEl && window.ResizeObserver) {
      const ro = new ResizeObserver(() => {
        fitYouTubePlayerToScreen();
      });
      ro.observe(screenFrameEl);
    }

    // Render initial grid
    renderMediaGrid();
  }

  // Tab switch hook: trigger signature intro on first visit
  let hasVisitedCinema = false;
  window.onExxclusiveTabActivated = function () {
    if (currentSource === 'youtube') {
      if (ytFeedVideos.length === 0) {
        loadYouTubeFeed(currentYtQuery || 'all');
      }
    } else {
      renderMediaGrid();
    }
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
    getMedia: () => EXXCLUSIVE_MEDIA,
    fireDiscoBurst: fireDiscoBurst,
    toggleLasers: toggleDiscoLaserSync
  };

  window.vievDiscoLasers = {
    fireBurst: fireDiscoBurst,
    toggle: toggleDiscoLaserSync,
    triggerCorner: triggerLaserBeam
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

