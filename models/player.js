import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';

export function createPlayer(onLoaded) {
    const loader = new GLTFLoader();
    
    // Setup Draco loader for compressed geometry
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    loader.setDRACOLoader(dracoLoader);
    
    // Setup KTX2 loader for supercompressed textures
    const ktx2Loader = new KTX2Loader();
    ktx2Loader.setTranscoderPath('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/basis/');
    loader.setKTX2Loader(ktx2Loader);
    
    // Use optimized file if available, fallback to original
    // Note: In Vite, public/ directory files are served from root, so no 'public/' prefix needed
    const modelPath = '/models/glb/optimized/soccerAnimationsPack1.glb';
    const fallbackPath = '/models/glb/soccerAnimationsPack1.glb';
    
    loader.load(modelPath, (gltf) => {
        const model = gltf.scene;
        
        // Enable shadows on all meshes
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        // Create animation mixer
        const mixer = new THREE.AnimationMixer(model);
        const clips = gltf.animations;
        
        // Find and play idle animation
        const idleClip = THREE.AnimationClip.findByName(clips, 'Idle');
        if (idleClip) {
            const action = mixer.clipAction(idleClip);
            action.play();
        }
        
        // Store mixer in userData for animation updates
        model.userData.mixer = mixer;
        model.userData.animations = clips;
        
        // Set initial position
        model.position.set(0, 0, 0);

        // Scale the model to more realistic proportions
        model.scale.set(1.1, 1.1, 1.1);
        
        // Return the model and mixer via callback
        if (onLoaded) {
            onLoaded(model, mixer);
        }
    }, undefined, (error) => {
        console.warn('Failed to load optimized model, trying fallback:', error);
        // Fallback to original file if optimized version fails
        loader.load(fallbackPath, (gltf) => {
            const model = gltf.scene;
            
            // Enable shadows on all meshes
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            
            // Create animation mixer
            const mixer = new THREE.AnimationMixer(model);
            const clips = gltf.animations;
            
            // Find and play idle animation
            const idleClip = THREE.AnimationClip.findByName(clips, 'Idle');
            if (idleClip) {
                const action = mixer.clipAction(idleClip);
                action.play();
            }
            
            // Store mixer in userData for animation updates
            model.userData.mixer = mixer;
            model.userData.animations = clips;
            
            // Set initial position
            model.position.set(0, 0, 0);

            // Scale the model to more realistic proportions
            model.scale.set(1.1, 1.1, 1.1);
            
            // Return the model and mixer via callback
            if (onLoaded) {
                onLoaded(model, mixer);
            }
        }, undefined, (fallbackError) => {
            console.error('Error loading player model (both optimized and fallback failed):', fallbackError);
        });
    });
}
