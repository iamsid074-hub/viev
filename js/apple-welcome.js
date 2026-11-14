/* =========================================================
   LIVE CLOCK & 17 NOV COUNTDOWN ENGINE
   Countdown Target: 17 November 2026 at 00:00:00 AM (12:00 AM Midnight)
   Met on: 31 January 2026 at 01:16 AM
   Apple Watch Fluid Soft Flip Morph per-digit counter
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  // Target: 17 Nov 2026 at 00:00:00 AM (12:00 AM Midnight IST)
  const COUNTDOWN_TARGET = new Date(2026, 10, 17, 0, 0, 0);
  // Met on 31 Jan 2026 at 1:16:00 AM local time
  const MET_DATE = new Date(2026, 0, 31, 1, 16, 0);

  const clockContainer = document.getElementById('apple-live-clock');
  const milestoneLabelEl = document.getElementById('clock-milestone-label') || document.querySelector('.milestone-label');
  const daysEl = document.getElementById('counter-days');
  const hoursEl = document.getElementById('counter-hours');
  const minsEl = document.getElementById('counter-minutes');
  const secsEl = document.getElementById('counter-seconds');

  const barDays = document.getElementById('bar-days-fill');
  const barHours = document.getElementById('bar-hours-fill');
  const barMinutes = document.getElementById('bar-minutes-fill');
  const barSeconds = document.getElementById('bar-seconds-fill');

  // Universal 17 Nov Birthday Countdown for all IDs (Digi 3009/3011 & Virat 1711)
  // Default mode: 'countdown' | Tapping flips between 'countdown' and 'together'
  let clockMode = 'countdown';

  function updateSegmentDigits(container, newStr, isInitial = false) {
    if (!container) return;
    const targetChars = String(newStr).split('');
    let slots = Array.from(container.querySelectorAll(':scope > .digit-slot'));

    // Clear any non-slot nodes or rebuild if digit count changed
    if (isInitial || slots.length === 0 || slots.length !== targetChars.length) {
      container.innerHTML = '';
      slots = [];
      targetChars.forEach(() => {
        const slot = document.createElement('span');
        slot.className = 'digit-slot';
        container.appendChild(slot);
        slots.push(slot);
      });
    }

    targetChars.forEach((char, index) => {
      const slot = slots[index];
      const currentCharEl = slot.querySelector('.digit-char.digit-active');
      const currentChar = currentCharEl ? currentCharEl.textContent : null;

      if (currentChar === char) {
        return; // Character hasn't changed
      }

      if (isInitial || !currentCharEl) {
        // Immediate clean render on first run without blur artifact
        slot.innerHTML = '';
        const newCharEl = document.createElement('span');
        newCharEl.className = 'digit-char digit-active';
        newCharEl.textContent = char;
        slot.appendChild(newCharEl);
        return;
      }

      // Remove any previously departing digit before starting new transition
      slot.querySelectorAll('.digit-out').forEach(el => el.remove());

      // Morph old character out with blur
      currentCharEl.classList.remove('digit-active');
      currentCharEl.classList.add('digit-out');
      setTimeout(() => {
        currentCharEl.remove();
      }, 400);

      // Morph new character in with blur
      const newCharEl = document.createElement('span');
      newCharEl.className = 'digit-char digit-in-start';
      newCharEl.textContent = char;
      slot.appendChild(newCharEl);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          newCharEl.classList.remove('digit-in-start');
          newCharEl.classList.add('digit-active');
        });
      });
    });
  }

  let isFirstRun = true;

  function updateLiveCounter() {
    const now = new Date();
    let days = 0, hours = 0, minutes = 0, seconds = 0;

    if (clockMode === 'countdown') {
      const diffMs = COUNTDOWN_TARGET - now;
      if (diffMs > 0) {
        const totalSeconds = Math.floor(diffMs / 1000);
        days = Math.floor(totalSeconds / 86400);
        hours = Math.floor((totalSeconds % 86400) / 3600);
        minutes = Math.floor((totalSeconds % 3600) / 60);
        seconds = totalSeconds % 60;
        if (milestoneLabelEl) milestoneLabelEl.textContent = 'Days To 17 Nov';
      } else {
        days = 0;
        hours = 0;
        minutes = 0;
        seconds = 0;
        if (milestoneLabelEl) milestoneLabelEl.textContent = "It's 17 Nov! 🎂";
      }
    } else {
      // 'together' mode
      const diffMs = Math.max(0, now - MET_DATE);
      const totalSeconds = Math.floor(diffMs / 1000);
      days = Math.floor(totalSeconds / 86400);
      hours = Math.floor((totalSeconds % 86400) / 3600);
      minutes = Math.floor((totalSeconds % 3600) / 60);
      seconds = totalSeconds % 60;
      if (milestoneLabelEl) milestoneLabelEl.textContent = 'Days Together';
    }

    // Update with Apple Watch soft flip morph blur animation
    updateSegmentDigits(daysEl, String(days), isFirstRun);
    updateSegmentDigits(hoursEl, String(hours).padStart(2, '0'), isFirstRun);
    updateSegmentDigits(minsEl, String(minutes).padStart(2, '0'), isFirstRun);
    updateSegmentDigits(secsEl, String(seconds).padStart(2, '0'), isFirstRun);

    // Dynamic mini progress bar fills
    if (barDays) {
      const dayPct = Math.min(100, Math.max(8, ((days % 365) / 365) * 100));
      barDays.style.width = `${dayPct.toFixed(1)}%`;
    }
    if (barHours) {
      const hourPct = Math.min(100, Math.max(8, (hours / 24) * 100));
      barHours.style.width = `${hourPct.toFixed(1)}%`;
    }
    if (barMinutes) {
      const minPct = Math.min(100, Math.max(8, (minutes / 60) * 100));
      barMinutes.style.width = `${minPct.toFixed(1)}%`;
    }
    if (barSeconds) {
      const secPct = Math.min(100, Math.max(8, (seconds / 60) * 100));
      barSeconds.style.width = `${secPct.toFixed(1)}%`;
    }

    isFirstRun = false;
  }

  // Allow clicking the clock pill to toggle between 17 Nov Countdown and Days Together (All IDs)
  if (clockContainer) {
    clockContainer.style.cursor = 'pointer';
    clockContainer.addEventListener('click', () => {
      clockMode = (clockMode === 'countdown') ? 'together' : 'countdown';
      if (window.triggerHaptic) window.triggerHaptic('light');
      isFirstRun = true;
      updateLiveCounter();
    });
  }

  // Initial immediate call
  updateLiveCounter();

  // Tick every second continuously
  setInterval(updateLiveCounter, 1000);

  // Safe stub for app.js screen transitions
  window.setMovingWelcomeVisible = function() {};

  /* =========================================================
     3.1 ELITE: LIVING BIRTHDAY CANDLES & CELEBRATION ENGINE
     Strictly Gated for ID 1711 (Home Screen Only)
     ========================================================= */
  function evaluateEliteCandlesAccess() {
    let sess = null;
    try {
      sess = window.__vievActiveSession
        || JSON.parse(sessionStorage.getItem('viev_auth_session') || 'null')
        || JSON.parse(localStorage.getItem('viev_auth_session') || 'null');
    } catch (_) {}

    const urlParams = new URLSearchParams(window.location.search);
    const urlEliteOverride = urlParams.get('id') === '1711' || urlParams.get('user') === '1711' || urlParams.get('code') === '1711' || urlParams.has('elite') || window.location.search.includes('1711');

    if (urlEliteOverride) {
      try { localStorage.setItem('viev_last_elite', '1'); } catch (_) {}
    }

    const isDigiExplicit = sess && (sess.code === '3009' || sess.code === '3011' || sess.role === 'digi');
    let rememberedElite = false;
    try { rememberedElite = localStorage.getItem('viev_last_elite') === '1'; } catch (_) {}

    const is1711 = !isDigiExplicit && (urlEliteOverride || !!(sess && (sess.code === '1711' || sess.role === 'user')) || rememberedElite);
    const container = document.getElementById('elite-birthday-candles');
    const hbdBanner = document.getElementById('elite-hbd-banner');
    const mangalBanner = document.getElementById('mangal-rang-cinematic-banner');

    if (is1711) {
      document.body.classList.add('is-elite-1711');
      if (container) container.style.setProperty('display', 'block', 'important');
      if (hbdBanner) hbdBanner.style.setProperty('display', 'flex', 'important');
      if (mangalBanner) mangalBanner.style.setProperty('display', 'none', 'important');
    } else {
      document.body.classList.remove('is-elite-1711');
      if (container) container.style.setProperty('display', 'none', 'important');
      if (hbdBanner) hbdBanner.style.setProperty('display', 'none', 'important');
      if (mangalBanner) mangalBanner.style.removeProperty('display');
    }
  }

  // Interactive tap / micro-animation for both candles
  const leftCandle = document.getElementById('elite-candle-left');
  const rightCandle = document.getElementById('elite-candle-right');

  function bindCandleTap(candleEl) {
    if (!candleEl) return;
    candleEl.addEventListener('click', (e) => {
      e.stopPropagation();
      candleEl.classList.remove('is-flaring');
      void candleEl.offsetWidth; // trigger reflow
      candleEl.classList.add('is-flaring');

      if (window.triggerHaptic) {
        window.triggerHaptic('medium');
      } else if (navigator.vibrate) {
        navigator.vibrate([25, 35, 25]);
      }

      setTimeout(() => {
        candleEl.classList.remove('is-flaring');
      }, 800);
    });
  }

  bindCandleTap(leftCandle);
  bindCandleTap(rightCandle);

  // Interactive Happy Birthday Neetu Celebration Button Tap
  const hbdBtn = document.getElementById('elite-hbd-title-link') || document.getElementById('elite-hbd-btn');
  if (hbdBtn) {
    hbdBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.triggerHaptic) {
        window.triggerHaptic('medium');
      } else if (navigator.vibrate) {
        navigator.vibrate([30, 40, 30]);
      }

      // Flare both candles synchronously
      if (leftCandle) leftCandle.dispatchEvent(new Event('click'));
      if (rightCandle) rightCandle.dispatchEvent(new Event('click'));

      // Launch celebration confetti burst
      triggerBirthdayConfetti();
    });
  }

  function triggerBirthdayConfetti() {
    const colors = ['#fbbf24', '#f43f5e', '#38bdf8', '#c084fc', '#fbcfe8', '#34d399', '#ffffff'];
    for (let i = 0; i < 26; i++) {
      const conf = document.createElement('div');
      conf.className = 'elite-screen-confetti';
      const color = colors[Math.floor(Math.random() * colors.length)];
      const startX = 50 + (Math.random() * 20 - 10);
      const destX = (Math.random() * 80 - 40);
      const destY = -120 - Math.random() * 240;
      const rot = Math.random() * 720 - 360;
      const isCircle = Math.random() > 0.45;

      conf.style.cssText = `
        position: fixed;
        bottom: 110px;
        left: ${startX}%;
        width: ${isCircle ? '7px' : '8px'};
        height: ${isCircle ? '7px' : '13px'};
        border-radius: ${isCircle ? '50%' : '2px'};
        background: ${color};
        box-shadow: 0 0 8px ${color};
        pointer-events: none;
        z-index: 10000;
        transition: transform 1.8s cubic-bezier(0.12, 0.8, 0.32, 1), opacity 1.8s ease;
      `;
      document.body.appendChild(conf);

      requestAnimationFrame(() => {
        conf.style.transform = `translate3d(${destX}vw, ${destY}px, 0) rotate(${rot}deg) scale(${0.4 + Math.random() * 0.8})`;
        conf.style.opacity = '0';
      });

      setTimeout(() => {
        conf.remove();
      }, 1900);
    }
  }

  evaluateEliteCandlesAccess();
  window.evaluateEliteCandlesAccess = evaluateEliteCandlesAccess;

  // Listen for storage or session events & periodic check
  window.addEventListener('storage', evaluateEliteCandlesAccess);
  window.addEventListener('viev:session-changed', evaluateEliteCandlesAccess);
  setInterval(evaluateEliteCandlesAccess, 600);
});
