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

    // Clean Architectural Gallery Matte Off-White Wall
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 512);
    bgGrad.addColorStop(0, '#ebedf2');
    bgGrad.addColorStop(0.12, '#f6f7fa');
    bgGrad.addColorStop(0.88, '#f6f7fa');
    bgGrad.addColorStop(1, '#e4e7ed');
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

    const bayCenters = [512, 1536, 2560, 3584];

    // 1. Floating Illuminated Backlit Display Lightboxes (Matching Photo)
    bayCenters.forEach((cx, idx) => {
      const frameW = 460;
      const frameH = 210;
      const frameX = cx - frameW / 2;
      const frameY = 60;

      // Warm halo backlight
      ctx.save();
      ctx.shadowColor = 'rgba(255, 235, 180, 0.5)';
      ctx.shadowBlur = 24;
      ctx.fillStyle = '#11141c';
      ctx.fillRect(frameX, frameY, frameW, frameH);
      ctx.restore();

      // Champagne gold slim frame border
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.65)';
      ctx.lineWidth = 3;
      ctx.strokeRect(frameX, frameY, frameW, frameH);

      // Artwork inside frame (e.g. Glowing Apple logo on Bay 2, Luxury motif on others)
      if (idx === 1) {
        // Glowing Apple logo
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 18;
        ctx.font = 'bold 58px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('', cx, frameY + frameH / 2);
      } else {
        // High-end minimalist luxury geometric art lines
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, frameY + frameH / 2, 48, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ffd778';
        ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Cinzel", Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('EDITION', cx, frameY + frameH / 2);
      }
    });

    // 2. SOLID JET-BLACK ULTRA-BOLD TYPOGRAPHY: WRITTEN EXACTLY ONCE FROM START TO END
    // Zero overlapping: Each word has its own dedicated spacious gallery section!
    ctx.font = '900 76px -apple-system, BlinkMacSystemFont, "Montserrat", "Cinzel", "Arial Black", "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const words = [
      { text: 'W E', x: 3820 },
      { text: 'W I L L', x: 3260 },
      { text: 'D E F I N E T L Y', x: 2360 },
      { text: 'G E T', x: 1540 },
      { text: 'E A C H', x: 960 },
      { text: 'O T H E R', x: 360 }
    ];

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
      ctx.strokeText(w.text, w.x, 256);
      ctx.fillText(w.text, w.x, 256);
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

    // 1. DUAL-TONE LUXURY MARBLE FLOOR
    // A) Central & Right Walking Lane: Ultra High-Gloss Dark Nero Marquina Marble
    const darkFloorWidth = 8.8;
    const darkFloorGeo = new THREE.PlaneGeometry(darkFloorWidth, MALL_LENGTH);
    darkFloorGeo.rotateX(-Math.PI / 2);
    const darkFloorMat = new THREE.MeshStandardMaterial({
      map: createNeroMarquinaMarbleTexture(),
      roughness: 0.10,
      metalness: 0.38,
      side: THREE.DoubleSide
    });
    const darkFloor = new THREE.Mesh(darkFloorGeo, darkFloorMat);
    darkFloor.position.set(halfW - darkFloorWidth / 2, 0, -MALL_LENGTH / 2 + 8);
    scene.add(darkFloor);

    // B) Left Storefront Apron: Polished White Calacatta Marble Apron
    const whiteFloorWidth = 3.2;
    const whiteFloorGeo = new THREE.PlaneGeometry(whiteFloorWidth, MALL_LENGTH);
    whiteFloorGeo.rotateX(-Math.PI / 2);
    const whiteFloorMat = new THREE.MeshStandardMaterial({
      map: createCalacattaWhiteMarbleTexture(),
      roughness: 0.14,
      metalness: 0.20,
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
      roughness: 0.2,
      metalness: 0.85,
      emissive: new THREE.Color(0xc89d30),
      emissiveIntensity: 0.32
    });
    const brassStrip = new THREE.Mesh(brassStripGeo, brassStripMat);
    brassStrip.position.set(-halfW + whiteFloorWidth, 0.003, -MALL_LENGTH / 2 + 8);
    scene.add(brassStrip);

    // 2. Architectural Coffered Ceiling with Linear Warm LED Coves
    const ceilingGeo = new THREE.PlaneGeometry(MALL_WIDTH, MALL_LENGTH);
    ceilingGeo.rotateX(Math.PI / 2);
    const ceilingMat = new THREE.MeshStandardMaterial({
      map: createArchitecturalCeilingTexture(),
      roughness: 0.45,
      metalness: 0.15,
      emissive: new THREE.Color(0xffe8ba),
      emissiveIntensity: 0.48,
      side: THREE.DoubleSide
    });
    const ceilingMesh = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceilingMesh.position.set(0, MALL_HEIGHT, -MALL_LENGTH / 2 + 8);
    scene.add(ceilingMesh);

    // 3. OPEN WALKABLE LUXURY BOUTIQUES ON LEFT SIDE
    const boutiqueBrands = [
      'ARANY & CO.',
      'ZARA',
      'APPLE',
      'CARTIER'
    ];
    const shopSpan = 18; // Each shop is 18m long along Z
    const shopWidth = SHOP_DEPTH; // Extends 8m to the left: from x = -6 to x = -14
    const calacattaFloorTexture = createCalacattaWhiteMarbleTexture();

    const shopInteriorFloorMat = new THREE.MeshStandardMaterial({
      map: calacattaFloorTexture,
      roughness: 0.18,
      metalness: 0.15
    });

    const dividerWallMat = new THREE.MeshStandardMaterial({
      color: 0x161822,
      roughness: 0.4,
      metalness: 0.2
    });

    // Dark Architectural Pillars with Vertical LED Inlays
    const pillarGeo = new THREE.BoxGeometry(0.7, MALL_HEIGHT, 1.1);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x0c0e14,
      roughness: 0.18,
      metalness: 0.45
    });

    const pillarLightGeo = new THREE.BoxGeometry(0.06, MALL_HEIGHT * 0.78, 0.04);
    const pillarLightMat = new THREE.MeshStandardMaterial({
      color: 0xfff0d0,
      emissive: new THREE.Color(0xffdf99),
      emissiveIntensity: 1.4,
      roughness: 0.2
    });

    for (let i = 0; i < boutiqueBrands.length; i++) {
      const brand = boutiqueBrands[i];
      const zCenter = 6 - i * (shopSpan + 2) - shopSpan / 2; // Center Z of this shop
      const zStart = zCenter + shopSpan / 2;
      const zEnd = zCenter - shopSpan / 2;

      // A) Boutique Interior Polished Marble Floor (Walkable inside!)
      const shopFloorGeo = new THREE.PlaneGeometry(shopWidth, shopSpan);
      shopFloorGeo.rotateX(-Math.PI / 2);
      const shopFloor = new THREE.Mesh(shopFloorGeo, shopInteriorFloorMat);
      shopFloor.position.set(-halfW - shopWidth / 2, 0.01, zCenter);
      scene.add(shopFloor);

      // B) Boutique Interior Ceiling
      const shopCeilingGeo = new THREE.PlaneGeometry(shopWidth, shopSpan);
      shopCeilingGeo.rotateX(Math.PI / 2);
      const shopCeilingMat = new THREE.MeshStandardMaterial({
        color: 0x12141c,
        roughness: 0.6
      });
      const shopCeiling = new THREE.Mesh(shopCeilingGeo, shopCeilingMat);
      shopCeiling.position.set(-halfW - shopWidth / 2, MALL_HEIGHT, zCenter);
      scene.add(shopCeiling);

      // C) Boutique Back Display Wall at x = -14
      const backWallGeo = new THREE.PlaneGeometry(shopSpan, MALL_HEIGHT);
      backWallGeo.rotateY(Math.PI / 2);
      const backWallMat = new THREE.MeshStandardMaterial({
        map: createBoutiqueBackWallTexture(brand),
        roughness: 0.3,
        metalness: 0.2
      });
      const backWall = new THREE.Mesh(backWallGeo, backWallMat);
      backWall.position.set(-halfW - shopWidth, halfH, zCenter);
      scene.add(backWall);

      // D) Boutique Dividing Side Walls (between shops)
      const sideWallGeo = new THREE.PlaneGeometry(shopWidth, MALL_HEIGHT);
      const northSideWall = new THREE.Mesh(sideWallGeo, dividerWallMat);
      northSideWall.position.set(-halfW - shopWidth / 2, halfH, zStart);
      scene.add(northSideWall);

      const southSideWall = new THREE.Mesh(sideWallGeo, dividerWallMat);
      southSideWall.position.set(-halfW - shopWidth / 2, halfH, zEnd);
      scene.add(southSideWall);

      // E) Overhead Entrance Fascia Header Band (Above open entrance: y = 4.6 to 6.4)
      const headerGeo = new THREE.PlaneGeometry(shopSpan - 1.2, 1.8);
      headerGeo.rotateY(Math.PI / 2);
      const headerMat = new THREE.MeshStandardMaterial({
        map: createBoutiqueHeaderTexture(brand),
        roughness: 0.25,
        metalness: 0.3,
        emissive: new THREE.Color(0xffdf9e),
        emissiveIntensity: 0.3
      });
      const headerMesh = new THREE.Mesh(headerGeo, headerMat);
      headerMesh.position.set(-halfW, MALL_HEIGHT - 0.9, zCenter);
      scene.add(headerMesh);

      // F) Grand Portal Pillars (at edges of open entrance) with Vertical Warm LED Inlays
      const leftPortalPillar = new THREE.Mesh(pillarGeo, pillarMat);
      leftPortalPillar.position.set(-halfW, halfH, zStart);
      scene.add(leftPortalPillar);

      const pillarLED = new THREE.Mesh(pillarLightGeo, pillarLightMat);
      pillarLED.position.set(-halfW + 0.36, halfH, zStart);
      scene.add(pillarLED);

      // G) 3D Luxury Green Planter outside each Boutique Pillar
      const boutiquePlanter = createLuxuryPlanter(-halfW + 0.9, zStart - 0.8);
      scene.add(boutiquePlanter);

      // H) Store 1 ("ARANY & CO.") Signature Curved Illuminated Arch Showcase
      if (i === 0) {
        const archPlinthMat = new THREE.MeshStandardMaterial({
          color: 0xf5f6fa,
          roughness: 0.2,
          metalness: 0.1
        });
        const plinth1 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.7), archPlinthMat);
        plinth1.position.set(-halfW - 2.2, 0.45, zCenter - 2);
        scene.add(plinth1);

        const plinth2 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.1, 0.7), archPlinthMat);
        plinth2.position.set(-halfW - 2.2, 0.55, zCenter + 2);
        scene.add(plinth2);

        // Luxury display item box silhouettes on plinths
        const itemMat = new THREE.MeshStandardMaterial({
          color: 0x1a1c24,
          roughness: 0.3,
          metalness: 0.6
        });
        const item1 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), itemMat);
        item1.position.set(-halfW - 2.2, 1.08, zCenter - 2);
        scene.add(item1);

        const item2 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.45, 0.25), itemMat);
        item2.position.set(-halfW - 2.2, 1.33, zCenter + 2);
        scene.add(item2);
      }

      // I) Warm Glowing Boutique Interior Chandelier / Downlight
      const shopLight = new THREE.PointLight(0xffe8c2, 1.4, 16, 1.8);
      shopLight.position.set(-halfW - shopWidth / 2, MALL_HEIGHT - 1.2, zCenter);
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
      map: createWhiteWallWithTextTexture(),
      roughness: 0.82,
      metalness: 0.02,
      side: THREE.FrontSide
    });
    const rightWall = new THREE.Mesh(rightWallGeo, rightWallMat);
    rightWall.position.set(halfW, halfH, -MALL_LENGTH / 2 + 8);
    scene.add(rightWall);

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

    // Dedicated feature wall warm spotlight (casts grand reflections on dark floor!)
    const featureWallSpot = new THREE.PointLight(0xffedd1, 1.8, 18, 1.8);
    featureWallSpot.position.set(0, 3.8, -MALL_LENGTH + 14);
    scene.add(featureWallSpot);

    // 6. Warm Interior Point Lights along Main Promenade
    const lightSpacing = 10;
    const lightCount = Math.floor(MALL_LENGTH / lightSpacing);
    for (let i = 0; i < lightCount; i++) {
      const zPos = 8 - i * lightSpacing;

      // Overhead warm ceiling spotlight casting down on marble
      const spotLight = new THREE.PointLight(0xffedd1, 1.5, 18, 1.5);
      spotLight.position.set(0, MALL_HEIGHT - 0.4, zPos);
      scene.add(spotLight);

      // Soft diffuse gallery wall wash
      const rightLight = new THREE.PointLight(0xfff8ee, 0.45, 14, 2.0);
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

    // 4. Ambient and Directional Lights for realistic specular sheen
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 0.95);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffeed6, 1.25);
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
      if (nextX < -5.8 && [-13, -33, -53].some(divZ => Math.abs(camera.position.z - divZ) < 0.65)) {
        nextX = camera.position.x;
      }
      camera.position.x = nextX;

      let nextZ = camera.position.z + deltaZ;
      nextZ = Math.min(6.0, Math.max(-72.0, nextZ));
      if (camera.position.x < -5.8 && [-13, -33, -53].some(divZ => Math.abs(nextZ - divZ) < 0.65)) {
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
