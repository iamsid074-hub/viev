/* =========================================================
   DETACHED FLOATING APPLE LIQUID GLASS NAVBAR (iOS 27 Slider Engine)
   Full-Page Navigation: Home • Music • Settings
   With Fluid 1:1 Gesture Slider & Mac Dock Magnification
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('apple-floating-navbar');
  const indicator = document.getElementById('nav-indicator-pill');
  const tabBtns = Array.from(document.querySelectorAll('.nav-tab-btn'));
  const floatingDock = document.getElementById('apple-floating-dock');
  const floatingOrb = document.getElementById('music-floating-orb');
  const orbCoverImg = document.getElementById('orb-cover-img');

  let currentTab = 'home';
  window.getCurrentTab = () => currentTab;

  // Full-Page Screens
  const pageScreens = {
    home: document.getElementById('welcome-screen'),
    music: document.getElementById('music-screen'),
    cinema: document.getElementById('cinema-screen'),
    settings: document.getElementById('settings-screen')
  };

  function updateIndicator(activeBtn, animate = true) {
    if (!indicator || !activeBtn) return;
    if (animate) {
      indicator.classList.remove('no-transition');
    } else {
      indicator.classList.add('no-transition');
    }
    indicator.style.left = `${activeBtn.offsetLeft}px`;
    indicator.style.width = `${activeBtn.offsetWidth}px`;
  }

  let indicatorRafId = null;
  function trackIndicatorDuringExpansion(targetBtn, onComplete) {
    if (!indicator || !targetBtn) return;
    if (indicatorRafId) cancelAnimationFrame(indicatorRafId);
    indicator.style.opacity = '1';
    indicator.classList.add('no-transition');
    const startTime = performance.now();
    const duration = 580; // matches 0.55s Apple spring transition
    const targetTab = targetBtn.getAttribute('data-tab');

    function frame(now) {
      const elapsed = now - startTime;
      if (elapsed < duration && currentTab === targetTab) {
        indicator.style.left = `${targetBtn.offsetLeft}px`;
        indicator.style.width = `${targetBtn.offsetWidth}px`;
        indicatorRafId = requestAnimationFrame(frame);
      } else {
        if (indicator && targetBtn && currentTab === targetTab) {
          indicator.style.left = `${targetBtn.offsetLeft}px`;
          indicator.style.width = `${targetBtn.offsetWidth}px`;
        }
        if (indicator) indicator.classList.remove('no-transition');
        indicatorRafId = null;
        if (typeof onComplete === 'function') onComplete();
      }
    }
    indicatorRafId = requestAnimationFrame(frame);
  }

  window.syncCinemaTabVisibility = function() {
    const cinemaTab = document.getElementById('tab-cinema');
    if (cinemaTab) {
      cinemaTab.style.display = 'flex';
    }

    const cinemaSettingsPill = document.querySelector('.settings-nav-pill[data-target="subpage-cinema"]');
    if (cinemaSettingsPill) {
      cinemaSettingsPill.style.display = 'flex';
    }

    // Refresh active indicator position
    setTimeout(() => {
      const activeBtn = document.querySelector('.nav-tab-btn.active');
      if (activeBtn) updateIndicator(activeBtn);
    }, 50);
  };

  // Run initial visibility check
  window.syncCinemaTabVisibility();

  let animTimer = null;

  function updateFloatingOrbVisibility() {
    if (!floatingOrb) return;
    const shouldShow = (typeof isPlaying !== 'undefined' ? isPlaying : false) && (currentTab !== 'music');

    if (floatingDock) {
      floatingDock.classList.toggle('has-music-orb', shouldShow);
    }

    if (shouldShow) {
      if (animTimer) {
        clearTimeout(animTimer);
        animTimer = null;
      }
      floatingOrb.classList.remove('is-merging');

      const isAlreadyVisible = floatingOrb.classList.contains('is-visible');
      if (!isAlreadyVisible) {
        floatingOrb.classList.add('is-separating', 'is-visible');
        animTimer = setTimeout(() => {
          floatingOrb.classList.remove('is-separating');
        }, 420);
      }
      floatingOrb.classList.add('is-playing');
    } else {
      if (animTimer) {
        clearTimeout(animTimer);
        animTimer = null;
      }
      floatingOrb.classList.remove('is-separating');

      if (floatingOrb.classList.contains('is-visible')) {
        floatingOrb.classList.add('is-merging');
        floatingOrb.classList.remove('is-visible');
        animTimer = setTimeout(() => {
          floatingOrb.classList.remove('is-merging');
          if (typeof isPlaying !== 'undefined' && !isPlaying) {
            floatingOrb.classList.remove('is-playing');
          }
        }, 340);
      } else {
        floatingOrb.classList.remove('is-visible', 'is-merging');
        if (typeof isPlaying !== 'undefined' && !isPlaying) {
          floatingOrb.classList.remove('is-playing');
        }
      }
    }
  }

  function switchPage(targetTab, clickedBtn) {
    if (!clickedBtn) return;
    // Strict Lock: Only authenticated ID 1711 allowed to browse tabs
    try {
      const raw = localStorage.getItem('viev_auth_session') || sessionStorage.getItem('viev_auth_session');
      const sess = raw ? JSON.parse(raw) : null;
      if (!sess || sess.code !== '1711') return;
    } catch (_) { return; }
    if (typeof triggerHaptic === 'function') triggerHaptic('light');
    const wasDockCollapsed = isMusicDockCollapsed || (floatingDock && floatingDock.classList.contains('is-music-collapsed'));
    currentTab = targetTab;

    // Update active tab buttons
    tabBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
      b.classList.remove('is-dock-magnified');
    });
    clickedBtn.classList.add('active');
    clickedBtn.setAttribute('aria-selected', 'true');

    if (wasDockCollapsed) {
      if (floatingDock) floatingDock.classList.remove('is-music-collapsed');
      isMusicDockCollapsed = false;

      if (targetTab === 'music') {
        // "openingke time bhi same cheez kar phle music ko unhide kar then instant slider ko show kar"
        if (indicator) indicator.style.opacity = '0';
        setTimeout(() => {
          if (currentTab === 'music' && indicator) {
            updateIndicator(clickedBtn, false);
            indicator.style.opacity = '1';
          }
        }, 550);
      } else {
        // Smoothly glide and lock indicator to clickedBtn as Music unhides in Apple spring physics
        trackIndicatorDuringExpansion(clickedBtn);
      }
    } else {
      if (indicator) indicator.style.opacity = '1';
      updateIndicator(clickedBtn);
    }

    if (window.vievAirCast && typeof window.vievAirCast.notifyScreenState === 'function') {
      window.vievAirCast.notifyScreenState({
        section: targetTab,
        view: targetTab === 'cinema' ? 'feed' : targetTab
      });
    }

    // Switch dedicated full-page screens
    Object.keys(pageScreens).forEach(key => {
      const screen = pageScreens[key];
      if (!screen) return;
      if (key === targetTab) {
        screen.classList.add('active', 'tab-fade-in');
        screen.classList.remove('hidden');
        screen.scrollTop = 0;
        setTimeout(() => screen.classList.remove('tab-fade-in'), 260);
      } else {
        screen.classList.remove('active', 'tab-fade-in');
      }
    });

    // Control RAF loops: Pause heavy visualizer & lyrics loops when off music screen
    if (targetTab === 'music') {
      if (typeof isPlaying !== 'undefined' && isPlaying && typeof audio !== 'undefined' && !audio.paused) {
        if (typeof currentCardView !== 'undefined' && currentCardView === 'artwork') {
          startBeatVisualizer();
        } else if (typeof currentCardView !== 'undefined' && currentCardView === 'lyrics') {
          startSyncLoop();
        }
        if (typeof scheduleMusicIdleAnimation === 'function') {
          scheduleMusicIdleAnimation(2800);
        }
      }
    } else {
      stopBeatVisualizer();
      stopSyncLoop();
      if (typeof resetMusicIdleState === 'function') {
        resetMusicIdleState();
      }
    }

    // Update floating companion orb visibility
    updateFloatingOrbVisibility();

    // Toggle Apple Intelligence Bottom Edge Aura visibility (Home Screen only)
    const edgeAura = document.getElementById('apple-intelligence-edge-aura');
    if (edgeAura) {
      edgeAura.classList.toggle('is-hidden', targetTab !== 'home');
    }

    // Exxclusive OS 3.0 Cinema & Smart Library activation
    if (targetTab === 'cinema') {
      if (typeof window.onExxclusiveTabActivated === 'function') {
        window.onExxclusiveTabActivated();
      }
    } else {
      if (typeof window.onExxclusiveTabDeactivated === 'function') {
        window.onExxclusiveTabDeactivated();
      }
    }

    // Pause legacy video when switching away from settings
    if (targetTab !== 'settings' && window.vievExxclusive && typeof window.vievExxclusive.pauseVideo === 'function') {
      window.vievExxclusive.pauseVideo();
    }
  }

  // Find nearest tab button from a clientX coordinate
  // Cache metrics during drag to prevent forced reflows
  let cachedNavRect = null;
  let cachedBtnMetrics = [];

  function getClosestTabBtn(clientX) {
    if (cachedBtnMetrics && cachedBtnMetrics.length) {
      let closest = cachedBtnMetrics[0].btn;
      let minDistance = Infinity;
      cachedBtnMetrics.forEach(item => {
        const dist = Math.abs(clientX - item.center);
        if (dist < minDistance) {
          minDistance = dist;
          closest = item.btn;
        }
      });
      return closest;
    }
    let closestBtn = tabBtns[0];
    let minDistance = Infinity;
    tabBtns.forEach(btn => {
      const rect = btn.getBoundingClientRect();
      const btnCenter = rect.left + rect.width / 2;
      const dist = Math.abs(clientX - btnCenter);
      if (dist < minDistance) {
        minDistance = dist;
        closestBtn = btn;
      }
    });
    return closestBtn;
  }

  // --- iOS 27 FLUID SLIDER DRAG & MAC DOCK ENGINE ---
  let isNavDragging = false;
  let dragStartX = 0;
  let hasDragged = false;
  let activePointerId = null;

  function handleNavDragMove(clientX) {
    if (!nav || !indicator || !cachedNavRect) return;
    const padding = 5;
    const indicatorWidth = indicator.offsetWidth || 70;
    const minLeft = padding;
    const maxLeft = cachedNavRect.width - indicatorWidth - padding;

    const indicatorHalfWidth = indicatorWidth / 2;
    const desiredLeft = clientX - cachedNavRect.left - indicatorHalfWidth;
    const clampedLeft = Math.max(minLeft, Math.min(maxLeft, desiredLeft));

    indicator.style.left = `${clampedLeft}px`;

    // Mac Dock Proximity Magnification using cached metrics
    let closestBtn = null;
    let minDistance = Infinity;
    cachedBtnMetrics.forEach(item => {
      const dist = Math.abs(clientX - item.center);
      if (dist < minDistance) {
        minDistance = dist;
        closestBtn = item.btn;
      }
      const proximity = Math.max(0, 1 - dist / 90);
      const label = item.btn.querySelector('.nav-tab-label');
      if (label) {
        const scale = 1 + proximity * 0.12;
        label.style.transform = `scale(${scale.toFixed(3)})`;
      }
      item.btn.classList.toggle('is-dock-magnified', item.btn === closestBtn);
    });
  }

  if (nav) {
    nav.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      isNavDragging = true;
      hasDragged = false;
      dragStartX = e.clientX;
      activePointerId = e.pointerId;

      try {
        nav.setPointerCapture(e.pointerId);
      } catch (err) {}

      // Cache dimensions at start of drag to avoid layout thrashing during movement
      cachedNavRect = nav.getBoundingClientRect();
      cachedBtnMetrics = tabBtns.map(btn => {
        const rect = btn.getBoundingClientRect();
        return { btn, center: rect.left + rect.width / 2 };
      });

      nav.classList.add('is-dragging');
      indicator.classList.add('is-pressed', 'is-popped');

      const closest = getClosestTabBtn(e.clientX);
      if (closest) closest.classList.add('is-dock-magnified');
    });

    nav.addEventListener('pointermove', (e) => {
      if (isNavDragging) {
        if (Math.abs(e.clientX - dragStartX) > 4) {
          hasDragged = true;
          indicator.classList.add('no-transition', 'is-dragging', 'is-expanded', 'is-popped');
        }
        if (hasDragged) {
          handleNavDragMove(e.clientX);
        }
      } else {
        // macOS Dock Proximity Magnification only for precision mouse hover, not touch devices
        if (e.pointerType === 'mouse') {
          tabBtns.forEach(btn => {
            const rect = btn.getBoundingClientRect();
            const btnCenter = rect.left + rect.width / 2;
            const dist = Math.abs(e.clientX - btnCenter);
            const proximity = Math.max(0, 1 - dist / 80);
            const label = btn.querySelector('.nav-tab-label');
            if (label && !btn.classList.contains('active')) {
              const scale = 1 + proximity * 0.10;
              label.style.transform = `scale(${scale.toFixed(3)})`;
            }
          });
        }
      }
    });

    const finishNavDrag = (e) => {
      if (!isNavDragging) return;
      isNavDragging = false;
      nav.classList.remove('is-dragging');
      indicator.classList.remove('no-transition', 'is-dragging', 'is-pressed');
      setTimeout(() => {
        if (indicator) indicator.classList.remove('is-popped');
      }, 220);

      try {
        if (activePointerId !== null) nav.releasePointerCapture(activePointerId);
      } catch (err) {}
      activePointerId = null;

      // Reset hover transforms on all labels
      tabBtns.forEach(btn => {
        const label = btn.querySelector('.nav-tab-label');
        if (label) label.style.transform = '';
        btn.classList.remove('is-dock-magnified');
      });

      // Magnetically snap to closest tab
      const targetBtn = getClosestTabBtn(e.clientX);
      cachedNavRect = null;
      cachedBtnMetrics = [];

      if (targetBtn) {
        const targetTab = targetBtn.getAttribute('data-tab');
        switchPage(targetTab, targetBtn);
      }
    };

    nav.addEventListener('pointerup', finishNavDrag);
    nav.addEventListener('pointercancel', finishNavDrag);

    // Reset Dock magnifications when cursor leaves navbar
    nav.addEventListener('pointerleave', () => {
      if (!isNavDragging) {
        tabBtns.forEach(btn => {
          const label = btn.querySelector('.nav-tab-label');
          if (label) label.style.transform = '';
          btn.classList.remove('is-dock-magnified');
        });
      }
    });
  }

  // Click handler for tab buttons (for click/tap without drag)
  let tapTimeout = null;
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (hasDragged) return;
      const targetTab = btn.getAttribute('data-tab');
      switchPage(targetTab, btn);
      if (indicator) {
        indicator.classList.add('is-popped');
      }
      if (tapTimeout) clearTimeout(tapTimeout);
      tapTimeout = setTimeout(() => {
        if (indicator) indicator.classList.remove('is-popped');
      }, 220);
    });
  });

  // Position indicator initially once fonts and layout are ready
  const initialActive = document.querySelector('.nav-tab-btn.active');
  if (initialActive) {
    setTimeout(() => updateIndicator(initialActive, false), 80);
  }

  window.addEventListener('resize', () => {
    const active = document.querySelector('.nav-tab-btn.active');
    if (active && (!isMusicDockCollapsed || currentTab !== 'music')) updateIndicator(active, false);
  });

  // =========================================================
  // IOS 27 FLUID APP LAUNCH MORPH ENGINE (ORB -> FULL WINDOW)
  // Dynamic screen expansion blooming straight out of the floating orb
  // =========================================================
  let isLaunchingMusic = false;
  const launchRing = document.getElementById('music-launch-portal-ring');

  function launchMusicFromOrb() {
    if (isLaunchingMusic || !floatingOrb) return;
    isLaunchingMusic = true;

    const musicTab = document.getElementById('tab-music');
    const musicScreen = pageScreens.music;
    const previousScreen = pageScreens[currentTab];

    if (!musicScreen) {
      if (musicTab) switchPage('music', musicTab);
      isLaunchingMusic = false;
      return;
    }

    // 1. Temporarily pause beat visualizer during 380ms transition so GPU compositor is 100% free
    if (typeof stopBeatVisualizer === 'function') {
      stopBeatVisualizer();
    }

    // 2. Immediately blur background window (iOS wallpaper depth bokeh)
    if (previousScreen && previousScreen !== musicScreen) {
      previousScreen.classList.add('screen-launch-recede');
    }

    // 3. Tactile click feedback on the floating orb
    floatingOrb.classList.add('is-clicked-launching');

    // 4. Trigger subtle luminous glass ring shockwave from exact origin
    if (launchRing) {
      const orbRect = floatingOrb.getBoundingClientRect();
      const centerX = Math.round(orbRect.left + orbRect.width / 2);
      const centerY = Math.round(orbRect.top + orbRect.height / 2);
      launchRing.style.left = `${centerX}px`;
      launchRing.style.top = `${centerY}px`;
      if (typeof PLAYLIST !== 'undefined' && typeof currentTrackIndex !== 'undefined' && PLAYLIST[currentTrackIndex]) {
        const curTrack = PLAYLIST[currentTrackIndex];
        if (curTrack.color) {
          launchRing.style.setProperty('--song-active-color', curTrack.color);
        }
      }
      launchRing.classList.remove('is-animating');
      requestAnimationFrame(() => {
        if (launchRing) launchRing.classList.add('is-animating');
      });
    }

    // 5. Navbar updates active tab & indicator smoothly
    currentTab = 'music';
    tabBtns.forEach(b => {
      b.classList.remove('active', 'is-dock-magnified');
      b.setAttribute('aria-selected', 'false');
    });
    if (musicTab) {
      musicTab.classList.add('active');
      musicTab.setAttribute('aria-selected', 'true');
      updateIndicator(musicTab);
    }

    // 6. Trigger native Apple Music fluid sheet slide-up (pure GPU translate3d)
    if (musicScreen.scrollTop !== 0) musicScreen.scrollTop = 0;
    musicScreen.classList.remove('hidden', 'tab-fade-in');
    musicScreen.classList.add('is-launching-sheet', 'active');

    // 7. Orb will smoothly hide since we are now in music section
    updateFloatingOrbVisibility();

    // 8. When 340ms Apple spring animation finishes, cleanly settle with zero blink
    setTimeout(() => {
      musicScreen.classList.remove('is-launching-sheet');

      if (previousScreen && previousScreen !== musicScreen) {
        previousScreen.classList.remove('screen-launch-recede', 'active');
      }

      if (launchRing) {
        launchRing.classList.remove('is-animating');
      }

      floatingOrb.classList.remove('is-clicked-launching');

      // Resume visualizers now that screen is smoothly settled
      if (typeof isPlaying !== 'undefined' && isPlaying && typeof audio !== 'undefined' && !audio.paused) {
        if (typeof currentCardView !== 'undefined' && currentCardView === 'artwork') {
          startBeatVisualizer();
        } else if (typeof currentCardView !== 'undefined' && currentCardView === 'lyrics') {
          startSyncLoop();
        }
      }

      isLaunchingMusic = false;
    }, 350);
  }

  // Floating Music Orb: Click to launch music section with iOS 27 fluid morph
  if (floatingOrb) {
    floatingOrb.addEventListener('click', (e) => {
      e.stopPropagation();
      launchMusicFromOrb();
    });
  }

  // Global helper to show/hide navbar on Cinema transitions
  window.setFloatingNavVisible = function(visible) {
    if (floatingDock) {
      if (visible) {
        floatingDock.classList.remove('nav-hidden');
      } else {
        floatingDock.classList.add('nav-hidden');
      }
    }
    if (nav) {
      if (visible) {
        nav.classList.remove('nav-hidden');
      } else {
        nav.classList.add('nav-hidden');
      }
    }
    const edgeAura = document.getElementById('apple-intelligence-edge-aura');
    if (edgeAura) {
      if (visible && currentTab === 'home') {
        edgeAura.classList.remove('is-hidden');
      } else {
        edgeAura.classList.add('is-hidden');
      }
    }
  };

  // =========================================================
  // APPLE TACTILE HAPTICS ENGINE
  // =========================================================
  function triggerHaptic(type = 'light') {
    if (!('vibrate' in navigator)) return;
    try {
      if (type === 'light') navigator.vibrate(10);
      else if (type === 'medium') navigator.vibrate(22);
      else if (type === 'heavy') navigator.vibrate(40);
      else if (type === 'success') navigator.vibrate([15, 45, 20]);
      else if (type === 'lock' || type === 'error') navigator.vibrate([30, 40, 30]);
    } catch(e) {}
  }
  window.triggerHaptic = triggerHaptic;

  // =========================================================
  // STREAMING LRC PARSER & CACHE ENGINE
  // Dynamic streaming of complete full-song synchronized lyrics
  // =========================================================
  const lrcCache = new Map();

  function parseLRC(text) {
    if (!text) return [];
    const lines = text.split('\n');
    const result = [];
    const timeRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('[ti:') || line.startsWith('[ar:') || line.startsWith('[al:') || line.startsWith('[by:') || line.startsWith('[offset:')) continue;
      
      const textPart = line.replace(timeRegex, '').trim();
      let match;
      timeRegex.lastIndex = 0;
      while ((match = timeRegex.exec(line)) !== null) {
        const min = parseInt(match[1], 10);
        const sec = parseInt(match[2], 10);
        const ms = match[3] ? (match[3].length === 2 ? parseInt(match[3], 10) * 10 : parseInt(match[3], 10)) : 0;
        const totalSec = min * 60 + sec + (ms / 1000);
        if (textPart) {
          result.push({ time: parseFloat(totalSec.toFixed(2)), text: textPart });
        }
      }
    }
    result.sort((a, b) => a.time - b.time);
    return result;
  }

  function loadTrackLyrics(track) {
    if (!track || !track.lrcFile || track._lrcLoaded) return;
    if (!isOS13Active()) {
      // OS 1.3 feature: do not load full .lrc streaming lyrics until updated to 1.3
      return;
    }
    if (lrcCache.has(track.lrcFile)) {
      track.lyrics = lrcCache.get(track.lrcFile);
      track._lrcLoaded = true;
      if (currentCardView === 'lyrics' && PLAYLIST[currentTrackIndex] === track) {
        renderLyrics();
      }
      return;
    }

    fetch(encodeURI(track.lrcFile))
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch LRC');
        return r.text();
      })
      .then(txt => {
        const parsed = parseLRC(txt);
        if (parsed && parsed.length > 0) {
          lrcCache.set(track.lrcFile, parsed);
          track.lyrics = parsed;
          track._lrcLoaded = true;
          if (currentCardView === 'lyrics' && PLAYLIST[currentTrackIndex] === track) {
            renderLyrics();
          }
        }
      })
      .catch(e => {
        console.warn('LRC load skipped for ' + track.title + ':', e);
      });
  }

  // =========================================================
  // APPLE NATIVE MEDIASESSION & LOCK SCREEN ENGINE
  // Full lock screen art, Bluetooth controls & seek sync
  // =========================================================
  function updateMediaSession(track) {
    if (!('mediaSession' in navigator) || !track) return;
    try {
      const coverUrl = new URL(track.cover, window.location.href).href;
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist || 'Digi Viev',
        album: 'Digi OS 1.3 • Special Viev',
        artwork: [
          { src: coverUrl, sizes: '512x512', type: 'image/png' },
          { src: coverUrl, sizes: '256x256', type: 'image/png' },
          { src: coverUrl, sizes: '128x128', type: 'image/png' },
          { src: coverUrl, sizes: '96x96', type: 'image/png' }
        ]
      });

      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

      if (!window._mediaSessionHandlersAttached) {
        window._mediaSessionHandlersAttached = true;
        navigator.mediaSession.setActionHandler('play', () => {
          userExplicitPause = false;
          if (typeof triggerHaptic === 'function') triggerHaptic('medium');
          playTrack();
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          userExplicitPause = true;
          if (typeof triggerHaptic === 'function') triggerHaptic('medium');
          pauseTrack();
        });
        navigator.mediaSession.setActionHandler('previoustrack', () => {
          if (typeof triggerHaptic === 'function') triggerHaptic('light');
          prevTrack();
        });
        navigator.mediaSession.setActionHandler('nexttrack', () => {
          if (typeof triggerHaptic === 'function') triggerHaptic('light');
          nextTrack();
        });
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime !== null && !isNaN(details.seekTime)) {
            audio.currentTime = details.seekTime;
            updateMediaSessionPosition();
          }
        });
        navigator.mediaSession.setActionHandler('seekbackward', (details) => {
          const skip = details.seekOffset || 10;
          audio.currentTime = Math.max(0, audio.currentTime - skip);
          updateMediaSessionPosition();
        });
        navigator.mediaSession.setActionHandler('seekforward', (details) => {
          const skip = details.seekOffset || 10;
          audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + skip);
          updateMediaSessionPosition();
        });
      }
      updateMediaSessionPosition();
    } catch (e) {
      console.warn('MediaSession metadata error:', e);
    }
  }

  function updateMediaSessionPosition() {
    if (!('mediaSession' in navigator) || !navigator.mediaSession.setPositionState) return;
    try {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        navigator.mediaSession.setPositionState({
          duration: audio.duration,
          playbackRate: audio.playbackRate || 1.0,
          position: Math.min(audio.currentTime, audio.duration)
        });
      }
    } catch (e) {}
  }

  // =========================================================
  // APPLE MUSIC: REAL AUDIO PLAYLIST & PLAYBACK ENGINE
  // =========================================================
  const MASTER_PLAYLIST = [
    {
        "title": "Tumhe Kitna Pyaar Karte",
        "artist": "Arijit Singh \u2022 Mithoon \u2022 Manoj Muntashir",
        "album": "Bawaal",
        "bpm": 84,
        "src": "song/Tumhe Kitna Pyaar Karte.m4a",
        "cover": "song/covers/Tumhe Kitna Pyaar Karte.jpg",
        "color": "#e11d48",
        "glow": "#e11d48",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Aaj Se Teri",
        "artist": "Arijit Singh \u2022 Amit Trivedi",
        "album": "Pad Man",
        "bpm": 96,
        "src": "song/Aaj Se Teri.m4a",
        "cover": "song/covers/Aaj Se Teri.jpg",
        "color": "#f59e0b",
        "glow": "#f59e0b",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Aasan Nahin Yahan",
        "artist": "Arijit Singh \u2022 Jeet Gannguli",
        "album": "Aashiqui 2",
        "bpm": 80,
        "src": "song/Aasan Nahin Yahan Aashiqui 2 320 Kbps.mp3",
        "cover": "song/covers/Aasan Nahin Yahan.jpg",
        "color": "#c084fc",
        "glow": "rgba(192, 132, 252, 0.88)",
        "glowSoft": "rgba(192, 132, 252, 0.40)",
        "lrcFile": "song/Aasan Nahin Yahan.lrc",
        "lyrics": [
            {
                "time": 16.5,
                "text": "Aasan nahi yahan aashiq ho jaana,"
            },
            {
                "time": 24.5,
                "text": "Palkon pe kaanton ko sajana..."
            },
            {
                "time": 33.5,
                "text": "Aasan nahi yahan aashiq ho jaana,"
            },
            {
                "time": 41.5,
                "text": "Palkon pe kaanton ko sajana..."
            },
            {
                "time": 50,
                "text": "Yeh ishq nahi aasan,"
            },
            {
                "time": 58.5,
                "text": "Bas itna samajh leeje"
            },
            {
                "time": 67,
                "text": "Ik aag ka darya hai,"
            },
            {
                "time": 75.5,
                "text": "Aur doob ke jaana hai"
            },
            {
                "time": 84,
                "text": "Aasan nahi yahan aashiq ho jaana..."
            },
            {
                "time": 101,
                "text": "Waqt ke saansein chalti hain tere sang,"
            },
            {
                "time": 110,
                "text": "Har dharhkan pe likha hai tera rang"
            },
            {
                "time": 118.5,
                "text": "Jo tu na mila toh adhoore hain hum,"
            },
            {
                "time": 127,
                "text": "Tere bin ab na seh paayein yeh gham"
            }
        ]
    },
    {
        "title": "Ijazat",
        "artist": "Arijit Singh \u2022 Meet Bros",
        "album": "One Night Stand",
        "bpm": 88,
        "src": "song/Ijazat.m4a",
        "cover": "song/covers/Ijazat.jpg",
        "color": "#ec4899",
        "glow": "#ec4899",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Tera Fitoor",
        "artist": "Arijit Singh \u2022 Himesh Reshammiya",
        "album": "Genius",
        "bpm": 92,
        "src": "song/Tera Fitoor.m4a",
        "cover": "song/covers/Tera Fitoor.jpg",
        "color": "#8b5cf6",
        "glow": "#8b5cf6",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Oonchi Oonchi Deewarein",
        "artist": "Arijit Singh \u2022 Manan Bhardwaj",
        "album": "Yaariyan 2",
        "bpm": 85,
        "src": "song/Oonchi Oonchi Deewarein.m4a",
        "cover": "song/covers/Oonchi Oonchi Deewarein.jpg",
        "color": "#10b981",
        "glow": "#10b981",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Teri Meri Kahaani",
        "artist": "Arijit Singh \u2022 Palak Muchhal",
        "album": "Gabbar Is Back",
        "bpm": 90,
        "src": "song/Teri Meri Kahaani.m4a",
        "cover": "song/covers/Teri Meri Kahaani.jpg",
        "color": "#f97316",
        "glow": "#f97316",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Suno Na Sangemarmar",
        "artist": "Arijit Singh \u2022 Jeet Gannguli",
        "album": "Youngistaan",
        "bpm": 82,
        "src": "song/Suno Na Sangemarmar.m4a",
        "cover": "song/covers/Suno Na Sangemarmar.jpg",
        "color": "#38bdf8",
        "glow": "#38bdf8",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Tu Hi Hai Aashiqui (Duet)",
        "artist": "Arijit Singh \u2022 Palak Muchhal",
        "album": "Dishkiyaoon",
        "bpm": 86,
        "src": "song/Tu Hi Hai Aashiqui (Duet).m4a",
        "cover": "song/covers/Tu Hi Hai Aashiqui (Duet).jpg",
        "color": "#a855f7",
        "glow": "#a855f7",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Baatein Ye Kabhi Na",
        "artist": "Arijit Singh \u2022 Jeet Gannguli",
        "album": "Khamoshiyan",
        "bpm": 78,
        "src": "song/Baatein Ye Kabhi Na.m4a",
        "cover": "song/covers/Baatein Ye Kabhi Na.jpg",
        "color": "#6366f1",
        "glow": "#6366f1",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Phir Na Aisi Raat Aayegi",
        "artist": "Arijit Singh \u2022 Pritam",
        "album": "Laal Singh Chaddha",
        "bpm": 84,
        "src": "song/Phir Na Aisi Raat Aayegi.m4a",
        "cover": "song/covers/Phir Na Aisi Raat Aayegi.jpg",
        "color": "#f43f5e",
        "glow": "#f43f5e",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Ruaan",
        "artist": "Arijit Singh \u2022 Pritam",
        "album": "Tiger 3",
        "bpm": 88,
        "src": "song/Ruaan.m4a",
        "cover": "song/covers/Ruaan.jpg",
        "color": "#eab308",
        "glow": "#eab308",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "O Maahi",
        "artist": "Arijit Singh \u2022 Pritam",
        "album": "Dunki",
        "bpm": 82,
        "src": "song/O Maahi.m4a",
        "cover": "song/covers/O Maahi.jpg",
        "color": "#ef4444",
        "glow": "#ef4444",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Itni Si Baat Hain",
        "artist": "Arijit Singh \u2022 Pritam \u2022 Antara Mitra",
        "album": "Azhar",
        "bpm": 94,
        "src": "song/Itni Si Baat Hain.m4a",
        "cover": "song/covers/Itni Si Baat Hain.jpg",
        "color": "#0ea5e9",
        "glow": "#0ea5e9",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Qaafirana",
        "artist": "Arijit Singh \u2022 Amit Trivedi \u2022 Nikhita Gandhi",
        "album": "Kedarnath",
        "bpm": 88,
        "src": "song/Qaafirana.m4a",
        "cover": "song/covers/Qaafirana.jpg",
        "color": "#14b8a6",
        "glow": "#14b8a6",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Tu Hi Hai Aashiqui (Solo)",
        "artist": "Arijit Singh",
        "album": "Dishkiyaoon",
        "bpm": 86,
        "src": "song/Tu Hi Hai Aashiqui (Solo).m4a",
        "cover": "song/covers/Tu Hi Hai Aashiqui (Solo).jpg",
        "color": "#8b5cf6",
        "glow": "#8b5cf6",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Kabhi Jo Baadal Barse",
        "artist": "Arijit Singh \u2022 Sharib-Toshi",
        "album": "Jackpot",
        "bpm": 85,
        "src": "song/Kabhi Jo Baadal Barse.m4a",
        "cover": "song/covers/Kabhi Jo Baadal Barse.jpg",
        "color": "#3b82f6",
        "glow": "#3b82f6",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Kalank (Title Track)",
        "artist": "Arijit Singh \u2022 Pritam",
        "album": "Kalank",
        "bpm": 76,
        "src": "song/Kalank (Title Track).m4a",
        "cover": "song/covers/Kalank (Title Track).jpg",
        "color": "#b91c1c",
        "glow": "#b91c1c",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Tum Hi Ho",
        "artist": "Arijit Singh \u2022 Mithoon",
        "album": "Aashiqui 2",
        "bpm": 92,
        "src": "song/Tum Hi Ho Aashiqui 2 320 Kbps.mp3",
        "cover": "song/covers/Tum Hi Ho.jpg",
        "color": "#f59e0b",
        "glow": "rgba(245, 158, 11, 0.88)",
        "glowSoft": "rgba(245, 158, 11, 0.40)",
        "lrcFile": "song/Tum Hi Ho.lrc",
        "lyrics": [
            {
                "time": 1,
                "text": "Hum tere bin ab reh nahi sakte,"
            },
            {
                "time": 7.5,
                "text": "Tere bina kya wajood mera?"
            },
            {
                "time": 14.5,
                "text": "Tujhse juda agar ho jayenge,"
            },
            {
                "time": 21,
                "text": "Toh khud se hi ho jayenge juda"
            },
            {
                "time": 28.5,
                "text": "Kyunki tum hi ho, ab tum hi ho,"
            },
            {
                "time": 35.5,
                "text": "Zindagi ab tum hi ho"
            },
            {
                "time": 42.5,
                "text": "Chain bhi, mera dard bhi,"
            },
            {
                "time": 49.5,
                "text": "Meri aashiqui ab tum hi ho"
            },
            {
                "time": 57,
                "text": "Tera mera rishta hai kaisa,"
            },
            {
                "time": 64,
                "text": "Ek pal door gawaara nahi"
            },
            {
                "time": 71,
                "text": "Tere liye har roz hain jeete,"
            },
            {
                "time": 78,
                "text": "Tujhko diya mera waqt sabhi"
            },
            {
                "time": 85,
                "text": "Koyi lamha mera na ho tere bina,"
            },
            {
                "time": 92,
                "text": "Har saans pe naam tera..."
            },
            {
                "time": 99,
                "text": "Kyunki tum hi ho, ab tum hi ho,"
            },
            {
                "time": 106,
                "text": "Zindagi ab tum hi ho"
            },
            {
                "time": 113,
                "text": "Chain bhi, mera dard bhi,"
            },
            {
                "time": 120,
                "text": "Meri aashiqui ab tum hi ho"
            }
        ]
    },
    {
        "title": "Dekha Hazaro Dafaa",
        "artist": "Arijit Singh \u2022 Palak Muchhal",
        "album": "Rustom",
        "bpm": 80,
        "src": "song/Dekha Hazaro Dafaa.m4a",
        "cover": "song/covers/Dekha Hazaro Dafaa.jpg",
        "color": "#f59e0b",
        "glow": "#f59e0b",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Jaan 'Nisaar",
        "artist": "Arijit Singh \u2022 Amit Trivedi",
        "album": "Kedarnath",
        "bpm": 74,
        "src": "song/Jaan 'Nisaar.m4a",
        "cover": "song/covers/Jaan 'Nisaar.jpg",
        "color": "#0d9488",
        "glow": "#0d9488",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Mareez - E - Ishq",
        "artist": "Arijit Singh \u2022 Sharib-Toshi",
        "album": "Zid",
        "bpm": 90,
        "src": "song/Mareez - E - Ishq.m4a",
        "cover": "song/covers/Mareez - E - Ishq.jpg",
        "color": "#d97706",
        "glow": "#d97706",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Saanson Ko",
        "artist": "Arijit Singh \u2022 Sharib-Toshi",
        "album": "Zid",
        "bpm": 84,
        "src": "song/Saanson Ko.m4a",
        "cover": "song/covers/Saanson Ko.jpg",
        "color": "#dc2626",
        "glow": "#dc2626",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Lo Maan Liya",
        "artist": "Arijit Singh \u2022 Jeet Gannguli",
        "album": "Raaz Reboot",
        "bpm": 82,
        "src": "song/Lo Maan Liya.m4a",
        "cover": "song/covers/Lo Maan Liya.jpg",
        "color": "#4f46e5",
        "glow": "#4f46e5",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Muskurane (Romantic)",
        "artist": "Arijit Singh \u2022 Jeet Gannguli",
        "album": "Citylights",
        "bpm": 76,
        "src": "song/Muskurane (Romantic).m4a",
        "cover": "song/covers/Muskurane (Romantic).jpg",
        "color": "#059669",
        "glow": "#059669",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Roke Na Ruke Naina",
        "artist": "Arijit Singh \u2022 Amaal Mallik",
        "album": "Badrinath Ki Dulhania",
        "bpm": 80,
        "src": "song/Roke Na Ruke Naina.m4a",
        "cover": "song/covers/Roke Na Ruke Naina.jpg",
        "color": "#ea580c",
        "glow": "#ea580c",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Mere Yaaraa",
        "artist": "Arijit Singh \u2022 Neeti Mohan",
        "album": "Sooryavanshi",
        "bpm": 96,
        "src": "song/Mere Yaaraa.m4a",
        "cover": "song/covers/Mere Yaaraa.jpg",
        "color": "#e11d48",
        "glow": "#e11d48",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Judaai",
        "artist": "Arijit Singh \u2022 Rekha Bhardwaj \u2022 Sachin-Jigar",
        "album": "Badlapur",
        "bpm": 84,
        "src": "song/Judaai.m4a",
        "cover": "song/covers/Judaai.jpg",
        "color": "#7c3aed",
        "glow": "#7c3aed",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Sajde",
        "artist": "Arijit Singh \u2022 Shankar-Ehsaan-Loy",
        "album": "Kill Dil",
        "bpm": 86,
        "src": "song/Sajde.m4a",
        "cover": "song/covers/Sajde.jpg",
        "color": "#ca8a04",
        "glow": "#ca8a04",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Bolna",
        "artist": "Arijit Singh \u2022 Asees Kaur \u2022 Tanishk Bagchi",
        "album": "Kapoor & Sons",
        "bpm": 82,
        "src": "song/Bolna.m4a",
        "cover": "song/covers/Bolna.jpg",
        "color": "#2dd4bf",
        "glow": "#2dd4bf",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Pal Pal Dil Ke Paas",
        "artist": "Arijit Singh \u2022 Parampara Thakur",
        "album": "Pal Pal Dil Ke Paas",
        "bpm": 80,
        "src": "song/Pal Pal Dil Ke Paas.m4a",
        "cover": "song/covers/Pal Pal Dil Ke Paas.jpg",
        "color": "#38bdf8",
        "glow": "#38bdf8",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Sanam Re",
        "artist": "Arijit Singh \u2022 Mithoon",
        "album": "Sanam Re",
        "bpm": 88,
        "src": "song/Sanam Re.m4a",
        "cover": "song/covers/Sanam Re.jpg",
        "color": "#6366f1",
        "glow": "#6366f1",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Tera Yaar Hoon Main",
        "artist": "Arijit Singh \u2022 Rochak Kohli",
        "album": "Sonu Ke Titu Ki Sweety",
        "bpm": 84,
        "src": "song/Tera Yaar Hoon Main.m4a",
        "cover": "song/covers/Tera Yaar Hoon Main.jpg",
        "color": "#f59e0b",
        "glow": "#f59e0b",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Uska Hi Banana",
        "artist": "Arijit Singh \u2022 Chirantan Bhatt",
        "album": "1920 Evil Returns",
        "bpm": 78,
        "src": "song/Uska Hi Banana.m4a",
        "cover": "song/covers/Uska Hi Banana.jpg",
        "color": "#9333ea",
        "glow": "#9333ea",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Milne Hai Mujhse Aayi",
        "artist": "Arijit Singh \u2022 Jeet Gannguli",
        "album": "Aashiqui 2",
        "bpm": 128,
        "src": "song/Milne Hai Mujhse Aayi.m4a",
        "cover": "song/covers/Milne Hai Mujhse Aayi.jpg",
        "color": "#0284c7",
        "glow": "#0284c7",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Pachtaoge",
        "artist": "Arijit Singh \u2022 B Praak",
        "album": "Jaani Ve",
        "bpm": 84,
        "src": "song/Pachtaoge.m4a",
        "cover": "song/covers/Pachtaoge.jpg",
        "color": "#dc2626",
        "glow": "#dc2626",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Manwa Laage",
        "artist": "Arijit Singh \u2022 Shreya Ghoshal",
        "album": "Happy New Year",
        "bpm": 86,
        "src": "song/Manwa Laage.m4a",
        "cover": "song/covers/Manwa Laage.jpg",
        "color": "#ec4899",
        "glow": "#ec4899",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Soch Na Sake",
        "artist": "Arijit Singh \u2022 Tulsi Kumar \u2022 Amaal Mallik",
        "album": "Airlift",
        "bpm": 82,
        "src": "song/Soch Na Sake.m4a",
        "cover": "song/covers/Soch Na Sake.jpg",
        "color": "#059669",
        "glow": "#059669",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Raaz Aankhein Teri",
        "artist": "Arijit Singh \u2022 Jeet Gannguli",
        "album": "Raaz Reboot",
        "bpm": 80,
        "src": "song/Raaz Aankhein Teri.m4a",
        "cover": "song/covers/Raaz Aankhein Teri.jpg",
        "color": "#b91c1c",
        "glow": "#b91c1c",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Mera Pyar Tera Pyar",
        "artist": "Arijit Singh \u2022 Jeet Gannguli",
        "album": "Jalebi",
        "bpm": 84,
        "src": "song/Mera Pyar Tera Pyar.m4a",
        "cover": "song/covers/Mera Pyar Tera Pyar.jpg",
        "color": "#d97706",
        "glow": "#d97706",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Dil Jhoom",
        "artist": "Arijit Singh \u2022 Mithoon",
        "album": "Gadar 2",
        "bpm": 90,
        "src": "song/Dil Jhoom.m4a",
        "cover": "song/covers/Dil Jhoom.jpg",
        "color": "#16a34a",
        "glow": "#16a34a",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Dilliwaali Girlfriend",
        "artist": "Arijit Singh \u2022 Sunidhi Chauhan \u2022 Pritam",
        "album": "Yeh Jawaani Hai Deewani",
        "bpm": 124,
        "src": "song/Dilliwaali Girlfriend.m4a",
        "cover": "song/covers/Dilliwaali Girlfriend.jpg",
        "color": "#f97316",
        "glow": "#f97316",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Tu Hi Yaar Mera",
        "artist": "Arijit Singh \u2022 Neha Kakkar",
        "album": "Pati Patni Aur Woh",
        "bpm": 92,
        "src": "song/Tu Hi Yaar Mera.m4a",
        "cover": "song/covers/Tu Hi Yaar Mera.jpg",
        "color": "#f43f5e",
        "glow": "#f43f5e",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Yeh Fitoor Mera",
        "artist": "Arijit Singh \u2022 Amit Trivedi",
        "album": "Fitoor",
        "bpm": 86,
        "src": "song/Yeh Fitoor Mera.m4a",
        "cover": "song/covers/Yeh Fitoor Mera.jpg",
        "color": "#7c3aed",
        "glow": "#7c3aed",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Satranga",
        "artist": "Arijit Singh \u2022 Shreyas Puranik",
        "album": "ANIMAL",
        "bpm": 80,
        "src": "song/Satranga.m4a",
        "cover": "song/covers/Satranga.jpg",
        "color": "#e11d48",
        "glow": "#e11d48",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Lutt Putt Gaya",
        "artist": "Arijit Singh \u2022 Pritam",
        "album": "Dunki",
        "bpm": 118,
        "src": "song/Lutt Putt Gaya.m4a",
        "cover": "song/covers/Lutt Putt Gaya.jpg",
        "color": "#ea580c",
        "glow": "#ea580c",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Shayad",
        "artist": "Arijit Singh \u2022 Pritam",
        "album": "Love Aaj Kal",
        "bpm": 84,
        "src": "song/Shayad.m4a",
        "cover": "song/covers/Shayad.jpg",
        "color": "#2563eb",
        "glow": "#2563eb",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Thodi Jagah",
        "artist": "Arijit Singh \u2022 Tanishk Bagchi",
        "album": "Marjaavaan",
        "bpm": 78,
        "src": "song/Thodi Jagah.m4a",
        "cover": "song/covers/Thodi Jagah.jpg",
        "color": "#0d9488",
        "glow": "#0d9488",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Saware",
        "artist": "Arijit Singh \u2022 Pritam",
        "album": "Phantom",
        "bpm": 84,
        "src": "song/Saware.m4a",
        "cover": "song/covers/Saware.jpg",
        "color": "#64748b",
        "glow": "#64748b",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Pasoori Nu",
        "artist": "Arijit Singh \u2022 Tulsi Kumar",
        "album": "Satyaprem Ki Katha",
        "bpm": 96,
        "src": "song/Pasoori Nu.m4a",
        "cover": "song/covers/Pasoori Nu.jpg",
        "color": "#ca8a04",
        "glow": "#ca8a04",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Jhoome Jo Pathaan",
        "artist": "Arijit Singh \u2022 Sukriti Kakar \u2022 Vishal-Shekhar",
        "album": "Pathaan",
        "bpm": 108,
        "src": "song/Jhoome Jo Pathaan.m4a",
        "cover": "song/covers/Jhoome Jo Pathaan.jpg",
        "color": "#0284c7",
        "glow": "#0284c7",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "What Jhumka ?",
        "artist": "Arijit Singh \u2022 Jonita Gandhi \u2022 Pritam",
        "album": "Rocky Aur Rani Kii Prem Kahaani",
        "bpm": 120,
        "src": "song/What Jhumka .m4a",
        "cover": "song/covers/What Jhumka .jpg",
        "color": "#db2777",
        "glow": "#db2777",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Ve Kamleya",
        "artist": "Arijit Singh \u2022 Shreya Ghoshal \u2022 Pritam",
        "album": "Rocky Aur Rani Kii Prem Kahaani",
        "bpm": 82,
        "src": "song/Ve Kamleya.m4a",
        "cover": "song/covers/Ve Kamleya.jpg",
        "color": "#9333ea",
        "glow": "#9333ea",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Aashiqui Aa Gayi",
        "artist": "Arijit Singh \u2022 Mithoon",
        "album": "Radhe Shyam",
        "bpm": 88,
        "src": "song/Aashiqui Aa Gayi.m4a",
        "cover": "song/covers/Aashiqui Aa Gayi.jpg",
        "color": "#f59e0b",
        "glow": "#f59e0b",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Zaalima",
        "artist": "Arijit Singh \u2022 Harshdeep Kaur",
        "album": "Raees",
        "bpm": 90,
        "src": "song/Zaalima.m4a",
        "cover": "song/covers/Zaalima.jpg",
        "color": "#d97706",
        "glow": "#d97706",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Kashmir Main Tu Kanyakumari",
        "artist": "Arijit Singh \u2022 Sunidhi Chauhan",
        "album": "Chennai Express",
        "bpm": 126,
        "src": "song/Kashmir Main Tu Kanyakumari.m4a",
        "cover": "song/covers/Kashmir Main Tu Kanyakumari.jpg",
        "color": "#16a34a",
        "glow": "#16a34a",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Aayat",
        "artist": "Arijit Singh \u2022 Sanjay Leela Bhansali",
        "album": "Bajirao Mastani",
        "bpm": 74,
        "src": "song/Aayat.m4a",
        "cover": "song/covers/Aayat.jpg",
        "color": "#b45309",
        "glow": "#b45309",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Binte Dil",
        "artist": "Arijit Singh \u2022 Sanjay Leela Bhansali",
        "album": "Padmaavat",
        "bpm": 98,
        "src": "song/Binte Dil Padmaavat 320 Kbps.mp3",
        "cover": "song/covers/Binte Dil.jpg",
        "color": "#eab308",
        "glow": "rgba(234, 179, 8, 0.88)",
        "glowSoft": "rgba(234, 179, 8, 0.40)",
        "lrcFile": "song/Binte Dil.lrc",
        "lyrics": [
            {
                "time": 15,
                "text": "Binte dil misriya mein,"
            },
            {
                "time": 21.5,
                "text": "Pesh hai khalish yeh..."
            },
            {
                "time": 29,
                "text": "Binte dil misriya mein,"
            },
            {
                "time": 35.5,
                "text": "Pesh hai khalish yeh..."
            },
            {
                "time": 43,
                "text": "Khaab ka jahan hai,"
            },
            {
                "time": 49.5,
                "text": "Zulfein bikhri hain shaam si"
            },
            {
                "time": 57,
                "text": "Yeh junoon hai kaisa,"
            },
            {
                "time": 64,
                "text": "Khumaar hai kaisa jaam si"
            },
            {
                "time": 71.5,
                "text": "Binte dil misriya mein..."
            },
            {
                "time": 85,
                "text": "Qatra qatra beh raha hai fiza mein,"
            },
            {
                "time": 93,
                "text": "Ishq ka nasha har ek adaa mein"
            },
            {
                "time": 101,
                "text": "Har lamha bekhudi ka silsila hai,"
            },
            {
                "time": 109,
                "text": "Rooh ko meri tera sahara mila hai"
            }
        ]
    },
    {
        "title": "Phir Kabhi",
        "artist": "Arijit Singh \u2022 Amaal Mallik",
        "album": "M.S. Dhoni: The Untold Story",
        "bpm": 84,
        "src": "song/Phir Kabhi.m4a",
        "cover": "song/covers/Phir Kabhi.jpg",
        "color": "#2563eb",
        "glow": "#2563eb",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Tera Chehra",
        "artist": "Arijit Singh \u2022 Himesh Reshammiya",
        "album": "Sanam Teri Kasam",
        "bpm": 82,
        "src": "song/Tera Chehra.m4a",
        "cover": "song/covers/Tera Chehra.jpg",
        "color": "#dc2626",
        "glow": "#dc2626",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Pal",
        "artist": "Arijit Singh \u2022 Shreya Ghoshal",
        "album": "Jalebi",
        "bpm": 84,
        "src": "song/Pal.m4a",
        "cover": "song/covers/Pal.jpg",
        "color": "#f43f5e",
        "glow": "#f43f5e",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "O Saathi",
        "artist": "Arijit Singh \u2022 Mithoon",
        "album": "Shab",
        "bpm": 80,
        "src": "song/O Saathi.m4a",
        "cover": "song/covers/O Saathi.jpg",
        "color": "#475569",
        "glow": "#475569",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Dil Ke Paas",
        "artist": "Arijit Singh \u2022 Tulsi Kumar",
        "album": "Wajah Tum Ho",
        "bpm": 86,
        "src": "song/Dil Ke Paas.m4a",
        "cover": "song/covers/Dil Ke Paas.jpg",
        "color": "#6366f1",
        "glow": "#6366f1",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Humdard",
        "artist": "Arijit Singh \u2022 Mithoon",
        "album": "Ek Villain",
        "bpm": 88,
        "src": "song/Humdard.m4a",
        "cover": "song/covers/Humdard.jpg",
        "color": "#0ea5e9",
        "glow": "#0ea5e9",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Hai Dil Ye Mera",
        "artist": "Arijit Singh \u2022 Mithoon",
        "album": "Hate Story 2",
        "bpm": 82,
        "src": "song/Hai Dil Ye Mera.m4a",
        "cover": "song/covers/Hai Dil Ye Mera.jpg",
        "color": "#991b1b",
        "glow": "#991b1b",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Raat Bhar",
        "artist": "Arijit Singh \u2022 Shreya Ghoshal",
        "album": "Heropanti",
        "bpm": 124,
        "src": "song/Raat Bhar.m4a",
        "cover": "song/covers/Raat Bhar.jpg",
        "color": "#7c3aed",
        "glow": "#7c3aed",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Aaj Phir",
        "artist": "Arijit Singh \u2022 Samira Koppikar",
        "album": "Hate Story 2",
        "bpm": 85,
        "src": "song/Aaj Phir.m4a",
        "cover": "song/covers/Aaj Phir.jpg",
        "color": "#831843",
        "glow": "#831843",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Rait Zara Si",
        "artist": "Arijit Singh \u2022 Shashaa Tirupati \u2022 A.R. Rahman",
        "album": "Atrangi Re",
        "bpm": 78,
        "src": "song/Rait Zara Si.m4a",
        "cover": "song/covers/Rait Zara Si.jpg",
        "color": "#d97706",
        "glow": "#d97706",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Hum Nashe Mein Toh Nahin",
        "artist": "Arijit Singh \u2022 Tulsi Kumar \u2022 Pritam",
        "album": "Bhool Bhulaiyaa 2",
        "bpm": 92,
        "src": "song/Hum Nashe Mein Toh Nahin.m4a",
        "cover": "song/covers/Hum Nashe Mein Toh Nahin.jpg",
        "color": "#059669",
        "glow": "#059669",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Ullu Ka Pattha",
        "artist": "Arijit Singh \u2022 Nikhita Gandhi \u2022 Pritam",
        "album": "Jagga Jasoos",
        "bpm": 116,
        "src": "song/Ullu Ka Pattha.m4a",
        "cover": "song/covers/Ullu Ka Pattha.jpg",
        "color": "#0284c7",
        "glow": "#0284c7",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "O Bedardeya",
        "artist": "Arijit Singh \u2022 Pritam",
        "album": "Tu Jhoothi Main Makkaar",
        "bpm": 76,
        "src": "song/O Bedardeya.m4a",
        "cover": "song/covers/O Bedardeya.jpg",
        "color": "#e11d48",
        "glow": "#e11d48",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Tu Hi Hai",
        "artist": "Arijit Singh \u2022 Amit Trivedi",
        "album": "Dear Zindagi",
        "bpm": 90,
        "src": "song/Tu Hi Hai.m4a",
        "cover": "song/covers/Tu Hi Hai.jpg",
        "color": "#14b8a6",
        "glow": "#14b8a6",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Tose Naina",
        "artist": "Arijit Singh \u2022 Hanif Shaikh",
        "album": "Mickey Virus",
        "bpm": 84,
        "src": "song/Tose Naina.m4a",
        "cover": "song/covers/Tose Naina.jpg",
        "color": "#8b5cf6",
        "glow": "#8b5cf6",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Ghungroo",
        "artist": "Arijit Singh \u2022 Shilpa Rao \u2022 Vishal-Shekhar",
        "album": "War",
        "bpm": 118,
        "src": "song/Ghungroo.m4a",
        "cover": "song/covers/Ghungroo.jpg",
        "color": "#ea580c",
        "glow": "#ea580c",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Main Tera Boyfriend",
        "artist": "Arijit Singh \u2022 Neha Kakkar",
        "album": "Raabta",
        "bpm": 128,
        "src": "song/Main Tera Boyfriend.m4a",
        "cover": "song/covers/Main Tera Boyfriend.jpg",
        "color": "#ec4899",
        "glow": "#ec4899",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Phir Bhi Tumko Chaahunga",
        "artist": "Arijit Singh \u2022 Shashaa Tirupati \u2022 Mithoon",
        "album": "Half Girlfriend",
        "bpm": 80,
        "src": "song/Phir Bhi Tumko Chaahunga.m4a",
        "cover": "song/covers/Phir Bhi Tumko Chaahunga.jpg",
        "color": "#2563eb",
        "glow": "#2563eb",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Tere Bina",
        "artist": "Arijit Singh \u2022 Aakanksha Sharma",
        "album": "1921",
        "bpm": 82,
        "src": "song/Tere Bina.m4a",
        "cover": "song/covers/Tere Bina.jpg",
        "color": "#475569",
        "glow": "#475569",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Raabta (Kehte Hain Khuda Ne)",
        "artist": "Arijit Singh \u2022 Shreya Ghoshal \u2022 Pritam",
        "album": "Agent Vinod",
        "bpm": 86,
        "src": "song/Raabta (Kehte Hain Khuda Ne).m4a",
        "cover": "song/covers/Raabta (Kehte Hain Khuda Ne).jpg",
        "color": "#b91c1c",
        "glow": "#b91c1c",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Tere Pyaar Mein",
        "artist": "Arijit Singh \u2022 Nikhita Gandhi \u2022 Pritam",
        "album": "Tu Jhoothi Main Makkaar",
        "bpm": 126,
        "src": "song/Tere Pyaar Mein.m4a",
        "cover": "song/covers/Tere Pyaar Mein.jpg",
        "color": "#0ea5e9",
        "glow": "#0ea5e9",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Pyaar Hota Kayi Baar Hai",
        "artist": "Arijit Singh \u2022 Pritam",
        "album": "Tu Jhoothi Main Makkaar",
        "bpm": 122,
        "src": "song/Pyaar Hota Kayi Baar Hai.m4a",
        "cover": "song/covers/Pyaar Hota Kayi Baar Hai.jpg",
        "color": "#f59e0b",
        "glow": "#f59e0b",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Duaa",
        "artist": "Arijit Singh \u2022 Nandini Srikar \u2022 Vishal-Shekhar",
        "album": "Shanghai",
        "bpm": 80,
        "src": "song/Duaa.m4a",
        "cover": "song/covers/Duaa.jpg",
        "color": "#6b7280",
        "glow": "#6b7280",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Sajni",
        "artist": "Arijit Singh \u2022 Ram Sampath",
        "album": "Laapataa Ladies",
        "bpm": 88,
        "src": "song/Sajni.m4a",
        "cover": "song/covers/Sajni.jpg",
        "color": "#d97706",
        "glow": "#d97706",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Soulmate",
        "artist": "Arijit Singh \u2022 Badshah",
        "album": "Badshah",
        "bpm": 94,
        "src": "song/Soulmate.m4a",
        "cover": "song/covers/Soulmate.jpg",
        "color": "#ca8a04",
        "glow": "#ca8a04",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Satyanaas",
        "artist": "Arijit Singh \u2022 Nakash Aziz \u2022 Pritam",
        "album": "Chandu Champion",
        "bpm": 120,
        "src": "song/Satyanaas.m4a",
        "cover": "song/covers/Satyanaas.jpg",
        "color": "#16a34a",
        "glow": "#16a34a",
        "glowSoft": "rgba(255, 112, 67, 0.40)"
    },
    {
        "title": "Kesariya",
        "artist": "Arijit Singh \u2022 Pritam \u2022 Amitabh B",
        "album": "Brahm\u0101stra",
        "bpm": 88,
        "src": "song/Kesariya.mp3",
        "cover": "song/Kesariya.jpg",
        "color": "#ff7043",
        "glow": "rgba(255, 112, 67, 0.88)",
        "glowSoft": "rgba(255, 112, 67, 0.40)",
        "video": "song/Kesariya.mp4",
        "lrcFile": "song/Kesariya.lrc",
        "lyrics": [
            {
                "time": 9.5,
                "text": "Mujhko itna bataye koyi"
            },
            {
                "time": 13.8,
                "text": "Kaise tujhse dil na lagaye koyi"
            },
            {
                "time": 18.2,
                "text": "Rabba ne tujhko banane mein"
            },
            {
                "time": 22.5,
                "text": "Kar di hai husn ki khaali tijoriyan"
            },
            {
                "time": 27,
                "text": "Kaajal ki siyahi se likhi"
            },
            {
                "time": 31,
                "text": "Hai tune jaane kitno ki love storiyan"
            },
            {
                "time": 36.5,
                "text": "Kesariya tera ishq hai piya"
            },
            {
                "time": 41.2,
                "text": "Rang jaaun jo main haath lagaun"
            },
            {
                "time": 45.5,
                "text": "Din beete saara teri fikr mein"
            },
            {
                "time": 50,
                "text": "Rain saari teri khair manaun"
            },
            {
                "time": 54.5,
                "text": "Kesariya tera ishq hai piya"
            },
            {
                "time": 59,
                "text": "Rang jaaun jo main haath lagaun"
            },
            {
                "time": 63.5,
                "text": "Din beete saara teri fikr mein"
            },
            {
                "time": 68,
                "text": "Rain saari teri khair manaun"
            },
            {
                "time": 73,
                "text": "Patjhad ke mausam mein bhi"
            },
            {
                "time": 76.8,
                "text": "Rangi chanar jaisi jhoome"
            },
            {
                "time": 81,
                "text": "Gehne ki tarah chamke"
            },
            {
                "time": 85.5,
                "text": "Jab dhool tere pairo ki choome"
            },
            {
                "time": 90,
                "text": "Aise na dekh sajna"
            },
            {
                "time": 94,
                "text": "Bura lagta hai tere bin"
            },
            {
                "time": 98.5,
                "text": "Kangan chann chann baje"
            },
            {
                "time": 102.5,
                "text": "Teri galiyon mein dhoome"
            },
            {
                "time": 107,
                "text": "Kesariya tera ishq hai piya"
            },
            {
                "time": 112,
                "text": "Rang jaaun jo main haath lagaun"
            },
            {
                "time": 116.5,
                "text": "Din beete saara teri fikr mein"
            },
            {
                "time": 121,
                "text": "Rain saari teri khair manaun"
            },
            {
                "time": 126,
                "text": "Kesariya tera ishq hai piya"
            },
            {
                "time": 131,
                "text": "Rang jaaun jo main haath lagaun"
            },
            {
                "time": 136,
                "text": "Din beete saara teri fikr mein"
            },
            {
                "time": 142,
                "text": "Rain saari teri khair manaun"
            }
        ]
    },
    {
        "title": "Sawan Aaya Hai",
        "artist": "Arijit Singh \u2022 Tony Kakkar",
        "album": "Creature 3D",
        "bpm": 92,
        "src": "song/Sawan Aaya Hai.mp3",
        "cover": "song/covers/Sawan Aaya Hai.jpg",
        "color": "#00b4d8",
        "glow": "rgba(0, 180, 216, 0.88)",
        "glowSoft": "rgba(0, 180, 216, 0.40)",
        "video": "song/Sawan Aaya Hai.mp4",
        "lrcFile": "song/Sawan Aaya Hai.lrc",
        "lyrics": [
            {
                "time": 15.5,
                "text": "Mohabbat barsa dena tu, sawan aaya hai"
            },
            {
                "time": 23,
                "text": "Tere aur mere milne ka, mausam aaya hai"
            },
            {
                "time": 31,
                "text": "Mohabbat barsa dena tu, sawan aaya hai"
            },
            {
                "time": 39,
                "text": "Tere aur mere milne ka, mausam aaya hai"
            },
            {
                "time": 47,
                "text": "Sabse chhupa ke tujhe seene se lagana hai"
            },
            {
                "time": 55,
                "text": "Pyar mein tere hadd se guzar jaana hai"
            },
            {
                "time": 63,
                "text": "Itna pyar kisi pe, pehli baar aaya hai"
            },
            {
                "time": 71,
                "text": "Mohabbat barsa dena tu, sawan aaya hai"
            },
            {
                "time": 79,
                "text": "Tere aur mere milne ka, mausam aaya hai"
            },
            {
                "time": 87,
                "text": "Kyun ek pal ki bhi judai sahi jaaye na"
            },
            {
                "time": 95,
                "text": "Kyun har ghadi sirf tera nasha chadh raha hai"
            },
            {
                "time": 103,
                "text": "Yeh khumaar tere ishq ka hai"
            },
            {
                "time": 109,
                "text": "Jo dil pe chha raha hai"
            },
            {
                "time": 115,
                "text": "Mohabbat barsa dena tu, sawan aaya hai"
            },
            {
                "time": 123,
                "text": "Tere aur mere milne ka, mausam aaya hai"
            }
        ]
    },
    {
        "title": "Yaad Hai Na",
        "artist": "Arijit Singh \u2022 Jeet Gannguli",
        "album": "Raaz Reboot",
        "bpm": 84,
        "src": "song/Yaad Hai Na.mp3",
        "cover": "song/covers/Yaad Hai Na.jpg",
        "color": "#9d4edd",
        "glow": "rgba(157, 78, 221, 0.88)",
        "glowSoft": "rgba(157, 78, 221, 0.40)",
        "video": "song/Yaad Hai Na.mp4",
        "lrcFile": "song/Yaad Hai Na.lrc",
        "lyrics": [
            {
                "time": 18,
                "text": "Woh mere aane pe khil jaana tera"
            },
            {
                "time": 24,
                "text": "Woh mere jaane pe chid jaana tera"
            },
            {
                "time": 30.5,
                "text": "Woh mere chhone pe sharmaana tera"
            },
            {
                "time": 37,
                "text": "Bheegi raaton mein behak jaana tera"
            },
            {
                "time": 43.5,
                "text": "Yaad hai na, yaad hai na, yaad hai na..."
            },
            {
                "time": 56.5,
                "text": "Woh mere aane pe khil jaana tera"
            },
            {
                "time": 63,
                "text": "Woh mere jaane pe chid jaana tera"
            },
            {
                "time": 69.5,
                "text": "Saath mein humne jo dekhe the sapne"
            },
            {
                "time": 76,
                "text": "Lagte the saare jahaan se woh apne"
            },
            {
                "time": 82.5,
                "text": "Tu muskuraaye toh jeeta tha main"
            },
            {
                "time": 89,
                "text": "Tere bina toh adhura tha main"
            },
            {
                "time": 95.5,
                "text": "Yaad hai na, yaad hai na, yaad hai na..."
            },
            {
                "time": 120,
                "text": "Har lamha tujhko hi sochte rehna"
            },
            {
                "time": 127,
                "text": "Bin bole baatein woh sab samajhna"
            },
            {
                "time": 134,
                "text": "Khwabon mein \u0924\u0947\u0930\u0947 hi bas kho jaana"
            },
            {
                "time": 141,
                "text": "Tera hi banke hamesha rehna"
            },
            {
                "time": 148,
                "text": "Yaad hai na, yaad hai na, yaad hai na..."
            }
        ]
    },
    {
        "title": "Chhod Diya",
        "artist": "Arijit Singh \u2022 Kanika Kapoor",
        "album": "Baazaar",
        "bpm": 80,
        "src": "song/Chhod Diya.mp3",
        "cover": "song/covers/Chhod Diya.jpg",
        "color": "#e63946",
        "glow": "rgba(230, 57, 70, 0.88)",
        "glowSoft": "rgba(230, 57, 70, 0.40)",
        "video": "song/Chhod Diya.mp4",
        "lrcFile": "song/Chhod Diya.lrc",
        "lyrics": [
            {
                "time": 9,
                "text": "Chhod diya woh raasta"
            },
            {
                "time": 14.5,
                "text": "Jis raaste se tum the guzre"
            },
            {
                "time": 20.5,
                "text": "Chhod diya woh raasta"
            },
            {
                "time": 26.5,
                "text": "Jis raaste se tum the guzre"
            },
            {
                "time": 32.5,
                "text": "Tod diya woh aaina"
            },
            {
                "time": 38.5,
                "text": "Jis aaine mein tum the dikhte"
            },
            {
                "time": 45,
                "text": "Roz sambhalte hain hum"
            },
            {
                "time": 50.5,
                "text": "Teri yaadon se ladte ladte"
            },
            {
                "time": 57,
                "text": "Chhod diya woh raasta"
            },
            {
                "time": 63,
                "text": "Jis raaste se tum the guzre"
            },
            {
                "time": 69,
                "text": "Tod diya woh aaina"
            },
            {
                "time": 75,
                "text": "Jis aaine mein tum the dikhte"
            },
            {
                "time": 81,
                "text": "Dil ko manana aasan nahi tha"
            },
            {
                "time": 87.5,
                "text": "Khud ko bhulana aasan nahi tha"
            },
            {
                "time": 94,
                "text": "Phir bhi yeh faisla humne kiya"
            },
            {
                "time": 100,
                "text": "Chhod diya woh raasta..."
            }
        ]
    },
    {
        "title": "Sooiyan",
        "artist": "Arijit Singh \u2022 Chinmayi Sripada",
        "album": "Guddu Rangeela",
        "bpm": 86,
        "src": "song/Sooiyan.mp3",
        "cover": "song/covers/Sooiyan.jpg",
        "color": "#06d6a0",
        "glow": "rgba(6, 214, 160, 0.88)",
        "glowSoft": "rgba(6, 214, 160, 0.40)",
        "video": "song/Sooiyan.mp4",
        "lrcFile": "song/Sooiyan.lrc",
        "lyrics": [
            {
                "time": 11,
                "text": "Sooiyan si, sooiyan si chubhti hain"
            },
            {
                "time": 17.5,
                "text": "Yeh aankhein judti hain"
            },
            {
                "time": 23,
                "text": "Teri aankhon se jab bhi milti hain"
            },
            {
                "time": 29.5,
                "text": "Sooiyan si, sooiyan si chubhti hain"
            },
            {
                "time": 36,
                "text": "Yeh yaadein udti hain"
            },
            {
                "time": 41.5,
                "text": "Tere aane se jab yeh khilti hain"
            },
            {
                "time": 48,
                "text": "Meetha sa dard yeh de jaati hain"
            },
            {
                "time": 54,
                "text": "Dheeme se paas yeh le aati hain"
            },
            {
                "time": 60.5,
                "text": "Khwabon mein rang bharti hain"
            },
            {
                "time": 66.5,
                "text": "Sooiyan si, sooiyan si chubhti hain"
            },
            {
                "time": 73,
                "text": "Yeh raatein dhalti hain"
            },
            {
                "time": 79,
                "text": "Teri saanson ki aahat milti hai"
            }
        ]
    },
    {
        "title": "Samjhawan",
        "artist": "Arijit Singh \u2022 Shreya Ghoshal",
        "album": "Humpty Sharma Ki Dulhania",
        "bpm": 76,
        "src": "song/Samjhawan Humpty Sharma Ki Dulhania 320 Kbps.mp3",
        "cover": "song/covers/Samjhawan.jpg",
        "color": "#ff9f24",
        "glow": "rgba(255, 159, 36, 0.88)",
        "glowSoft": "rgba(255, 159, 36, 0.40)",
        "lrcFile": "song/Samjhawan.lrc",
        "lyrics": [
            {
                "time": 11.5,
                "text": "Nahi jeena tere baaju,"
            },
            {
                "time": 15.5,
                "text": "Nahi jeena, nahi jeena..."
            },
            {
                "time": 31.5,
                "text": "Main tainu samjhawan ki,"
            },
            {
                "time": 35.5,
                "text": "Na tere bina lagda jee"
            },
            {
                "time": 43.5,
                "text": "Main tainu samjhawan ki,"
            },
            {
                "time": 47.5,
                "text": "Na tere bina lagda jee"
            },
            {
                "time": 51.5,
                "text": "Tu ki jaane pyaar mera,"
            },
            {
                "time": 55.5,
                "text": "Main karaan intezar tera"
            },
            {
                "time": 59.5,
                "text": "Tu dil, tuiyon jaan meri"
            },
            {
                "time": 63.5,
                "text": "Main tainu samjhawan ki,"
            },
            {
                "time": 67.5,
                "text": "Na tere bina lagda jee"
            },
            {
                "time": 119,
                "text": "Mere dil ne chun laiyaa ne,"
            },
            {
                "time": 123.5,
                "text": "Tere dil diyaan raahan"
            },
            {
                "time": 127.5,
                "text": "Tu jo mere naal turre taan,"
            },
            {
                "time": 131.5,
                "text": "Turpe meriyaan saahan"
            },
            {
                "time": 135.5,
                "text": "Jeena mera haye, hun hai tera,"
            },
            {
                "time": 139.5,
                "text": "Ki main karaan..."
            },
            {
                "time": 147.5,
                "text": "Tu kar aitbaar mera,"
            },
            {
                "time": 151.5,
                "text": "Main karaan intezar tera"
            },
            {
                "time": 155.5,
                "text": "Tu dil, tuiyon jaan meri"
            },
            {
                "time": 159.5,
                "text": "Main tainu samjhawan ki,"
            },
            {
                "time": 163.5,
                "text": "Na tere bina lagda jee"
            },
            {
                "time": 167.5,
                "text": "Ve changa nahion keeta beeba,"
            },
            {
                "time": 175.5,
                "text": "Dil mera tod ke"
            },
            {
                "time": 179.5,
                "text": "Ve bada pachhtaiyaan akhaan,"
            },
            {
                "time": 187.5,
                "text": "Naal tere jod ke"
            }
        ]
    },
    {
        "title": "Phir Le Aya Dil (Reprise)",
        "artist": "Arijit Singh \u2022 Pritam",
        "album": "Barfi!",
        "bpm": 72,
        "src": "song/Phir Le Aya Dil (Reprise) - Arijit Singh (DJJOhAL.Com).mp3",
        "cover": "song/covers/Phir Le Aya Dil (Reprise).jpg",
        "color": "#f59e0b",
        "glow": "rgba(245, 158, 11, 0.88)",
        "glowSoft": "rgba(245, 158, 11, 0.40)",
        "lrcFile": "song/Phir Le Aya Dil (Reprise).lrc",
        "lyrics": [
            {
                "time": 20,
                "text": "Phir le aaya dil majboor kya keeje,"
            },
            {
                "time": 34.5,
                "text": "Raas na aaya rehna door kya keeje..."
            },
            {
                "time": 46.5,
                "text": "Dil keh raha use maqammal kar bhi aao,"
            },
            {
                "time": 54.5,
                "text": "Woh jo adhuri si baat baaki hai,"
            },
            {
                "time": 61.5,
                "text": "Woh jo adhuri si yaad baaki hai,"
            },
            {
                "time": 67.5,
                "text": "Woh jo adhuri si yaad baaki hai..."
            },
            {
                "time": 79.5,
                "text": "Karte hain hum aaj qabool kya keeje,"
            },
            {
                "time": 91.5,
                "text": "Ho gayi thi humse yeh bhool kya keeje..."
            },
            {
                "time": 105.5,
                "text": "Dil keh raha use mayassar kar bhi aao,"
            },
            {
                "time": 114.5,
                "text": "Woh jo dabi si aas baaki hai,"
            },
            {
                "time": 126.5,
                "text": "Woh jo dabi si aanch baaki hai,"
            },
            {
                "time": 134.5,
                "text": "Woh jo dabi si aanch baaki hai..."
            },
            {
                "time": 170.5,
                "text": "Kismat ko hai manzoor kya keeje,"
            },
            {
                "time": 190.5,
                "text": "Kismat ko hai manzoor kya keeje..."
            },
            {
                "time": 214.5,
                "text": "Milte rahe hum badastoor kya keeje,"
            },
            {
                "time": 226.5,
                "text": "Dil keh raha hai use musalsal kar bhi aao..."
            }
        ]
    },
    {
        "title": "Khairiyat",
        "artist": "Arijit Singh \u2022 Pritam",
        "album": "Chhichhore",
        "bpm": 76,
        "src": "song/Khairiyat Chhichhore 320 Kbps.mp3",
        "cover": "song/covers/Khairiyat.jpg",
        "color": "#38bdf8",
        "glow": "rgba(56, 189, 248, 0.88)",
        "glowSoft": "rgba(56, 189, 248, 0.40)",
        "lrcFile": "song/Khairiyat.lrc",
        "lyrics": [
            {
                "time": 13.5,
                "text": "Khairiyat puchho, kabhi toh kaifiyat puchho,"
            },
            {
                "time": 20,
                "text": "Tumhare bin deewane ka kya haal hai"
            },
            {
                "time": 27,
                "text": "Dil mera dekho, na meri haisiyat puchho,"
            },
            {
                "time": 33.5,
                "text": "Tere bin ek din jaise sau saal hai"
            },
            {
                "time": 40.5,
                "text": "Anjaam hai tay mera,"
            },
            {
                "time": 44,
                "text": "Hona tumhe hai mera"
            },
            {
                "time": 47,
                "text": "Jitni bhi hon dooriyan filhaal hain..."
            },
            {
                "time": 54,
                "text": "Yeh dooriyan filhaal hain..."
            },
            {
                "time": 61,
                "text": "Khairiyat puchho, kabhi toh kaifiyat puchho,"
            },
            {
                "time": 67.5,
                "text": "Tumhare bin deewane ka kya haal hai"
            },
            {
                "time": 74.5,
                "text": "Dil mera dekho, na meri haisiyat puchho,"
            },
            {
                "time": 81,
                "text": "Tere bin ek din jaise sau saal hai"
            },
            {
                "time": 88,
                "text": "Baatein zaroori hain tera milna sahi hai,"
            },
            {
                "time": 95,
                "text": "Dil ki panahon mein tu hi toh basa hai"
            }
        ]
    },
    {
        "title": "Ve Haaniyaan",
        "artist": "Danny \u2022 Avvy Sra",
        "bpm": 90,
        "src": "song/Ve Haaniyaan.mp3",
        "lrcFile": "song/Ve Haaniyaan.lrc",
        "cover": "song/Screenshot 2026-10-24 224431.png",
        "color": "#ff5e7e",
        "glow": "rgba(255, 94, 126, 0.88)",
        "glowSoft": "rgba(255, 94, 126, 0.40)",
        "lyrics": [
            {
                "time": 7.5,
                "text": "Tere kolon mainu saah milde,"
            },
            {
                "time": 11.5,
                "text": "Assi aivein ni tainu bewajah milde"
            },
            {
                "time": 15.5,
                "text": "Tere ch koi gall ae sahiba,"
            },
            {
                "time": 19.5,
                "text": "Haan assi tainu tan milde"
            },
            {
                "time": 23.5,
                "text": "Mainu pata nahi hunda sukoon ki,"
            },
            {
                "time": 27.5,
                "text": "Tainu mile tan pata laggeya"
            },
            {
                "time": 31.5,
                "text": "Mit gayi meri sab tanhai,"
            },
            {
                "time": 35.5,
                "text": "Jee tere kol aa laggeya"
            },
            {
                "time": 39.5,
                "text": "Ve haaniyaan ve dil jaaniya,"
            },
            {
                "time": 43.5,
                "text": "Tu nehde nehde reh na door kite ja"
            },
            {
                "time": 47.5,
                "text": "Bhull gaye eh saari duniya,"
            },
            {
                "time": 51.5,
                "text": "Ke tera hi naam hai boldi zubaan"
            },
            {
                "time": 79.5,
                "text": "Eh jo sadde naal hoya ae,"
            },
            {
                "time": 83.5,
                "text": "Khoobsurat sapna lagdae"
            },
            {
                "time": 87.5,
                "text": "Ajnabee si kal tak jo,"
            },
            {
                "time": 91.5,
                "text": "Haan hun mainu apna lagdae"
            },
            {
                "time": 95.5,
                "text": "Tu hi din tu hi meri raat,"
            },
            {
                "time": 99.5,
                "text": "Koyi nahi hai tere toh bina"
            },
            {
                "time": 103.5,
                "text": "Ve haaniyaan ve dil jaaniya,"
            },
            {
                "time": 107.5,
                "text": "Tu nehde nehde reh na door kite ja"
            },
            {
                "time": 115.5,
                "text": "Bhull gaye eh saari duniya,"
            },
            {
                "time": 119.5,
                "text": "Ke tera hi naam hai boldi zubaan"
            },
            {
                "time": 127.5,
                "text": "Tainu vekhi jaawan main haye,"
            },
            {
                "time": 131.5,
                "text": "Ishq tere vich gaawan main"
            },
            {
                "time": 135.5,
                "text": "Mere dil nu mil gaya raah,"
            },
            {
                "time": 139.5,
                "text": "Jad tainu gal laawan main"
            },
            {
                "time": 143.5,
                "text": "Ke likheya si sadda milna,"
            },
            {
                "time": 147.5,
                "text": "Tu aiddan milna eh nahi si pata"
            },
            {
                "time": 151.5,
                "text": "Ve haaniyaan ve dil jaaniya,"
            },
            {
                "time": 155.5,
                "text": "Tu nehde nehde reh na door kite ja"
            },
            {
                "time": 159.5,
                "text": "Bhull gaye eh saari duniya,"
            },
            {
                "time": 163.5,
                "text": "Ke tera hi naam hai boldi zubaan"
            }
        ]
    },
    {
        "title": "Ishq Ka Fever",
        "artist": "Vishal Bhardwaj \u2022 Arijit Singh",
        "bpm": 104,
        "src": "song/Ishq Ka Fever O Romeo 320 Kbps.mp3",
        "lrcFile": "song/Ishq Ka Fever.lrc",
        "cover": "song/Screenshot 2026-10-24 224355.png",
        "color": "#d946ef",
        "glow": "rgba(217, 70, 239, 0.88)",
        "glowSoft": "rgba(217, 70, 239, 0.40)",
        "lyrics": [
            {
                "time": 11.5,
                "text": "Halka-halka fever hai,"
            },
            {
                "time": 17.5,
                "text": "Saans bhi dubli lagti hai"
            },
            {
                "time": 25.5,
                "text": "Dhoop mein jee nahi lagta,"
            },
            {
                "time": 30.5,
                "text": "Chhaanv bhi gham ki lagti hai"
            },
            {
                "time": 35.5,
                "text": "Kya rog yeh paala hai?"
            },
            {
                "time": 40.5,
                "text": "Mujhe ishq hua hai, ya hone wala hai"
            },
            {
                "time": 51.5,
                "text": "Mujhe ishq hua hai, ya hone wala hai"
            },
            {
                "time": 69.5,
                "text": "Nafz sehem ke chalti hai,"
            },
            {
                "time": 75.5,
                "text": "Hansi bhi mujrim lagti hai"
            },
            {
                "time": 83.5,
                "text": "Kya hua hai mujhko?"
            },
            {
                "time": 87.5,
                "text": "Kyun tanhayi achhi lagti hai?"
            },
            {
                "time": 95.5,
                "text": "Kya tumne hi koi jaadu daala hai?"
            },
            {
                "time": 103.5,
                "text": "Mujhe ishq hua hai, ya hone wala hai"
            },
            {
                "time": 110.5,
                "text": "Mujhe ishq hua hai, ya hone wala hai"
            }
        ]
    },
    {
        "title": "Tu Tu Hai Wohi",
        "artist": "Kishore Kumar \u2022 Asha Bhosle",
        "bpm": 124,
        "src": "song/Tu tu hai wohi dilne jise apna kaha_320(KoshalWorld.Com).mp3",
        "lrcFile": "song/Tu Tu Hai Wohi.lrc",
        "cover": "song/Screenshot 2026-10-24 224447.png",
        "color": "#10b981",
        "glow": "rgba(16, 185, 129, 0.88)",
        "glowSoft": "rgba(16, 185, 129, 0.40)",
        "lyrics": [
            {
                "time": 49.5,
                "text": "La, la la la la la, la la la la la la la"
            },
            {
                "time": 55.5,
                "text": "La, la la la la, la la la la la"
            },
            {
                "time": 61.5,
                "text": "Tu, tu hai wohi dil ne jise apna kaha,"
            },
            {
                "time": 67.5,
                "text": "Tu hai jahan, main hoon wahan,"
            },
            {
                "time": 73.5,
                "text": "Ab to yeh jeena tere bin hai saza..."
            },
            {
                "time": 79.5,
                "text": "Ho, mil jayein is tarah, do lehrein jis tarah,"
            },
            {
                "time": 85.5,
                "text": "Ho, mil jayein is tarah, do lehrein jis tarah,"
            },
            {
                "time": 91.5,
                "text": "Phir ho na juda, haan yeh vaada raha"
            },
            {
                "time": 133.5,
                "text": "Main aawaaz hoon to, tu hai geet mera,"
            },
            {
                "time": 139.5,
                "text": "Jahan se niraala, manmeet mera..."
            },
            {
                "time": 145.5,
                "text": "Mil jayein is tarah, do lehrein jis tarah,"
            },
            {
                "time": 157.5,
                "text": "Phir ho na juda, haan yeh vaada raha"
            },
            {
                "time": 163.5,
                "text": "Tu, tu hai wohi dil ne jise apna kaha,"
            },
            {
                "time": 169.5,
                "text": "Tu hai jahan, main hoon wahan,"
            },
            {
                "time": 175.5,
                "text": "Ab to yeh jeena tere bin hai saza..."
            },
            {
                "time": 211.5,
                "text": "Kisi mod pe bhi na yeh saath toote,"
            },
            {
                "time": 217.5,
                "text": "Mere haath se tera daaman na chhoote,"
            },
            {
                "time": 229.5,
                "text": "Kabhi khwaab mein bhi tu mujhse na roothe,"
            },
            {
                "time": 235.5,
                "text": "Mere pyaar ki koi khushiyan na loote..."
            },
            {
                "time": 241.5,
                "text": "Mil jayein is tarah, do lehrein jis tarah,"
            },
            {
                "time": 253.5,
                "text": "Phir ho na juda, haan yeh vaada raha"
            }
        ]
    },
    {
        "title": "Abhi Na Jao Chhod Kar",
        "artist": "Mohammed Rafi \u2022 Asha Bhosle",
        "bpm": 78,
        "src": "song/Abhi Na Jao Chhod Kar Hum Dono 320 Kbps.mp3",
        "cover": "song/Screenshot 2026-10-25 065342.png",
        "color": "#94a3b8",
        "glow": "rgba(148, 163, 184, 0.88)",
        "glowSoft": "rgba(148, 163, 184, 0.40)",
        "lyrics": [
            {
                "time": 15,
                "text": "Abhi na jao chhod kar, ke dil abhi bhara nahi"
            },
            {
                "time": 25,
                "text": "Abhi abhi to aaye ho, bahar ban ke chhaaye ho"
            },
            {
                "time": 35,
                "text": "Hawa zara mehak to le, nazar zara behak to le"
            },
            {
                "time": 45,
                "text": "Ye shaam dhal to le zara, ye dil sambhal to le zara"
            },
            {
                "time": 55,
                "text": "Abhi na jao chhod kar, ke dil abhi bhara nahi"
            },
            {
                "time": 70,
                "text": "Abhi to kuch kaha nahi, abhi to kuch suna nahi"
            },
            {
                "time": 80,
                "text": "Suno zara hum bhi to kuch, kehna chahein tumse"
            },
            {
                "time": 90,
                "text": "Nigaahon mein kuch to hai, jo kehne se reh gaya"
            },
            {
                "time": 100,
                "text": "Agar ye dil chhoota abhi, toh phir ye pal kahaan mile"
            },
            {
                "time": 115,
                "text": "Abhi na jao chhod kar, ke dil abhi bhara nahi"
            },
            {
                "time": 130,
                "text": "Nashe mein hain ye saari raahein, teri gali ke mod pe"
            },
            {
                "time": 140,
                "text": "Woh chand bhi akela hai, tere mere silsile"
            },
            {
                "time": 155,
                "text": "Zara theher jao, na jao yun"
            },
            {
                "time": 170,
                "text": "Abhi na jao chhod kar, ke dil abhi bhara nahi"
            },
            {
                "time": 185,
                "text": "Abhi abhi to aaye ho, bahar ban ke chhaaye ho"
            },
            {
                "time": 200,
                "text": "Abhi na jao chhod kar..."
            }
        ]
    },
    {
        "title": "Somewhere Only We Know",
        "artist": "Keane",
        "bpm": 86,
        "src": "song/Keane_-_Somewhere_Only_We_Know_CeeNaija.com_.mp3",
        "lrcFile": "song/Somewhere Only We Know.lrc",
        "cover": "song/Screenshot 2026-10-25 070356.png",
        "color": "#f472b6",
        "glow": "rgba(244, 114, 182, 0.88)",
        "glowSoft": "rgba(244, 114, 182, 0.40)",
        "lyrics": [
            {
                "time": 14,
                "text": "I walked across an empty land"
            },
            {
                "time": 21,
                "text": "I knew the pathway like the back of my hand"
            },
            {
                "time": 29,
                "text": "I felt the earth beneath my feet"
            },
            {
                "time": 36,
                "text": "Sat by the river and it made me complete"
            },
            {
                "time": 44,
                "text": "Oh, simple thing, where have you gone?"
            },
            {
                "time": 52,
                "text": "I'm getting old and I need something to rely on"
            },
            {
                "time": 60,
                "text": "So tell me when you're gonna let me in"
            },
            {
                "time": 67,
                "text": "I'm getting tired and I need somewhere to begin"
            },
            {
                "time": 76,
                "text": "I came across a fallen tree"
            },
            {
                "time": 83,
                "text": "I felt the branches of it looking at me"
            },
            {
                "time": 90,
                "text": "Is this the place we used to love?"
            },
            {
                "time": 98,
                "text": "Is this the place that I've been dreaming of?"
            },
            {
                "time": 106,
                "text": "Oh, simple thing, where have you gone?"
            },
            {
                "time": 113,
                "text": "I'm getting old and I need something to rely on"
            },
            {
                "time": 121,
                "text": "So tell me when you're gonna let me in"
            },
            {
                "time": 128,
                "text": "I'm getting tired and I need somewhere to begin"
            },
            {
                "time": 137,
                "text": "And if you have a minute, why don't we go"
            },
            {
                "time": 142,
                "text": "Talk about it somewhere only we know?"
            },
            {
                "time": 148,
                "text": "This could be the end of everything"
            },
            {
                "time": 152,
                "text": "So why don't we go somewhere only we know?"
            },
            {
                "time": 160,
                "text": "Somewhere only we know"
            },
            {
                "time": 174,
                "text": "Oh, simple thing, where have you gone?"
            },
            {
                "time": 182,
                "text": "I'm getting old and I need something to rely on"
            },
            {
                "time": 190,
                "text": "So tell me when you're gonna let me in"
            },
            {
                "time": 197,
                "text": "I'm getting tired and I need somewhere to begin"
            },
            {
                "time": 205,
                "text": "And if you have a minute, why don't we go"
            },
            {
                "time": 210,
                "text": "Talk about it somewhere only we know?"
            },
            {
                "time": 216,
                "text": "This could be the end of everything"
            },
            {
                "time": 221,
                "text": "So why don't we go somewhere only we know?"
            },
            {
                "time": 229,
                "text": "Somewhere only we know"
            }
        ]
    },
    {
        "title": "Kyon",
        "artist": "Papon \u2022 Sunidhi Chauhan",
        "bpm": 84,
        "src": "song/Papon_Sunidhi_Chauhan_-_Kyun_na_hum_tum_(mp3.pm).mp3",
        "lrcFile": "song/Kyon.lrc",
        "cover": "song/Screenshot 2026-10-25 134729.png",
        "color": "#38bdf8",
        "glow": "rgba(56, 189, 248, 0.88)",
        "glowSoft": "rgba(56, 189, 248, 0.40)",
        "lyrics": [
            {
                "time": 14,
                "text": "Kyon na hum tum"
            },
            {
                "time": 17.5,
                "text": "Chale tedhe medhe se raston pe nange paaon re"
            },
            {
                "time": 27.5,
                "text": "Kyon na hum tum"
            },
            {
                "time": 31,
                "text": "Dhoondhe phoolon bhari thandi thandi dhoop ya chhaaon re"
            },
            {
                "time": 41.5,
                "text": "Aashiyana apna baadal ki chaadar pe ho"
            },
            {
                "time": 48,
                "text": "Khol dein sab darwaaze hawaon ke liye"
            },
            {
                "time": 54.5,
                "text": "Kyon na hum tum..."
            },
            {
                "time": 68,
                "text": "Halki halki si leharon pe behne lagein"
            },
            {
                "time": 75,
                "text": "Kahin door kinare se kehne lagein"
            },
            {
                "time": 82,
                "text": "Baatein aisi jo pehle kahi na gayi"
            },
            {
                "time": 88.5,
                "text": "Khamoshi bhi lagne lagi madhbhari"
            },
            {
                "time": 95.5,
                "text": "Kyon na hum tum"
            },
            {
                "time": 99,
                "text": "Chale tedhe medhe se raston pe nange paaon re"
            },
            {
                "time": 109,
                "text": "Kyon na hum tum"
            },
            {
                "time": 112.5,
                "text": "Dhoondhe phoolon bhari thandi thandi dhoop ya chhaaon re"
            },
            {
                "time": 136,
                "text": "Rang saare zameen ke naye lag rahe"
            },
            {
                "time": 143,
                "text": "Jaise taare haathon mein aake saje"
            },
            {
                "time": 150,
                "text": "Har kadam pe nayi ek bahaar mile"
            },
            {
                "time": 156.5,
                "text": "Aankhon mein meetha sa ik khumaar mile"
            },
            {
                "time": 163.5,
                "text": "Kyon na hum tum"
            },
            {
                "time": 167,
                "text": "Chale tedhe medhe se raston pe nange paaon re"
            },
            {
                "time": 177,
                "text": "Kyon na hum tum"
            },
            {
                "time": 180.5,
                "text": "Dhoondhe phoolon bhari thandi thandi dhoop ya chhaaon re"
            }
        ]
    },
    {
        "title": "Jaiye Sajana",
        "artist": "Satinder Sartaaj \u2022 Jasmine Sandlas",
        "bpm": 108,
        "src": "song/Jaiye Sajana Dhurandhar The Revenge 320 Kbps.mp3",
        "lrcFile": "song/Jaiye Sajana.lrc",
        "cover": "song/Screenshot 2026-10-26 101216.png",
        "color": "#e11d48",
        "glow": "rgba(225, 29, 72, 0.88)",
        "glowSoft": "rgba(225, 29, 72, 0.40)",
        "minOS": "1.1",
        "lyrics": [
            {
                "time": 8,
                "text": "Pattalan chon digde hanjoo"
            },
            {
                "time": 14,
                "text": "Akh meri phir vi roi na..."
            },
            {
                "time": 20.5,
                "text": "Pattalan chon digde hanjoo"
            },
            {
                "time": 27,
                "text": "Akh meri phir vi roi na"
            },
            {
                "time": 33.5,
                "text": "Aisi preet la lai rabba"
            },
            {
                "time": 39.5,
                "text": "Jaisi hor kade hoi na..."
            },
            {
                "time": 46,
                "text": "Tere jaan ton main baad"
            },
            {
                "time": 51.5,
                "text": "Ik din soi na"
            },
            {
                "time": 57,
                "text": "Poora shehar begana"
            },
            {
                "time": 62.5,
                "text": "Ethe mera koi na"
            },
            {
                "time": 68.5,
                "text": "Phir preet kise de naal"
            },
            {
                "time": 74.5,
                "text": "Kade hoi na"
            },
            {
                "time": 80.5,
                "text": "Zamana zaalim taan vi roi na"
            },
            {
                "time": 87,
                "text": "Saare rang vekh lae"
            },
            {
                "time": 92.5,
                "text": "Hun koi dar nahi"
            },
            {
                "time": 98,
                "text": "Jiundi rahun aashiki"
            },
            {
                "time": 103.5,
                "text": "Eh kade na marni"
            },
            {
                "time": 109,
                "text": "Saanu saariyan visar gaiyan raahvan ve"
            },
            {
                "time": 116.5,
                "text": "Kede paase jaiye sajana..."
            },
            {
                "time": 124,
                "text": "Saanu saariyan visar gaiyan raahvan ve"
            },
            {
                "time": 131.5,
                "text": "Kede paase jaiye sajana..."
            }
        ]
    },
    {
        "title": "Time Zone",
        "artist": "Kaka",
        "bpm": 96,
        "src": "song/Time Zone - Kaka.mp3",
        "lrcFile": "song/Time Zone.lrc",
        "cover": "song/Screenshot 2026-10-26 102009.png",
        "color": "#f97316",
        "glow": "rgba(249, 115, 22, 0.88)",
        "glowSoft": "rgba(249, 115, 22, 0.40)",
        "minOS": "1.1",
        "lyrics": [
            {
                "time": 4.5,
                "text": "Ghari meri time dasse tere shehar da"
            },
            {
                "time": 9.5,
                "text": "Aithe adhi raat te othe deed dupehr da"
            },
            {
                "time": 14.5,
                "text": "Tere pichhe jaagne 'ch aa reha swaad"
            },
            {
                "time": 19.5,
                "text": "Waise chheti mera dil taan kitte ni thehron da"
            },
            {
                "time": 25,
                "text": "Dil kare aawan tere kol udd ke"
            },
            {
                "time": 29.5,
                "text": "Lake de kinare baithan naal judd ke"
            },
            {
                "time": 34.5,
                "text": "Hath phadd tera photo khichni dobara"
            },
            {
                "time": 39,
                "text": "Par Insta te post ni paauni mud ke"
            },
            {
                "time": 44,
                "text": "Aisi setting baithi ae apni"
            },
            {
                "time": 48.5,
                "text": "Suiyan khadi diyan taan ni chhediyan"
            },
            {
                "time": 53,
                "text": "Sacche pyaar 'chon nikalna main"
            },
            {
                "time": 57.5,
                "text": "Mere dil diyan tod bediyan"
            },
            {
                "time": 62,
                "text": "Mainu chat 'ch na bhej pappiyan"
            },
            {
                "time": 66.5,
                "text": "Mainu paunda ae sauraana jhappiyan"
            }
        ]
    }
];

  // Dynamic active playlist synced to OS version (1.0 vs 1.1)
  const PLAYLIST = [];

  let currentTrackIndex = 0;
  let isPlaying = false;
  let currentCardView = 'artwork'; // 'artwork' | 'lyrics' | 'songlist'
  let currentLyricIndex = -1;
  let lyricsRafId = null;

  function getActiveOSVersion() {
    if (window.CURRENT_OS_VERSION) return window.CURRENT_OS_VERSION;
    try {
      const sess = JSON.parse(localStorage.getItem('viev_auth_session') || '{}');
      const role = sess.role || 'digi';
      const stored = localStorage.getItem('viev_' + role + '_os_version');
      if (stored === '1.3') return '1.3';
      if (stored === '1.0') return '1.0';
      return '1.1';
    } catch(e) {
      return '1.1';
    }
  }

  function isOS13Active() {
    return parseFloat(getActiveOSVersion()) >= 1.3;
  }

  function syncMusicPlaylistWithOS(version) {
    const v = parseFloat(version) || 1.1;
    PLAYLIST.length = 0;
    MASTER_PLAYLIST.forEach(song => {
      if (!song.minOS || parseFloat(song.minOS) <= v) {
        PLAYLIST.push(song);
      }
    });
    window.PLAYLIST = PLAYLIST;
    if (typeof currentTrackIndex !== 'undefined' && currentTrackIndex >= PLAYLIST.length) {
      currentTrackIndex = 0;
    }
    const currentSong = PLAYLIST[currentTrackIndex];
    if (currentSong) {
      if (v >= 1.3) {
        updateMediaSession(currentSong);
        loadTrackLyrics(currentSong);
      } else {
        if ('mediaSession' in navigator) {
          try { navigator.mediaSession.metadata = null; } catch(e) {}
        }
      }
    }
    if (typeof renderSongList === 'function') {
      renderSongList();
    }
  }

  // Initial population from stored version (scoped per active role, defaults to 1.1 on deploy)
  const initialSavedOSVer = getActiveOSVersion();
  const initialV = parseFloat(initialSavedOSVer) || 1.1;
  MASTER_PLAYLIST.forEach(song => {
    if (!song.minOS || parseFloat(song.minOS) <= initialV) {
      PLAYLIST.push(song);
    }
  });

  window.PLAYLIST = PLAYLIST;
  window.syncMusicPlaylistWithOS = syncMusicPlaylistWithOS;

  const audio = document.getElementById('apple-music-audio') || new Audio();
  audio.setAttribute('playsinline', '');
  audio.setAttribute('webkit-playsinline', '');
  audio.playsInline = true;
  const musicPlayBtn = document.getElementById('music-play-btn');
  const musicControlsDeck = document.getElementById('music-vertical-controls-deck');
  const musicBarLeft = document.getElementById('music-bar-left');
  const musicBarRight = document.getElementById('music-bar-right');
  const prevBtn = document.getElementById('music-prev-btn');
  const nextBtn = document.getElementById('music-next-btn');
  const nowPlayingWrap = document.querySelector('.apple-now-playing-container');
  const artworkContainer = document.getElementById('apple-artwork-container');
  const artworkCard = document.getElementById('music-artwork-card');
  const artworkImg = document.getElementById('music-artwork-img');
  const artworkVideo = document.getElementById('music-artwork-video');
  const badgeOledVideo = document.getElementById('badge-oled-video');
  const artworkGlow = document.getElementById('music-art-glow');
  const ambilightImg = document.getElementById('music-ambilight-img');
  const glassFrame = document.getElementById('music-glass-frame');
  const glowOuter = document.getElementById('art-glow-outer');

  if (artworkVideo) {
    artworkVideo.muted = true;
    artworkVideo.playsInline = true;
    artworkVideo.addEventListener('playing', () => {
      if (artworkCard && artworkCard.classList.contains('has-video')) {
        artworkCard.classList.add('video-ready');
      }
    });
    artworkVideo.addEventListener('timeupdate', () => {
      if (artworkVideo.currentTime > 0.1 && artworkCard && artworkCard.classList.contains('has-video')) {
        artworkCard.classList.add('video-ready');
      }
    });
    artworkVideo.addEventListener('error', () => {
      if (artworkCard) artworkCard.classList.remove('video-ready');
    });
  }

  // =========================================================
  // MULTI-ZONE SPATIAL CHROMA & TRI-BAND AUDIO REACTIVE ENGINE
  // Edge-aware 4-quadrant chromatic extraction with independent
  // Sub-Bass, Vocal Mids, and High Treble frequency separation.
  // =========================================================
  let audioCtx = null;
  let analyser = null;
  let audioSourceNode = null;
  let beatVisualizerRafId = null;
  let currentBassPulse = 0;
  let currentMidPulse = 0;
  let currentTreblePulse = 0;
  let rollingBassAvg = 0.15;
  let rollingMidAvg = 0.20;
  let rollingTrebleAvg = 0.10;
  let gleamAngle = 45;

  const colorCache = new Map();
  let sampleCanvas = null;
  let sampleCtx = null;

  function hexToHsl(hex) {
    if (!hex) return [340, 85, 55];
    let c = hex.replace('#', '').trim();
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    if (c.length < 6) return [340, 85, 55];
    const r = parseInt(c.substring(0, 2), 16) / 255;
    const g = parseInt(c.substring(2, 4), 16) / 255;
    const b = parseInt(c.substring(4, 6), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  }

  function hslToRgb(h, s, l) {
    s /= 100; l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return `rgb(${Math.round(255 * f(0))}, ${Math.round(255 * f(8))}, ${Math.round(255 * f(4))})`;
  }

  function generateHarmonicQuadrantPalette(baseColorHex, glowHex) {
    const [h, s, l] = hexToHsl(baseColorHex || '#ff2d55');
    const sat = Math.min(100, Math.max(72, s));
    const light = Math.min(65, Math.max(45, l));
    return {
      tl: hslToRgb((h - 26 + 360) % 360, sat, light),
      tr: glowHex || hslToRgb((h + 24) % 360, Math.min(100, sat + 10), light),
      bl: hslToRgb((h - 48 + 360) % 360, Math.min(100, sat + 16), Math.max(38, light - 8)),
      br: hslToRgb((h + 46) % 360, Math.min(100, sat + 14), Math.max(40, light - 6)),
      mid: hslToRgb(h, sat, light)
    };
  }

  function sampleImageQuadrants(img) {
    try {
      if (!img || !img.complete || img.naturalWidth === 0) return null;
      if (!sampleCanvas) {
        sampleCanvas = document.createElement('canvas');
        sampleCanvas.width = 16;
        sampleCanvas.height = 10;
        sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });
      }
      if (!sampleCtx) return null;
      sampleCtx.clearRect(0, 0, 16, 10);
      sampleCtx.drawImage(img, 0, 0, 16, 10);
      const imgData = sampleCtx.getImageData(0, 0, 16, 10).data;

      const getAvg = (x0, y0, x1, y1, boost = 1.22) => {
        let r = 0, g = 0, b = 0, count = 0;
        for (let y = y0; y <= y1; y++) {
          for (let x = x0; x <= x1; x++) {
            const idx = (y * 16 + x) * 4;
            r += imgData[idx];
            g += imgData[idx + 1];
            b += imgData[idx + 2];
            count++;
          }
        }
        r = Math.min(255, Math.round((r / count) * boost));
        g = Math.min(255, Math.round((g / count) * boost));
        b = Math.min(255, Math.round((b / count) * boost));
        return `rgb(${r}, ${g}, ${b})`;
      };

      return {
        tl: getAvg(0, 0, 7, 4),
        tr: getAvg(8, 0, 15, 4),
        bl: getAvg(0, 5, 7, 9),
        br: getAvg(8, 5, 15, 9),
        mid: getAvg(4, 2, 11, 7)
      };
    } catch (e) {
      return null;
    }
  }

  function applyQuadrantPalette(palette) {
    if (!palette) return;
    const target = artworkGlow || artworkContainer || document.documentElement;
    target.style.setProperty('--glow-tl', palette.tl);
    target.style.setProperty('--glow-tr', palette.tr);
    target.style.setProperty('--glow-bl', palette.bl);
    target.style.setProperty('--glow-br', palette.br);
    target.style.setProperty('--glow-mid', palette.mid);
    if (glassFrame) {
      glassFrame.style.setProperty('--poster-specular', palette.tr || palette.mid);
    }
  }

  function updateMultiZonePalette(track) {
    if (!track) return;
    const key = track.title || track.file;
    if (colorCache.has(key)) {
      applyQuadrantPalette(colorCache.get(key));
      return;
    }
    const harmonic = generateHarmonicQuadrantPalette(track.color, track.glow);
    applyQuadrantPalette(harmonic);

    if (artworkImg && artworkImg.complete && artworkImg.naturalWidth > 0) {
      const sampled = sampleImageQuadrants(artworkImg);
      if (sampled) {
        colorCache.set(key, sampled);
        applyQuadrantPalette(sampled);
      }
    }
  }

  if (artworkImg) {
    artworkImg.addEventListener('load', () => {
      const currentTrack = PLAYLIST[currentTrackIndex];
      if (currentTrack) {
        const sampled = sampleImageQuadrants(artworkImg);
        if (sampled) {
          colorCache.set(currentTrack.title || currentTrack.file, sampled);
          applyQuadrantPalette(sampled);
        }
      }
    });
  }

  // Feature 6: Spatial Audio & Binaural Acoustics Nodes
  let dryGainNode = null;
  let wetGainNode = null;
  let convolverNode = null;
  let isSpatialAudioEnabled = true;
  let currentSpatialMode = 'hall'; // 'hall' | 'studio' | 'wide'
  let currentSpatialDepth = 0.35;

  function generateBinauralImpulse(ctx, duration = 2.4, decay = 2.0) {
    const rate = ctx.sampleRate;
    const len = Math.max(1, Math.floor(rate * duration));
    const buffer = ctx.createBuffer(2, len, rate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    for (let i = 0; i < len; i++) {
      const n = i / len;
      const env = Math.pow(1 - n, decay);
      left[i] = (Math.random() * 2 - 1) * env;
      right[i] = (Math.random() * 2 - 1) * env;
    }
    return buffer;
  }

  function updateSpatialAudioEngine() {
    if (!audioCtx || !dryGainNode || !wetGainNode || !convolverNode) return;
    if (!isSpatialAudioEnabled) {
      dryGainNode.gain.setTargetAtTime(1.0, audioCtx.currentTime, 0.05);
      wetGainNode.gain.setTargetAtTime(0.0, audioCtx.currentTime, 0.05);
      return;
    }

    if (currentSpatialMode === 'hall') {
      convolverNode.buffer = generateBinauralImpulse(audioCtx, 2.6, 2.0);
      dryGainNode.gain.setTargetAtTime(0.85, audioCtx.currentTime, 0.05);
      wetGainNode.gain.setTargetAtTime(currentSpatialDepth, audioCtx.currentTime, 0.05);
    } else if (currentSpatialMode === 'studio') {
      convolverNode.buffer = generateBinauralImpulse(audioCtx, 0.8, 3.5);
      dryGainNode.gain.setTargetAtTime(0.95, audioCtx.currentTime, 0.05);
      wetGainNode.gain.setTargetAtTime(currentSpatialDepth * 0.65, audioCtx.currentTime, 0.05);
    } else if (currentSpatialMode === 'wide') {
      convolverNode.buffer = generateBinauralImpulse(audioCtx, 1.4, 2.5);
      dryGainNode.gain.setTargetAtTime(0.90, audioCtx.currentTime, 0.05);
      wetGainNode.gain.setTargetAtTime(currentSpatialDepth * 0.85, audioCtx.currentTime, 0.05);
    }
  }

  function initAudioVisualizer() {
    if (audioCtx) return;
    // iOS Safari Fix: On iPhone/iPad, routing <audio> through WebAudio createMediaElementSource
    // causes iOS to suspend audio on screen lock or after 30-60s.
    // By keeping HTML5 audio native on iOS, playback continues in background forever without stopping!
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIOS) {
      return; // Uses smooth polyrhythmic fallback wave in beatVisualizerLoop
    }
    try {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtxClass) return;
      audioCtx = new AudioCtxClass();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      audioSourceNode = audioCtx.createMediaElementSource(audio);
      audioSourceNode.connect(analyser);
      analyser.connect(audioCtx.destination);
    } catch (e) {
      // Graceful fallback to real-time audio.currentTime polyrhythmic wave
    }
  }

  function startBeatVisualizer() {
    initAudioVisualizer();
    if (!beatVisualizerRafId) {
      beatVisualizerRafId = requestAnimationFrame(beatVisualizerLoop);
    }
  }

  function stopBeatVisualizer() {
    if (beatVisualizerRafId) {
      cancelAnimationFrame(beatVisualizerRafId);
      beatVisualizerRafId = null;
    }
    currentBassPulse = 0;
    currentMidPulse = 0;
    currentTreblePulse = 0;
    rollingBassAvg = 0.15;
    rollingMidAvg = 0.20;
    rollingTrebleAvg = 0.10;

    if (artworkGlow) {
      artworkGlow.style.setProperty('--bass-energy', '0');
      artworkGlow.style.setProperty('--mid-energy', '0');
      artworkGlow.style.setProperty('--treble-energy', '0');
      artworkGlow.style.transform = '';
      artworkGlow.style.opacity = '';
    }
    if (ambilightImg) {
      ambilightImg.style.filter = '';
    }
    if (glassFrame) {
      glassFrame.style.transform = '';
      glassFrame.style.opacity = '';
      if (glowOuter) glowOuter.style.opacity = '';
    }
    if (artworkCard && !artworkCard.classList.contains('is-depth-bg')) {
      artworkCard.style.transform = '';
    }
  }

  function beatVisualizerLoop() {
    if (!isPlaying || audio.paused || currentTab !== 'music' || currentCardView !== 'artwork') {
      stopBeatVisualizer();
      return;
    }

    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    let targetBass = 0;
    let targetMid = 0;
    let targetTreble = 0;
    let hasSignal = false;

    if (analyser) {
      const freqData = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(freqData);

      let signalSum = 0;
      for (let i = 0; i < 20; i++) signalSum += freqData[i];

      if (signalSum > 8) {
        hasSignal = true;

        // BAND 1: SUB-BASS & KICK (~20Hz - 150Hz, Bins 0..3)
        const subBass = (freqData[0] * 1.6 + freqData[1] * 2.2 + freqData[2] * 2.0 + freqData[3] * 1.4) / (7.2 * 255);
        rollingBassAvg = rollingBassAvg * 0.93 + subBass * 0.07;
        const bassTransient = Math.max(0, subBass - rollingBassAvg * 1.15);
        targetBass = Math.min(1.0, subBass * 0.55 + bassTransient * 4.0);

        // BAND 2: VOCALS & MELODIC MIDS (~200Hz - 2.8kHz, Bins 4..24)
        let midSum = 0;
        for (let i = 4; i <= 24; i++) midSum += freqData[i];
        const rawMids = midSum / (21 * 255);
        rollingMidAvg = rollingMidAvg * 0.95 + rawMids * 0.05;
        const midTransient = Math.max(0, rawMids - rollingMidAvg * 1.12);
        targetMid = Math.min(1.0, rawMids * 0.70 + midTransient * 2.8);

        // BAND 3: HIGH TREBLE & CRISP TRANSIENTS (~3.5kHz - 16kHz, Bins 28..64)
        let trebleSum = 0;
        const trebleEnd = Math.min(64, freqData.length);
        for (let i = 28; i < trebleEnd; i++) trebleSum += freqData[i];
        const rawTreble = trebleSum / (Math.max(1, trebleEnd - 28) * 255);
        rollingTrebleAvg = rollingTrebleAvg * 0.94 + rawTreble * 0.06;
        const trebleTransient = Math.max(0, rawTreble - rollingTrebleAvg * 1.25);
        targetTreble = Math.min(1.0, rawTreble * 0.50 + trebleTransient * 4.6);
      }
    }

    // Polyrhythmic Musical Synchronization locked to playback time
    if (!hasSignal) {
      const currentTrack = PLAYLIST[currentTrackIndex];
      const songBpm = (currentTrack && currentTrack.bpm) ? currentTrack.bpm : 92;
      const playTime = audio.currentTime > 0 ? audio.currentTime : (performance.now() / 1000);
      const t = (playTime * (songBpm / 60)) * Math.PI;

      // 3 independent rhythmic envelopes
      targetBass = Math.pow(Math.max(0, Math.sin(t)), 4) * 0.82;
      targetMid = (Math.sin(t * 0.5) * 0.5 + 0.5) * 0.68;
      targetTreble = Math.pow(Math.max(0, Math.sin(t * 2.0)), 6) * 0.72;
    }

    // Independent attack and decay curves:
    // Bass: Snappy kick attack, warm resonant decay
    const bassAttack = targetBass > currentBassPulse ? 0.55 : 0.12;
    currentBassPulse += (targetBass - currentBassPulse) * bassAttack;

    // Mids: Fluid organic vocal/melodic breath
    const midAttack = targetMid > currentMidPulse ? 0.35 : 0.16;
    currentMidPulse += (targetMid - currentMidPulse) * midAttack;

    // Treble: Fast transient spark, crisp instantaneous release
    const trebleAttack = targetTreble > currentTreblePulse ? 0.75 : 0.22;
    currentTreblePulse += (targetTreble - currentTreblePulse) * trebleAttack;

    // Dynamic Cinema-style Adaptive Ambilight scaling & brightness pulse
    if (artworkGlow) {
      artworkGlow.style.setProperty('--bass-energy', currentBassPulse.toFixed(3));
      artworkGlow.style.setProperty('--mid-energy', currentMidPulse.toFixed(3));
      artworkGlow.style.setProperty('--treble-energy', currentTreblePulse.toFixed(3));
      const scale = 1.0 + (currentBassPulse * 0.045);
      const brightness = 1.05 + (currentBassPulse * 0.22);
      artworkGlow.style.transform = `scale(${scale.toFixed(3)})`;
      if (ambilightImg) {
        ambilightImg.style.filter = `blur(48px) saturate(220%) brightness(${brightness.toFixed(2)})`;
      }
    }

    // Traveling Rim Prism acceleration: Treble hits ignite crystalline prism transit
    gleamAngle = (gleamAngle + 0.75 + currentTreblePulse * 3.8 + currentMidPulse * 0.6) % 360;
    if (glassFrame) {
      glassFrame.style.setProperty('--glass-gleam-angle', gleamAngle.toFixed(1) + 'deg');
    }

    beatVisualizerRafId = requestAnimationFrame(beatVisualizerLoop);
  }
  const trackTitleEl = document.getElementById('music-track-title');
  const trackArtistEl = document.getElementById('music-track-artist');
  const favBtn = document.getElementById('music-fav-btn');
  const scrubberBar = document.getElementById('apple-scrubber-bar');
  const scrubberProgress = document.getElementById('apple-scrubber-progress');
  const curTimeEl = document.getElementById('music-cur-time');
  const remTimeEl = document.getElementById('music-rem-time');
  const volumeTrack = document.getElementById('apple-volume-track');
  const volumeFill = volumeTrack ? volumeTrack.querySelector('.apple-volume-fill') : null;

  // New In-Player Panels: Lyrics and Song List
  const lyricsBtn = document.getElementById('music-lyrics-btn');
  const songlistBtn = document.getElementById('music-songlist-btn');
  const lyricsCard = document.getElementById('music-lyrics-card');
  const songlistCard = document.getElementById('music-songlist-card');
  const lyricsContent = document.getElementById('music-lyrics-content');
  const songlistItems = document.getElementById('music-songlist-items');
  const lyricsCloseBtn = document.getElementById('lyrics-close-btn');
  const songlistCloseBtn = document.getElementById('songlist-close-btn');
  const songSearchWrap = document.getElementById('music-song-search-wrap');
  const songSearchInput = document.getElementById('music-song-search-input');
  const songSearchClear = document.getElementById('music-song-search-clear');
  const calibMinusBtn = document.getElementById('calib-minus-btn');
  const calibPlusBtn = document.getElementById('calib-plus-btn');
  const calibResetBtn = document.getElementById('calib-reset-btn');
  const calibOffsetVal = document.getElementById('calib-offset-val');

  // Apple Playback Modes Controls (Shuffle, Repeat, Speed, Sleep Timer)
  const modesRow = document.getElementById('apple-modes-row');
  const shuffleBtn = document.getElementById('mode-shuffle-btn');
  const repeatBtn = document.getElementById('mode-repeat-btn');
  const repeatBadgeOne = document.getElementById('repeat-badge-one');
  const speedBtn = document.getElementById('mode-speed-btn');
  const speedLabel = document.getElementById('speed-label');
  const sleepBtn = document.getElementById('mode-sleep-btn');
  const sleepBadge = document.getElementById('sleep-badge');
  const timerSheet = document.getElementById('apple-timer-sheet');
  const timerBackdrop = document.getElementById('timer-sheet-backdrop');
  const timerCloseBtn = document.getElementById('timer-close-btn');
  const timerOptionBtns = document.querySelectorAll('.timer-option');

  let isShuffle = false;
  let repeatMode = 'all'; // 'all' | 'one' | 'off'
  const speedRates = [1.0, 1.25, 1.5, 0.8];
  let speedIdx = 0;
  let sleepMode = 0; // 0 = off, >0 = mins, -1 = end of track
  let sleepTimerTimeout = null;
  let sleepInterval = null;
  let sleepExpiryTime = null;

  function getTrackOffset(trackTitle) {
    if (!trackTitle) return 0.0;
    const val = localStorage.getItem('apple_lyric_offset_' + trackTitle);
    return val !== null ? parseFloat(val) : 0.0;
  }

  function setTrackOffset(trackTitle, offset) {
    if (!trackTitle) return;
    const rounded = Math.round(offset * 10) / 10;
    localStorage.setItem('apple_lyric_offset_' + trackTitle, rounded.toFixed(1));
    updateCalibratorUI();
    updateSyncedLyrics(audio.currentTime, true);
  }

  function updateCalibratorUI() {
    if (!calibOffsetVal) return;
    const track = PLAYLIST[currentTrackIndex];
    if (!track) return;
    const offset = getTrackOffset(track.title);
    calibOffsetVal.textContent = (offset > 0 ? '+' : '') + offset.toFixed(1) + 's';
  }

  if (calibMinusBtn) {
    calibMinusBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const track = PLAYLIST[currentTrackIndex];
      if (!track) return;
      const cur = getTrackOffset(track.title);
      setTrackOffset(track.title, cur - 0.5);
    });
  }

  if (calibPlusBtn) {
    calibPlusBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const track = PLAYLIST[currentTrackIndex];
      if (!track) return;
      const cur = getTrackOffset(track.title);
      setTrackOffset(track.title, cur + 0.5);
    });
  }

  if (calibResetBtn) {
    calibResetBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const track = PLAYLIST[currentTrackIndex];
      if (!track) return;
      setTrackOffset(track.title, 0.0);
    });
  }

  function formatTime(sec) {
    if (isNaN(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function syncLoop() {
    if (isPlaying && !audio.paused && currentTab === 'music' && currentCardView === 'lyrics') {
      updateSyncedLyrics(audio.currentTime);
      lyricsRafId = requestAnimationFrame(syncLoop);
    } else {
      stopSyncLoop();
    }
  }

  function startSyncLoop() {
    if (lyricsRafId) cancelAnimationFrame(lyricsRafId);
    if (isPlaying && !audio.paused && currentTab === 'music' && currentCardView === 'lyrics') {
      lyricsRafId = requestAnimationFrame(syncLoop);
    }
  }

  function stopSyncLoop() {
    if (lyricsRafId) {
      cancelAnimationFrame(lyricsRafId);
      lyricsRafId = null;
    }
  }

  function setPlayPauseUI(playing) {
    isPlaying = playing;
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
    }
    if (playing) {
      if (currentTab === 'music') {
        if (currentCardView === 'artwork') startBeatVisualizer();
        if (currentCardView === 'lyrics') startSyncLoop();
      }
    } else {
      stopSyncLoop();
      stopBeatVisualizer();
    }

    if (floatingOrb) {
      floatingOrb.classList.toggle('is-playing', playing);
    }
    updateFloatingOrbVisibility();

    // Toggle track meta and Dolby Atmos badges for playing state
    const trackMeta = document.querySelector('.apple-track-meta');
    if (trackMeta) {
      trackMeta.classList.toggle('is-playing', playing);
    }
    const audioBadges = document.getElementById('music-audio-badges');
    if (audioBadges) {
      audioBadges.classList.toggle('is-playing', playing);
    }

    if (musicPlayBtn) {
      const playIcon = musicPlayBtn.querySelector('.play-icon');
      const pauseIcon = musicPlayBtn.querySelector('.pause-icon');
      if (playIcon) playIcon.style.display = playing ? 'none' : 'block';
      if (pauseIcon) pauseIcon.style.display = playing ? 'block' : 'none';
    }
    if (artworkCard) artworkCard.classList.toggle('is-paused', !playing);
    if (artworkGlow) artworkGlow.classList.toggle('is-paused', !playing);
    if (glassFrame) glassFrame.classList.toggle('is-paused', !playing);

    // Sync OLED Video playback state
    if (artworkVideo && artworkVideo.src) {
      if (playing) {
        artworkVideo.play().catch(() => {});
      } else {
        artworkVideo.pause();
      }
    }

    // Update active equalizer in Song List if visible
    if (songlistItems) {
      const activeItem = songlistItems.querySelector('.song-list-item.is-active');
      if (activeItem) {
        activeItem.classList.toggle('is-paused', !playing);
      }
    }

    if (playing) {
      if (currentTab === 'music') {
        dimMusicControls(500);
        scheduleMusicIdleAnimation(2800);
      }
    } else {
      wakeMusicControls(0);
      resetMusicIdleState();
    }
  }

  // =========================================================
  // APPLE MUSIC: DUAL VERTICAL BARS DIMMING & DOCK COLLAPSE
  // 1. Gently dims vertical sidebars & play button on playback
  // 2. Play/Pause button and sidebars remain visible and interactive
  // 3. Floating dock tucks smoothly without glitching
  // 4. Wakes immediately on interaction or audio stop
  // =========================================================
  let musicIdleTimeout = null;
  let musicDimTimeout = null;
  let isMusicDockCollapsed = false;
  let isMusicControlsDimmed = false;

  function dimMusicControls(delay = 500) {
    if (musicDimTimeout) {
      clearTimeout(musicDimTimeout);
      musicDimTimeout = null;
    }
    if (!isPlaying || audio.paused || currentTab !== 'music') return;
    if (typeof currentCardView !== 'undefined' && currentCardView !== 'artwork') return;

    if (delay === 0) {
      if (musicControlsDeck) {
        musicControlsDeck.classList.add('is-playing-dimmed');
      }
      isMusicControlsDimmed = true;
      return;
    }

    musicDimTimeout = setTimeout(() => {
      if (!isPlaying || audio.paused || currentTab !== 'music') return;
      if (typeof currentCardView !== 'undefined' && currentCardView !== 'artwork') return;
      if (musicControlsDeck) {
        musicControlsDeck.classList.add('is-playing-dimmed');
      }
      isMusicControlsDimmed = true;
    }, delay);
  }

  function wakeMusicControls(autoDimAfter = 3500) {
    if (musicDimTimeout) {
      clearTimeout(musicDimTimeout);
      musicDimTimeout = null;
    }
    if (musicControlsDeck) {
      musicControlsDeck.classList.remove('is-playing-dimmed');
    }
    isMusicControlsDimmed = false;

    if (autoDimAfter > 0 && isPlaying && !audio.paused && currentTab === 'music' && (typeof currentCardView === 'undefined' || currentCardView === 'artwork')) {
      dimMusicControls(autoDimAfter);
    }
  }

  function scheduleMusicIdleAnimation(delay = 2800) {
    if (musicIdleTimeout) {
      clearTimeout(musicIdleTimeout);
      musicIdleTimeout = null;
    }
    if (!isPlaying || audio.paused || currentTab !== 'music' || document.hidden) {
      return;
    }
    musicIdleTimeout = setTimeout(() => {
      if (!isPlaying || audio.paused || currentTab !== 'music') return;

      // 1. Ensure controls are dimmed
      dimMusicControls(0);

      // 2. "shrink ho tak phle slider jo music par rhta hai usse hide kar then instant section taki lag na ho"
      if (floatingDock && !floatingDock.classList.contains('is-music-collapsed')) {
        // Step 1: Hide indicator slider first
        if (indicator) {
          indicator.style.opacity = '0';
        }
        // Step 2: Then collapse music section
        setTimeout(() => {
          if (floatingDock && isPlaying && !audio.paused && currentTab === 'music') {
            floatingDock.classList.add('is-music-collapsed');
            isMusicDockCollapsed = true;
          }
        }, 120);
      }
    }, delay);
  }

  function restoreMusicDock() {
    if (musicIdleTimeout) {
      clearTimeout(musicIdleTimeout);
      musicIdleTimeout = null;
    }
    const wasCollapsed = isMusicDockCollapsed || (floatingDock && floatingDock.classList.contains('is-music-collapsed'));
    if (!wasCollapsed) return;
    isMusicDockCollapsed = false;

    // "openingke time bhi same cheez kar phle music ko unhide kar then instant slider ko show kar"
    if (floatingDock) {
      floatingDock.classList.remove('is-music-collapsed');
    }
    const musicTab = document.getElementById('tab-music');
    if (musicTab && currentTab === 'music') {
      if (indicator) indicator.style.opacity = '0';
      setTimeout(() => {
        if (currentTab === 'music' && !isMusicDockCollapsed && indicator) {
          updateIndicator(musicTab, false);
          indicator.style.opacity = '1';
        }
      }, 550);
    }
    if (isPlaying && !audio.paused && currentTab === 'music') {
      scheduleMusicIdleAnimation(3500);
    }
  }

  function resetMusicIdleState() {
    if (musicIdleTimeout) {
      clearTimeout(musicIdleTimeout);
      musicIdleTimeout = null;
    }
    if (musicDimTimeout) {
      clearTimeout(musicDimTimeout);
      musicDimTimeout = null;
    }
    if (musicControlsDeck) {
      musicControlsDeck.classList.remove('is-playing-dimmed');
    }
    isMusicControlsDimmed = false;

    const wasCollapsed = isMusicDockCollapsed || (floatingDock && floatingDock.classList.contains('is-music-collapsed'));
    if (floatingDock) {
      floatingDock.classList.remove('is-music-collapsed');
    }
    isMusicDockCollapsed = false;

    const musicTab = document.getElementById('tab-music');
    if (musicTab && currentTab === 'music') {
      if (wasCollapsed) {
        // "openingke time bhi same cheez kar phle music ko unhide kar then instant slider ko show kar"
        if (indicator) indicator.style.opacity = '0';
        setTimeout(() => {
          if (currentTab === 'music' && indicator) {
            updateIndicator(musicTab, false);
            indicator.style.opacity = '1';
          }
        }, 550);
      } else {
        updateIndicator(musicTab);
        if (indicator) indicator.style.opacity = '1';
      }
    }
  }

  // Interaction listeners for sidebars
  if (musicBarLeft) {
    ['pointerdown', 'touchstart', 'click'].forEach(evt => {
      musicBarLeft.addEventListener(evt, () => wakeMusicControls(3500), { passive: true });
    });
  }

  if (musicBarRight) {
    ['pointerdown', 'touchstart', 'click'].forEach(evt => {
      musicBarRight.addEventListener(evt, () => wakeMusicControls(3500), { passive: true });
    });
  }

  const musicScreenEl = pageScreens && pageScreens.music;
  if (musicScreenEl) {
    musicScreenEl.addEventListener('pointerdown', (e) => {
      if (floatingDock && floatingDock.contains(e.target)) return;
      if (musicPlayBtn && musicPlayBtn.contains(e.target)) return;
      wakeMusicControls(3000);
    }, { passive: true });
  }

  if (floatingDock) {
    floatingDock.addEventListener('pointerenter', () => {
      if (isMusicDockCollapsed) restoreMusicDock();
    });
    floatingDock.addEventListener('pointerdown', () => {
      if (isMusicDockCollapsed) restoreMusicDock();
    });
  }

  const musicTabBtn = document.getElementById('tab-music');
  if (musicTabBtn) {
    musicTabBtn.addEventListener('transitionend', (e) => {
      if (e.propertyName === 'max-width' && currentTab === 'music' && !isMusicDockCollapsed) {
        updateIndicator(musicTabBtn, false);
        if (indicator) indicator.style.opacity = '1';
      }
    });
  }

  // Native smooth scrolling for lyrics without CPU animation tick overhead
  function smoothScrollLyricsTo(targetY) {
    if (!lyricsContent) return;
    try {
      lyricsContent.scrollTo({ top: targetY, behavior: 'smooth' });
    } catch (e) {
      lyricsContent.scrollTop = targetY;
    }
  }

  // Cancel programmatic scroll if user manually scrolls/touches
  if (lyricsContent) {
    lyricsContent.addEventListener('wheel', () => {
      if (scrollAnimId) cancelAnimationFrame(scrollAnimId);
    }, { passive: true });
    lyricsContent.addEventListener('touchstart', () => {
      if (scrollAnimId) cancelAnimationFrame(scrollAnimId);
    }, { passive: true });
  }

  // View Switcher: Apple Music Fast Hardware-Accelerated Panel Switch
  function setCardView(view) {
    currentCardView = view;

    if (artworkContainer) {
      if (view === 'lyrics' || view === 'songlist') {
        artworkContainer.classList.add('is-panel-mode');
      } else {
        artworkContainer.classList.remove('is-panel-mode');
      }
    }

    if (nowPlayingWrap) {
      if (view === 'lyrics' || view === 'songlist') {
        nowPlayingWrap.classList.add('is-panel-open');
      } else {
        nowPlayingWrap.classList.remove('is-panel-open');
      }

      if (view === 'songlist') {
        nowPlayingWrap.classList.add('is-songlist-mode');
        if (songSearchWrap) songSearchWrap.setAttribute('aria-hidden', 'false');
      } else {
        nowPlayingWrap.classList.remove('is-songlist-mode');
        if (songSearchWrap) songSearchWrap.setAttribute('aria-hidden', 'true');
        if (songSearchInput) {
          songSearchInput.value = '';
          if (songSearchClear) songSearchClear.style.display = 'none';
        }
      }
    }

    if (view === 'lyrics') {
      stopBeatVisualizer();
      wakeMusicControls(0);
      if (artworkCard) artworkCard.classList.add('is-depth-bg');
      if (glassFrame) glassFrame.classList.add('is-depth-bg');
      if (songlistCard) songlistCard.classList.remove('is-revealed');
      if (lyricsCard) lyricsCard.classList.add('is-revealed');
      if (lyricsBtn) lyricsBtn.classList.add('active');
      if (songlistBtn) songlistBtn.classList.remove('active');
      if (modesRow) modesRow.classList.add('is-hidden');
      renderLyrics();
      if (isPlaying && !audio.paused && currentTab === 'music') {
        startSyncLoop();
      }
    } else if (view === 'songlist') {
      stopBeatVisualizer();
      stopSyncLoop();
      wakeMusicControls(0);
      if (artworkCard) artworkCard.classList.add('is-depth-bg');
      if (glassFrame) glassFrame.classList.add('is-depth-bg');
      if (lyricsCard) lyricsCard.classList.remove('is-revealed');
      if (songlistCard) songlistCard.classList.add('is-revealed');
      if (songlistBtn) songlistBtn.classList.add('active');
      if (lyricsBtn) lyricsBtn.classList.remove('active');
      if (modesRow) modesRow.classList.add('is-hidden');
      renderSongList();
    } else {
      stopSyncLoop();
      // Default Artwork View (Depth spring return)
      if (artworkCard) artworkCard.classList.remove('is-depth-bg');
      if (glassFrame) glassFrame.classList.remove('is-depth-bg');
      if (lyricsCard) lyricsCard.classList.remove('is-revealed');
      if (songlistCard) songlistCard.classList.remove('is-revealed');
      if (lyricsBtn) lyricsBtn.classList.remove('active');
      if (songlistBtn) songlistBtn.classList.remove('active');
      if (modesRow) modesRow.classList.remove('is-hidden');
      if (isPlaying && !audio.paused && currentTab === 'music') {
        startBeatVisualizer();
        dimMusicControls(800);
        scheduleMusicIdleAnimation(2800);
      }
    }
  }

  // Render Real-Time Synced Apple Music Lyrics
  function renderLyrics() {
    if (!lyricsContent) return;
    const track = PLAYLIST[currentTrackIndex];
    if (!track || !track.lyrics || !track.lyrics.length) {
      lyricsContent.innerHTML = '<p class="synced-lyric-line" style="opacity:0.6; text-align:center; padding-top:40px;">No lyrics available</p>';
      return;
    }

    currentLyricIndex = -1;
    updateCalibratorUI();

    let html = '';
    track.lyrics.forEach((line, idx) => {
      html += `<div class="synced-lyric-line" data-time="${line.time}" data-index="${idx}">${line.text}</div>`;
    });

    lyricsContent.innerHTML = html;

    // Attach interactive Click-To-Seek on every line!
    const lineEls = lyricsContent.querySelectorAll('.synced-lyric-line');
    lineEls.forEach(lineEl => {
      lineEl.addEventListener('click', (e) => {
        e.stopPropagation();
        const time = parseFloat(lineEl.getAttribute('data-time'));
        if (!isNaN(time)) {
          const userOffset = getTrackOffset(track.title);
          audio.currentTime = Math.max(0, time - userOffset);
          if (audio.paused) {
            playTrack();
          }
          updateSyncedLyrics(audio.currentTime, true);
        }
      });
    });

    // Immediate sync with current song playback position
    updateSyncedLyrics(audio.currentTime, true);
  }

  // Update Line Highlight, Glow, Fading, and Silk Spring Glide Auto-Scroll
  function updateSyncedLyrics(currentTime, forceScroll = false) {
    if (currentCardView !== 'lyrics' || !lyricsContent) return;
    const track = PLAYLIST[currentTrackIndex];
    if (!track || !track.lyrics || !track.lyrics.length) return;

    const userOffset = getTrackOffset(track.title);
    const effectiveTime = currentTime + userOffset;

    let activeIndex = -1;
    for (let i = 0; i < track.lyrics.length; i++) {
      if (effectiveTime >= track.lyrics[i].time) {
        activeIndex = i;
      } else {
        break;
      }
    }

    if (activeIndex !== currentLyricIndex || forceScroll) {
      currentLyricIndex = activeIndex;
      const allLineEls = lyricsContent.querySelectorAll('.synced-lyric-line');
      allLineEls.forEach((el, idx) => {
        if (idx === activeIndex) {
          el.classList.add('is-active');
          el.classList.remove('is-past');
          // Silk Spring Glide: smoothly glide active line into vertical center
          const targetY = (el.offsetTop + el.offsetHeight / 2) - (lyricsContent.offsetHeight / 2);
          smoothScrollLyricsTo(Math.max(0, targetY));
        } else if (idx < activeIndex) {
          el.classList.remove('is-active');
          el.classList.add('is-past');
        } else {
          el.classList.remove('is-active', 'is-past');
        }
      });
    }
  }

  // --- PLAYBACK MODES ENGINE (Shuffle, Repeat, Speed, Sleep Timer) ---
  function toggleShuffle() {
    isShuffle = !isShuffle;
    if (shuffleBtn) {
      shuffleBtn.classList.toggle('is-active', isShuffle);
      shuffleBtn.setAttribute('title', isShuffle ? 'Shuffle: On' : 'Shuffle: Off');
    }
    showHUD(isShuffle ? 'Shuffle On' : 'Shuffle Off', '', 'music');
  }

  function updateRepeatUI() {
    if (!repeatBtn) return;
    repeatBtn.classList.remove('is-active', 'is-all', 'is-one');
    if (repeatMode === 'all') {
      repeatBtn.classList.add('is-all');
      repeatBtn.setAttribute('title', 'Repeat: All Songs');
      if (repeatBadgeOne) repeatBadgeOne.style.display = 'none';
    } else if (repeatMode === 'one') {
      repeatBtn.classList.add('is-one');
      repeatBtn.setAttribute('title', 'Repeat: Current Track');
      if (repeatBadgeOne) repeatBadgeOne.style.display = 'block';
    } else {
      repeatBtn.setAttribute('title', 'Repeat: Off');
      if (repeatBadgeOne) repeatBadgeOne.style.display = 'none';
    }
  }

  function toggleRepeat() {
    if (repeatMode === 'all') {
      repeatMode = 'one';
    } else if (repeatMode === 'one') {
      repeatMode = 'off';
    } else {
      repeatMode = 'all';
    }
    updateRepeatUI();
    const label = repeatMode === 'one' ? 'Repeat One' : (repeatMode === 'all' ? 'Repeat All' : 'Repeat Off');
    showHUD(label, '', 'music');
  }

  function toggleSpeed() {
    speedIdx = (speedIdx + 1) % speedRates.length;
    const rate = speedRates[speedIdx];
    audio.playbackRate = rate;
    if (speedLabel) speedLabel.textContent = `${rate}×`;
    if (speedBtn) {
      speedBtn.classList.toggle('is-active', rate !== 1.0);
      speedBtn.setAttribute('title', `Playback Speed: ${rate}×`);
    }
    showHUD(`Speed ${rate}×`, '', 'music');
  }

  function openSleepTimerSheet() {
    if (timerSheet) {
      timerSheet.classList.add('is-open');
      timerSheet.setAttribute('aria-hidden', 'false');
    }
  }

  function closeSleepTimerSheet() {
    if (timerSheet) {
      timerSheet.classList.remove('is-open');
      timerSheet.setAttribute('aria-hidden', 'true');
    }
  }

  function triggerSleepPause() {
    const originalVol = audio.volume;
    const fadeSteps = 15;
    let step = 0;
    const fadeTimer = setInterval(() => {
      step++;
      audio.volume = Math.max(0, originalVol * (1 - step / fadeSteps));
      if (step >= fadeSteps) {
        clearInterval(fadeTimer);
        pauseTrack();
        audio.volume = originalVol;
        setSleepTimer(0);
        showHUD('Sleep Timer: Paused', '', 'music');
      }
    }, 200);
  }

  function setSleepTimer(minutes) {
    if (sleepTimerTimeout) {
      clearTimeout(sleepTimerTimeout);
      sleepTimerTimeout = null;
    }
    if (sleepInterval) {
      clearInterval(sleepInterval);
      sleepInterval = null;
    }

    sleepMode = minutes;

    if (timerOptionBtns) {
      timerOptionBtns.forEach(btn => {
        const m = parseInt(btn.getAttribute('data-mins'), 10);
        btn.classList.toggle('is-active', m === minutes);
      });
    }

    if (minutes === 0) {
      if (sleepBtn) {
        sleepBtn.classList.remove('is-active');
        sleepBtn.setAttribute('title', 'Sleep Timer: Off');
      }
      if (sleepBadge) sleepBadge.style.display = 'none';
      showHUD('Sleep Timer: Off', '', 'music');
      closeSleepTimerSheet();
      return;
    }

    if (minutes === -1) {
      if (sleepBtn) {
        sleepBtn.classList.add('is-active');
        sleepBtn.setAttribute('title', 'Sleep Timer: At End of Track');
      }
      if (sleepBadge) {
        sleepBadge.textContent = 'End';
        sleepBadge.style.display = 'block';
      }
      showHUD('Sleep Timer: When Track Ends', '', 'music');
      closeSleepTimerSheet();
      return;
    }

    sleepExpiryTime = Date.now() + minutes * 60 * 1000;
    if (sleepBtn) {
      sleepBtn.classList.add('is-active');
      sleepBtn.setAttribute('title', `Sleep Timer: ${minutes}m`);
    }
    if (sleepBadge) {
      sleepBadge.textContent = `${minutes}m`;
      sleepBadge.style.display = 'block';
    }
    showHUD(`Sleep Timer: ${minutes}m`, '', 'music');
    closeSleepTimerSheet();

    sleepInterval = setInterval(() => {
      const remainingMs = sleepExpiryTime - Date.now();
      if (remainingMs <= 0) {
        clearInterval(sleepInterval);
        sleepInterval = null;
        triggerSleepPause();
      } else {
        const remMins = Math.ceil(remainingMs / (60 * 1000));
        if (sleepBadge) sleepBadge.textContent = `${remMins}m`;
      }
    }, 10000);

    sleepTimerTimeout = setTimeout(() => {
      triggerSleepPause();
    }, minutes * 60 * 1000);
  }

  // In-place ultra-fast active row indicator update (zero DOM reflow / zero destruction)
  function updateSongListActiveRow() {
    if (!songlistItems) return;
    const rows = songlistItems.querySelectorAll('.song-list-item');
    rows.forEach((row, idx) => {
      const isActive = idx === currentTrackIndex;
      row.classList.toggle('is-active', isActive);
      row.classList.toggle('is-paused', isActive && !isPlaying);
      let eq = row.querySelector('.song-item-eq');
      if (isActive) {
        if (!eq) {
          eq = document.createElement('div');
          eq.className = 'song-item-eq';
          eq.innerHTML = '<span class="eq-bar"></span><span class="eq-bar"></span><span class="eq-bar"></span>';
          row.appendChild(eq);
        }
      } else if (eq) {
        eq.remove();
      }
    });
  }

  // Typo-tolerant Damerau-Levenshtein Edit Distance for Search
  function levenshteinDistance(s1, s2) {
    if (s1 === s2) return 0;
    if (!s1 || !s2) return (s1 || s2).length;
    const v0 = new Int32Array(s2.length + 1);
    const v1 = new Int32Array(s2.length + 1);
    for (let i = 0; i <= s2.length; i++) v0[i] = i;
    for (let i = 0; i < s1.length; i++) {
      v1[0] = i + 1;
      for (let j = 0; j < s2.length; j++) {
        const cost = (s1[i] === s2[j]) ? 0 : 1;
        v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
      }
      for (let j = 0; j <= s2.length; j++) v0[j] = v1[j];
    }
    return v1[s2.length];
  }

  function cleanSearchStr(s) {
    return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
  }

  function scoreTrackSearch(track, query) {
    const q = query.trim().toLowerCase();
    const qClean = cleanSearchStr(q);
    if (!q || !qClean) return 100;

    const title = (track.title || '').toLowerCase();
    const titleClean = cleanSearchStr(track.title);
    const artist = (track.artist || '').toLowerCase();
    const artistClean = cleanSearchStr(track.artist);

    // 1. Direct match on title (highest priority)
    if (title === q || titleClean === qClean) return 1000;
    if (title.startsWith(q) || titleClean.startsWith(qClean)) return 850;
    if (title.includes(q) || titleClean.includes(qClean)) return 700;

    // 2. Artist match
    if (artist.startsWith(q) || artistClean.startsWith(qClean)) return 550;
    if (artist.includes(q) || artistClean.includes(qClean)) return 450;

    // 3. Word token matching
    const qWords = q.split(/\s+/).filter(Boolean);
    const titleWords = title.split(/\s+/).filter(Boolean);
    let matchedWords = 0;
    for (const qw of qWords) {
      if (titleWords.some(tw => tw.startsWith(qw) || tw.includes(qw))) matchedWords++;
    }
    if (matchedWords === qWords.length && qWords.length > 0) return 600;

    // 4. Typo-tolerant edit distance on individual words
    let bestDist = 999;
    for (const tw of titleWords) {
      const dist = levenshteinDistance(q, tw);
      if (dist < bestDist) bestDist = dist;
    }

    const maxAllowedTypos = q.length >= 6 ? 2 : (q.length >= 3 ? 1 : 0);
    if (bestDist <= maxAllowedTypos) {
      return 380 - bestDist * 60;
    }

    // 5. Sliding window edit distance on normalized full title (e.g. "kesriya" vs "kesariya", "sawann" vs "sawan")
    if (titleClean.length >= qClean.length) {
      for (let i = 0; i <= titleClean.length - qClean.length; i++) {
        const sub = titleClean.substring(i, i + qClean.length);
        const dist = levenshteinDistance(qClean, sub);
        if (dist <= maxAllowedTypos) {
          return 340 - dist * 50;
        }
      }
    }

    return 0;
  }

  // Render All Songs (or Search Results with typo tolerance) in Song List
  function renderSongList(customList = null) {
    if (!songlistItems) return;
    let listToRender = [];

    if (customList !== null) {
      listToRender = customList;
    } else {
      listToRender = PLAYLIST.map((track, idx) => ({ track, idx, isRec: false }));
    }

    if (listToRender.length === 0) {
      songlistItems.innerHTML = `
        <div class="songlist-no-results">
          <p>No matching songs found</p>
          <span style="font-size: 12px; opacity: 0.6;">Check spelling or try a different keyword</span>
        </div>
      `;
      return;
    }

    let html = '';
    listToRender.forEach((item) => {
      const track = item.track;
      const idx = item.idx;
      const isRec = item.isRec;
      const isActive = idx === currentTrackIndex;
      const pausedClass = (isActive && !isPlaying) ? ' is-paused' : '';
      const activeClass = isActive ? ' is-active' : '';
      const recClass = isRec ? ' is-recommended' : '';

      html += `
        <div class="song-list-item${activeClass}${pausedClass}${recClass}" data-index="${idx}">
          <img src="${track.cover}" alt="${track.title}" class="song-item-thumb">
          <div class="song-item-info">
            <span class="song-item-title">${track.title}</span>
            <span class="song-item-artist">${track.artist}</span>
          </div>
          ${isRec ? `<span class="song-item-rec-badge">Recommended</span>` : ''}
          ${isActive ? `
            <div class="song-item-eq">
              <span class="eq-bar"></span>
              <span class="eq-bar"></span>
              <span class="eq-bar"></span>
            </div>
          ` : ''}
        </div>
      `;
    });

    songlistItems.innerHTML = html;

    // Attach click listeners to song rows with instant feedback
    const rows = songlistItems.querySelectorAll('.song-list-item');
    rows.forEach(row => {
      row.addEventListener('click', () => {
        const idx = parseInt(row.getAttribute('data-index'), 10);
        if (idx === currentTrackIndex) {
          togglePlay();
          updateSongListActiveRow();
        } else {
          loadTrack(idx, true);
        }
      });
    });
  }

  // Wire up Live Search Input with typo tolerance
  if (songSearchInput) {
    songSearchInput.addEventListener('input', () => {
      const q = songSearchInput.value.trim();
      if (songSearchClear) songSearchClear.style.display = q ? 'flex' : 'none';

      if (!q) {
        renderSongList();
        return;
      }

      const scored = [];
      PLAYLIST.forEach((track, idx) => {
        const score = scoreTrackSearch(track, q);
        if (score > 0) {
          scored.push({ track, idx, score });
        }
      });

      scored.sort((a, b) => b.score - a.score);

      const mapped = scored.map((item, pos) => ({
        track: item.track,
        idx: item.idx,
        isRec: pos === 0 && scored.length > 1 // Highlight highest scoring match
      }));

      renderSongList(mapped);
    });
  }

  if (songSearchClear) {
    songSearchClear.addEventListener('click', () => {
      if (songSearchInput) {
        songSearchInput.value = '';
        songSearchInput.focus();
      }
      songSearchClear.style.display = 'none';
      renderSongList();
    });
  }

  function loadTrack(index, autoPlay = false) {
    if (index < 0 || index >= PLAYLIST.length) return;
    currentTrackIndex = index;
    const track = PLAYLIST[index];

    // Streamline Audio Source switch without socket dump
    if (!audio.src || !audio.src.endsWith(encodeURI(track.src))) {
      audio.src = track.src;
    }

    // Update Metadata
    if (trackTitleEl) trackTitleEl.textContent = track.title;
    if (trackArtistEl) trackArtistEl.textContent = track.artist;
    if (artworkImg) {
      artworkImg.src = track.cover;
      artworkImg.alt = `${track.title} 16:9 Poster`;
    }
    // Update floating companion orb cover and color glow
    if (orbCoverImg) {
      orbCoverImg.src = track.cover;
      orbCoverImg.alt = `${track.title} Artwork`;
    }
    if (floatingOrb && (track.glowSoft || track.glow || track.color)) {
      floatingOrb.style.setProperty('--orb-glow', track.glowSoft || track.glow || track.color);
    }
    // Update Option 1 Ambilight mirrored projection image & 4-Quadrant Spatial Chroma Palette
    if (ambilightImg) {
      ambilightImg.src = track.cover;
    }
    updateMultiZonePalette(track);
    // Update Option 4 Apple Vision Pro Traveling Specular Prism Beam color
    if (glassFrame && track.color) {
      glassFrame.style.setProperty('--poster-specular', track.glow || track.color);
    }

    // OLED Music Video Integration inside Artwork Card
    if (track.video) {
      if (artworkVideo) {
        if (artworkCard) {
          artworkCard.classList.remove('video-ready');
          artworkCard.classList.add('has-video');
        }
        if (!artworkVideo.src || !artworkVideo.src.endsWith(encodeURI(track.video))) {
          artworkVideo.src = track.video;
          artworkVideo.load();
        }
        artworkVideo.currentTime = 0;
        if (autoPlay || isPlaying) {
          artworkVideo.play().catch(() => {});
        }
      }
      if (badgeOledVideo) badgeOledVideo.style.display = 'inline-flex';
    } else {
      if (artworkVideo) {
        artworkVideo.pause();
        artworkVideo.removeAttribute('src');
        if (artworkCard) {
          artworkCard.classList.remove('has-video');
          artworkCard.classList.remove('video-ready');
        }
      }
      if (badgeOledVideo) badgeOledVideo.style.display = 'none';
    }

    // Reset Progress
    if (scrubberProgress) scrubberProgress.style.width = '0%';
    if (curTimeEl) curTimeEl.textContent = '0:00';
    if (remTimeEl) remTimeEl.textContent = '-:--';
    updateCalibratorUI();

    // Feature 5: Restore persistent favorite state
    if (favBtn) {
      const isFav = localStorage.getItem('apple_fav_' + track.title) === 'true';
      favBtn.classList.toggle('loved', isFav);
    }

    // If lyrics or song list view is active, update them immediately
    if (currentCardView === 'lyrics') {
      renderLyrics();
    } else if (currentCardView === 'songlist') {
      updateSongListActiveRow();
    }

    // Update Story Card if defined
    if (typeof updateStoryCardUI === 'function') {
      updateStoryCardUI();
    }

    // Native Lock Screen & Bluetooth Controller
    updateMediaSession(track);

    // Full Synchronized Lyrics streaming
    loadTrackLyrics(track);

    if (autoPlay) {
      // Optimistic instant feedback: UI responds in 0ms!
      setPlayPauseUI(true);
      playTrack();
    } else {
      setPlayPauseUI(false);
    }
  }

  // =========================================================
  // TRUE BACKGROUND AUDIO & PERSISTENCE ENGINE
  // Survives phone lock, screen turn off, tab switch & app minimize
  // =========================================================
  let userExplicitPause = false;
  let wasPlayingBeforeHidden = false;

  function persistPlaybackState() {
    try {
      localStorage.setItem('viev_last_track_index', String(currentTrackIndex));
      localStorage.setItem('viev_last_track_time', String(Math.floor(audio.currentTime || 0)));
      localStorage.setItem('viev_bg_playing', isPlaying ? 'true' : 'false');
    } catch(e) {}
  }

  // Handle mobile screen lock / sleep mode / tab backgrounding (iPhone & Mobile background lock survival)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (isPlaying && !audio.paused) {
        wasPlayingBeforeHidden = true;
      }
    } else {
      if (wasPlayingBeforeHidden && isPlaying && audio.paused && !userExplicitPause) {
        audio.play().catch(() => {});
      }
      wasPlayingBeforeHidden = false;
      updateSyncedLyrics(audio.currentTime, true);
    }
  });

  // Guard against mobile browser synthetic pause on screen lock
  audio.addEventListener('pause', () => {
    persistPlaybackState();
    if (document.hidden && isPlaying && !userExplicitPause) {
      // Screen was locked while playing: continue background playback smoothly!
      audio.play().catch(() => {});
    }
  });

  // Mobile Network Stall & Buffer Error Recovery for uninterrupted playback
  audio.addEventListener('stalled', () => {
    if (isPlaying && !userExplicitPause && audio.paused) {
      setTimeout(() => {
        if (isPlaying && !userExplicitPause && audio.paused) {
          audio.play().catch(() => {});
        }
      }, 500);
    }
  });

  audio.addEventListener('error', (e) => {
    console.warn('Audio element error encountered:', e);
    if (isPlaying && !userExplicitPause) {
      setTimeout(() => {
        if (isPlaying && !userExplicitPause) {
          const curTime = audio.currentTime || 0;
          audio.load();
          if (curTime > 0) audio.currentTime = curTime;
          audio.play().catch(() => {});
        }
      }, 800);
    }
  });

  audio.addEventListener('play', () => {
    userExplicitPause = false;
    persistPlaybackState();
  });

  function playTrack() {
    userExplicitPause = false;
    initAudioVisualizer();
    audio.play().then(() => {
      setPlayPauseUI(true);
      startBeatVisualizer();
      persistPlaybackState();
    }).catch(err => {
      console.warn('Playback prevented by browser autoplay policy:', err);
      setPlayPauseUI(false);
    });
  }

  function pauseTrack() {
    userExplicitPause = true;
    audio.pause();
    setPlayPauseUI(false);
    persistPlaybackState();
  }

  function togglePlay() {
    if (audio.paused) {
      playTrack();
    } else {
      pauseTrack();
    }
  }

  function nextTrack() {
    let nextIdx;
    if (isShuffle && PLAYLIST.length > 1) {
      let rand;
      do {
        rand = Math.floor(Math.random() * PLAYLIST.length);
      } while (rand === currentTrackIndex);
      nextIdx = rand;
    } else {
      nextIdx = (currentTrackIndex + 1) % PLAYLIST.length;
    }
    const shouldPlay = isPlaying || !audio.paused;
    loadTrack(nextIdx, shouldPlay);
  }

  function prevTrack() {
    // If track has played more than 3 seconds, restart it Apple Music style
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      if (!isPlaying) playTrack();
      return;
    }
    const prevIdx = (currentTrackIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
    const shouldPlay = isPlaying || !audio.paused;
    loadTrack(prevIdx, shouldPlay);
  }

  // Fluid Apple Range Scrubber & Volume Drag Engine
  let isScrubbing = false;
  let isDraggingVolume = false;

  function getScrubberFraction(e) {
    const rect = scrubberBar.getBoundingClientRect();
    if (rect.width <= 0) return 0;
    return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  }

  const scrubBubble = document.getElementById('apple-scrub-bubble');

  function updateScrubberUI(fraction) {
    const frac = Math.max(0, Math.min(1, fraction));
    if (scrubberProgress) scrubberProgress.style.width = `${frac * 100}%`;
    if (scrubBubble) {
      scrubBubble.style.left = `${frac * 100}%`;
      if (audio.duration && !isNaN(audio.duration)) {
        scrubBubble.textContent = formatTime(frac * audio.duration);
      }
    }
    if (audio.duration && !isNaN(audio.duration)) {
      const targetSec = frac * audio.duration;
      if (curTimeEl) curTimeEl.textContent = formatTime(targetSec);
      if (remTimeEl) remTimeEl.textContent = `-${formatTime(Math.max(0, audio.duration - targetSec))}`;
    }
  }

  function getVolumeFraction(e) {
    const rect = volumeTrack.getBoundingClientRect();
    if (rect.width <= 0) return 0;
    return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  }

  function updateVolumeUI(fraction) {
    const val = Math.max(0, Math.min(1, fraction));
    audio.volume = val;
    if (volumeFill) volumeFill.style.width = `${val * 100}%`;
  }

  // Audio Event Listeners
  audio.addEventListener('timeupdate', () => {
    // When user is smoothly dragging the scrubber, do not override with audio playback time
    if (isScrubbing) return;
    if (!audio.duration || isNaN(audio.duration)) return;
    const cur = audio.currentTime;
    const dur = audio.duration;
    const pct = (cur / dur) * 100;

    if (scrubberProgress) scrubberProgress.style.width = `${pct}%`;
    if (curTimeEl) curTimeEl.textContent = formatTime(cur);
    if (remTimeEl) remTimeEl.textContent = `-${formatTime(Math.max(0, dur - cur))}`;

    // Live update synced lyrics line and auto-scroll
    updateSyncedLyrics(cur);

    // Keep OLED Video in sync with audio
    if (artworkVideo && artworkVideo.src && !artworkVideo.paused) {
      if (Math.abs(artworkVideo.currentTime - cur) > 0.4) {
        artworkVideo.currentTime = cur;
      }
    }

    if (Math.floor(cur) % 2 === 0) {
      updateMediaSessionPosition();
    }
  });

  audio.addEventListener('seeked', () => {
    if (artworkVideo && artworkVideo.src) {
      artworkVideo.currentTime = audio.currentTime;
    }
  });

  audio.addEventListener('loadedmetadata', () => {
    if (remTimeEl && audio.duration) {
      remTimeEl.textContent = `-${formatTime(audio.duration)}`;
    }
    updateMediaSessionPosition();
  });

  audio.addEventListener('ended', () => {
    // Check sleep timer set to "End of Track"
    if (sleepMode === -1) {
      setSleepTimer(0);
      pauseTrack();
      showHUD('Sleep Timer: Track Finished', '', 'music');
      return;
    }

    // Repeat one track
    if (repeatMode === 'one') {
      audio.currentTime = 0;
      audio.play();
      setPlayPauseUI(true);
      return;
    }

    // Repeat off and reached end of playlist
    if (repeatMode === 'off' && currentTrackIndex === PLAYLIST.length - 1) {
      pauseTrack();
      audio.currentTime = 0;
      return;
    }

    // Next track (honors shuffle if active)
    nextTrack();
  });

  // Controls Event Listeners
  // Tap Album Artwork to Play/Pause (Clean effortless gesture)
  if (artworkCard) {
    artworkCard.style.cursor = 'pointer';
    artworkCard.addEventListener('click', (e) => {
      // Don't toggle play if interacting with lyrics card or song list card
      if (e.target.closest('#music-lyrics-card') || e.target.closest('#music-songlist-card')) return;
      triggerHaptic('medium');
      togglePlay();
      showHUD(audio.paused ? 'Paused' : 'Playing', '', audio.paused ? 'pause' : 'play');
    });
  }

  if (musicPlayBtn) {
    musicPlayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      musicPlayBtn.blur();
      triggerHaptic('medium');
      togglePlay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      triggerHaptic('light');
      nextTrack();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      triggerHaptic('light');
      prevTrack();
    });
  }

  // Playback Modes Event Listeners
  if (shuffleBtn) {
    shuffleBtn.addEventListener('click', () => {
      triggerHaptic('light');
      toggleShuffle();
    });
  }

  if (repeatBtn) {
    repeatBtn.addEventListener('click', () => {
      triggerHaptic('light');
      toggleRepeat();
    });
  }

  if (speedBtn) {
    speedBtn.addEventListener('click', () => {
      triggerHaptic('light');
      toggleSpeed();
    });
  }

  if (sleepBtn) {
    sleepBtn.addEventListener('click', () => {
      triggerHaptic('light');
      openSleepTimerSheet();
    });
  }

  if (timerCloseBtn) {
    timerCloseBtn.addEventListener('click', closeSleepTimerSheet);
  }

  if (timerBackdrop) {
    timerBackdrop.addEventListener('click', closeSleepTimerSheet);
  }

  if (timerOptionBtns) {
    timerOptionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const mins = parseInt(btn.getAttribute('data-mins'), 10);
        setSleepTimer(mins);
      });
    });
  }

  // Feature 5: Favorite Heart Toggle with Spring Burst & LocalStorage
  const heartParticles = document.getElementById('heart-particles');
  if (favBtn) {
    favBtn.addEventListener('click', () => {
      const track = PLAYLIST[currentTrackIndex];
      const isNowLoved = !favBtn.classList.contains('loved');
      favBtn.classList.toggle('loved', isNowLoved);
      if (track) {
        localStorage.setItem('apple_fav_' + track.title, isNowLoved.toString());
      }
      if (isNowLoved) {
        favBtn.classList.remove('burst');
        void favBtn.offsetWidth;
        favBtn.classList.add('burst');
        if (heartParticles) {
          heartParticles.classList.remove('active');
          void heartParticles.offsetWidth;
          heartParticles.classList.add('active');
        }
        showHUD('Loved', 'Added to Favorites', 'heart');
      } else {
        showHUD('Unloved', 'Removed from Favorites', 'heart-outline');
      }
    });
  }

  // Feature 4: Fluid Apple Scrubber with Floating Time Bubble & Hover Preview
  if (scrubberBar) {
    scrubberBar.addEventListener('mousemove', (e) => {
      if (!isScrubbing) {
        const frac = getScrubberFraction(e);
        if (scrubBubble) {
          scrubBubble.style.left = `${frac * 100}%`;
          if (audio.duration && !isNaN(audio.duration)) {
            scrubBubble.textContent = formatTime(frac * audio.duration);
          }
        }
      }
    });

    scrubberBar.addEventListener('pointerdown', (e) => {
      isScrubbing = true;
      scrubberBar.classList.add('is-dragging');
      try {
        scrubberBar.setPointerCapture(e.pointerId);
      } catch (err) {}
      const frac = getScrubberFraction(e);
      updateScrubberUI(frac);
    });

    scrubberBar.addEventListener('pointermove', (e) => {
      if (!isScrubbing) return;
      const frac = getScrubberFraction(e);
      updateScrubberUI(frac);
    });

    const finishScrub = (e) => {
      if (!isScrubbing) return;
      isScrubbing = false;
      scrubberBar.classList.remove('is-dragging');
      try {
        scrubberBar.releasePointerCapture(e.pointerId);
      } catch (err) {}

      const frac = getScrubberFraction(e);
      updateScrubberUI(frac);
      if (audio.duration && !isNaN(audio.duration)) {
        audio.currentTime = frac * audio.duration;
        updateSyncedLyrics(audio.currentTime, true);
      }
    };

    scrubberBar.addEventListener('pointerup', finishScrub);
    scrubberBar.addEventListener('pointercancel', finishScrub);
  }

  // Fluid Apple Volume: Smooth Click & Continuous Drag (Range Slider)
  if (volumeTrack) {
    audio.volume = 0.75;
    if (volumeFill) volumeFill.style.width = '75%';

    volumeTrack.addEventListener('pointerdown', (e) => {
      isDraggingVolume = true;
      volumeTrack.classList.add('is-dragging');
      try {
        volumeTrack.setPointerCapture(e.pointerId);
      } catch (err) {}
      const frac = getVolumeFraction(e);
      updateVolumeUI(frac);
    });

    volumeTrack.addEventListener('pointermove', (e) => {
      if (!isDraggingVolume) return;
      const frac = getVolumeFraction(e);
      updateVolumeUI(frac);
    });

    const finishVolume = (e) => {
      if (!isDraggingVolume) return;
      isDraggingVolume = false;
      volumeTrack.classList.remove('is-dragging');
      try {
        volumeTrack.releasePointerCapture(e.pointerId);
      } catch (err) {}
      const frac = getVolumeFraction(e);
      updateVolumeUI(frac);
    };

    volumeTrack.addEventListener('pointerup', finishVolume);
    volumeTrack.addEventListener('pointercancel', finishVolume);
  }

  // Volume Speaker Icons Quick Click (Mute / Max)
  const volumeRow = document.querySelector('.apple-volume-row');
  if (volumeRow) {
    const volIcons = volumeRow.querySelectorAll('.vol-icon');
    if (volIcons[0]) {
      volIcons[0].style.cursor = 'pointer';
      volIcons[0].setAttribute('title', 'Mute volume');
      volIcons[0].addEventListener('click', () => updateVolumeUI(0));
    }
    if (volIcons[1]) {
      volIcons[1].style.cursor = 'pointer';
      volIcons[1].setAttribute('title', 'Max volume');
      volIcons[1].addEventListener('click', () => updateVolumeUI(1));
    }
  }

  // In-Player Panel Toggle Listeners (Lyrics & Song List)
  if (lyricsBtn) {
    lyricsBtn.addEventListener('click', () => {
      setCardView(currentCardView === 'lyrics' ? 'artwork' : 'lyrics');
    });
  }

  if (songlistBtn) {
    songlistBtn.addEventListener('click', () => {
      setCardView(currentCardView === 'songlist' ? 'artwork' : 'songlist');
    });
  }

  if (lyricsCloseBtn) {
    lyricsCloseBtn.addEventListener('click', () => {
      setCardView('artwork');
    });
  }

  if (songlistCloseBtn) {
    songlistCloseBtn.addEventListener('click', () => {
      setCardView('artwork');
    });
  }

  // =========================================================
  // RIGHT-ALIGNED MORPHING 3-DOTS GLASS CAPSULE CONTROLLER
  // =========================================================
  const utilityCapsule = document.getElementById('apple-utility-capsule');
  const utilityDotsTrigger = document.getElementById('utility-dots-trigger');
  const utilityActionButtons = document.querySelectorAll('.utility-actions-group .utility-btn');

  function toggleUtilityCapsule(expand) {
    if (!utilityCapsule) return;
    const shouldExpand = expand !== undefined ? expand : !utilityCapsule.classList.contains('is-expanded');
    utilityCapsule.classList.toggle('is-expanded', shouldExpand);
    if (utilityDotsTrigger) {
      utilityDotsTrigger.classList.toggle('is-active', shouldExpand);
    }
  }

  if (utilityDotsTrigger) {
    utilityDotsTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleUtilityCapsule();
    });
  }

  // Option A: Auto-collapse on selection
  if (utilityActionButtons) {
    utilityActionButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (utilityCapsule && utilityCapsule.classList.contains('is-expanded')) {
          toggleUtilityCapsule(false);
        }
      });
    });
  }

  // Outside click to collapse capsule
  document.addEventListener('click', (e) => {
    if (!utilityCapsule || !utilityCapsule.classList.contains('is-expanded')) return;
    if (!utilityCapsule.contains(e.target)) {
      toggleUtilityCapsule(false);
    }
  });
  // FEATURE 1: APPLE LOSSLESS & DOLBY ATMOS FIDELITY MODAL
  // =========================================================
  const fidelityModal = document.getElementById('apple-fidelity-modal');
  const fidelityCloseBtn = document.getElementById('fidelity-close-btn');
  const fidelityBackdrop = document.getElementById('fidelity-backdrop');
  const audioBadges = document.querySelectorAll('.audio-badge');

  audioBadges.forEach(badge => {
    badge.addEventListener('click', (e) => {
      e.stopPropagation();
      if (fidelityModal) fidelityModal.classList.add('is-revealed');
    });
  });

  if (fidelityCloseBtn) {
    fidelityCloseBtn.addEventListener('click', () => {
      if (fidelityModal) fidelityModal.classList.remove('is-revealed');
    });
  }
  if (fidelityBackdrop) {
    fidelityBackdrop.addEventListener('click', () => {
      if (fidelityModal) fidelityModal.classList.remove('is-revealed');
    });
  }

  // =========================================================
  // FEATURE 2: AIRPLAY DEVICE SWITCHER GLASS SHEET
  // =========================================================
  const airplayBtn = document.getElementById('music-airplay-btn');
  const airplaySheet = document.getElementById('apple-airplay-sheet');
  const airplayDoneBtn = document.getElementById('airplay-done-btn');
  const airplayBackdrop = document.getElementById('airplay-backdrop');
  const airplayItems = document.querySelectorAll('.airplay-device-item');

  if (airplayBtn) {
    airplayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (airplaySheet) airplaySheet.classList.add('is-revealed');
    });
  }

  if (airplayDoneBtn) {
    airplayDoneBtn.addEventListener('click', () => {
      if (airplaySheet) airplaySheet.classList.remove('is-revealed');
    });
  }
  if (airplayBackdrop) {
    airplayBackdrop.addEventListener('click', () => {
      if (airplaySheet) airplaySheet.classList.remove('is-revealed');
    });
  }

  airplayItems.forEach(item => {
    item.addEventListener('click', () => {
      airplayItems.forEach(i => i.classList.remove('is-connected'));
      item.classList.add('is-connected');
      const devName = item.querySelector('.device-name') ? item.querySelector('.device-name').textContent : 'Device';
      showHUD(devName, 'Connected to AirPlay', 'airplay');
      setTimeout(() => {
        if (airplaySheet) airplaySheet.classList.remove('is-revealed');
      }, 350);
    });
  });

  // =========================================================
  // FEATURE 5 (SUGGESTION 5): APPLE MUSIC "STORY / MEMORY CARD" SHARE SHEET
  // =========================================================
  const storyBtn = document.getElementById('music-story-btn');
  const storySheet = document.getElementById('apple-story-sheet');
  const storyCloseBtn = document.getElementById('story-close-btn');
  const storyBackdrop = document.getElementById('story-backdrop');

  const storyArtworkImg = document.getElementById('story-artwork-img');
  const storyTrackTitle = document.getElementById('story-track-title');
  const storyTrackArtist = document.getElementById('story-track-artist');
  const storyLyricQuote = document.getElementById('story-lyric-quote');
  const storyTogetherCounter = document.getElementById('story-together-counter');
  const storyAmbientGlow = document.getElementById('story-ambient-glow');
  const storyPreviewCard = document.getElementById('story-preview-card');

  const storyPrevLyricBtn = document.getElementById('story-prev-lyric-btn');
  const storyNextLyricBtn = document.getElementById('story-next-lyric-btn');
  const storyLyricIndicator = document.getElementById('story-lyric-indicator');
  const storyCustomNoteInput = document.getElementById('story-custom-note');
  const storyDownloadBtn = document.getElementById('story-download-btn');
  const storyCopyBtn = document.getElementById('story-copy-btn');
  const storyExportCanvas = document.getElementById('story-export-canvas');

  let currentStoryLyricIdx = 0;

  function updateStoryCardUI() {
    const track = PLAYLIST[currentTrackIndex];
    if (!track) return;

    if (storyArtworkImg) storyArtworkImg.src = track.cover;
    if (storyTrackTitle) storyTrackTitle.textContent = track.title;
    if (storyTrackArtist) storyTrackArtist.textContent = track.artist;

    if (storyAmbientGlow) {
      storyAmbientGlow.style.setProperty('--story-glow-color', track.glow || track.color || 'rgba(255, 94, 126, 0.55)');
    }

    if (storyPreviewCard && track.color) {
      storyPreviewCard.style.setProperty(
        '--story-card-bg',
        `linear-gradient(165deg, ${track.color}44 0%, #170b16 55%, #0c050d 100%)`
      );
    }

    // Days counter for card
    const now = new Date();
    const metDate = new Date(2026, 0, 31, 1, 16, 0);
    const diffDays = Math.floor(Math.max(0, now - metDate) / (1000 * 86400));
    if (storyTogetherCounter) {
      storyTogetherCounter.textContent = `Together ${diffDays} Days • Met on 31 Jan 2026`;
    }

    // Update quote text
    const customText = storyCustomNoteInput ? storyCustomNoteInput.value.trim() : '';
    if (customText) {
      if (storyLyricQuote) storyLyricQuote.textContent = customText;
      if (storyLyricIndicator) storyLyricIndicator.textContent = 'Custom Note';
    } else if (track.lyrics && track.lyrics.length > 0) {
      if (currentStoryLyricIdx >= track.lyrics.length) currentStoryLyricIdx = 0;
      if (currentStoryLyricIdx < 0) currentStoryLyricIdx = track.lyrics.length - 1;
      const line = track.lyrics[currentStoryLyricIdx].text;
      if (storyLyricQuote) storyLyricQuote.textContent = line;
      if (storyLyricIndicator) {
        storyLyricIndicator.textContent = `${currentStoryLyricIdx + 1} of ${track.lyrics.length}`;
      }
    } else {
      if (storyLyricQuote) storyLyricQuote.textContent = "My Dear Digi, forever and always in my heart.";
      if (storyLyricIndicator) storyLyricIndicator.textContent = 'Special';
    }
  }

  if (storyBtn) {
    storyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (storySheet && storySheet.classList.contains('is-revealed')) {
        closeStorySheet();
        return;
      }
      // Auto select current singing lyric if available
      const track = PLAYLIST[currentTrackIndex];
      if (track && track.lyrics && currentLyricIndex >= 0 && currentLyricIndex < track.lyrics.length) {
        currentStoryLyricIdx = currentLyricIndex;
      }
      updateStoryCardUI();
      if (storySheet) storySheet.classList.add('is-revealed');
      showHUD('Story Card', 'Memory Generator Opened', 'heart');
    });
  }

  function closeStorySheet() {
    if (storySheet) storySheet.classList.remove('is-revealed');
  }

  if (storyCloseBtn) storyCloseBtn.addEventListener('click', closeStorySheet);
  if (storyBackdrop) storyBackdrop.addEventListener('click', closeStorySheet);

  if (storyPrevLyricBtn) {
    storyPrevLyricBtn.addEventListener('click', () => {
      const track = PLAYLIST[currentTrackIndex];
      if (track && track.lyrics && track.lyrics.length > 0) {
        currentStoryLyricIdx = (currentStoryLyricIdx - 1 + track.lyrics.length) % track.lyrics.length;
        if (storyCustomNoteInput) storyCustomNoteInput.value = '';
        updateStoryCardUI();
      }
    });
  }

  if (storyNextLyricBtn) {
    storyNextLyricBtn.addEventListener('click', () => {
      const track = PLAYLIST[currentTrackIndex];
      if (track && track.lyrics && track.lyrics.length > 0) {
        currentStoryLyricIdx = (currentStoryLyricIdx + 1) % track.lyrics.length;
        if (storyCustomNoteInput) storyCustomNoteInput.value = '';
        updateStoryCardUI();
      }
    });
  }

  if (storyCustomNoteInput) {
    storyCustomNoteInput.addEventListener('input', () => {
      updateStoryCardUI();
    });
  }

  // =========================================================
  // BULLETPROOF HIGH-RES 1080x1920 STORY PNG GENERATOR
  // =========================================================
  function renderStoryCardToCanvas(canvas, track, quoteText) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    // Clear
    ctx.clearRect(0, 0, W, H);

    // 1. Background Gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#1c0e18');
    grad.addColorStop(0.35, track.color || '#ff5e7e');
    grad.addColorStop(0.70, '#0f0710');
    grad.addColorStop(1, '#050206');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Diffused ambient glow circles
    ctx.save();
    ctx.globalAlpha = 0.50;
    const glowGrad = ctx.createRadialGradient(W / 2, H * 0.38, 40, W / 2, H * 0.38, 520);
    glowGrad.addColorStop(0, track.color || '#ff5e7e');
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    function roundRect(c, x, y, w, h, r) {
      c.beginPath();
      c.moveTo(x + r, y);
      c.lineTo(x + w - r, y);
      c.quadraticCurveTo(x + w, y, x + w, y + r);
      c.lineTo(x + w, y + h - r);
      c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      c.lineTo(x + r, y + h);
      c.quadraticCurveTo(x, y + h, x, y + h - r);
      c.lineTo(x, y + r);
      c.quadraticCurveTo(x, y, x + r, y);
      c.closePath();
    }

    // 2. Top Header Elements
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 38px -apple-system, BlinkMacSystemFont, "Outfit", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(' Music', 100, 175);

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    roundRect(ctx, W - 490, 135, 390, 58, 29);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.30)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Dedicated to Princess Digi', W - 295, 172);
    ctx.restore();

    // 3. Album Cover (16:9 ratio in center)
    const artW = 880;
    const artH = Math.round(artW * (9 / 16));
    const artX = (W - artW) / 2;
    const artY = 250;

    // Use pre-loaded DOM image element so canvas is never tainted
    const domImg = (storyArtworkImg && storyArtworkImg.complete && storyArtworkImg.naturalWidth > 0)
      ? storyArtworkImg
      : (artworkImg && artworkImg.complete && artworkImg.naturalWidth > 0 ? artworkImg : null);

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 20;
    roundRect(ctx, artX, artY, artW, artH, 36);
    ctx.fillStyle = '#111116';
    ctx.fill();
    ctx.clip();

    if (domImg) {
      try {
        ctx.drawImage(domImg, artX, artY, artW, artH);
      } catch (err) {
        console.warn('Canvas image draw fallback:', err);
      }
    }
    ctx.restore();

    // Specular border on artwork
    ctx.save();
    roundRect(ctx, artX, artY, artW, artH, 36);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // 4. Track Title & Artist
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 64px -apple-system, BlinkMacSystemFont, "Outfit", sans-serif';
    ctx.fillText(track.title, W / 2, artY + artH + 110);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.font = '500 36px -apple-system, BlinkMacSystemFont, "Outfit", sans-serif';
    ctx.fillText(track.artist, W / 2, artY + artH + 170);

    // 5. Quote Box
    const quoteBoxY = artY + artH + 240;
    const quoteBoxH = 340;
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    roundRect(ctx, 100, quoteBoxY, W - 200, quoteBoxH, 32);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.40)';
    ctx.font = 'italic 700 80px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText('“', 140, quoteBoxY + 80);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'italic 500 40px -apple-system, BlinkMacSystemFont, "Outfit", sans-serif';
    ctx.textAlign = 'center';

    // Word wrap quote inside box
    function wrapText(context, text, x, y, maxWidth, lineHeight) {
      const words = text.split(' ');
      let line = '';
      const lines = [];
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          lines.push(line);
          line = words[n] + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line);
      const startY = y - ((lines.length - 1) * lineHeight) / 2;
      for (let k = 0; k < lines.length; k++) {
        context.fillText(lines[k].trim(), x, startY + k * lineHeight);
      }
    }
    wrapText(ctx, quoteText, W / 2, quoteBoxY + 180, W - 280, 54);
    ctx.restore();

    // 6. Bottom Meta & Live Counter
    const now2 = new Date();
    const diff2 = Math.floor(Math.max(0, now2 - new Date(2026, 0, 31, 1, 16, 0)) / (1000 * 86400));
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.font = '700 32px -apple-system, BlinkMacSystemFont, "Outfit", sans-serif';
    ctx.fillText(`Together ${diff2} Days • Met on 31 Jan 2026`, W / 2, H - 240);

    const activeVer = window.CURRENT_OS_VERSION || getActiveOSVersion();
    ctx.fillText(`DIGI OS ${activeVer} • SPECIAL VIEV`, W / 2, H - 190);
  }

  function triggerPngDownload(canvas, filename) {
    // ── BULLETPROOF PNG DOWNLOAD ──
    // Key insight: Chrome/Edge ONLY honor the `download` attribute on <a> tags
    // when the click is a TRUSTED user gesture. `dispatchEvent(new MouseEvent)` 
    // creates an UNTRUSTED event → download attr is ignored → bare UUID filename.
    // Blob URLs also get UUID filenames when download attr is ignored.
    // 
    // Solution: Use data:image/png URL + simple a.click() within the synchronous
    // user click handler. a.click() IS treated as trusted when called synchronously
    // inside a real user gesture handler.

    const safeName = filename.endsWith('.png') ? filename : filename + '.png';

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = safeName;
      // Do NOT append to body - just click directly. This is the most reliable
      // way in Chrome/Edge to preserve the download filename.
      link.click();
      showHUD('PNG Saved ✓', safeName, 'heart');
    } catch (err) {
      // Canvas might be tainted (cross-origin image drawn).
      // Fallback: open as new tab so user can right-click → Save As
      console.error('PNG download error (canvas likely tainted):', err);
      try {
        // Re-render without the artwork image to get an untainted canvas
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, '#1c0e18');
        grad.addColorStop(1, '#050206');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '700 64px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Export Error', canvas.width / 2, canvas.height / 2);
        ctx.font = '400 36px sans-serif';
        ctx.fillText('Image could not be rendered', canvas.width / 2, canvas.height / 2 + 60);

        const dataUrl2 = canvas.toDataURL('image/png');
        const link2 = document.createElement('a');
        link2.href = dataUrl2;
        link2.download = safeName;
        link2.click();
      } catch (e2) {
        console.error('All download methods failed:', e2);
      }
      showHUD('Export Issue', 'Try refreshing page', 'heart');
    }
  }

  // Generate and Download 1080x1920 High-Res Story PNG
  if (storyDownloadBtn) {
    storyDownloadBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      e.preventDefault();

      var track = PLAYLIST[currentTrackIndex];
      if (!track) return;

      // Create a fresh offscreen canvas every time (avoid stale references)
      var canvas = storyExportCanvas;
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1920;
      }

      var quoteText = storyLyricQuote ? storyLyricQuote.textContent : 'Tere kolon mainu saah milde...';
      var safeTitle = (track.title || 'Track').replace(/[^a-zA-Z0-9_-]/g, '_');
      var filename = 'Digi_Story_' + safeTitle + '.png';

      // MUST render and download synchronously within this click handler
      // so that Chromium treats a.click() as a trusted user gesture.
      renderStoryCardToCanvas(canvas, track, quoteText);
      triggerPngDownload(canvas, filename);
    });
  }

  // Copy Quote & Dedication
  if (storyCopyBtn) {
    storyCopyBtn.addEventListener('click', () => {
      const track = PLAYLIST[currentTrackIndex];
      const quote = storyLyricQuote ? storyLyricQuote.textContent : '';
      const textToCopy = `“${quote}”\n— ${track ? track.title : 'Digi Viev'}\n❤️ Dedicated exclusively to Princess Digi • Always & Forever`;
      navigator.clipboard.writeText(textToCopy).then(() => {
        showHUD('Quote Copied', 'Copied to Clipboard', 'heart');
      }).catch(() => {
        showHUD('Copied', 'Ready to share with Digi', 'heart');
      });
    });
  }

  // =========================================================
  // FEATURE 6 (SUGGESTION 6): SPATIAL AUDIO & BINAURAL ROOM ACOUSTICS CONTROLS
  // =========================================================
  const spatialToggle = document.getElementById('pref-spatial-toggle');
  const spatialPills = document.querySelectorAll('.spatial-pill');
  const spatialDepthSlider = document.getElementById('spatial-depth-slider');
  const spatialDepthVal = document.getElementById('spatial-depth-val');
  const stageStatusBadge = document.getElementById('stage-status-badge');
  const badgeAtmos = document.getElementById('badge-atmos');

  function updateSpatialUIState() {
    if (spatialToggle) spatialToggle.checked = isSpatialAudioEnabled;

    spatialPills.forEach(p => {
      const mode = p.getAttribute('data-mode');
      p.classList.toggle('active', mode === currentSpatialMode && isSpatialAudioEnabled);
    });

    if (badgeAtmos) {
      badgeAtmos.classList.toggle('is-spatial-active', isSpatialAudioEnabled);
    }

    if (stageStatusBadge) {
      if (!isSpatialAudioEnabled) {
        stageStatusBadge.textContent = 'Spatial Audio Bypassed (Stereo)';
      } else if (currentSpatialMode === 'hall') {
        stageStatusBadge.textContent = 'Concert Hall 3D Reverb Active';
      } else if (currentSpatialMode === 'studio') {
        stageStatusBadge.textContent = 'Intimate Studio Acoustics Active';
      } else if (currentSpatialMode === 'wide') {
        stageStatusBadge.textContent = 'Binaural Haas Widener Active';
      }
    }

    if (spatialDepthVal) {
      spatialDepthVal.textContent = `${Math.round(currentSpatialDepth * 100)}%`;
    }

    updateSpatialAudioEngine();
  }

  if (spatialToggle) {
    spatialToggle.addEventListener('change', () => {
      isSpatialAudioEnabled = spatialToggle.checked;
      updateSpatialUIState();
      showHUD(
        isSpatialAudioEnabled ? 'Spatial Audio Active' : 'Spatial Audio Off',
        isSpatialAudioEnabled ? currentSpatialMode.toUpperCase() : 'Stereo',
        'airplay'
      );
    });
  }

  spatialPills.forEach(pill => {
    pill.addEventListener('click', () => {
      currentSpatialMode = pill.getAttribute('data-mode') || 'hall';
      isSpatialAudioEnabled = true;
      updateSpatialUIState();
      showHUD(`Spatial: ${pill.querySelector('.pill-title').textContent}`, 'Acoustics Switched', 'airplay');
    });
  });

  if (spatialDepthSlider) {
    spatialDepthSlider.addEventListener('input', (e) => {
      currentSpatialDepth = parseInt(e.target.value, 10) / 100;
      updateSpatialUIState();
    });
  }

  // Dolby Atmos badge in Player toggles Spatial Audio directly
  if (badgeAtmos) {
    badgeAtmos.addEventListener('click', (e) => {
      e.stopPropagation();
      isSpatialAudioEnabled = !isSpatialAudioEnabled;
      updateSpatialUIState();
      showHUD(
        isSpatialAudioEnabled ? 'Spatial Audio: ON' : 'Spatial Audio: OFF',
        isSpatialAudioEnabled ? `${currentSpatialMode.toUpperCase()} Mode` : 'Pure Stereo',
        'airplay'
      );
    });
  }

  // Initial Setup: Restore previous track & position if user is on OS 1.3
  const savedTrackIdx = isOS13Active() ? parseInt(localStorage.getItem('viev_last_track_index') || '0', 10) : 0;
  const initialIdx = (!isNaN(savedTrackIdx) && savedTrackIdx >= 0 && savedTrackIdx < PLAYLIST.length) ? savedTrackIdx : 0;
  loadTrack(initialIdx, false);
  if (isOS13Active()) {
    const savedTime = parseFloat(localStorage.getItem('viev_last_track_time') || '0');
    if (!isNaN(savedTime) && savedTime > 0) {
      audio.currentTime = savedTime;
    }
  }
  setPlayPauseUI(false);
  updateSpatialUIState();
  updateStoryCardUI();
  if (typeof renderSongList === 'function') {
    renderSongList();
  }

  // =========================================================
  // FEATURE 6: macOS FROSTED GLASS SHORTCUT HUD & KEYBOARD SHORTCUTS
  // =========================================================
  const glassHud = document.getElementById('apple-glass-hud');
  const hudIconWrap = document.getElementById('hud-icon-wrap');
  const hudLabel = document.getElementById('hud-label');
  const hudBarWrap = document.getElementById('hud-bar-wrap');
  const hudBarFill = document.getElementById('hud-bar-fill');
  let hudTimer = null;

  function showHUD(title, subtitle = '', iconType = 'play', barValue = null) {
    if (!glassHud) return;

    let iconSvg = '';
    switch (iconType) {
      case 'play':
        iconSvg = '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
        break;
      case 'pause':
        iconSvg = '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
        break;
      case 'seek-fwd':
        iconSvg = '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>';
        break;
      case 'seek-back':
        iconSvg = '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>';
        break;
      case 'volume':
        iconSvg = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>';
        break;
      case 'mute':
        iconSvg = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>';
        break;
      case 'heart':
        iconSvg = '<svg width="24" height="24" viewBox="0 0 24 24" fill="#ff2d55"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
        break;
      case 'heart-outline':
        iconSvg = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
        break;
      case 'lyrics':
        iconSvg = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
        break;
      case 'songlist':
        iconSvg = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/></svg>';
        break;
      case 'airplay':
        iconSvg = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"/><polygon points="12 15 17 21 7 21 12 15"/></svg>';
        break;
      default:
        iconSvg = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>';
    }

    if (hudIconWrap) hudIconWrap.innerHTML = iconSvg;
    if (hudLabel) hudLabel.textContent = title;

    if (barValue !== null && hudBarWrap && hudBarFill) {
      hudBarWrap.style.display = 'block';
      hudBarFill.style.width = `${Math.round(barValue * 100)}%`;
    } else if (hudBarWrap) {
      hudBarWrap.style.display = 'none';
    }

    glassHud.classList.add('is-revealed');
    if (hudTimer) clearTimeout(hudTimer);
    hudTimer = setTimeout(() => {
      glassHud.classList.remove('is-revealed');
    }, 1100);
  }

  // Keyboard Shortcuts (Space, Arrows, M, L, S, F)
  window.addEventListener('keydown', (e) => {
    // Ignore when typing inside an input field
    const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea') return;

    if (e.code === 'Space') {
      e.preventDefault();
      togglePlay();
      showHUD(audio.paused ? 'Paused' : 'Playing', '', audio.paused ? 'pause' : 'play');
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      if (audio.duration) {
        audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
        showHUD('+5s Fast Forward', '', 'seek-fwd');
        updateSyncedLyrics(audio.currentTime, true);
      }
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      if (audio.duration) {
        audio.currentTime = Math.max(0, audio.currentTime - 5);
        showHUD('-5s Rewind', '', 'seek-back');
        updateSyncedLyrics(audio.currentTime, true);
      }
    } else if (e.code === 'ArrowUp') {
      e.preventDefault();
      const newVol = Math.min(1, Math.round((audio.volume + 0.1) * 10) / 10);
      updateVolumeUI(newVol);
      showHUD(`Volume ${Math.round(newVol * 100)}%`, '', 'volume', newVol);
    } else if (e.code === 'ArrowDown') {
      e.preventDefault();
      const newVol = Math.max(0, Math.round((audio.volume - 0.1) * 10) / 10);
      updateVolumeUI(newVol);
      showHUD(`Volume ${Math.round(newVol * 100)}%`, '', newVol === 0 ? 'mute' : 'volume', newVol);
    } else if (e.code === 'KeyM') {
      const newVol = audio.volume > 0 ? 0 : 0.75;
      updateVolumeUI(newVol);
      showHUD(newVol === 0 ? 'Muted' : 'Volume 75%', '', newVol === 0 ? 'mute' : 'volume', newVol);
    } else if (e.code === 'KeyL') {
      setCardView(currentCardView === 'lyrics' ? 'artwork' : 'lyrics');
      showHUD(currentCardView === 'lyrics' ? 'Lyrics Opened' : 'Artwork View', '', 'lyrics');
    } else if (e.code === 'KeyS') {
      setCardView(currentCardView === 'songlist' ? 'artwork' : 'songlist');
      showHUD(currentCardView === 'songlist' ? 'All Songs' : 'Artwork View', '', 'songlist');
    } else if (e.code === 'KeyF') {
      if (favBtn) favBtn.click();
    } else if (e.code === 'KeyC') {
      if (storyBtn) storyBtn.click();
    } else if (e.code === 'KeyA') {
      if (badgeAtmos) badgeAtmos.click();
    } else if (e.code === 'Escape') {
      closeStorySheet();
    }
  });

  // Expose Playlist, syncMusicPlaylistWithOS, and loadTrack globally
  window.PLAYLIST = PLAYLIST;
  window.syncMusicPlaylistWithOS = syncMusicPlaylistWithOS;
  window.loadTrackByIndex = function(idx) {
    if (typeof loadTrack === 'function') {
      loadTrack(idx, true);
    }
  };
});

