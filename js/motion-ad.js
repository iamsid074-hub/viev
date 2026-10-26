/**
 * Digi OS 1.3 - Smooth Apple Keynote Kinetic Motion Typography Ad
 * Choreographed specifically for Princess Digi:
 * Smooth, elegant pacing (~18s loop), word-to-line expansion choreography,
 * dynamic ambient theme shifts per feature (Music, Synced Lyrics, Lock Screen, Haptics).
 * Active on the Home Hero screen while OS < 1.3.
 */

(function() {
  'use strict';

  const TOTAL_DURATION = 18000; // 18 seconds smooth, relaxing Apple loop

  const SCENES = [
    {
      id: 'scene-intro',
      start: 0,
      end: 3600,
      bg: '#ffffff',
      theme: 'light',
      aura: 'radial-gradient(circle at 50% 35%, rgba(255, 182, 193, 0.35), transparent 70%)',
      anchor: 'Digi.',
      lead: 'Something special',
      reveal: 'is here.',
      sub: 'Meet Digi OS 1.3'
    },
    {
      id: 'scene-music',
      start: 3600,
      end: 7200,
      bg: '#0a0508',
      theme: 'dark',
      aura: 'radial-gradient(circle at 60% 40%, rgba(225, 29, 72, 0.42), rgba(139, 92, 246, 0.35), transparent 75%)',
      anchor: 'Music.',
      lead: 'plays',
      reveal: 'non-stop.',
      sub: 'Even when your phone is locked & screen is off.',
      badge: 'Background Audio'
    },
    {
      id: 'scene-lyrics',
      start: 7200,
      end: 10800,
      bg: '#faf8f5',
      theme: 'light',
      aura: 'radial-gradient(circle at 40% 60%, rgba(245, 158, 11, 0.28), rgba(251, 191, 36, 0.15), transparent 70%)',
      anchor: 'Every word.',
      lead: 'in real-time',
      reveal: 'karaoke sync.',
      lyricPreview: '“Tere kolon mainu saah milde…”',
      sub: 'Complete synchronized lyrics for all songs.'
    },
    {
      id: 'scene-lockscreen',
      start: 10800,
      end: 14400,
      bg: '#08080a',
      theme: 'dark',
      aura: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.32), rgba(14, 165, 233, 0.2), transparent 75%)',
      anchor: 'Lock Screen.',
      lead: 'Total',
      reveal: 'control.',
      sub: 'Artwork, live slider, and Bluetooth buttons on lockscreen.',
      badge: 'MediaSession'
    },
    {
      id: 'scene-cta',
      start: 14400,
      end: 18000,
      bg: '#000000',
      theme: 'dark',
      aura: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.15), rgba(236, 72, 153, 0.2), transparent 75%)',
      isGrandOutro: true,
      heroVer: 'Digi OS 1.3',
      lead: 'Crafted for Digi.',
      cta: 'Update in Settings →'
    }
  ];

  let adStageEl = null;
  let viewportEl = null;
  let ambientAuraEl = null;
  let progressFillEl = null;
  let isRunning = false;
  let startTime = null;
  let animId = null;
  let currentSceneIndex = -1;
  let sceneHasExpanded = false;

  function initMotionAd() {
    adStageEl = document.getElementById('apple-motion-ad-stage');
    if (!adStageEl) return;

    viewportEl = document.getElementById('ad-viewport');
    ambientAuraEl = document.getElementById('ad-ambient-aura');
    progressFillEl = document.getElementById('ad-progress-fill');

    // Tapping on the motion ad smoothly navigates to Settings -> Software Update
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
    sceneHasExpanded = false;
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

  function renderSceneDOM(scene) {
    if (scene.isGrandOutro) {
      return `
        <div class="ad-scene ad-scene-outro" id="active-ad-scene">
          <span class="ad-kicker">Special Viev Edition</span>
          <h2 class="ad-grand-title">${scene.heroVer}</h2>
          <p class="ad-grand-lead">${scene.lead}</p>
          <div class="ad-grand-cta-btn">
            <span>${scene.cta}</span>
          </div>
        </div>
      `;
    }

    let extraVisuals = '';
    if (scene.id === 'scene-music') {
      extraVisuals = `
        <div class="ad-music-wave-row" aria-hidden="true">
          <span class="wave-stick"></span>
          <span class="wave-stick"></span>
          <span class="wave-stick"></span>
          <span class="wave-stick"></span>
          <span class="wave-stick"></span>
        </div>
      `;
    } else if (scene.lyricPreview) {
      extraVisuals = `
        <div class="ad-karaoke-strip">
          <span class="karaoke-text">${scene.lyricPreview}</span>
        </div>
      `;
    } else if (scene.id === 'scene-lockscreen') {
      extraVisuals = `
        <div class="ad-lockscreen-pill">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <span>Native Lock Screen Controls</span>
        </div>
      `;
    }

    return `
      <div class="ad-scene ad-scene-kinetic" id="active-ad-scene">
        <!-- Anchor Word that begins medium, then smoothly scales down and moves -->
        <div class="ad-anchor-wrap">
          <span class="ad-anchor-word" id="ad-anchor-word">${scene.anchor}</span>
        </div>

        <!-- The line that fluidly unfolds as camera tracks with it -->
        <div class="ad-unfolding-container" id="ad-unfolding-container">
          <h2 class="ad-kinetic-line">
            <span class="line-part-lead">${scene.lead}</span>
            <span class="line-part-reveal">${scene.reveal}</span>
          </h2>
          ${extraVisuals}
          <p class="ad-sub-explanation">${scene.sub}</p>
        </div>
      </div>
    `;
  }

  function renderLoop(now) {
    if (!isRunning || !adStageEl) return;

    if (!startTime) startTime = now;
    const elapsed = (now - startTime) % TOTAL_DURATION;
    const loopProgress = elapsed / TOTAL_DURATION;

    // Timeline fill
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

    // On Scene Switch
    if (activeIdx !== currentSceneIndex) {
      currentSceneIndex = activeIdx;
      sceneHasExpanded = false;

      // Update background & ambient aura
      adStageEl.style.backgroundColor = scene.bg;
      adStageEl.setAttribute('data-theme', scene.theme);
      if (ambientAuraEl) {
        ambientAuraEl.style.background = scene.aura;
      }

      if (viewportEl) {
        viewportEl.innerHTML = renderSceneDOM(scene);
      }
    }

    // Choreographed expansion: After ~800ms of reading the anchor word,
    // smoothly shrink anchor and expand the unfolding phrase!
    if (!sceneHasExpanded && sceneElapsed > 750) {
      sceneHasExpanded = true;
      const activeSceneEl = document.getElementById('active-ad-scene');
      if (activeSceneEl) {
        activeSceneEl.classList.add('is-expanded');
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
      // OS 1.1: Direct replacement of image with Apple Kinetic Motion Typography
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
