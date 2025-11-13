import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function createPlayer(onLoaded) {
    const loader = new GLTFLoader();
    
    loader.load('public/models/glb/soccerAnimationsPack1.glb', (gltf) => {
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

        // Scale the model
        model.scale.set(1.1, 1.1, 1.1);
        
        // Return the model and mixer via callback
        if (onLoaded) {
            onLoaded(model, mixer);
        }
    }, undefined, (error) => {
        console.error('Error loading player model:', error);
    });
}
