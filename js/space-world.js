/* =========================================================
   SPACE 3D WORLD: REAL STRAIGHT LANE ENGINE
   Photorealistic Straight Highway in Deep Space
   Built with Three.js • VisionOS Aesthetics
   ========================================================= */

(function () {
  'use strict';

  let container = null;
  let canvas = null;
  let renderer = null;
  let scene = null;
  let camera = null;
  let animFrameId = null;
  let isRunning = false;

  // Camera & Movement State
  let cameraY = 1.6; // Human eye level in meters
  let targetYaw = 0;
  let targetPitch = 0;
  let currentYaw = 0;
  let currentPitch = 0;
  let isCruising = true; // Auto-walk forward along the lane by default
  let cruiseSpeed = 0.45; // Smooth realistic walking/gliding speed
  let roadPositionZ = 0;
  const ROAD_SEGMENT_LENGTH = 600;

  // Touch / Mouse Interaction State
  let isDragging = false;
  let prevPointerX = 0;
  let prevPointerY = 0;

  // Scene Objects
  let roadMeshes = [];
  let starField = null;
  let dustParticles = null;
  let roadsideLights = [];

  /**
   * Procedural High-Res Texture for Realistic Road Surface
   */
  function createRealisticRoadTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');

    // 1. Base dark asphalt color
    ctx.fillStyle = '#0f1118';
    ctx.fillRect(0, 0, 1024, 2048);

    // 2. Fine organic asphalt noise grain
    const imgData = ctx.getImageData(0, 0, 1024, 2048);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 18;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise + 2)); // Subtle cool blue tint
    }
    ctx.putImageData(imgData, 0, 0);

    // 3. Side curb shoulders (textured borders)
    ctx.fillStyle = '#090a0f';
    ctx.fillRect(0, 0, 80, 2048);
    ctx.fillRect(1024 - 80, 0, 80, 2048);

    // 4. Outer Boundary Lines (Solid luminous cyan-white)
    ctx.shadowColor = '#00f2fe';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#f0f9ff';
    ctx.fillRect(90, 0, 22, 2048);
    ctx.fillRect(1024 - 90 - 22, 0, 22, 2048);

    // Subtle edge amber hazard strips
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(72, 0, 8, 2048);
    ctx.fillRect(1024 - 80, 0, 8, 2048);

    // 5. Center Dashed Line (Standard highway markings: 40px wide, 120px dash, 140px gap)
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffffff';
    const centerX = 512 - 14;
    const dashLength = 130;
    const gapLength = 150;
    let y = 0;
    while (y < 2048) {
      ctx.fillRect(centerX, y, 28, dashLength);
      y += dashLength + gapLength;
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 12);
    return texture;
  }

  /**
   * Procedural Roughness / Specular Texture for Asphalt
   */
  function createRoadRoughnessTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#666666';
    ctx.fillRect(0, 0, 512, 1024);

    const imgData = ctx.getImageData(0, 0, 512, 1024);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * 50;
      data[i] = Math.min(255, Math.max(0, data[i] + n));
      data[i + 1] = data[i];
      data[i + 2] = data[i];
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 12);
    return texture;
  }

  /**
   * Build Deep Space Starfield (10,000 stars with varied depths)
   */
  function buildDeepSpaceStarfield() {
    const starCount = 8000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const colorPalette = [
      new THREE.Color('#ffffff'), // Pure white
      new THREE.Color('#93c5fd'), // Star blue
      new THREE.Color('#c4b5fd'), // Violet starlight
      new THREE.Color('#fef08a'), // Warm amber
      new THREE.Color('#67e8f9')  // Cyan beacon
    ];

    for (let i = 0; i < starCount; i++) {
      // Distribute stars in spherical dome around scene
      const radius = 500 + Math.random() * 800;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = Math.max(10, radius * Math.sin(phi) * Math.sin(theta)); // Keep majority above road plane
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      sizeAttenuation: true
    });

    starField = new THREE.Points(geometry, material);
    scene.add(starField);
  }

  /**
   * Floating Stardust Particles
   */
  function buildCosmicDust() {
    const dustCount = 450;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = 0.5 + Math.random() * 8;
      positions[i * 3 + 2] = -Math.random() * ROAD_SEGMENT_LENGTH;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x00f2fe,
      size: 1.6,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });

    dustParticles = new THREE.Points(geometry, material);
    scene.add(dustParticles);
  }

  /**
   * Build the Straight Highway Lane
   */
  function buildStraightHighway() {
    const roadWidth = 14; // Realistic multi-lane width
    const roadLength = ROAD_SEGMENT_LENGTH;
    const roadGeo = new THREE.PlaneGeometry(roadWidth, roadLength, 1, 100);
    roadGeo.rotateX(-Math.PI / 2); // Lay flat on X-Z plane

    const roadTexture = createRealisticRoadTexture();
    const roughnessTexture = createRoadRoughnessTexture();

    const roadMat = new THREE.MeshStandardMaterial({
      map: roadTexture,
      roughnessMap: roughnessTexture,
      roughness: 0.38,
      metalness: 0.12,
      side: THREE.DoubleSide
    });

    const beaconGeo = new THREE.BoxGeometry(0.2, 0.9, 0.2);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
    const amberMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const spacing = 24;
    const count = Math.floor(roadLength / spacing);

    // Create 2 contiguous segments for infinite seamless cruising
    for (let i = 0; i < 2; i++) {
      const roadMesh = new THREE.Mesh(roadGeo, roadMat);
      roadMesh.position.set(0, 0, -i * roadLength);

      // Attach light beacons as children of the road segment
      for (let j = 0; j < count; j++) {
        const localZ = -roadLength / 2 + j * spacing;

        // Left cyan beacon
        const leftBeacon = new THREE.Mesh(beaconGeo, beaconMat);
        leftBeacon.position.set(-roadWidth / 2 - 0.3, 0.45, localZ);
        roadMesh.add(leftBeacon);

        // Right amber beacon
        const rightBeacon = new THREE.Mesh(beaconGeo, amberMat);
        rightBeacon.position.set(roadWidth / 2 + 0.3, 0.45, localZ);
        roadMesh.add(rightBeacon);
      }

      scene.add(roadMesh);
      roadMeshes.push(roadMesh);
    }
  }

  /**
   * Initialize Three.js Engine
   */
  function initEngine() {
    container = document.getElementById('subpage-space');
    const canvasWrap = document.getElementById('space-canvas-wrap');
    if (!container || !canvasWrap) return;

    if (renderer) {
      start();
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020208);
    // Depth fog fading straight lane smoothly into the cosmic horizon
    scene.fog = new THREE.FogExp2(0x02030a, 0.0032);

    // 2. Camera
    camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 2000);
    camera.position.set(0, cameraY, 0);

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.domElement.id = 'space-three-canvas';
    canvasWrap.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0x1a2238, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xdbeafe, 1.4);
    dirLight.position.set(30, 80, -50);
    scene.add(dirLight);

    const roadGlow = new THREE.PointLight(0x00f2fe, 1.5, 30);
    roadGlow.position.set(0, 3, -10);
    scene.add(roadGlow);

    // 5. Build Scene Content
    buildStraightHighway();
    buildDeepSpaceStarfield();
    buildCosmicDust();

    // 6. Setup Event Listeners
    setupInteractions(canvasWrap);
    setupHUD();

    window.addEventListener('resize', onWindowResize);

    start();
  }

  /**
   * Touch & Mouse Smooth Pan / Look Around
   */
  function setupInteractions(element) {
    const hint = document.getElementById('space-gesture-hint');

    function onPointerDown(e) {
      isDragging = true;
      prevPointerX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      prevPointerY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      if (hint) hint.style.opacity = '0';
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

      const deltaX = clientX - prevPointerX;
      const deltaY = clientY - prevPointerY;

      prevPointerX = clientX;
      prevPointerY = clientY;

      // Sensitivity
      targetYaw -= deltaX * 0.0035;
      targetPitch -= deltaY * 0.003;

      // Clamp vertical pitch so user doesn't look upside-down
      targetPitch = Math.max(-0.6, Math.min(0.65, targetPitch));
      // Clamp horizontal yaw to keep focus ahead on the straight lane (-75deg to +75deg)
      targetYaw = Math.max(-1.3, Math.min(1.3, targetYaw));
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
   * Setup Floating Action HUD
   */
  function setupHUD() {
    const cruiseBtn = document.getElementById('space-btn-cruise');
    const resetBtn = document.getElementById('space-btn-reset');

    if (cruiseBtn) {
      cruiseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isCruising = !isCruising;
        cruiseBtn.classList.toggle('is-active', isCruising);
        const label = cruiseBtn.querySelector('span');
        if (label) label.textContent = isCruising ? 'Gliding Forward' : 'Paused';
        if (window.triggerHaptic) window.triggerHaptic('light');
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        targetYaw = 0;
        targetPitch = 0;
        camera.position.x = 0;
        if (window.triggerHaptic) window.triggerHaptic('light');
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
   * Animation & Render Loop
   */
  function animate() {
    if (!isRunning) return;

    // Smooth inertia camera damping (Lerp)
    currentYaw += (targetYaw - currentYaw) * 0.08;
    currentPitch += (targetPitch - currentPitch) * 0.08;

    camera.rotation.set(currentPitch, currentYaw, 0, 'YXZ');

    // Straight Lane Forward Cruise / Walk
    if (isCruising) {
      camera.position.z -= cruiseSpeed;

      // Slight natural walking head-bob
      camera.position.y = cameraY + Math.sin(camera.position.z * 0.25) * 0.035;

      // Seamless road loop: when camera moves past a segment, push it forward
      roadMeshes.forEach(mesh => {
        if (camera.position.z < mesh.position.z - ROAD_SEGMENT_LENGTH) {
          mesh.position.z -= ROAD_SEGMENT_LENGTH * 2;
        }
      });
    }

    // Subtle cosmic starfield rotation
    if (starField) {
      starField.rotation.y += 0.00015;
    }

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

  // Public API exposed to Digi OS
  window.vievSpaceWorld = {
    init: initEngine,
    start: start,
    stop: stop
  };

})();
