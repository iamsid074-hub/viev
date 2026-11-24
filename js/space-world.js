/* =========================================================
   SPACE 3D WORLD: ULTRA-PREMIUM LUXURY MALL LANE
   Modern Architectural Corridor • Polished Marble • Warm Coves
   Built with Three.js • VisionOS Aesthetics
   ========================================================= */

(function () {
  'use strict';

  let container = null;
  let canvasWrap = null;
  let renderer = null;
  let scene = null;
  let camera = null;
  let animFrameId = null;
  let isRunning = false;

  // Camera & Interaction State
  const cameraY = 1.7; // Natural standing eye level
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
  const MALL_HEIGHT = 6.2;
  const MALL_LENGTH = 90;

  /**
   * Procedural High-Gloss Italian Calacatta Marble Floor Texture
   */
  function createMarbleFloorTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Base warm pearl-white marble
    ctx.fillStyle = '#141720';
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle fine marble noise
    const imgData = ctx.getImageData(0, 0, 1024, 1024);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * 12;
      data[i] = Math.min(255, Math.max(0, data[i] + n + 4));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n + 4));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n + 6));
    }
    ctx.putImageData(imgData, 0, 0);

    // Marble tile joints & subtle golden inlay borders
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, 1024, 1024);

    // Center divider brass stripe
    ctx.fillStyle = 'rgba(212, 175, 55, 0.35)';
    ctx.fillRect(510, 0, 4, 1024);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 20);
    return texture;
  }

  /**
   * Procedural Architectural Ceiling Texture with Linear Warm LED Coves
   */
  function createCeilingTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Deep architectural matte dark graphite ceiling
    ctx.fillStyle = '#12141a';
    ctx.fillRect(0, 0, 1024, 1024);

    // Recessed linear warm LED strips along both sides
    ctx.fillStyle = '#fff4db';
    ctx.shadowColor = '#ffd27d';
    ctx.shadowBlur = 24;
    ctx.fillRect(120, 0, 24, 1024);
    ctx.fillRect(1024 - 144, 0, 24, 1024);

    // Center ambient light slot
    ctx.fillStyle = '#ffe9b8';
    ctx.shadowColor = '#ffc252';
    ctx.shadowBlur = 30;
    ctx.fillRect(496, 0, 32, 1024);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 15);
    return texture;
  }

  /**
   * Procedural Luxury Boutique Storefront Facade Texture
   */
  function createBoutiqueFacadeTexture(isRightSide) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Dark architectural boutique cladding
    ctx.fillStyle = '#151720';
    ctx.fillRect(0, 0, 1024, 1024);

    // Warm luminous luxury window display
    ctx.fillStyle = '#1e2230';
    ctx.fillRect(80, 160, 864, 760);

    // Warm golden boutique interior glow
    const grad = ctx.createLinearGradient(0, 160, 0, 920);
    grad.addColorStop(0, 'rgba(255, 230, 180, 0.45)');
    grad.addColorStop(0.5, 'rgba(255, 215, 140, 0.25)');
    grad.addColorStop(1, 'rgba(30, 34, 48, 0.9)');
    ctx.fillStyle = grad;
    ctx.fillRect(80, 160, 864, 760);

    // Champagne brass framing
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.65)';
    ctx.lineWidth = 10;
    ctx.strokeRect(80, 160, 864, 760);

    // Modern minimalist sign header
    ctx.fillStyle = 'rgba(212, 175, 55, 0.9)';
    ctx.font = 'bold 36px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isRightSide ? 'H A U T E   L U X E' : 'M A I S O N   V I E V', 512, 110);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 1);
    return texture;
  }

  /**
   * Construct the 3D Mall Corridor Scene
   */
  function buildMallCorridor() {
    const halfW = MALL_WIDTH / 2;
    const halfH = MALL_HEIGHT / 2;

    // 1. Polished Reflective Marble Floor
    const floorGeo = new THREE.PlaneGeometry(MALL_WIDTH, MALL_LENGTH);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      map: createMarbleFloorTexture(),
      roughness: 0.18,
      metalness: 0.22,
      side: THREE.DoubleSide
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.set(0, 0, -MALL_LENGTH / 2 + 10);
    scene.add(floorMesh);

    // 2. High-End Modern Architectural Ceiling with Warm LED Coves
    const ceilingGeo = new THREE.PlaneGeometry(MALL_WIDTH, MALL_LENGTH);
    ceilingGeo.rotateX(Math.PI / 2);
    const ceilingMat = new THREE.MeshStandardMaterial({
      map: createCeilingTexture(),
      roughness: 0.5,
      metalness: 0.1,
      emissive: new THREE.Color(0xffe2ad),
      emissiveIntensity: 0.35,
      side: THREE.DoubleSide
    });
    const ceilingMesh = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceilingMesh.position.set(0, MALL_HEIGHT, -MALL_LENGTH / 2 + 10);
    scene.add(ceilingMesh);

    // 3. Left Boutique Storefronts
    const leftWallGeo = new THREE.PlaneGeometry(MALL_LENGTH, MALL_HEIGHT);
    leftWallGeo.rotateY(Math.PI / 2);
    const leftWallMat = new THREE.MeshStandardMaterial({
      map: createBoutiqueFacadeTexture(false),
      roughness: 0.3,
      metalness: 0.15,
      side: THREE.DoubleSide
    });
    const leftWall = new THREE.Mesh(leftWallGeo, leftWallMat);
    leftWall.position.set(-halfW, halfH, -MALL_LENGTH / 2 + 10);
    scene.add(leftWall);

    // 4. Right Boutique Storefronts
    const rightWallGeo = new THREE.PlaneGeometry(MALL_LENGTH, MALL_HEIGHT);
    rightWallGeo.rotateY(-Math.PI / 2);
    const rightWallMat = new THREE.MeshStandardMaterial({
      map: createBoutiqueFacadeTexture(true),
      roughness: 0.3,
      metalness: 0.15,
      side: THREE.DoubleSide
    });
    const rightWall = new THREE.Mesh(rightWallGeo, rightWallMat);
    rightWall.position.set(halfW, halfH, -MALL_LENGTH / 2 + 10);
    scene.add(rightWall);

    // 5. Far End Architectural Glass Feature Wall
    const endWallGeo = new THREE.PlaneGeometry(MALL_WIDTH, MALL_HEIGHT);
    const endWallMat = new THREE.MeshStandardMaterial({
      color: 0x161922,
      roughness: 0.25,
      metalness: 0.3
    });
    const endWall = new THREE.Mesh(endWallGeo, endWallMat);
    endWall.position.set(0, halfH, -MALL_LENGTH + 10);
    scene.add(endWall);

    // 6. Architectural Columns (Polished Brass & Black Marble)
    const pillarGeo = new THREE.BoxGeometry(0.7, MALL_HEIGHT, 0.7);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x0f1118,
      roughness: 0.2,
      metalness: 0.5
    });

    const pillarSpacing = 9;
    const pillarCount = Math.floor(MALL_LENGTH / pillarSpacing);
    for (let i = 0; i < pillarCount; i++) {
      const zPos = 10 - i * pillarSpacing;

      // Left Pillar
      const leftPillar = new THREE.Mesh(pillarGeo, pillarMat);
      leftPillar.position.set(-halfW + 0.35, halfH, zPos);
      scene.add(leftPillar);

      // Right Pillar
      const rightPillar = new THREE.Mesh(pillarGeo, pillarMat);
      rightPillar.position.set(halfW - 0.35, halfH, zPos);
      scene.add(rightPillar);
    }

    // 7. Real Interior Lights (Warm Ceiling Spotlights)
    const lightSpacing = 12;
    const lightCount = Math.floor(MALL_LENGTH / lightSpacing);
    for (let i = 0; i < lightCount; i++) {
      const zPos = 10 - i * lightSpacing;

      // Warm overhead spotlight casting downward pool on the marble floor
      const ceilingLight = new THREE.PointLight(0xfff1d6, 1.8, 16, 1.6);
      ceilingLight.position.set(0, MALL_HEIGHT - 0.3, zPos);
      scene.add(ceilingLight);

      // Left boutique window warm accent
      const leftStoreLight = new THREE.PointLight(0xffdd99, 1.2, 10, 2);
      leftStoreLight.position.set(-halfW + 1.2, 2.8, zPos);
      scene.add(leftStoreLight);

      // Right boutique window warm accent
      const rightStoreLight = new THREE.PointLight(0xffdd99, 1.2, 10, 2);
      rightStoreLight.position.set(halfW - 1.2, 2.8, zPos);
      scene.add(rightStoreLight);
    }
  }

  /**
   * Initialize Three.js Engine
   */
  function initEngine() {
    container = document.getElementById('subpage-space');
    canvasWrap = document.getElementById('space-canvas-wrap');
    if (!container || !canvasWrap) return;

    if (renderer) {
      start();
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene with warm architectural depth fog
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0e1017);
    scene.fog = new THREE.FogExp2(0x0e1017, 0.015);

    // 2. Camera fixed at standing eye level in center of lane
    camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 500);
    camera.position.set(0, cameraY, 4);

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

    // 4. Ambient and Directional Lights for realistic shadows and sheen
    const ambientLight = new THREE.AmbientLight(0xfff6ec, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffeed6, 1.2);
    dirLight.position.set(5, 12, 10);
    scene.add(dirLight);

    // 5. Build the Mall Corridor
    buildMallCorridor();

    // 6. Setup Event Listeners
    setupInteractions(canvasWrap);
    setupRotateHint();

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('orientationchange', () => {
      setTimeout(onWindowResize, 100);
      setTimeout(onWindowResize, 350);
    });

    start();
  }

  /**
   * Touch & Mouse Smooth Pan / Look Around (No walking)
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

      const deltaX = clientX - prevPointerX;
      const deltaY = clientY - prevPointerY;

      prevPointerX = clientX;
      prevPointerY = clientY;

      // Smooth look sensitivity
      targetYaw -= deltaX * 0.0035;
      targetPitch -= deltaY * 0.003;

      // Vertical pitch clamp: can look up at the ceiling lights and down at marble floor
      targetPitch = Math.max(-0.65, Math.min(0.75, targetPitch));
      // Horizontal yaw: free panoramic look
      targetYaw = Math.max(-1.8, Math.min(1.8, targetYaw));
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
   * Setup Rotate Dismiss Button
   */
  function setupRotateHint() {
    const dismissBtn = document.getElementById('space-rotate-dismiss');
    const overlay = document.getElementById('space-rotate-overlay');
    if (dismissBtn && overlay) {
      dismissBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        overlay.style.display = 'none';
        onWindowResize();
      });
    }

    // Custom back pill in case top bar is hidden
    const backBtn = document.getElementById('space-custom-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const settingsBack = document.getElementById('settings-back-btn');
        if (settingsBack) settingsBack.click();
      });
    }
  }

  function onWindowResize() {
    if (!container || !renderer || !camera) return;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
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

  // Public API
  window.vievSpaceWorld = {
    init: initEngine,
    start: start,
    stop: stop
  };

})();
