// Building-related variables
const buildingData = []; // To store references to all buildings

const lowDetailBuildings = [
    'buildings/low-detail-building-a.glb',
    'buildings/low-detail-building-b.glb',
    'buildings/low-detail-building-c.glb',
    'buildings/low-detail-building-d.glb',
    'buildings/low-detail-building-f.glb',
    'buildings/low-detail-building-g.glb',
    'buildings/low-detail-building-h.glb',
    'buildings/low-detail-building-i.glb',
    'buildings/low-detail-building-l.glb',
    'buildings/low-detail-building-m.glb',
    'buildings/low-detail-building-n.glb',
    'buildings/building-a.glb',
    'buildings/building-b.glb',
    'buildings/building-c.glb',
    'buildings/building-d.glb',
    'buildings/building-f.glb',
    'buildings/building-g.glb',
    'buildings/building-h.glb',
    'buildings/building-i.glb',
    'buildings/building-l.glb',
    'buildings/building-m.glb',
    'buildings/building-n.glb',
    'buildings/building-skyscraper-a.glb',
    'buildings/building-skyscraper-b.glb',
    'buildings/building-skyscraper-c.glb',
    'buildings/building-skyscraper-d.glb'
];

const suburbanBuildings = [
    'suburban/building-type-a.glb',
    'suburban/building-type-b.glb',
    'suburban/building-type-c.glb',
    'suburban/building-type-d.glb',
    'suburban/building-type-f.glb',
    'suburban/building-type-g.glb',
    'suburban/building-type-h.glb',
    'suburban/building-type-i.glb',
    'suburban/building-type-l.glb',
    'suburban/building-type-m.glb',
    'suburban/building-type-n.glb',
    'suburban/building-type-o.glb',
    'suburban/building-type-p.glb',
    'suburban/building-type-q.glb',
    'suburban/building-type-r.glb',
    'suburban/building-type-s.glb',
    'suburban/building-type-t.glb',
    'suburban/building-type-u.glb'
];

/**
 * Creates a single building in a block centered at (xCenter, zCenter).
 */
function createBlock(xCenter, zCenter, blockMaxDimension, isSuburban = false) {
     // Randomly decide if a plot has a building
     if (Math.random() > 0.1) { 
        const buildingArray = isSuburban ? suburbanBuildings : lowDetailBuildings;
        const modelPath = buildingArray[Math.floor(Math.random() * buildingArray.length)];
        
        loader.load(modelPath, (gltf) => {
            const building = gltf.scene;
            const scale = modelPath.includes('low-detail') ? 15 : modelPath.includes('suburban') ? 5 : 5;
            building.scale.set(scale, scale, scale);
            building.position.set(xCenter, -0.1, zCenter);
            building.castShadow = true;
            building.receiveShadow = true;
            
            // Enable shadows for all meshes in the model
            building.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            
            scene.add(building);
            buildingData.push(building);
        });
    }
}

/**
 * Procedurally generates a grid of buildings on the created blocks.
 */
function createBuildings() {
    // The maximum dimension a building can take (width of the pavement block)
    const blockMaxDimension = PLOT_GRID_SIZE - ROAD_W; // 15 - 4 = 11
    // numBlocks is the number of blocks/roads in one half of the grid (e.g., 3)
    const numBlocks = Math.floor(gridSize / PLOT_GRID_SIZE / 2); 
    
    // Iterate through the block positions
    for (let i = 1; i <= numBlocks; i++) { 
        for (let j = 1; j <= numBlocks; j++) {
            
            // The center of the block is positioned at (i - 0.5) * PLOT_GRID_SIZE (e.g., 7.5, 22.5, 37.5)
            const plotCenterX = i * PLOT_GRID_SIZE - (PLOT_GRID_SIZE / 2);
            const plotCenterZ = j * PLOT_GRID_SIZE - (PLOT_GRID_SIZE / 2);

            // Create blocks in all four quadrants
            createBlock(plotCenterX, plotCenterZ, blockMaxDimension);
            createBlock(-plotCenterX, plotCenterZ, blockMaxDimension);
            createBlock(-plotCenterX, -plotCenterZ, blockMaxDimension);
            createBlock(plotCenterX, -plotCenterZ, blockMaxDimension);
        }
    }
}

/**
 * Creates a suburban area with suburban buildings.
 */
function createSuburbanArea() {
    const blockMaxDimension = PLOT_GRID_SIZE - ROAD_W;
    const offset = 90; // Offset from main city
    const numBlocks = Math.floor(gridSize / PLOT_GRID_SIZE / 2);
    
    // Create ground and roads
    createGround(offset, true, true);
    
    // Create buildings
    for (let i = 1; i <= numBlocks; i++) { 
        for (let j = 1; j <= numBlocks; j++) {
            const plotCenterX = i * PLOT_GRID_SIZE - (PLOT_GRID_SIZE / 2) + offset;
            const plotCenterZ = j * PLOT_GRID_SIZE - (PLOT_GRID_SIZE / 2);

            // Create blocks in all four quadrants
            createBlock(plotCenterX, plotCenterZ, blockMaxDimension, true);
            createBlock(-plotCenterX + 2 * offset, plotCenterZ, blockMaxDimension, true);
            createBlock(-plotCenterX + 2 * offset, -plotCenterZ, blockMaxDimension, true);
            createBlock(plotCenterX, -plotCenterZ, blockMaxDimension, true);
        }
    }
}