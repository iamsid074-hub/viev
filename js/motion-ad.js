/**
 * Digi OS 1.3 - Official Apple "Don't Blink" Kinetic Motion Typography Video Engine
 * Fast-paced, punchy, rhythmic word flashes synced to an Apple-style keynote beat.
 * High-contrast cuts (White / Black), dynamic camera angles, 3D tilts, kinetic scaling.
 * Direct replacement of the Home Hero photo while OS < 1.3.
 */

(function() {
  'use strict';

  // 22 Fast-paced Kinetic Beats (Total Duration: 12.2s)
  const BEATS = [
    {
      time: 0,
      text: "DON'T BLINK.",
      bg: '#ffffff',
      color: '#000000',
      type: 'zoom-in',
      sound: 'kick',
      haptic: 'medium'
    },
    {
      time: 550,
      text: "READY?",
      bg: '#000000',
      color: '#ffffff',
      type: 'punch-rotate',
      sound: 'click',
      haptic: 'light'
    },
    {
      time: 1050,
      text: "MUSIC.",
      bg: '#ffffff',
      color: '#000000',
      type: 'slide-left',
      sound: 'bass',
      haptic: 'medium'
    },
    {
      time: 1500,
      text: "NON-STOP.",
      bg: '#000000',
      color: '#ffffff',
      type: 'extreme-slam',
      sound: 'kick',
      haptic: 'heavy'
    },
    {
      time: 2100,
      text: "SCREEN OFF?",
      bg: '#ffffff',
      color: '#000000',
      type: 'tilt-up',
      sound: 'click',
      haptic: 'light'
    },
    {
      time: 2550,
      text: "LOCK IT.",
      bg: '#000000',
      color: '#ffffff',
      type: 'zoom-in',
      sound: 'bass',
      haptic: 'medium'
    },
    {
      time: 3000,
      text: "STILL PLAYS.",
      bg: '#ffffff',
      color: '#000000',
      type: 'extreme-slam',
      sound: 'kick',
      haptic: 'heavy'
    },
    {
      time: 3600,
      text: "EVERY.",
      bg: '#000000',
      color: '#ffffff',
      type: 'flash-left',
      sound: 'click',
      haptic: 'light'
    },
    {
      time: 3950,
      text: "SINGLE.",
      bg: '#ffffff',
      color: '#000000',
      type: 'flash-right',
      sound: 'click',
      haptic: 'light'
    },
    {
      time: 4300,
      text: "WORD.",
      bg: '#000000',
      color: '#ffffff',
      type: 'extreme-slam',
      sound: 'kick',
      haptic: 'heavy'
    },
    {
      time: 4800,
      text: "SYNCED.",
      sub: "REAL-TIME LYRICS",
      bg: '#ffffff',
      color: '#000000',
      type: 'karaoke-glow',
      sound: 'bass',
      haptic: 'medium'
    },
    {
      time: 5450,
      text: "SING ALONG.",
      bg: '#000000',
      color: '#ffffff',
      type: 'slide-up',
      sound: 'kick',
      haptic: 'medium'
    },
    {
      time: 6000,
      text: "LOCK SCREEN.",
      bg: '#ffffff',
      color: '#000000',
      type: 'vertical-split',
      sound: 'click',
      haptic: 'light'
    },
    {
      time: 6550,
      text: "TOTAL CONTROL.",
      bg: '#000000',
      color: '#ffffff',
      type: 'extreme-slam',
      sound: 'bass',
      haptic: 'heavy'
    },
    {
      time: 7150,
      text: "FEEL IT.",
      bg: '#ffffff',
      color: '#000000',
      type: 'punch-rotate',
      sound: 'click',
      haptic: 'light'
    },
    {
      time: 7600,
      text: "HAPTICS.",
      sub: "TACTILE FEEDBACK",
      bg: '#000000',
      color: '#ffffff',
      type: 'haptic-pulse',
      sound: 'bass',
      haptic: 'heavy'
    },
    {
      time: 8150,
      text: "FASTER.",
      bg: '#ffffff',
      color: '#000000',
      type: 'flash-left',
      sound: 'click',
      haptic: 'light'
    },
    {
      time: 8550,
      text: "SMOOTHER.",
      bg: '#000000',
      color: '#ffffff',
      type: 'extreme-slam',
      sound: 'kick',
      haptic: 'heavy'
    },
    {
      time: 9050,
      text: "DIGI.",
      bg: '#ffffff',
      color: '#000000',
      type: 'giant-name',
      sound: 'bass',
      haptic: 'medium'
    },
    {
      time: 9550,
      text: "OS 1.3.",
      bg: '#000000',
      color: '#ffffff',
      type: 'giant-version',
      sound: 'kick',
      haptic: 'heavy'
    },
    {
      time: 10200,
      text: "AVAILABLE NOW.",
      cta: "Tap to Update in Settings →",
      bg: '#000000',
      color: '#ffffff',
      type: 'outro-cta',
      sound: 'drop',
      haptic: 'success'
    }
  ];

  const LOOP_DURATION = 12400; // 12.4 seconds

  let adStageEl = null;
  let kineticBoxEl = null;
  let progressFillEl = null;
  let soundToggleBtn = null;
  let isRunning = false;
  let startTime = null;
  let animId = null;
  let lastBeatIndex = -1;
  let isAudioEnabled = false;
  let audioCtx = null;

  // =========================================================
  // APPLE KEYNOTE SYNTHESIZER SOUND ENGINE (Web Audio API)
  // Rhythmic punchy kicks, clicks, and bass hits synced to typography
  // =========================================================
  function getAudioContext() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playSynthSound(type) {
    if (!isAudioEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      if (type === 'kick') {
        // Apple Keynote Heavy Kick
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(36, t + 0.12);
        gain.gain.setValueAtTime(0.7, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.15);
      } else if (type === 'click') {
        // High-precision crisp Apple camera/shutter snap
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1800, t);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.04);
        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.05);
      } else if (type === 'bass') {
        // Sub-bass transient impact
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(95, t);
        osc.frequency.exponentialRampToValueAtTime(42, t + 0.18);
        gain.gain.setValueAtTime(0.65, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.20);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.22);
      } else if (type === 'drop') {
        // Grand resolution chord
        [220, 330, 440].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.25 / (idx + 1), t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.50);
        });
      }
    } catch(e) {}
  }

  // =========================================================
  // KINETIC MOTION STAGE INITIALIZATION & EVENT HANDLERS
  // =========================================================
  function initMotionAd() {
    adStageEl = document.getElementById('apple-motion-ad-stage');
    if (!adStageEl) return;

    kineticBoxEl = document.getElementById('ad-viewport');
    progressFillEl = document.getElementById('ad-progress-fill');

    // Create Audio Sound Toggle Pill in top right
    let soundBtn = document.getElementById('ad-sound-toggle-btn');
    if (!soundBtn) {
      soundBtn = document.createElement('button');
      soundBtn.id = 'ad-sound-toggle-btn';
      soundBtn.className = 'ad-sound-pill';
      soundBtn.type = 'button';
      soundBtn.setAttribute('aria-label', 'Toggle Keynote Beat Audio');
      soundBtn.innerHTML = `
        <svg class="sound-icon-off" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="1" y1="1" x2="23" y2="23"></line>
          <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
          <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
        </svg>
        <svg class="sound-icon-on" style="display:none;" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
        <span class="sound-label">Beat: Muted</span>
      `;
      const topRow = adStageEl.querySelector('.ad-top-row');
      if (topRow) {
        topRow.appendChild(soundBtn);
      }
    }
    soundToggleBtn = soundBtn;

    soundToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Do not trigger settings navigation
      isAudioEnabled = !isAudioEnabled;
      if (isAudioEnabled) {
        getAudioContext();
        playSynthSound('click');
      }
      updateSoundButtonUI();
    });

    // Tapping on the motion ad (outside sound button) opens Settings -> Software Update
    adStageEl.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.triggerHaptic) window.triggerHaptic('medium');

      // First click can also unmute sound if user wants
      if (!isAudioEnabled) {
        isAudioEnabled = true;
        getAudioContext();
        updateSoundButtonUI();
      }

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

  function updateSoundButtonUI() {
    if (!soundToggleBtn) return;
    const iconOff = soundToggleBtn.querySelector('.sound-icon-off');
    const iconOn = soundToggleBtn.querySelector('.sound-icon-on');
    const label = soundToggleBtn.querySelector('.sound-label');

    if (isAudioEnabled) {
      if (iconOff) iconOff.style.display = 'none';
      if (iconOn) iconOn.style.display = 'inline-block';
      if (label) label.textContent = 'Beat: On';
      soundToggleBtn.classList.add('is-active');
    } else {
      if (iconOff) iconOff.style.display = 'inline-block';
      if (iconOn) iconOn.style.display = 'none';
      if (label) label.textContent = 'Beat: Muted';
      soundToggleBtn.classList.remove('is-active');
    }
  }

  function startMotionAd() {
    if (isRunning) return;
    if (!adStageEl) initMotionAd();
    if (!adStageEl) return;

    isRunning = true;
    adStageEl.style.display = 'flex';
    startTime = performance.now();
    lastBeatIndex = -1;
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

  // =========================================================
  // KINETIC MOTION FRAME RENDER LOOP
  // =========================================================
  function renderLoop(now) {
    if (!isRunning || !adStageEl) return;

    if (!startTime) startTime = now;
    const elapsed = (now - startTime) % LOOP_DURATION;
    const progress = elapsed / LOOP_DURATION;

    // Timeline fill
    if (progressFillEl) {
      progressFillEl.style.width = (progress * 100).toFixed(1) + '%';
    }

    // Identify active beat
    let currentIdx = 0;
    for (let i = BEATS.length - 1; i >= 0; i--) {
      if (elapsed >= BEATS[i].time) {
        currentIdx = i;
        break;
      }
    }

    // Trigger on each new beat
    if (currentIdx !== lastBeatIndex) {
      lastBeatIndex = currentIdx;
      const beat = BEATS[currentIdx];

      // Update Stage Background & Theme
      adStageEl.style.backgroundColor = beat.bg;
      adStageEl.setAttribute('data-theme', beat.bg === '#000000' ? 'dark' : 'light');

      // Audio & Physical Haptic Sync
      playSynthSound(beat.sound);
      if (window.triggerHaptic && beat.haptic) {
        window.triggerHaptic(beat.haptic);
      }

      // Render Kinetic Typographic Element
      if (kineticBoxEl) {
        let extraMarkup = '';
        if (beat.sub) {
          extraMarkup += `<span class="kinetic-sub-pill">${beat.sub}</span>`;
        }
        if (beat.cta) {
          extraMarkup += `<div class="kinetic-cta-pill"><span>${beat.cta}</span></div>`;
        }

        kineticBoxEl.innerHTML = `
          <div class="kinetic-word-block kinetic-type-${beat.type}" style="color: ${beat.color};">
            <span class="kinetic-main-text">${beat.text}</span>
            ${extraMarkup}
          </div>
        `;
      }
    }

    animId = requestAnimationFrame(renderLoop);
  }

  // =========================================================
  // VERSION SYNCHRONIZATION (Strict Account Isolation)
  // =========================================================
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
