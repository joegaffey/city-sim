// Car-related variables
const cars = []; // To store car objects and their movement data
let activeCarIndex = -1; // Index of the car the camera is following
let isFirstPerson = false; // Camera mode flag

// Mouse drag variables for car camera
let isDragging = false;
let mouseX = 0, mouseY = 0;
let cameraRotationX = 0, cameraRotationY = 0;
let targetRotationX = 0, targetRotationY = 0;

// --- Configuration ---
const CAR_SPEED = 0.5;
// Constants for Collision Avoidance System (CAS)
const BASE_CAR_SPEED = CAR_SPEED * 0.1;
const DETECTION_DISTANCE = 8;
const STOPPING_DISTANCE = 2.5;

const vehicleModels = [
    'vehicles/sedan.glb',
    'vehicles/suv.glb',
    'vehicles/hatchback-sports.glb',
    'vehicles/sedan-sports.glb',
    'vehicles/taxi.glb',
    'vehicles/van.glb',
    'vehicles/truck.glb',
    'vehicles/police.glb'
];

/**
 * Toggles the camera view between orbit controls and first-person car cam.
 */
function toggleCameraView() {
    isFirstPerson = !isFirstPerson;
    
    const button = document.getElementById('toggleButton');
    const status = document.getElementById('viewStatus');

    if (isFirstPerson) {
        // Switch to first-person
        controls.enabled = false;
        button.textContent = "Switch to Overhead";
        status.textContent = "View: Car Cam";
        // Ensure a car is active when entering first-person
        if (activeCarIndex === -1 && cars.length > 0) {
            switchCarCamera();
        }
        // Add mouse event listeners for car camera
        document.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    } else {
        // Switch back to overhead
        controls.enabled = true;
        button.textContent = "Switch to Car Cam";
        status.textContent = "View: Overhead";
        
        // Reset camera position to a decent overview when returning to controls
        camera.position.set(gridSize * 0.8, gridSize * 0.8, gridSize * 0.8);
        controls.target.set(0, 0, 0); 
        controls.update();
        // Remove mouse event listeners
        document.removeEventListener('mousedown', onMouseDown);
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        // Reset camera rotation
        cameraRotationX = 0;
        cameraRotationY = 0;
        targetRotationX = 0;
        targetRotationY = 0; 
    }
}

/**
 * Selects a random car for the camera to follow.
 */
function switchCarCamera() {
    if (cars.length === 0) return;
    
    let newIndex;
    if (cars.length > 1) {
        // Find a new index that is different from the current one
        do {
            newIndex = Math.floor(Math.random() * cars.length);
        } while (newIndex === activeCarIndex);
    } else {
        newIndex = 0;
    }
    activeCarIndex = newIndex;
}

/**
 * Adds vehicle models to the scene.
 */
function createCars(count, offsetX = 0, pathIndexOffset = 0) {
    const roadLaneCenter = ROAD_W / 4; 
    const zRoadPos = PLOT_GRID_SIZE; 
    const xRoadPos = PLOT_GRID_SIZE; 

    for (let i = 0; i < count; i++) {
        const modelPath = vehicleModels[i % vehicleModels.length];
        
        let startX, startZ, direction, rotationY, pathIndex;

        // Path logic: Ensures cars stay in their correct lanes
        if (i % 4 === 0) { // Eastbound (+X) on Z-road (Top Lane)
            startX = offsetX - gridSize / 2;
            startZ = zRoadPos + roadLaneCenter;
            direction = new THREE.Vector3(1, 0, 0);
            rotationY = -Math.PI / 2; 
            pathIndex = 0 + pathIndexOffset;
        } else if (i % 4 === 1) { // Westbound (-X) on Z-road (Bottom Lane)
            startX = offsetX + gridSize / 2;
            startZ = zRoadPos - roadLaneCenter;
            direction = new THREE.Vector3(-1, 0, 0);
            rotationY = Math.PI / 2;
            pathIndex = 1 + pathIndexOffset;
        } else if (i % 4 === 2) { // Northbound (+Z) on X-road (Right Lane)
            startX = xRoadPos + roadLaneCenter + offsetX;
            startZ = -gridSize / 2;
            direction = new THREE.Vector3(0, 0, 1);
            rotationY = 0;
            pathIndex = 2 + pathIndexOffset;
        } else { // Southbound (-Z) on X-road (Left Lane)
            startX = xRoadPos - roadLaneCenter + offsetX;
            startZ = gridSize / 2;
            direction = new THREE.Vector3(0, 0, -1);
            rotationY = Math.PI;
            pathIndex = 3 + pathIndexOffset;
        }

        loader.load(modelPath, (gltf) => {
            const car = gltf.scene;
            car.position.set(startX, ROAD_HEIGHT + 0.05, startZ);
            car.rotation.y = rotationY + Math.PI;
            car.castShadow = true;
            
            car.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            
            scene.add(car);
            
            cars.push({
                mesh: car,
                direction: direction,
                pathIndex: pathIndex,
                currentSpeed: BASE_CAR_SPEED
            });
        });
    }
}

/**
 * Updates the position of all animated car meshes and handles car looping, now including CAS.
 */
function updateCars() {
    // Boundary is slightly outside the grid for smooth looping
    const boundary = gridSize / 2 + 5; 

    cars.forEach((carA, indexA) => {
        let targetSpeed = BASE_CAR_SPEED; // Assume max speed by default

        // --- Collision Avoidance System (CAS) Check ---
        cars.forEach((carB, indexB) => {
            if (indexA === indexB || carA.pathIndex !== carB.pathIndex) return; // Skip self or different lane

            const distance = carA.mesh.position.distanceTo(carB.mesh.position);
            let isCarB_Ahead = false;

            // Check if carB is ahead of carA (simplified since they are in the same lane)
            if ((carA.pathIndex === 0 || carA.pathIndex === 4) && carB.mesh.position.x > carA.mesh.position.x) isCarB_Ahead = true; // Eastbound (+X)
            if ((carA.pathIndex === 1 || carA.pathIndex === 5) && carB.mesh.position.x < carA.mesh.position.x) isCarB_Ahead = true; // Westbound (-X)
            if ((carA.pathIndex === 2 || carA.pathIndex === 6) && carB.mesh.position.z > carA.mesh.position.z) isCarB_Ahead = true; // Northbound (+Z)
            if ((carA.pathIndex === 3 || carA.pathIndex === 7) && carB.mesh.position.z < carA.mesh.position.z) isCarB_Ahead = true; // Southbound (-Z)

            if (isCarB_Ahead && distance < DETECTION_DISTANCE) {
                if (distance < STOPPING_DISTANCE) {
                    // Hard stop if too close to avoid collision
                    targetSpeed = 0;
                } else {
                    // Smoothly slow down (brake factor goes from 0 to 1 as distance goes from STOPPING to DETECTION)
                    const brakeFactor = (distance - STOPPING_DISTANCE) / (DETECTION_DISTANCE - STOPPING_DISTANCE);
                    // Set target speed to a fraction of the full speed based on brake factor
                    targetSpeed = BASE_CAR_SPEED * brakeFactor * 0.8; 
                }
            }
        });
        
        // Gradually adjust the car's current speed towards the target speed for smooth acceleration/braking
        carA.currentSpeed += (targetSpeed - carA.currentSpeed) * 0.1;
        
        // Apply movement based on adjusted speed
        carA.mesh.position.addScaledVector(carA.direction, carA.currentSpeed);
        
        // Update car rotation to face movement direction
        const angle = Math.atan2(carA.direction.x, carA.direction.z);
        carA.mesh.rotation.y = angle;
        
        // --- Transparency Fading Logic ---
        // Ground extends from x=-50 to x=135, z=-50 to z=50
        const groundXMin = -50;
        const groundXMax = 135;
        const groundZMin = -50;
        const groundZMax = 50;
        const fadeDistance = 10; // Distance from edge to start fading
        
        let opacity = 1.0;
        
        // Calculate distance from X edges
        const distFromLeftEdge = carA.mesh.position.x - groundXMin;
        const distFromRightEdge = groundXMax - carA.mesh.position.x;
        
        // Calculate distance from Z edges
        const distFromBackEdge = carA.mesh.position.z - groundZMin;
        const distFromFrontEdge = groundZMax - carA.mesh.position.z;
        
        // Find minimum distance to any edge
        const minDistToEdge = Math.min(distFromLeftEdge, distFromRightEdge, distFromBackEdge, distFromFrontEdge);
        
        // Fade based on closest edge
        if (minDistToEdge < fadeDistance) {
            opacity = Math.max(0, minDistToEdge / fadeDistance);
        }
        
        // Apply opacity to all car materials
        carA.mesh.traverse((child) => {
            if (child.isMesh && child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => {
                        mat.transparent = true;
                        mat.opacity = opacity;
                    });
                } else {
                    child.material.transparent = true;
                    child.material.opacity = opacity;
                }
            }
        });
        
        // --- Looping Logic ---
        let shouldSwitch = false;
        
        // Unified boundaries for all cars to allow crossing between areas
        const xBoundaryMin = -boundary;
        const xBoundaryMax = 140; // Extends to cover suburban area

        // Check X direction and loop
        if (carA.direction.x > 0 && carA.mesh.position.x > xBoundaryMax) {
            carA.mesh.position.x = xBoundaryMin;
            // Reset opacity for fade-in effect
            carA.mesh.traverse((child) => {
                if (child.isMesh && child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => mat.opacity = 0);
                    } else {
                        child.material.opacity = 0;
                    }
                }
            });
            shouldSwitch = true;
        } else if (carA.direction.x < 0 && carA.mesh.position.x < xBoundaryMin) {
            carA.mesh.position.x = xBoundaryMax;
            // Reset opacity for fade-in effect
            carA.mesh.traverse((child) => {
                if (child.isMesh && child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => mat.opacity = 0);
                    } else {
                        child.material.opacity = 0;
                    }
                }
            });
            shouldSwitch = true;
        }

        // Check Z direction and loop (same for both areas)
        if (carA.direction.z > 0 && carA.mesh.position.z > boundary) {
            carA.mesh.position.z = -boundary;
            // Reset opacity for fade-in effect
            carA.mesh.traverse((child) => {
                if (child.isMesh && child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => mat.opacity = 0);
                    } else {
                        child.material.opacity = 0;
                    }
                }
            });
            shouldSwitch = true;
        } else if (carA.direction.z < 0 && carA.mesh.position.z < -boundary) {
            carA.mesh.position.z = boundary;
            // Reset opacity for fade-in effect
            carA.mesh.traverse((child) => {
                if (child.isMesh && child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => mat.opacity = 0);
                    } else {
                        child.material.opacity = 0;
                    }
                }
            });
            shouldSwitch = true;
        }

        // If the active car looped, switch the camera to a new car
        if (shouldSwitch && isFirstPerson && indexA === activeCarIndex) {
            switchCarCamera();
        }
    });
}

/**
 * Mouse event handlers for car camera rotation
 */
function onMouseDown(event) {
    if (!isFirstPerson) return;
    isDragging = true;
    mouseX = event.clientX;
    mouseY = event.clientY;
}

function onMouseMove(event) {
    if (!isFirstPerson || !isDragging) return;
    
    const deltaX = event.clientX - mouseX;
    const deltaY = event.clientY - mouseY;
    
    targetRotationY += deltaX * 0.005;
    targetRotationX += deltaY * 0.005;
    
    // Limit vertical rotation
    targetRotationX = Math.max(-Math.PI/4, Math.min(Math.PI/4, targetRotationX));
    
    mouseX = event.clientX;
    mouseY = event.clientY;
}

function onMouseUp(event) {
    if (!isFirstPerson) return;
    isDragging = false;
    // Return to center
    targetRotationX = 0;
    targetRotationY = 0;
}

/**
 * Updates the camera position to follow the active car.
 */
function updateCarCamera() {
    if (activeCarIndex === -1 || cars.length === 0) return;
    
    const activeCar = cars[activeCarIndex].mesh;
    const direction = cars[activeCarIndex].direction;
    
    // Smoothly interpolate camera rotation
    cameraRotationX += (targetRotationX - cameraRotationX) * 0.1;
    cameraRotationY += (targetRotationY - cameraRotationY) * 0.1;
    
    // 1. Position the camera slightly behind and above the car
    const cameraOffset = new THREE.Vector3().copy(direction).negate().multiplyScalar(5);
    const cameraPos = activeCar.position.clone().add(cameraOffset);
    cameraPos.y = ROAD_HEIGHT + 2;
    camera.position.copy(cameraPos);

    // 2. Look ahead with rotation applied
    const lookAhead = activeCar.position.clone().add(direction.clone().multiplyScalar(10));
    
    // Apply rotation to look direction
    const rotatedLookAhead = lookAhead.clone();
    rotatedLookAhead.x += Math.sin(cameraRotationY) * 5;
    rotatedLookAhead.y += Math.sin(cameraRotationX) * 3;
    
    camera.lookAt(rotatedLookAhead);
}