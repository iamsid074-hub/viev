/* =========================================================
   VIEVS - PUSH NOTIFICATIONS & ALERTS ENGINE
   Native Service Worker + Apple-Style Permission Experience
   Dedicated for Princess Digi & Honey
   ========================================================= */

(function () {
  'use strict';

  let swRegistration = null;

  const NOTIF_CONFIG = {
    icon: 'assets/digi.png',
    badge: 'assets/digi.png',
    sound: 'default'
  };

  // Get active session role
  function getActiveUserRole() {
    try {
      const sess = JSON.parse(localStorage.getItem('viev_auth_session') || '{}');
      if (sess && (sess.code === '3009' || sess.code === '3011' || sess.role === 'digi')) return 'digi';
      if (sess && (sess.code === '1711' || sess.role === 'user')) return 'user';
      if (sess && sess.role) return sess.role;
    } catch (e) {}
    return 'digi';
  }

  // Preference Helpers
  function isNotifEnabled() {
    return 'Notification' in window && Notification.permission === 'granted' && localStorage.getItem('viev_notif_enabled') !== 'false';
  }

  function getPref(key, defaultValue = true) {
    const val = localStorage.getItem('viev_notif_pref_' + key);
    return val === null ? defaultValue : val === 'true';
  }

  function setPref(key, value) {
    localStorage.setItem('viev_notif_pref_' + key, String(value));
  }

  // Initialize Service Worker
  async function initServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.warn('[Push] Service Workers are not supported in this browser.');
      return null;
    }

    try {
      swRegistration = await navigator.serviceWorker.register('./sw.js', { scope: './' });
      console.log('[Push] Service Worker registered with scope:', swRegistration.scope);

      // Listen for message from SW (e.g. when user clicks a notification)
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);

      return swRegistration;
    } catch (error) {
      console.error('[Push] Service Worker registration failed:', error);
      return null;
    }
  }

  // Handle click dispatched from Service Worker
  function handleServiceWorkerMessage(event) {
    if (!event.data || event.data.type !== 'NOTIFICATION_CLICKED') return;

    const action = event.data.action;
    const notifData = event.data.data || {};

    if (action === 'open_note') {
      // Switch to Home screen and toggle note
      if (typeof window.switchPage === 'function') {
        window.switchPage('home');
      } else {
        const homeBtn = document.getElementById('tab-home');
        if (homeBtn) homeBtn.click();
      }

      // Smooth scroll to Daily Note
      setTimeout(() => {
        const noteEl = document.getElementById('daily-note-capsule') || document.querySelector('.daily-note-container');
        if (noteEl) {
          noteEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          noteEl.classList.add('note-highlight-pulse');
          setTimeout(() => noteEl.classList.remove('note-highlight-pulse'), 2500);
        }
      }, 400);
    } else if (action === 'open_music') {
      if (typeof window.switchPage === 'function') {
        window.switchPage('music');
      } else {
        const musicBtn = document.getElementById('tab-music');
        if (musicBtn) musicBtn.click();
      }
    } else if (action === 'open_cinema') {
      if (typeof window.switchPage === 'function') {
        window.switchPage('cinema');
      } else {
        const cinemaBtn = document.getElementById('tab-cinema');
        if (cinemaBtn) cinemaBtn.click();
      }
    }
  }

  // Request Notification Permission
  async function requestNotificationPermission() {
    if (!('Notification' in window)) {
      alert('Notifications are not supported on this browser or platform.');
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        localStorage.setItem('viev_notif_enabled', 'true');
        dismissPermissionBanner();
        updateSettingsUI();

        // Send confirmation welcome notification
        sendLocalNotification({
          title: 'Digi Viev • Notifications Active 🔔',
          body: 'You are all set! You will receive daily notes, track drops & special alerts.',
          tag: 'viev-welcome'
        });
      } else {
        localStorage.setItem('viev_notif_enabled', 'false');
        updateSettingsUI();
      }
      return permission;
    } catch (e) {
      console.error('[Push] Error requesting permission:', e);
      return 'denied';
    }
  }

  // Send a Notification (via Service Worker or fallback Notification constructor)
  async function sendLocalNotification({ title, body, icon, badge, tag, data }) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return false;
    }

    const notifOptions = {
      body: body || '',
      icon: icon || NOTIF_CONFIG.icon,
      badge: badge || NOTIF_CONFIG.badge,
      tag: tag || 'viev-alert-' + Date.now(),
      data: data || { url: './index.html', action: 'open_home' },
      vibrate: [100, 50, 100],
      renotify: true
    };

    if (swRegistration && swRegistration.showNotification) {
      try {
        await swRegistration.showNotification(title || 'Digi Viev', notifOptions);
        return true;
      } catch (err) {
        console.warn('[Push] SW showNotification failed, using fallback:', err);
      }
    }

    // Direct fallback
    try {
      const n = new Notification(title || 'Digi Viev', notifOptions);
      n.onclick = () => {
        window.focus();
        if (data && data.action) {
          handleServiceWorkerMessage({ data: { type: 'NOTIFICATION_CLICKED', action: data.action, data: data } });
        }
        n.close();
      };
      return true;
    } catch (e) {
      console.error('[Push] Notification constructor failed:', e);
      return false;
    }
  }

  // Check for New Daily Note and notify Digi
  function checkNewDailyNoteAlert() {
    if (!isNotifEnabled() || !getPref('daily_note', true)) return;

    if (typeof window.DAILY_NOTE_CONFIG === 'undefined' || !window.DAILY_NOTE_CONFIG.noteText) {
      return;
    }

    const noteConfig = window.DAILY_NOTE_CONFIG;
    const currentNoteId = noteConfig.questionId || noteConfig.noteText.slice(0, 32).trim();
    const lastNotifiedNoteId = localStorage.getItem('viev_last_notified_note_id');

    if (lastNotifiedNoteId !== currentNoteId) {
      // First line of note snippet
      const firstLine = noteConfig.noteText.split('\n')[0].trim();
      const previewText = firstLine.length > 55 ? firstLine.slice(0, 52) + '...' : firstLine;

      setTimeout(() => {
        sendLocalNotification({
          title: '💌 Honey Ka Naya Note Aaya Hai',
          body: `"${previewText}" — Touch to open`,
          tag: 'viev-daily-note-' + currentNoteId,
          data: { url: './index.html', action: 'open_note' }
        });
        localStorage.setItem('viev_last_notified_note_id', currentNoteId);
      }, 2000);
    }
  }

  // Daily Sweet Reminder (Scheduled check)
  function checkDailySweetReminder() {
    if (!isNotifEnabled() || !getPref('sweet_pings', true)) return;

    const todayDateStr = new Date().toDateString();
    const lastPingDate = localStorage.getItem('viev_last_daily_ping_date');

    if (lastPingDate !== todayDateStr) {
      const hours = new Date().getHours();
      // Only fire during morning / afternoon (between 8:00 AM and 10:00 PM)
      if (hours >= 9 && hours <= 22) {
        const reminders = [
          { title: 'Good Morning Princess Digi', body: 'Aapka din bohot pyaara ho! Ek baar Daily Note check karlo ❤️' },
          { title: 'Digi Viev Reminder', body: 'Honey misses you! Paani peelo aur thoda rest lelo ❤️' },
          { title: 'Special Dedication for You', body: 'Arijit Singh ka ek song aapke liye queue me ready hai. Touch to listen!' }
        ];
        const randomPick = reminders[Math.floor(Math.random() * reminders.length)];

        setTimeout(() => {
          sendLocalNotification({
            title: randomPick.title,
            body: randomPick.body,
            tag: 'viev-sweet-ping-' + Date.now(),
            data: { url: './index.html', action: 'open_note' }
          });
          localStorage.setItem('viev_last_daily_ping_date', todayDateStr);
        }, 5000);
      }
    }
  }

  // In-App Apple Glassmorphism Permission Banner Prompt
  function renderPermissionBanner() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted' || Notification.permission === 'denied') return;
    if (sessionStorage.getItem('viev_notif_prompt_dismissed') === 'true') return;
    if (document.getElementById('apple-notif-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'apple-notif-banner';
    banner.className = 'apple-notif-banner';
    banner.innerHTML = `
      <div class="notif-banner-glass">
        <div class="notif-banner-icon-wrap">
          <div class="notif-banner-glow"></div>
          <span class="notif-banner-bell">🔔</span>
        </div>
        <div class="notif-banner-content">
          <span class="notif-banner-kicker">Princess Digi & Honey</span>
          <h4 class="notif-banner-title">Turn On Notifications</h4>
          <p class="notif-banner-desc">Get instant alerts when Honey writes a new Daily Note, dedicates a song, or drops a surprise update ❤️</p>
          <div class="notif-banner-actions">
            <button class="notif-action-btn primary" id="notif-allow-btn" type="button">
              <span>Enable Alerts</span>
            </button>
            <button class="notif-action-btn secondary" id="notif-dismiss-btn" type="button">
              <span>Not Now</span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    // Animate In smoothly
    requestAnimationFrame(() => {
      banner.classList.add('is-visible');
    });

    const allowBtn = document.getElementById('notif-allow-btn');
    const dismissBtn = document.getElementById('notif-dismiss-btn');

    if (allowBtn) {
      allowBtn.addEventListener('click', async () => {
        await requestNotificationPermission();
      });
    }

    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        dismissPermissionBanner();
      });
    }
  }

  function dismissPermissionBanner() {
    const banner = document.getElementById('apple-notif-banner');
    if (banner) {
      banner.classList.remove('is-visible');
      sessionStorage.setItem('viev_notif_prompt_dismissed', 'true');
      setTimeout(() => banner.remove(), 400);
    }
  }

  // Update Settings Subpage UI
  function updateSettingsUI() {
    const statusTextEl = document.getElementById('notif-status-text');
    const statusDotEl = document.getElementById('notif-status-dot');
    const toggleMasterEl = document.getElementById('notif-master-toggle');
    const pillStatusIndicator = document.getElementById('notif-status-indicator');

    const perm = ('Notification' in window) ? Notification.permission : 'unsupported';
    const isGranted = perm === 'granted';

    if (pillStatusIndicator) {
      pillStatusIndicator.className = 'pill-status-dot ' + (isGranted ? 'granted' : (perm === 'denied' ? 'denied' : 'default'));
    }

    if (statusTextEl) {
      if (perm === 'granted') {
        statusTextEl.textContent = 'Active & Allowed';
        statusTextEl.style.color = '#34c759';
      } else if (perm === 'denied') {
        statusTextEl.textContent = 'Blocked in Browser Settings';
        statusTextEl.style.color = '#ff453a';
      } else {
        statusTextEl.textContent = 'Tap to Enable';
        statusTextEl.style.color = '#ff9f0a';
      }
    }

    if (statusDotEl) {
      statusDotEl.className = 'notif-dot ' + (isGranted ? 'granted' : (perm === 'denied' ? 'denied' : 'default'));
    }

    if (toggleMasterEl) {
      toggleMasterEl.checked = isGranted && localStorage.getItem('viev_notif_enabled') !== 'false';
    }

    // Set toggle states for preferences
    const toggleDailyNote = document.getElementById('notif-pref-daily-note');
    const toggleSongDay = document.getElementById('notif-pref-song-day');
    const toggleSweetPings = document.getElementById('notif-pref-sweet-pings');

    if (toggleDailyNote) toggleDailyNote.checked = getPref('daily_note', true);
    if (toggleSongDay) toggleSongDay.checked = getPref('song_day', true);
    if (toggleSweetPings) toggleSweetPings.checked = getPref('sweet_pings', true);
  }

  // Bind Settings Subpage Buttons
  function bindSettingsEvents() {
    const toggleMaster = document.getElementById('notif-master-toggle');
    const testBtn = document.getElementById('notif-test-btn');
    const requestPermBtn = document.getElementById('notif-request-perm-btn');

    const toggleDailyNote = document.getElementById('notif-pref-daily-note');
    const toggleSongDay = document.getElementById('notif-pref-song-day');
    const toggleSweetPings = document.getElementById('notif-pref-sweet-pings');

    if (toggleMaster) {
      toggleMaster.addEventListener('change', async (e) => {
        if (e.target.checked) {
          if (Notification.permission !== 'granted') {
            const p = await requestNotificationPermission();
            e.target.checked = p === 'granted';
          } else {
            localStorage.setItem('viev_notif_enabled', 'true');
            updateSettingsUI();
          }
        } else {
          localStorage.setItem('viev_notif_enabled', 'false');
          updateSettingsUI();
        }
      });
    }

    if (requestPermBtn) {
      requestPermBtn.addEventListener('click', async () => {
        await requestNotificationPermission();
      });
    }

    if (testBtn) {
      testBtn.addEventListener('click', async () => {
        if (Notification.permission !== 'granted') {
          const res = await requestNotificationPermission();
          if (res !== 'granted') return;
        }

        const role = getActiveUserRole();
        const testTitle = role === 'user' ? 'Digi Viev • Honey Test 🔔' : 'Digi Viev • Princess Digi ❤️';
        const testBody = 'Notification engine is working smoothly on your device! Perfect for daily notes & love drops ✨';

        sendLocalNotification({
          title: testTitle,
          body: testBody,
          tag: 'viev-test-' + Date.now(),
          data: { url: './index.html', action: 'open_home' }
        });

        // Haptic feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate([60, 40, 60]);
        }
      });
    }

    if (toggleDailyNote) {
      toggleDailyNote.addEventListener('change', (e) => setPref('daily_note', e.target.checked));
    }
    if (toggleSongDay) {
      toggleSongDay.addEventListener('change', (e) => setPref('song_day', e.target.checked));
    }
    if (toggleSweetPings) {
      toggleSweetPings.addEventListener('change', (e) => setPref('sweet_pings', e.target.checked));
    }

    // Honey's Quick Custom Ping Composer
    const customPingBtn = document.getElementById('sid-send-ping-btn');
    const customPingInput = document.getElementById('sid-ping-text-input');
    if (customPingBtn && customPingInput) {
      customPingBtn.addEventListener('click', () => {
        const text = customPingInput.value.trim();
        if (!text) return;

        sendLocalNotification({
          title: '💌 Honey Ka Message ❤️',
          body: text,
          tag: 'honey-ping-' + Date.now(),
          data: { url: './index.html', action: 'open_note' }
        });

        customPingInput.value = '';
        customPingBtn.textContent = 'Sent! ✨';
        setTimeout(() => {
          customPingBtn.textContent = 'Send Alert';
        }, 2000);
      });
    }
  }

  // Public Interface for VIEVS
  window.vievNotifications = {
    requestPermission: requestNotificationPermission,
    sendNotification: sendLocalNotification,
    checkDailyNote: checkNewDailyNoteAlert,
    checkDailyPing: checkDailySweetReminder,
    updateUI: updateSettingsUI
  };

  // Auto-init on DOM Ready
  document.addEventListener('DOMContentLoaded', async () => {
    await initServiceWorker();
    updateSettingsUI();
    bindSettingsEvents();

    // Check for new daily note alert
    setTimeout(checkNewDailyNoteAlert, 1800);

    // Check for daily reminder
    setTimeout(checkDailySweetReminder, 4000);

    // Show Apple prompt banner after 3.5 seconds if not yet asked
    setTimeout(renderPermissionBanner, 3500);
  });
})();

