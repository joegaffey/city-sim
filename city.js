// --- Global Variables ---
let scene, camera, renderer, controls;
const gridSize = 100; // Total area size

const loader = new THREE.GLTFLoader(); // GLB model loader

// New Grid Constants
const PLOT_GRID_SIZE = 15; // Spacing between road centers
const ROAD_W = 4;          // Width of the road (2 lanes)
const ROAD_HEIGHT = 0.1;
const SIDEWALK_HEIGHT = 0.3; // Height of the building block/pavement

/**
 * Initializes the Three.js scene, camera, renderer, and lights.
 */
function init() {
    // 1. SCENE SETUP
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Light blue sky

    // 2. CAMERA SETUP
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(gridSize * 0.8, gridSize * 0.8, gridSize * 0.8);
    
    // 3. RENDERER SETUP
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    // 4. CONTROLS
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // smooth rotation
    controls.dampingFactor = 0.05;
    controls.minDistance = 50;
    controls.maxDistance = 300;
    controls.maxPolarAngle = Math.PI / 2.2; 

    // 5. LIGHTING
    // Ambient light intensity set to 1.2 to soften shadows
    const ambientLight = new THREE.AmbientLight(0x404040, 1.2); 
    scene.add(ambientLight);

    // Directional light intensity remains at 1.2
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(gridSize * 1.5, gridSize * 2, gridSize * 1.5);
    directionalLight.castShadow = true;
    
    // Configure shadow map for better city shadows
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = gridSize * 5;
    directionalLight.shadow.camera.left = -gridSize;
    directionalLight.shadow.camera.right = gridSize;
    directionalLight.shadow.camera.top = gridSize;
    directionalLight.shadow.camera.bottom = -gridSize;
    
    // Increased radius to soften shadow edges
    directionalLight.shadow.radius = 4;

    scene.add(directionalLight);

    // 6. CREATE CITY ELEMENTS
    createGround();
    createBuildings();
    createSuburbanArea();
    createCars(8);
    createCars(4, 90, 4); 
    
    // Initialize active car index
    if (cars.length > 0) {
        switchCarCamera(); // Selects the first car to start with
    }
    
    // 7. EVENT LISTENERS
    window.addEventListener('resize', onWindowResize, false);
    document.getElementById('toggleButton').addEventListener('click', toggleCameraView);
    document.getElementById('switchCarButton').addEventListener('click', switchCarCamera);
    
    // Car camera mouse controls
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchstart', handleMouseDown);
    document.addEventListener('touchmove', handleMouseMove);
    document.addEventListener('touchend', handleMouseUp);
    
    // Start the animation loop
    animate();
}

/**
 * Main rendering loop.
 */
function animate() {
    requestAnimationFrame(animate);

    updateCars(); 
    updateCarCamera();
    
    if (!isFirstPerson) {
        controls.update(); 
    }
    
    renderer.render(scene, camera);
}

/**
 * Handles window resizing to keep the scene responsive.
 */
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Start the application when the window loads
window.onload = init;