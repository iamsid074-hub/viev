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

  // Mode: 'countdown' (default) | 'together'
  let clockMode = localStorage.getItem('viev_clock_mode') || 'countdown';

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

  // Allow clicking the clock pill to toggle between 17 Nov Countdown and Days Together
  if (clockContainer) {
    clockContainer.style.cursor = 'pointer';
    clockContainer.addEventListener('click', () => {
      clockMode = (clockMode === 'countdown') ? 'together' : 'countdown';
      localStorage.setItem('viev_clock_mode', clockMode);
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
});
