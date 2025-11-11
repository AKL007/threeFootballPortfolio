import * as THREE from 'three';
import { gameState } from '../core/gameState.js';

export function startPenaltyMode() {
    gameState.penaltyMode = true;
    gameState.penaltyPower = 0;
    gameState.penaltyDirection.set(0, 0);
    document.getElementById('instructions').innerHTML = 
        '<strong>Penalty Mode:</strong><br>Arrow Keys: Aim<br>Space: Hold to power up, release to shoot<br>ESC: Cancel';
}

export function shootPenalty() {
    if (!gameState.penaltyMode) return;
    
    const shootDirection = new THREE.Vector3(
        gameState.penaltyDirection.x,
        0.3,
        -1 + gameState.penaltyDirection.y
    ).normalize();
    
    const shootPower = gameState.penaltyPower * 30;
    gameState.ballVelocity = shootDirection.multiplyScalar(shootPower);
    
    gameState.penaltyMode = false;
    document.getElementById('instructions').innerHTML = 
        '<strong>Controls:</strong><br>WASD / Arrow Keys: Move player<br>Mouse: Look around<br>Enter: Interact<br>Space: Shoot (in penalty mode)';
}

