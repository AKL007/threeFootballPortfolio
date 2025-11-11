import { gameState } from '../core/gameState.js';

export function setupMouseControls(renderer, player) {
    let isPointerLocked = false;

    document.addEventListener('click', () => {
        renderer.domElement.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', () => {
        isPointerLocked = document.pointerLockElement === renderer.domElement;
    });

    document.addEventListener('mousemove', (event) => {
        if (!isPointerLocked) return;
        
        const sensitivity = 0.002;
        
        if (gameState.flyMode) {
            // Fly camera rotation
            gameState.flyCameraEuler.y -= event.movementX * sensitivity;
            gameState.flyCameraEuler.x -= event.movementY * sensitivity;
            
            // Clamp pitch to prevent gimbal lock
            const maxPitch = Math.PI / 2 - 0.1;
            gameState.flyCameraEuler.x = Math.max(-maxPitch, Math.min(maxPitch, gameState.flyCameraEuler.x));
        } else {
            // Normal player rotation
            player.rotation.y -= event.movementX * sensitivity;
        }
    });

    return { isPointerLocked };
}

