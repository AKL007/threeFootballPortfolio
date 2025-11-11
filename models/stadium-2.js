import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export async function createStadium() {
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync('/models/glb/euro_arena_soccer_stadium_euro_2020 - 1k.glb');
    const stadium = gltf.scene;

    console.log(stadium);
    
    // Scale/position as needed
    // You may need to adjust these values based on the model's actual size
    stadium.scale.set(1, 1, 1);
    stadium.position.set(0, 0, 0);
    
    // Enable shadows if the model has meshes
    stadium.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    
    return stadium;
}