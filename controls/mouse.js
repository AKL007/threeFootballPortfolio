import { gameState } from '../core/gameState.js';
import { CAMERA } from '../config/camera.js';

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
        
        if (gameState.flyMode) {
            // Fly camera rotation
            gameState.flyCameraEuler.y -= event.movementX * CAMERA.MOUSE.SENSITIVITY;
            gameState.flyCameraEuler.x -= event.movementY * CAMERA.MOUSE.SENSITIVITY;
            
            // Clamp pitch to prevent gimbal lock
            gameState.flyCameraEuler.x = Math.max(-CAMERA.FLY.MAX_PITCH, Math.min(CAMERA.FLY.MAX_PITCH, gameState.flyCameraEuler.x));
        } else {
            // FIFA-style fixed camera: mouse rotation disabled
            // Player rotation is controlled by movement direction only
            // No mouse rotation in normal gameplay mode
        }
    });

    return { isPointerLocked };
}

