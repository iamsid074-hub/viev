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

  function updateIndicator(activeBtn) {
    if (!indicator || !activeBtn) return;
    indicator.classList.remove('no-transition');
    indicator.style.left = `${activeBtn.offsetLeft}px`;
    indicator.style.width = `${activeBtn.offsetWidth}px`;
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
    if (typeof triggerHaptic === 'function') triggerHaptic('light');
    currentTab = targetTab;

    // Update active tab buttons
    tabBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
      b.classList.remove('is-dock-magnified');
    });
    clickedBtn.classList.add('active');
    clickedBtn.setAttribute('aria-selected', 'true');

    // Slide the liquid glass pill indicator smoothly
    updateIndicator(clickedBtn);

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
      }
    } else {
      stopBeatVisualizer();
      stopSyncLoop();
    }

    // Update floating companion orb visibility
    updateFloatingOrbVisibility();

    // Toggle Apple Intelligence Bottom Edge Aura visibility (Home Screen only)
    const edgeAura = document.getElementById('apple-intelligence-edge-aura');
    if (edgeAura) {
      edgeAura.classList.toggle('is-hidden', targetTab !== 'home');
    }

    // Open YouTube Home feed directly when YouTube tab is selected
    if (targetTab === 'cinema') {
      if (typeof window.openCinemaLounge === 'function') {
        window.openCinemaLounge('All', false);
      }
    }

    // Update Cinema Mini PiP visibility
    if (window.vievCinema && typeof window.vievCinema.updateMiniPlayerVisibility === 'function') {
      window.vievCinema.updateMiniPlayerVisibility(targetTab);
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
      indicator.classList.add('is-pressed');

      const closest = getClosestTabBtn(e.clientX);
      if (closest) closest.classList.add('is-dock-magnified');
    });

    nav.addEventListener('pointermove', (e) => {
      if (isNavDragging) {
        if (Math.abs(e.clientX - dragStartX) > 4) {
          hasDragged = true;
          indicator.classList.add('no-transition', 'is-dragging', 'is-expanded');
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
      if (nav) {
        nav.classList.add('is-tap-enlarged');
        if (tapTimeout) clearTimeout(tapTimeout);
        tapTimeout = setTimeout(() => {
          nav.classList.remove('is-tap-enlarged');
        }, 220);
      }
    });
  });

  // Position indicator initially once fonts and layout are ready
  const initialActive = document.querySelector('.nav-tab-btn.active');
  if (initialActive) {
    setTimeout(() => updateIndicator(initialActive, false), 80);
  }

  window.addEventListener('resize', () => {
    const active = document.querySelector('.nav-tab-btn.active');
    if (active) updateIndicator(active, false);
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
  // 3D LIQUID GLASS SHADER ENGINE (WebGL Optical Corner Refraction)
  // Replicating the exact WebGL lens shader with dynamic corner water reflections
  // =========================================================
  function initPillLiquidEngine() {
    const canvas = document.getElementById('pill-liquid-canvas');
    if (!canvas) return;

    let gl = null;
    try {
      gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: true }) ||
           canvas.getContext('experimental-webgl', { alpha: true, premultipliedAlpha: false, antialias: true });
    } catch (e) {}

    if (!gl) {
      console.warn('WebGL not supported for liquid pill, using CSS caustics fallback');
      return;
    }

    const vsSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision mediump float;
      uniform vec3 iResolution;
      uniform float iTime;
      uniform vec4 iMouse;
      uniform sampler2D iChannel0;

      void main() {
        const float POWER_EXPONENT = 6.0;
        const float SAMPLE_RANGE = 3.0;
        const float SAMPLE_OFFSET = 0.55;
        const float GRADIENT_RANGE = 0.35;
        const float GRADIENT_OFFSET = 0.15;
        const float LIGHTING_INTENSITY = 0.42;

        vec2 uv = gl_FragCoord.xy / iResolution.xy;
        
        // Fluid tilt displacement based on pointer and spring motion
        vec2 mouseOffset = (iMouse.xy / iResolution.xy - 0.5) * 0.22;
        vec2 m2 = uv - (vec2(0.5) + mouseOffset);

        // Aspect ratio compensation for rounded pill
        float aspect = iResolution.x / iResolution.y;
        vec2 p = m2 * vec2(aspect * 0.52, 1.15);
        
        // Non-linear corner superellipse (squircle rounded box)
        float roundedBox = pow(abs(p.x * 2.05), POWER_EXPONENT) + pow(abs(p.y * 2.05), POWER_EXPONENT);

        // Multi-level rim masks for physical 3D bevel & internal reflection
        float rb1 = clamp((1.0 - roundedBox) * 7.0, 0.0, 1.0);
        float rb2 = clamp((1.04 - roundedBox) * 16.0, 0.0, 1.0) - clamp((0.92 - roundedBox) * 16.0, 0.0, 1.0);
        float rb3 = clamp((1.35 - roundedBox) * 3.0, 0.0, 1.0) - clamp((0.98 - roundedBox) * 3.0, 0.0, 1.0);

        float transition = smoothstep(0.0, 0.75, rb1 + rb2);

        if (transition > 0.01) {
          // Dynamic optical barrel distortion: bending texture around the corners like real water
          float distortion = (1.0 - roundedBox * 0.45);
          vec2 lens = ((uv - 0.5) * distortion + 0.5);

          // Multi-tap chromatic dispersion sampling across the curved lens
          vec4 totalColor = vec4(0.0);
          float totalWeight = 0.0;

          for (float x = -SAMPLE_RANGE; x <= SAMPLE_RANGE; x += 1.0) {
            for (float y = -SAMPLE_RANGE; y <= SAMPLE_RANGE; y += 1.0) {
              vec2 offset = vec2(x, y) * SAMPLE_OFFSET / iResolution.xy;
              vec2 sampleUV = clamp(offset + lens, 0.001, 0.999);
              
              // 7-color chromatic fringe dispersion around the corners
              float r = texture2D(iChannel0, clamp(sampleUV + offset * 0.45, 0.001, 0.999)).r;
              float g = texture2D(iChannel0, sampleUV).g;
              float b = texture2D(iChannel0, clamp(sampleUV - offset * 0.45, 0.001, 0.999)).b;
              
              totalColor += vec4(r, g, b, 1.0);
              totalWeight += 1.0;
            }
          }
          vec4 refracted = totalColor / totalWeight;

          // Internal specular caustic gradient (sky reflection + horizon compression line)
          float gradient = clamp((clamp(m2.y + 0.08, 0.0, GRADIENT_RANGE) + GRADIENT_OFFSET) * 0.5, 0.0, 1.0) +
                           clamp((clamp(-m2.y - 0.04, -10.0, GRADIENT_RANGE) * rb3 + GRADIENT_OFFSET) * 0.5, 0.0, 1.0);

          vec4 lighting = clamp(refracted + vec4(rb1) * gradient + vec4(rb2) * LIGHTING_INTENSITY, 0.0, 1.0);

          gl_FragColor = vec4(lighting.rgb, transition * 0.96);
        } else {
          gl_FragColor = vec4(0.0);
        }
      }
    `;

    function compileShader(type, src) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile err:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('Program link err:', gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    const quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1
    ]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(prog, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'iResolution');
    const uTime = gl.getUniformLocation(prog, 'iTime');
    const uMouse = gl.getUniformLocation(prog, 'iMouse');
    const uTex = gl.getUniformLocation(prog, 'iChannel0');

    // Texture setup: procedural starry lake & autumn tree reflection canvas
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    function createProceduralTexture() {
      const offCanvas = document.createElement('canvas');
      offCanvas.width = 512;
      offCanvas.height = 512;
      const ctx = offCanvas.getContext('2d');
      if (!ctx) return offCanvas;

      // Dark starry night sky & calm lake horizon matching reference image
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 512);
      skyGrad.addColorStop(0, '#0a1428');
      skyGrad.addColorStop(0.48, '#1e385c');
      skyGrad.addColorStop(0.50, '#0c182a'); // Horizon
      skyGrad.addColorStop(0.52, '#1a3250'); // Lake reflection
      skyGrad.addColorStop(1, '#070f1e');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 512, 512);

      // Warm autumn glowing tree / center reflection
      const treeGrad = ctx.createRadialGradient(256, 230, 10, 256, 230, 90);
      treeGrad.addColorStop(0, 'rgba(235, 110, 40, 0.95)');
      treeGrad.addColorStop(0.5, 'rgba(180, 75, 20, 0.85)');
      treeGrad.addColorStop(1, 'rgba(180, 75, 20, 0)');
      ctx.fillStyle = treeGrad;
      ctx.beginPath();
      ctx.arc(256, 230, 90, 0, Math.PI * 2);
      ctx.fill();

      // Tree reflection in lake
      ctx.save();
      ctx.translate(0, 512);
      ctx.scale(1, -1);
      ctx.globalAlpha = 0.75;
      ctx.beginPath();
      ctx.arc(256, 230, 90, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      return offCanvas;
    }

    const defaultOffscreen = createProceduralTexture();
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, defaultOffscreen);

    // Also load the real wallpaper or song cover image if accessible
    const sourceImg = new Image();
    sourceImg.crossOrigin = 'anonymous';
    sourceImg.onload = () => {
      try {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sourceImg);
      } catch (err) {}
    };
    sourceImg.src = 'song/Screenshot 2026-10-24 224431.png';

    // Interactive pointer & spring motion tracking
    let targetMouse = [0.5, 0.5];
    let curMouse = [0.5, 0.5];

    if (nav) {
      nav.addEventListener('pointermove', (e) => {
        if (!indicator) return;
        const rect = indicator.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const relX = (e.clientX - rect.left) / rect.width;
          const relY = (e.clientY - rect.top) / rect.height;
          targetMouse[0] = Math.max(0, Math.min(1, relX));
          targetMouse[1] = Math.max(0, Math.min(1, 1 - relY));
        }
      });
      nav.addEventListener('pointerleave', () => {
        targetMouse[0] = 0.5;
        targetMouse[1] = 0.5;
      });
    }

    // Dynamic resolution adjustment matching pill dimensions
    function syncCanvasSize() {
      if (!indicator) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round((indicator.offsetWidth || 78) * dpr);
      const h = Math.round((indicator.offsetHeight || 38) * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    }

    syncCanvasSize();
    window.addEventListener('resize', syncCanvasSize);

    // Continuous 60/120fps WebGL render loop
    const startTime = performance.now();
    function renderLoop() {
      syncCanvasSize();

      // Fluid spring interpolation: water reflections actively react around the corners
      curMouse[0] += (targetMouse[0] - curMouse[0]) * 0.12;
      curMouse[1] += (targetMouse[1] - curMouse[1]) * 0.12;

      const elapsed = (performance.now() - startTime) / 1000;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(prog);

      gl.uniform3f(uRes, canvas.width, canvas.height, 1.0);
      gl.uniform1f(uTime, elapsed);
      gl.uniform4f(uMouse, curMouse[0] * canvas.width, curMouse[1] * canvas.height, 0, 0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(uTex, 0);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);
  }

  // Initialize WebGL Liquid Pill Engine
  setTimeout(initPillLiquidEngine, 100);

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
    if (!isOS13Active()) {
      try { navigator.mediaSession.metadata = null; } catch(e) {}
      return;
    }
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
      title: 'Ve Haaniyaan',
      artist: 'Danny • Avvy Sra',
      bpm: 90,
      src: 'song/Ve Haaniyaan.mp3',
      lrcFile: 'song/Ve Haaniyaan.lrc',
      cover: 'song/Screenshot 2026-10-24 224431.png',
      color: '#ff5e7e',
      glow: 'rgba(255, 94, 126, 0.88)',
      glowSoft: 'rgba(255, 94, 126, 0.40)',
      lyrics: [
        { time: 7.5, text: "Tere kolon mainu saah milde," },
        { time: 11.5, text: "Assi aivein ni tainu bewajah milde" },
        { time: 15.5, text: "Tere ch koi gall ae sahiba," },
        { time: 19.5, text: "Haan assi tainu tan milde" },
        { time: 23.5, text: "Mainu pata nahi hunda sukoon ki," },
        { time: 27.5, text: "Tainu mile tan pata laggeya" },
        { time: 31.5, text: "Mit gayi meri sab tanhai," },
        { time: 35.5, text: "Jee tere kol aa laggeya" },
        { time: 39.5, text: "Ve haaniyaan ve dil jaaniya," },
        { time: 43.5, text: "Tu nehde nehde reh na door kite ja" },
        { time: 47.5, text: "Bhull gaye eh saari duniya," },
        { time: 51.5, text: "Ke tera hi naam hai boldi zubaan" },
        { time: 79.5, text: "Eh jo sadde naal hoya ae," },
        { time: 83.5, text: "Khoobsurat sapna lagdae" },
        { time: 87.5, text: "Ajnabee si kal tak jo," },
        { time: 91.5, text: "Haan hun mainu apna lagdae" },
        { time: 95.5, text: "Tu hi din tu hi meri raat," },
        { time: 99.5, text: "Koyi nahi hai tere toh bina" },
        { time: 103.5, text: "Ve haaniyaan ve dil jaaniya," },
        { time: 107.5, text: "Tu nehde nehde reh na door kite ja" },
        { time: 115.5, text: "Bhull gaye eh saari duniya," },
        { time: 119.5, text: "Ke tera hi naam hai boldi zubaan" },
        { time: 127.5, text: "Tainu vekhi jaawan main haye," },
        { time: 131.5, text: "Ishq tere vich gaawan main" },
        { time: 135.5, text: "Mere dil nu mil gaya raah," },
        { time: 139.5, text: "Jad tainu gal laawan main" },
        { time: 143.5, text: "Ke likheya si sadda milna," },
        { time: 147.5, text: "Tu aiddan milna eh nahi si pata" },
        { time: 151.5, text: "Ve haaniyaan ve dil jaaniya," },
        { time: 155.5, text: "Tu nehde nehde reh na door kite ja" },
        { time: 159.5, text: "Bhull gaye eh saari duniya," },
        { time: 163.5, text: "Ke tera hi naam hai boldi zubaan" }
      ]
    },
    {
      title: 'Samjhawan',
      artist: 'Arijit Singh • Shreya Ghoshal',
      bpm: 76,
      src: 'song/Samjhawan Humpty Sharma Ki Dulhania 320 Kbps.mp3',
      lrcFile: 'song/Samjhawan.lrc',
      cover: 'song/Screenshot 2026-10-24 224416.png',
      color: '#ff9f24',
      glow: 'rgba(255, 159, 36, 0.88)',
      glowSoft: 'rgba(255, 159, 36, 0.40)',
      lyrics: [
        { time: 11.5, text: "Nahi jeena tere baaju," },
        { time: 15.5, text: "Nahi jeena, nahi jeena..." },
        { time: 31.5, text: "Main tainu samjhawan ki," },
        { time: 35.5, text: "Na tere bina lagda jee" },
        { time: 43.5, text: "Main tainu samjhawan ki," },
        { time: 47.5, text: "Na tere bina lagda jee" },
        { time: 51.5, text: "Tu ki jaane pyaar mera," },
        { time: 55.5, text: "Main karaan intezar tera" },
        { time: 59.5, text: "Tu dil, tuiyon jaan meri" },
        { time: 63.5, text: "Main tainu samjhawan ki," },
        { time: 67.5, text: "Na tere bina lagda jee" },
        { time: 119.0, text: "Mere dil ne chun laiyaa ne," },
        { time: 123.5, text: "Tere dil diyaan raahan" },
        { time: 127.5, text: "Tu jo mere naal turre taan," },
        { time: 131.5, text: "Turpe meriyaan saahan" },
        { time: 135.5, text: "Jeena mera haye, hun hai tera," },
        { time: 139.5, text: "Ki main karaan..." },
        { time: 147.5, text: "Tu kar aitbaar mera," },
        { time: 151.5, text: "Main karaan intezar tera" },
        { time: 155.5, text: "Tu dil, tuiyon jaan meri" },
        { time: 159.5, text: "Main tainu samjhawan ki," },
        { time: 163.5, text: "Na tere bina lagda jee" },
        { time: 167.5, text: "Ve changa nahion keeta beeba," },
        { time: 175.5, text: "Dil mera tod ke" },
        { time: 179.5, text: "Ve bada pachhtaiyaan akhaan," },
        { time: 187.5, text: "Naal tere jod ke" }
      ]
    },
    {
      title: 'Ishq Ka Fever',
      artist: 'Vishal Bhardwaj • Arijit Singh',
      bpm: 104,
      src: 'song/Ishq Ka Fever O Romeo 320 Kbps.mp3',
      lrcFile: 'song/Ishq Ka Fever.lrc',
      cover: 'song/Screenshot 2026-10-24 224355.png',
      color: '#d946ef',
      glow: 'rgba(217, 70, 239, 0.88)',
      glowSoft: 'rgba(217, 70, 239, 0.40)',
      lyrics: [
        { time: 11.5, text: "Halka-halka fever hai," },
        { time: 17.5, text: "Saans bhi dubli lagti hai" },
        { time: 25.5, text: "Dhoop mein jee nahi lagta," },
        { time: 30.5, text: "Chhaanv bhi gham ki lagti hai" },
        { time: 35.5, text: "Kya rog yeh paala hai?" },
        { time: 40.5, text: "Mujhe ishq hua hai, ya hone wala hai" },
        { time: 51.5, text: "Mujhe ishq hua hai, ya hone wala hai" },
        { time: 69.5, text: "Nafz sehem ke chalti hai," },
        { time: 75.5, text: "Hansi bhi mujrim lagti hai" },
        { time: 83.5, text: "Kya hua hai mujhko?" },
        { time: 87.5, text: "Kyun tanhayi achhi lagti hai?" },
        { time: 95.5, text: "Kya tumne hi koi jaadu daala hai?" },
        { time: 103.5, text: "Mujhe ishq hua hai, ya hone wala hai" },
        { time: 110.5, text: "Mujhe ishq hua hai, ya hone wala hai" }
      ]
    },
    {
      title: 'Phir Le Aya Dil (Reprise)',
      artist: 'Arijit Singh • Pritam',
      bpm: 72,
      src: 'song/Phir Le Aya Dil (Reprise) - Arijit Singh (DJJOhAL.Com).mp3',
      lrcFile: 'song/Phir Le Aya Dil (Reprise).lrc',
      cover: 'song/Screenshot 2026-10-24 224316.png',
      color: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.88)',
      glowSoft: 'rgba(245, 158, 11, 0.40)',
      lyrics: [
        { time: 20.0, text: "Phir le aaya dil majboor kya keeje," },
        { time: 34.5, text: "Raas na aaya rehna door kya keeje..." },
        { time: 46.5, text: "Dil keh raha use maqammal kar bhi aao," },
        { time: 54.5, text: "Woh jo adhuri si baat baaki hai," },
        { time: 61.5, text: "Woh jo adhuri si yaad baaki hai," },
        { time: 67.5, text: "Woh jo adhuri si yaad baaki hai..." },
        { time: 79.5, text: "Karte hain hum aaj qabool kya keeje," },
        { time: 91.5, text: "Ho gayi thi humse yeh bhool kya keeje..." },
        { time: 105.5, text: "Dil keh raha use mayassar kar bhi aao," },
        { time: 114.5, text: "Woh jo dabi si aas baaki hai," },
        { time: 126.5, text: "Woh jo dabi si aanch baaki hai," },
        { time: 134.5, text: "Woh jo dabi si aanch baaki hai..." },
        { time: 170.5, text: "Kismat ko hai manzoor kya keeje," },
        { time: 190.5, text: "Kismat ko hai manzoor kya keeje..." },
        { time: 214.5, text: "Milte rahe hum badastoor kya keeje," },
        { time: 226.5, text: "Dil keh raha hai use musalsal kar bhi aao..." }
      ]
    },
    {
      title: 'Tu Tu Hai Wohi',
      artist: 'Kishore Kumar • Asha Bhosle',
      bpm: 124,
      src: 'song/Tu tu hai wohi dilne jise apna kaha_320(KoshalWorld.Com).mp3',
      lrcFile: 'song/Tu Tu Hai Wohi.lrc',
      cover: 'song/Screenshot 2026-10-24 224447.png',
      color: '#10b981',
      glow: 'rgba(16, 185, 129, 0.88)',
      glowSoft: 'rgba(16, 185, 129, 0.40)',
      lyrics: [
        { time: 49.5, text: "La, la la la la la, la la la la la la la" },
        { time: 55.5, text: "La, la la la la, la la la la la" },
        { time: 61.5, text: "Tu, tu hai wohi dil ne jise apna kaha," },
        { time: 67.5, text: "Tu hai jahan, main hoon wahan," },
        { time: 73.5, text: "Ab to yeh jeena tere bin hai saza..." },
        { time: 79.5, text: "Ho, mil jayein is tarah, do lehrein jis tarah," },
        { time: 85.5, text: "Ho, mil jayein is tarah, do lehrein jis tarah," },
        { time: 91.5, text: "Phir ho na juda, haan yeh vaada raha" },
        { time: 133.5, text: "Main aawaaz hoon to, tu hai geet mera," },
        { time: 139.5, text: "Jahan se niraala, manmeet mera..." },
        { time: 145.5, text: "Mil jayein is tarah, do lehrein jis tarah," },
        { time: 157.5, text: "Phir ho na juda, haan yeh vaada raha" },
        { time: 163.5, text: "Tu, tu hai wohi dil ne jise apna kaha," },
        { time: 169.5, text: "Tu hai jahan, main hoon wahan," },
        { time: 175.5, text: "Ab to yeh jeena tere bin hai saza..." },
        { time: 211.5, text: "Kisi mod pe bhi na yeh saath toote," },
        { time: 217.5, text: "Mere haath se tera daaman na chhoote," },
        { time: 229.5, text: "Kabhi khwaab mein bhi tu mujhse na roothe," },
        { time: 235.5, text: "Mere pyaar ki koi khushiyan na loote..." },
        { time: 241.5, text: "Mil jayein is tarah, do lehrein jis tarah," },
        { time: 253.5, text: "Phir ho na juda, haan yeh vaada raha" }
      ]
    },
    {
      title: 'Abhi Na Jao Chhod Kar',
      artist: 'Mohammed Rafi • Asha Bhosle',
      bpm: 78,
      src: 'song/Abhi Na Jao Chhod Kar Hum Dono 320 Kbps.mp3',
      cover: 'song/Screenshot 2026-10-25 065342.png',
      color: '#94a3b8',
      glow: 'rgba(148, 163, 184, 0.88)',
      glowSoft: 'rgba(148, 163, 184, 0.40)',
      lyrics: [
        { time: 15.0, text: "Abhi na jao chhod kar, ke dil abhi bhara nahi" },
        { time: 25.0, text: "Abhi abhi to aaye ho, bahar ban ke chhaaye ho" },
        { time: 35.0, text: "Hawa zara mehak to le, nazar zara behak to le" },
        { time: 45.0, text: "Ye shaam dhal to le zara, ye dil sambhal to le zara" },
        { time: 55.0, text: "Abhi na jao chhod kar, ke dil abhi bhara nahi" },
        { time: 70.0, text: "Abhi to kuch kaha nahi, abhi to kuch suna nahi" },
        { time: 80.0, text: "Suno zara hum bhi to kuch, kehna chahein tumse" },
        { time: 90.0, text: "Nigaahon mein kuch to hai, jo kehne se reh gaya" },
        { time: 100.0, text: "Agar ye dil chhoota abhi, toh phir ye pal kahaan mile" },
        { time: 115.0, text: "Abhi na jao chhod kar, ke dil abhi bhara nahi" },
        { time: 130.0, text: "Nashe mein hain ye saari raahein, teri gali ke mod pe" },
        { time: 140.0, text: "Woh chand bhi akela hai, tere mere silsile" },
        { time: 155.0, text: "Zara theher jao, na jao yun" },
        { time: 170.0, text: "Abhi na jao chhod kar, ke dil abhi bhara nahi" },
        { time: 185.0, text: "Abhi abhi to aaye ho, bahar ban ke chhaaye ho" },
        { time: 200.0, text: "Abhi na jao chhod kar..." }
      ]
    },
    {
      title: 'Somewhere Only We Know',
      artist: 'Keane',
      bpm: 86,
      src: 'song/Keane_-_Somewhere_Only_We_Know_CeeNaija.com_.mp3',
      lrcFile: 'song/Somewhere Only We Know.lrc',
      cover: 'song/Screenshot 2026-10-25 070356.png',
      color: '#f472b6',
      glow: 'rgba(244, 114, 182, 0.88)',
      glowSoft: 'rgba(244, 114, 182, 0.40)',
      lyrics: [
        { time: 14.0, text: "I walked across an empty land" },
        { time: 21.0, text: "I knew the pathway like the back of my hand" },
        { time: 29.0, text: "I felt the earth beneath my feet" },
        { time: 36.0, text: "Sat by the river and it made me complete" },
        { time: 44.0, text: "Oh, simple thing, where have you gone?" },
        { time: 52.0, text: "I'm getting old and I need something to rely on" },
        { time: 60.0, text: "So tell me when you're gonna let me in" },
        { time: 67.0, text: "I'm getting tired and I need somewhere to begin" },
        { time: 76.0, text: "I came across a fallen tree" },
        { time: 83.0, text: "I felt the branches of it looking at me" },
        { time: 90.0, text: "Is this the place we used to love?" },
        { time: 98.0, text: "Is this the place that I've been dreaming of?" },
        { time: 106.0, text: "Oh, simple thing, where have you gone?" },
        { time: 113.0, text: "I'm getting old and I need something to rely on" },
        { time: 121.0, text: "So tell me when you're gonna let me in" },
        { time: 128.0, text: "I'm getting tired and I need somewhere to begin" },
        { time: 137.0, text: "And if you have a minute, why don't we go" },
        { time: 142.0, text: "Talk about it somewhere only we know?" },
        { time: 148.0, text: "This could be the end of everything" },
        { time: 152.0, text: "So why don't we go somewhere only we know?" },
        { time: 160.0, text: "Somewhere only we know" },
        { time: 174.0, text: "Oh, simple thing, where have you gone?" },
        { time: 182.0, text: "I'm getting old and I need something to rely on" },
        { time: 190.0, text: "So tell me when you're gonna let me in" },
        { time: 197.0, text: "I'm getting tired and I need somewhere to begin" },
        { time: 205.0, text: "And if you have a minute, why don't we go" },
        { time: 210.0, text: "Talk about it somewhere only we know?" },
        { time: 216.0, text: "This could be the end of everything" },
        { time: 221.0, text: "So why don't we go somewhere only we know?" },
        { time: 229.0, text: "Somewhere only we know" }
      ]
    },
    {
      title: 'Kyon',
      artist: 'Papon • Sunidhi Chauhan',
      bpm: 84,
      src: 'song/Papon_Sunidhi_Chauhan_-_Kyun_na_hum_tum_(mp3.pm).mp3',
      lrcFile: 'song/Kyon.lrc',
      cover: 'song/Screenshot 2026-10-25 134729.png',
      color: '#38bdf8',
      glow: 'rgba(56, 189, 248, 0.88)',
      glowSoft: 'rgba(56, 189, 248, 0.40)',
      lyrics: [
        { time: 14.0, text: "Kyon na hum tum" },
        { time: 17.5, text: "Chale tedhe medhe se raston pe nange paaon re" },
        { time: 27.5, text: "Kyon na hum tum" },
        { time: 31.0, text: "Dhoondhe phoolon bhari thandi thandi dhoop ya chhaaon re" },
        { time: 41.5, text: "Aashiyana apna baadal ki chaadar pe ho" },
        { time: 48.0, text: "Khol dein sab darwaaze hawaon ke liye" },
        { time: 54.5, text: "Kyon na hum tum..." },
        { time: 68.0, text: "Halki halki si leharon pe behne lagein" },
        { time: 75.0, text: "Kahin door kinare se kehne lagein" },
        { time: 82.0, text: "Baatein aisi jo pehle kahi na gayi" },
        { time: 88.5, text: "Khamoshi bhi lagne lagi madhbhari" },
        { time: 95.5, text: "Kyon na hum tum" },
        { time: 99.0, text: "Chale tedhe medhe se raston pe nange paaon re" },
        { time: 109.0, text: "Kyon na hum tum" },
        { time: 112.5, text: "Dhoondhe phoolon bhari thandi thandi dhoop ya chhaaon re" },
        { time: 136.0, text: "Rang saare zameen ke naye lag rahe" },
        { time: 143.0, text: "Jaise taare haathon mein aake saje" },
        { time: 150.0, text: "Har kadam pe nayi ek bahaar mile" },
        { time: 156.5, text: "Aankhon mein meetha sa ik khumaar mile" },
        { time: 163.5, text: "Kyon na hum tum" },
        { time: 167.0, text: "Chale tedhe medhe se raston pe nange paaon re" },
        { time: 177.0, text: "Kyon na hum tum" },
        { time: 180.5, text: "Dhoondhe phoolon bhari thandi thandi dhoop ya chhaaon re" }
      ]
    },
    {
      title: 'Tum Hi Ho',
      artist: 'Arijit Singh • Mithoon',
      bpm: 92,
      src: 'song/Tum Hi Ho Aashiqui 2 320 Kbps.mp3',
      lrcFile: 'song/Tum Hi Ho.lrc',
      cover: 'song/Screenshot 2026-10-25 152246.png',
      color: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.88)',
      glowSoft: 'rgba(245, 158, 11, 0.40)',
      lyrics: [
        { time: 1.0, text: "Hum tere bin ab reh nahi sakte," },
        { time: 7.5, text: "Tere bina kya wajood mera?" },
        { time: 14.5, text: "Tujhse juda agar ho jayenge," },
        { time: 21.0, text: "Toh khud se hi ho jayenge juda" },
        { time: 28.5, text: "Kyunki tum hi ho, ab tum hi ho," },
        { time: 35.5, text: "Zindagi ab tum hi ho" },
        { time: 42.5, text: "Chain bhi, mera dard bhi," },
        { time: 49.5, text: "Meri aashiqui ab tum hi ho" },
        { time: 57.0, text: "Tera mera rishta hai kaisa," },
        { time: 64.0, text: "Ek pal door gawaara nahi" },
        { time: 71.0, text: "Tere liye har roz hain jeete," },
        { time: 78.0, text: "Tujhko diya mera waqt sabhi" },
        { time: 85.0, text: "Koyi lamha mera na ho tere bina," },
        { time: 92.0, text: "Har saans pe naam tera..." },
        { time: 99.0, text: "Kyunki tum hi ho, ab tum hi ho," },
        { time: 106.0, text: "Zindagi ab tum hi ho" },
        { time: 113.0, text: "Chain bhi, mera dard bhi," },
        { time: 120.0, text: "Meri aashiqui ab tum hi ho" }
      ]
    },
    {
      title: 'Aasan Nahin Yahan',
      artist: 'Arijit Singh • Jeet Gannguli',
      bpm: 80,
      src: 'song/Aasan Nahin Yahan Aashiqui 2 320 Kbps.mp3',
      lrcFile: 'song/Aasan Nahin Yahan.lrc',
      cover: 'song/Screenshot 2026-10-25 152454.png',
      color: '#c084fc',
      glow: 'rgba(192, 132, 252, 0.88)',
      glowSoft: 'rgba(192, 132, 252, 0.40)',
      lyrics: [
        { time: 16.5, text: "Aasan nahi yahan aashiq ho jaana," },
        { time: 24.5, text: "Palkon pe kaanton ko sajana..." },
        { time: 33.5, text: "Aasan nahi yahan aashiq ho jaana," },
        { time: 41.5, text: "Palkon pe kaanton ko sajana..." },
        { time: 50.0, text: "Yeh ishq nahi aasan," },
        { time: 58.5, text: "Bas itna samajh leeje" },
        { time: 67.0, text: "Ik aag ka darya hai," },
        { time: 75.5, text: "Aur doob ke jaana hai" },
        { time: 84.0, text: "Aasan nahi yahan aashiq ho jaana..." },
        { time: 101.0, text: "Waqt ke saansein chalti hain tere sang," },
        { time: 110.0, text: "Har dharhkan pe likha hai tera rang" },
        { time: 118.5, text: "Jo tu na mila toh adhoore hain hum," },
        { time: 127.0, text: "Tere bin ab na seh paayein yeh gham" }
      ]
    },
    {
      title: 'Khairiyat',
      artist: 'Arijit Singh • Pritam',
      bpm: 76,
      src: 'song/Khairiyat Chhichhore 320 Kbps.mp3',
      lrcFile: 'song/Khairiyat.lrc',
      cover: 'song/Screenshot 2026-10-25 152805.png',
      color: '#38bdf8',
      glow: 'rgba(56, 189, 248, 0.88)',
      glowSoft: 'rgba(56, 189, 248, 0.40)',
      lyrics: [
        { time: 13.5, text: "Khairiyat puchho, kabhi toh kaifiyat puchho," },
        { time: 20.0, text: "Tumhare bin deewane ka kya haal hai" },
        { time: 27.0, text: "Dil mera dekho, na meri haisiyat puchho," },
        { time: 33.5, text: "Tere bin ek din jaise sau saal hai" },
        { time: 40.5, text: "Anjaam hai tay mera," },
        { time: 44.0, text: "Hona tumhe hai mera" },
        { time: 47.0, text: "Jitni bhi hon dooriyan filhaal hain..." },
        { time: 54.0, text: "Yeh dooriyan filhaal hain..." },
        { time: 61.0, text: "Khairiyat puchho, kabhi toh kaifiyat puchho," },
        { time: 67.5, text: "Tumhare bin deewane ka kya haal hai" },
        { time: 74.5, text: "Dil mera dekho, na meri haisiyat puchho," },
        { time: 81.0, text: "Tere bin ek din jaise sau saal hai" },
        { time: 88.0, text: "Baatein zaroori hain tera milna sahi hai," },
        { time: 95.0, text: "Dil ki panahon mein tu hi toh basa hai" }
      ]
    },
    {
      title: 'Binte Dil',
      artist: 'Arijit Singh • Sanjay Leela Bhansali',
      bpm: 98,
      src: 'song/Binte Dil Padmaavat 320 Kbps.mp3',
      lrcFile: 'song/Binte Dil.lrc',
      cover: 'song/Screenshot 2026-10-25 152930.png',
      color: '#eab308',
      glow: 'rgba(234, 179, 8, 0.88)',
      glowSoft: 'rgba(234, 179, 8, 0.40)',
      lyrics: [
        { time: 15.0, text: "Binte dil misriya mein," },
        { time: 21.5, text: "Pesh hai khalish yeh..." },
        { time: 29.0, text: "Binte dil misriya mein," },
        { time: 35.5, text: "Pesh hai khalish yeh..." },
        { time: 43.0, text: "Khaab ka jahan hai," },
        { time: 49.5, text: "Zulfein bikhri hain shaam si" },
        { time: 57.0, text: "Yeh junoon hai kaisa," },
        { time: 64.0, text: "Khumaar hai kaisa jaam si" },
        { time: 71.5, text: "Binte dil misriya mein..." },
        { time: 85.0, text: "Qatra qatra beh raha hai fiza mein," },
        { time: 93.0, text: "Ishq ka nasha har ek adaa mein" },
        { time: 101.0, text: "Har lamha bekhudi ka silsila hai," },
        { time: 109.0, text: "Rooh ko meri tera sahara mila hai" }
      ]
    },
    {
      title: 'Jaiye Sajana',
      artist: 'Satinder Sartaaj • Jasmine Sandlas',
      bpm: 108,
      src: 'song/Jaiye Sajana Dhurandhar The Revenge 320 Kbps.mp3',
      lrcFile: 'song/Jaiye Sajana.lrc',
      cover: 'song/Screenshot 2026-10-26 101216.png',
      color: '#e11d48',
      glow: 'rgba(225, 29, 72, 0.88)',
      glowSoft: 'rgba(225, 29, 72, 0.40)',
      minOS: '1.1',
      lyrics: [
        { time: 8.0, text: "Pattalan chon digde hanjoo" },
        { time: 14.0, text: "Akh meri phir vi roi na..." },
        { time: 20.5, text: "Pattalan chon digde hanjoo" },
        { time: 27.0, text: "Akh meri phir vi roi na" },
        { time: 33.5, text: "Aisi preet la lai rabba" },
        { time: 39.5, text: "Jaisi hor kade hoi na..." },
        { time: 46.0, text: "Tere jaan ton main baad" },
        { time: 51.5, text: "Ik din soi na" },
        { time: 57.0, text: "Poora shehar begana" },
        { time: 62.5, text: "Ethe mera koi na" },
        { time: 68.5, text: "Phir preet kise de naal" },
        { time: 74.5, text: "Kade hoi na" },
        { time: 80.5, text: "Zamana zaalim taan vi roi na" },
        { time: 87.0, text: "Saare rang vekh lae" },
        { time: 92.5, text: "Hun koi dar nahi" },
        { time: 98.0, text: "Jiundi rahun aashiki" },
        { time: 103.5, text: "Eh kade na marni" },
        { time: 109.0, text: "Saanu saariyan visar gaiyan raahvan ve" },
        { time: 116.5, text: "Kede paase jaiye sajana..." },
        { time: 124.0, text: "Saanu saariyan visar gaiyan raahvan ve" },
        { time: 131.5, text: "Kede paase jaiye sajana..." }
      ]
    },
    {
      title: 'Time Zone',
      artist: 'Kaka',
      bpm: 96,
      src: 'song/Time Zone - Kaka.mp3',
      lrcFile: 'song/Time Zone.lrc',
      cover: 'song/Screenshot 2026-10-26 102009.png',
      color: '#f97316',
      glow: 'rgba(249, 115, 22, 0.88)',
      glowSoft: 'rgba(249, 115, 22, 0.40)',
      minOS: '1.1',
      lyrics: [
        { time: 4.5, text: "Ghari meri time dasse tere shehar da" },
        { time: 9.5, text: "Aithe adhi raat te othe deed dupehr da" },
        { time: 14.5, text: "Tere pichhe jaagne 'ch aa reha swaad" },
        { time: 19.5, text: "Waise chheti mera dil taan kitte ni thehron da" },
        { time: 25.0, text: "Dil kare aawan tere kol udd ke" },
        { time: 29.5, text: "Lake de kinare baithan naal judd ke" },
        { time: 34.5, text: "Hath phadd tera photo khichni dobara" },
        { time: 39.0, text: "Par Insta te post ni paauni mud ke" },
        { time: 44.0, text: "Aisi setting baithi ae apni" },
        { time: 48.5, text: "Suiyan khadi diyan taan ni chhediyan" },
        { time: 53.0, text: "Sacche pyaar 'chon nikalna main" },
        { time: 57.5, text: "Mere dil diyan tod bediyan" },
        { time: 62.0, text: "Mainu chat 'ch na bhej pappiyan" },
        { time: 66.5, text: "Mainu paunda ae sauraana jhappiyan" }
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
  const prevBtn = document.getElementById('music-prev-btn');
  const nextBtn = document.getElementById('music-next-btn');
  const nowPlayingWrap = document.querySelector('.apple-now-playing-container');
  const artworkContainer = document.getElementById('apple-artwork-container');
  const artworkCard = document.getElementById('music-artwork-card');
  const artworkImg = document.getElementById('music-artwork-img');
  const artworkGlow = document.getElementById('music-art-glow');
  const ambilightImg = document.getElementById('music-ambilight-img');
  const glassFrame = document.getElementById('music-glass-frame');
  const glowOuter = document.getElementById('art-glow-outer');

  // =========================================================
  // REAL-TIME 16:9 POSTER SINGLE-COLOR BEAT-SYNC ENGINE
  // High-intensity, vibrant ambient glow strictly of ONE poster color.
  // Instant snappy beat-reactive kicks & acoustic thump.
  // =========================================================
  let audioCtx = null;
  let analyser = null;
  let audioSourceNode = null;
  let beatVisualizerRafId = null;
  let currentPulse = 0;
  let prevBassEnergy = 0;
  let rollingBassAvg = 0.15;
  let gleamAngle = 45;

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
    // Preserves native hardware audio decoder for true background playback on mobile:
    // Audio will never mute or freeze when the phone is locked, display is turned off,
    // or when switching between apps!
  }

  function startBeatVisualizer() {
    if (!beatVisualizerRafId) {
      beatVisualizerRafId = requestAnimationFrame(beatVisualizerLoop);
    }
  }

  function stopBeatVisualizer() {
    if (beatVisualizerRafId) {
      cancelAnimationFrame(beatVisualizerRafId);
      beatVisualizerRafId = null;
    }
    currentPulse = 0;
    prevBassEnergy = 0;
    rollingBassAvg = 0.15;
    if (artworkGlow) {
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

    let targetEnergy = 0;
    let hasSignal = false;

    if (analyser) {
      const freqData = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(freqData);

      // Check if real audio data is flowing through bins
      let signalSum = 0;
      for (let i = 0; i < 16; i++) {
        signalSum += freqData[i];
      }

      if (signalSum > 8) {
        hasSignal = true;
        // Bins 0-1 (~0-90Hz): Sub-bass / 808
        // Bins 2-4 (~90-220Hz): Kick drum transient & punch
        // Bins 5-7 (~220-350Hz): Low-mid acoustic body
        const subBass = (freqData[0] * 1.6 + freqData[1] * 2.2) / (3.8 * 255);
        const kick = (freqData[2] * 2.4 + freqData[3] * 1.8 + freqData[4] * 1.2) / (5.4 * 255);
        const rawBass = Math.max(subBass, kick * 1.2);

        // Dynamic Moving Average Peak Detection (adapts to song volume automatically)
        rollingBassAvg = rollingBassAvg * 0.92 + rawBass * 0.08;
        const transientDelta = Math.max(0, rawBass - rollingBassAvg * 1.15);

        // Immediate punchy target energy
        targetEnergy = Math.min(1.0, rawBass * 0.55 + transientDelta * 4.2);
      }
    }

    // Song-Specific Real BPM Fallback if audio context is locked / silent
    if (!hasSignal) {
      const currentTrack = PLAYLIST[currentTrackIndex];
      const songBpm = (currentTrack && currentTrack.bpm) ? currentTrack.bpm : 92;
      const t = (performance.now() / 1000) * (songBpm / 60) * Math.PI;
      // Organic heartbeat-style pulse
      const primaryBeat = Math.pow(Math.max(0, Math.sin(t)), 4);
      const secondaryBeat = Math.pow(Math.max(0, Math.sin(t - Math.PI * 0.3)), 6) * 0.4;
      targetEnergy = Math.min(1.0, 0.20 + (primaryBeat + secondaryBeat) * 0.80);
    }

    // Snappy attack on kick hits, organic decay
    const attack = targetEnergy > currentPulse ? 0.65 : 0.16;
    currentPulse += (targetEnergy - currentPulse) * attack;

    // Multi-Attribute Dynamic Glow Flare:
    if (artworkGlow) {
      const ambilightScale = 1.0 + currentPulse * 0.18; // +18% explosive expansion
      const ambilightOpacity = 0.70 + currentPulse * 0.30;
      artworkGlow.style.transform = `scale(${ambilightScale.toFixed(3)})`;
      artworkGlow.style.opacity = ambilightOpacity.toFixed(3);
    }

    if (ambilightImg) {
      // Dynamic blur and brightness flare with kick punch
      const dynamicBlur = 28 + currentPulse * 14;
      const dynamicBrightness = 1.05 + currentPulse * 0.35;
      ambilightImg.style.filter = `blur(${dynamicBlur.toFixed(1)}px) saturate(220%) brightness(${dynamicBrightness.toFixed(2)})`;
    }

    // Option 4: Apple Vision Pro Rim Prism acceleration & specular gleam
    gleamAngle = (gleamAngle + 0.95 + currentPulse * 2.8) % 360;
    if (glassFrame) {
      glassFrame.style.setProperty('--glass-gleam-angle', gleamAngle.toFixed(1) + 'deg');
      const glassScale = 1.0 + currentPulse * 0.045;
      const gleamOpacity = 0.75 + currentPulse * 0.25;
      glassFrame.style.transform = `scale(${glassScale.toFixed(3)})`;
      if (glowOuter) {
        glowOuter.style.opacity = gleamOpacity.toFixed(3);
      }
    }

    // Acoustic Subwoofer Thump on 16:9 poster card:
    if (artworkCard && !artworkCard.classList.contains('is-depth-bg')) {
      const artScale = 1.0 + currentPulse * 0.032; // +3.2% tactile punch!
      artworkCard.style.transform = `scale(${artScale.toFixed(3)})`;
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

    // Update active equalizer in Song List if visible
    if (songlistItems) {
      const activeItem = songlistItems.querySelector('.song-list-item.is-active');
      if (activeItem) {
        activeItem.classList.toggle('is-paused', !playing);
      }
    }
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
    }

    if (view === 'lyrics') {
      stopBeatVisualizer();
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

  // Render All Songs in Song List
  function renderSongList() {
    if (!songlistItems) return;
    let html = '';

    PLAYLIST.forEach((track, idx) => {
      const isActive = idx === currentTrackIndex;
      const pausedClass = (isActive && !isPlaying) ? ' is-paused' : '';
      const activeClass = isActive ? ' is-active' : '';

      html += `
        <div class="song-list-item${activeClass}${pausedClass}" data-index="${idx}">
          <img src="${track.cover}" alt="${track.title}" class="song-item-thumb">
          <div class="song-item-info">
            <span class="song-item-title">${track.title}</span>
            <span class="song-item-artist">${track.artist}</span>
          </div>
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
    // Update Option 1 Ambilight mirrored projection image
    if (ambilightImg) {
      ambilightImg.src = track.cover;
    }
    // Update Option 4 Apple Vision Pro Traveling Specular Prism Beam color
    if (glassFrame && track.color) {
      glassFrame.style.setProperty('--poster-specular', track.glow || track.color);
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
    if (!isOS13Active()) return;
    try {
      localStorage.setItem('viev_last_track_index', String(currentTrackIndex));
      localStorage.setItem('viev_last_track_time', String(Math.floor(audio.currentTime || 0)));
      localStorage.setItem('viev_bg_playing', isPlaying ? 'true' : 'false');
    } catch(e) {}
  }

  // Handle mobile screen lock / sleep mode / tab backgrounding (OS 1.3 feature)
  document.addEventListener('visibilitychange', () => {
    if (!isOS13Active()) return;
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

  // Guard against mobile browser synthetic pause on screen lock (OS 1.3 feature)
  audio.addEventListener('pause', () => {
    persistPlaybackState();
    if (!isOS13Active()) return;
    if (document.hidden && isPlaying && !userExplicitPause) {
      // Screen was locked while playing: continue background playback smoothly!
      audio.play().catch(() => {});
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

    if (Math.floor(cur) % 2 === 0) {
      updateMediaSessionPosition();
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
  if (musicPlayBtn) {
    musicPlayBtn.addEventListener('click', () => {
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

