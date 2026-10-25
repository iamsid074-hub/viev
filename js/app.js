/* =========================================================
   APP CONTROLLER & LIQUID OS 1.0 NAVIGATION
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

  // Software Update Loader Simulation
  function triggerSoftwareUpdateCheck() {
    const loader = document.getElementById('software-loader');
    const result = document.getElementById('software-result');
    if (!loader || !result) return;

    loader.style.display = 'flex';
    result.style.display = 'none';

    setTimeout(() => {
      loader.style.display = 'none';
      result.style.display = 'block';
    }, 1400);
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

  // Tap Software Result Card to re-trigger check
  const softwareResultCard = document.getElementById('software-result');
  if (softwareResultCard) {
    softwareResultCard.addEventListener('click', triggerSoftwareUpdateCheck);
  }

  // =========================================================
  // APPLE "VIEV" STARTUP INTRO CONTROLLER
  // Pure single continuous line drawing (3.5s, zero flash, zero cloud)
  // =========================================================
  const helloSplash = document.getElementById('apple-hello-splash');

  if (helloSplash) {
    let hasDismissed = false;

    function dismissHelloSplash() {
      if (hasDismissed) return;
      hasDismissed = true;

      helloSplash.classList.add('is-exiting');

      setTimeout(() => {
        helloSplash.classList.add('is-hidden');
      }, 1100);
    }

    // Peaceful hold after 3.5s cursive drawing finishes, then smooth dissolve (NO flash)
    const splashTimer = setTimeout(dismissHelloSplash, 4800);

    // Tap anywhere to skip immediately
    helloSplash.addEventListener('click', () => {
      clearTimeout(splashTimer);
      dismissHelloSplash();
    });
  }
});

