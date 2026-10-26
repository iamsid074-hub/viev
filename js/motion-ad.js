/**
 * Digi OS 1.3 - Cinematic Apple Product Motion Graphics Video
 * Directed specifically to Digi's visual journey:
 * - Letter-by-letter kinetic Apple typographic reveals with optical blur-to-sharp focus
 * - Measured, comfortable, relaxed pacing (~24.5s loop) so each word can be read and enjoyed
 * - Multi-color Hyperspace Warp Layers -> Meet OS 1.3
 * - "Every word" -> horizontal line unfold -> wipe -> Lyric Pill -> Zoom subline
 * - "MUSIC" -> Morph to waveform -> Drag-in window -> "Even when your phone is locked" word zooms -> Actual Padlock snap!
 * - Lock Screen floating glass widget -> Bluetooth wave -> Total Control
 * - Outro: strictly "OS 1.3" + "Update Now"
 */

(function() {
  'use strict';

  const TOTAL_DURATION = 24500; // 24.5s comfortable, relaxed Apple keynote loop

  // Helper: Splitting text into individual kinetic animated characters
  function splitLetters(text, baseDelay = 0.1, charDelay = 0.035, className = 'char-anim') {
    return text.split('').map((char, idx) => {
      if (char === ' ') {
        return `<span class="char-space">&nbsp;</span>`;
      }
      const delay = (baseDelay + idx * charDelay).toFixed(3);
      return `<span class="${className}" style="animation-delay: ${delay}s">${char}</span>`;
    }).join('');
  }

  const STAGES = [
    // ----------------------------------------------------
    // SCENE 1: THE PORTAL JOURNEY (0.0s - 5.5s)
    // ----------------------------------------------------
    {
      id: 'scene-1a',
      start: 0,
      end: 2700,
      bg: '#ffffff',
      theme: 'light',
      render: () => `
        <div class="stage-scene scene-intro-text">
          <span class="intro-anchor">${splitLetters('Digi,', 0.1, 0.06, 'char-hero')}</span>
          <h2 class="intro-line">${splitLetters('something special is here.', 0.45, 0.032, 'char-sub')}</h2>
        </div>
      `
    },
    {
      id: 'scene-1b',
      start: 2700,
      end: 5500,
      bg: '#000000',
      theme: 'dark',
      render: () => `
        <div class="stage-scene scene-portal-arrival">
          <!-- Multi-color Hyperspace Warp Layers -->
          <div class="warp-tunnel-container" aria-hidden="true">
            <div class="warp-layer warp-layer-cyan"></div>
            <div class="warp-layer warp-layer-magenta"></div>
            <div class="warp-layer warp-layer-purple"></div>
            <div class="warp-layer warp-layer-amber"></div>
          </div>
          <div class="portal-arrival-text">
            <span class="portal-meet-label">${splitLetters('Meet', 0.55, 0.05, 'char-label')}</span>
            <h1 class="portal-os-name">${splitLetters('OS 1.3', 0.85, 0.07, 'char-giant')}</h1>
          </div>
        </div>
      `
    },

    // ----------------------------------------------------
    // SCENE 2: LYRICS IN REAL-TIME SYNC (5.5s - 10.5s)
    // ----------------------------------------------------
    {
      id: 'scene-2a',
      start: 5500,
      end: 8000,
      bg: '#ffffff',
      theme: 'light',
      render: () => `
        <div class="stage-scene scene-lyrics-horizontal">
          <div class="horizontal-unfold-row">
            <span class="unfold-anchor-word">${splitLetters('Every word', 0.1, 0.045, 'char-anchor')}</span>
            <span class="unfold-tail-phrase">${splitLetters('in real-time sync.', 0.7, 0.035, 'char-phrase')}</span>
          </div>
        </div>
      `
    },
    {
      id: 'scene-2b',
      start: 8000,
      end: 10500,
      bg: '#faf8f5',
      theme: 'light',
      render: () => `
        <div class="stage-scene scene-lyrics-pill-view">
          <div class="lyrics-karaoke-pill">
            <span class="karaoke-quote-mark">“</span>
            <span class="karaoke-quote-text">Tere kolon mainu saah milde…</span>
            <span class="karaoke-quote-mark">”</span>
          </div>
          <p class="lyrics-extra-zoom-sub">${splitLetters('Complete synced lyrics.', 0.5, 0.035, 'char-zoom')}</p>
        </div>
      `
    },

    // ----------------------------------------------------
    // SCENE 3: MUSIC -> WAVEFORM -> DRAG WINDOW -> LOCK (10.5s - 16.5s)
    // ----------------------------------------------------
    {
      id: 'scene-3a',
      start: 10500,
      end: 13200,
      bg: '#080407',
      theme: 'dark',
      aura: 'radial-gradient(circle at 50% 50%, rgba(244, 63, 94, 0.40), rgba(168, 85, 247, 0.30), transparent 75%)',
      render: () => `
        <div class="stage-scene scene-music-morph">
          <div class="music-word-to-wave">
            <span class="music-morph-word">${splitLetters('MUSIC', 0.1, 0.06, 'char-music')}</span>
            <div class="music-morph-bars" aria-hidden="true">
              <span class="morph-bar"></span>
              <span class="morph-bar"></span>
              <span class="morph-bar"></span>
              <span class="morph-bar"></span>
              <span class="morph-bar"></span>
              <span class="morph-bar"></span>
              <span class="morph-bar"></span>
            </div>
          </div>
          <h3 class="music-nonstop-text">${splitLetters('Plays non-stop.', 0.85, 0.04, 'char-lead')}</h3>
        </div>
      `
    },
    {
      id: 'scene-3b',
      start: 13200,
      end: 16500,
      bg: '#050507',
      theme: 'dark',
      render: () => `
        <div class="stage-scene scene-drag-lock-window">
          <!-- Dragged-in Glass Window Sheet -->
          <div class="drag-sheet-card">
            <!-- Word-by-word progressive zoom line -->
            <div class="zoom-words-row" id="zoom-words-container">
              <span class="zoom-word w1">Even</span>
              <span class="zoom-word w2">when</span>
              <span class="zoom-word w3">your</span>
              <span class="zoom-word w4">phone</span>
              <span class="zoom-word w5">is</span>
              <span class="zoom-word w6">locked.</span>
            </div>

            <!-- Morphing Animated Padlock SVG -->
            <div class="padlock-animation-wrap" id="padlock-wrap">
              <svg class="padlock-svg" viewBox="0 0 80 90" width="64" height="72">
                <!-- Semicircular Shackle dropping down -->
                <path class="padlock-shackle" d="M 24 45 L 24 24 C 24 12, 56 12, 56 24 L 56 45" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>
                <!-- Solid rectangular body -->
                <rect class="padlock-body" x="12" y="42" width="56" height="42" rx="10" fill="#ffffff"/>
                <!-- Keyhole -->
                <circle cx="40" cy="58" r="4.5" fill="#000000"/>
                <path d="M 38 60 L 42 60 L 41 72 L 39 72 Z" fill="#000000"/>
              </svg>
              <span class="padlock-status-badge">LOCKED</span>
            </div>
          </div>
        </div>
      `
    },

    // ----------------------------------------------------
    // SCENE 4: LOCK SCREEN FLOATING WIDGET (16.5s - 20.5s)
    // ----------------------------------------------------
    {
      id: 'scene-4',
      start: 16500,
      end: 20500,
      bg: '#09090c',
      theme: 'dark',
      aura: 'radial-gradient(circle at 60% 40%, rgba(59, 130, 246, 0.35), rgba(14, 165, 233, 0.2), transparent 75%)',
      render: () => `
        <div class="stage-scene scene-lock-widget">
          <!-- Floating Apple Lock Screen Glass Card -->
          <div class="mini-lock-card">
            <div class="mini-lock-top">
              <div class="mini-art-squircle">
                <img src="song/Screenshot 2026-10-24 224431.png" alt="Cover" class="mini-art-img">
              </div>
              <div class="mini-meta">
                <span class="mini-title">Lock Screen Player</span>
                <span class="mini-artist">Bluetooth & MediaSession</span>
              </div>
              <div class="mini-bt-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2.5">
                  <polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5"></polyline>
                </svg>
              </div>
            </div>
            <!-- Live Active Scrubber Bar -->
            <div class="mini-scrubber-track">
              <div class="mini-scrubber-fill"></div>
            </div>
          </div>

          <div class="lock-widget-bottom-text">
            <h2 class="lock-headline-bold">${splitLetters('Lock Screen.', 0.2, 0.045, 'char-headline')}</h2>
            <span class="lock-sub-lead">${splitLetters('Total Control.', 0.75, 0.04, 'char-accent')}</span>
          </div>
        </div>
      `
    },

    // ----------------------------------------------------
    // SCENE 5: PURE MINIMAL OUTRO (20.5s - 24.5s)
    // Strictly: OS 1.3 + Update Now (No fluff!)
    // ----------------------------------------------------
    {
      id: 'scene-5',
      start: 20500,
      end: 24500,
      bg: '#000000',
      theme: 'dark',
      render: () => `
        <div class="stage-scene scene-pure-outro">
          <h1 class="outro-pure-os">${splitLetters('OS 1.3', 0.2, 0.08, 'char-pure-os')}</h1>
          <button type="button" class="outro-update-now-btn" id="outro-update-btn">
            <span>Update Now</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      `
    }
  ];

  let adStageEl = null;
  let viewportEl = null;
  let ambientAuraEl = null;
  let progressFillEl = null;
  let isRunning = false;
  let startTime = null;
  let animId = null;
  let currentStageIndex = -1;

  function initMotionAd() {
    adStageEl = document.getElementById('apple-motion-ad-stage');
    if (!adStageEl) return;

    viewportEl = document.getElementById('ad-viewport');
    ambientAuraEl = document.getElementById('ad-ambient-aura');
    progressFillEl = document.getElementById('ad-progress-fill');

    // Tapping anywhere on the motion ad smoothly navigates to Settings -> Software Update
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
    currentStageIndex = -1;
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

    // Timeline fill
    if (progressFillEl) {
      progressFillEl.style.width = (loopProgress * 100).toFixed(1) + '%';
    }

    // Identify active stage
    let activeIdx = 0;
    for (let i = 0; i < STAGES.length; i++) {
      if (elapsed >= STAGES[i].start && elapsed < STAGES[i].end) {
        activeIdx = i;
        break;
      }
    }

    const stage = STAGES[activeIdx];

    // On Stage Switch
    if (activeIdx !== currentStageIndex) {
      currentStageIndex = activeIdx;

      // Update background & ambient aura
      adStageEl.style.backgroundColor = stage.bg;
      adStageEl.setAttribute('data-theme', stage.theme);
      if (ambientAuraEl) {
        ambientAuraEl.style.background = stage.aura || 'transparent';
      }

      if (viewportEl) {
        viewportEl.innerHTML = stage.render();
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
