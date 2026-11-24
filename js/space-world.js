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
   */
  function createLuxuryMarbleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0f1117';
    ctx.fillRect(0, 0, 1024, 1024);

    const imgData = ctx.getImageData(0, 0, 1024, 1024);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * 16;
      data[i] = Math.min(255, Math.max(0, data[i] + n + 4));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n + 4));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n + 6));
    }
    ctx.putImageData(imgData, 0, 0);

    ctx.save();
    ctx.strokeStyle = 'rgba(230, 190, 100, 0.28)';
    ctx.lineWidth = 3;
    ctx.filter = 'blur(1.5px)';
    ctx.beginPath();
    ctx.moveTo(0, 200);
    ctx.bezierCurveTo(300, 150, 600, 450, 1024, 380);
    ctx.moveTo(100, 800);
    ctx.bezierCurveTo(450, 600, 750, 950, 1024, 750);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(150, 0);
    ctx.bezierCurveTo(280, 400, 420, 300, 600, 1024);
    ctx.stroke();
    ctx.restore();

    ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, 1024, 1024);
    ctx.strokeRect(0, 0, 512, 512);
    ctx.strokeRect(512, 0, 512, 512);
    ctx.strokeRect(0, 512, 512, 512);
    ctx.strokeRect(512, 512, 512, 512);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 18);
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

    // Rich velvet backdrop
    ctx.fillStyle = '#161922';
    ctx.fillRect(0, 0, 1024, 512);

    // Warm golden backlit display arch
    const archGrad = ctx.createRadialGradient(512, 280, 50, 512, 280, 420);
    archGrad.addColorStop(0, 'rgba(255, 235, 180, 0.35)');
    archGrad.addColorStop(0.6, 'rgba(212, 175, 55, 0.15)');
    archGrad.addColorStop(1, 'rgba(22, 25, 34, 0.95)');
    ctx.fillStyle = archGrad;
    ctx.fillRect(60, 60, 904, 430);

    // Luxury display shelving lines
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
    ctx.lineWidth = 4;
    ctx.strokeRect(60, 60, 904, 430);
    ctx.strokeRect(160, 200, 704, 180);

    // Illuminated brand logo on back wall
    ctx.fillStyle = '#ffd778';
    ctx.shadowColor = '#d4af37';
    ctx.shadowBlur = 12;
    ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Playfair Display", Georgia, serif';
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
    ctx.fillStyle = '#151720';
    ctx.fillRect(0, 0, 1024, 256);

    // Champagne brass border
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.65)';
    ctx.lineWidth = 6;
    ctx.strokeRect(12, 12, 1000, 232);

    // Brand name illuminated in gold
    ctx.fillStyle = '#ffd778';
    ctx.shadowColor = '#d4af37';
    ctx.shadowBlur = 14;
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
   * Procedural Premium White Gallery Wall Texture with Continuous Quote
   * "WE WILL DEFINETLY GET EACH OTHER"
   */
  function createWhiteWallWithTextTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 4096;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const bgGrad = ctx.createLinearGradient(0, 0, 0, 512);
    bgGrad.addColorStop(0, '#ebedf2');
    bgGrad.addColorStop(0.12, '#f6f7fa');
    bgGrad.addColorStop(0.88, '#f7f8fb');
    bgGrad.addColorStop(1, '#e8eaf0');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 4096, 512);

    const imgData = ctx.getImageData(0, 0, 4096, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * 8;
      data[i] = Math.min(255, Math.max(0, data[i] + n));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n));
    }
    ctx.putImageData(imgData, 0, 0);

    ctx.fillStyle = 'rgba(212, 175, 55, 0.55)';
    ctx.fillRect(0, 0, 4096, 12);

    ctx.fillStyle = 'rgba(212, 175, 55, 0.75)';
    ctx.fillRect(0, 502, 4096, 10);

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.04)';
    ctx.lineWidth = 2;
    for (let x = 512; x < 4096; x += 512) {
      ctx.beginPath();
      ctx.moveTo(x, 12);
      ctx.lineTo(x, 502);
      ctx.stroke();
    }

    ctx.font = 'bold 46px -apple-system, BlinkMacSystemFont, "Cinzel", "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const wordsWithPositions = [
      { text: 'W E', x: 380 },
      { text: 'W I L L', x: 1020 },
      { text: 'D E F I N E T L Y', x: 1880 },
      { text: 'G E T', x: 2720 },
      { text: 'E A C H', x: 3340 },
      { text: 'O T H E R', x: 3850 }
    ];

    const yPos = 256;

    ctx.shadowColor = 'rgba(0, 0, 0, 0.16)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;

    ctx.fillStyle = '#bfa14a';
    wordsWithPositions.forEach(item => {
      ctx.fillText(item.text, item.x, yPos);
    });

    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#f5df98';
    ctx.font = 'bold 46px -apple-system, BlinkMacSystemFont, "Cinzel", "Playfair Display", Georgia, serif';
    wordsWithPositions.forEach(item => {
      ctx.fillText(item.text, item.x - 1, yPos - 1);
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }

  /**
   * Build the 3D Mall Corridor Scene with Walkable Open Boutiques
   */
  function buildMallCorridor() {
    const halfW = MALL_WIDTH / 2; // 6 meters
    const halfH = MALL_HEIGHT / 2;

    // 1. High-Gloss Polished Marble Floor (Main Corridor)
    const floorGeo = new THREE.PlaneGeometry(MALL_WIDTH, MALL_LENGTH);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      map: createLuxuryMarbleTexture(),
      roughness: 0.12,
      metalness: 0.32,
      side: THREE.DoubleSide
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.set(0, 0, -MALL_LENGTH / 2 + 8);
    scene.add(floorMesh);

    // 2. Coffered Architectural Ceiling with Warm LED Coves
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

    // 3. OPEN WALKABLE BOUTIQUES ON LEFT SIDE
    const boutiqueBrands = [
      'TIFFANY & CO.',
      'CARTIER',
      'CHANEL',
      'DIOR'
    ];
    const shopSpan = 18; // Each shop is 18m long along Z
    const shopWidth = SHOP_DEPTH; // Extends 8m to the left: from x = -6 to x = -14
    const parquetTexture = createBoutiqueInteriorFloorTexture();

    const parquetMat = new THREE.MeshStandardMaterial({
      map: parquetTexture,
      roughness: 0.38,
      metalness: 0.12
    });

    const dividerWallMat = new THREE.MeshStandardMaterial({
      color: 0x161822,
      roughness: 0.4,
      metalness: 0.2
    });

    const pillarGeo = new THREE.BoxGeometry(0.8, MALL_HEIGHT, 1.2);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x0c0e14,
      roughness: 0.18,
      metalness: 0.45
    });

    for (let i = 0; i < boutiqueBrands.length; i++) {
      const brand = boutiqueBrands[i];
      const zCenter = 6 - i * (shopSpan + 2) - shopSpan / 2; // Center Z of this shop
      const zStart = zCenter + shopSpan / 2;
      const zEnd = zCenter - shopSpan / 2;

      // A) Boutique Interior Parquet Floor (Walkable inside!)
      const shopFloorGeo = new THREE.PlaneGeometry(shopWidth, shopSpan);
      shopFloorGeo.rotateX(-Math.PI / 2);
      const shopFloor = new THREE.Mesh(shopFloorGeo, parquetMat);
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
        emissiveIntensity: 0.25
      });
      const headerMesh = new THREE.Mesh(headerGeo, headerMat);
      headerMesh.position.set(-halfW, MALL_HEIGHT - 0.9, zCenter);
      scene.add(headerMesh);

      // F) Grand Portal Pillars (at edges of open entrance)
      const leftPortalPillar = new THREE.Mesh(pillarGeo, pillarMat);
      leftPortalPillar.position.set(-halfW, halfH, zStart);
      scene.add(leftPortalPillar);

      // G) Warm Glowing Boutique Interior Chandelier / Downlight
      const shopLight = new THREE.PointLight(0xffe8c2, 1.4, 16, 1.8);
      shopLight.position.set(-halfW - shopWidth / 2, MALL_HEIGHT - 1.2, zCenter);
      scene.add(shopLight);
    }

    // 4. Right Premium White Gallery Wall with Quote:
    // "WE WILL DEFINETLY GET EACH OTHER" from starting to end
    const rightWallGeo = new THREE.PlaneGeometry(MALL_LENGTH, MALL_HEIGHT);
    rightWallGeo.rotateY(-Math.PI / 2);
    const rightUV = rightWallGeo.attributes.uv;
    for (let i = 0; i < rightUV.count; i++) {
      rightUV.setX(i, 1 - rightUV.getX(i));
    }
    const rightWallMat = new THREE.MeshStandardMaterial({
      map: createWhiteWallWithTextTexture(),
      roughness: 0.35,
      metalness: 0.08,
      side: THREE.DoubleSide
    });
    const rightWall = new THREE.Mesh(rightWallGeo, rightWallMat);
    rightWall.position.set(halfW, halfH, -MALL_LENGTH / 2 + 8);
    scene.add(rightWall);

    // 5. Far End Grand Atrium Glass Wall
    const endWallGeo = new THREE.PlaneGeometry(MALL_WIDTH, MALL_HEIGHT);
    const endWallMat = new THREE.MeshStandardMaterial({
      color: 0x11141d,
      roughness: 0.2,
      metalness: 0.4
    });
    const endWall = new THREE.Mesh(endWallGeo, endWallMat);
    endWall.position.set(0, halfH, -MALL_LENGTH + 8);
    scene.add(endWall);

    // 6. Warm Interior Point Lights along Main Promenade
    const lightSpacing = 10;
    const lightCount = Math.floor(MALL_LENGTH / lightSpacing);
    for (let i = 0; i < lightCount; i++) {
      const zPos = 8 - i * lightSpacing;

      // Overhead warm ceiling spotlight casting down on marble
      const spotLight = new THREE.PointLight(0xffedd1, 1.6, 18, 1.5);
      spotLight.position.set(0, MALL_HEIGHT - 0.4, zPos);
      scene.add(spotLight);

      // Right white wall wash light (gently illuminates quote on white wall)
      const rightLight = new THREE.PointLight(0xfff5ea, 1.2, 12, 1.8);
      rightLight.position.set(halfW - 0.8, 3.2, zPos);
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

    function onPointerDown(e) {
      if (isJoystickActive) return;
      isJoystickActive = true;
      zone.classList.add('is-active');

      const touch = e.touches ? e.touches[0] : e;
      joystickTouchId = e.touches ? touch.identifier : 'mouse';
      updateJoystickCenter();
      handleJoystickMove(touch.clientX, touch.clientY);
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

    function onPointerMove(e) {
      if (!isJoystickActive) return;
      if (e.touches) {
        for (let i = 0; i < e.touches.length; i++) {
          if (e.touches[i].identifier === joystickTouchId) {
            handleJoystickMove(e.touches[i].clientX, e.touches[i].clientY);
            break;
          }
        }
      } else {
        handleJoystickMove(e.clientX, e.clientY);
      }
    }

    function onPointerUp(e) {
      if (!isJoystickActive) return;
      if (e.touches) {
        let touchStillActive = false;
        for (let i = 0; i < e.touches.length; i++) {
          if (e.touches[i].identifier === joystickTouchId) {
            touchStillActive = true;
            break;
          }
        }
        if (touchStillActive) return;
      }

      isJoystickActive = false;
      joystickTouchId = null;
      zone.classList.remove('is-active');
      thumb.style.transform = 'translate(0px, 0px)';
      joystickVector.x = 0;
      joystickVector.y = 0;
    }

    zone.addEventListener('touchstart', onPointerDown, { passive: false });
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);
    window.addEventListener('touchcancel', onPointerUp);

    zone.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
  }

  /**
   * Rotation-Aware Touch & Mouse Smooth Pan / Look Around (Right Screen)
   */
  function setupTouchLookControls(element) {
    const joystickZone = document.getElementById('space-joystick-zone');

    function isInsideJoystick(target) {
      return joystickZone && (joystickZone === target || joystickZone.contains(target));
    }

    function onPointerDown(e) {
      if (isInsideJoystick(e.target)) return;

      const touch = e.touches ? e.touches[0] : e;
      isDraggingLook = true;
      lookTouchId = e.touches ? touch.identifier : 'mouse';
      prevPointerX = touch.clientX;
      prevPointerY = touch.clientY;
    }

    function onPointerMove(e) {
      if (!isDraggingLook) return;

      let clientX = 0;
      let clientY = 0;

      if (e.touches) {
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
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

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

      // Vertical pitch clamp (look up at ceiling lights or down at marble floor)
      targetPitch = Math.max(-0.65, Math.min(0.75, targetPitch));
    }

    function onPointerUp(e) {
      if (e && e.touches && lookTouchId !== null) {
        for (let i = 0; i < e.touches.length; i++) {
          if (e.touches[i].identifier === lookTouchId) return;
        }
      }
      isDraggingLook = false;
      lookTouchId = null;
    }

    element.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);
    window.addEventListener('touchcancel', onPointerUp);

    element.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
  }

  /**
   * Laptop / Desktop Keyboard Controls (W/A/S/D & Arrow Keys + Shift)
   */
  function setupKeyboardControls() {
    const hintPill = document.getElementById('space-desktop-hint');

    function onKeyDown(e) {
      if (!isRunning) return;
      const code = e.code;

      let matched = false;
      if (code === 'KeyW' || code === 'ArrowUp') {
        keysPressed.forward = true;
        matched = true;
      } else if (code === 'KeyS' || code === 'ArrowDown') {
        keysPressed.backward = true;
        matched = true;
      } else if (code === 'KeyA' || code === 'ArrowLeft') {
        keysPressed.left = true;
        matched = true;
      } else if (code === 'KeyD' || code === 'ArrowRight') {
        keysPressed.right = true;
        matched = true;
      } else if (code === 'ShiftLeft' || code === 'ShiftRight') {
        keysPressed.sprint = true;
      }

      if (matched) {
        // Prevent page scroll when using arrow keys inside 3D world
        e.preventDefault();
        // Fade out hint after user begins moving
        if (hintPill) hintPill.style.opacity = '0.3';
      }
    }

    function onKeyUp(e) {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') {
        keysPressed.forward = false;
      } else if (code === 'KeyS' || code === 'ArrowDown') {
        keysPressed.backward = false;
      } else if (code === 'KeyA' || code === 'ArrowLeft') {
        keysPressed.left = false;
      } else if (code === 'KeyD' || code === 'ArrowRight') {
        keysPressed.right = false;
      } else if (code === 'ShiftLeft' || code === 'ShiftRight') {
        keysPressed.sprint = false;
      }
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
  }

  /**
   * Update Player Walking Movement based on Joystick + Keyboard Input & Collisions
   */
  function updatePlayerMovement() {
    if (!camera) return;

    // Combine on-screen joystick vector and physical keyboard inputs
    let inputX = joystickVector.x;
    let inputY = joystickVector.y;

    if (keysPressed.forward) inputY -= 1;
    if (keysPressed.backward) inputY += 1;
    if (keysPressed.left) inputX -= 1;
    if (keysPressed.right) inputX += 1;

    const inputMag = Math.hypot(inputX, inputY);
    if (inputMag > 0.05) {
      const normFactor = inputMag > 1 ? inputMag : 1;
      const normX = inputX / normFactor;
      const normY = inputY / normFactor;

      const currentSpeed = keysPressed.sprint ? WALK_SPEED * 1.55 : WALK_SPEED;
      const yaw = camera.rotation.y;

      // moveForward: negative Y is forward
      const moveForward = -normY;
      const moveRight = normX;

      // Direction vectors in X-Z ground plane
      const deltaX = (moveForward * (-Math.sin(yaw)) + moveRight * Math.cos(yaw)) * currentSpeed;
      const deltaZ = (moveForward * (-Math.cos(yaw)) + moveRight * (-Math.sin(yaw))) * currentSpeed;

      let nextX = camera.position.x + deltaX;
      let nextZ = camera.position.z + deltaZ;

      // Collision Boundaries:
      // 1. Right White Wall: x <= 5.2
      nextX = Math.min(5.2, nextX);

      // 2. Open Shops on Left: Can walk inside up to x = -13.2 (Shop depth)
      nextX = Math.max(-13.2, nextX);

      // 3. Corridor Length: from z = 6.0 (start) to z = -72.0 (far end)
      nextZ = Math.min(6.0, Math.max(-72.0, nextZ));

      // 4. Collision with dividing walls between shops when inside shop area (x < -5.8)
      if (nextX < -5.8) {
        const dividerZList = [-13, -33, -53];
        dividerZList.forEach(divZ => {
          if (Math.abs(nextZ - divZ) < 0.65) {
            nextZ = camera.position.z; // Block moving through dividing wall
          }
        });
      }

      camera.position.x = nextX;
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
