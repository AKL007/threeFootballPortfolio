import * as THREE from 'three';

export function setupLighting(scene) {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    // Directional light with improved shadow settings
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.15);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    
    // Larger shadow camera area for better coverage
    directionalLight.shadow.camera.left = -150;
    directionalLight.shadow.camera.right = 150;
    directionalLight.shadow.camera.top = 150;
    directionalLight.shadow.camera.bottom = -150;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    
    // Higher resolution shadow maps
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    
    // Softer shadow edges
    directionalLight.shadow.radius = 8;
    directionalLight.shadow.bias = -0.0001;
    
    // scene.add(directionalLight);

    const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1);
    scene.add(directionalLightHelper);
    
    // Optional: Add a subtle fill light from the opposite side
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.2);
    fillLight.position.set(-50, 50, -50);
    scene.add(fillLight);
}

