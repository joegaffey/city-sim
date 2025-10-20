/**
 * Creates roads with optional offset and rotation.
 */
function createRoads(offsetX = 0, rotateIntersections = false) {
    const numBlocks = Math.floor(gridSize / PLOT_GRID_SIZE / 2);
    
    for (let i = -numBlocks; i <= numBlocks; i++) {
        for (let j = -numBlocks; j <= numBlocks; j++) {
            const roadX = i * PLOT_GRID_SIZE + offsetX;
            const roadZ = j * PLOT_GRID_SIZE;
            
            // Place intersections at every grid point
            loader.load('roads/road-crossroad.glb', (gltf) => {
                const intersection = gltf.scene;
                intersection.scale.set(8, 8, 8);
                intersection.position.set(roadX, ROAD_HEIGHT, roadZ);
                if (rotateIntersections) intersection.rotation.y = Math.PI / 2;
                intersection.receiveShadow = true;
                scene.add(intersection);
            });
            
            // Add horizontal road segments between intersections
            if (i < numBlocks) {
                loader.load('roads/road-straight.glb', (gltf) => {
                    const roadH = gltf.scene;
                    roadH.scale.set(8, 8, 8);
                    roadH.rotation.y = rotateIntersections ? Math.PI : 0;
                    roadH.position.set(roadX + PLOT_GRID_SIZE / 2, ROAD_HEIGHT, roadZ);
                    roadH.receiveShadow = true;
                    scene.add(roadH);
                });
            }
            
            // Add vertical road segments between intersections
            if (j < numBlocks) {
                loader.load('roads/road-straight.glb', (gltf) => {
                    const roadV = gltf.scene;
                    roadV.scale.set(8, 8, 8);
                    roadV.rotation.y = Math.PI / 2;
                    roadV.position.set(roadX, ROAD_HEIGHT, roadZ + PLOT_GRID_SIZE / 2);
                    roadV.receiveShadow = true;
                    scene.add(roadV);
                });
            }
        }
    }
}

/**
 * Creates ground with optional tiles and roads.
 */
function createGround(offsetX = 0, useTiles = false, rotateRoads = false) {
    if (!useTiles) {
        const baseGeo = new THREE.BoxGeometry(190, 1, gridSize);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x558855, roughness: 1 });
        const baseGround = new THREE.Mesh(baseGeo, baseMat);
        baseGround.receiveShadow = true;
        baseGround.position.set(45, -0.5, 0);
        scene.add(baseGround);
    } else {
        const numBlocks = Math.floor(gridSize / PLOT_GRID_SIZE / 2);
        
        for (let i = -numBlocks; i <= numBlocks; i++) {
            for (let j = -numBlocks; j <= numBlocks; j++) {
                const x = i * PLOT_GRID_SIZE + offsetX;
                const z = j * PLOT_GRID_SIZE;
                
                loader.load('roads/tile-low.glb', (gltf) => {
                    const tile = gltf.scene;
                    tile.position.set(x, -0.1, z);
                    tile.scale.setScalar(8);
                    tile.receiveShadow = true;
                    scene.add(tile);
                });
            }
        }
    }
    
    createRoads(offsetX, rotateRoads);
}