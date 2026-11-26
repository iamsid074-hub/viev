/* =========================================================
   SPACE 3D WORLD: ULTRA-PREMIUM LUXURY MALL LANE
   Open Walkable Boutiques • Low-Opacity Analog Joystick
   Built with Three.js • VisionOS Aesthetics
   ========================================================= */

(function () {
  'use strict';

  let container = null;
  let stageElement = null;
  let canvasWrap = null;
  let renderer = null;
  let scene = null;
  let camera = null;
  let animFrameId = null;
  let isRunning = false;

  // First-Person Camera State
  const cameraY = 1.7; // Human standing eye level
  let targetYaw = 0;
  let targetPitch = 0;
  let currentYaw = 0;
  let currentPitch = 0;

  // Movement & Joystick State
  const joystickVector = { x: 0, y: 0 };
  let isJoystickActive = false;
  let joystickTouchId = null;
  let joystickCenter = { x: 0, y: 0 };
  const JOYSTICK_MAX_RADIUS = 36;
  let walkStepTime = 0;
  const WALK_SPEED = 0.105; // Natural human walking speed

  // Keyboard Movement State (Desktop / Laptop)
  const keysPressed = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false
  };

  // Touch Look-Around State
  let isDraggingLook = false;
  const SENSITIVITY_STORAGE_KEY = 'viev_space_look_sensitivity';
  let lookSensitivity = 1.6; // Increased default mobile touch sensitivity
  try {
    const savedSens = parseFloat(localStorage.getItem(SENSITIVITY_STORAGE_KEY));
    if (isFinite(savedSens) && savedSens >= 0.5 && savedSens <= 3.0) {
      lookSensitivity = savedSens;
    }
  } catch (_) { }

  // First Shop Interactive OLED TV Audio Player & Dim-Yellow Mood Lighting State
  const firstShopAudioState = {
    audio: null,
    audioCtx: null,
    analyser: null,
    freqData: null,
    isPlaying: false,
    ledCanvas: null,
    ledCtx: null,
    ledTex: null,
    normalLight: null,
    dimYellowLight: null,
    shop0Mats: null,
    tvPos: { x: -13.9, z: -3.0 },
    lightFadeCurrent: 0,
    lightFadeTarget: 0,
    lastDrawTime: 0,
    btnBound: false
  };

  // Corridor Wall OLED LEDs Shared Looping Video & Proximity Audio State
  const corridorVideoState = {
    video: null,
    tex: null,
    tvZList: [],
    tvX: 5.91,
    unlocked: false
  };

  // Shop 2 Back-Wall OLED LED Video & Proximity Audio State
  const shop2VideoState = {
    video: null,
    tex: null,
    posterTex: null,
    mat: null,
    tvPos: { x: -13.9, z: -21.0 },
    isPlaying: false
  };

  // Shop 3 (LED3) Back-Wall OLED LED Video & Proximity Audio State
  const shop3VideoState = {
    video: null,
    tex: null,
    posterTex: null,
    mat: null,
    tvPos: { x: -13.9, z: -39.0 },
    isPlaying: false
  };

  // Per-Shop Smooth Lighting Fade State (Shops 0, 1, 2)
  const shopLightingStates = {
    0: { mats: null, normalLight: null, dimYellowLight: null, fadeCur: 0, fadeTarget: 0 },
    1: { mats: null, normalLight: null, dimYellowLight: null, fadeCur: 0, fadeTarget: 0 },
    2: { mats: null, normalLight: null, dimYellowLight: null, fadeCur: 0, fadeTarget: 0 }
  };

  // Far-End Premium Wood Wall Automatic Single Door State
  const cinemaDoorState = {
    doorGroup: null,
    doorX: 0.8,
    doorZ: -76.0,
    openProgress: 0,
    targetProgress: 0
  };
  let lookTouchId = null;
  let prevPointerX = 0;
  let prevPointerY = 0;

  // Mall Dimensions
  const MALL_WIDTH = 12;
  const MALL_HEIGHT = 6.4;
  const MALL_LENGTH = 84;
  const SHOP_DEPTH = 8; // Depth inside open shops (extends from x = -6 to x = -14)

  /**
   * Procedural High-Gloss Nero Marquina & Gold Marble Floor Texture
   * Deep charcoal-black marble with delicate gold/white veins & grid inlays
   */
  function createNeroMarquinaMarbleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Deep polished obsidian/charcoal base
    ctx.fillStyle = '#0a0c12';
    ctx.fillRect(0, 0, 1024, 1024);

    const imgData = ctx.getImageData(0, 0, 1024, 1024);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * 12;
      data[i] = Math.min(255, Math.max(0, data[i] + n + 3));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n + 3));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n + 5));
    }
    ctx.putImageData(imgData, 0, 0);

    // Warm champagne-gold marble veins
    ctx.save();
    ctx.strokeStyle = 'rgba(230, 195, 120, 0.32)';
    ctx.lineWidth = 3.5;
    ctx.filter = 'blur(1.5px)';
    ctx.beginPath();
    ctx.moveTo(0, 180);
    ctx.bezierCurveTo(280, 120, 580, 420, 1024, 340);
    ctx.moveTo(80, 820);
    ctx.bezierCurveTo(420, 580, 720, 920, 1024, 720);
    ctx.stroke();

    // Secondary delicate white crystalline veins
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.24)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(120, 0);
    ctx.bezierCurveTo(260, 380, 440, 280, 640, 1024);
    ctx.stroke();
    ctx.restore();

    // Precision architectural floor tile grid lines (Champagne gold inlay)
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.48)';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(0, 0, 1024, 1024);
    ctx.strokeRect(0, 0, 512, 512);
    ctx.strokeRect(512, 0, 512, 512);
    ctx.strokeRect(0, 512, 512, 512);
    ctx.strokeRect(512, 512, 512, 512);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 18);
    return texture;
  }

  /**
   * Procedural Polished White Calacatta Marble Apron Texture
   * Bright white marble with soft grey & warm gold veins outside boutique fronts
   */
  function createCalacattaWhiteMarbleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Luminous off-white base
    const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
    grad.addColorStop(0, '#f2f4f8');
    grad.addColorStop(0.5, '#f8f9fb');
    grad.addColorStop(1, '#edf0f5');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Natural stone grain
    const imgData = ctx.getImageData(0, 0, 1024, 1024);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * 8;
      data[i] = Math.min(255, Math.max(0, data[i] + n));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n));
    }
    ctx.putImageData(imgData, 0, 0);

    // Soft grey & gold Calacatta veining
    ctx.save();
    ctx.strokeStyle = 'rgba(120, 130, 145, 0.22)';
    ctx.lineWidth = 4;
    ctx.filter = 'blur(2.5px)';
    ctx.beginPath();
    ctx.moveTo(0, 300);
    ctx.bezierCurveTo(320, 200, 650, 600, 1024, 500);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(212, 175, 55, 0.18)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(200, 0);
    ctx.bezierCurveTo(400, 450, 700, 350, 900, 1024);
    ctx.stroke();
    ctx.restore();

    // Subtle large marble slab division seams
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, 0, 1024, 1024);
    ctx.strokeRect(0, 0, 512, 512);
    ctx.strokeRect(512, 512, 512, 512);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 18);
    return texture;
  }

  /**
   * Procedural Warm Parquet Wood Floor for Inside Boutiques
   */
  function createBoutiqueInteriorFloorTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Warm French oak chevron parquet
    ctx.fillStyle = '#261b14';
    ctx.fillRect(0, 0, 512, 512);

    for (let y = 0; y < 512; y += 32) {
      const shade = 35 + ((y % 64 === 0) ? 10 : 0);
      ctx.fillStyle = `rgb(${shade + 8}, ${shade}, ${shade - 6})`;
      ctx.fillRect(0, y, 512, 30);
    }

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = 2;
    for (let x = 0; x < 512; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 5);
    return texture;
  }

  /**
   * Procedural Boutique Interior Back Display Wall
   */
  function createBoutiqueBackWallTexture(brandName) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Rich architectural backdrop
    ctx.fillStyle = '#14161f';
    ctx.fillRect(0, 0, 1024, 512);

    // Warm golden illuminated display arch with cove lighting
    const archGrad = ctx.createRadialGradient(512, 280, 40, 512, 280, 440);
    archGrad.addColorStop(0, 'rgba(255, 235, 180, 0.45)');
    archGrad.addColorStop(0.5, 'rgba(212, 175, 55, 0.22)');
    archGrad.addColorStop(1, 'rgba(20, 22, 31, 0.95)');
    ctx.fillStyle = archGrad;
    ctx.fillRect(50, 50, 924, 440);

    // Luxury display shelving
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.65)';
    ctx.lineWidth = 4;
    ctx.strokeRect(50, 50, 924, 440);
    ctx.strokeRect(160, 200, 704, 180);

    // Illuminated brand logo on back wall
    ctx.fillStyle = '#ffd778';
    ctx.shadowColor = '#d4af37';
    ctx.shadowBlur = 14;
    ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(brandName, 512, 130);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  /**
   * Procedural Entrance Fascia Header Band (Above open entrance)
   */
  function createBoutiqueHeaderTexture(brandName) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Dark architectural facade
    ctx.fillStyle = '#11131a';
    ctx.fillRect(0, 0, 1024, 256);

    // Champagne brass border
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.7)';
    ctx.lineWidth = 6;
    ctx.strokeRect(12, 12, 1000, 232);

    // Brand name illuminated in warm gold / white
    ctx.fillStyle = '#fff4db';
    ctx.shadowColor = '#ffd27d';
    ctx.shadowBlur = 16;
    ctx.font = 'bold 44px -apple-system, BlinkMacSystemFont, "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(brandName, 512, 128);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  /**
   * Procedural Coffered Ceiling with Linear Warm LED Coves
   */
  function createArchitecturalCeilingTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#11131a';
    ctx.fillRect(0, 0, 1024, 1024);

    // Left cove slot
    const gradL = ctx.createLinearGradient(80, 0, 160, 0);
    gradL.addColorStop(0, 'rgba(255, 220, 140, 0)');
    gradL.addColorStop(0.5, 'rgba(255, 235, 180, 1)');
    gradL.addColorStop(1, 'rgba(255, 220, 140, 0)');
    ctx.fillStyle = gradL;
    ctx.fillRect(80, 0, 80, 1024);

    // Right cove slot
    const gradR = ctx.createLinearGradient(1024 - 160, 0, 1024 - 80, 0);
    gradR.addColorStop(0, 'rgba(255, 220, 140, 0)');
    gradR.addColorStop(0.5, 'rgba(255, 235, 180, 1)');
    gradR.addColorStop(1, 'rgba(255, 220, 140, 0)');
    ctx.fillStyle = gradR;
    ctx.fillRect(1024 - 160, 0, 80, 1024);

    // Center skylight slot
    const gradC = ctx.createLinearGradient(460, 0, 564, 0);
    gradC.addColorStop(0, 'rgba(255, 210, 120, 0.1)');
    gradC.addColorStop(0.5, 'rgba(255, 245, 215, 0.95)');
    gradC.addColorStop(1, 'rgba(255, 210, 120, 0.1)');
    ctx.fillStyle = gradC;
    ctx.fillRect(460, 0, 104, 1024);

    // Embedded circular downlight spotlights
    ctx.fillStyle = '#fff4db';
    ctx.shadowColor = '#ffd27d';
    ctx.shadowBlur = 18;
    for (let y = 128; y < 1024; y += 256) {
      ctx.beginPath();
      ctx.arc(320, y, 16, 0, Math.PI * 2);
      ctx.arc(704, y, 16, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 14);
    return texture;
  }

  /**
   * Procedural Far End Architectural Feature Wall Texture
   * "VIEV - Explore More" with Ambient Halo Backlight
   */
  function createFarEndFeatureTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Deep matte anthracite architectural feature panel
    ctx.fillStyle = '#0a0c12';
    ctx.fillRect(0, 0, 1024, 512);

    // Warm architectural perimeter halo illumination
    const glowGrad = ctx.createRadialGradient(512, 230, 60, 512, 230, 480);
    glowGrad.addColorStop(0, 'rgba(255, 235, 190, 0.32)');
    glowGrad.addColorStop(0.5, 'rgba(212, 175, 55, 0.14)');
    glowGrad.addColorStop(1, 'rgba(10, 12, 18, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, 1024, 512);

    // Architectural vertical slat dividers
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 2;
    for (let x = 128; x < 1024; x += 128) {
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, 492);
      ctx.stroke();
    }

    // Outer subtle gold frame
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, 944, 432);

    // Illuminated "VIEV" Signature Branding
    ctx.fillStyle = '#fff4db';
    ctx.shadowColor = '#ffd27d';
    ctx.shadowBlur = 24;
    ctx.font = 'bold 84px -apple-system, BlinkMacSystemFont, "Playfair Display", "Cinzel", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('V I E V', 512, 210);

    // "Explore More" Subtitle
    ctx.shadowBlur = 8;
    ctx.font = '500 24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillStyle = 'rgba(255, 235, 190, 0.85)';
    ctx.fillText('E X P L O R E   M O R E', 512, 280);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  // High-Resolution Photorealistic Planter Texture from User's PNG
  let planterTexture = null;
  function getPlanterTexture() {
    if (!planterTexture) {
      planterTexture = new THREE.TextureLoader().load('assets/luxury_planter.png');
      planterTexture.encoding = THREE.sRGBEncoding;
    }
    return planterTexture;
  }

  /**
   * Photorealistic Luxury Square White Planter with Lush Green Tree
   * Built from user's provided PNG asset with natural floor grounding & multi-angle cross-planes
   */
  function createLuxuryPlanter(x, z) {
    const planterGroup = new THREE.Group();

    // 1. Subtle Circular Ambient Contact Shadow on Floor
    const shadowGeo = new THREE.CircleGeometry(0.55, 18);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35
    });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.position.y = 0.005;
    planterGroup.add(shadow);

    // 2. High-Res Photorealistic Tree & Pot using User's PNG on Cross-Planes
    const foliageTex = getPlanterTexture();
    const foliageMat = new THREE.MeshStandardMaterial({
      map: foliageTex,
      transparent: true,
      alphaTest: 0.18,
      roughness: 0.65,
      metalness: 0.04,
      side: THREE.DoubleSide
    });

    const planeH = 2.1;
    const planeW = 1.74; // Matches 848x1024 aspect ratio
    const planeGeo = new THREE.PlaneGeometry(planeW, planeH);

    // Plane 1 (Facing Z)
    const m1 = new THREE.Mesh(planeGeo, foliageMat);
    m1.position.y = planeH / 2;
    planterGroup.add(m1);

    // Plane 2 (Facing X - 90 deg rotation for full 3D volumetric depth)
    const m2 = new THREE.Mesh(planeGeo, foliageMat);
    m2.rotation.y = Math.PI / 2;
    m2.position.y = planeH / 2;
    planterGroup.add(m2);

    // Plane 3 & 4 (Diagonals for full lush 3D foliage density)
    const m3 = new THREE.Mesh(planeGeo, foliageMat);
    m3.rotation.y = Math.PI / 4;
    m3.position.y = planeH / 2;
    planterGroup.add(m3);

    const m4 = new THREE.Mesh(planeGeo, foliageMat);
    m4.rotation.y = -Math.PI / 4;
    m4.position.y = planeH / 2;
    planterGroup.add(m4);

    planterGroup.position.set(x, 0, z);
    return planterGroup;
  }

  /**
   * Procedural Premium White Gallery Wall Texture with Continuous Quote
   * "WE WILL DEFINETLY GET EACH OTHER" in Deep Solid Jet-Black Typography
   * with Fluted Architectural Paneling & Floating Backlit Lightbox Displays
   */
  function createWhiteWallWithTextTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 4096;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Warm Luxury Cream Limestone Wall
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 512);
    bgGrad.addColorStop(0, '#e8dcc6');
    bgGrad.addColorStop(0.12, '#f3e9d6');
    bgGrad.addColorStop(0.88, '#f3e9d6');
    bgGrad.addColorStop(1, '#e2d4ba');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 4096, 512);

    // Subtle natural plaster/stone grain
    const imgData = ctx.getImageData(0, 0, 4096, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * 6;
      data[i] = Math.min(255, Math.max(0, data[i] + n));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n));
    }
    ctx.putImageData(imgData, 0, 0);

    // Architectural vertical fluting slat lines across entire promenade
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.035)';
    ctx.lineWidth = 2;
    for (let x = 32; x < 4096; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 14);
      ctx.lineTo(x, 498);
      ctx.stroke();
    }

    // Architectural gallery panel vertical primary divider seams
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
    ctx.lineWidth = 3;
    for (let x = 1024; x < 4096; x += 1024) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }

    // Top and bottom architectural reveal cove trim
    ctx.fillStyle = 'rgba(255, 235, 180, 0.45)';
    ctx.fillRect(0, 0, 4096, 10);
    ctx.fillStyle = 'rgba(212, 175, 55, 0.55)';
    ctx.fillRect(0, 502, 4096, 10);

    // SOLID JET-BLACK ULTRA-BOLD TYPOGRAPHY: ONE CONTINUOUS HORIZONTAL LINE AT NATURAL EYE LEVEL
    // Starts with "WE" on the left, running continuously to "OTHER" on the right
    ctx.font = '900 80px -apple-system, BlinkMacSystemFont, "Montserrat", "Cinzel", "Arial Black", "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const words = [
      { text: 'W E', x: 380 },
      { text: 'W I L L', x: 980 },
      { text: 'D E F I N E T L Y', x: 1880 },
      { text: 'G E T', x: 2700 },
      { text: 'E A C H', x: 3340 },
      { text: 'O T H E R', x: 3850 }
    ];

    const eyeLevelY = 350; // Natural human eye height (~2.0m from floor, not high up on ceiling)

    words.forEach(w => {
      // Subtle ambient contact shadow for clean architectural depth
      ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 2;

      // Heavy architectural solid jet black fill + matching stroke for maximum boldness
      ctx.fillStyle = '#050608';
      ctx.strokeStyle = '#050608';
      ctx.lineWidth = 5;
      ctx.strokeText(w.text, w.x, eyeLevelY);
      ctx.fillText(w.text, w.x, eyeLevelY);
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }

  /**
   * Build the 3D Mall Corridor Scene with Walkable Open Boutiques
   * Upgraded to Match Modern Architectural Luxury Promenade
   */
  function buildMallCorridor() {
    const halfW = MALL_WIDTH / 2; // 6 meters
    const halfH = MALL_HEIGHT / 2;
    const textureLoader = new THREE.TextureLoader();

    function setupTexture(tex) {
      tex.encoding = THREE.sRGBEncoding;
      tex.anisotropy = 16;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
      return tex;
    }

    // 1. DUAL-TONE LUXURY MARBLE FLOOR (Honed finish with minimal, silky reflection)
    // A) Central & Right Walking Lane: Honed Nero Marquina Marble (Subtle, refined reflection)
    const darkFloorWidth = 8.8;
    const darkFloorGeo = new THREE.PlaneGeometry(darkFloorWidth, MALL_LENGTH);
    darkFloorGeo.rotateX(-Math.PI / 2);
    const darkFloorMat = new THREE.MeshStandardMaterial({
      map: createNeroMarquinaMarbleTexture(),
      roughness: 0.38,
      metalness: 0.08,
      side: THREE.DoubleSide
    });
    const darkFloor = new THREE.Mesh(darkFloorGeo, darkFloorMat);
    darkFloor.position.set(halfW - darkFloorWidth / 2, 0, -MALL_LENGTH / 2 + 8);
    scene.add(darkFloor);

    // B) Left Storefront Apron: Warm Cream Marble Apron
    const whiteFloorWidth = 3.2;
    const whiteFloorGeo = new THREE.PlaneGeometry(whiteFloorWidth, MALL_LENGTH);
    whiteFloorGeo.rotateX(-Math.PI / 2);
    const whiteFloorMat = new THREE.MeshStandardMaterial({
      color: 0xf4ead8,
      map: createCalacattaWhiteMarbleTexture(),
      roughness: 0.40,
      metalness: 0.05,
      side: THREE.DoubleSide
    });
    const whiteFloor = new THREE.Mesh(whiteFloorGeo, whiteFloorMat);
    whiteFloor.position.set(-halfW + whiteFloorWidth / 2, 0.001, -MALL_LENGTH / 2 + 8);
    scene.add(whiteFloor);

    // C) Continuous Illuminated Brass Inlay Transition Strip (Separating White & Dark Floors)
    const brassStripGeo = new THREE.PlaneGeometry(0.14, MALL_LENGTH);
    brassStripGeo.rotateX(-Math.PI / 2);
    const brassStripMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.25,
      metalness: 0.85,
      emissive: new THREE.Color(0xc89d30),
      emissiveIntensity: 0.25
    });
    const brassStrip = new THREE.Mesh(brassStripGeo, brassStripMat);
    brassStrip.position.set(-halfW + whiteFloorWidth, 0.003, -MALL_LENGTH / 2 + 8);
    scene.add(brassStrip);

    // 2. Upgraded Architectural Corridor Ceiling (with Linear AC Vents & Acoustic Sound Bars)
    const corridorCeilingTex = textureLoader.load('assets/corridor_ceiling_ultra.png');
    corridorCeilingTex.encoding = THREE.sRGBEncoding;
    corridorCeilingTex.wrapS = THREE.RepeatWrapping;
    corridorCeilingTex.wrapT = THREE.RepeatWrapping;
    corridorCeilingTex.repeat.set(1, 8); // 8 seamless repeats along the 84m length
    corridorCeilingTex.anisotropy = 16;
    corridorCeilingTex.minFilter = THREE.LinearMipmapLinearFilter;
    corridorCeilingTex.magFilter = THREE.LinearFilter;

    const ceilingGeo = new THREE.PlaneGeometry(MALL_WIDTH, MALL_LENGTH);
    ceilingGeo.rotateX(Math.PI / 2);
    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0xf6ecda,
      map: corridorCeilingTex,
      roughness: 0.84,
      metalness: 0.04,
      emissive: new THREE.Color(0xf5e2be),
      emissiveIntensity: 0.14, // soft warm cream ceiling without blowing out
      side: THREE.DoubleSide
    });
    const ceilingMesh = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceilingMesh.position.set(0, MALL_HEIGHT, -MALL_LENGTH / 2 + 8);
    scene.add(ceilingMesh);

    // 3. OPEN WALKABLE LUXURY BOUTIQUES ON LEFT SIDE (SOLID 3D ARCHITECTURAL MODEL)
    const boutiqueBrands = [
      'ARANY & CO.',
      'ZARA',
      'APPLE',
      'CARTIER'
    ];
    const shopSpan = 18; // Each shop is 18m long along Z (Contiguous: +6 to -66)
    const shopWidth = SHOP_DEPTH; // Extends 8m to the left: from x = -6 to x = -14
    const xFront = -halfW; // -6.0m (promenade portal line)
    const xBack = -halfW - shopWidth; // -14.0m (rear display wall)

    // Load High-Resolution Modular Shop Textures
    const shopFloorTexture = setupTexture(textureLoader.load('assets/shop_model/shop_floor.png'));
    const shopCeilingTexture = setupTexture(textureLoader.load('assets/shop_model/shop_ceiling.png'));
    const shopBackWallTexture = setupTexture(textureLoader.load('assets/shop_model/shop_back_wall.png'));
    const shopSideWallTexture = setupTexture(textureLoader.load('assets/shop_model/shop_side_wall.png'));
    const pillarFaceTexture = setupTexture(textureLoader.load('assets/shop_model/pillar_face.png'));

    const shopFasciaTextures = {
      'ARANY & CO.': setupTexture(textureLoader.load('assets/shop_model/fascia_arany.png')),
      'ZARA': setupTexture(textureLoader.load('assets/shop_model/fascia_zara.png')),
      'APPLE': setupTexture(textureLoader.load('assets/shop_model/fascia_apple.png')),
      'CARTIER': setupTexture(textureLoader.load('assets/shop_model/fascia_cartier.png'))
    };

    const shopFloorMat = new THREE.MeshStandardMaterial({
      map: shopFloorTexture,
      roughness: 0.15,
      metalness: 0.22,
      side: THREE.FrontSide
    });

    const shopCeilingMat = new THREE.MeshStandardMaterial({
      map: shopCeilingTexture,
      roughness: 0.35,
      metalness: 0.15,
      emissive: new THREE.Color(0xffedd0),
      emissiveIntensity: 0.45,
      side: THREE.FrontSide
    });

    // Pure Clean Matte Cream Ceiling for All Shops (No Yellow Strips, No Spotlight Blobs)
    function createFirstShopCleanCeilingTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');

      // Clean smooth warm cream architectural ceiling base
      ctx.fillStyle = '#efe5d2';
      ctx.fillRect(0, 0, 2048, 1024);

      // Ultra-subtle recessed architectural shadow-line perimeter reveal (no yellow light strips)
      ctx.strokeStyle = 'rgba(130, 110, 82, 0.22)';
      ctx.lineWidth = 4;
      ctx.strokeRect(48, 48, 1952, 928);

      const tex = new THREE.CanvasTexture(canvas);
      tex.encoding = THREE.sRGBEncoding;
      tex.anisotropy = 16;
      return tex;
    }

    const firstShopCeilingTex = createFirstShopCleanCeilingTexture();
    const firstShopCeilingMat = new THREE.MeshStandardMaterial({
      map: firstShopCeilingTex,
      roughness: 0.88,
      metalness: 0.02,
      emissive: new THREE.Color(0xefe2ca),
      emissiveIntensity: 0.08,
      side: THREE.FrontSide
    });

    // Refined Luxury 3-Wall Designs for All Shops (Tonal Parisian Boiserie, Sculpted Fluted Walnut, Satin-Bronze Trim — No Yellow Strips)
    function createFirstShopBackWallTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');

      // 1. Honed Cream Travertine Base
      const bg = ctx.createLinearGradient(0, 0, 0, 1024);
      bg.addColorStop(0, '#e6dac4');
      bg.addColorStop(0.5, '#f0e6d3');
      bg.addColorStop(1, '#e1d3ba');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 2048, 1024);

      // Subtle horizontal travertine stone veining
      for (let i = 0; i < 65; i++) {
        const vy = Math.random() * 940;
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(150, 128, 94, 0.07)' : 'rgba(255, 250, 240, 0.08)';
        ctx.fillRect(0, vy, 2048, 1 + Math.random() * 2);
      }

      // 2. Left & Right Sculpted Fluted Smoked-Oak Columns
      const fluteRegions = [[90, 420], [1628, 1958]];
      fluteRegions.forEach(([xStart, xEnd]) => {
        ctx.fillStyle = '#332b22';
        ctx.fillRect(xStart, 60, xEnd - xStart, 890);
        for (let fx = xStart + 6; fx < xEnd - 4; fx += 14) {
          const fg = ctx.createLinearGradient(fx, 0, fx + 12, 0);
          fg.addColorStop(0, '#221c15');
          fg.addColorStop(0.45, '#685743');
          fg.addColorStop(0.7, '#473a2c');
          fg.addColorStop(1, '#1e1812');
          ctx.fillStyle = fg;
          ctx.fillRect(fx, 64, 11, 882);
        }
        // Slim satin-bronze trim
        ctx.strokeStyle = '#b89b5e';
        ctx.lineWidth = 3;
        ctx.strokeRect(xStart, 60, xEnd - xStart, 890);
      });

      // 3. Center Architectural Tonal Boiserie & Arched Niche Feature (No Yellow Strip)
      const cx1 = 500, cx2 = 1548, cy1 = 75, cy2 = 905;
      ctx.fillStyle = '#eae0cc';
      ctx.fillRect(cx1, cy1, cx2 - cx1, cy2 - cy1);

      // Soft sculpted stone moulding frame
      ctx.strokeStyle = 'rgba(135, 115, 85, 0.45)';
      ctx.lineWidth = 5;
      ctx.strokeRect(cx1, cy1, cx2 - cx1, cy2 - cy1);
      ctx.strokeStyle = 'rgba(255, 250, 240, 0.65)';
      ctx.lineWidth = 2;
      ctx.strokeRect(cx1 + 6, cy1 + 6, (cx2 - cx1) - 12, (cy2 - cy1) - 12);

      // Subtle inner satin-bronze hairline frame
      ctx.strokeStyle = '#b89b5e';
      ctx.lineWidth = 2;
      ctx.strokeRect(cx1 + 28, cy1 + 28, (cx2 - cx1) - 56, (cy2 - cy1) - 56);

      // 4. Dark Nero Marble Baseboard Plinth & Satin-Bronze Hairline Reveal
      ctx.fillStyle = '#141312';
      ctx.fillRect(0, 954, 2048, 70);
      ctx.fillStyle = '#b89b5e';
      ctx.fillRect(0, 950, 2048, 4);

      const tex = new THREE.CanvasTexture(canvas);
      tex.encoding = THREE.sRGBEncoding;
      tex.anisotropy = 16;
      return tex;
    }

    function createFirstShopSideWallTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');

      // 1. Matching Honed Cream Travertine Base
      const bg = ctx.createLinearGradient(0, 0, 0, 1024);
      bg.addColorStop(0, '#e6dac4');
      bg.addColorStop(0.5, '#f0e6d3');
      bg.addColorStop(1, '#e1d3ba');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 1024, 1024);

      for (let i = 0; i < 40; i++) {
        const vy = Math.random() * 940;
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(150, 128, 94, 0.07)' : 'rgba(255, 250, 240, 0.08)';
        ctx.fillRect(0, vy, 1024, 1 + Math.random() * 2);
      }

      // 2. Sculpted Tonal Parisian Boiserie Panels (Clean Recessed Relief, No Heavy Black Boxes, No Yellow Strips)
      const bays = [[52, 290], [354, 670], [734, 972]];
      bays.forEach(([bx1, bx2], idx) => {
        const bw = bx2 - bx1;
        // Upper tall panel & lower dado wainscot panel
        const sections = [
          [75, 635],  // upper panel
          [695, 210]  // lower dado panel
        ];
        sections.forEach(([sy, sh]) => {
          ctx.fillStyle = '#eae0cc';
          ctx.fillRect(bx1, sy, bw, sh);

          // Soft stone shadow & highlight bevel
          ctx.strokeStyle = 'rgba(135, 115, 85, 0.42)';
          ctx.lineWidth = 4;
          ctx.strokeRect(bx1, sy, bw, sh);
          ctx.strokeStyle = 'rgba(255, 250, 240, 0.65)';
          ctx.lineWidth = 2;
          ctx.strokeRect(bx1 + 5, sy + 5, bw - 10, sh - 10);

          // Delicate satin-bronze inner hairline
          ctx.strokeStyle = 'rgba(184, 155, 94, 0.65)';
          ctx.lineWidth = 2;
          ctx.strokeRect(bx1 + 18, sy + 18, bw - 36, sh - 36);
        });
      });

      // 3. Two Slim Vertical Fluted Smoked-Oak Pilasters between Bays (No Yellow Strips)
      [310, 690].forEach(px => {
        ctx.fillStyle = '#332b22';
        ctx.fillRect(px, 60, 24, 890);
        for (let fx = px + 2; fx < px + 22; fx += 7) {
          ctx.fillStyle = '#5a4b3a';
          ctx.fillRect(fx, 64, 4, 882);
        }
        ctx.strokeStyle = '#b89b5e';
        ctx.lineWidth = 2;
        ctx.strokeRect(px, 60, 24, 890);
      });

      // 4. Matching Dark Nero Marble Baseboard Plinth & Satin-Bronze Hairline Reveal
      ctx.fillStyle = '#141312';
      ctx.fillRect(0, 954, 1024, 70);
      ctx.fillStyle = '#b89b5e';
      ctx.fillRect(0, 950, 1024, 4);

      const tex = new THREE.CanvasTexture(canvas);
      tex.encoding = THREE.sRGBEncoding;
      tex.anisotropy = 16;
      return tex;
    }

    const firstShopBackWallMat = new THREE.MeshStandardMaterial({
      map: createFirstShopBackWallTexture(),
      roughness: 0.72,
      metalness: 0.08,
      emissive: new THREE.Color(0x2b2010),
      emissiveIntensity: 0.08,
      side: THREE.FrontSide
    });

    const firstShopSideWallMat = new THREE.MeshStandardMaterial({
      map: createFirstShopSideWallTexture(),
      roughness: 0.74,
      metalness: 0.06,
      emissive: new THREE.Color(0x2b2010),
      emissiveIntensity: 0.08,
      side: THREE.FrontSide
    });

    const shopBackWallMat = new THREE.MeshStandardMaterial({
      map: shopBackWallTexture,
      roughness: 0.3,
      metalness: 0.2,
      emissive: new THREE.Color(0xffdfa0),
      emissiveIntensity: 0.28,
      side: THREE.FrontSide
    });

    const shopSideWallMat = new THREE.MeshStandardMaterial({
      map: shopSideWallTexture,
      roughness: 0.35,
      metalness: 0.2,
      emissive: new THREE.Color(0xffe8ba),
      emissiveIntensity: 0.22,
      side: THREE.FrontSide
    });

    // Solid dark marble material for structural pillar returns, soffits & returns
    const darkPillarMat = new THREE.MeshStandardMaterial({
      color: 0x111318,
      roughness: 0.22,
      metalness: 0.35
    });

    const pillarFaceMat = new THREE.MeshStandardMaterial({
      map: pillarFaceTexture,
      roughness: 0.2,
      metalness: 0.3,
      emissive: new THREE.Color(0xffdf9e),
      emissiveIntensity: 0.35
    });

    // Black Tinted Luxury Architectural Glass & Hardware Materials
    const tintedGlassMat = new THREE.MeshStandardMaterial({
      color: 0x07090e, // sleek midnight smoked black tint
      roughness: 0.05,
      metalness: 0.90,
      transparent: true,
      opacity: 0.40,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    const glassFrameMat = new THREE.MeshStandardMaterial({
      color: 0x161820,
      roughness: 0.28,
      metalness: 0.85
    });

    const goldHandleMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.18,
      metalness: 0.92,
      emissive: new THREE.Color(0xb58e28),
      emissiveIntensity: 0.35
    });

    // Cream Textured Woven Jute Curtain Material & Pleated 3D Drapery Helper
    function createCreamJuteCurtainTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      // Warm cream natural jute base
      ctx.fillStyle = '#eadec9';
      ctx.fillRect(0, 0, 512, 512);

      // Subtle vertical drapery shading bands
      for (let x = 0; x < 512; x += 32) {
        const g = ctx.createLinearGradient(x, 0, x + 32, 0);
        g.addColorStop(0, 'rgba(135, 112, 78, 0.14)');
        g.addColorStop(0.5, 'rgba(255, 250, 240, 0.10)');
        g.addColorStop(1, 'rgba(135, 112, 78, 0.14)');
        ctx.fillStyle = g;
        ctx.fillRect(x, 0, 32, 512);
      }

      // Authentic woven jute warp & weft cross-hatch threads
      for (let y = 0; y < 512; y += 3) {
        ctx.fillStyle = (y % 6 === 0) ? 'rgba(165, 140, 102, 0.22)' : 'rgba(255, 248, 235, 0.16)';
        ctx.fillRect(0, y, 512, 1.5);
      }
      for (let x = 0; x < 512; x += 3) {
        ctx.fillStyle = (x % 6 === 0) ? 'rgba(150, 126, 90, 0.20)' : 'rgba(250, 242, 224, 0.14)';
        ctx.fillRect(x, 0, 1.5, 512);
      }

      // Organic jute slub fibers for tactile fabric realism
      for (let i = 0; i < 450; i++) {
        const sx = Math.random() * 512;
        const sy = Math.random() * 512;
        const len = 6 + Math.random() * 18;
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(140, 115, 78, 0.24)' : 'rgba(255, 250, 238, 0.22)';
        if (Math.random() > 0.5) {
          ctx.fillRect(sx, sy, len, 1);
        } else {
          ctx.fillRect(sx, sy, 1, len);
        }
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.encoding = THREE.sRGBEncoding;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 3);
      tex.anisotropy = 16;
      return tex;
    }

    const creamJuteCurtainMat = new THREE.MeshStandardMaterial({
      map: createCreamJuteCurtainTexture(),
      color: 0xf2e7d3,
      roughness: 0.94,
      metalness: 0.0,
      side: THREE.DoubleSide
    });

    function createPleatedCurtainGeometry(widthZ, heightY, pleats) {
      const segZ = pleats * 6;
      const geo = new THREE.PlaneGeometry(widthZ, heightY, segZ, 1);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const px = pos.getX(i); // along curtain width
        const norm = (px / widthZ) + 0.5;
        const depthWave = Math.sin(norm * pleats * Math.PI * 2) * 0.085;
        pos.setZ(i, depthWave);
      }
      geo.rotateY(Math.PI / 2); // span along Z, waves along X
      geo.computeVertexNormals();
      return geo;
    }

    // Helper: Build seamless mathematical quad buffer geometry joining all 4 corners perfectly
    function createModularQuad(pTL, pTR, pBL, pBR) {
      const geo = new THREE.BufferGeometry();
      const positions = new Float32Array([
        pTL[0], pTL[1], pTL[2],
        pBL[0], pBL[1], pBL[2],
        pTR[0], pTR[1], pTR[2],

        pTR[0], pTR[1], pTR[2],
        pBL[0], pBL[1], pBL[2],
        pBR[0], pBR[1], pBR[2]
      ]);
      const uvs = new Float32Array([
        0, 1, // TL
        0, 0, // BL
        1, 1, // TR

        1, 1, // TR
        0, 0, // BL
        1, 0  // BR
      ]);
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
      geo.computeVertexNormals();
      return geo;
    }

    const fasciaHeight = 1.6; // from y = 4.8m to y = 6.4m
    const fasciaDepth = 0.5;  // from x = -6.0m to x = -6.5m
    const pillarWidth = 1.0;  // 1m wide pillars along Z
    const openEntranceHeight = MALL_HEIGHT - fasciaHeight; // 4.8m clear walking height

    // Contiguous shop placement: each shop joins the next with ZERO GAP
    for (let i = 0; i < boutiqueBrands.length; i++) {
      const brand = boutiqueBrands[i];
      const zStart = 6 - i * shopSpan; // 6, -12, -30, -48
      const zEnd = zStart - shopSpan;  // -12, -30, -48, -66
      const zCenter = (zStart + zEnd) / 2;

      // Shops 0, 1, 2 use cloned materials so each shop's lights/surfaces can fade independently
      let curFloorMat = shopFloorMat;
      let curCeilingMat = firstShopCeilingMat;
      let curBackWallMat = firstShopBackWallMat;
      let curSideWallMat = firstShopSideWallMat;
      if (i <= 2) {
        curFloorMat = shopFloorMat.clone();
        curCeilingMat = firstShopCeilingMat.clone();
        curBackWallMat = firstShopBackWallMat.clone();
        curSideWallMat = firstShopSideWallMat.clone();
        shopLightingStates[i].mats = {
          floor: curFloorMat,
          ceiling: curCeilingMat,
          backWall: curBackWallMat,
          sideWall: curSideWallMat
        };
      }

      // A) Boutique Interior Polished Marble Floor (Perfect joint at y = 0.01)
      const floorGeo = createModularQuad(
        [xBack, 0.01, zStart], // TL: Back-North
        [xBack, 0.01, zEnd],   // TR: Back-South
        [xFront, 0.01, zStart],// BL: Front-North
        [xFront, 0.01, zEnd]   // BR: Front-South
      );
      const shopFloor = new THREE.Mesh(floorGeo, curFloorMat);
      scene.add(shopFloor);

      // B) Boutique Interior Recessed Tray Ceiling (Perfect joint at y = MALL_HEIGHT)
      const ceilGeo = createModularQuad(
        [xFront, MALL_HEIGHT, zStart],// TL: Front-North
        [xFront, MALL_HEIGHT, zEnd],  // TR: Front-South
        [xBack, MALL_HEIGHT, zStart], // BL: Back-North
        [xBack, MALL_HEIGHT, zEnd]    // BR: Back-South
      );
      const shopCeiling = new THREE.Mesh(ceilGeo, curCeilingMat);
      scene.add(shopCeiling);

      // C) Boutique Back Display Wall at x = xBack (-14.0m)
      const backWallGeo = createModularQuad(
        [xBack, MALL_HEIGHT, zStart], // TL: Top-North
        [xBack, MALL_HEIGHT, zEnd],   // TR: Top-South
        [xBack, 0, zStart],           // BL: Bottom-North
        [xBack, 0, zEnd]              // BR: Bottom-South
      );
      const backWall = new THREE.Mesh(backWallGeo, curBackWallMat);
      scene.add(backWall);

      // C.1. Large Wall-Mounted OLED LED Screen Centered on Each Shop's Back Wall
      const shopLedW = 7.6;
      const shopLedH = 3.6;
      const shopLedY = 3.1;
      const shopLedRimT = 0.055;
      const shopLedRimD = 0.065;
      const shopLedChassisMat = new THREE.MeshStandardMaterial({
        color: 0x101218,
        roughness: 0.22,
        metalness: 0.88
      });
      const shopLedGlassMat = new THREE.MeshStandardMaterial({
        color: 0x040508,
        roughness: 0.06,
        metalness: 0.88
      });
      const shopLedDotMat = new THREE.MeshStandardMaterial({
        color: 0xffd54f,
        emissive: new THREE.Color(0xffb800),
        emissiveIntensity: 1.4,
        roughness: 0.2
      });

      // Recessed wall-mount spacer bracket
      const shopLedMount = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, shopLedH * 0.55, shopLedW * 0.65),
        shopLedChassisMat
      );
      shopLedMount.position.set(xBack + 0.025, shopLedY, zCenter);
      scene.add(shopLedMount);

      // Brushed dark-metal backing chassis (spaced cleanly behind screen to prevent mobile Z-fighting)
      const shopLedChassis = new THREE.Mesh(
        new THREE.BoxGeometry(0.024, shopLedH, shopLedW),
        shopLedChassisMat
      );
      shopLedChassis.position.set(xBack + 0.055, shopLedY, zCenter);
      scene.add(shopLedChassis);

      // Raised slim 4-sided perimeter bezel frame
      const sTopRim = new THREE.Mesh(new THREE.BoxGeometry(shopLedRimD, shopLedRimT, shopLedW + shopLedRimT * 2), shopLedChassisMat);
      sTopRim.position.set(xBack + 0.078, shopLedY + shopLedH / 2 + shopLedRimT / 2, zCenter);
      scene.add(sTopRim);

      const sBotRim = new THREE.Mesh(new THREE.BoxGeometry(shopLedRimD, shopLedRimT, shopLedW + shopLedRimT * 2), shopLedChassisMat);
      sBotRim.position.set(xBack + 0.078, shopLedY - shopLedH / 2 - shopLedRimT / 2, zCenter);
      scene.add(sBotRim);

      const sLeftRim = new THREE.Mesh(new THREE.BoxGeometry(shopLedRimD, shopLedH, shopLedRimT), shopLedChassisMat);
      sLeftRim.position.set(xBack + 0.078, shopLedY, zCenter + shopLedW / 2 + shopLedRimT / 2);
      scene.add(sLeftRim);

      const sRightRim = new THREE.Mesh(new THREE.BoxGeometry(shopLedRimD, shopLedH, shopLedRimT), shopLedChassisMat);
      sRightRim.position.set(xBack + 0.078, shopLedY, zCenter - shopLedW / 2 - shopLedRimT / 2);
      scene.add(sRightRim);

      // Large OLED glass panel facing +X (Shop 1: Audio Visualizer, Shop 2: Video, Shops 3-4: Blank OLED)
      const shopLedScreenGeo = new THREE.PlaneGeometry(shopLedW, shopLedH);
      shopLedScreenGeo.rotateY(Math.PI / 2);
      let activeScreenMat = shopLedGlassMat;
      if (i === 0) {
        initFirstShopTvAudio();
        activeScreenMat = new THREE.MeshStandardMaterial({
          map: firstShopAudioState.ledTex,
          emissiveMap: firstShopAudioState.ledTex,
          emissive: new THREE.Color(0xffffff),
          emissiveIntensity: 0.95,
          roughness: 0.08,
          metalness: 0.15,
          polygonOffset: true,
          polygonOffsetFactor: -2,
          polygonOffsetUnits: -2
        });
      } else if (i === 1) {
        if (!shop2VideoState.video) {
          const s2Poster = setupTexture(textureLoader.load('assets/video/shop2_poster.jpg'));
          const s2Vid = document.createElement('video');
          s2Vid.src = 'assets/video/shop2_led.mp4';
          s2Vid.loop = true;
          s2Vid.muted = false;
          s2Vid.playsInline = true;
          s2Vid.setAttribute('playsinline', '');
          s2Vid.preload = 'metadata';
          s2Vid.volume = 0.45;

          const s2Tex = new THREE.VideoTexture(s2Vid);
          s2Tex.encoding = THREE.sRGBEncoding;
          s2Tex.minFilter = THREE.LinearFilter;
          s2Tex.magFilter = THREE.LinearFilter;

          shop2VideoState.video = s2Vid;
          shop2VideoState.tex = s2Tex;
          shop2VideoState.posterTex = s2Poster;
          shop2VideoState.tvPos = { x: xBack + 0.098, z: zCenter };

          s2Vid.addEventListener('playing', () => {
            if (shop2VideoState.mat && shop2VideoState.tex) {
              shop2VideoState.mat.map = shop2VideoState.tex;
              shop2VideoState.mat.emissiveMap = shop2VideoState.tex;
              shop2VideoState.mat.needsUpdate = true;
            }
          });
        }
        activeScreenMat = new THREE.MeshStandardMaterial({
          map: shop2VideoState.posterTex,
          emissiveMap: shop2VideoState.posterTex,
          emissive: new THREE.Color(0xffffff),
          emissiveIntensity: 0.92,
          roughness: 0.08,
          metalness: 0.15,
          polygonOffset: true,
          polygonOffsetFactor: -2,
          polygonOffsetUnits: -2
        });
        shop2VideoState.mat = activeScreenMat;
      } else if (i === 2) {
        if (!shop3VideoState.video) {
          const s3Poster = setupTexture(textureLoader.load('assets/video/shop3_poster.jpg'));
          const s3Vid = document.createElement('video');
          s3Vid.src = 'assets/video/shop3_led.mp4';
          s3Vid.loop = true;
          s3Vid.muted = false;
          s3Vid.playsInline = true;
          s3Vid.setAttribute('playsinline', '');
          s3Vid.preload = 'metadata';
          s3Vid.volume = 0.45;

          const s3Tex = new THREE.VideoTexture(s3Vid);
          s3Tex.encoding = THREE.sRGBEncoding;
          s3Tex.minFilter = THREE.LinearFilter;
          s3Tex.magFilter = THREE.LinearFilter;

          shop3VideoState.video = s3Vid;
          shop3VideoState.tex = s3Tex;
          shop3VideoState.posterTex = s3Poster;
          shop3VideoState.tvPos = { x: xBack + 0.098, z: zCenter };

          s3Vid.addEventListener('playing', () => {
            if (shop3VideoState.mat && shop3VideoState.tex) {
              shop3VideoState.mat.map = shop3VideoState.tex;
              shop3VideoState.mat.emissiveMap = shop3VideoState.tex;
              shop3VideoState.mat.needsUpdate = true;
            }
          });
        }
        activeScreenMat = new THREE.MeshStandardMaterial({
          map: shop3VideoState.posterTex,
          emissiveMap: shop3VideoState.posterTex,
          emissive: new THREE.Color(0xffffff),
          emissiveIntensity: 0.92,
          roughness: 0.08,
          metalness: 0.15,
          polygonOffset: true,
          polygonOffsetFactor: -2,
          polygonOffsetUnits: -2
        });
        shop3VideoState.mat = activeScreenMat;
      }
      const shopLedScreen = new THREE.Mesh(shopLedScreenGeo, activeScreenMat);
      shopLedScreen.position.set(xBack + 0.098, shopLedY, zCenter);
      scene.add(shopLedScreen);

      // Tiny standby indicator LED dot on bottom-right bezel
      const shopLedDot = new THREE.Mesh(
        new THREE.BoxGeometry(0.015, 0.02, 0.05),
        shopLedDotMat
      );
      shopLedDot.position.set(xBack + 0.112, shopLedY - shopLedH / 2 - shopLedRimT / 2, zCenter - shopLedW / 2 + 0.22);
      scene.add(shopLedDot);

      // D) Boutique Dividing Side Walls
      // North Side Wall (at z = zStart)
      const northWallGeo = createModularQuad(
        [xFront, MALL_HEIGHT, zStart], // TL: Front-Top
        [xBack, MALL_HEIGHT, zStart],  // TR: Back-Top
        [xFront, 0, zStart],           // BL: Front-Bottom
        [xBack, 0, zStart]             // BR: Back-Bottom
      );
      const northSideWall = new THREE.Mesh(northWallGeo, curSideWallMat);
      scene.add(northSideWall);

      // South Side Wall (at z = zEnd)
      const southWallGeo = createModularQuad(
        [xBack, MALL_HEIGHT, zEnd],    // TL: Back-Top
        [xFront, MALL_HEIGHT, zEnd],   // TR: Front-Top
        [xBack, 0, zEnd],              // BL: Back-Bottom
        [xFront, 0, zEnd]              // BR: Front-Bottom
      );
      const southSideWall = new THREE.Mesh(southWallGeo, curSideWallMat);
      scene.add(southSideWall);

      // E) Solid 3D Overhead Fascia Beam across entrance (y = 4.8 to 6.4, x = -6.0 to -6.5)
      // Front face is 4K crystal-clear brand signage; other faces are deep polished dark marble
      const fasciaTexture = shopFasciaTextures[brand] || shopFasciaTextures['ARANY & CO.'];
      const fasciaFrontMat = new THREE.MeshStandardMaterial({
        map: fasciaTexture,
        roughness: 0.2,
        metalness: 0.25,
        emissive: new THREE.Color(0xffdf9e),
        emissiveIntensity: 0.28
      });

      // Box materials: [+x, -x, +y, -y, +z, -z]
      const fasciaBoxMats = [
        fasciaFrontMat, // +X: facing corridor (crystal clear 4K brand fascia)
        darkPillarMat,  // -X: facing into boutique
        darkPillarMat,  // +Y: top meeting ceiling
        darkPillarMat,  // -Y: underside entrance soffit
        darkPillarMat,  // +Z: north end
        darkPillarMat   // -Z: south end
      ];
      const fasciaGeo = new THREE.BoxGeometry(fasciaDepth, fasciaHeight, shopSpan);
      const fasciaMesh = new THREE.Mesh(fasciaGeo, fasciaBoxMats);
      fasciaMesh.position.set(xFront - fasciaDepth / 2, MALL_HEIGHT - fasciaHeight / 2, zCenter);
      scene.add(fasciaMesh);

      // F) Solid Architectural Left & Right Pillars with Vertical Warm LED Channels
      // Pillar materials: [+x, -x, +y, -y, +z, -z]
      const pillarMats = [
        pillarFaceMat, // +X: front face with vertical warm LED channel
        darkPillarMat, // -X: back return
        darkPillarMat, // +Y: top
        darkPillarMat, // -Y: bottom
        darkPillarMat, // +Z: side
        darkPillarMat  // -Z: inner entrance jamb
      ];
      const pillarGeo = new THREE.BoxGeometry(fasciaDepth, MALL_HEIGHT, pillarWidth);

      // Left Pillar (North side of entrance)
      const leftPillar = new THREE.Mesh(pillarGeo, pillarMats);
      leftPillar.position.set(xFront - fasciaDepth / 2, halfH, zStart - pillarWidth / 2);
      scene.add(leftPillar);

      // Right Pillar (South side of entrance)
      const rightPillar = new THREE.Mesh(pillarGeo, pillarMats);
      rightPillar.position.set(xFront - fasciaDepth / 2, halfH, zEnd + pillarWidth / 2);
      scene.add(rightPillar);

      // G) Black Tinted Glass Storefront & Open Glass Doors (Walkable Interior Entrance)
      const xGlass = xFront - 0.12; // 12cm recessed behind front portal face
      const doorWidth = 2.0;        // width of each door leaf
      const doorwayWidth = 4.4;     // 4.4m wide central entrance
      const doorHeight = 3.6;       // 3.6m tall glass doors
      const transomHeight = openEntranceHeight - doorHeight; // 1.2m glass transom
      const paneZSpan = (shopSpan - 2.0 * pillarWidth - doorwayWidth) / 2; // 5.8m each pane

      // 1. North Fixed Tinted Glass Pane
      const northPaneCenterZ = zCenter + doorwayWidth / 2 + paneZSpan / 2;
      const northPaneGeo = new THREE.PlaneGeometry(paneZSpan, openEntranceHeight);
      northPaneGeo.rotateY(Math.PI / 2);
      const northPane = new THREE.Mesh(northPaneGeo, tintedGlassMat);
      northPane.position.set(xGlass, openEntranceHeight / 2, northPaneCenterZ);
      scene.add(northPane);

      // North Pane Slim Metal Frames (bottom runner, top runner, doorway mullion)
      const northBottomRunner = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, paneZSpan), glassFrameMat);
      northBottomRunner.position.set(xGlass, 0.04, northPaneCenterZ);
      scene.add(northBottomRunner);

      const northTopRunner = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, paneZSpan), glassFrameMat);
      northTopRunner.position.set(xGlass, openEntranceHeight - 0.04, northPaneCenterZ);
      scene.add(northTopRunner);

      const northDoorJamb = new THREE.Mesh(new THREE.BoxGeometry(0.06, openEntranceHeight, 0.06), glassFrameMat);
      northDoorJamb.position.set(xGlass, openEntranceHeight / 2, zCenter + doorwayWidth / 2);
      scene.add(northDoorJamb);

      // 2. South Fixed Tinted Glass Pane
      const southPaneCenterZ = zCenter - doorwayWidth / 2 - paneZSpan / 2;
      const southPaneGeo = new THREE.PlaneGeometry(paneZSpan, openEntranceHeight);
      southPaneGeo.rotateY(Math.PI / 2);
      const southPane = new THREE.Mesh(southPaneGeo, tintedGlassMat);
      southPane.position.set(xGlass, openEntranceHeight / 2, southPaneCenterZ);
      scene.add(southPane);

      // South Pane Slim Metal Frames
      const southBottomRunner = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, paneZSpan), glassFrameMat);
      southBottomRunner.position.set(xGlass, 0.04, southPaneCenterZ);
      scene.add(southBottomRunner);

      const southTopRunner = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, paneZSpan), glassFrameMat);
      southTopRunner.position.set(xGlass, openEntranceHeight - 0.04, southPaneCenterZ);
      scene.add(southTopRunner);

      const southDoorJamb = new THREE.Mesh(new THREE.BoxGeometry(0.06, openEntranceHeight, 0.06), glassFrameMat);
      southDoorJamb.position.set(xGlass, openEntranceHeight / 2, zCenter - doorwayWidth / 2);
      scene.add(southDoorJamb);

      // 2.5. Interior Cream Textured Jute Curtains Behind Fixed Tinted Glass Panes (Leaving Main Doorway Clear!)
      const xCurtain = xGlass - 0.16; // mounted cleanly inside the shop behind the tinted glass
      const curtainHeight = openEntranceHeight - 0.08;
      const curtainGeo = createPleatedCurtainGeometry(paneZSpan - 0.08, curtainHeight, 16);

      // North Interior Cream Jute Curtain & Top Track
      const northCurtain = new THREE.Mesh(curtainGeo, creamJuteCurtainMat);
      northCurtain.position.set(xCurtain, curtainHeight / 2 + 0.02, northPaneCenterZ);
      scene.add(northCurtain);

      const northCurtainTrack = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, paneZSpan), glassFrameMat);
      northCurtainTrack.position.set(xCurtain, openEntranceHeight - 0.04, northPaneCenterZ);
      scene.add(northCurtainTrack);

      // South Interior Cream Jute Curtain & Top Track
      const southCurtain = new THREE.Mesh(curtainGeo, creamJuteCurtainMat);
      southCurtain.position.set(xCurtain, curtainHeight / 2 + 0.02, southPaneCenterZ);
      scene.add(southCurtain);

      const southCurtainTrack = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, paneZSpan), glassFrameMat);
      southCurtainTrack.position.set(xCurtain, openEntranceHeight - 0.04, southPaneCenterZ);
      scene.add(southCurtainTrack);

      // 3. Overhead Glass Transom Panel (above open doors: y = 3.6m to 4.8m)
      const transomGeo = new THREE.PlaneGeometry(doorwayWidth, transomHeight);
      transomGeo.rotateY(Math.PI / 2);
      const transomMesh = new THREE.Mesh(transomGeo, tintedGlassMat);
      transomMesh.position.set(xGlass, doorHeight + transomHeight / 2, zCenter);
      scene.add(transomMesh);

      const transomBar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, doorwayWidth), glassFrameMat);
      transomBar.position.set(xGlass, doorHeight, zCenter);
      scene.add(transomBar);

      // 4. Grand Open Glass Doors (Swung open inwards into the boutique interior!)
      // A) North Glass Door (swung inward)
      const northDoorGroup = new THREE.Group();
      northDoorGroup.position.set(xGlass, 0, zCenter + doorwayWidth / 2 - 0.04);
      northDoorGroup.rotation.y = -Math.PI * 0.36; // 65 degrees swung open into store

      const northDoorLeafGeo = new THREE.PlaneGeometry(doorWidth, doorHeight - 0.04);
      northDoorLeafGeo.rotateY(Math.PI / 2);
      const northDoorLeaf = new THREE.Mesh(northDoorLeafGeo, tintedGlassMat);
      northDoorLeaf.position.set(0, doorHeight / 2, -doorWidth / 2);
      northDoorGroup.add(northDoorLeaf);

      const northDoorTop = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, doorWidth), glassFrameMat);
      northDoorTop.position.set(0, doorHeight - 0.03, -doorWidth / 2);
      northDoorGroup.add(northDoorTop);

      const northDoorBot = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, doorWidth), glassFrameMat);
      northDoorBot.position.set(0, 0.04, -doorWidth / 2);
      northDoorGroup.add(northDoorBot);

      const northDoorEdge = new THREE.Mesh(new THREE.BoxGeometry(0.04, doorHeight, 0.04), glassFrameMat);
      northDoorEdge.position.set(0, doorHeight / 2, -doorWidth + 0.02);
      northDoorGroup.add(northDoorEdge);

      // Luxury vertical gold tubular pull handle
      const handleGeo = new THREE.CylinderGeometry(0.018, 0.018, 1.4, 16);
      const northHandle = new THREE.Mesh(handleGeo, goldHandleMat);
      northHandle.position.set(0.035, 1.4, -doorWidth + 0.22);
      northDoorGroup.add(northHandle);

      scene.add(northDoorGroup);

      // B) South Glass Door (swung inward)
      const southDoorGroup = new THREE.Group();
      southDoorGroup.position.set(xGlass, 0, zCenter - doorwayWidth / 2 + 0.04);
      southDoorGroup.rotation.y = Math.PI * 0.36; // 65 degrees swung open into store

      const southDoorLeafGeo = new THREE.PlaneGeometry(doorWidth, doorHeight - 0.04);
      southDoorLeafGeo.rotateY(Math.PI / 2);
      const southDoorLeaf = new THREE.Mesh(southDoorLeafGeo, tintedGlassMat);
      southDoorLeaf.position.set(0, doorHeight / 2, doorWidth / 2);
      southDoorGroup.add(southDoorLeaf);

      const southDoorTop = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, doorWidth), glassFrameMat);
      southDoorTop.position.set(0, doorHeight - 0.03, doorWidth / 2);
      southDoorGroup.add(southDoorTop);

      const southDoorBot = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, doorWidth), glassFrameMat);
      southDoorBot.position.set(0, 0.04, doorWidth / 2);
      southDoorGroup.add(southDoorBot);

      const southDoorEdge = new THREE.Mesh(new THREE.BoxGeometry(0.04, doorHeight, 0.04), glassFrameMat);
      southDoorEdge.position.set(0, doorHeight / 2, doorWidth - 0.02);
      southDoorGroup.add(southDoorEdge);

      const southHandle = new THREE.Mesh(handleGeo, goldHandleMat);
      southHandle.position.set(0.035, 1.4, doorWidth - 0.22);
      southDoorGroup.add(southHandle);

      scene.add(southDoorGroup);

      // H) 3D Luxury Green Planter outside each Boutique Pillar
      const boutiquePlanter = createLuxuryPlanter(-halfW + 0.85, zStart - pillarWidth / 2);
      scene.add(boutiquePlanter);

      // H) Warm Glowing Boutique Interior Lighting (Uniform across all shops)
      const shopLight = new THREE.PointLight(0xfff0d4, 1.15, 22, 1.8);
      shopLight.position.set(-halfW - shopWidth / 2, MALL_HEIGHT - 1.0, zCenter);
      scene.add(shopLight);

      if (i <= 2) {
        shopLightingStates[i].normalLight = shopLight;
        const dimYellowLight = new THREE.PointLight(0xffb41f, 0, 18, 2.0);
        dimYellowLight.position.set(-halfW - shopWidth / 2, MALL_HEIGHT - 1.2, zCenter);
        scene.add(dimYellowLight);
        shopLightingStates[i].dimYellowLight = dimYellowLight;
      }
    }

    // 4. RIGHT ARCHITECTURAL GALLERY WALL WITH JET-BLACK QUOTE & BACKLIT FRAMES
    // Built with exact left-to-right UV mapping & normal facing into corridor ([-1, 0, 0])
    // so text is 100% upright, un-mirrored, and reads naturally from left to right!
    const rightWallGeo = new THREE.BufferGeometry();
    const halfL = MALL_LENGTH / 2; // 42m
    const wallPositions = new Float32Array([
      // Triangle 1: TL, TR, BL
      0, halfH, halfL, // TL (x=0, y=3.2, z=+42)
      0, halfH, -halfL, // TR (x=0, y=3.2, z=-42)
      0, -halfH, halfL, // BL (x=0, y=-3.2, z=+42)

      // Triangle 2: TR, BR, BL
      0, halfH, -halfL, // TR (x=0, y=3.2, z=-42)
      0, -halfH, -halfL, // BR (x=0, y=-3.2, z=-42)
      0, -halfH, halfL  // BL (x=0, y=-3.2, z=+42)
    ]);

    const wallUVs = new Float32Array([
      // Triangle 1: TL (z=+42), TR (z=-42), BL (z=+42)
      1, 1, // TL (entrance)
      0, 1, // TR (far end)
      1, 0, // BL (entrance)

      // Triangle 2: TR (z=-42), BR (z=-42), BL (z=+42)
      0, 1, // TR (far end)
      0, 0, // BR (far end)
      1, 0  // BL (entrance)
    ]);

    rightWallGeo.setAttribute('position', new THREE.BufferAttribute(wallPositions, 3));
    rightWallGeo.setAttribute('uv', new THREE.BufferAttribute(wallUVs, 2));
    rightWallGeo.computeVertexNormals();

    const rightWallMat = new THREE.MeshStandardMaterial({
      color: 0xf5ead6,
      map: createWhiteWallWithTextTexture(),
      roughness: 0.88,
      metalness: 0.01,
      side: THREE.FrontSide
    });
    const rightWall = new THREE.Mesh(rightWallGeo, rightWallMat);
    rightWall.position.set(halfW, halfH, -MALL_LENGTH / 2 + 8);
    scene.add(rightWall);

    // 4.1. Right Wall & Ceiling Junction: Glowing Yellow Architectural Cove & Sconce Lamps
    const corniceZ = -MALL_LENGTH / 2 + 8;
    const corniceHousingMat = new THREE.MeshStandardMaterial({
      color: 0x1a1814,
      roughness: 0.35,
      metalness: 0.65
    });
    const yellowLampGlowMat = new THREE.MeshStandardMaterial({
      color: 0xffdc5e,
      emissive: new THREE.Color(0xffbe1a),
      emissiveIntensity: 1.5,
      roughness: 0.2,
      metalness: 0.05
    });

    // Slim backing rail along the right wall-ceiling seam (behind/above lamp so lamp glows clearly into corridor)
    const rightCorniceRail = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.04, MALL_LENGTH),
      corniceHousingMat
    );
    rightCorniceRail.position.set(halfW - 0.03, MALL_HEIGHT - 0.03, corniceZ);
    scene.add(rightCorniceRail);

    // Continuous glowing yellow linear cove lamp facing directly into the corridor & downward
    const rightCoveLamp = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.055, MALL_LENGTH),
      yellowLampGlowMat
    );
    rightCoveLamp.position.set(halfW - 0.06, MALL_HEIGHT - 0.08, corniceZ);
    scene.add(rightCoveLamp);

    // Minimal linear architectural sconce lamps with downward/forward glowing yellow diffusers
    const rightLampZList = [2, -12, -26, -40, -54, -68];
    const sconceBodyGeo = new THREE.BoxGeometry(0.10, 0.045, 1.5);
    const sconceGlowGeo = new THREE.BoxGeometry(0.11, 0.055, 1.44);
    rightLampZList.forEach(lz => {
      const sconceBody = new THREE.Mesh(sconceBodyGeo, corniceHousingMat);
      sconceBody.position.set(halfW - 0.055, MALL_HEIGHT - 0.24, lz);
      scene.add(sconceBody);

      // Glowing yellow lamp tube placed below & in front of the bracket so it visibly glows yellow
      const sconceGlow = new THREE.Mesh(sconceGlowGeo, yellowLampGlowMat);
      sconceGlow.position.set(halfW - 0.075, MALL_HEIGHT - 0.29, lz);
      scene.add(sconceGlow);

      // Warm yellow ambient wash onto the upper right cream wall & ceiling corner
      const yellowWash = new THREE.PointLight(0xffc93c, 0.58, 11, 2.0);
      yellowWash.position.set(halfW - 0.45, MALL_HEIGHT - 0.42, lz);
      scene.add(yellowWash);
    });

    // 4.2. Real Wall-Mounted OLED LED TV Panels on Right Wall Opposite Every Shop (Looping Video + Proximity Low Audio)
    if (!corridorVideoState.video) {
      const vid = document.createElement('video');
      vid.src = 'assets/video/corridor_led.mp4';
      vid.loop = true;
      vid.muted = true; // start muted so browser autoplay always succeeds, then unmute on interaction
      vid.playsInline = true;
      vid.setAttribute('playsinline', '');
      vid.preload = 'auto';
      vid.volume = 0;

      const vTex = new THREE.VideoTexture(vid);
      vTex.encoding = THREE.sRGBEncoding;
      vTex.minFilter = THREE.LinearFilter;
      vTex.magFilter = THREE.LinearFilter;

      corridorVideoState.video = vid;
      corridorVideoState.tex = vTex;
      corridorVideoState.tvX = halfW - 0.088;

      const unlockCorridorAudio = () => {
        if (corridorVideoState.unlocked) return;
        corridorVideoState.unlocked = true;
        vid.muted = false;
        vid.play().catch(() => { });
      };
      window.addEventListener('pointerdown', unlockCorridorAudio, { once: true, passive: true });
      window.addEventListener('keydown', unlockCorridorAudio, { once: true, passive: true });

      // Attempt immediate unmuted play since openSpace() is triggered by user click
      vid.play().then(() => {
        vid.muted = false;
        corridorVideoState.unlocked = true;
      }).catch(() => {
        vid.muted = true;
        vid.play().catch(() => { });
      });
    }

    const oledMountMat = new THREE.MeshStandardMaterial({
      color: 0x16181e,
      roughness: 0.45,
      metalness: 0.75
    });
    const oledChassisMat = new THREE.MeshStandardMaterial({
      color: 0x101218,
      roughness: 0.22,
      metalness: 0.88
    });
    const oledGlassMat = new THREE.MeshStandardMaterial({
      map: corridorVideoState.tex,
      emissiveMap: corridorVideoState.tex,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 0.92,
      roughness: 0.08,
      metalness: 0.15,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2
    });
    const oledStandbyDotMat = new THREE.MeshStandardMaterial({
      color: 0xffd54f,
      emissive: new THREE.Color(0xffb800),
      emissiveIntensity: 1.4,
      roughness: 0.2
    });

    const ledWidth = 5.0;
    const ledHeight = 2.4;
    const ledCenterY = 4.25; // Cleanly above eye-level quote (y ~ 2.0m) and below yellow lamps (y ~ 6.1m)
    const rimT = 0.045;      // Slim 4.5cm outer bezel rim thickness
    const rimD = 0.055;      // Chassis depth

    corridorVideoState.tvZList = [];
    boutiqueBrands.forEach((brand, i) => {
      const zStart = 6 - i * shopSpan;
      const zEnd = zStart - shopSpan;
      const zCenter = (zStart + zEnd) / 2;
      corridorVideoState.tvZList.push(zCenter);

      // 1. Recessed Wall-Mount Bracket (gives authentic floating shadow gap off the cream wall)
      const wallMount = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, ledHeight * 0.55, ledWidth * 0.65),
        oledMountMat
      );
      wallMount.position.set(halfW - 0.025, ledCenterY, zCenter);
      scene.add(wallMount);

      // 2. Main Ultra-Slim Brushed Metal Backing Chassis (spaced cleanly behind glass to prevent mobile Z-fighting)
      const chassisBox = new THREE.Mesh(
        new THREE.BoxGeometry(0.024, ledHeight, ledWidth),
        oledChassisMat
      );
      chassisBox.position.set(halfW - 0.055, ledCenterY, zCenter);
      scene.add(chassisBox);

      // 3. Raised Slim Perimeter Bezel Frame (Top, Bottom, Left, Right)
      const topRim = new THREE.Mesh(new THREE.BoxGeometry(rimD, rimT, ledWidth + rimT * 2), oledChassisMat);
      topRim.position.set(halfW - 0.078, ledCenterY + ledHeight / 2 + rimT / 2, zCenter);
      scene.add(topRim);

      const botRim = new THREE.Mesh(new THREE.BoxGeometry(rimD, rimT, ledWidth + rimT * 2), oledChassisMat);
      botRim.position.set(halfW - 0.078, ledCenterY - ledHeight / 2 - rimT / 2, zCenter);
      scene.add(botRim);

      const leftRim = new THREE.Mesh(new THREE.BoxGeometry(rimD, ledHeight, rimT), oledChassisMat);
      leftRim.position.set(halfW - 0.078, ledCenterY, zCenter + ledWidth / 2 + rimT / 2);
      scene.add(leftRim);

      const rightRim = new THREE.Mesh(new THREE.BoxGeometry(rimD, ledHeight, rimT), oledChassisMat);
      rightRim.position.set(halfW - 0.078, ledCenterY, zCenter - ledWidth / 2 - rimT / 2);
      scene.add(rightRim);

      // 4. Glossy OLED Video Panel (3.1cm clear of backing chassis so it never blinks from afar on mobile)
      const glassGeo = new THREE.PlaneGeometry(ledWidth, ledHeight);
      glassGeo.rotateY(-Math.PI / 2);
      const glassMesh = new THREE.Mesh(glassGeo, oledGlassMat);
      glassMesh.position.set(halfW - 0.098, ledCenterY, zCenter);
      scene.add(glassMesh);

      // 5. Tiny Standby Power Indicator Pin-LED on Bottom-Right Bezel
      const standbyDot = new THREE.Mesh(
        new THREE.BoxGeometry(0.015, 0.018, 0.04),
        oledStandbyDotMat
      );
      standbyDot.position.set(halfW - 0.106, ledCenterY - ledHeight / 2 - rimT / 2, zCenter - ledWidth / 2 + 0.18);
      scene.add(standbyDot);
    });

    // Luxury Planters placed rhythmically along the Right Gallery Wall
    const rightPlanterZList = [4, -16, -36, -56, -72];
    rightPlanterZList.forEach(pz => {
      const p = createLuxuryPlanter(halfW - 0.7, pz);
      scene.add(p);
    });

    // 5. FAR END LARGE PREMIUM WOOD WALL, AUTOMATIC DOUBLE DOORS & EMPTY CINEMA HALL
    const zEndWall = -MALL_LENGTH + 8; // -76.0m
    cinemaDoorState.doorZ = zEndWall;

    // Close left corridor wall cleanly between Shop 4 (-66m) and Wood Wall (-76m)
    const leftTailGeo = new THREE.PlaneGeometry(10.0, MALL_HEIGHT);
    leftTailGeo.rotateY(Math.PI / 2);
    const leftTailWall = new THREE.Mesh(leftTailGeo, firstShopSideWallMat);
    leftTailWall.position.set(-halfW, halfH, -71.0);
    scene.add(leftTailWall);

    function createPremiumWoodWallTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');

      // Deep rich walnut wood base
      const baseGrad = ctx.createLinearGradient(0, 0, 1024, 0);
      baseGrad.addColorStop(0, '#3a2414');
      baseGrad.addColorStop(0.5, '#4b301b');
      baseGrad.addColorStop(1, '#362112');
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, 1024, 1024);

      // Vertical architectural wood slat grooves & natural grain
      for (let x = 0; x < 1024; x += 24) {
        const g = ctx.createLinearGradient(x, 0, x + 24, 0);
        g.addColorStop(0, 'rgba(20, 10, 4, 0.45)');
        g.addColorStop(0.2, 'rgba(110, 72, 42, 0.22)');
        g.addColorStop(0.75, 'rgba(58, 36, 18, 0.10)');
        g.addColorStop(1, 'rgba(18, 9, 4, 0.50)');
        ctx.fillStyle = g;
        ctx.fillRect(x, 0, 24, 1024);
      }

      // Fine organic wood grain streaks
      for (let i = 0; i < 420; i++) {
        const gx = Math.random() * 1024;
        const gy = Math.random() * 1024;
        const gh = 40 + Math.random() * 160;
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(25, 12, 5, 0.16)' : 'rgba(130, 88, 52, 0.12)';
        ctx.fillRect(gx, gy, 1.5, gh);
      }

      // Subtle brushed-brass horizontal reveal trims
      ctx.fillStyle = 'rgba(205, 168, 92, 0.55)';
      ctx.fillRect(0, 28, 1024, 4);
      ctx.fillRect(0, 992, 1024, 4);

      const tex = new THREE.CanvasTexture(canvas);
      tex.encoding = THREE.sRGBEncoding;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.anisotropy = 16;
      return tex;
    }

    function createPremiumDoorLeafTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#362112';
      ctx.fillRect(0, 0, 512, 1024);

      for (let i = 0; i < 240; i++) {
        const gx = Math.random() * 512;
        const gy = Math.random() * 1024;
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(18, 9, 4, 0.22)' : 'rgba(115, 76, 44, 0.14)';
        ctx.fillRect(gx, gy, 2, 50 + Math.random() * 120);
      }

      // Sculpted luxury double-panel geometric brass inlay
      [[48, 54, 416, 560], [48, 650, 416, 310]].forEach(([px, py, pw, ph]) => {
        ctx.fillStyle = '#2b1a0d';
        ctx.fillRect(px, py, pw, ph);
        ctx.strokeStyle = '#c8a04d';
        ctx.lineWidth = 4;
        ctx.strokeRect(px, py, pw, ph);
        ctx.strokeStyle = 'rgba(220, 185, 105, 0.45)';
        ctx.lineWidth = 2;
        ctx.strokeRect(px + 14, py + 14, pw - 28, ph - 28);
      });

      const tex = new THREE.CanvasTexture(canvas);
      tex.encoding = THREE.sRGBEncoding;
      tex.anisotropy = 16;
      return tex;
    }

    const woodWallTex = createPremiumWoodWallTexture();
    const woodWallMat = new THREE.MeshStandardMaterial({
      map: woodWallTex,
      roughness: 0.52,
      metalness: 0.08
    });
    const doorLeafMat = new THREE.MeshStandardMaterial({
      map: createPremiumDoorLeafTexture(),
      roughness: 0.42,
      metalness: 0.12
    });
    const doorBrassTrimMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.22,
      metalness: 0.88,
      emissive: new THREE.Color(0x6e5415),
      emissiveIntensity: 0.18
    });

    const doorCenterX = 0.8; // Right-side entry single door centered at x = +0.8m (-0.4m to +2.0m)
    const doorOpenW = 2.4;   // 2.4m wide grand single doorway
    const doorOpenH = 4.4;   // 4.4m tall grand single doorway
    const woodWallDepth = 0.45;
    const leftWoodW = (doorCenterX - doorOpenW / 2) - (-halfW); // 5.6m (-6.0 to -0.4)
    const rightWoodW = halfW - (doorCenterX + doorOpenW / 2);   // 4.0m (+2.0 to +6.0)

    // Left Wood Wall Wing
    const leftWoodWall = new THREE.Mesh(
      new THREE.BoxGeometry(leftWoodW, MALL_HEIGHT, woodWallDepth),
      woodWallMat
    );
    leftWoodWall.position.set(-halfW + leftWoodW / 2, halfH, zEndWall);
    scene.add(leftWoodWall);

    // Right Wood Wall Wing
    const rightWoodWall = new THREE.Mesh(
      new THREE.BoxGeometry(rightWoodW, MALL_HEIGHT, woodWallDepth),
      woodWallMat
    );
    rightWoodWall.position.set(halfW - rightWoodW / 2, halfH, zEndWall);
    scene.add(rightWoodWall);

    // Overhead Wood Header above Single Door
    const headerWoodH = MALL_HEIGHT - doorOpenH; // 2.0m
    const topWoodWall = new THREE.Mesh(
      new THREE.BoxGeometry(doorOpenW, headerWoodH, woodWallDepth),
      woodWallMat
    );
    topWoodWall.position.set(doorCenterX, doorOpenH + headerWoodH / 2, zEndWall);
    scene.add(topWoodWall);

    // Brushed Brass Architectural Door Frame Architrave
    const frameThick = 0.12;
    const frameDepth = woodWallDepth + 0.06;
    const leftFrame = new THREE.Mesh(new THREE.BoxGeometry(frameThick, doorOpenH, frameDepth), doorBrassTrimMat);
    leftFrame.position.set(doorCenterX - doorOpenW / 2 + frameThick / 2, doorOpenH / 2, zEndWall);
    scene.add(leftFrame);

    const rightFrame = new THREE.Mesh(new THREE.BoxGeometry(frameThick, doorOpenH, frameDepth), doorBrassTrimMat);
    rightFrame.position.set(doorCenterX + doorOpenW / 2 - frameThick / 2, doorOpenH / 2, zEndWall);
    scene.add(rightFrame);

    const topFrame = new THREE.Mesh(new THREE.BoxGeometry(doorOpenW, frameThick, frameDepth), doorBrassTrimMat);
    topFrame.position.set(doorCenterX, doorOpenH - frameThick / 2, zEndWall);
    scene.add(topFrame);

    // Premium Automatic Single Door (Hinged at Left Jamb, swinging smoothly inward into Stair Corridor)
    const leafW = doorOpenW - frameThick * 2 - 0.02; // ~2.14m wide single door leaf
    const leafH = doorOpenH - frameThick - 0.02;
    const leafThick = 0.10;
    const cinemaHandleGeo = new THREE.CylinderGeometry(0.026, 0.026, 1.55, 16);

    const singleCinemaDoorGroup = new THREE.Group();
    singleCinemaDoorGroup.position.set(doorCenterX - doorOpenW / 2 + frameThick, 0, zEndWall);
    const singleLeafMesh = new THREE.Mesh(new THREE.BoxGeometry(leafW, leafH, leafThick), doorLeafMat);
    singleLeafMesh.position.set(leafW / 2, leafH / 2 + 0.01, 0);
    singleCinemaDoorGroup.add(singleLeafMesh);
    // Front & back vertical brass pull handles on the latch side
    const sHandleF = new THREE.Mesh(cinemaHandleGeo, doorBrassTrimMat);
    sHandleF.position.set(leafW - 0.22, 1.45, leafThick / 2 + 0.045);
    singleCinemaDoorGroup.add(sHandleF);
    const sHandleB = new THREE.Mesh(cinemaHandleGeo, doorBrassTrimMat);
    sHandleB.position.set(leafW - 0.22, 1.45, -(leafThick / 2 + 0.045));
    singleCinemaDoorGroup.add(sHandleB);
    scene.add(singleCinemaDoorGroup);

    cinemaDoorState.doorGroup = singleCinemaDoorGroup;
    cinemaDoorState.doorX = doorCenterX;

    // 5.1. RIGHT-SIDE ENTRY WALLED STAIRCASE (>10 STEPS, HIGH RISE) & AUDITORIUM CINEMA HALL (z = -76m to -105m)
    const hallW = 24.0;
    const hallL = 29.0;
    const hallH = 16.5;
    const hallMinX = -20.8;
    const hallMaxX = 3.2; // Right wall sits beside the right-side entry corridor
    const hallCenterX = (hallMinX + hallMaxX) / 2; // -8.8m
    const hallCenterZ = zEndWall - hallL / 2;      // -90.5m

    const stairCorridorMinX = -1.6; // Left stair wall keeps same 4.8m width all the way up the stairs
    const stairCorridorW = hallMaxX - stairCorridorMinX; // 4.8m (-1.6m to +3.2m)
    const stairCenterX = (stairCorridorMinX + hallMaxX) / 2; // +0.8m (aligned with single door)

    const hallFloorMat = new THREE.MeshStandardMaterial({
      color: 0x0f1016,
      roughness: 0.92,
      metalness: 0.05
    });
    const hallWallMat = new THREE.MeshStandardMaterial({
      color: 0x13141c,
      roughness: 0.85,
      metalness: 0.08,
      side: THREE.DoubleSide
    });
    const hallCeilingMat = new THREE.MeshStandardMaterial({
      color: 0x0b0c10,
      roughness: 0.9,
      metalness: 0.05,
      side: THREE.DoubleSide
    });
    const stepLedMat = new THREE.MeshStandardMaterial({
      color: 0xffd269,
      emissive: new THREE.Color(0xe5a825),
      emissiveIntensity: 0.95,
      roughness: 0.25
    });

    // Entry Landing Floor inside Stair Corridor (z = -76m to -79m, flat y = 0)
    const landingDepth = 3.0;
    const landingGeo = new THREE.PlaneGeometry(stairCorridorW, landingDepth);
    landingGeo.rotateX(-Math.PI / 2);
    const landingFloor = new THREE.Mesh(landingGeo, hallFloorMat);
    landingFloor.position.set(stairCenterX, 0.004, zEndWall - landingDepth / 2);
    scene.add(landingFloor);

    // 14 High-Rise Upstairs Stairs inside Walled Right-Side Corridor (z = -79.0m to -95.8m, y = 0.35m to +4.90m)
    const stairCount = 14;
    const stairDepth = 1.2;
    const stairRise = 0.35;
    const totalStairHeight = stairCount * stairRise; // 4.90m
    const stairStartZ = zEndWall - landingDepth;     // -79.0m
    const stairEndZ = stairStartZ - stairCount * stairDepth; // -95.8m

    for (let s = 0; s < stairCount; s++) {
      const topY = (s + 1) * stairRise;
      const tierZ = stairStartZ - s * stairDepth - stairDepth / 2;

      const stepBox = new THREE.Mesh(
        new THREE.BoxGeometry(stairCorridorW, topY, stairDepth),
        hallFloorMat
      );
      stepBox.position.set(stairCenterX, topY / 2, tierZ);
      scene.add(stepBox);

      // Warm dim-yellow LED step-edge nose strip across the stair width
      const stepLed = new THREE.Mesh(
        new THREE.BoxGeometry(stairCorridorW - 0.12, 0.035, 0.05),
        stepLedMat
      );
      stepLed.position.set(stairCenterX, topY + 0.008, tierZ + stairDepth / 2 - 0.03);
      scene.add(stepLed);
    }

    // Left Stair Wall (at x = -1.6m, same distance till the stairs end: z = -76.0m to -95.8m)
    const stairWallLen = zEndWall - stairEndZ; // 19.8m
    const stairLeftWallGeo = new THREE.PlaneGeometry(stairWallLen, hallH);
    stairLeftWallGeo.rotateY(Math.PI / 2);
    const stairLeftWall = new THREE.Mesh(stairLeftWallGeo, hallWallMat);
    stairLeftWall.position.set(stairCorridorMinX, hallH / 2, zEndWall - stairWallLen / 2);
    scene.add(stairLeftWall);

    // Flat Upper Cinema Hall Cross-Walkway & Top Terrace after the Stairs End (z = -95.8m to -105.0m, flat y = 4.90m)
    const flatHallLen = stairEndZ - (zEndWall - hallL); // 9.2m
    const flatUpperDeck = new THREE.Mesh(
      new THREE.BoxGeometry(hallW, totalStairHeight, flatHallLen),
      hallFloorMat
    );
    flatUpperDeck.position.set(hallCenterX, totalStairHeight / 2, stairEndZ - flatHallLen / 2);
    scene.add(flatUpperDeck);

    // Front Auditorium Stage Floor beside the Stairs (x = -20.8m to -1.6m, z = -76.0m to -83.0m, y = 0)
    const audW = stairCorridorMinX - hallMinX; // 19.2m
    const audCenterX = (hallMinX + stairCorridorMinX) / 2; // -11.2m
    const audStageGeo = new THREE.PlaneGeometry(audW, 7.0);
    audStageGeo.rotateX(-Math.PI / 2);
    const audStageFloor = new THREE.Mesh(audStageGeo, hallFloorMat);
    audStageFloor.position.set(audCenterX, 0.004, zEndWall - 3.5);
    scene.add(audStageFloor);

    // Brushed-Brass Wall Handrail along Right-Side Upstairs Staircase (x = +3.04m)
    const railRun = stairCount * stairDepth; // 16.8m
    const railRise = totalStairHeight;       // 4.90m
    const railLen = Math.hypot(railRun, railRise);
    const railAngle = Math.atan2(railRise, railRun);
    const handrailMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, railLen, 12),
      doorBrassTrimMat
    );
    handrailMesh.rotation.x = Math.PI / 2 - railAngle;
    handrailMesh.position.set(hallMaxX - 0.16, 0.95 + railRise / 2, stairStartZ - railRun / 2);
    scene.add(handrailMesh);

    // High Luxury Coffered Acoustic Cinema Ceiling (y = 16.5m, fitted proportionally to 24m x 29m hall)
    const ceilCanvas = document.createElement('canvas');
    ceilCanvas.width = 256;
    ceilCanvas.height = 256;
    const cCtx = ceilCanvas.getContext('2d');
    cCtx.fillStyle = '#171412';
    cCtx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 3600; i++) {
      const shade = 18 + Math.floor(Math.random() * 14);
      cCtx.fillStyle = `rgb(${shade + 2},${shade},${shade - 2})`;
      cCtx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }
    const ceilSuedeTex = new THREE.CanvasTexture(ceilCanvas);
    ceilSuedeTex.wrapS = THREE.RepeatWrapping;
    ceilSuedeTex.wrapT = THREE.RepeatWrapping;
    ceilSuedeTex.repeat.set(6, 6);
    ceilSuedeTex.colorSpace = THREE.SRGBColorSpace;

    const ceilSoffitMat = new THREE.MeshStandardMaterial({
      map: ceilSuedeTex,
      color: 0x26211d,
      roughness: 0.86,
      metalness: 0.08
    });
    const ceilPanelMat = new THREE.MeshStandardMaterial({
      map: ceilSuedeTex,
      color: 0x1c1815,
      roughness: 0.92,
      metalness: 0.04
    });
    const ceilShadowMat = new THREE.MeshStandardMaterial({
      color: 0x070606,
      roughness: 0.95,
      metalness: 0.05
    });
    const ceilCoveLedMat = new THREE.MeshStandardMaterial({
      color: 0xffe4a8,
      emissive: new THREE.Color(0xffab36),
      emissiveIntensity: 1.55,
      roughness: 0.2
    });
    const downlightRimMat = new THREE.MeshStandardMaterial({
      color: 0x1b1815,
      roughness: 0.45,
      metalness: 0.6
    });
    const downlightDiscMat = new THREE.MeshStandardMaterial({
      color: 0xfff0cc,
      emissive: new THREE.Color(0xffcf78),
      emissiveIntensity: 1.8,
      roughness: 0.15
    });

    // Dark shadow-gap structural ceiling backing at y = hallH
    const hallCeilGeo = new THREE.PlaneGeometry(hallW, hallL);
    hallCeilGeo.rotateX(Math.PI / 2);
    const hallCeil = new THREE.Mesh(hallCeilGeo, ceilShadowMat);
    hallCeil.position.set(hallCenterX, hallH, hallCenterZ);
    scene.add(hallCeil);

    // Helper to place a 3D recessed circular ceiling downlight facing -Y
    const dlRimGeo = new THREE.RingGeometry(0.19, 0.27, 24);
    dlRimGeo.rotateX(Math.PI / 2);
    const dlDiscGeo = new THREE.CircleGeometry(0.19, 24);
    dlDiscGeo.rotateX(Math.PI / 2);
    function addCeilDownlight(x, y, z) {
      const rim = new THREE.Mesh(dlRimGeo, downlightRimMat);
      rim.position.set(x, y - 0.004, z);
      scene.add(rim);
      const disc = new THREE.Mesh(dlDiscGeo, downlightDiscMat);
      disc.position.set(x, y - 0.007, z);
      scene.add(disc);
    }

    // 1. Outer Perimeter Drop Soffit (2.1m side bands, 2.4m front/back bands, drop 0.36m)
    const outerBandW = 2.1;
    const outerBandL = 2.4;
    const outerDropH = 0.36;
    const outerDropY = hallH - outerDropH / 2;

    const soffitLeft = new THREE.Mesh(new THREE.BoxGeometry(outerBandW, outerDropH, hallL), ceilSoffitMat);
    soffitLeft.position.set(hallMinX + outerBandW / 2, outerDropY, hallCenterZ);
    scene.add(soffitLeft);

    const soffitRight = new THREE.Mesh(new THREE.BoxGeometry(outerBandW, outerDropH, hallL), ceilSoffitMat);
    soffitRight.position.set(hallMaxX - outerBandW / 2, outerDropY, hallCenterZ);
    scene.add(soffitRight);

    const innerOpenW = hallW - outerBandW * 2; // 19.8m
    const soffitFront = new THREE.Mesh(new THREE.BoxGeometry(innerOpenW, outerDropH, outerBandL), ceilSoffitMat);
    soffitFront.position.set(hallCenterX, outerDropY, zEndWall - outerBandL / 2);
    scene.add(soffitFront);

    const soffitBack = new THREE.Mesh(new THREE.BoxGeometry(innerOpenW, outerDropH, outerBandL), ceilSoffitMat);
    soffitBack.position.set(hallCenterX, outerDropY, zEndWall - hallL + outerBandL / 2);
    scene.add(soffitBack);

    // 4 Recessed Downlights along Left & Right Outer Soffit Bands
    const outerLightZs = [-80.2, -87.0, -94.0, -100.8];
    outerLightZs.forEach((lz) => {
      addCeilDownlight(hallMinX + outerBandW / 2, hallH - outerDropH, lz);
      addCeilDownlight(hallMaxX - outerBandW / 2, hallH - outerDropH, lz);
    });

    // 2. Perimeter Warm-Gold Cove LED Reveal around Inner Opening (19.8m x 24.2m)
    const innerOpenL = hallL - outerBandL * 2; // 24.2m
    const coveY = hallH - 0.18;
    const coveLedThick = 0.08;
    [
      { w: coveLedThick, l: innerOpenL, x: hallCenterX - innerOpenW / 2 + 0.05, z: hallCenterZ },
      { w: coveLedThick, l: innerOpenL, x: hallCenterX + innerOpenW / 2 - 0.05, z: hallCenterZ },
      { w: innerOpenW, l: coveLedThick, x: hallCenterX, z: hallCenterZ + innerOpenL / 2 - 0.05 },
      { w: innerOpenW, l: coveLedThick, x: hallCenterX, z: hallCenterZ - innerOpenL / 2 + 0.05 }
    ].forEach((seg) => {
      const coveLed = new THREE.Mesh(new THREE.BoxGeometry(seg.w, 0.07, seg.l), ceilCoveLedMat);
      coveLed.position.set(seg.x, coveY, seg.z);
      scene.add(coveLed);
    });

    // 3. Inner Drop Frame (1.35m band inside cove, creating deep recessed coffer reveal)
    const innerBand = 1.35;
    const innerGap = 0.32; // Recessed cove gap between outer soffit and inner frame
    const frameW = innerOpenW - innerGap * 2; // 19.16m
    const frameL = innerOpenL - innerGap * 2; // 23.56m
    const frameDropH = 0.28;
    const frameDropY = hallH - frameDropH / 2;

    const frameLeft = new THREE.Mesh(new THREE.BoxGeometry(innerBand, frameDropH, frameL), ceilSoffitMat);
    frameLeft.position.set(hallCenterX - frameW / 2 + innerBand / 2, frameDropY, hallCenterZ);
    scene.add(frameLeft);

    const frameRight = new THREE.Mesh(new THREE.BoxGeometry(innerBand, frameDropH, frameL), ceilSoffitMat);
    frameRight.position.set(hallCenterX + frameW / 2 - innerBand / 2, frameDropY, hallCenterZ);
    scene.add(frameRight);

    const gridW = frameW - innerBand * 2; // 16.46m
    const frameFront = new THREE.Mesh(new THREE.BoxGeometry(gridW, frameDropH, innerBand), ceilSoffitMat);
    frameFront.position.set(hallCenterX, frameDropY, hallCenterZ + frameL / 2 - innerBand / 2);
    scene.add(frameFront);

    const frameBack = new THREE.Mesh(new THREE.BoxGeometry(gridW, frameDropH, innerBand), ceilSoffitMat);
    frameBack.position.set(hallCenterX, frameDropY, hallCenterZ - frameL / 2 + innerBand / 2);
    scene.add(frameBack);

    // 4. Central 4x4 Coffered Acoustic Panel Grid (16 panels with shadow gaps & 4+4 outer-column downlights)
    const gridL = frameL - innerBand * 2; // 20.86m
    const cols = 4;
    const rows = 4;
    const seamGap = 0.12;
    const panelW = (gridW - seamGap * (cols + 1)) / cols;
    const panelL = (gridL - seamGap * (rows + 1)) / rows;
    const panelThick = 0.14;
    const panelY = hallH - panelThick / 2;
    const panelGeo = new THREE.BoxGeometry(panelW, panelThick, panelL);

    for (let r = 0; r < rows; r++) {
      const pz = (hallCenterZ + gridL / 2) - seamGap - panelL / 2 - r * (panelL + seamGap);
      for (let c = 0; c < cols; c++) {
        const px = (hallCenterX - gridW / 2) + seamGap + panelW / 2 + c * (panelW + seamGap);
        const panel = new THREE.Mesh(panelGeo, ceilPanelMat);
        panel.position.set(px, panelY, pz);
        scene.add(panel);

        // Recessed circular downlights in the 2 outer coffer columns (c === 0 and c === 3)
        if (c === 0 || c === cols - 1) {
          addCeilDownlight(px, hallH - panelThick, pz);
        }
      }
    }

    // Soft warm cove wash lights illuminating the coffered ceiling contours
    const coveWash1 = new THREE.PointLight(0xffcf88, 0.75, 22, 1.8);
    coveWash1.position.set(hallCenterX - 6.0, hallH - 1.4, hallCenterZ + 5.0);
    scene.add(coveWash1);
    const coveWash2 = new THREE.PointLight(0xffcf88, 0.75, 22, 1.8);
    coveWash2.position.set(hallCenterX + 6.0, hallH - 1.4, hallCenterZ - 5.0);
    scene.add(coveWash2);

    // Back Wall (z = -114m)
    const hallBackWall = new THREE.Mesh(new THREE.PlaneGeometry(hallW, hallH), hallWallMat);
    hallBackWall.position.set(hallCenterX, hallH / 2, zEndWall - hallL);
    scene.add(hallBackWall);

    // Left & Right Cinema Walls (x = -20.8m and x = +3.2m)
    const hallSideGeo = new THREE.PlaneGeometry(hallL, hallH);
    hallSideGeo.rotateY(Math.PI / 2);
    const hallLeftWall = new THREE.Mesh(hallSideGeo, hallWallMat);
    hallLeftWall.position.set(hallMinX, hallH / 2, hallCenterZ);
    scene.add(hallLeftWall);

    const hallRightWall = new THREE.Mesh(hallSideGeo, hallWallMat);
    hallRightWall.position.set(hallMaxX, hallH / 2, hallCenterZ);
    scene.add(hallRightWall);

    // Front Return Wings closing Cinema Hall cleanly around the corridor & doorway (z = -76m)
    const hallFrontLeftW = (-halfW) - hallMinX; // 14.8m (-20.8 to -6.0)
    const hallFrontLeft = new THREE.Mesh(new THREE.PlaneGeometry(hallFrontLeftW, hallH), hallWallMat);
    hallFrontLeft.position.set(hallMinX + hallFrontLeftW / 2, hallH / 2, zEndWall);
    scene.add(hallFrontLeft);

    // Upper header return above corridor height (y = 6.4m to 12.5m at z = -76m)
    const hallFrontTop = new THREE.Mesh(new THREE.PlaneGeometry(hallMaxX - (-halfW), hallH - MALL_HEIGHT), hallWallMat);
    hallFrontTop.position.set((hallMaxX - halfW) / 2, MALL_HEIGHT + (hallH - MALL_HEIGHT) / 2, zEndWall);
    scene.add(hallFrontTop);

    // Subtle warm ambient lights inside the Staircase & Auditorium Cinema Hall
    const hallLight1 = new THREE.PointLight(0xffdfb0, 0.95, 32, 1.8);
    hallLight1.position.set(stairCenterX, 8.2, zEndWall - 11);
    scene.add(hallLight1);

    const hallLight2 = new THREE.PointLight(0xffdfb0, 1.0, 36, 1.8);
    hallLight2.position.set(audCenterX, 10.2, -89.0);
    scene.add(hallLight2);

    const hallLight3 = new THREE.PointLight(0xffdca8, 0.9, 28, 1.8);
    hallLight3.position.set(-16.0, 10.6, -98.0);
    scene.add(hallLight3);

    const hallLight4 = new THREE.PointLight(0xffe2b5, 0.95, 30, 1.8);
    hallLight4.position.set(-6.0, 10.8, -100.5);
    scene.add(hallLight4);

    // 5.2. VIEV LUXURY CINEMA SEATS BESIDE STAIRS (x = -20.8m to -1.6m, z = -83.0m to -95.8m) & TOP VIP RECLINERS
    // Shared Canvas Texture for Gold "VIEV" Headrest Branding
    const vievHeadCanvas = document.createElement('canvas');
    vievHeadCanvas.width = 256;
    vievHeadCanvas.height = 128;
    const vhCtx = vievHeadCanvas.getContext('2d');
    vhCtx.fillStyle = '#c7b299';
    vhCtx.fillRect(0, 0, 256, 128);
    vhCtx.font = '600 44px "Cinzel", Georgia, serif';
    vhCtx.textAlign = 'center';
    vhCtx.textBaseline = 'middle';
    vhCtx.fillStyle = '#e6c26e';
    vhCtx.fillText('VIEV', 128, 64);
    const vievHeadTex = new THREE.CanvasTexture(vievHeadCanvas);
    vievHeadTex.colorSpace = THREE.SRGBColorSpace;

    // Materials matching VIEV Luxury Seat Model (Champagne Leather + Glossy Obsidian Pods + Warm Gold LED + Brass)
    const seatLeatherMat = new THREE.MeshStandardMaterial({
      color: 0xc7b299,
      roughness: 0.48,
      metalness: 0.06
    });
    const seatHeadFrontMat = new THREE.MeshStandardMaterial({
      map: vievHeadTex,
      roughness: 0.48,
      metalness: 0.08
    });
    const seatObsidianMat = new THREE.MeshStandardMaterial({
      color: 0x121010,
      roughness: 0.22,
      metalness: 0.35
    });
    const seatArmLedMat = new THREE.MeshStandardMaterial({
      color: 0xffe099,
      emissive: new THREE.Color(0xffaa2b),
      emissiveIntensity: 1.35,
      roughness: 0.2
    });

    // Shared Geometries for Standard VIEV Luxury Seat (1.25m pitch)
    const seatGeo = {
      base: new THREE.BoxGeometry(0.88, 0.08, 0.72),
      cushion: new THREE.BoxGeometry(0.62, 0.24, 0.64),
      backSeg: new THREE.BoxGeometry(0.62, 0.22, 0.17),
      headrest: new THREE.BoxGeometry(0.58, 0.28, 0.19),
      headLogo: new THREE.PlaneGeometry(0.46, 0.22),
      armPod: new THREE.BoxGeometry(0.17, 0.50, 0.74),
      armPad: new THREE.BoxGeometry(0.16, 0.07, 0.60),
      armLedV: new THREE.BoxGeometry(0.025, 0.44, 0.025),
      armLedH: new THREE.BoxGeometry(0.025, 0.025, 0.56),
      cupRing: new THREE.CylinderGeometry(0.045, 0.04, 0.045, 16)
    };

    // Shared Geometries for Top VIP VIEV Special Recliner (1.60m pitch, wider + extended footrest)
    const vipGeo = {
      base: new THREE.BoxGeometry(1.08, 0.08, 0.80),
      cushion: new THREE.BoxGeometry(0.80, 0.25, 0.70),
      backSeg: new THREE.BoxGeometry(0.80, 0.24, 0.18),
      headrest: new THREE.BoxGeometry(0.74, 0.30, 0.20),
      headLogo: new THREE.PlaneGeometry(0.56, 0.25),
      footrest: new THREE.BoxGeometry(0.76, 0.14, 0.54),
      armPod: new THREE.BoxGeometry(0.20, 0.52, 0.80),
      armPad: new THREE.BoxGeometry(0.19, 0.075, 0.66),
      armLedV: new THREE.BoxGeometry(0.028, 0.46, 0.028),
      armLedH: new THREE.BoxGeometry(0.028, 0.028, 0.62),
      cupRing: new THREE.CylinderGeometry(0.05, 0.045, 0.05, 16)
    };

    function buildVievSeat(g, geo, isRecliner) {
      const recline = isRecliner ? -0.34 : -0.15;
      const armX = isRecliner ? 0.50 : 0.395;

      const base = new THREE.Mesh(geo.base, seatObsidianMat);
      base.position.set(0, 0.04, 0.0);
      g.add(base);

      const cushion = new THREE.Mesh(geo.cushion, seatLeatherMat);
      cushion.position.set(0, 0.20, 0.06);
      if (isRecliner) cushion.rotation.x = -0.05;
      g.add(cushion);

      // 3-ribbed plush leather backrest + VIEV headrest
      const backGroup = new THREE.Group();
      backGroup.position.set(0, 0.30, -0.22);
      backGroup.rotation.x = recline;
      [0.14, 0.36, 0.58].forEach((by) => {
        const seg = new THREE.Mesh(geo.backSeg, seatLeatherMat);
        seg.position.set(0, by, 0);
        backGroup.add(seg);
      });
      const head = new THREE.Mesh(geo.headrest, seatLeatherMat);
      head.position.set(0, 0.85, 0.02);
      backGroup.add(head);

      const logoPlane = new THREE.Mesh(geo.headLogo, seatHeadFrontMat);
      logoPlane.position.set(0, 0.85, 0.118);
      backGroup.add(logoPlane);
      g.add(backGroup);

      // Extended footrest for Top VIP Recliners
      if (isRecliner) {
        const foot = new THREE.Mesh(geo.footrest, seatLeatherMat);
        foot.position.set(0, 0.22, 0.64);
        foot.rotation.x = 0.42;
        g.add(foot);
      }

      // Glossy black side pods + champagne arm pads + warm gold LED strips + brass cup holder
      [-armX, armX].forEach((ax, idx) => {
        const pod = new THREE.Mesh(geo.armPod, seatObsidianMat);
        pod.position.set(ax, 0.29, 0.02);
        g.add(pod);

        const pad = new THREE.Mesh(geo.armPad, seatLeatherMat);
        pad.position.set(ax, 0.57, -0.02);
        g.add(pad);

        const innerSign = idx === 0 ? 1 : -1;
        const ledV = new THREE.Mesh(geo.armLedV, seatArmLedMat);
        ledV.position.set(ax + innerSign * 0.05, 0.30, 0.39);
        g.add(ledV);

        const ledH = new THREE.Mesh(geo.armLedH, seatArmLedMat);
        ledH.position.set(ax + innerSign * 0.05, 0.525, 0.09);
        g.add(ledH);
      });

      const cup = new THREE.Mesh(geo.cupRing, doorBrassTrimMat);
      cup.position.set(armX, 0.56, 0.31);
      g.add(cup);
    }

    function addLuxurySeat(x, floorY, z) {
      const g = new THREE.Group();
      g.position.set(x, floorY, z);
      g.rotation.y = Math.PI; // Face -Z (toward Cinema Screen wall at z = -105m)
      buildVievSeat(g, seatGeo, false);
      scene.add(g);
    }

    function addVipRecliner(x, floorY, z) {
      const g = new THREE.Group();
      g.position.set(x, floorY, z);
      g.rotation.y = Math.PI; // Face -Z (toward Cinema Screen wall at z = -105m)
      buildVievSeat(g, vipGeo, true);
      scene.add(g);
    }

    // Helper to generate seat X centers for a block
    const blockSeatXs = (startX, count, pitch) =>
      Array.from({ length: count }, (_, i) => startX + pitch / 2 + i * pitch);

    // 4 INCLINING Auditorium Tiers BESIDE the Stairs (x = -20.8m to -1.6m)
    // Rising UPWARD from z = -94.0m (y = 4.90m) toward z = -76.0m (y = 7.65m)
    // X-layout (19.2m total beside stair wall):
    //   Extreme Left 4 seats: -20.45 to -15.45 (4 x 1.25m)
    //   Left Walkway:         -15.45 to -13.85 (1.60m stepped walkway)
    //   Centre 5 seats:       -13.85 to  -7.60 (5 x 1.25m)
    //   Right Walkway:         -7.60 to  -6.00 (1.60m stepped walkway)
    //   Right Side 3 seats:    -6.00 to  -2.25 (3 x 1.25m)
    const rowStartZ = -94.0;
    const rowDepth = 2.8;
    const rowRise = 0.55;
    const rowCount = 4;
    const walkwayCenters = [-14.65, -6.80];
    const walkwayW = 1.60;

    // Flat transition deck at top of stairs (z = -95.8m to -94.0m, y = 4.90m)
    const audEntryDeck = new THREE.Mesh(
      new THREE.BoxGeometry(audW, totalStairHeight, 1.8),
      hallFloorMat
    );
    audEntryDeck.position.set(audCenterX, totalStairHeight / 2, -94.9);
    scene.add(audEntryDeck);

    const stdSeatXs = [
      ...blockSeatXs(-20.45, 4, 1.25), // Extreme Left 4 seats
      ...blockSeatXs(-13.85, 5, 1.25), // Centre 5 seats
      ...blockSeatXs(-6.00, 3, 1.25)   // Right 3 seats beside stair wall
    ];

    for (let r = 0; r < rowCount; r++) {
      const rowFloorY = totalStairHeight + (r + 1) * rowRise; // 5.45m, 6.00m, 6.55m, 7.10m
      const rowCenterZ = rowStartZ + r * rowDepth + rowDepth / 2;

      // Solid Inclining Tier Box beside the stair wall
      const tierDeck = new THREE.Mesh(
        new THREE.BoxGeometry(audW, rowFloorY, rowDepth),
        hallFloorMat
      );
      tierDeck.position.set(audCenterX, rowFloorY / 2, rowCenterZ);
      scene.add(tierDeck);

      // 2 smooth walkway steps inside each row tier (going UP along +Z)
      const subStepCount = 2;
      const subStepDepth = rowDepth / subStepCount;
      const subStepRise = rowRise / subStepCount;
      for (let ss = 0; ss < subStepCount; ss++) {
        const ssTopY = totalStairHeight + r * rowRise + (ss + 1) * subStepRise;
        const ssZ = (rowStartZ + r * rowDepth) + ss * subStepDepth + subStepDepth / 2;
        walkwayCenters.forEach((wx) => {
          const wStep = new THREE.Mesh(
            new THREE.BoxGeometry(walkwayW, subStepRise, subStepDepth),
            hallFloorMat
          );
          wStep.position.set(wx, ssTopY - subStepRise / 2, ssZ);
          scene.add(wStep);

          const wLed = new THREE.Mesh(new THREE.BoxGeometry(walkwayW - 0.14, 0.03, 0.045), stepLedMat);
          wLed.position.set(wx, ssTopY + 0.008, ssZ - subStepDepth / 2 + 0.03);
          scene.add(wLed);
        });
      }

      // Place all 12 luxury VIEV seats in this row (facing -Z)
      stdSeatXs.forEach((sx) => addLuxurySeat(sx, rowFloorY, rowCenterZ));
    }

    // Top VIP Special Recliner Terrace at the Top of the Incline (z = -82.8m to -76.0m, y = 7.65m)
    const vipDeckStartZ = rowStartZ + rowCount * rowDepth; // -82.8m
    const vipDeckLen = zEndWall - vipDeckStartZ; // 6.8m (-82.8 to -76.0)
    const vipFloorY = totalStairHeight + (rowCount + 1) * rowRise; // 7.65m

    const vipDeck = new THREE.Mesh(
      new THREE.BoxGeometry(audW, vipFloorY, vipDeckLen),
      hallFloorMat
    );
    vipDeck.position.set(audCenterX, vipFloorY / 2, vipDeckStartZ + vipDeckLen / 2);
    scene.add(vipDeck);

    // Walkway step up to Top VIP Recliner Terrace (2 steps along +Z)
    walkwayCenters.forEach((wx) => {
      const midY = totalStairHeight + rowCount * rowRise + rowRise * 0.5;
      const wStep = new THREE.Mesh(new THREE.BoxGeometry(walkwayW, rowRise * 0.5, 1.4), hallFloorMat);
      wStep.position.set(wx, midY - rowRise * 0.25, vipDeckStartZ + 0.7);
      scene.add(wStep);

      const vipLed1 = new THREE.Mesh(new THREE.BoxGeometry(walkwayW - 0.14, 0.035, 0.05), stepLedMat);
      vipLed1.position.set(wx, midY + 0.008, vipDeckStartZ + 0.03);
      scene.add(vipLed1);

      const vipLed2 = new THREE.Mesh(new THREE.BoxGeometry(walkwayW - 0.14, 0.035, 0.05), stepLedMat);
      vipLed2.position.set(wx, vipFloorY + 0.008, vipDeckStartZ + 1.43);
      scene.add(vipLed2);
    });

    // Place Top VIP Special Recliner Seats at the Top of the Incline (3 Left + 5 Centre + 3 Right = 11 VIP Recliners)
    const vipSeatXs = [
      ...blockSeatXs(-20.45, 3, 1.65), // Extreme Left 3 VIP Recliners
      ...blockSeatXs(-14.20, 5, 1.65), // Centre 5 VIP Recliners
      ...blockSeatXs(-2.80, 3, 1.65)   // Right 3 VIP Recliners
    ];
    vipSeatXs.forEach((vx) => addVipRecliner(vx, vipFloorY, -79.2));

    // Giant True-Black Cinema Display on Back Wall (z = -104.9m) with ultra-thin micro-bezel
    const displayW = 22.8;
    const displayH = 10.4;
    const displayY = 10.6; // Spans y = 5.4m to 15.8m under the 16.5m ceiling
    const microBezelMat = new THREE.MeshStandardMaterial({
      color: 0x070709,
      roughness: 0.65,
      metalness: 0.25
    });
    const screenBezel = new THREE.Mesh(
      new THREE.BoxGeometry(displayW + 0.08, displayH + 0.08, 0.12),
      microBezelMat
    );
    screenBezel.position.set(hallCenterX, displayY, zEndWall - hallL + 0.06);
    scene.add(screenBezel);

    const screenMat = new THREE.MeshStandardMaterial({
      color: 0x030304,
      roughness: 0.96,
      metalness: 0.0
    });
    const screenSurface = new THREE.Mesh(
      new THREE.BoxGeometry(displayW, displayH, 0.14),
      screenMat
    );
    screenSurface.position.set(hallCenterX, displayY, zEndWall - hallL + 0.08);
    scene.add(screenSurface);

    // Warm spotlight illuminating the Premium Wood Wall & Double Doors from corridor
    const featureWallSpot = new THREE.PointLight(0xffedd1, 1.1, 16, 2.0);
    featureWallSpot.position.set(0, 3.8, zEndWall + 6);
    scene.add(featureWallSpot);

    // 6. Warm Interior Point Lights along Main Promenade (Refined minimal ambient illumination)
    const lightSpacing = 12;
    const lightCount = Math.floor(MALL_LENGTH / lightSpacing);
    for (let i = 0; i < lightCount; i++) {
      const zPos = 8 - i * lightSpacing;

      // Soft architectural cream downlight (minimal cream reflection on floor)
      const spotLight = new THREE.PointLight(0xf7e3be, 0.58, 14, 2.0);
      spotLight.position.set(0, MALL_HEIGHT - 0.4, zPos);
      scene.add(spotLight);

      // Soft diffuse cream gallery wall wash
      const rightLight = new THREE.PointLight(0xf6e2bc, 0.22, 12, 2.0);
      rightLight.position.set(halfW - 1.5, 3.2, zPos);
      scene.add(rightLight);
    }
  }

  /**
   * Initialize Three.js WebGL Engine
   */
  function initEngine() {
    container = document.getElementById('subpage-space');
    stageElement = document.getElementById('space-landscape-stage');
    canvasWrap = document.getElementById('space-canvas-wrap');
    if (!container || !stageElement || !canvasWrap) return;

    if (renderer) {
      start();
      return;
    }

    const width = stageElement.clientWidth || window.innerWidth;
    const height = stageElement.clientHeight || window.innerHeight;

    // 1. Scene with warm luxury depth fog
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0e14);
    scene.fog = new THREE.FogExp2(0x0c0e14, 0.012);

    // 2. Camera fixed at standing eye level in center of promenade (near=0.25, far=220 for crisp mobile depth precision)
    camera = new THREE.PerspectiveCamera(65, width / height, 0.25, 220);
    camera.position.set(0, cameraY, 3);

    // 3. WebGL Renderer
    renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.domElement.id = 'space-three-canvas';
    canvasWrap.appendChild(renderer.domElement);

    // 4. Ambient and Directional Lights for warm cream tone & minimal reflection
    const ambientLight = new THREE.AmbientLight(0xf5e6cc, 0.72);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xf7e2bc, 0.85);
    dirLight.position.set(4, 12, 8);
    scene.add(dirLight);

    // 5. Build the Mall Promenade with Open Boutiques
    buildMallCorridor();

    // 6. Setup Joystick, Keyboard & Look Controls
    setupJoystickControls();
    setupKeyboardControls();
    setupTouchLookControls(stageElement);
    setupBackAction();

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('orientationchange', () => {
      setTimeout(onWindowResize, 100);
      setTimeout(onWindowResize, 350);
    });

    start();
  }

  /**
   * Analog Movement Joystick (Bottom-Left)
   * Fully Multi-Touch Enabled: Tracks its own touch identifier independently
   */
  function setupJoystickControls() {
    const zone = document.getElementById('space-joystick-zone');
    const thumb = document.getElementById('space-joystick-thumb');
    if (!zone || !thumb) return;

    function updateJoystickCenter() {
      const rect = zone.getBoundingClientRect();
      joystickCenter = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    }

    function handleJoystickMove(clientX, clientY) {
      const screenDeltaX = clientX - joystickCenter.x;
      const screenDeltaY = clientY - joystickCenter.y;

      // Handle CSS 90deg stage rotation in portrait mode
      const isPortrait = window.innerHeight > window.innerWidth;
      const visualX = isPortrait ? screenDeltaY : screenDeltaX;
      const visualY = isPortrait ? -screenDeltaX : screenDeltaY;

      const dist = Math.hypot(visualX, visualY);
      const angle = Math.atan2(visualY, visualX);
      const clampedDist = Math.min(dist, JOYSTICK_MAX_RADIUS);

      const clampedX = Math.cos(angle) * clampedDist;
      const clampedY = Math.sin(angle) * clampedDist;

      // Update thumb position visually
      thumb.style.transform = `translate(${clampedX}px, ${clampedY}px)`;

      // Normalized input vector: x in [-1, 1], y in [-1, 1] (negative y is forward)
      joystickVector.x = clampedX / JOYSTICK_MAX_RADIUS;
      joystickVector.y = clampedY / JOYSTICK_MAX_RADIUS;
    }

    function onTouchStart(e) {
      if (isJoystickActive) return;
      if (!e.changedTouches || e.changedTouches.length === 0) return;
      const t = e.changedTouches[0];
      isJoystickActive = true;
      joystickTouchId = t.identifier;
      zone.classList.add('is-active');
      updateJoystickCenter();
      handleJoystickMove(t.clientX, t.clientY);
      e.stopPropagation();
    }

    function onTouchMove(e) {
      if (!isJoystickActive || joystickTouchId === null) return;
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === joystickTouchId) {
          handleJoystickMove(e.touches[i].clientX, e.touches[i].clientY);
          break;
        }
      }
    }

    function onTouchEnd(e) {
      if (!isJoystickActive || joystickTouchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === joystickTouchId) {
          isJoystickActive = false;
          joystickTouchId = null;
          zone.classList.remove('is-active');
          thumb.style.transform = 'translate(0px, 0px)';
          joystickVector.x = 0;
          joystickVector.y = 0;
          break;
        }
      }
    }

    function onMouseDown(e) {
      if (isJoystickActive) return;
      isJoystickActive = true;
      joystickTouchId = 'mouse';
      zone.classList.add('is-active');
      updateJoystickCenter();
      handleJoystickMove(e.clientX, e.clientY);
      e.stopPropagation();
    }

    function onMouseMove(e) {
      if (isJoystickActive && joystickTouchId === 'mouse') {
        handleJoystickMove(e.clientX, e.clientY);
      }
    }

    function onMouseUp(e) {
      if (isJoystickActive && joystickTouchId === 'mouse') {
        isJoystickActive = false;
        joystickTouchId = null;
        zone.classList.remove('is-active');
        thumb.style.transform = 'translate(0px, 0px)';
        joystickVector.x = 0;
        joystickVector.y = 0;
      }
    }

    zone.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: false });
    window.addEventListener('touchcancel', onTouchEnd, { passive: false });

    zone.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  /**
   * Rotation-Aware Touch & Mouse Smooth Pan / Look Around (Right Screen)
   * Multi-Touch Safe: Completely ignores the joystick touch point
   */
  function setupTouchLookControls(element) {
    const joystickZone = document.getElementById('space-joystick-zone');

    function isInsideJoystickZone(clientX, clientY, target) {
      if (joystickZone && (joystickZone === target || joystickZone.contains(target))) return true;
      if (joystickZone) {
        const rect = joystickZone.getBoundingClientRect();
        const margin = 20;
        if (clientX >= rect.left - margin && clientX <= rect.right + margin &&
          clientY >= rect.top - margin && clientY <= rect.bottom + margin) {
          return true;
        }
      }
      return false;
    }

    function onTouchStart(e) {
      if (!e.changedTouches) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        // Ignore the joystick touch or touches inside joystick area
        if (joystickTouchId !== null && t.identifier === joystickTouchId) continue;
        if (isInsideJoystickZone(t.clientX, t.clientY, e.target)) continue;

        // If not already dragging look, start looking with this touch
        if (lookTouchId === null) {
          isDraggingLook = true;
          lookTouchId = t.identifier;
          prevPointerX = t.clientX;
          prevPointerY = t.clientY;
          break;
        }
      }
    }

    function onTouchMove(e) {
      if (!isDraggingLook || lookTouchId === null || !e.touches) return;

      let clientX = 0;
      let clientY = 0;
      let found = false;

      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === lookTouchId) {
          clientX = e.touches[i].clientX;
          clientY = e.touches[i].clientY;
          found = true;
          break;
        }
      }
      if (!found) return;

      const screenDeltaX = clientX - prevPointerX;
      const screenDeltaY = clientY - prevPointerY;

      prevPointerX = clientX;
      prevPointerY = clientY;

      // Detect if stage is rotated 90deg via CSS
      const isPortrait = window.innerHeight > window.innerWidth;
      const visualDeltaX = isPortrait ? screenDeltaY : screenDeltaX;
      const visualDeltaY = isPortrait ? -screenDeltaX : screenDeltaY;

      targetYaw -= visualDeltaX * (0.0048 * lookSensitivity);
      targetPitch -= visualDeltaY * (0.0040 * lookSensitivity);
      targetPitch = Math.max(-0.65, Math.min(0.75, targetPitch));
    }

    function onTouchEnd(e) {
      if (!isDraggingLook || lookTouchId === null || !e.changedTouches) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === lookTouchId) {
          isDraggingLook = false;
          lookTouchId = null;
          break;
        }
      }
    }

    function onMouseDown(e) {
      if (isInsideJoystickZone(e.clientX, e.clientY, e.target)) return;
      if (lookTouchId !== null) return;
      isDraggingLook = true;
      lookTouchId = 'mouse';
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;
    }

    function onMouseMove(e) {
      if (!isDraggingLook || lookTouchId !== 'mouse') return;
      const screenDeltaX = e.clientX - prevPointerX;
      const screenDeltaY = e.clientY - prevPointerY;

      prevPointerX = e.clientX;
      prevPointerY = e.clientY;

      const isPortrait = window.innerHeight > window.innerWidth;
      const visualDeltaX = isPortrait ? screenDeltaY : screenDeltaX;
      const visualDeltaY = isPortrait ? -screenDeltaX : screenDeltaY;

      targetYaw -= visualDeltaX * (0.0048 * lookSensitivity);
      targetPitch -= visualDeltaY * (0.0040 * lookSensitivity);
      targetPitch = Math.max(-0.65, Math.min(0.75, targetPitch));
    }

    function onMouseUp(e) {
      if (lookTouchId === 'mouse') {
        isDraggingLook = false;
        lookTouchId = null;
      }
    }

    element.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });

    element.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  /**
   * Laptop / Desktop Keyboard Controls (W/A/S/D & Arrow Keys + Shift)
   * Simultaneous Multi-Key Support: W+A, W+D, S+A, S+D diagonal walking
   */
  function setupKeyboardControls() {
    const hintPill = document.getElementById('space-desktop-hint');

    function getKeyAction(e) {
      const code = e.code || '';
      const key = (e.key || '').toLowerCase();
      if (code === 'KeyW' || key === 'w' || code === 'ArrowUp' || key === 'arrowup') return 'forward';
      if (code === 'KeyS' || key === 's' || code === 'ArrowDown' || key === 'arrowdown') return 'backward';
      if (code === 'KeyA' || key === 'a' || code === 'ArrowLeft' || key === 'arrowleft') return 'left';
      if (code === 'KeyD' || key === 'd' || code === 'ArrowRight' || key === 'arrowright') return 'right';
      if (code === 'ShiftLeft' || code === 'ShiftRight' || key === 'shift') return 'sprint';
      return null;
    }

    function onKeyDown(e) {
      if (!isRunning) return;
      const action = getKeyAction(e);
      if (action) {
        keysPressed[action] = true;
        e.preventDefault();
        e.stopPropagation();
        if (hintPill) hintPill.style.opacity = '0.3';
      }
    }

    function onKeyUp(e) {
      const action = getKeyAction(e);
      if (action) {
        keysPressed[action] = false;
        e.preventDefault();
        e.stopPropagation();
      }
    }

    function onWindowBlur() {
      keysPressed.forward = false;
      keysPressed.backward = false;
      keysPressed.left = false;
      keysPressed.right = false;
      keysPressed.sprint = false;
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onWindowBlur);
  }

  /**
   * Update Player Walking Movement based on Joystick + Keyboard Input & Collisions
   * Full Multi-Direction & Diagonal Sliding Support
   */
  function updatePlayerMovement() {
    if (!camera) return;

    // 1. Discrete Keyboard Multi-Key Vector
    let keyX = 0;
    let keyY = 0;
    if (keysPressed.forward) keyY -= 1;
    if (keysPressed.backward) keyY += 1;
    if (keysPressed.left) keyX -= 1;
    if (keysPressed.right) keyX += 1;

    // Normalize diagonal keys (e.g. W+A, W+D, S+A, S+D)
    const keyMag = Math.hypot(keyX, keyY);
    let normKeyX = 0;
    let normKeyY = 0;
    if (keyMag > 0) {
      normKeyX = keyX / keyMag;
      normKeyY = keyY / keyMag;
    }

    // 2. Analog Joystick Vector
    const joyX = joystickVector.x;
    const joyY = joystickVector.y;

    // 3. Combined total vector
    let totalX = normKeyX + joyX;
    let totalY = normKeyY + joyY;
    const totalMag = Math.hypot(totalX, totalY);

    if (totalMag > 0.04) {
      const factor = totalMag > 1 ? totalMag : 1;
      const moveX = totalX / factor; // strafe right (+1) / left (-1)
      const moveZ = totalY / factor; // forward (-1) / backward (+1)

      const currentSpeed = keysPressed.sprint ? WALK_SPEED * 1.55 : WALK_SPEED;
      const yaw = camera.rotation.y;

      // Direction vectors in X-Z ground plane
      // Forward (-Z) in camera yaw: (-sin(yaw), -cos(yaw))
      // Right (+X) in camera yaw:   ( cos(yaw), -sin(yaw))
      const deltaX = (-moveZ * (-Math.sin(yaw)) + moveX * Math.cos(yaw)) * currentSpeed;
      const deltaZ = (-moveZ * (-Math.cos(yaw)) + moveX * (-Math.sin(yaw))) * currentSpeed;

      // Axis-independent collision sliding (diagonal movement slides along walls smoothly)
      let nextX = camera.position.x + deltaX;
      if (camera.position.z < -95.8) {
        // Upper Flat Cross-Walkway behind stairs (-19.8m to +2.55m)
        nextX = Math.min(2.55, Math.max(-19.8, nextX));
      } else if (camera.position.z < -76.2) {
        if (camera.position.x < -1.6) {
          // Inside Inclined Auditorium Seating Area (-19.8m to -2.2m, separated from stairs by left stair wall at -1.6m)
          nextX = Math.min(-2.2, Math.max(-19.8, nextX));
        } else {
          // Inside Walled Right-Side Staircase Corridor (-0.95m to +2.55m)
          nextX = Math.min(2.55, Math.max(-0.95, nextX));
        }
      } else if (camera.position.z < -66.0) {
        // Corridor tail between Shop 4 and Wood Wall (-5.2m to +5.2m)
        nextX = Math.min(5.2, Math.max(-5.2, nextX));
      } else {
        nextX = Math.min(5.2, Math.max(-13.2, nextX));
      }
      if (nextX < -5.8 && camera.position.z >= -66.0 && [-12, -30, -48].some(divZ => Math.abs(camera.position.z - divZ) < 0.65)) {
        nextX = camera.position.x;
      }
      // Fixed glass storefront window collision (x = -6.0): central 4.4m doorway allows entrance
      if (nextX < -5.9 && camera.position.x >= -5.9) {
        if (camera.position.z <= 6.0 && camera.position.z >= -66.0) {
          const shopIdx = Math.floor((6.0 - camera.position.z) / 18.0);
          const shopCenterZ = 6.0 - shopIdx * 18.0 - 9.0;
          if (Math.abs(camera.position.z - shopCenterZ) > 1.95) {
            nextX = camera.position.x; // Blocked by fixed black tinted glass window!
          }
        }
      }
      camera.position.x = nextX;

      let nextZ = camera.position.z + deltaZ;
      nextZ = Math.min(6.0, Math.max(-104.0, nextZ));
      if (camera.position.x < -5.8 && camera.position.z >= -66.0 && [-12, -30, -48].some(divZ => Math.abs(nextZ - divZ) < 0.65)) {
        nextZ = camera.position.z;
      }
      // Far-end Wood Wall & Single Doorway collision at z = -76.0m (only for stair corridor / mall side, auditorium stops at -76.6m)
      if (camera.position.x < -1.6 && camera.position.z < -76.2) {
        nextZ = Math.max(-104.0, Math.min(-76.6, nextZ));
      } else if (Math.abs(nextZ - cinemaDoorState.doorZ) < 0.55) {
        const inDoorOpening = Math.abs(camera.position.x - cinemaDoorState.doorX) < 0.85 && cinemaDoorState.openProgress > 0.35;
        if (!inDoorOpening) {
          nextZ = camera.position.z;
        }
      }
      camera.position.z = nextZ;

      // Walkable Upstairs Height inside Walled Staircase -> Flat Upper Cross-Walkway -> Inclining Auditorium & Top VIP Terrace
      const getCinemaFloorY = (x, z) => {
        if (z < -95.8) return 4.90; // Upper flat landing behind stairs
        if (x < -1.6) {
          // Inclined Auditorium beside stairs (rises UPWARD from z = -94.0m @ 4.90m to z = -82.8m @ 7.10m -> VIP @ 7.65m)
          if (z >= -81.4) return 7.65; // Top VIP Special Recliner Terrace
          if (z >= -82.8) return 7.375; // Step up to VIP Terrace
          if (z > -94.0) {
            const subStep = Math.min(7, Math.max(0, Math.floor((z - (-94.0)) / 1.4)));
            return 4.90 + (subStep + 1) * 0.275;
          }
          return 4.90;
        }
        if (z < -79.0) {
          const stepIdx = Math.min(14, Math.max(0, Math.floor((-79.0 - z) / 1.2) + 1));
          return stepIdx * 0.35;
        }
        return 0;
      };
      const baseFloorY = getCinemaFloorY(camera.position.x, camera.position.z);

      // Subtle natural human walking head bob smoothly tracking upstairs elevation
      walkStepTime += keysPressed.sprint ? 0.22 : 0.14;
      const targetEyeY = baseFloorY + cameraY + Math.sin(walkStepTime) * 0.022;
      camera.position.y += (targetEyeY - camera.position.y) * 0.16;
    } else {
      // Smooth return to resting eye level on current stair/incline/terrace
      let baseFloorY = 0;
      if (camera.position.z < -95.8) {
        baseFloorY = 4.90;
      } else if (camera.position.x < -1.6) {
        if (camera.position.z >= -81.4) baseFloorY = 7.65;
        else if (camera.position.z >= -82.8) baseFloorY = 7.375;
        else if (camera.position.z > -94.0) {
          const subStep = Math.min(7, Math.max(0, Math.floor((camera.position.z - (-94.0)) / 1.4)));
          baseFloorY = 4.90 + (subStep + 1) * 0.275;
        } else {
          baseFloorY = 4.90;
        }
      } else if (camera.position.z < -79.0) {
        const stepIdx = Math.min(14, Math.max(0, Math.floor((-79.0 - camera.position.z) / 1.2) + 1));
        baseFloorY = stepIdx * 0.35;
      }
      camera.position.y += ((baseFloorY + cameraY) - camera.position.y) * 0.12;
    }
  }

  /**
   * Back Button Action (Closes SPACE overlay)
   */
  function setupBackAction() {
    const backBtn = document.getElementById('space-custom-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeSpace();
      });
    }
  }

  function onWindowResize() {
    if (!stageElement || !renderer || !camera) return;
    const width = stageElement.clientWidth || window.innerWidth;
    const height = stageElement.clientHeight || window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  /**
   * First Shop Interactive OLED TV Audio Player & Dim-Yellow Mood Lighting
   */
  function formatAudioTime(sec) {
    if (!isFinite(sec) || sec < 0) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  const _cWhite = new THREE.Color(0xffffff);
  const _cDimFloor = new THREE.Color(0x4a391b);
  const _cDimCeil = new THREE.Color(0x3a2b12);
  const _cDimWall = new THREE.Color(0x453417);
  const _cNormEmis = new THREE.Color(0x2b2010);
  const _cDimEmis = new THREE.Color(0x3d2908);

  function applyShopLightingProgress(idx, t) {
    const st = shopLightingStates[idx];
    if (!st) return;
    if (st.normalLight) {
      st.normalLight.intensity = 1.15 * (1 - t);
    }
    if (st.dimYellowLight) {
      st.dimYellowLight.intensity = 0.34 * t;
    }
    if (st.mats) {
      const { floor, ceiling, backWall, sideWall } = st.mats;
      floor.color.copy(_cWhite).lerp(_cDimFloor, t);
      ceiling.color.copy(_cWhite).lerp(_cDimCeil, t);
      ceiling.emissiveIntensity = 0.08 * (1 - t);

      backWall.color.copy(_cWhite).lerp(_cDimWall, t);
      backWall.emissive.copy(_cNormEmis).lerp(_cDimEmis, t);
      backWall.emissiveIntensity = 0.08 - 0.03 * t;

      sideWall.color.copy(_cWhite).lerp(_cDimWall, t);
      sideWall.emissive.copy(_cNormEmis).lerp(_cDimEmis, t);
      sideWall.emissiveIntensity = 0.08 - 0.03 * t;
    }
  }

  function setShopAudioLighting(idx, isMediaPlaying) {
    if (shopLightingStates[idx]) {
      shopLightingStates[idx].fadeTarget = isMediaPlaying ? 1 : 0;
    }
  }

  function updateAllShopLightingFades() {
    [0, 1, 2].forEach(idx => {
      const st = shopLightingStates[idx];
      if (!st) return;
      const diff = st.fadeTarget - st.fadeCur;
      if (Math.abs(diff) < 0.002) {
        if (st.fadeCur !== st.fadeTarget) {
          st.fadeCur = st.fadeTarget;
          applyShopLightingProgress(idx, st.fadeCur);
        }
        return;
      }
      st.fadeCur += diff * 0.04;
      applyShopLightingProgress(idx, st.fadeCur);
    });
  }

  function getNearbyShopLedIndex() {
    if (!camera || camera.position.x >= -5.8) return null;
    const z = camera.position.z;
    const x = camera.position.x;
    if (z <= 6 && z >= -12) {
      const d = Math.hypot(x - firstShopAudioState.tvPos.x, z - firstShopAudioState.tvPos.z);
      return d < 9.5 ? 0 : null;
    }
    if (z < -12 && z >= -30) {
      const d = Math.hypot(x - shop2VideoState.tvPos.x, z - shop2VideoState.tvPos.z);
      return d < 9.5 ? 1 : null;
    }
    if (z < -30 && z >= -48) {
      const d = Math.hypot(x - shop3VideoState.tvPos.x, z - shop3VideoState.tvPos.z);
      return d < 9.5 ? 2 : null;
    }
    return null;
  }

  function getPlayingShopLedIndex() {
    if (firstShopAudioState.isPlaying) return 0;
    if (shop2VideoState.isPlaying) return 1;
    if (shop3VideoState.isPlaying) return 2;
    return null;
  }

  function isShopLedPlaying(idx) {
    if (idx === 0) return firstShopAudioState.isPlaying;
    if (idx === 1) return shop2VideoState.isPlaying;
    if (idx === 2) return shop3VideoState.isPlaying;
    return false;
  }

  function pauseShopLed(idx) {
    if (idx === 0 && firstShopAudioState.isPlaying) {
      if (firstShopAudioState.audio) firstShopAudioState.audio.pause();
      firstShopAudioState.isPlaying = false;
      setShopAudioLighting(0, false);
      renderFirstShopLedScreen(true);
    } else if (idx === 1 && shop2VideoState.isPlaying) {
      if (shop2VideoState.video) shop2VideoState.video.pause();
      shop2VideoState.isPlaying = false;
      setShopAudioLighting(1, false);
    } else if (idx === 2 && shop3VideoState.isPlaying) {
      if (shop3VideoState.video) shop3VideoState.video.pause();
      shop3VideoState.isPlaying = false;
      setShopAudioLighting(2, false);
    }
  }

  function updateShopLedButtonUI() {
    const btn = document.getElementById('space-tv-audio-btn');
    const icon = document.getElementById('space-tv-audio-icon');
    const label = document.getElementById('space-tv-audio-label');
    if (!btn || !icon || !label) return;

    const nearbyIdx = getNearbyShopLedIndex();
    const playingIdx = getPlayingShopLedIndex();
    const targetIdx = nearbyIdx !== null ? nearbyIdx : playingIdx;

    if (targetIdx === null) {
      btn.classList.remove('is-visible', 'is-playing');
      return;
    }

    btn.classList.add('is-visible');
    const activePlaying = isShopLedPlaying(targetIdx);
    const mediaWord = targetIdx === 0 ? 'Audio' : 'Video';
    if (activePlaying) {
      btn.classList.add('is-playing');
      icon.textContent = '❚❚';
      label.textContent = 'Pause ' + mediaWord;
    } else {
      btn.classList.remove('is-playing');
      icon.textContent = '▶';
      label.textContent = 'Play ' + mediaWord;
    }
  }

  function renderFirstShopLedScreen(forceDraw) {
    const st = firstShopAudioState;
    if (!st.ledCtx || !st.ledTex) return;
    const now = performance.now();
    if (!forceDraw && !st.isPlaying) return;
    if (!forceDraw && now - st.lastDrawTime < 33) return; // ~30fps smooth LED update
    st.lastDrawTime = now;

    const ctx = st.ledCtx;
    const W = 1024, H = 512;

    // Deep OLED obsidian background
    ctx.fillStyle = '#05060a';
    ctx.fillRect(0, 0, W, H);

    // Sample real-time audio spectrum if playing
    let avgEnergy = 0;
    const barCount = 32;
    const bars = new Array(barCount).fill(0.06);
    if (st.isPlaying) {
      if (st.analyser && st.freqData) {
        st.analyser.getByteFrequencyData(st.freqData);
        for (let b = 0; b < barCount; b++) {
          const val = st.freqData[b % st.freqData.length] / 255;
          bars[b] = Math.max(0.08, val);
          avgEnergy += val;
        }
        avgEnergy /= barCount;
      } else {
        for (let b = 0; b < barCount; b++) {
          const wave = 0.28 + 0.48 * Math.abs(Math.sin(now * 0.005 + b * 0.45) * Math.cos(now * 0.0028 - b * 0.25));
          bars[b] = wave;
          avgEnergy += wave;
        }
        avgEnergy /= barCount;
      }
    }

    // Subtle warm golden radial backlight that breathes with audio
    const glowAlpha = st.isPlaying ? (0.14 + avgEnergy * 0.22) : 0.09;
    const rad = ctx.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, 460);
    rad.addColorStop(0, `rgba(255, 198, 65, ${glowAlpha.toFixed(3)})`);
    rad.addColorStop(0.6, 'rgba(180, 125, 25, 0.05)');
    rad.addColorStop(1, 'rgba(5, 6, 10, 0)');
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, W, H);

    // Top Header
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffd978';
    ctx.font = '600 24px "Montserrat", -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('VOICE NOTE  •  HONEY BUNNY', 64, 76);

    // Status Pill on Top Right
    ctx.textAlign = 'right';
    ctx.fillStyle = st.isPlaying ? '#ffca3a' : 'rgba(255, 235, 185, 0.55)';
    ctx.font = '700 20px "Montserrat", -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(st.isPlaying ? '● PLAYING LIVE' : '○ READY TO PLAY', W - 64, 76);

    // Center Real-Time Symmetric Audio Spectrum Bars
    const totalBarsW = 780;
    const step = totalBarsW / barCount;
    const barW = step * 0.58;
    const startX = (W - totalBarsW) / 2 + (step - barW) / 2;
    const centerY = 252;
    const maxBarH = 190;

    for (let b = 0; b < barCount; b++) {
      const h = Math.max(10, bars[b] * maxBarH);
      const bx = startX + b * step;
      const by = centerY - h / 2;

      const grad = ctx.createLinearGradient(0, by, 0, by + h);
      grad.addColorStop(0, '#ffe89e');
      grad.addColorStop(0.5, '#ffbe2e');
      grad.addColorStop(1, '#ffe89e');
      ctx.fillStyle = grad;
      ctx.fillRect(bx, by, barW, h);
    }

    // Bottom Playback Progress Bar & Timestamps
    const curTime = st.audio ? (st.audio.currentTime || 0) : 0;
    const durTime = st.audio && isFinite(st.audio.duration) && st.audio.duration > 0 ? st.audio.duration : 85;
    const progress = Math.min(1, Math.max(0, curTime / durTime));

    const barX = 64, barY = 418, barFullW = W - 128, barH = 8;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.fillRect(barX, barY, barFullW, barH);
    ctx.fillStyle = '#ffca3a';
    ctx.fillRect(barX, barY, barFullW * progress, barH);

    // Playhead knob
    ctx.beginPath();
    ctx.arc(barX + barFullW * progress, barY + barH / 2, 9, 0, Math.PI * 2);
    ctx.fillStyle = '#fff3cc';
    ctx.fill();

    // Time labels
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255, 240, 200, 0.85)';
    ctx.font = '600 20px monospace';
    ctx.fillText(formatAudioTime(curTime), barX, 456);

    ctx.textAlign = 'right';
    ctx.fillText(formatAudioTime(durTime), barX + barFullW, 456);

    st.ledTex.needsUpdate = true;
  }

  function initFirstShopTvAudio() {
    const st = firstShopAudioState;
    if (!st.ledCanvas) {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      st.ledCanvas = canvas;
      st.ledCtx = canvas.getContext('2d');
      st.ledTex = new THREE.CanvasTexture(canvas);
      st.ledTex.encoding = THREE.sRGBEncoding;
      st.ledTex.anisotropy = 16;
    }

    if (!st.audio) {
      const audio = new Audio('assets/audio/honey_bday_note.ogg');
      audio.preload = 'metadata';
      audio.addEventListener('loadedmetadata', () => renderFirstShopLedScreen(true));
      audio.addEventListener('ended', () => {
        st.isPlaying = false;
        setShopAudioLighting(0, false);
        updateShopLedButtonUI();
        renderFirstShopLedScreen(true);
      });
      st.audio = audio;
    }

    if (!st.btnBound) {
      st.btnBound = true;
      const btn = document.getElementById('space-tv-audio-btn');
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const nearbyIdx = getNearbyShopLedIndex();
          const playingIdx = getPlayingShopLedIndex();
          const targetIdx = nearbyIdx !== null ? nearbyIdx : playingIdx;
          if (targetIdx === null) return;

          if (isShopLedPlaying(targetIdx)) {
            pauseShopLed(targetIdx);
            updateShopLedButtonUI();
            return;
          }

          [0, 1, 2].forEach(idx => {
            if (idx !== targetIdx) pauseShopLed(idx);
          });

          if (targetIdx === 0) {
            if (!st.audio) return;
            if (!st.audioCtx) {
              try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                st.audioCtx = new AudioCtx();
                const srcNode = st.audioCtx.createMediaElementSource(st.audio);
                st.analyser = st.audioCtx.createAnalyser();
                st.analyser.fftSize = 64;
                srcNode.connect(st.analyser);
                st.analyser.connect(st.audioCtx.destination);
                st.freqData = new Uint8Array(st.analyser.frequencyBinCount);
              } catch (_) {
                st.analyser = null;
              }
            }
            if (st.audioCtx && st.audioCtx.state === 'suspended') {
              st.audioCtx.resume().catch(() => { });
            }
            st.audio.play().then(() => {
              st.isPlaying = true;
              setShopAudioLighting(0, true);
              updateShopLedButtonUI();
              renderFirstShopLedScreen(true);
            }).catch(() => { });
          } else if (targetIdx === 1 && shop2VideoState.video) {
            shop2VideoState.video.muted = false;
            shop2VideoState.video.volume = 0.45;
            shop2VideoState.video.play().then(() => {
              shop2VideoState.isPlaying = true;
              setShopAudioLighting(1, true);
              updateShopLedButtonUI();
            }).catch(() => { });
          } else if (targetIdx === 2 && shop3VideoState.video) {
            shop3VideoState.video.muted = false;
            shop3VideoState.video.volume = 0.45;
            shop3VideoState.video.play().then(() => {
              shop3VideoState.isPlaying = true;
              setShopAudioLighting(2, true);
              updateShopLedButtonUI();
            }).catch(() => { });
          }
        });
      }
    }

    renderFirstShopLedScreen(true);
  }

  function updateCorridorLedProximityAudio() {
    const vid = corridorVideoState.video;
    if (!vid || !camera) return;

    if (getPlayingShopLedIndex() !== null || camera.position.x < -5.8 || corridorVideoState.tvZList.length === 0) {
      vid.volume = 0;
      return;
    }

    let minDist = Infinity;
    for (let i = 0; i < corridorVideoState.tvZList.length; i++) {
      const dx = camera.position.x - corridorVideoState.tvX;
      const dz = camera.position.z - corridorVideoState.tvZList[i];
      const d = Math.hypot(dx, dz);
      if (d < minDist) minDist = d;
    }

    if (minDist >= 8.0) {
      vid.volume = 0;
    } else {
      const norm = Math.min(1, Math.max(0, (8.0 - minDist) / 6.5));
      vid.volume = Math.pow(norm, 1.8) * 0.22;
    }
  }

  function updateCinemaDoors() {
    if (!cinemaDoorState.doorGroup || !camera) return;
    const dist = Math.hypot(camera.position.x - cinemaDoorState.doorX, camera.position.z - cinemaDoorState.doorZ);
    cinemaDoorState.targetProgress = dist < 7.5 ? 1 : 0;
    const diff = cinemaDoorState.targetProgress - cinemaDoorState.openProgress;
    if (Math.abs(diff) > 0.001) {
      cinemaDoorState.openProgress += diff * 0.065;
      const angle = cinemaDoorState.openProgress * (Math.PI * 0.48);
      cinemaDoorState.doorGroup.rotation.y = angle;
    }
  }

  /**
   * Render Loop
   */
  function animate() {
    if (!isRunning) return;

    currentYaw += (targetYaw - currentYaw) * 0.09;
    currentPitch += (targetPitch - currentPitch) * 0.09;

    camera.rotation.set(currentPitch, currentYaw, 0, 'YXZ');

    updatePlayerMovement();

    updateShopLedButtonUI();
    updateAllShopLightingFades();
    renderFirstShopLedScreen(false);
    updateCorridorLedProximityAudio();
    updateCinemaDoors();

    renderer.render(scene, camera);
    animFrameId = requestAnimationFrame(animate);
  }

  function start() {
    if (isRunning) return;
    isRunning = true;
    if (corridorVideoState.video) {
      corridorVideoState.video.play().catch(() => { });
    }
    onWindowResize();
    animFrameId = requestAnimationFrame(animate);
  }

  function stop() {
    isRunning = false;
    if (corridorVideoState.video) {
      corridorVideoState.video.pause();
    }
    if (shop2VideoState.video) {
      shop2VideoState.video.pause();
    }
    if (shop3VideoState.video) {
      shop3VideoState.video.pause();
    }
    [0, 1, 2].forEach(idx => pauseShopLed(idx));
    updateShopLedButtonUI();
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  }

  /**
   * Open Dedicated Fullscreen SPACE Overlay
   */
  function openSpace() {
    container = document.getElementById('subpage-space');
    if (!container) return;

    container.style.display = 'block';
    document.body.classList.add('has-space-active');
    document.documentElement.classList.add('has-space-active');

    if (screen.orientation && screen.orientation.lock) {
      try {
        screen.orientation.lock('landscape').catch(() => { });
      } catch (_) { }
    }

    initEngine();
    setTimeout(onWindowResize, 50);
    setTimeout(onWindowResize, 200);
  }

  /**
   * Close Dedicated SPACE Overlay & Return to Settings
   */
  function closeSpace() {
    if (container) container.style.display = 'none';
    document.body.classList.remove('has-space-active');
    document.documentElement.classList.remove('has-space-active');

    stop();

    if (screen.orientation && screen.orientation.unlock) {
      try {
        screen.orientation.unlock();
      } catch (_) { }
    }

    if (typeof window.setFloatingNavVisible === 'function') {
      window.setFloatingNavVisible(true);
    }
  }

  // Settings UI: SPACE Screen Look Sensitivity Slider
  function initSpaceSensitivityControl() {
    const slider = document.getElementById('space-sensitivity-slider');
    const valEl = document.getElementById('space-sensitivity-val');
    if (!slider || !valEl) return;

    slider.value = String(lookSensitivity.toFixed(1));
    valEl.textContent = lookSensitivity.toFixed(1) + 'x';

    slider.addEventListener('input', () => {
      const v = parseFloat(slider.value);
      if (isFinite(v)) {
        lookSensitivity = Math.min(3.0, Math.max(0.5, v));
        valEl.textContent = lookSensitivity.toFixed(1) + 'x';
        try {
          localStorage.setItem(SENSITIVITY_STORAGE_KEY, String(lookSensitivity));
        } catch (_) { }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSpaceSensitivityControl);
  } else {
    initSpaceSensitivityControl();
  }

  // Public API
  window.vievSpaceWorld = {
    open: openSpace,
    close: closeSpace,
    init: initEngine,
    start: start,
    stop: stop
  };

})();
