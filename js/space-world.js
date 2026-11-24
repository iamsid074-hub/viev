/* =========================================================
   SPACE 3D WORLD: ULTRA-PREMIUM LUXURY MALL LANE
   Hyper-Realistic Architectural Promenade • Automatic Landscape
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

  // Camera & Interaction State
  const cameraY = 1.7; // Human standing eye level
  let targetYaw = 0;
  let targetPitch = 0;
  let currentYaw = 0;
  let currentPitch = 0;

  // Touch / Mouse Drag
  let isDragging = false;
  let prevPointerX = 0;
  let prevPointerY = 0;

  // Mall Dimensions
  const MALL_WIDTH = 12;
  const MALL_HEIGHT = 6.4;
  const MALL_LENGTH = 84;

  /**
   * Procedural High-Gloss Nero Marquina & Gold Marble Floor Texture
   */
  function createLuxuryMarbleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Deep obsidian black marble base
    ctx.fillStyle = '#0f1117';
    ctx.fillRect(0, 0, 1024, 1024);

    // Fine organic mineral noise
    const imgData = ctx.getImageData(0, 0, 1024, 1024);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * 16;
      data[i] = Math.min(255, Math.max(0, data[i] + n + 4));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n + 4));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n + 6));
    }
    ctx.putImageData(imgData, 0, 0);

    // Flowing golden marble veins (organic bezier curves)
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

    // Secondary delicate hairline white veins
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(150, 0);
    ctx.bezierCurveTo(280, 400, 420, 300, 600, 1024);
    ctx.stroke();
    ctx.restore();

    // Polished brass tile grid lines (2x2 slabs)
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
   * Procedural Multi-Tier Coffered Ceiling with Warm Linear LED Coves
   */
  function createArchitecturalCeilingTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Dark architectural matte ceiling panels
    ctx.fillStyle = '#11131a';
    ctx.fillRect(0, 0, 1024, 1024);

    // Left linear warm LED cove slot
    const gradL = ctx.createLinearGradient(80, 0, 160, 0);
    gradL.addColorStop(0, 'rgba(255, 220, 140, 0)');
    gradL.addColorStop(0.5, 'rgba(255, 235, 180, 1)');
    gradL.addColorStop(1, 'rgba(255, 220, 140, 0)');
    ctx.fillStyle = gradL;
    ctx.fillRect(80, 0, 80, 1024);

    // Right linear warm LED cove slot
    const gradR = ctx.createLinearGradient(1024 - 160, 0, 1024 - 80, 0);
    gradR.addColorStop(0, 'rgba(255, 220, 140, 0)');
    gradR.addColorStop(0.5, 'rgba(255, 235, 180, 1)');
    gradR.addColorStop(1, 'rgba(255, 220, 140, 0)');
    ctx.fillStyle = gradR;
    ctx.fillRect(1024 - 160, 0, 80, 1024);

    // Center Grand Architectural Skylight Slot
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
   * Procedural Luxury Boutique Facades (Left or Right)
   */
  function createBoutiqueFacadeTexture(isRightSide) {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Dark architectural facade paneling
    ctx.fillStyle = '#14161f';
    ctx.fillRect(0, 0, 2048, 1024);

    const brands = isRightSide
      ? ['R O L E X', 'L O U I S   V U I T T O N', 'B V L G A R I', 'G U C C I']
      : ['T I F F A N Y   &   C O.', 'C A R T I E R', 'C H A N E L', 'D I O R'];

    const storeWidth = 512;
    for (let i = 0; i < 4; i++) {
      const startX = i * storeWidth;

      // Brass header band
      ctx.fillStyle = '#181b24';
      ctx.fillRect(startX + 20, 40, storeWidth - 40, 120);
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.55)';
      ctx.lineWidth = 3;
      ctx.strokeRect(startX + 20, 40, storeWidth - 40, 120);

      // Store brand name (illuminated golden serif)
      ctx.fillStyle = '#ffd778';
      ctx.shadowColor = '#d4af37';
      ctx.shadowBlur = 10;
      ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Playfair Display", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(brands[i], startX + storeWidth / 2, 110);
      ctx.shadowBlur = 0;

      // Double-Height Luxury Glass Display Vitrine
      ctx.fillStyle = '#0f121a';
      ctx.fillRect(startX + 24, 180, storeWidth - 48, 780);

      // Warm interior boutique glow
      const displayGrad = ctx.createLinearGradient(0, 180, 0, 960);
      displayGrad.addColorStop(0, 'rgba(255, 235, 180, 0.42)');
      displayGrad.addColorStop(0.3, 'rgba(255, 215, 140, 0.22)');
      displayGrad.addColorStop(0.8, 'rgba(20, 24, 35, 0.85)');
      displayGrad.addColorStop(1, 'rgba(12, 14, 20, 0.98)');
      ctx.fillStyle = displayGrad;
      ctx.fillRect(startX + 24, 180, storeWidth - 48, 780);

      // Luxury Display Pedestal inside vitrine
      ctx.fillStyle = 'rgba(212, 175, 55, 0.35)';
      ctx.fillRect(startX + storeWidth / 2 - 45, 620, 90, 260);

      // Champagne Brass Vitrine Frame
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.7)';
      ctx.lineWidth = 6;
      ctx.strokeRect(startX + 24, 180, storeWidth - 48, 780);

      // Boutique vertical dividing pillar
      ctx.fillStyle = '#090b10';
      ctx.fillRect(startX, 0, 18, 1024);
      ctx.fillRect(startX + storeWidth - 18, 0, 18, 1024);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 1);
    return texture;
  }

  /**
   * Build the 3D Mall Corridor Scene
   */
  function buildMallCorridor() {
    const halfW = MALL_WIDTH / 2;
    const halfH = MALL_HEIGHT / 2;

    // 1. High-Gloss Polished Marble Floor
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

    // 3. Left Luxury Boutique Facades
    const leftWallGeo = new THREE.PlaneGeometry(MALL_LENGTH, MALL_HEIGHT);
    leftWallGeo.rotateY(Math.PI / 2);
    const leftWallMat = new THREE.MeshStandardMaterial({
      map: createBoutiqueFacadeTexture(false),
      roughness: 0.25,
      metalness: 0.2,
      side: THREE.DoubleSide
    });
    const leftWall = new THREE.Mesh(leftWallGeo, leftWallMat);
    leftWall.position.set(-halfW, halfH, -MALL_LENGTH / 2 + 8);
    scene.add(leftWall);

    // 4. Right Luxury Boutique Facades
    const rightWallGeo = new THREE.PlaneGeometry(MALL_LENGTH, MALL_HEIGHT);
    rightWallGeo.rotateY(-Math.PI / 2);
    const rightWallMat = new THREE.MeshStandardMaterial({
      map: createBoutiqueFacadeTexture(true),
      roughness: 0.25,
      metalness: 0.2,
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

    // 6. Architectural Columns (Polished Brass & Black Marble)
    const pillarGeo = new THREE.BoxGeometry(0.7, MALL_HEIGHT, 0.7);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x0c0e14,
      roughness: 0.18,
      metalness: 0.45
    });

    const pillarSpacing = 8.4;
    const pillarCount = Math.floor(MALL_LENGTH / pillarSpacing);
    for (let i = 0; i < pillarCount; i++) {
      const zPos = 8 - i * pillarSpacing;

      // Left Pillar
      const leftPillar = new THREE.Mesh(pillarGeo, pillarMat);
      leftPillar.position.set(-halfW + 0.35, halfH, zPos);
      scene.add(leftPillar);

      // Right Pillar
      const rightPillar = new THREE.Mesh(pillarGeo, pillarMat);
      rightPillar.position.set(halfW - 0.35, halfH, zPos);
      scene.add(rightPillar);
    }

    // 7. Warm Interior Point Lights along Promenade
    const lightSpacing = 10;
    const lightCount = Math.floor(MALL_LENGTH / lightSpacing);
    for (let i = 0; i < lightCount; i++) {
      const zPos = 8 - i * lightSpacing;

      // Overhead warm ceiling spotlight casting down on marble
      const spotLight = new THREE.PointLight(0xffedd1, 1.6, 18, 1.5);
      spotLight.position.set(0, MALL_HEIGHT - 0.4, zPos);
      scene.add(spotLight);

      // Left window warm glow
      const leftLight = new THREE.PointLight(0xffdf9e, 1.1, 9, 2);
      leftLight.position.set(-halfW + 1.2, 2.6, zPos);
      scene.add(leftLight);

      // Right window warm glow
      const rightLight = new THREE.PointLight(0xffdf9e, 1.1, 9, 2);
      rightLight.position.set(halfW - 1.2, 2.6, zPos);
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

    // 1. Scene with atmospheric luxury warm depth fog
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0e14);
    scene.fog = new THREE.FogExp2(0x0c0e14, 0.012);

    // 2. Camera fixed at standing eye level in center of promenade
    camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 500);
    camera.position.set(0, cameraY, 3);

    // 3. Renderer with high performance & antialiasing
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

    // 5. Build the Mall Promenade
    buildMallCorridor();

    // 6. Setup Event Listeners
    setupInteractions(stageElement);
    setupBackAction();

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('orientationchange', () => {
      setTimeout(onWindowResize, 100);
      setTimeout(onWindowResize, 350);
    });

    start();
  }

  /**
   * Rotation-Aware Touch & Mouse Smooth Pan / Look Around
   */
  function setupInteractions(element) {
    function onPointerDown(e) {
      isDragging = true;
      prevPointerX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      prevPointerY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

      const screenDeltaX = clientX - prevPointerX;
      const screenDeltaY = clientY - prevPointerY;

      prevPointerX = clientX;
      prevPointerY = clientY;

      // Detect if stage is rotated 90deg via CSS (@media orientation: portrait)
      const isPortrait = window.innerHeight > window.innerWidth;
      let visualDeltaX = isPortrait ? screenDeltaY : screenDeltaX;
      let visualDeltaY = isPortrait ? -screenDeltaX : screenDeltaY;

      // Sensitivity
      targetYaw -= visualDeltaX * 0.0035;
      targetPitch -= visualDeltaY * 0.003;

      // Clamp vertical pitch (look up at ceiling lights or down at marble floor)
      targetPitch = Math.max(-0.65, Math.min(0.75, targetPitch));
      // Clamp horizontal yaw (smooth panoramic sweep)
      targetYaw = Math.max(-1.9, Math.min(1.9, targetYaw));
    }

    function onPointerUp() {
      isDragging = false;
    }

    element.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    element.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);
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
   * Render Loop (Smooth Camera Damping)
   */
  function animate() {
    if (!isRunning) return;

    // Smooth camera inertia damping (Lerp)
    currentYaw += (targetYaw - currentYaw) * 0.08;
    currentPitch += (targetPitch - currentPitch) * 0.08;

    camera.rotation.set(currentPitch, currentYaw, 0, 'YXZ');

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

    // Attempt hardware orientation lock to landscape if available
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
