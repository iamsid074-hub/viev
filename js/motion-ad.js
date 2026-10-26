/**
 * Digi OS 1.3 - Apple Product Motion Typography Keynote Ad
 * Designed strictly to Apple keynote aesthetic:
 * Pure stark white background, pitch-black bold kinetic typography,
 * high-contrast inversion cuts, dynamic camera zooms, zero generic sparkles.
 * Automatically active on the Home Hero screen while OS < 1.3.
 */

(function() {
  'use strict';

  const TOTAL_DURATION = 17000; // 17 seconds complete ad loop

  const SCENES = [
    {
      id: 'scene-intro',
      start: 0,
      end: 2500,
      bg: '#ffffff',
      theme: 'light',
      render: (progress) => `
        <div class="ad-scene ad-scene-intro ${progress > 0.1 ? 'is-active' : ''}">
          <span class="ad-kicker">Say hello to</span>
          <h2 class="ad-headline-hero">Digi OS<br><span class="ad-accent-text">1.3.</span></h2>
          <div class="ad-spec-badge">SPECIAL VIEV EDITION</div>
        </div>
      `
    },
    {
      id: 'scene-bg-audio',
      start: 2500,
      end: 5500,
      bg: '#000000',
      theme: 'dark',
      render: (progress) => `
        <div class="ad-scene ad-scene-audio ${progress > 0.1 ? 'is-active' : ''}">
          <div class="ad-audio-wave-visualizer" aria-hidden="true">
            <span class="ad-wave-bar"></span>
            <span class="ad-wave-bar"></span>
            <span class="ad-wave-bar"></span>
            <span class="ad-wave-bar"></span>
            <span class="ad-wave-bar"></span>
          </div>
          <h2 class="ad-headline-impact">Non-stop.</h2>
          <p class="ad-body-bold">Music that never sleeps.</p>
          <span class="ad-sub-caption">Plays continuously when your phone is locked or screen is off.</span>
        </div>
      `
    },
    {
      id: 'scene-lyrics',
      start: 5500,
      end: 8400,
      bg: '#ffffff',
      theme: 'light',
      render: (progress) => `
        <div class="ad-scene ad-scene-lyrics ${progress > 0.1 ? 'is-active' : ''}">
          <span class="ad-kicker">Real-time .LRC</span>
          <h2 class="ad-headline-tight">Every word.<br>In sync.</h2>
          <div class="ad-karaoke-preview">
            <span class="ad-lyric-glow">Tere kolon mainu saah milde...</span>
          </div>
          <span class="ad-sub-caption">Complete auto-scrolling karaoke lyrics for all songs.</span>
        </div>
      `
    },
    {
      id: 'scene-lockscreen',
      start: 8400,
      end: 11200,
      bg: '#000000',
      theme: 'dark',
      render: (progress) => `
        <div class="ad-scene ad-scene-lockscreen ${progress > 0.1 ? 'is-active' : ''}">
          <div class="ad-lockscreen-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>Lock Screen MediaSession</span>
          </div>
          <h2 class="ad-headline-impact">Total<br>Control.</h2>
          <span class="ad-sub-caption">Artwork, scrubbing, and Bluetooth buttons on your lock screen.</span>
        </div>
      `
    },
    {
      id: 'scene-haptics',
      start: 11200,
      end: 14000,
      bg: '#ffffff',
      theme: 'light',
      render: (progress) => `
        <div class="ad-scene ad-scene-haptics ${progress > 0.1 ? 'is-active' : ''}">
          <span class="ad-kicker">Apple Tactile Engine</span>
          <h2 class="ad-headline-tight">Touch you<br>can feel.</h2>
          <div class="ad-haptic-ring" aria-hidden="true">
            <div class="haptic-circle"></div>
          </div>
          <span class="ad-sub-caption">Micro-vibrations across flips, taps, and music controls.</span>
        </div>
      `
    },
    {
      id: 'scene-cta',
      start: 14000,
      end: 17000,
      bg: '#000000',
      theme: 'dark',
      render: (progress) => `
        <div class="ad-scene ad-scene-cta ${progress > 0.1 ? 'is-active' : ''}">
          <div class="ad-giant-version">1.3</div>
          <h2 class="ad-headline-cta">Available Now.</h2>
          <div class="ad-cta-button">
            <span>Tap to Update in Settings</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>
      `
    }
  ];

  let adStageEl = null;
  let viewportEl = null;
  let progressFillEl = null;
  let isRunning = false;
  let startTime = null;
  let animId = null;
  let currentSceneIndex = -1;

  function initMotionAd() {
    adStageEl = document.getElementById('apple-motion-ad-stage');
    if (!adStageEl) return;

    viewportEl = document.getElementById('ad-viewport');
    progressFillEl = document.getElementById('ad-progress-fill');

    // Tapping anywhere on the motion ad navigates to Settings -> Software Update
    adStageEl.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.triggerHaptic) window.triggerHaptic('medium');

      // Switch to Settings tab
      const tabSettings = document.getElementById('tab-settings');
      if (tabSettings) tabSettings.click();

      // Open Software Update subpage
      setTimeout(() => {
        const softwareNavBtn = document.querySelector('.settings-nav-pill[data-target="subpage-software"]');
        if (softwareNavBtn) softwareNavBtn.click();
      }, 150);
    });

    // Check system version to start or hide immediately
    syncMotionAdWithVersion();
  }

  function startMotionAd() {
    if (isRunning) return;
    if (!adStageEl) initMotionAd();
    if (!adStageEl) return;

    isRunning = true;
    adStageEl.style.display = 'flex';
    startTime = performance.now();
    currentSceneIndex = -1;
    animId = requestAnimationFrame(renderLoop);
  }

  function stopMotionAd() {
    isRunning = false;
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    if (adStageEl) {
      adStageEl.style.display = 'none';
    }
  }

  function renderLoop(now) {
    if (!isRunning || !adStageEl) return;

    if (!startTime) startTime = now;
    const elapsed = (now - startTime) % TOTAL_DURATION;
    const loopProgress = elapsed / TOTAL_DURATION;

    // Update bottom progress timeline
    if (progressFillEl) {
      progressFillEl.style.width = (loopProgress * 100).toFixed(1) + '%';
    }

    // Identify active scene
    let activeIdx = 0;
    for (let i = 0; i < SCENES.length; i++) {
      if (elapsed >= SCENES[i].start && elapsed < SCENES[i].end) {
        activeIdx = i;
        break;
      }
    }

    const scene = SCENES[activeIdx];
    const sceneElapsed = elapsed - scene.start;
    const sceneDuration = scene.end - scene.start;
    const sceneProgress = Math.min(1, sceneElapsed / sceneDuration);

    if (activeIdx !== currentSceneIndex) {
      currentSceneIndex = activeIdx;
      adStageEl.style.backgroundColor = scene.bg;
      adStageEl.setAttribute('data-theme', scene.theme);
      if (viewportEl) {
        viewportEl.innerHTML = scene.render(sceneProgress);
      }
    }

    animId = requestAnimationFrame(renderLoop);
  }

  function syncMotionAdWithVersion() {
    const heroImg = document.getElementById('hero-photo-img');
    const heroGlow = document.querySelector('.hero-photo-bottom-glow');
    const motionAd = document.getElementById('apple-motion-ad-stage');
    if (!motionAd) return;

    let ver = '1.1';
    if (window.CURRENT_OS_VERSION) {
      ver = window.CURRENT_OS_VERSION;
    } else {
      try {
        const sess = JSON.parse(localStorage.getItem('viev_auth_session') || '{}');
        const role = sess.role || 'digi';
        ver = localStorage.getItem('viev_' + role + '_os_version') || '1.1';
      } catch(e) {
        ver = '1.1';
      }
    }

    if (parseFloat(ver) < 1.3) {
      // OS 1.1: Direct replacement of image with Apple Motion Graphics Ad
      if (heroImg) heroImg.style.display = 'none';
      if (heroGlow) heroGlow.style.display = 'none';
      startMotionAd();
    } else {
      // OS 1.3: Upgraded! Show original photo smoothly
      stopMotionAd();
      if (heroImg) heroImg.style.display = 'block';
      if (heroGlow) heroGlow.style.display = 'block';
    }
  }

  window.startMotionAd = startMotionAd;
  window.stopMotionAd = stopMotionAd;
  window.syncMotionAdWithVersion = syncMotionAdWithVersion;

  document.addEventListener('DOMContentLoaded', () => {
    initMotionAd();
  });
})();
