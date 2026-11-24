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

      // A) Boutique Interior Polished Marble Floor (Perfect joint at y = 0.01)
      const floorGeo = createModularQuad(
        [xBack, 0.01, zStart], // TL: Back-North
        [xBack, 0.01, zEnd],   // TR: Back-South
        [xFront, 0.01, zStart],// BL: Front-North
        [xFront, 0.01, zEnd]   // BR: Front-South
      );
      const shopFloor = new THREE.Mesh(floorGeo, shopFloorMat);
      scene.add(shopFloor);

      // B) Boutique Interior Recessed Tray Ceiling (Perfect joint at y = MALL_HEIGHT)
      const ceilGeo = createModularQuad(
        [xFront, MALL_HEIGHT, zStart],// TL: Front-North
        [xFront, MALL_HEIGHT, zEnd],  // TR: Front-South
        [xBack, MALL_HEIGHT, zStart], // BL: Back-North
        [xBack, MALL_HEIGHT, zEnd]    // BR: Back-South
      );
      const shopCeiling = new THREE.Mesh(ceilGeo, firstShopCeilingMat);
      scene.add(shopCeiling);

      // C) Boutique Back Display Wall at x = xBack (-14.0m)
      const backWallGeo = createModularQuad(
        [xBack, MALL_HEIGHT, zStart], // TL: Top-North
        [xBack, MALL_HEIGHT, zEnd],   // TR: Top-South
        [xBack, 0, zStart],           // BL: Bottom-North
        [xBack, 0, zEnd]              // BR: Bottom-South
      );
      const backWall = new THREE.Mesh(backWallGeo, firstShopBackWallMat);
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

      // Brushed dark-metal backing chassis
      const shopLedChassis = new THREE.Mesh(
        new THREE.BoxGeometry(0.035, shopLedH, shopLedW),
        shopLedChassisMat
      );
      shopLedChassis.position.set(xBack + 0.068, shopLedY, zCenter);
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

      // Large blank glossy OLED glass panel facing +X (into shop & toward promenade)
      const shopLedScreenGeo = new THREE.PlaneGeometry(shopLedW, shopLedH);
      shopLedScreenGeo.rotateY(Math.PI / 2);
      const shopLedScreen = new THREE.Mesh(shopLedScreenGeo, shopLedGlassMat);
      shopLedScreen.position.set(xBack + 0.088, shopLedY, zCenter);
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
      const northSideWall = new THREE.Mesh(northWallGeo, firstShopSideWallMat);
      scene.add(northSideWall);

      // South Side Wall (at z = zEnd)
      const southWallGeo = createModularQuad(
        [xBack, MALL_HEIGHT, zEnd],    // TL: Back-Top
        [xFront, MALL_HEIGHT, zEnd],   // TR: Front-Top
        [xBack, 0, zEnd],              // BL: Back-Bottom
        [xFront, 0, zEnd]              // BR: Front-Bottom
      );
      const southSideWall = new THREE.Mesh(southWallGeo, firstShopSideWallMat);
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
    }

    // 4. RIGHT ARCHITECTURAL GALLERY WALL WITH JET-BLACK QUOTE & BACKLIT FRAMES
    // Built with exact left-to-right UV mapping & normal facing into corridor ([-1, 0, 0])
    // so text is 100% upright, un-mirrored, and reads naturally from left to right!
    const rightWallGeo = new THREE.BufferGeometry();
    const halfL = MALL_LENGTH / 2; // 42m
    const wallPositions = new Float32Array([
      // Triangle 1: TL, TR, BL
      0,  halfH,  halfL, // TL (x=0, y=3.2, z=+42)
      0,  halfH, -halfL, // TR (x=0, y=3.2, z=-42)
      0, -halfH,  halfL, // BL (x=0, y=-3.2, z=+42)

      // Triangle 2: TR, BR, BL
      0,  halfH, -halfL, // TR (x=0, y=3.2, z=-42)
      0, -halfH, -halfL, // BR (x=0, y=-3.2, z=-42)
      0, -halfH,  halfL  // BL (x=0, y=-3.2, z=+42)
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

    // 4.2. Real Wall-Mounted OLED LED TV Panels on Right Wall Opposite Every Shop (Blank / No Content Playing)
    function createRealOledGlassTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');

      // Pure deep obsidian OLED glass panel (blank, nothing playing)
      ctx.fillStyle = '#040508';
      ctx.fillRect(0, 0, 512, 256);

      // Subtle natural glass reflection gradient across the dark panel
      const glassGrad = ctx.createLinearGradient(0, 0, 512, 256);
      glassGrad.addColorStop(0, 'rgba(255, 250, 238, 0.045)');
      glassGrad.addColorStop(0.35, 'rgba(255, 250, 238, 0.01)');
      glassGrad.addColorStop(0.65, 'rgba(0, 0, 0, 0)');
      glassGrad.addColorStop(1, 'rgba(255, 250, 238, 0.025)');
      ctx.fillStyle = glassGrad;
      ctx.fillRect(0, 0, 512, 256);

      const tex = new THREE.CanvasTexture(canvas);
      tex.encoding = THREE.sRGBEncoding;
      return tex;
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
      map: createRealOledGlassTexture(),
      roughness: 0.06,
      metalness: 0.88
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

    boutiqueBrands.forEach((brand, i) => {
      const zStart = 6 - i * shopSpan;
      const zEnd = zStart - shopSpan;
      const zCenter = (zStart + zEnd) / 2;

      // 1. Recessed Wall-Mount Bracket (gives authentic floating shadow gap off the cream wall)
      const wallMount = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, ledHeight * 0.55, ledWidth * 0.65),
        oledMountMat
      );
      wallMount.position.set(halfW - 0.025, ledCenterY, zCenter);
      scene.add(wallMount);

      // 2. Main Ultra-Slim Brushed Metal Backing Chassis
      const chassisBox = new THREE.Mesh(
        new THREE.BoxGeometry(0.035, ledHeight, ledWidth),
        oledChassisMat
      );
      chassisBox.position.set(halfW - 0.068, ledCenterY, zCenter);
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

      // 4. Glossy Dark OLED Glass Panel (Blank / No Content Playing, Natural Specular Reflections)
      const glassGeo = new THREE.PlaneGeometry(ledWidth, ledHeight);
      glassGeo.rotateY(-Math.PI / 2);
      const glassMesh = new THREE.Mesh(glassGeo, oledGlassMat);
      glassMesh.position.set(halfW - 0.088, ledCenterY, zCenter);
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

    // 5. FAR END GRAND FEATURE WALL: "VIEV - EXPLORE MORE"
    const endWallGeo = new THREE.PlaneGeometry(MALL_WIDTH, MALL_HEIGHT);
    const endWallMat = new THREE.MeshStandardMaterial({
      map: createFarEndFeatureTexture(),
      roughness: 0.35,
      metalness: 0.25
    });
    const endWall = new THREE.Mesh(endWallGeo, endWallMat);
    endWall.position.set(0, halfH, -MALL_LENGTH + 8);
    scene.add(endWall);

    // Dedicated feature wall warm spotlight
    const featureWallSpot = new THREE.PointLight(0xffedd1, 1.1, 16, 2.0);
    featureWallSpot.position.set(0, 3.8, -MALL_LENGTH + 14);
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

    // 2. Camera fixed at standing eye level in center of promenade
    camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 500);
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

      targetYaw -= visualDeltaX * 0.0035;
      targetPitch -= visualDeltaY * 0.003;
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

      targetYaw -= visualDeltaX * 0.0035;
      targetPitch -= visualDeltaY * 0.003;
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
      nextX = Math.min(5.2, Math.max(-13.2, nextX));
      if (nextX < -5.8 && [-12, -30, -48].some(divZ => Math.abs(camera.position.z - divZ) < 0.65)) {
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
      nextZ = Math.min(6.0, Math.max(-66.0, nextZ));
      if (camera.position.x < -5.8 && [-12, -30, -48].some(divZ => Math.abs(nextZ - divZ) < 0.65)) {
        nextZ = camera.position.z;
      }
      camera.position.z = nextZ;

      // Subtle natural human walking head bob
      walkStepTime += keysPressed.sprint ? 0.22 : 0.14;
      camera.position.y = cameraY + Math.sin(walkStepTime) * 0.022;
    } else {
      // Smooth return to resting eye level
      camera.position.y += (cameraY - camera.position.y) * 0.1;
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
   * Render Loop
   */
  function animate() {
    if (!isRunning) return;

    // Smooth camera inertia damping (Lerp)
    currentYaw += (targetYaw - currentYaw) * 0.09;
    currentPitch += (targetPitch - currentPitch) * 0.09;

    camera.rotation.set(currentPitch, currentYaw, 0, 'YXZ');

    // Update First-Person Walking Movement from Joystick
    updatePlayerMovement();

    renderer.render(scene, camera);
    animFrameId = requestAnimationFrame(animate);
  }

  function start() {
    if (isRunning) return;
    isRunning = true;
    onWindowResize();
    animFrameId = requestAnimationFrame(animate);
  }

  function stop() {
    isRunning = false;
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
        screen.orientation.lock('landscape').catch(() => {});
      } catch (_) {}
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
      } catch (_) {}
    }

    if (typeof window.setFloatingNavVisible === 'function') {
      window.setFloatingNavVisible(true);
    }
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
