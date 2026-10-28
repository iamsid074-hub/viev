/* =========================================================
   APP CONTROLLER & LIQUID OS 1.1 NAVIGATION
   No clock, no dynamic island. Clean.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  // Screens
  const welcomeScreen = document.getElementById('welcome-screen');
  const hubScreen = document.getElementById('hub-screen');
  const backBtn = document.getElementById('hub-back-btn');

  // Modals & Sheets
  const settingsModal = document.getElementById('settings-modal');
  const settingsBtn = document.getElementById('settings-btn');
  const osBadgeBtn = document.getElementById('os-badge-btn');
  const settingsCloseBtn = document.getElementById('settings-close-btn');

  const addVideoModal = document.getElementById('add-video-modal');
  const addVideoBtn = document.getElementById('add-video-btn');
  const addVideoCloseBtn = document.getElementById('add-video-close-btn');
  const urlSubmitBtn = document.getElementById('url-submit-btn');
  const videoUrlInput = document.getElementById('video-url-input');

  const memoryModal = document.getElementById('memory-modal');
  const memoryCloseBtn = document.getElementById('memory-close-btn');
  const memoryCards = document.querySelectorAll('.memory-card');

  let cinemaInstance = null;


  // Transition: Hub -> Welcome
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      hubScreen.classList.remove('active');
      welcomeScreen.classList.remove('hidden');

      if (window.setMovingWelcomeVisible) {
        window.setMovingWelcomeVisible(true);
      }

      if (window.setFloatingNavVisible) {
        window.setFloatingNavVisible(true);
      }

      if (cinemaInstance && cinemaInstance.video) {
        cinemaInstance.video.pause();
      }
    });
  }

  // Settings Navigation (Links to Dedicated Settings Screen)
  function openSettings() {
    const tabSettings = document.getElementById('tab-settings');
    if (tabSettings) {
      tabSettings.click();
      return;
    }
    if (settingsModal) settingsModal.classList.add('open');
  }

  function closeSettings() {
    if (settingsModal) settingsModal.classList.remove('open');
  }

  if (settingsBtn) settingsBtn.addEventListener('click', openSettings);
  if (osBadgeBtn) osBadgeBtn.addEventListener('click', openSettings);
  if (settingsCloseBtn) settingsCloseBtn.addEventListener('click', closeSettings);
  if (settingsModal) {
    settingsModal.addEventListener('click', (e) => {
      if (e.target === settingsModal) closeSettings();
    });
  }

  // Add Video Modal
  function openAddVideo() {
    if (addVideoModal) addVideoModal.classList.add('open');
  }

  function closeAddVideo() {
    if (addVideoModal) addVideoModal.classList.remove('open');
  }

  if (addVideoBtn) addVideoBtn.addEventListener('click', openAddVideo);
  if (addVideoCloseBtn) addVideoCloseBtn.addEventListener('click', closeAddVideo);
  if (addVideoModal) {
    addVideoModal.addEventListener('click', (e) => {
      if (e.target === addVideoModal) closeAddVideo();
    });
  }

  // Video URL Submission
  if (urlSubmitBtn && videoUrlInput) {
    urlSubmitBtn.addEventListener('click', () => {
      const url = videoUrlInput.value.trim();
      if (url && cinemaInstance) {
        cinemaInstance.loadCustomVideo(url, "Direct Viev");
        closeAddVideo();
        videoUrlInput.value = '';
      }
    });
  }

  // Demo Video Presets
  const demoPickerBtns = document.querySelectorAll('.demo-picker-card');
  demoPickerBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const url = btn.getAttribute('data-url');
      const title = btn.getAttribute('data-title');
      if (url && cinemaInstance) {
        cinemaInstance.loadCustomVideo(url, title);
        closeAddVideo();
      }
    });
  });

  // Memory Cards Modals
  memoryCards.forEach(card => {
    card.addEventListener('click', () => {
      const title = card.getAttribute('data-title') || "Special Memory";
      const text = card.getAttribute('data-text') || "A special moment preserved forever.";
      
      const modalTitle = document.getElementById('memory-modal-title');
      const modalText = document.getElementById('memory-modal-text');
      if (modalTitle) modalTitle.textContent = title;
      if (modalText) modalText.textContent = text;

      if (memoryModal) memoryModal.classList.add('open');
    });
  });

  if (memoryCloseBtn) {
    memoryCloseBtn.addEventListener('click', () => {
      if (memoryModal) memoryModal.classList.remove('open');
    });
  }

  if (memoryModal) {
    memoryModal.addEventListener('click', (e) => {
      if (e.target === memoryModal) memoryModal.classList.remove('open');
    });
  }

  // Settings iPhone-Style Drill-Down Navigation
  const settingsViewport = document.getElementById('settings-nav-viewport');
  const navPills = document.querySelectorAll('.settings-nav-pill');
  const settingsBackBtn = document.getElementById('settings-back-btn');
  const subpagePanels = document.querySelectorAll('.subpage-body-container');

  // Fallback track list in case window.PLAYLIST isn't populated yet
  const FALLBACK_PLAYLIST = [
    {
      title: 'Ve Haaniyaan',
      artist: 'Danny • Avvy Sra',
      cover: 'song/Screenshot 2026-10-24 224431.png'
    },
    {
      title: 'Samjhawan',
      artist: 'Arijit Singh • Shreya Ghoshal',
      cover: 'song/Screenshot 2026-10-24 224416.png'
    },
    {
      title: 'Mujhe Ishq Hua Hai',
      artist: 'Kaifi Khalil',
      cover: 'song/Screenshot 2026-10-24 224341.png'
    },
    {
      title: 'Phir Le Aya Dil (Reprise)',
      artist: 'Arijit Singh • Pritam',
      cover: 'song/Screenshot 2026-10-24 224316.png'
    },
    {
      title: 'Tu Tu Hai Wohi',
      artist: 'Kishore Kumar • Asha Bhosle',
      cover: 'song/Screenshot 2026-10-24 224447.png'
    },
    {
      title: 'Abhi Na Jao Chhod Kar',
      artist: 'Mohammed Rafi • Asha Bhosle',
      cover: 'song/Screenshot 2026-10-25 065342.png'
    }
  ];

  // =========================================================
  // OS VERSION & FIRMWARE UPDATE ENGINE (OS 1.1 -> OS 1.3 / OS 2.0 BETA)
  // Strict Account Isolation:
  // Digi (3009 / 3011) -> viev_digi_os_version (OS 1.1 / OS 1.3, ZERO BETA LEAK)
  // Virat / You (1711) -> viev_user_os_version (OS 1.1 -> OS 2.0 BETA Testing)
  // Default on deploy is OS 1.1. OS 2.0 BETA only available for Virat 1711.
  // =========================================================
  function getSystemVersion(role) {
    let session = null;
    try {
      session = getAuthSession();
    } catch (e) {}

    if (!role) {
      role = session ? session.role : 'digi';
    }
    // Purge any legacy global key to enforce per-profile isolation
    try {
      localStorage.removeItem('viev_global_os_version');
    } catch (e) {}

    const isVirat = (session && (session.code === '1711' || session.role === 'user')) || (role === 'user');
    const key = 'viev_' + (isVirat ? 'user' : 'digi') + '_os_version';
    const stored = localStorage.getItem(key);

    if (isVirat) {
      if (stored === '2.0 BETA') return '2.0 BETA';
      if (stored === '1.3') return '1.3';
      if (stored === '1.0') return '1.0';
      return stored || '1.1'; // Strict default on deploy
    }

    // Digi (3009 / 3011) strictly stays on 1.1 or 1.3 (Zero beta leak!)
    if (stored === '1.3') return '1.3';
    if (stored === '1.0') return '1.0';
    return '1.1'; // Strict default on deploy
  }

  function getPreviousVersion(currentVer) {
    if (currentVer === '2.0 BETA') return '1.1';
    const cur = parseFloat(currentVer);
    if (cur >= 1.3) return '1.1';
    if (cur >= 1.1) return '1.0';
    return '1.0';
  }

  function applySystemVersion(version) {
    const session = getAuthSession();
    const isVirat = session && (session.code === '1711' || session.role === 'user');
    const prevVersion = getPreviousVersion(version);
    window.CURRENT_OS_VERSION = version;

    // 1. Settings Menu Red Notification Badge
    const updateBadge = document.getElementById('settings-update-badge');
    if (updateBadge) {
      if (isVirat) {
        // Virat sees update badge if not yet updated to OS 2.0 BETA
        updateBadge.style.display = (version !== '2.0 BETA') ? 'inline-flex' : 'none';
      } else {
        // Digi sees update badge only if below 1.3
        updateBadge.style.display = (parseFloat(version) < 1.3) ? 'inline-flex' : 'none';
      }
    }

    // 2. Hub Screen Badge Button & Document Title
    const osTitlePrefix = isVirat ? 'OS ' : 'Digi OS ';
    document.querySelectorAll('.os-badge-text').forEach(el => {
      el.textContent = 'OS ' + version;
    });
    document.title = (isVirat && version === '2.0 BETA') ? 'OS 2.0 BETA - Special Viev' : (osTitlePrefix + version + ' - Special Viev');

    // 3. Settings Modal Sheet Titles & Story Branding
    document.querySelectorAll('.os-version-title').forEach(el => {
      el.textContent = osTitlePrefix + version;
    });
    document.querySelectorAll('.story-branding').forEach(el => {
      el.textContent = osTitlePrefix + version + ' • Special Viev';
    });
    document.querySelectorAll('.spec-val').forEach(el => {
      if (el.textContent.includes('OS 1.') || el.textContent.includes('OS 2.')) {
        el.textContent = (isVirat && version === '2.0 BETA') ? 'OS 2.0 BETA (Testing)' : ('OS ' + version + ' (Official)');
      }
    });

    // 4. Synchronize Audio Playlist strictly to OS version
    if (window.syncMusicPlaylistWithOS) {
      window.syncMusicPlaylistWithOS(version);
    }

    // 5. Image 1 (Up-to-Date Screen) Updates
    const uptodateTitleText = document.querySelector('.uptodate-title-text');
    if (uptodateTitleText) {
      uptodateTitleText.textContent = isVirat ? 'OS is up to date' : 'Digi OS is up to date';
    }
    const uptodateVerSub = document.getElementById('uptodate-ver-sub');
    if (uptodateVerSub) {
      uptodateVerSub.textContent = osTitlePrefix + version;
    }

    const uptodateRevertSection = document.getElementById('uptodate-revert-section');
    const revertBtnVer = document.getElementById('revert-btn-ver');
    const revertBtnLabel = document.getElementById('revert-btn-label');
    if (uptodateRevertSection) {
      const canRevert = isVirat ? (version === '2.0 BETA') : (parseFloat(version) > 1.0);
      if (canRevert) {
        uptodateRevertSection.style.display = 'block';
        if (revertBtnVer) revertBtnVer.textContent = prevVersion;
        if (revertBtnLabel) revertBtnLabel.textContent = 'OS ' + prevVersion;
      } else {
        uptodateRevertSection.style.display = 'none';
      }
    }

    // 6. Image 2 (Update Available Screen) Updates
    const availCurrentSection = document.getElementById('avail-current-section');
    if (availCurrentSection) {
      const hasUpdate = isVirat ? (version !== '2.0 BETA') : (parseFloat(version) < 1.3);
      availCurrentSection.style.display = hasUpdate ? 'block' : 'none';
    }

    // 7. Software Update Subpage view toggle
    const updateAvailCard = document.getElementById('software-update-available');
    const updateResultCard = document.getElementById('software-result');
    if (updateAvailCard && updateResultCard) {
      const isUpToDate = isVirat ? (version === '2.0 BETA') : (parseFloat(version) >= 1.3);
      if (!isUpToDate) {
        updateAvailCard.style.display = 'block';
        updateResultCard.style.display = 'none';
      } else {
        updateAvailCard.style.display = 'none';
        updateResultCard.style.display = 'flex';
      }
    }

    // 8. Motion Graphics Ad vs Hero Photo Toggle
    if (window.syncMotionAdWithVersion) {
      window.syncMotionAdWithVersion();
    }

    // 9. Sync Cinema Tab Visibility (Strictly Virat ID 1711 on OS 2.0 BETA)
    if (window.syncCinemaTabVisibility) {
      window.syncCinemaTabVisibility();
    }
  }

  // Software Update Loader & Card Simulation
  function triggerSoftwareUpdateCheck() {
    const loader = document.getElementById('software-loader');
    const updateCard = document.getElementById('software-update-available');
    const resultCard = document.getElementById('software-result');
    if (!loader || !updateCard || !resultCard) return;

    const session = getAuthSession();
    const isVirat = session && (session.code === '1711' || session.role === 'user');
    const role = isVirat ? 'user' : (session ? session.role : 'digi');
    const ver = getSystemVersion(role);

    loader.style.display = 'flex';
    updateCard.style.display = 'none';
    resultCard.style.display = 'none';

    // Populate the card dynamically according to who is logged in
    const availVerIcon = document.getElementById('avail-update-ver-icon');
    const availTitle = document.getElementById('avail-update-title');
    const availSize = document.getElementById('avail-update-size');
    const availLead = document.getElementById('avail-update-lead');
    const featuresList = document.querySelector('.update-features-list');
    const subTextLink = document.querySelector('.update-website-link');
    const currentVerBadge = document.querySelector('.also-avail-squircle-ver');
    const currentVerTitle = document.querySelector('.also-avail-title');
    const uptodateTitleText = document.querySelector('.uptodate-title-text');
    const uptodateVerSub = document.getElementById('uptodate-ver-sub');
    const detailsDrawerTitle = document.querySelector('.details-drawer-title');
    const detailsLead = document.querySelector('.details-lead');
    const detailsList = document.querySelector('.details-list');

    if (isVirat) {
      if (availVerIcon) availVerIcon.textContent = '2.0';
      if (availTitle) availTitle.textContent = 'OS 2.0 BETA';
      if (availSize) availSize.textContent = '248.5 MB';
      if (availLead) availLead.textContent = 'Testing Beta Update strictly for Virat (ID 1711). Includes Cinema & YouTube Lounge, gesture PiP mini-player, custom controls & settings:';
      if (featuresList) {
        featuresList.innerHTML = `
          <div class="update-feature-item">
            <span class="feature-bullet-icon">🍿</span>
            <div class="feature-text-block">
              <strong class="feature-text-title">Cinema & YouTube Lounge</strong>
              <span class="feature-text-desc">Direct in-app YouTube browsing, smart trending feed & customized channel logos/avatars.</span>
            </div>
          </div>
          <div class="update-feature-item">
            <span class="feature-bullet-icon">🔽</span>
            <div class="feature-text-block">
              <strong class="feature-text-title">Gesture Drag-to-Miniplayer</strong>
              <span class="feature-text-desc">Full video player ko neeche drag karke compact corner mini-player me seamlessly convert karein.</span>
            </div>
          </div>
          <div class="update-feature-item">
            <span class="feature-bullet-icon">🎛️</span>
            <div class="feature-text-block">
              <strong class="feature-text-title">Clean Custom Player Controls</strong>
              <span class="feature-text-desc">Zero clutter: clean play/pause button, smooth auto-fading overlays aur clean duration scrub line.</span>
            </div>
          </div>
          <div class="update-feature-item">
            <span class="feature-bullet-icon">⚙️</span>
            <div class="feature-text-block">
              <strong class="feature-text-title">Playback Speed & Quality Menu</strong>
              <span class="feature-text-desc">Apple bottom-sheet se speed (0.25x - 2.0x) aur quality (1080p, 720p, 480p) easily customize karein.</span>
            </div>
          </div>
        `;
      }
      if (subTextLink) {
        subTextLink.href = 'https://viev.digi.space/os-2.0-beta';
        subTextLink.textContent = 'https://viev.digi.space/os-2.0-beta';
      }
      if (currentVerBadge) currentVerBadge.textContent = '1.1';
      if (currentVerTitle) currentVerTitle.textContent = 'OS 1.1';
      if (uptodateTitleText) uptodateTitleText.textContent = 'OS is up to date';
      if (uptodateVerSub) uptodateVerSub.textContent = 'OS ' + ver;
      if (detailsDrawerTitle) detailsDrawerTitle.textContent = "What's in OS 2.0 BETA";
      if (detailsLead) detailsLead.textContent = 'What was updated in OS 2.0 BETA:';
      if (detailsList) {
        detailsList.innerHTML = `
          <li><strong>Cinema & Lounge:</strong> In-app YouTube lounge with real video search & trending feeds.</li>
          <li><strong>Gesture Miniplayer:</strong> Drag video downwards to pop into floating Picture-in-Picture.</li>
          <li><strong>Custom Controls:</strong> Focused Play/Pause, hide overlays on tap, clean duration scrub.</li>
          <li><strong>Speed & Quality:</strong> 0.25x to 2.0x speeds and up to 1080p HD stream selection.</li>
        `;
      }
    } else {
      // Digi (3009 / 3011) strictly sees Digi OS 1.3
      if (availVerIcon) availVerIcon.textContent = '1.3';
      if (availTitle) availTitle.textContent = 'Digi OS 1.3';
      if (availSize) availSize.textContent = '186.4 MB';
      if (availLead) availLead.textContent = 'This update includes major new features, smoother performance, and background improvements:';
      if (featuresList) {
        featuresList.innerHTML = `
          <div class="update-feature-item">
            <span class="feature-bullet-icon">🎵</span>
            <div class="feature-text-block">
              <strong class="feature-text-title">Background Music Playback</strong>
              <span class="feature-text-desc">Phone lock hone ya app band hone par bhi gaane non-stop play honge.</span>
            </div>
          </div>
          <div class="update-feature-item">
            <span class="feature-bullet-icon">📱</span>
            <div class="feature-text-block">
              <strong class="feature-text-title">Lock Screen & Bluetooth Player</strong>
              <span class="feature-text-desc">Phone ke lock screen aur car/earphones par album poster, song title aur controls show honge.</span>
            </div>
          </div>
          <div class="update-feature-item">
            <span class="feature-bullet-icon">🎤</span>
            <div class="feature-text-block">
              <strong class="feature-text-title">Real-Time Synced Lyrics</strong>
              <span class="feature-text-desc">Gaane ke har beat ke sath lyrics real-time me Apple Music style me auto-scroll honge.</span>
            </div>
          </div>
          <div class="update-feature-item">
            <span class="feature-bullet-icon">✨</span>
            <div class="feature-text-block">
              <strong class="feature-text-title">Apple Smooth Animations & Haptics</strong>
              <span class="feature-text-desc">Puri app me fluid transitions, gentle touch vibration aur faster response time.</span>
            </div>
          </div>
        `;
      }
      if (subTextLink) {
        subTextLink.href = 'https://viev.digi.space/os-1.3';
        subTextLink.textContent = 'https://viev.digi.space/os-1.3';
      }
      if (currentVerBadge) currentVerBadge.textContent = '1.1';
      if (currentVerTitle) currentVerTitle.textContent = 'OS 1.1';
      if (uptodateTitleText) uptodateTitleText.textContent = 'Digi OS is up to date';
      if (uptodateVerSub) uptodateVerSub.textContent = 'Digi OS ' + ver;
      if (detailsDrawerTitle) detailsDrawerTitle.textContent = "What's in Digi OS 1.3";
      if (detailsLead) detailsLead.textContent = 'What was updated in Digi OS 1.3:';
      if (detailsList) {
        detailsList.innerHTML = `
          <li><strong>Background Music:</strong> Phone lock hone aur app switch karne par bhi gaane non-stop play hote hain.</li>
          <li><strong>Lock Screen & Bluetooth:</strong> Lock screen par full album poster, music slider aur controls.</li>
          <li><strong>Synced Lyrics:</strong> Har beat ke sath real-time line-by-line auto-scroll lyrics.</li>
          <li><strong>Apple Tactile & Speed:</strong> Smooth fluid animations aur gentle haptic vibration touch response.</li>
        `;
      }
    }

    setTimeout(() => {
      loader.style.display = 'none';
      const isUpToDate = isVirat ? (ver === '2.0 BETA') : (parseFloat(ver) >= 1.3);
      if (!isUpToDate) {
        updateCard.style.display = 'block';
        resultCard.style.display = 'none';
      } else {
        updateCard.style.display = 'none';
        resultCard.style.display = 'flex';
      }
    }, 1000);
  }

  // Apple Firmware Update Progress Controller (Image 2)
  function startFirmwareUpdate() {
    const overlay = document.getElementById('apple-os-update-overlay');
    const fillBar = document.getElementById('os-update-progress-fill');
    const logo = document.getElementById('os-update-logo');
    if (!overlay || !fillBar) return;

    // Close any open settings subpage
    if (typeof closeSubpage === 'function') {
      closeSubpage();
    }
    if (window.setFloatingNavVisible) {
      window.setFloatingNavVisible(false);
    }

    fillBar.style.width = '0%';
    overlay.style.display = 'flex';
    void overlay.offsetWidth;
    overlay.classList.remove('is-fading');
    overlay.classList.add('active');

    const TOTAL_DURATION = 60000; // 60 seconds (1 minute)
    const startTime = performance.now();
    let isFastForward = false;
    let animId = null;

    // Secret tap on V logo to fast-forward during testing
    if (logo) {
      logo.onclick = () => {
        isFastForward = true;
      };
    }

    function calculateProgress(elapsed) {
      const frac = Math.min(1, elapsed / TOTAL_DURATION);
      if (frac < 0.10) {
        return (frac / 0.10) * 8; // 0 to 8% in first 6s
      } else if (frac < 0.28) {
        return 8 + ((frac - 0.10) / 0.18) * 18; // 8 to 26%
      } else if (frac < 0.44) {
        return 26 + ((frac - 0.28) / 0.16) * 18; // 26 to 44%
      } else if (frac < 0.54) {
        return 44 + ((frac - 0.44) / 0.10) * 3; // 44 to 47% (realistic firmware pause!)
      } else if (frac < 0.74) {
        return 47 + ((frac - 0.54) / 0.20) * 31; // 47 to 78% (surge)
      } else if (frac < 0.90) {
        return 78 + ((frac - 0.74) / 0.16) * 15; // 78 to 93%
      } else {
        return 93 + ((frac - 0.90) / 0.10) * 7; // 93 to 100%
      }
    }

    function updateStep(now) {
      let elapsed = now - startTime;
      if (isFastForward) {
        elapsed = Math.max(elapsed, TOTAL_DURATION - 1800);
      }

      const pct = Math.min(100, calculateProgress(elapsed));
      fillBar.style.width = pct.toFixed(1) + '%';

      if (elapsed < TOTAL_DURATION && pct < 100) {
        animId = requestAnimationFrame(updateStep);
      } else {
        fillBar.style.width = '100%';
        setTimeout(completeFirmwareUpdate, 1200);
      }
    }

    function completeFirmwareUpdate() {
      const session = getAuthSession();
      const isVirat = session && (session.code === '1711' || session.role === 'user');
      const role = isVirat ? 'user' : (session ? session.role : 'digi');

      if (isVirat) {
        // Upgrade Virat (1711) strictly to OS 2.0 BETA (Testing update)
        localStorage.setItem('viev_user_os_version', '2.0 BETA');
        applySystemVersion('2.0 BETA');
      } else {
        // Upgrade Digi (3009) strictly to OS 1.3 (Zero beta leak)
        localStorage.setItem('viev_digi_os_version', '1.3');
        applySystemVersion('1.3');
      }

      // 2. Smooth fade out of black update screen
      overlay.classList.add('is-fading');
      setTimeout(() => {
        overlay.classList.remove('active', 'is-fading');
        overlay.style.display = 'none';
        fillBar.style.width = '0%';
      }, 750);

      // 3. Trigger Apple Cursive "viev" Startup Animation
      runStartupAnimation(() => {
        if (window.setFloatingNavVisible) {
          window.setFloatingNavVisible(true);
        }
        const tabHome = document.getElementById('tab-home');
        if (tabHome) tabHome.click();
      });
    }

    animId = requestAnimationFrame(updateStep);
  }

  // Favorite Songs Loader & Rendering Simulation
  function renderFavoriteSongs() {
    const loader = document.getElementById('favorites-loader');
    const result = document.getElementById('favorites-result');
    const list = document.getElementById('favorites-cards-list');
    if (!loader || !result || !list) return;

    loader.style.display = 'flex';
    result.style.display = 'none';

    setTimeout(() => {
      const playlist = (window.PLAYLIST && window.PLAYLIST.length) ? window.PLAYLIST : FALLBACK_PLAYLIST;
      const favTracks = [];

      playlist.forEach((track, idx) => {
        const isFav = localStorage.getItem('apple_fav_' + track.title) === 'true';
        if (isFav) {
          favTracks.push({ ...track, originalIndex: idx });
        }
      });

      list.innerHTML = '';

      if (favTracks.length === 0) {
        list.innerHTML = `
          <div class="settings-group-card favorites-empty-card">
            <div class="favorites-empty-icon">❤️</div>
            <h4 class="favorites-empty-title">No Favorite Songs Yet</h4>
            <p class="favorites-empty-desc">Songs liked by Digi in the Music section will appear here.</p>
            <button class="favorites-go-music-btn" id="fav-go-music-btn" type="button">Go to Music</button>
          </div>
        `;
        const goBtn = document.getElementById('fav-go-music-btn');
        if (goBtn) {
          goBtn.addEventListener('click', () => {
            const tabMusic = document.getElementById('tab-music');
            if (tabMusic) tabMusic.click();
          });
        }
      } else {
        favTracks.forEach(song => {
          const card = document.createElement('div');
          card.className = 'favorite-song-card';
          card.innerHTML = `
            <div class="fav-song-left">
              <img src="${song.cover}" alt="${song.title}" class="fav-song-thumb">
              <div class="fav-song-meta">
                <span class="fav-song-title">${song.title}</span>
                <span class="fav-song-artist">${song.artist}</span>
              </div>
            </div>
            <div class="fav-song-right">
              <span class="fav-loved-tag">❤️ Loved</span>
              <button class="fav-play-btn" type="button" data-index="${song.originalIndex}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                <span>Play</span>
              </button>
            </div>
          `;

          const playBtn = card.querySelector('.fav-play-btn');
          if (playBtn) {
            playBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              const idx = parseInt(playBtn.getAttribute('data-index'), 10);
              if (typeof window.loadTrackByIndex === 'function') {
                window.loadTrackByIndex(idx);
              }
              const tabMusic = document.getElementById('tab-music');
              if (tabMusic) tabMusic.click();
            });
          }

          list.appendChild(card);
        });
      }

      loader.style.display = 'none';
      result.style.display = 'block';
    }, 1200);
  }

  function openSubpage(targetId) {
    if (!settingsViewport) return;

    // Set top bar center title (e.g. Software Update)
    const navCenterTitle = document.getElementById('subpage-nav-center-title');
    if (navCenterTitle) {
      if (targetId === 'subpage-software') {
        navCenterTitle.textContent = 'Software Update';
        navCenterTitle.style.display = 'block';
      } else {
        navCenterTitle.textContent = '';
        navCenterTitle.style.display = 'none';
      }
    }

    // Hide all subpages first
    subpagePanels.forEach(p => p.style.display = 'none');

    // Show targeted subpage
    const targetPanel = document.getElementById(targetId);
    if (targetPanel) {
      targetPanel.style.display = 'block';
    }

    // Trigger sliding animation
    settingsViewport.classList.add('is-subpage-open');

    // Scroll subpage to top
    const subpagePane = document.getElementById('settings-subpage-pane');
    if (subpagePane) subpagePane.scrollTop = 0;

    // Trigger specific animations / loaders
    if (targetId === 'subpage-software') {
      triggerSoftwareUpdateCheck();
    } else if (targetId === 'subpage-favorites') {
      renderFavoriteSongs();
    }
  }

  function closeSubpage() {
    if (!settingsViewport) return;
    settingsViewport.classList.remove('is-subpage-open');
    const navCenterTitle = document.getElementById('subpage-nav-center-title');
    if (navCenterTitle) {
      navCenterTitle.textContent = '';
      navCenterTitle.style.display = 'none';
    }
  }

  navPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const target = pill.getAttribute('data-target');
      if (target) openSubpage(target);
    });
  });

  if (settingsBackBtn) {
    settingsBackBtn.addEventListener('click', closeSubpage);
  }

  // Software Update Actions (Image 1 & Image 2)
  const moreDetailsBtn = document.getElementById('uptodate-more-btn');
  const detailsDrawer = document.getElementById('uptodate-details-drawer');
  const detailsCloseBtn = document.getElementById('details-close-btn');

  if (moreDetailsBtn && detailsDrawer) {
    moreDetailsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = detailsDrawer.style.display !== 'none';
      detailsDrawer.style.display = isVisible ? 'none' : 'block';
      moreDetailsBtn.textContent = isVisible ? 'More Details' : 'Hide Details';
    });
  }

  if (detailsCloseBtn && detailsDrawer) {
    detailsCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      detailsDrawer.style.display = 'none';
      if (moreDetailsBtn) moreDetailsBtn.textContent = 'More Details';
    });
  }

  // Tap slate checkmark circle on Up to Date screen to re-check
  const checkCircle = document.querySelector('.uptodate-check-circle');
  if (checkCircle) {
    checkCircle.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerSoftwareUpdateCheck();
    });
  }

  // Apple-Style Software Update Actions
  const updateNowBtn = document.getElementById('apple-update-now-btn');
  if (updateNowBtn) {
    updateNowBtn.addEventListener('click', startFirmwareUpdate);
  }

  const updateTonightBtn = document.getElementById('apple-update-tonight-btn');
  if (updateTonightBtn) {
    updateTonightBtn.addEventListener('click', () => {
      if (window.triggerHaptic) window.triggerHaptic('light');
      const session = getAuthSession();
      const isVirat = session && (session.code === '1711' || session.role === 'user');
      const updateName = isVirat ? 'OS 2.0 BETA' : 'Digi OS 1.3';
      alert(`${updateName} will automatically install tonight when connected to power and Wi-Fi.`);
      if (typeof closeSubpage === 'function') {
        closeSubpage();
      }
    });
  }

  // Dynamic Apple Revert / Downgrade Button Handler
  const revertBtn = document.getElementById('apple-revert-btn');
  if (revertBtn) {
    revertBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const session = getAuthSession();
      const isVirat = session && (session.code === '1711' || session.role === 'user');
      const role = isVirat ? 'user' : (session ? session.role : 'digi');
      const curVer = getSystemVersion(role);
      const prevVer = getPreviousVersion(curVer);

      if (curVer === prevVer) return;

      // Rollback ONLY the active logged-in profile (strict isolation)
      localStorage.setItem('viev_' + role + '_os_version', prevVer);

      applySystemVersion(prevVer);
      triggerSoftwareUpdateCheck();
    });
  }

  // =========================================================
  // APPLE "VIEV" ACCESS GATEWAY & STARTUP INTRO CONTROLLER
  // Only 2 people: Digi (3009) & You (1711)
  // Flow: Unauthenticated -> Login Screen -> Correct Passcode -> Startup Intro -> Home
  // Authenticated -> Directly Startup Intro -> Home
  // =========================================================
  const helloSplash = document.getElementById('apple-hello-splash');
  const loginScreen = document.getElementById('login-screen');
  const passcodeInput = document.getElementById('login-passcode-input');
  const pinDisplay = document.getElementById('login-pin-display');
  const pinCells = document.querySelectorAll('.pin-cell');
  const loginFeedback = document.getElementById('login-feedback-msg');
  const loginSubmitBtn = document.getElementById('login-submit-btn');
  const signoutBtn = document.getElementById('settings-signout-btn');
  const editNameBtn = document.getElementById('user-name-edit-btn');
  const userNameEl = document.getElementById('user-display-name');
  const userRoleBadge = document.getElementById('user-role-badge');

  const VALID_USERS = {
    '3009': { role: 'digi', defaultName: 'DIGI', badge: 'Princess Digi', email: 'avneetsaini7070@gmail.com' },
    '3011': { role: 'digi', defaultName: 'DIGI', badge: 'Princess Digi', email: 'avneetsaini7070@gmail.com' },
    '1711': { role: 'user', defaultName: 'VIRAT', badge: 'Co-Creator', email: 'iamsid074@gmail.com' }
  };

  let splashTimer = null;

  function runStartupAnimation(callback) {
    if (!helloSplash) {
      if (callback) callback();
      return;
    }

    let hasDismissed = false;
    helloSplash.classList.remove('is-hidden', 'is-exiting');

    // Force restart SVG cursive drawing animation & ambient glow
    const stroke = document.getElementById('viev-pure-line');
    const dot = document.getElementById('viev-pure-dot');
    const glow = helloSplash.querySelector('.hello-ambient-glow');
    if (stroke) { stroke.style.animation = 'none'; stroke.offsetHeight; stroke.style.animation = ''; }
    if (dot) { dot.style.animation = 'none'; dot.offsetHeight; dot.style.animation = ''; }
    if (glow) { glow.style.animation = 'none'; glow.offsetHeight; glow.style.animation = ''; }

    function dismissHelloSplash() {
      if (hasDismissed) return;
      hasDismissed = true;
      if (splashTimer) {
        clearTimeout(splashTimer);
        splashTimer = null;
      }

      helloSplash.classList.add('is-exiting');
      setTimeout(() => {
        helloSplash.classList.add('is-hidden');
        if (callback) callback();
      }, 700);
    }

    splashTimer = setTimeout(dismissHelloSplash, 4800);

    const onSplashClick = () => {
      helloSplash.removeEventListener('click', onSplashClick);
      dismissHelloSplash();
    };
    helloSplash.addEventListener('click', onSplashClick, { once: true });
  }

  function getAuthSession() {
    try {
      const raw = localStorage.getItem('viev_auth_session');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function updateProfileUI(session) {
    if (!session) return;
    const config = VALID_USERS[session.code] || { role: session.role || 'user', defaultName: session.name || 'ANSHU', badge: 'Member' };
    const savedCustomName = localStorage.getItem('viev_name_' + config.role);
    const displayName = savedCustomName || session.name || config.defaultName;

    if (userNameEl) {
      userNameEl.textContent = displayName;
    }
    if (userRoleBadge) {
      userRoleBadge.textContent = config.badge || 'Member';
    }

    // Synchronize OS Version based on active role
    applySystemVersion(getSystemVersion(config.role));

    // Synchronize Daily Note state strictly for active role
    if (window.syncDailyNoteWithActiveUser) {
      window.syncDailyNoteWithActiveUser();
    }

    // Synchronize YouTube Profile & Feed (3011 Digi vs 1711 Virat)
    if (window.syncYouTubeUser) {
      window.syncYouTubeUser();
    }

    // Synchronize Cinema Tab visibility (Strictly Virat ID 1711 with OS 2.0 BETA)
    if (window.syncCinemaTabVisibility) {
      window.syncCinemaTabVisibility();
    }
  }

  function updatePinDisplay(val) {
    pinCells.forEach((cell, idx) => {
      if (idx < val.length) {
        cell.classList.add('is-filled');
        cell.classList.remove('is-focused');
      } else if (idx === val.length) {
        cell.classList.remove('is-filled');
        cell.classList.add('is-focused');
      } else {
        cell.classList.remove('is-filled', 'is-focused');
      }
    });
  }

  function executeLogin(code) {
    const userConfig = VALID_USERS[code];

    if (!userConfig) {
      // Invalid passcode
      if (window.triggerHaptic) window.triggerHaptic('error');
      if (pinDisplay) {
        pinDisplay.classList.remove('shake');
        void pinDisplay.offsetWidth; // Trigger reflow for re-animation
        pinDisplay.classList.add('shake');
      }

      if (loginFeedback) {
        loginFeedback.textContent = 'Incorrect Key • Try Again';
        loginFeedback.classList.remove('success');
        loginFeedback.classList.add('show');
      }

      setTimeout(() => {
        if (passcodeInput) passcodeInput.value = '';
        updatePinDisplay('');
        if (passcodeInput) passcodeInput.focus();
      }, 600);
      return;
    }

    // Valid passcode
    if (window.triggerHaptic) window.triggerHaptic('success');
    if (loginFeedback) {
      loginFeedback.textContent = 'Access Granted';
      loginFeedback.classList.add('show', 'success');
    }

    const savedCustomName = localStorage.getItem('viev_name_' + userConfig.role);
    const finalName = savedCustomName || userConfig.defaultName;

    const newSession = {
      code,
      role: userConfig.role,
      name: finalName,
      loggedInAt: Date.now()
    };
    localStorage.setItem('viev_auth_session', JSON.stringify(newSession));
    updateProfileUI(newSession);

    // Smooth transition from Login Screen to Startup Intro to Home
    if (loginScreen) {
      loginScreen.classList.add('is-exiting');
    }

    setTimeout(() => {
      if (loginScreen) {
        loginScreen.classList.remove('active', 'is-exiting');
        loginScreen.classList.add('hidden');
      }

      if (welcomeScreen) {
        welcomeScreen.classList.remove('hidden');
        welcomeScreen.classList.add('active');
      }

      runStartupAnimation(() => {
        if (window.setFloatingNavVisible) {
          window.setFloatingNavVisible(true);
        }
      });
    }, 420);
  }

  // Passcode Input & Display Synchronization
  if (passcodeInput) {
    passcodeInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').slice(0, 4);
      e.target.value = val;
      updatePinDisplay(val);

      if (loginFeedback) {
        loginFeedback.classList.remove('show');
      }

      if (val.length === 4) {
        setTimeout(() => executeLogin(val), 100);
      }
    });

    passcodeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (passcodeInput.value.length === 4) {
          executeLogin(passcodeInput.value);
        }
      }
    });
  }

  if (pinDisplay) {
    pinDisplay.addEventListener('click', () => {
      if (passcodeInput) passcodeInput.focus();
    });
  }

  const loginHeroCard = document.getElementById('login-hero-card');
  if (loginHeroCard) {
    loginHeroCard.addEventListener('click', () => {
      if (passcodeInput) passcodeInput.focus();
    });
  }

  if (loginSubmitBtn) {
    loginSubmitBtn.addEventListener('click', () => {
      if (passcodeInput) {
        if (passcodeInput.value.length === 4) {
          executeLogin(passcodeInput.value);
        } else {
          passcodeInput.focus();
          if (loginFeedback) {
            loginFeedback.textContent = 'Enter 4-Digit Passcode';
            loginFeedback.classList.add('show');
          }
        }
      }
    });
  }

  // Profile Display Name Editing in Settings
  if (editNameBtn) {
    editNameBtn.addEventListener('click', () => {
      const session = getAuthSession() || { role: 'user', name: 'ANSHU' };
      const currentName = (userNameEl ? userNameEl.textContent : '') || session.name;
      const enteredName = prompt('Enter your Profile Name:', currentName);
      if (enteredName && enteredName.trim()) {
        const cleanName = enteredName.trim();
        localStorage.setItem('viev_name_' + session.role, cleanName);
        session.name = cleanName;
        localStorage.setItem('viev_auth_session', JSON.stringify(session));
        updateProfileUI(session);
      }
    });
  }

  // Apple-Grade Sign Out
  if (signoutBtn) {
    signoutBtn.addEventListener('click', () => {
      localStorage.removeItem('viev_auth_session');

      if (window.setFloatingNavVisible) {
        window.setFloatingNavVisible(false);
      }

      // Maintain active persisted OS version on sign out (do NOT reset to 1.0)
      const currentVer = getSystemVersion();
      applySystemVersion(currentVer);

      // Reset Daily Note view on sign out
      if (window.syncDailyNoteWithActiveUser) {
        window.syncDailyNoteWithActiveUser();
      }

      // Switch tab back to Home
      const tabHome = document.getElementById('tab-home');
      if (tabHome) {
        tabHome.click();
      }

      // Hide all main pages
      if (welcomeScreen) {
        welcomeScreen.classList.remove('active');
        welcomeScreen.classList.add('hidden');
      }

      const musicScreen = document.getElementById('music-screen');
      if (musicScreen) {
        musicScreen.classList.remove('active');
        musicScreen.classList.add('hidden');
      }

      const settingsScreen = document.getElementById('settings-screen');
      if (settingsScreen) {
        settingsScreen.classList.remove('active');
        settingsScreen.classList.add('hidden');
      }

      const cinemaScreen = document.getElementById('cinema-screen');
      if (cinemaScreen) {
        cinemaScreen.classList.remove('active');
        cinemaScreen.classList.add('hidden');
      }

      if (window.syncCinemaTabVisibility) {
        window.syncCinemaTabVisibility();
      }

      // Reset passcode input and display
      if (passcodeInput) passcodeInput.value = '';
      updatePinDisplay('');
      if (loginFeedback) {
        loginFeedback.textContent = '';
        loginFeedback.classList.remove('show', 'success');
      }

      // Show login screen
      if (loginScreen) {
        loginScreen.classList.remove('hidden', 'is-exiting');
        loginScreen.classList.add('active');
        setTimeout(() => {
          if (passcodeInput) passcodeInput.focus();
        }, 250);
      }
    });
  }

  // Initial State Evaluation on DOM Load
  const activeSession = getAuthSession();
  if (activeSession && (activeSession.code === '3009' || activeSession.code === '3011' || activeSession.code === '1711')) {
    // Already Logged In: Directly show Home Screen with Startup Intro
    if (loginScreen) {
      loginScreen.classList.remove('active');
      loginScreen.classList.add('hidden');
    }
    if (welcomeScreen) {
      welcomeScreen.classList.remove('hidden');
      welcomeScreen.classList.add('active');
    }
    updateProfileUI(activeSession);
    applySystemVersion(getSystemVersion(activeSession.role));
    if (window.setFloatingNavVisible) {
      window.setFloatingNavVisible(false);
    }
    runStartupAnimation(() => {
      if (window.setFloatingNavVisible) {
        window.setFloatingNavVisible(true);
      }
    });
  } else {
    // Not Logged In: Maintain active system version, suppress startup splash and navbar, show Login Gateway
    const currentVer = getSystemVersion();
    applySystemVersion(currentVer);
    if (helloSplash) {
      helloSplash.classList.add('is-hidden');
    }
    if (window.setFloatingNavVisible) {
      window.setFloatingNavVisible(false);
    }
    if (welcomeScreen) {
      welcomeScreen.classList.remove('active');
      welcomeScreen.classList.add('hidden');
    }
    if (loginScreen) {
      loginScreen.classList.remove('hidden');
      loginScreen.classList.add('active');
    }
    updatePinDisplay('');
    setTimeout(() => {
      if (passcodeInput) passcodeInput.focus();
    }, 300);
  }
});

