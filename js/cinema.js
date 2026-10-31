/* =========================================================
   REAL YOUTUBE IN-APP CINEMA & FEED ENGINE (DIGI OS 2.0)
   Full YouTube Experience • Real Search & Feeds • Zero Errors
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const launcherView = document.getElementById('cinema-launcher-view');
  const playerView = document.getElementById('cinema-player-view');
  const launchMainBtn = document.getElementById('cinema-launch-yt-btn');
  const backBtn = document.getElementById('cinema-player-back-btn');
  const iframe = document.getElementById('cinema-inapp-iframe');
  const theaterStage = document.getElementById('cinema-theater-stage');
  const theaterTitle = document.getElementById('cinema-theater-title');
  const theaterChannel = document.getElementById('cinema-theater-channel');
  const theaterExtLink = document.getElementById('cinema-theater-ext-link');
  const titleEl = document.getElementById('cinema-now-playing-title');
  const urlInput = document.getElementById('cinema-inapp-url-input');
  const playCustomBtn = document.getElementById('cinema-inapp-play-custom-btn');
  const shortcutCards = document.querySelectorAll('.cinema-shortcut-card');
  const categoryChips = document.querySelectorAll('#cinema-category-chips .cinema-inapp-chip');
  const feedGrid = document.getElementById('cinema-video-feed-grid');
  const feedHeading = document.getElementById('cinema-feed-heading');
  const feedStatus = document.getElementById('cinema-feed-status');
  const appHeader = document.querySelector('.yt-mobile-app-header');
  const feedSection = document.querySelector('.cinema-feed-section') || document.getElementById('cinema-video-feed-section');

  if (!launcherView || !playerView) return;

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

  // =========================================================
  // INTELLIGENT SMART AMBILIGHT ENGINE 2.1
  // Option 1: Real-Time Dynamic Multi-Zone Color Mesh (Halo, Flanks, Floor)
  // Option 5: Silky 1.2s Double-Buffered Cross-Dissolve Morphing & Living Pulse
  // =========================================================
  const ambContainer = document.getElementById('cinema-art-glow');
  const ambLayerA = document.getElementById('cinema-amb-layer-a');
  const ambLayerB = document.getElementById('cinema-amb-layer-b');
  const ambImgA = document.getElementById('cinema-ambilight-canvas');
  const ambImgB = document.getElementById('cinema-ambilight-canvas-b');
  let currentAmbBuffer = 'a';
  let offscreenCanvas = null;
  let offscreenCtx = null;

  try {
    offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = 32;
    offscreenCanvas.height = 18;
    offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });
  } catch (_) {}

  function setAmbilightPlaybackState(isPlaying) {
    if (!ambContainer) return;
    if (isPlaying) {
      ambContainer.classList.add('is-playing');
      ambContainer.classList.remove('is-paused');
    } else {
      ambContainer.classList.add('is-paused');
      ambContainer.classList.remove('is-playing');
    }
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [h * 360, s, l];
  }

  function hslToRgb(h, s, l) {
    h = (h % 360) / 360;
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  function boostColorVibrance(r, g, b) {
    const [h, s, l] = rgbToHsl(r, g, b);
    const boostedS = Math.min(1, Math.max(0.60, s * 1.55));
    const boostedL = Math.min(0.68, Math.max(0.38, l * 1.08));
    return hslToRgb(h, boostedS, boostedL);
  }

  function sampleRegionRgb(ctx, startX, startY, width, height) {
    try {
      const imgData = ctx.getImageData(startX, startY, width, height).data;
      let totalR = 0, totalG = 0, totalB = 0, count = 0;
      for (let i = 0; i < imgData.length; i += 4) {
        totalR += imgData[i];
        totalG += imgData[i + 1];
        totalB += imgData[i + 2];
        count++;
      }
      if (count === 0) return [236, 72, 153];
      return boostColorVibrance(
        Math.round(totalR / count),
        Math.round(totalG / count),
        Math.round(totalB / count)
      );
    } catch (_) {
      return [236, 72, 153];
    }
  }

  function generateHarmonicPalette(seedStr) {
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = (hash << 5) - hash + seedStr.charCodeAt(i);
      hash |= 0;
    }
    const baseHue = Math.abs(hash) % 360;
    const isRomantic = /kamleya|haaniyaan|saiyaan|arijit|love|romantic|shreya|heeriye/i.test(seedStr);

    const primaryHue = isRomantic ? 335 : baseHue;
    const secondaryHue = isRomantic ? 275 : (baseHue + 45) % 360;
    const accentHue = isRomantic ? 355 : (baseHue + 180) % 360;
    const floorHue = isRomantic ? 340 : (baseHue + 25) % 360;

    return {
      primary: hslToRgb(primaryHue, 0.85, 0.52),
      secondary: hslToRgb(secondaryHue, 0.80, 0.50),
      accent: hslToRgb(accentHue, 0.90, 0.55),
      floor: hslToRgb(floorHue, 0.85, 0.48)
    };
  }

  function applyAmbilightMultiZoneVars(palette) {
    if (!ambContainer) return;
    const p = palette.primary;
    const s = palette.secondary;
    const a = palette.accent;
    const f = palette.floor;

    ambContainer.style.setProperty('--amb-primary', `rgba(${p[0]}, ${p[1]}, ${p[2]}, 0.72)`);
    ambContainer.style.setProperty('--amb-secondary', `rgba(${s[0]}, ${s[1]}, ${s[2]}, 0.65)`);
    ambContainer.style.setProperty('--amb-accent', `rgba(${a[0]}, ${a[1]}, ${a[2]}, 0.68)`);
    ambContainer.style.setProperty('--amb-floor', `rgba(${f[0]}, ${f[1]}, ${f[2]}, 0.55)`);
  }

  function updateSmartAmbilight(thumbUrl, videoId = '', title = '') {
    if (!ambContainer) return;

    const nextBuffer = (currentAmbBuffer === 'a') ? 'b' : 'a';
    const activeLayer = (currentAmbBuffer === 'a') ? ambLayerA : ambLayerB;
    const nextLayer = (nextBuffer === 'a') ? ambLayerA : ambLayerB;
    const nextImg = (nextBuffer === 'a') ? ambImgA : ambImgB;

    if (!nextLayer || !nextImg) {
      if (ambImgA) ambImgA.src = thumbUrl;
      return;
    }

    const seed = `${videoId} ${title}`;
    const fallbackPalette = generateHarmonicPalette(seed);

    let hasAnalyzed = false;

    function applyAndMorph(palette) {
      if (hasAnalyzed) return;
      hasAnalyzed = true;

      applyAmbilightMultiZoneVars(palette);

      // Option 5: Silky 1.2s cross-dissolve color morph
      nextLayer.classList.add('is-active');
      if (activeLayer) activeLayer.classList.remove('is-active');
      currentAmbBuffer = nextBuffer;
    }

    // Option 1: Sample real-time pixels from thumbnail via offscreen canvas
    const tempImg = new Image();
    tempImg.crossOrigin = 'anonymous';

    tempImg.onload = () => {
      nextImg.src = thumbUrl;
      try {
        if (offscreenCtx) {
          offscreenCtx.clearRect(0, 0, 32, 18);
          offscreenCtx.drawImage(tempImg, 0, 0, 32, 18);

          const topHaloRgb = sampleRegionRgb(offscreenCtx, 8, 0, 16, 6);
          const leftFlankRgb = sampleRegionRgb(offscreenCtx, 0, 4, 8, 10);
          const rightFlankRgb = sampleRegionRgb(offscreenCtx, 24, 4, 8, 10);
          const floorRgb = sampleRegionRgb(offscreenCtx, 8, 12, 16, 6);

          applyAndMorph({
            primary: topHaloRgb,
            secondary: leftFlankRgb,
            accent: rightFlankRgb,
            floor: floorRgb
          });
          return;
        }
      } catch (_) {}
      applyAndMorph(fallbackPalette);
    };

    tempImg.onerror = () => {
      nextImg.src = thumbUrl;
      applyAndMorph(fallbackPalette);
    };

    tempImg.src = thumbUrl;
  }

  const dragSurface = document.getElementById('cinema-player-drag-surface');
  const miniExpandBtn = document.getElementById('cinema-miniplayer-expand-btn');
  const miniDismissBtn = document.getElementById('cinema-miniplayer-dismiss-btn');
  const miniPlayBtn = document.getElementById('cinema-miniplayer-play-btn');
  const miniPlayIcon = document.getElementById('cinema-mini-play-icon');
  const seekRippleLeft = document.getElementById('seek-ripple-left');
  const seekRippleRight = document.getElementById('seek-ripple-right');
  const customControls = document.getElementById('cinema-custom-player-controls');
  const ctrlBackBtn = document.getElementById('cinema-ctrl-back-btn') || document.getElementById('cinema-ctrl-minimize-btn');
  const openAddModalBtn = document.getElementById('cinema-open-add-btn');
  const addModal = document.getElementById('cinema-add-modal');
  const closeAddModalBtn = document.getElementById('cinema-close-add-btn');
  const saveAddModalBtn = document.getElementById('cinema-save-add-btn');
  const newUrlInput = document.getElementById('cinema-new-url');
  const newTitleInput = document.getElementById('cinema-new-title');
  const ctrlPlayBtn = document.getElementById('cinema-ctrl-play-btn');
  const ctrlPlayIcon = document.getElementById('cinema-ctrl-play-icon');
  const ctrlMuteBtn = document.getElementById('cinema-ctrl-mute-btn');
  const ctrlVolumeIcon = document.getElementById('cinema-ctrl-volume-icon');
  const ctrlCcBtn = document.getElementById('cinema-ctrl-cc-btn');
  const ctrlSettingsBtn = document.getElementById('cinema-ctrl-settings-btn');
  const ctrlTimeDisplay = document.getElementById('cinema-ctrl-time');
  const ctrlFullscreenBtn = document.getElementById('cinema-ctrl-fullscreen-btn');
  const ctrlScrubContainer = document.getElementById('cinema-ctrl-scrub-container');
  const ctrlScrubProgress = document.getElementById('cinema-ctrl-scrub-progress');
  const ctrlScrubThumb = document.getElementById('cinema-ctrl-scrub-thumb');

  // Settings Modal Elements
  const settingsModal = document.getElementById('cinema-settings-modal');
  const settingsSheet = document.getElementById('cinema-settings-sheet');
  const settingsMainView = document.getElementById('cinema-settings-main-view');
  const settingsSpeedRow = document.getElementById('cinema-settings-speed-row');
  const settingsQualityRow = document.getElementById('cinema-settings-quality-row');
  const settingsSpeedSubmenu = document.getElementById('cinema-settings-speed-submenu');
  const settingsQualitySubmenu = document.getElementById('cinema-settings-quality-submenu');
  const speedBackBtn = document.getElementById('cinema-speed-back-btn');
  const qualityBackBtn = document.getElementById('cinema-quality-back-btn');
  const currSpeedVal = document.getElementById('cinema-curr-speed-val');
  const currQualityVal = document.getElementById('cinema-curr-quality-val');
  const artworkContainer = document.getElementById('cinema-player-artwork-container');
  const theaterYtBar = document.querySelector('.cinema-theater-yt-bar');
  const theaterAvatar = document.getElementById('cinema-theater-avatar');
  const theaterVerified = document.getElementById('cinema-theater-verified');
  const theaterSubs = document.getElementById('cinema-theater-subs');
  const theaterSubBtn = document.getElementById('cinema-theater-sub-btn');
  const theaterLikeBtn = document.getElementById('cinema-theater-like-btn');
  const theaterLikeCount = document.getElementById('cinema-theater-like-count');
  const theaterDislikeBtn = document.getElementById('cinema-theater-dislike-btn');
  const theaterShareBtn = document.getElementById('cinema-theater-share-btn');

  let currentPlayingVideoId = null;
  let currentPlayingChannel = 'YouTube';
  let currentBaseLikes = '50K';

  function syncSubscriptionUI(channel) {
    if (!theaterSubBtn) return;
    try {
      const subs = JSON.parse(localStorage.getItem('viev_subscribed_channels') || '[]');
      const isSubbed = subs.includes(channel);
      theaterSubBtn.classList.toggle('is-subscribed', isSubbed);
      theaterSubBtn.textContent = isSubbed ? 'Subscribed' : 'Subscribe';
    } catch (e) {
      theaterSubBtn.textContent = 'Subscribe';
    }
  }

  function syncLikeDislikeUI(videoId, baseLikes = '50K') {
    if (!theaterLikeBtn || !theaterDislikeBtn) return;
    try {
      const likedList = JSON.parse(localStorage.getItem('viev_liked_videos') || '[]');
      const dislikedList = JSON.parse(localStorage.getItem('viev_disliked_videos') || '[]');
      const isLiked = likedList.includes(videoId);
      const isDisliked = dislikedList.includes(videoId);

      theaterLikeBtn.classList.toggle('is-liked', isLiked);
      theaterDislikeBtn.classList.toggle('is-disliked', isDisliked);

      if (theaterLikeCount) {
        if (isLiked) {
          const match = String(baseLikes || '50K').match(/^([\d.]+)\s*([KkMmBbgG]?)$/);
          if (match) {
            const val = parseFloat(match[1]) || 50;
            const unit = match[2] || 'K';
            theaterLikeCount.textContent = `${(val + 1).toFixed(0)}${unit}`;
          } else {
            theaterLikeCount.textContent = '51K';
          }
        } else {
          theaterLikeCount.textContent = baseLikes;
        }
      }
    } catch (e) {}
  }

  // Subscribe button toggle
  if (theaterSubBtn) {
    theaterSubBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!currentPlayingChannel) return;
      if (typeof window.triggerHaptic === 'function') window.triggerHaptic('medium');
      try {
        let subs = JSON.parse(localStorage.getItem('viev_subscribed_channels') || '[]');
        if (subs.includes(currentPlayingChannel)) {
          subs = subs.filter(c => c !== currentPlayingChannel);
        } else {
          subs.push(currentPlayingChannel);
        }
        localStorage.setItem('viev_subscribed_channels', JSON.stringify(subs));
        syncSubscriptionUI(currentPlayingChannel);
      } catch (e) {}
    });
  }

  // Like button toggle
  if (theaterLikeBtn) {
    theaterLikeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!currentPlayingVideoId) return;
      if (typeof window.triggerHaptic === 'function') window.triggerHaptic('medium');
      try {
        let likedList = JSON.parse(localStorage.getItem('viev_liked_videos') || '[]');
        let dislikedList = JSON.parse(localStorage.getItem('viev_disliked_videos') || '[]');

        if (likedList.includes(currentPlayingVideoId)) {
          likedList = likedList.filter(id => id !== currentPlayingVideoId);
        } else {
          likedList.push(currentPlayingVideoId);
          dislikedList = dislikedList.filter(id => id !== currentPlayingVideoId);
        }

        localStorage.setItem('viev_liked_videos', JSON.stringify(likedList));
        localStorage.setItem('viev_disliked_videos', JSON.stringify(dislikedList));
        syncLikeDislikeUI(currentPlayingVideoId, currentBaseLikes);
      } catch (e) {}
    });
  }

  // Dislike button toggle
  if (theaterDislikeBtn) {
    theaterDislikeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!currentPlayingVideoId) return;
      if (typeof window.triggerHaptic === 'function') window.triggerHaptic('light');
      try {
        let likedList = JSON.parse(localStorage.getItem('viev_liked_videos') || '[]');
        let dislikedList = JSON.parse(localStorage.getItem('viev_disliked_videos') || '[]');

        if (dislikedList.includes(currentPlayingVideoId)) {
          dislikedList = dislikedList.filter(id => id !== currentPlayingVideoId);
        } else {
          dislikedList.push(currentPlayingVideoId);
          likedList = likedList.filter(id => id !== currentPlayingVideoId);
        }

        localStorage.setItem('viev_liked_videos', JSON.stringify(likedList));
        localStorage.setItem('viev_disliked_videos', JSON.stringify(dislikedList));
        syncLikeDislikeUI(currentPlayingVideoId, currentBaseLikes);
      } catch (e) {}
    });
  }

  // Share button (Copies clean YouTube link to clipboard)
  if (theaterShareBtn) {
    theaterShareBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (!currentPlayingVideoId) return;
      if (typeof window.triggerHaptic === 'function') window.triggerHaptic('medium');
      const shareUrl = `https://www.youtube.com/watch?v=${currentPlayingVideoId}`;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(shareUrl);
        } else {
          const ta = document.createElement('textarea');
          ta.value = shareUrl;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        }
        theaterShareBtn.classList.add('copied');
        theaterShareBtn.title = 'Link Copied! ✓';
        setTimeout(() => {
          theaterShareBtn.classList.remove('copied');
          theaterShareBtn.title = 'Share video';
        }, 2200);
      } catch (err) {
        window.open(shareUrl, '_blank');
      }
    });
  }

  // =========================================================
  // CUSTOM VIDEO PLAYER CONTROLS & MINI-PLAYER ENGINE
  // - Tap Play/Pause button ONLY toggles playback
  // - Tap anywhere else on video fades out / fades in controls
  // - No title/avatar on video (already below)
  // - No link or YouTube logo at bottom; duration & scrubber at bottom
  // - Settings icon opens Playback Speed & Quality (Image 5)
  // - Clean Miniplayer: ZERO clutter, only center enlarge & top-right cross
  // =========================================================
  let isVideoPlaying = true;
  let isVideoMuted = false;
  let isCCActive = false;
  let currentPlaybackRate = 1;
  let currentQuality = 'auto';
  let videoCurrentSeconds = 1;
  let videoTotalSeconds = 649; // 10:49 default fallback
  let controlsAutoHideTimer = null;
  let playbackTickerInterval = null;

  function parseDurationToSeconds(str) {
    if (!str || typeof str !== 'string') return 649;
    const clean = str.replace(/[^\d:]/g, '').trim();
    if (!clean) return 649;
    const parts = clean.split(':').map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return parts[0] * 60 + parts[1];
    }
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 649;
  }

  function formatTimeCode(sec) {
    const s = Math.floor(sec || 0);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${rem < 10 ? '0' : ''}${rem}`;
  }

  function updateScrubberUI() {
    if (!ctrlScrubProgress || !ctrlScrubThumb) return;
    const total = Math.max(videoTotalSeconds, 1);
    const pct = Math.min(Math.max((videoCurrentSeconds / total) * 100, 0), 100);
    ctrlScrubProgress.style.width = `${pct}%`;
    ctrlScrubThumb.style.left = `${pct}%`;
    if (ctrlTimeDisplay) {
      ctrlTimeDisplay.textContent = `${formatTimeCode(videoCurrentSeconds)} / ${formatTimeCode(videoTotalSeconds)}`;
    }

    if (window.vievAirCast && typeof window.vievAirCast.notifyPlaybackState === 'function') {
      window.vievAirCast.notifyPlaybackState({
        id: currentPlayingVideoId,
        title: (theaterTitle && theaterTitle.textContent) || 'YouTube Video',
        channel: (theaterChannel && theaterChannel.textContent) || 'YouTube',
        avatar: (theaterAvatar && theaterAvatar.src) || '',
        currentTime: videoCurrentSeconds,
        duration: videoTotalSeconds,
        isPlaying: isVideoPlaying
      });
    }
  }

  function sendIframeCommand(func, args) {
    if (!iframe || !iframe.contentWindow) return;
    try {
      const msg = {
        event: 'command',
        func: func,
        args: Array.isArray(args) ? args : (args !== undefined && args !== '' ? [args] : [])
      };
      iframe.contentWindow.postMessage(JSON.stringify(msg), '*');
    } catch (_) {}
  }

  function handleVideoPlaybackError(videoId, errCode) {
    console.warn(`[Cinema] YouTube embed error ${errCode} for video ${videoId}`);
    let banner = document.getElementById('cinema-player-err-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'cinema-player-err-banner';
      banner.className = 'cinema-player-err-banner';
      const stage = document.getElementById('cinema-video-card-stage');
      if (stage) stage.appendChild(banner);
    }

    banner.innerHTML = `
      <div class="cinema-err-content">
        <div class="cinema-err-badge">YouTube Notice</div>
        <h4 class="cinema-err-title">Playback Restricted by Creator</h4>
        <p class="cinema-err-desc">YouTube restricts 3rd-party website embedding for this specific video. You can open direct playback or skip to the next song.</p>
        <div class="cinema-err-actions">
          <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" rel="noopener noreferrer" class="cinema-err-btn cinema-err-direct">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#ff0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            Play in YouTube
          </a>
          <button type="button" class="cinema-err-btn cinema-err-next" id="cinema-err-skip-btn">
            ⏭ Next Song
          </button>
        </div>
      </div>
    `;
    banner.style.display = 'flex';

    const skipBtn = document.getElementById('cinema-err-skip-btn');
    if (skipBtn) {
      skipBtn.addEventListener('click', (e) => {
        e.preventDefault();
        playNextRecommendedVideo();
      });
    }
  }

  function dismissPlaybackErrorBanner() {
    const banner = document.getElementById('cinema-player-err-banner');
    if (banner) banner.style.display = 'none';
  }

  function playNextRecommendedVideo() {
    dismissPlaybackErrorBanner();
    const catalog = (window.CURRENT_CINEMA_FEED && window.CURRENT_CINEMA_FEED.length > 0)
      ? window.CURRENT_CINEMA_FEED
      : (window.DIGI_YOUTUBE_FEED || window.VIRAT_YOUTUBE_FEED || []);
    if (!catalog || catalog.length === 0) return;

    let currentIdx = catalog.findIndex(v => v.id === currentPlayingVideoId);
    let nextIdx = (currentIdx + 1) % catalog.length;
    const nextVideo = catalog[nextIdx];
    if (nextVideo && nextVideo.id) {
      playVideoInTheater(
        nextVideo.id,
        nextVideo.title,
        nextVideo.channel,
        nextVideo.thumb,
        nextVideo.avatar,
        nextVideo.subs,
        nextVideo.isVerified,
        nextVideo.likes,
        nextVideo.duration
      );
    }
  }

  // Real YouTube Iframe API Incoming Event Listener
  window.addEventListener('message', (event) => {
    if (!iframe || !iframe.contentWindow) return;
    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      if (!data) return;

      // Detect YouTube embed playback error codes (150, 101, 100, 2, 5)
      if (data.event === 'onError' || (typeof data.info === 'number' && [2, 5, 100, 101, 150].includes(data.info))) {
        handleVideoPlaybackError(currentPlayingVideoId, data.info || data.data || 150);
        return;
      }

      if ((data.event === 'infoDelivery' || data.event === 'initialDelivery') && data.info) {
        if (typeof data.info.duration === 'number' && data.info.duration > 0) {
          videoTotalSeconds = Math.round(data.info.duration);
        }
        if (typeof data.info.currentTime === 'number') {
          videoCurrentSeconds = Math.round(data.info.currentTime);
          updateScrubberUI();
        }
        if (typeof data.info.playerState === 'number') {
          handlePlayerStateChange(data.info.playerState);
          if (data.info.playerState === 1) {
            dismissPlaybackErrorBanner();
          }
        }
      } else if (data.event === 'onStateChange' && typeof data.info === 'number') {
        handlePlayerStateChange(data.info);
        if (data.info === 1) {
          dismissPlaybackErrorBanner();
        }
      }
    } catch (_) {}
  });

  function updatePlayPauseIcons(isPlaying) {
    if (ctrlPlayIcon) {
      ctrlPlayIcon.innerHTML = isPlaying
        ? '<rect x="6" y="5" width="3.5" height="14" rx="1"></rect><rect x="14.5" y="5" width="3.5" height="14" rx="1"></rect>'
        : '<polygon points="6 4 20 12 6 20"></polygon>';
    }
    if (miniPlayIcon) {
      miniPlayIcon.innerHTML = isPlaying
        ? '<rect x="6" y="4" width="4" height="16" rx="1"></rect><rect x="14" y="4" width="4" height="16" rx="1"></rect>'
        : '<polygon points="6 4 20 12 6 20"></polygon>';
    }
    if (ctrlPlayBtn) ctrlPlayBtn.classList.toggle('is-paused', !isPlaying);
  }

  function handlePlayerStateChange(state) {
    // 1: PLAYING, 2: PAUSED, 0: ENDED, 3: BUFFERING
    if (state === 1) {
      isVideoPlaying = true;
      updatePlayPauseIcons(true);
      setAmbilightPlaybackState(true);
      startPlaybackTicker();
      scheduleControlsAutoHide();
    } else if (state === 2) {
      isVideoPlaying = false;
      updatePlayPauseIcons(false);
      setAmbilightPlaybackState(false);
      stopPlaybackTicker();
      showCustomControls();
    } else if (state === 0) {
      isVideoPlaying = false;
      videoCurrentSeconds = 0;
      updateScrubberUI();
      updatePlayPauseIcons(false);
      setAmbilightPlaybackState(false);
      stopPlaybackTicker();
      showCustomControls();
    }
  }

  function setVideoPlaybackState(play) {
    isVideoPlaying = play;
    updatePlayPauseIcons(play);
    setAmbilightPlaybackState(play);
    if (play) {
      sendIframeCommand('playVideo');
      startPlaybackTicker();
      scheduleControlsAutoHide();
    } else {
      sendIframeCommand('pauseVideo');
      stopPlaybackTicker();
      showCustomControls();
      clearTimeout(controlsAutoHideTimer);
    }

    if (window.vievAirCast && typeof window.vievAirCast.notifyPlaybackState === 'function') {
      window.vievAirCast.notifyPlaybackState({
        id: currentPlayingVideoId,
        title: (theaterTitle && theaterTitle.textContent) || 'YouTube Video',
        channel: (theaterChannel && theaterChannel.textContent) || 'YouTube',
        avatar: (theaterAvatar && theaterAvatar.src) || '',
        currentTime: videoCurrentSeconds,
        duration: videoTotalSeconds,
        isPlaying: play
      });
    }
  }

  function togglePlayPause() {
    setVideoPlaybackState(!isVideoPlaying);
  }

  function seekVideoBy(deltaSeconds) {
    videoCurrentSeconds = Math.max(0, Math.min(videoTotalSeconds, videoCurrentSeconds + deltaSeconds));
    updateScrubberUI();
    sendIframeCommand('seekTo', [videoCurrentSeconds, true]);
    if (typeof window.triggerHaptic === 'function') window.triggerHaptic('medium');
    if (isVideoPlaying) {
      scheduleControlsAutoHide();
    }
    if (window.vievAirCast && typeof window.vievAirCast.notifyPlaybackState === 'function' && currentPlayingVideoId) {
      window.vievAirCast.notifyPlaybackState({
        id: currentPlayingVideoId,
        title: (theaterTitle && theaterTitle.textContent) || 'YouTube Video',
        channel: (theaterChannel && theaterChannel.textContent) || 'YouTube',
        avatar: (theaterAvatar && theaterAvatar.src) || '',
        currentTime: videoCurrentSeconds,
        duration: videoTotalSeconds,
        isPlaying: isVideoPlaying
      });
    }
  }

  let seekRippleTimerLeft = null;
  let seekRippleTimerRight = null;

  function triggerSeekRipple(side, seconds = 10) {
    const el = side === 'left' ? seekRippleLeft : seekRippleRight;
    if (!el) return;

    el.classList.remove('is-active');
    void el.offsetWidth;
    el.classList.add('is-active');

    if (side === 'left') {
      clearTimeout(seekRippleTimerLeft);
      seekRippleTimerLeft = setTimeout(() => {
        el.classList.remove('is-active');
      }, 700);
    } else {
      clearTimeout(seekRippleTimerRight);
      seekRippleTimerRight = setTimeout(() => {
        el.classList.remove('is-active');
      }, 700);
    }
  }

  let lastAirCastTickSeconds = 0;
  function startPlaybackTicker() {
    stopPlaybackTicker();
    playbackTickerInterval = setInterval(() => {
      if (isVideoPlaying) {
        videoCurrentSeconds += 1;
        if (videoCurrentSeconds > videoTotalSeconds) {
          videoCurrentSeconds = videoTotalSeconds;
        }
        updateScrubberUI();

        // Sync with AirCast companion every 2 seconds
        if (window.vievAirCast && typeof window.vievAirCast.notifyPlaybackState === 'function' && currentPlayingVideoId) {
          if (Math.abs(videoCurrentSeconds - lastAirCastTickSeconds) >= 2) {
            lastAirCastTickSeconds = videoCurrentSeconds;
            window.vievAirCast.notifyPlaybackState({
              id: currentPlayingVideoId,
              title: (theaterTitle && theaterTitle.textContent) || 'YouTube Video',
              channel: (theaterChannel && theaterChannel.textContent) || 'YouTube',
              avatar: (theaterAvatar && theaterAvatar.src) || '',
              currentTime: videoCurrentSeconds,
              duration: videoTotalSeconds,
              isPlaying: true
            });
          }
        }
      }
    }, 1000);
  }

  function stopPlaybackTicker() {
    if (playbackTickerInterval) {
      clearInterval(playbackTickerInterval);
      playbackTickerInterval = null;
    }
  }

  function showCustomControls() {
    if (!customControls) return;
    customControls.classList.remove('is-hidden');
    customControls.style.opacity = '';
    if (isVideoPlaying) {
      scheduleControlsAutoHide();
    } else {
      clearTimeout(controlsAutoHideTimer);
    }
  }

  function hideCustomControls() {
    if (!customControls) return;
    if (!isVideoPlaying) return; // Strict: NEVER hide controls while paused!
    if (settingsModal && settingsModal.style.display === 'flex') return;
    customControls.classList.add('is-hidden');
    clearTimeout(controlsAutoHideTimer);
  }

  function toggleCustomControls() {
    if (!customControls) return;
    if (customControls.classList.contains('is-hidden') || customControls.style.opacity === '0') {
      showCustomControls();
    } else {
      if (isVideoPlaying) hideCustomControls();
    }
  }

  function scheduleControlsAutoHide() {
    clearTimeout(controlsAutoHideTimer);
    if (!isVideoPlaying) return;
    if (settingsModal && settingsModal.style.display === 'flex') return;
    controlsAutoHideTimer = setTimeout(() => {
      if (isVideoPlaying && theaterStage && !theaterStage.classList.contains('is-miniplayer')) {
        hideCustomControls();
      }
    }, 3500);
  }

  // Desktop / Mouse tracking: moving mouse over player reveals controls and resets countdown
  if (artworkContainer) {
    artworkContainer.addEventListener('mousemove', () => {
      if (theaterStage && theaterStage.classList.contains('is-miniplayer')) return;
      showCustomControls();
    });
    artworkContainer.addEventListener('mouseleave', () => {
      if (isVideoPlaying && !theaterStage.classList.contains('is-miniplayer')) {
        scheduleControlsAutoHide();
      }
    });
  }


  function enterMiniplayer() {
    if (!theaterStage) return;
    dragJustFinished = true;
    ignoreNextMiniplayerClick = true;
    justEnteredMiniplayerAt = Date.now();

    theaterStage.style.transition = '';
    theaterStage.style.transform = '';
    theaterStage.style.transformOrigin = '';
    theaterStage.style.boxShadow = '';
    if (artworkContainer) {
      artworkContainer.style.transform = '';
      artworkContainer.style.transformOrigin = '';
      artworkContainer.style.transition = '';
      artworkContainer.style.boxShadow = '';
      artworkContainer.style.borderRadius = '';
      artworkContainer.style.zIndex = '';
    }
    if (theaterYtBar) {
      theaterYtBar.style.opacity = '';
      theaterYtBar.style.transition = '';
    }
    hideCustomControls();
    clearTimeout(controlsAutoHideTimer);
    closeSettingsSheet();

    // Synchronize miniplayer play/pause icon
    if (miniPlayIcon) {
      if (isVideoPlaying) {
        miniPlayIcon.innerHTML = '<rect x="6" y="4" width="4" height="16" rx="1"></rect><rect x="14" y="4" width="4" height="16" rx="1"></rect>';
      } else {
        miniPlayIcon.innerHTML = '<polygon points="6 4 20 12 6 20"></polygon>';
      }
    }

    theaterStage.classList.add('is-miniplayer');
    if (playerView) {
      playerView.classList.add('miniplayer-mode');
      playerView.classList.remove('theater-active');
    }

    // Smoothly fade in the feed & app header so user can browse
    if (feedSection) {
      feedSection.style.transition = 'opacity 0.28s ease';
      feedSection.style.opacity = '1';
    }
    if (appHeader) {
      appHeader.style.transition = 'opacity 0.28s ease';
      appHeader.style.opacity = '1';
    }

    if (typeof window.triggerHaptic === 'function') window.triggerHaptic('medium');
  }

  function exitMiniplayer() {
    if (!theaterStage) return;
    theaterStage.classList.remove('is-miniplayer');
    theaterStage.style.transform = '';
    theaterStage.style.transformOrigin = '';
    theaterStage.style.transition = '';
    theaterStage.style.boxShadow = '';
    if (artworkContainer) {
      artworkContainer.style.transform = '';
      artworkContainer.style.transformOrigin = '';
      artworkContainer.style.transition = '';
      artworkContainer.style.boxShadow = '';
      artworkContainer.style.borderRadius = '';
      artworkContainer.style.zIndex = '';
    }
    if (playerView) {
      playerView.classList.remove('miniplayer-mode');
      playerView.classList.add('theater-active');
    }
    if (theaterYtBar) {
      theaterYtBar.style.opacity = '1';
      theaterYtBar.style.transition = '';
    }
    if (feedSection) {
      feedSection.style.opacity = '1';
      feedSection.style.transition = '';
    }
    showCustomControls();
    if (isVideoPlaying) startPlaybackTicker();

    const cinemaScreen = document.getElementById('cinema-screen');
    if (cinemaScreen) cinemaScreen.scrollTo({ top: 0, behavior: 'smooth' });
    if (playerView) playerView.scrollTo({ top: 0, behavior: 'smooth' });
    if (typeof window.triggerHaptic === 'function') window.triggerHaptic('light');
  }

  function closeVideoCompletely() {
    isVideoPlaying = false;
    currentPlayingVideoId = null;

    if (iframe) iframe.src = '';
    stopPlaybackTicker();
    setAmbilightPlaybackState(false);
    dismissPlaybackErrorBanner();
    hideCustomControls();
    closeSettingsSheet();

    // 1. Hide the video theater stage completely
    if (theaterStage) {
      theaterStage.style.display = 'none';
      theaterStage.classList.remove('is-miniplayer');
      theaterStage.style.transform = '';
      theaterStage.style.transformOrigin = '';
      theaterStage.style.transition = '';
    }
    if (artworkContainer) {
      artworkContainer.style.transform = '';
      artworkContainer.style.transformOrigin = '';
      artworkContainer.style.transition = '';
      artworkContainer.style.boxShadow = '';
      artworkContainer.style.borderRadius = '';
      artworkContainer.style.zIndex = '';
    }

    // 2. Redirect to In-App YouTube Home Feed Screen
    if (playerView) {
      playerView.classList.remove('theater-active');
      playerView.classList.remove('miniplayer-mode');
      playerView.style.display = 'flex';
    }
    if (launcherView) {
      launcherView.style.display = 'none';
    }

    // 3. Ensure YouTube mobile app header and feed are fully visible and active
    const appHeaderEl = appHeader || document.querySelector('.yt-mobile-app-header');
    if (appHeaderEl) {
      appHeaderEl.style.display = '';
      appHeaderEl.style.opacity = '1';
    }
    const feedSec = feedSection || document.querySelector('.cinema-feed-section') || document.getElementById('cinema-video-feed-section');
    if (feedSec) {
      feedSec.style.display = '';
      feedSec.style.opacity = '1';
      feedSec.style.pointerEvents = 'auto';
    }
    if (theaterYtBar) {
      theaterYtBar.style.opacity = '';
    }

    // 4. Smooth scroll right back to top of YouTube Home feed
    const cinemaScreen = document.getElementById('cinema-screen');
    if (cinemaScreen) {
      cinemaScreen.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (window.vievAirCast && typeof window.vievAirCast.notifyScreenState === 'function') {
      window.vievAirCast.notifyScreenState({
        view: 'feed',
        video: null,
        scrollTop: 0
      });
    }
    if (playerView) {
      playerView.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (typeof window.triggerHaptic === 'function') window.triggerHaptic('light');
  }

  // Video Controls & Tap Gestures (Drag feature completely removed)
  function initVideoControlsAndGestures() {
    if (!theaterStage) return;

    // Tap on Video: Toggle controls overlay
    // Double Tap (Left/Right): Seek +/- 10s with ripple
    const targetSurface = dragSurface || artworkContainer;
    if (targetSurface) {
      let lastTapTime = 0;
      let lastTapSide = null;

      targetSurface.addEventListener('click', (e) => {
        const target = e.target;
        if (target && (target.closest('button') || target.closest('a') || target.closest('.cinema-ctrl-scrub-container') || target.closest('.cinema-settings-modal-backdrop'))) {
          return;
        }

        const rect = targetSurface.getBoundingClientRect();
        const tapX = e.clientX - rect.left;
        const width = rect.width || 1;
        const pct = tapX / width;
        const side = pct < 0.35 ? 'left' : (pct > 0.65 ? 'right' : 'center');
        const now = Date.now();

        if (side !== 'center' && (now - lastTapTime < 320) && (lastTapSide === side)) {
          lastTapTime = 0;
          lastTapSide = null;
          if (side === 'left') {
            seekVideoBy(-10);
            triggerSeekRipple('left', 10);
          } else {
            seekVideoBy(10);
            triggerSeekRipple('right', 10);
          }
        } else {
          lastTapTime = now;
          lastTapSide = side;
          toggleCustomControls();
          if (typeof window.triggerHaptic === 'function') window.triggerHaptic('light');
        }
      });
    }

    // Top-left Back Arrow button on video controls: Closes video player cleanly and returns to feed
    if (ctrlBackBtn) {
      ctrlBackBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeVideoCompletely();
      });
    }

    // Center Play/Pause Button
    function handlePlayPause(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      togglePlayPause();
      if (typeof window.triggerHaptic === 'function') window.triggerHaptic('light');
    }

    if (ctrlPlayBtn) {
      ctrlPlayBtn.addEventListener('click', handlePlayPause);
    }

    // Audio Mute/Unmute
    if (ctrlMuteBtn) {
      ctrlMuteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        isVideoMuted = !isVideoMuted;
        sendIframeCommand(isVideoMuted ? 'mute' : 'unMute');
        if (ctrlVolumeIcon) {
          if (isVideoMuted) {
            ctrlVolumeIcon.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>';
          } else {
            ctrlVolumeIcon.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>';
          }
        }
        scheduleControlsAutoHide();
      });
    }

    // Closed Captions (CC)
    if (ctrlCcBtn) {
      ctrlCcBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        isCCActive = !isCCActive;
        ctrlCcBtn.classList.toggle('is-active', isCCActive);
        sendIframeCommand('setOption', ['captions', 'track', isCCActive ? { languageCode: 'en' } : {}]);
        scheduleControlsAutoHide();
      });
    }

    // Fullscreen
    if (ctrlFullscreenBtn) {
      ctrlFullscreenBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const stage = document.getElementById('cinema-video-card-stage');
        if (!stage) return;
        if (!document.fullscreenElement) {
          if (stage.requestFullscreen) {
            stage.requestFullscreen().catch(() => {});
          } else if (stage.webkitRequestFullscreen) {
            stage.webkitRequestFullscreen();
          }
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          }
        }
      });
    }

    // Scrubber Seeking with Pointer Capture
    if (ctrlScrubContainer) {
      let isScrubbing = false;

      function updateScrubFromEvent(e) {
        const rect = ctrlScrubContainer.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        const pos = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
        videoCurrentSeconds = Math.round(pos * videoTotalSeconds);
        updateScrubberUI();
        return videoCurrentSeconds;
      }

      ctrlScrubContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        const sec = updateScrubFromEvent(e);
        sendIframeCommand('seekTo', [sec, true]);
        scheduleControlsAutoHide();
      });

      ctrlScrubContainer.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        isScrubbing = true;
        try { ctrlScrubContainer.setPointerCapture(e.pointerId); } catch (_) {}
        updateScrubFromEvent(e);
      });

      ctrlScrubContainer.addEventListener('pointermove', (e) => {
        if (!isScrubbing) return;
        updateScrubFromEvent(e);
      });

      ctrlScrubContainer.addEventListener('pointerup', (e) => {
        if (!isScrubbing) return;
        isScrubbing = false;
        try { ctrlScrubContainer.releasePointerCapture(e.pointerId); } catch (_) {}
        const sec = updateScrubFromEvent(e);
        sendIframeCommand('seekTo', [sec, true]);
        scheduleControlsAutoHide();
      });

      ctrlScrubContainer.addEventListener('pointercancel', () => {
        isScrubbing = false;
      });
    }

    // Settings Modal (Matching Image 5)
    function openSettingsSheet() {
      if (!settingsModal) return;
      settingsModal.style.display = 'flex';
      if (settingsMainView) settingsMainView.style.display = 'flex';
      if (settingsSpeedSubmenu) settingsSpeedSubmenu.style.display = 'none';
      if (settingsQualitySubmenu) settingsQualitySubmenu.style.display = 'none';
      clearTimeout(controlsAutoHideTimer);
    }

    function closeSettingsSheet() {
      if (!settingsModal) return;
      settingsModal.style.display = 'none';
      scheduleControlsAutoHide();
    }

    if (ctrlSettingsBtn) {
      ctrlSettingsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openSettingsSheet();
      });
    }

    if (settingsModal) {
      settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
          closeSettingsSheet();
        }
      });
    }

    // Settings: Playback Speed navigation
    if (settingsSpeedRow) {
      settingsSpeedRow.addEventListener('click', (e) => {
        e.preventDefault();
        if (settingsMainView) settingsMainView.style.display = 'none';
        if (settingsSpeedSubmenu) settingsSpeedSubmenu.style.display = 'flex';
      });
    }

    if (speedBackBtn) {
      speedBackBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (settingsSpeedSubmenu) settingsSpeedSubmenu.style.display = 'none';
        if (settingsMainView) settingsMainView.style.display = 'flex';
      });
    }

    // Speed options
    document.querySelectorAll('.cinema-sub-opt[data-speed]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.cinema-sub-opt[data-speed]').forEach(b => b.classList.remove('is-selected'));
        btn.classList.add('is-selected');
        const rate = parseFloat(btn.dataset.speed) || 1;
        currentPlaybackRate = rate;
        if (currSpeedVal) currSpeedVal.textContent = btn.textContent.trim();
        sendIframeCommand('setPlaybackRate', [rate]);
        closeSettingsSheet();
      });
    });

    // Settings: Quality navigation
    if (settingsQualityRow) {
      settingsQualityRow.addEventListener('click', (e) => {
        e.preventDefault();
        if (settingsMainView) settingsMainView.style.display = 'none';
        if (settingsQualitySubmenu) settingsQualitySubmenu.style.display = 'flex';
      });
    }

    if (qualityBackBtn) {
      qualityBackBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (settingsQualitySubmenu) settingsQualitySubmenu.style.display = 'none';
        if (settingsMainView) settingsMainView.style.display = 'flex';
      });
    }

    // Quality options
    document.querySelectorAll('.cinema-sub-opt[data-quality]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.cinema-sub-opt[data-quality]').forEach(b => b.classList.remove('is-selected'));
        btn.classList.add('is-selected');
        const quality = btn.dataset.quality;
        currentQuality = quality;
        if (currQualityVal) {
          if (quality === 'auto') {
            currQualityVal.innerHTML = 'Auto (1080p <sup class="cinema-hd-tag">HD</sup>)';
          } else if (quality === 'hd1080') {
            currQualityVal.innerHTML = '1080p <sup class="cinema-hd-tag">HD</sup>';
          } else if (quality === 'hd720') {
            currQualityVal.textContent = '720p';
          } else if (quality === 'large') {
            currQualityVal.textContent = '480p';
          } else {
            currQualityVal.textContent = '360p';
          }
        }
        sendIframeCommand('setPlaybackQuality', [quality]);
        closeSettingsSheet();
      });
    });

    // Miniplayer Play/Pause toggle button
    if (miniPlayBtn) {
      const handleMiniPlay = (e) => {
        e.preventDefault();
        e.stopPropagation();
        togglePlayPause();
        if (typeof window.triggerHaptic === 'function') window.triggerHaptic('light');
      };
      miniPlayBtn.addEventListener('click', handleMiniPlay);
      miniPlayBtn.addEventListener('touchend', handleMiniPlay, { passive: false });
    }

    // Center enlarge button on miniplayer: ONLY this expands back!
    if (miniExpandBtn) {
      const handleExpand = (e) => {
        e.preventDefault();
        e.stopPropagation();
        exitMiniplayer();
      };
      miniExpandBtn.addEventListener('click', handleExpand);
      miniExpandBtn.addEventListener('touchend', handleExpand, { passive: false });
    }

    // Miniplayer dismiss (X) button in top-right
    if (miniDismissBtn) {
      const handleDismiss = (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeVideoCompletely();
      };
      miniDismissBtn.addEventListener('click', handleDismiss);
      miniDismissBtn.addEventListener('touchend', handleDismiss, { passive: false });
    }
  }

  // Initialize Video Controls & Tap Gestures engine (Drag removed)
  initVideoControlsAndGestures();

  // Play a specific video in the Apple Vision Pro glass theater
  function playVideoInTheater(
    videoId,
    title = 'Playing Video',
    channel = 'YouTube',
    thumb = '',
    avatar = '',
    subs = '21.1M subscribers',
    isVerified = true,
    likes = '50K',
    duration = '10:49'
  ) {
    if (!videoId) return;
    if (typeof window.triggerHaptic === 'function') window.triggerHaptic('medium');

    currentPlayingVideoId = videoId;
    currentPlayingChannel = channel;
    currentBaseLikes = likes || '50K';

    const thumbUrl = thumb || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    updateSmartAmbilight(thumbUrl, videoId, title);

    // Reset any miniplayer states or inline drag transforms
    theaterStage.classList.remove('is-miniplayer');
    theaterStage.style.transform = '';
    theaterStage.style.transformOrigin = '';
    theaterStage.style.transition = '';
    if (theaterYtBar) theaterYtBar.style.opacity = '';
    if (feedSection) feedSection.style.opacity = '';
    if (appHeader) {
      appHeader.style.display = '';
      appHeader.style.opacity = '';
    }

    if (playerView) {
      playerView.classList.remove('miniplayer-mode');
      playerView.classList.add('theater-active');
    }
    if (theaterStage) theaterStage.style.display = 'flex';
    
    // Smooth scroll to top so player is at the top of the viewport
    const cinemaScreen = document.getElementById('cinema-screen');
    if (cinemaScreen) cinemaScreen.scrollTo({ top: 0, behavior: 'smooth' });
    playerView.scrollTo({ top: 0, behavior: 'smooth' });

    if (theaterTitle) theaterTitle.textContent = title;
    if (theaterChannel) theaterChannel.textContent = channel;
    if (titleEl) titleEl.textContent = title;

    // Set Channel Avatar
    if (theaterAvatar) {
      if (avatar) {
        theaterAvatar.src = avatar;
        theaterAvatar.style.display = 'block';
        theaterAvatar.onerror = () => {
          theaterAvatar.outerHTML = `<div class="cinema-yt-channel-avatar placeholder">${channel.charAt(0).toUpperCase()}</div>`;
        };
      } else {
        theaterAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(channel)}&background=252528&color=ffffff&bold=true`;
      }
    }

    // Verified badge
    if (theaterVerified) {
      theaterVerified.style.display = (isVerified !== false) ? 'inline-block' : 'none';
    }

    // Subscriber count
    if (theaterSubs) {
      theaterSubs.textContent = subs || '21.1M subscribers';
    }

    // Sync button states
    syncSubscriptionUI(channel);
    syncLikeDislikeUI(videoId, currentBaseLikes);

    // Parse duration and reset scrubber
    videoTotalSeconds = parseDurationToSeconds(duration);
    videoCurrentSeconds = 1;
    updateScrubberUI();

    dismissPlaybackErrorBanner();

    // Use clean YouTube embed player with high mobile compatibility
    if (iframe) {
      // Standard www.youtube.com (NOT youtube-nocookie, which blocks official music/copyrighted videos)
      // Pass widget_referrer and enablejsapi for mobile browser cross-origin policy compliance
      const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&widget_referrer=${encodeURIComponent(window.location.href)}`;
      iframe.src = embedUrl;
      iframe.onload = () => {
        try {
          iframe.contentWindow.postMessage('{"event":"listening"}', '*');
          iframe.contentWindow.postMessage('{"event":"command","func":"listening","args":""}', '*');
        } catch (_) {}
      };
    }

    // Reset and show custom controls
    showCustomControls();
    setVideoPlaybackState(true);

    // Smooth scroll to theater stage
    const screen = document.getElementById('cinema-screen');
    if (screen) {
      screen.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (window.vievAirCast && typeof window.vievAirCast.notifyPlaybackState === 'function') {
      window.vievAirCast.notifyPlaybackState({
        id: videoId,
        title: title || 'YouTube Video',
        channel: channel || 'YouTube',
        avatar: avatar || '',
        currentTime: 1,
        duration: videoTotalSeconds,
        isPlaying: true,
        forceNewVideo: true
      });
    }
  }

  // Global hooks for AirCast
  window.playVideoInCinemaById = function(vidId, title, channel) {
    if (!vidId) return;
    playVideoInTheater(vidId, title || 'YouTube Video', channel || 'YouTube');
  };

  window.getCurrentCinemaPlayingVideo = function() {
    if (currentPlayingVideoId) {
      return {
        id: currentPlayingVideoId,
        title: (theaterTitle && theaterTitle.textContent) || 'YouTube Video',
        channel: (theaterChannel && theaterChannel.textContent) || 'YouTube',
        avatar: (theaterAvatar && theaterAvatar.src) || '',
        currentTime: videoCurrentSeconds || 1,
        duration: videoTotalSeconds || 300,
        isPlaying: isVideoPlaying
      };
    }
    return null;
  };

  window.getScreenShareSnapshot = function() {
    const isPlayer = playerView && playerView.classList.contains('theater-active') && theaterStage && theaterStage.style.display !== 'none' && currentPlayingVideoId;
    const cinemaScreen = document.getElementById('cinema-screen');
    const activeChipEl = document.querySelector('#cinema-category-chips .active-chip');
    
    // Extract real rendered cards from DOM
    const cardNodes = document.querySelectorAll('#cinema-video-feed-grid .cinema-video-card');
    const feedCards = [];
    cardNodes.forEach((c, idx) => {
      if (idx > 25) return;
      const thumb = c.querySelector('.yt-mobile-thumb')?.src || '';
      const title = c.querySelector('.yt-mobile-title')?.textContent?.trim() || '';
      const channel = c.querySelector('.yt-channel-name')?.textContent?.trim() || '';
      const views = c.querySelector('.yt-views-count')?.textContent?.trim() || '';
      const pub = c.querySelector('.yt-pub-time')?.textContent?.trim() || '';
      const duration = c.querySelector('.yt-mobile-duration')?.textContent?.trim() || '';
      const avatar = c.querySelector('.yt-mobile-channel-avatar')?.src || '';
      const isLive = !!c.querySelector('.yt-live-badge');
      const isVerified = !!c.querySelector('.yt-mobile-verified-badge');
      feedCards.push({
        id: c.dataset.videoid,
        title,
        channel,
        views,
        pub,
        duration,
        avatar,
        thumb,
        isLive,
        isVerified
      });
    });

    return {
      view: isPlayer ? 'player' : 'feed',
      section: 'cinema',
      activeChip: activeChipEl ? activeChipEl.textContent.trim() : 'All',
      scrollTop: cinemaScreen ? cinemaScreen.scrollTop : 0,
      feedCards: feedCards.length > 0 ? feedCards : (window.CURRENT_CINEMA_FEED || []),
      player: isPlayer ? {
        id: currentPlayingVideoId,
        title: (theaterTitle && theaterTitle.textContent) || (titleEl && titleEl.textContent) || 'YouTube Video',
        channel: currentPlayingChannel || (theaterChannel && theaterChannel.textContent) || 'YouTube',
        avatar: (theaterAvatar && theaterAvatar.src) || '',
        subs: (theaterSubs && theaterSubs.textContent) || '21.1M subscribers',
        likes: (theaterLikeCount && theaterLikeCount.textContent) || currentBaseLikes || '50K',
        isPlaying: isVideoPlaying,
        currentTime: videoCurrentSeconds || 1,
        duration: videoTotalSeconds || 300,
        isVerified: theaterVerified ? theaterVerified.style.display !== 'none' : true
      } : null
    };
  };

  function getActiveYouTubeAccount() {
    try {
      const raw = localStorage.getItem('viev_auth_session');
      const sess = raw ? JSON.parse(raw) : null;
      if (sess && (sess.code === '3011' || sess.code === '3009' || sess.role === 'digi')) {
        return {
          code: '3011',
          role: 'digi',
          name: 'DIGI',
          channelName: 'DIGI (Avneet)',
          handle: '@avneetsaini7070',
          email: 'avneetsaini7070@gmail.com',
          avatar: 'song/Screenshot 2026-10-24 224431.png',
          channelUrl: 'https://www.youtube.com',
          btnText: "Feed: Load Digi's Favorites",
          topics: [
            { label: 'All', query: 'All' },
            { label: '🔴 Live', query: 'live stream hindi news gaming live' },
            { label: 'Trending Music', query: 'latest trending bollywood songs' },
            { label: 'Romantic Hits', query: 'Romantic Hindi Songs Love Arijit Singh' },
            { label: 'Arijit Singh', query: 'Arijit Singh Latest Best Songs' },
            { label: 'Ve Haaniyaan', query: 'Ve Haaniyaan Songs' },
            { label: 'Bollywood', query: 'Bollywood Top Romantic Hits' },
            { label: 'Lofi Chill', query: 'Lofi Chill Beats Hindi' },
            { label: 'Cute Vlogs', query: 'Aesthetic Cute Travel Vlogs' }
          ]
        };
      }
    } catch (e) {}

    return {
      code: '1711',
      role: 'user',
      name: 'VIRAT',
      channelName: 'VIRAT PLAYS',
      handle: '@viratplaystdm',
      email: 'iamsid074@gmail.com',
      avatar: 'song/virat_plays_avatar.png',
      channelUrl: 'https://www.youtube.com/@viratplaystdm',
      btnText: 'Feed: Load My Videos (@viratplaystdm)',
      topics: [
        { label: 'All', query: 'All' },
        { label: '🔴 Live', query: 'live stream hindi news gaming live' },
        { label: 'Music', query: 'latest trending bollywood songs 2026' },
        { label: 'Gaming', query: 'Godlike BGMI Gaming GTA 6' },
        { label: 'BB Ki Vines', query: 'BB Ki Vines Bhuvan Bam' },
        { label: 'BeamNG', query: 'Beamng drive accidents hindi' },
        { label: 'Arijit Singh', query: 'Arijit Singh Best Songs' },
        { label: 'Free Fire', query: 'Free Fire India Trending' },
        { label: 'Latent', query: 'Indias Got Latent episodes' },
        { label: 'Tech', query: 'Apple MacBook Pro tech' }
      ]
    };
  }

  function syncYouTubeAccountUI() {
    const acc = getActiveYouTubeAccount();

    const headerAvatarImg = document.querySelector('#yt-header-avatar-btn img');
    if (headerAvatarImg) {
      headerAvatarImg.src = acc.avatar;
      headerAvatarImg.alt = acc.channelName;
    }

    const popoverAvatar = document.querySelector('.yt-account-card-avatar');
    if (popoverAvatar) popoverAvatar.src = acc.avatar;

    const popoverName = document.querySelector('.yt-account-name');
    if (popoverName) popoverName.textContent = acc.channelName;

    const popoverHandle = document.querySelector('.yt-account-handle');
    if (popoverHandle) popoverHandle.textContent = acc.handle;

    const popoverEmail = document.querySelector('.yt-account-email');
    if (popoverEmail) popoverEmail.textContent = acc.email;

    const viewChannelLink = document.querySelector('.yt-account-view-channel');
    if (viewChannelLink) viewChannelLink.href = acc.channelUrl;

    const loadChannelBtnSpan = document.querySelector('#yt-load-my-channel-btn span');
    if (loadChannelBtnSpan) loadChannelBtnSpan.textContent = acc.btnText;

    const chipsContainer = document.getElementById('cinema-category-chips');
    if (chipsContainer) {
      chipsContainer.innerHTML = `
        <button type="button" class="yt-explore-pill-btn" id="yt-explore-btn" title="Explore" aria-label="Explore">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
          </svg>
        </button>
      `;

      acc.topics.forEach((t, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `cinema-inapp-chip ${idx === 0 ? 'active-chip' : ''}`;
        btn.dataset.query = t.query;
        btn.textContent = t.label;
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          document.querySelectorAll('#cinema-category-chips .cinema-inapp-chip').forEach(c => c.classList.remove('active-chip'));
          btn.classList.add('active-chip');
          loadYouTubeFeed(t.query, false);
        });
        chipsContainer.appendChild(btn);
      });

      const exploreBtn = document.getElementById('yt-explore-btn');
      if (exploreBtn) {
        exploreBtn.addEventListener('click', (e) => {
          e.preventDefault();
          document.querySelectorAll('#cinema-category-chips .cinema-inapp-chip').forEach(c => c.classList.remove('active-chip'));
          loadYouTubeFeed('Explore Trending Worldwide', false);
        });
      }
    }
  }

  window.syncYouTubeUser = syncYouTubeAccountUI;

  // --- Infinite Scroll & Feed Pagination Engine ---
  let currentFeedQuery = 'All';
  let currentFeedPage = 1;
  let isLoadingMore = false;
  let hasMoreFeed = true;
  let infiniteScrollAttached = false;

  function getOrCreateSentinel() {
    let sentinel = document.getElementById('cinema-feed-sentinel');
    if (!sentinel && feedGrid && feedGrid.parentNode) {
      sentinel = document.createElement('div');
      sentinel.id = 'cinema-feed-sentinel';
      sentinel.className = 'cinema-feed-loading-more';
      sentinel.style.display = 'none';
      sentinel.innerHTML = `
        <div class="cinema-feed-spinner"></div>
        <span>Loading more videos...</span>
      `;
      feedGrid.parentNode.insertBefore(sentinel, feedGrid.nextSibling);
    }
    return sentinel;
  }

  function renderVideoCards(videos, append = false) {
    if (!feedGrid) return;
    if (!append) {
      feedGrid.innerHTML = '';
      if (feedStatus) feedStatus.textContent = '';
      window.CURRENT_CINEMA_FEED = videos || [];
    } else if (Array.isArray(window.CURRENT_CINEMA_FEED)) {
      window.CURRENT_CINEMA_FEED = window.CURRENT_CINEMA_FEED.concat(videos || []);
    }

    const fragment = document.createDocumentFragment();

    videos.forEach((vid) => {
      const card = document.createElement('div');
      card.className = 'cinema-video-card';
      card.dataset.videoid = vid.id;
      card.dataset.title = vid.title;
      card.dataset.channel = vid.channel;

      const safeTitle = (vid.title || 'YouTube Video').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      const safeChannel = (vid.channel || 'Channel').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      const safeDuration = (vid.duration || '2:40').replace(/&/g, '&amp;');
      const safeViews = (vid.views || '1M views').replace(/&/g, '&amp;');
      const safePub = (vid.pub || '').replace(/&/g, '&amp;');

      const verifiedSvg = vid.isVerified
        ? `<svg class="yt-mobile-verified-badge" viewBox="0 0 24 24" width="13" height="13" fill="#aaaaaa"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`
        : '';

      const avatarHtml = vid.avatar
        ? `<img src="${vid.avatar}" alt="${safeChannel}" class="yt-mobile-channel-avatar" loading="lazy" onerror="this.outerHTML='<div class=\\'yt-mobile-channel-avatar placeholder\\'>${safeChannel.charAt(0).toUpperCase()}</div>'">`
        : `<div class="yt-mobile-channel-avatar placeholder">${safeChannel.charAt(0).toUpperCase()}</div>`;

      const metaParts = [];
      metaParts.push(`<span class="yt-channel-name">${safeChannel}</span>`);
      if (verifiedSvg) metaParts.push(verifiedSvg);
      if (safeViews) metaParts.push(`<span class="yt-dot">•</span><span class="yt-views-count"><span class="yt-play-triangle">▷</span> ${safeViews}</span>`);
      if (safePub) metaParts.push(`<span class="yt-dot">•</span><span class="yt-pub-time">${safePub}</span>`);

      const isLiveNow = (safeDuration && safeDuration.toLowerCase().includes('live')) || (safePub && safePub.toLowerCase().includes('live')) || (safeViews && safeViews.toLowerCase().includes('watching'));
      const durationHtml = isLiveNow
        ? `<span class="yt-mobile-duration yt-live-badge">🔴 LIVE</span>`
        : `<span class="yt-mobile-duration">♪ ${safeDuration}</span>`;

      card.innerHTML = `
        <div class="yt-mobile-thumb-wrap">
          <img src="${vid.thumb}" alt="${safeTitle}" class="yt-mobile-thumb" loading="lazy">
          ${durationHtml}
        </div>
        <div class="yt-mobile-card-details">
          <div class="yt-mobile-avatar-wrap">
            ${avatarHtml}
          </div>
          <div class="yt-mobile-text-content">
            <h3 class="yt-mobile-title">${safeTitle}</h3>
            <div class="yt-mobile-meta-line">
              ${metaParts.join(' ')}
            </div>
          </div>
          <button type="button" class="yt-mobile-more-btn" aria-label="More" title="More options">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2"></circle>
              <circle cx="12" cy="12" r="2"></circle>
              <circle cx="12" cy="19" r="2"></circle>
            </svg>
          </button>
        </div>
      `;

      const moreBtn = card.querySelector('.yt-mobile-more-btn');
      if (moreBtn) {
        moreBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${vid.id}`);
          }
          if (typeof window.triggerHaptic === 'function') window.triggerHaptic('medium');
          moreBtn.title = 'Link Copied! ✓';
          setTimeout(() => { moreBtn.title = 'More options'; }, 2000);
        });
      }

      card.addEventListener('click', () => {
        const subs = vid.subs || (vid.views ? `${vid.views.replace(/views?/i, '').trim()} subscribers` : '21.1M subscribers');
        const likes = vid.likes || '50K';
        playVideoInTheater(vid.id, vid.title, vid.channel, vid.thumb, vid.avatar, subs, vid.isVerified, likes, vid.duration);
      });

      fragment.appendChild(card);
    });

    feedGrid.appendChild(fragment);
  }

  async function loadMoreYouTubeFeed() {
    if (isLoadingMore || !hasMoreFeed) return;
    isLoadingMore = true;
    currentFeedPage++;

    const sentinel = getOrCreateSentinel();
    if (sentinel) sentinel.style.display = 'flex';

    try {
      const acc = getActiveYouTubeAccount();
      const endpoint = (!currentFeedQuery || currentFeedQuery === 'All')
        ? `/api/youtube/my-feed?user=${acc.code}&page=${currentFeedPage}`
        : `/api/youtube/search?q=${encodeURIComponent(currentFeedQuery)}&page=${currentFeedPage}`;

      let moreVideos = [];
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(endpoint, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.videos) && data.videos.length > 0) {
            moreVideos = data.videos;
          }
        }
      } catch (_) {}

      // Fallback from personalized database if offline
      if (!moreVideos || moreVideos.length === 0) {
        const pool = (acc.code === '1711' && Array.isArray(window.VIRAT_YOUTUBE_FEED))
          ? window.VIRAT_YOUTUBE_FEED
          : (window.DIGI_YOUTUBE_FEED || window.VIRAT_YOUTUBE_FEED || []);
        if (pool && pool.length > 0) {
          const pageSize = 12;
          const startIdx = ((currentFeedPage - 1) * pageSize) % pool.length;
          moreVideos = pool.slice(startIdx, startIdx + pageSize);
          if (moreVideos.length < pageSize) {
            moreVideos = moreVideos.concat(pool.slice(0, pageSize - moreVideos.length));
          }
        }
      }

      if (moreVideos && moreVideos.length > 0) {
        renderVideoCards(moreVideos, true);
      } else {
        hasMoreFeed = false;
      }
    } catch (e) {
      console.warn('Infinite scroll error:', e);
    } finally {
      if (sentinel) sentinel.style.display = 'none';
      isLoadingMore = false;
    }
  }

  function setupInfiniteScroll() {
    if (infiniteScrollAttached) return;
    infiniteScrollAttached = true;

    const screen = document.getElementById('cinema-screen');
    const onScrollHandler = () => {
      if (!screen || isLoadingMore || !hasMoreFeed) return;
      const scrollBottom = screen.scrollHeight - (screen.scrollTop + screen.clientHeight);
      if (scrollBottom < 650) {
        loadMoreYouTubeFeed();
      }
    };

    if (screen) {
      screen.addEventListener('scroll', onScrollHandler, { passive: true });
    }
    window.addEventListener('scroll', onScrollHandler, { passive: true });
  }

  // Fetch and display real YouTube video feed cards (with instant client search & 3.5s timeout)
  async function loadYouTubeFeed(query = 'All', autoPlayFirst = false, forceRefresh = false) {
    if (!feedGrid) return;

    currentFeedQuery = query;
    currentFeedPage = 1;
    hasMoreFeed = true;
    isLoadingMore = false;

    setupInfiniteScroll();

    const sentinel = getOrCreateSentinel();
    if (sentinel) sentinel.style.display = 'none';

    // 0. Ultra-fast instant local match display for queries (0ms latency!)
    let displayedInstant = false;
    if (query && query !== 'All' && typeof window.searchAllYouTubeVideos === 'function') {
      const instantList = window.searchAllYouTubeVideos(query);
      if (instantList && instantList.length > 0) {
        renderVideoCards(instantList, false);
        displayedInstant = true;
      }
    }

    if (!displayedInstant) {
      feedGrid.innerHTML = `
        <div class="cinema-feed-loading">
          <div class="cinema-feed-spinner"></div>
          <span>Loading your YouTube feed...</span>
        </div>
      `;
    }

    try {
      const acc = getActiveYouTubeAccount();
      const refreshParam = forceRefresh ? `&refresh=1&_t=${Date.now()}` : '';
      const endpoint = (!query || query === 'All')
        ? `/api/youtube/my-feed?user=${acc.code}&page=1${refreshParam}`
        : `/api/youtube/search?q=${encodeURIComponent(query)}&user=${acc.code}&page=1${refreshParam}`;

      let videos = [];

      // 1. Try local/remote backend API endpoint with strict 3.5s timeout
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(endpoint, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.videos) && data.videos.length > 0) {
            videos = data.videos;
          }
        }
      } catch (fetchErr) {
        // Backend timeout or offline
      }

      // 2. Seamless client-side zero-fail fallback
      if (!videos || videos.length === 0) {
        if (typeof window.searchAllYouTubeVideos === 'function') {
          videos = window.searchAllYouTubeVideos(query);
        } else {
          videos = (acc.code === '3009' || acc.code === '3011' || acc.role === 'digi')
            ? (window.DIGI_YOUTUBE_FEED || [])
            : (window.VIRAT_YOUTUBE_FEED || []);
        }
      }

      if (!videos || videos.length === 0) {
        if (!displayedInstant) {
          feedGrid.innerHTML = `
            <div class="cinema-feed-loading">
              <span>No videos found. Try another search!</span>
            </div>
          `;
        }
        return;
      }

      renderVideoCards(videos, false);

      if (autoPlayFirst && videos.length > 0) {
        const first = videos[0];
        const subs = first.subs || (first.views ? `${first.views.replace(/views?/i, '').trim()} subscribers` : '21.1M subscribers');
        playVideoInTheater(first.id, first.title, first.channel, first.thumb, first.avatar, subs, first.isVerified, first.likes || '50K', first.duration);
      }

    } catch (err) {
      console.warn('Fallback loading YouTube feed:', err);
      try {
        const acc = getActiveYouTubeAccount();
        const fallback = (acc.code === '1711' && Array.isArray(window.VIRAT_YOUTUBE_FEED))
          ? window.VIRAT_YOUTUBE_FEED
          : (window.DIGI_YOUTUBE_FEED || []);
        if (fallback && fallback.length > 0) {
          renderVideoCards(fallback, false);
          return;
        }
      } catch (_) {}

      feedGrid.innerHTML = `
        <div class="cinema-feed-loading">
          <span>Failed to connect to YouTube server. Check connection.</span>
        </div>
      `;
      if (feedStatus) feedStatus.textContent = 'Error';
    }
  }

  function openCinemaLounge(initialQuery = 'All', autoPlayFirst = false) {
    if (typeof window.triggerHaptic === 'function') window.triggerHaptic('medium');

    launcherView.style.display = 'none';
    playerView.style.display = 'flex';

    // Strictly ensure no black player is displayed on Home Feed
    if (!autoPlayFirst) {
      if (theaterStage) {
        theaterStage.style.display = 'none';
      }
      playerView.classList.remove('theater-active');
      playerView.classList.remove('miniplayer-mode');
      if (iframe) iframe.src = '';
    }

    if (appHeader) {
      appHeader.style.display = '';
      appHeader.style.opacity = '1';
    }
    if (feedSection) {
      feedSection.style.display = '';
      feedSection.style.opacity = '1';
    }

    if (urlInput) urlInput.value = '';

    syncYouTubeAccountUI();
    loadYouTubeFeed(initialQuery, autoPlayFirst);

    const screen = document.getElementById('cinema-screen');
    if (screen) screen.scrollTop = 0;
  }

  function backToLauncher() {
    if (typeof window.triggerHaptic === 'function') window.triggerHaptic('light');

    closeVideoCompletely();

    playerView.style.display = 'none';
    launcherView.style.display = 'flex';
  }

  // 1-Tap Play in VIEV Launcher Button
  if (launchMainBtn) {
    launchMainBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openCinemaLounge('All', false);
    });
  }

  // Tap YouTube Logo -> Reload Feed
  const ytLogoBtn = document.getElementById('yt-official-logo-btn') || document.querySelector('.yt-official-logo-wrap');
  if (ytLogoBtn) {
    ytLogoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof window.triggerHaptic === 'function') window.triggerHaptic('medium');

      // Trigger bouncy feedback animation
      ytLogoBtn.classList.remove('yt-logo-refreshing');
      void ytLogoBtn.offsetWidth; // Force CSS reflow
      ytLogoBtn.classList.add('yt-logo-refreshing');
      setTimeout(() => ytLogoBtn.classList.remove('yt-logo-refreshing'), 700);

      // Reset category chips active highlight to "All"
      const chips = document.querySelectorAll('#cinema-category-chips .cinema-inapp-chip');
      chips.forEach((c, idx) => c.classList.toggle('active-chip', idx === 0));

      // Force reload fresh feed
      loadYouTubeFeed('All', false, true);

      // Smooth scroll feed to top
      const screen = document.getElementById('cinema-screen');
      if (screen) screen.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Back Button (if present in DOM)
  if (backBtn) {
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      backToLauncher();
    });
  }

  // Shortcut Cards in Launcher Hub
  shortcutCards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const videoId = card.dataset.video;
      const title = card.dataset.title || 'Real YouTube Stream';
      
      openCinemaLounge(title, false);
      if (videoId) {
        setTimeout(() => {
          playVideoInTheater(videoId, title);
        }, 150);
      }
    });
  });

  // Category Filter Chips
  categoryChips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      categoryChips.forEach(c => c.classList.remove('active-chip'));
      chip.classList.add('active-chip');

      const query = chip.dataset.query || chip.textContent.trim();
      loadYouTubeFeed(query, false);

      if (window.vievAirCast && typeof window.vievAirCast.notifyScreenState === 'function') {
        window.vievAirCast.notifyScreenState({
          view: 'feed',
          chip: chip.textContent.trim(),
          query: query
        });
      }
    });
  });

  // Track screen scrolling when casting to mirror scroll on companion screen (0ms latency, 60fps RAF)
  const cinemaScreenEl = document.getElementById('cinema-screen');
  let scrollRafId = null;
  if (cinemaScreenEl) {
    cinemaScreenEl.addEventListener('scroll', () => {
      if (scrollRafId) return;
      scrollRafId = requestAnimationFrame(() => {
        scrollRafId = null;
        if (window.vievAirCast && typeof window.vievAirCast.notifyScroll === 'function') {
          const maxScroll = Math.max(1, cinemaScreenEl.scrollHeight - cinemaScreenEl.clientHeight);
          const scrollRatio = cinemaScreenEl.scrollTop / maxScroll;
          window.vievAirCast.notifyScroll(cinemaScreenEl.scrollTop, scrollRatio);
        }
      });
    }, { passive: true });
  }

  // Custom Search / Paste Link Input
  function handleCustomSearch() {
    if (!urlInput) return;
    const val = urlInput.value.trim();
    if (!val) return;

    const id = extractYouTubeId(val);
    if (id) {
      playVideoInTheater(id, 'Playing Custom Video');
    } else {
      // Real YouTube Search query: render results cleanly
      loadYouTubeFeed(val, false);
    }
  }

  if (playCustomBtn) {
    playCustomBtn.addEventListener('click', handleCustomSearch);
  }

  if (urlInput) {
    urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleCustomSearch();
    });
  }

  // YouTube Mobile Search Strip Toggle & Close
  const searchToggleBtn = document.getElementById('yt-header-search-toggle');
  const searchStrip = document.getElementById('yt-mobile-search-strip');
  const searchCloseBtn = document.getElementById('yt-search-close-btn');

  if (searchToggleBtn && searchStrip) {
    searchToggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const isHidden = searchStrip.style.display === 'none' || !searchStrip.style.display;
      searchStrip.style.display = isHidden ? 'flex' : 'none';
      if (isHidden && urlInput) {
        urlInput.focus();
      }
    });
  }

  if (searchCloseBtn && searchStrip) {
    searchCloseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      searchStrip.style.display = 'none';
    });
  }

  // Explore button on left of chips
  const exploreBtn = document.getElementById('yt-explore-btn');
  if (exploreBtn) {
    exploreBtn.addEventListener('click', (e) => {
      e.preventDefault();
      categoryChips.forEach(c => c.classList.remove('active-chip'));
      loadYouTubeFeed('Explore Trending Worldwide', false);
    });
  }

  // Account Popover (VIRAT PLAYS • iamsid074@gmail.com)
  const avatarBtn = document.getElementById('yt-header-avatar-btn');
  const accountPopover = document.getElementById('yt-account-menu-popover');
  const loadMyChannelBtn = document.getElementById('yt-load-my-channel-btn');

  if (avatarBtn && accountPopover) {
    avatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isClosed = accountPopover.style.display === 'none' || !accountPopover.style.display;
      accountPopover.style.display = isClosed ? 'block' : 'none';
    });

    document.addEventListener('click', (e) => {
      if (!accountPopover.contains(e.target) && e.target !== avatarBtn && !avatarBtn.contains(e.target)) {
        accountPopover.style.display = 'none';
      }
    });
  }

  if (loadMyChannelBtn && accountPopover) {
    loadMyChannelBtn.addEventListener('click', (e) => {
      e.preventDefault();
      accountPopover.style.display = 'none';
      const acc = getActiveYouTubeAccount();
      document.querySelectorAll('#cinema-category-chips .cinema-inapp-chip').forEach(c => c.classList.remove('active-chip'));
      if (acc.code === '3011' || acc.code === '3009') {
        loadYouTubeFeed('Ve Haaniyaan Romantic Songs Arijit Singh', false);
      } else {
        loadYouTubeFeed('viratplaystdm', false);
      }
    });
  }

  // Wire up Add Video Modal
  if (openAddModalBtn && addModal) {
    openAddModalBtn.addEventListener('click', (e) => {
      e.preventDefault();
      addModal.style.display = 'flex';
      if (newUrlInput) {
        newUrlInput.value = '';
        setTimeout(() => newUrlInput.focus(), 100);
      }
    });
  }

  if (closeAddModalBtn && addModal) {
    closeAddModalBtn.addEventListener('click', () => {
      addModal.style.display = 'none';
    });
  }

  if (addModal) {
    addModal.addEventListener('click', (e) => {
      if (e.target === addModal) addModal.style.display = 'none';
    });
  }

  if (saveAddModalBtn && newUrlInput) {
    saveAddModalBtn.addEventListener('click', () => {
      const val = newUrlInput.value.trim();
      const customTitle = (newTitleInput && newTitleInput.value.trim()) || 'Custom Video';
      const id = extractYouTubeId(val);
      if (id) {
        if (addModal) addModal.style.display = 'none';
        playVideoInTheater(id, customTitle, 'Custom YouTube');
      } else {
        alert('Please enter a valid YouTube video link or 11-character video ID');
      }
    });
  }

  // Expose global open function for direct navbar access
  window.openCinemaLounge = openCinemaLounge;

  // Cross-Tab Navbar Miniplayer visibility
  window.vievCinema = {
    updateMiniPlayerVisibility(targetTab) {
      if (!theaterStage) return;
      if (theaterStage.classList.contains('is-miniplayer')) {
        theaterStage.style.display = 'flex';
      }
    }
  };

  // Direct YouTube Home initialization on load
  if (launcherView) launcherView.style.display = 'none';
  if (playerView) playerView.style.display = 'flex';
  if (theaterStage) theaterStage.style.display = 'none';
  syncYouTubeAccountUI();
  loadYouTubeFeed('All', false);
});
