import * as THREE from 'three';

/**
 * Creates a low poly tree with a trunk and foliage.
 * @param {number} trunkHeight - Height of the trunk
 * @param {number} trunkRadius - Radius of the trunk
 * @param {number} foliageSize - Size of the foliage
 * @param {Object} options - Optional parameters for variation
 * @returns {THREE.Group} Group containing the tree
 */
export function createLowPolyTree(trunkHeight = 5, trunkRadius = 0.3, foliageSize = 3.5, options = {}) {
    const treeGroup = new THREE.Group();
    
    const trunkColor = options.trunkColor || 0x4a3728;
    const foliageColor = options.foliageColor || 0x2d5016;
    const segments = options.segments || 8; // Low poly = fewer segments
    
    // Trunk (cylinder)
    const trunkGeometry = new THREE.CylinderGeometry(trunkRadius, trunkRadius * 1.1, trunkHeight, segments);
    const trunkMaterial = new THREE.MeshStandardMaterial({ 
        color: trunkColor,
        roughness: 0.9,
        metalness: 0.0,
        flatShading: true
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = trunkHeight / 2;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    treeGroup.add(trunk);
    
    // Foliage (cone for low poly look)
    const foliageGeometry = new THREE.ConeGeometry(foliageSize, foliageSize * 1.2, segments);
    const foliageMaterial = new THREE.MeshStandardMaterial({ 
        color: foliageColor,
        roughness: 0.8,
        metalness: 0.0,
        flatShading: true
    });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = trunkHeight + foliageSize * 0.4;
    foliage.castShadow = true;
    foliage.receiveShadow = true;
    treeGroup.add(foliage);
    
    // Optional: Add a second smaller foliage layer for more variation
    
    const foliage2Size = foliageSize * 0.7;
    const foliage2Geometry = new THREE.ConeGeometry(foliage2Size, foliage2Size * 1.2, segments);
    const foliage2 = new THREE.Mesh(foliage2Geometry, foliageMaterial);
    foliage2.position.y = trunkHeight + foliageSize * 0.6 + foliage2Size * 0.3;
    foliage2.castShadow = true;
    foliage2.receiveShadow = true;
    treeGroup.add(foliage2);
    
    return treeGroup;
}

/**
 * Creates a cluster of trees in a corner area.
 * @param {number} centerX - X center position
 * @param {number} centerZ - Z center position
 * @param {number} count - Number of trees in the cluster
 * @param {number} spread - Spread radius for tree placement
 * @returns {THREE.Group} Group containing all trees in the cluster
 */
export function createTreeCluster(centerX, centerZ, count = 5, spread = 8) {
    const clusterGroup = new THREE.Group();
    
    for (let i = 0; i < count; i++) {
        // Random position within spread radius
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * spread;
        const x = centerX + Math.cos(angle) * distance;
        const z = centerZ + Math.sin(angle) * distance;
        
        // Random tree size variation
        const trunkHeight = 4 + Math.random() * 2.5;
        const trunkRadius = 0.25 + Math.random() * 0.15;
        const foliageSize = 2.5 + Math.random() * 2.0;
        
        // Random rotation for natural look
        const rotationY = Math.random() * Math.PI * 2;
        
        const tree = createLowPolyTree(trunkHeight, trunkRadius, foliageSize);
        tree.position.set(x, 0, z);
        tree.rotation.y = rotationY;
        clusterGroup.add(tree);
    }
    
    return clusterGroup;
}

