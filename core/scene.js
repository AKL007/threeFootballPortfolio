import * as THREE from 'three';

export function createScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xb9defe); // Sky blue
    
    // Add fog for atmospheric depth
    scene.fog = new THREE.FogExp2(0xb9defe, 0.005); // Exponential fog

    // debug utils
    const debugHelper = new THREE.AxesHelper(2);
    debugHelper.position.set(0, 1, 0);
    scene.add(debugHelper);

    return scene;
}

export function createCamera() {
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    return camera;
}

export function createRenderer() {
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        powerPreference: "high-performance" // Use dedicated GPU if available
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Set pixel ratio for high-DPI displays (capped for performance)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Enable shadow maps
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Tone mapping for better color reproduction
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0; // Adjust based on your lighting
    
    // Output encoding for better color accuracy
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    // Enable physically correct lighting
    renderer.useLegacyLights = false;
    
    document.body.appendChild(renderer.domElement);
    return renderer;
}

