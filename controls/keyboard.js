import { gameState } from '../core/gameState.js';
import { checkInteractions } from '../game/interactions.js';
import { startPenaltyMode, shootPenalty } from '../game/penalty.js';
import { exitZoomMode } from '../camera/cameraController.js';
import { closeModal } from '../ui/modal.js';
import { resetGameState } from '../game/reset.js';

let ball = null; // Will be set when ball is created

export function setBallReference(ballRef) {
    ball = ballRef;
}

export function setupKeyboardControls(player, camera) {
    document.addEventListener('keydown', (event) => {
        gameState.keys[event.code] = true;
        
        // Toggle fly mode with 'F' key
        if (event.code === 'KeyF' && !event.repeat) {
            gameState.flyMode = !gameState.flyMode;
            
            if (gameState.flyMode) {
                // Initialize fly camera rotation from current camera orientation
                gameState.flyCameraEuler.setFromQuaternion(camera.quaternion);
                gameState.flyCameraVelocity.set(0, 0, 0);
                console.log('Fly camera enabled - Use WASD to move, Q/E or Space/Shift to move up/down, Mouse to look around');
            } else {
                gameState.flyCameraVelocity.set(0, 0, 0);
                console.log('Fly camera disabled');
            }
        }
        
        if (event.code === 'Enter' && !gameState.penaltyMode && !gameState.zoomMode && !gameState.flyMode) {
            checkInteractions(player, camera);
        }
        
        // Reset game state with 'R' key
        if (event.code === 'KeyR' && !event.repeat && !gameState.flyMode) {
            if (ball) {
                resetGameState(player, ball);
            }
        }
        
        if (event.code === 'Escape') {
            if (gameState.flyMode) {
                gameState.flyMode = false;
                gameState.flyCameraVelocity.set(0, 0, 0);
                console.log('Fly camera disabled');
            } else if (gameState.penaltyMode) {
                gameState.penaltyMode = false;
                document.getElementById('instructions').innerHTML = 
                    '<strong>Controls:</strong><br>WASD / Arrow Keys: Move player<br>Mouse: Look around<br>Enter: Interact<br>Space: Shoot (in penalty mode)<br>F: Toggle fly camera (debug)';
            } else if (gameState.zoomMode) {
                exitZoomMode();
                closeModal();
            }
        }
    });

    document.addEventListener('keyup', (event) => {
        gameState.keys[event.code] = false;
        
        // Reset processed flags for action keys
        if (event.code === 'KeyS') {
            gameState.keys['KeyS_processed'] = false;
        }
        if (event.code === 'KeyW') {
            gameState.keys['KeyW_processed'] = false;
        }
        if (event.code === 'KeyA') {
            gameState.keys['KeyA_processed'] = false;
        }
        if (event.code === 'KeyD') {
            gameState.keys['KeyD_processed'] = false;
        }
        
        if (event.code === 'Space' && gameState.penaltyMode && !gameState.flyMode) {
            shootPenalty();
        }
    });
}

