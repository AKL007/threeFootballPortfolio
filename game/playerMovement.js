import * as THREE from 'three';
import { gameState } from '../core/gameState.js';

export function updatePlayerMovement(delta, player, ball) {
    // Don't allow movement during zoom mode or fly mode
    if (gameState.zoomMode || gameState.flyMode) {
        return;
    }
    
    const speed = 15;
    const direction = new THREE.Vector3();
    
    if (gameState.keys['KeyW'] || gameState.keys['ArrowUp']) {
        direction.z -= 1;
    }
    if (gameState.keys['KeyS'] || gameState.keys['ArrowDown']) {
        direction.z += 1;
    }
    if (gameState.keys['KeyA'] || gameState.keys['ArrowLeft']) {
        direction.x -= 1;
    }
    if (gameState.keys['KeyD'] || gameState.keys['ArrowRight']) {
        direction.x += 1;
    }
    
    if (gameState.penaltyMode) {
        // Penalty mode controls
        if (gameState.keys['ArrowUp']) gameState.penaltyDirection.y += 0.02;
        if (gameState.keys['ArrowDown']) gameState.penaltyDirection.y -= 0.02;
        if (gameState.keys['ArrowLeft']) gameState.penaltyDirection.x -= 0.02;
        if (gameState.keys['ArrowRight']) gameState.penaltyDirection.x += 0.02;
        
        gameState.penaltyDirection.clampLength(0, 1);
        
        if (gameState.keys['Space']) {
            gameState.penaltyPower = Math.min(gameState.penaltyPower + delta * 2, 1);
        }
        return;
    }
    
    direction.normalize();
    direction.applyQuaternion(player.quaternion);
    
    gameState.playerVelocity.lerp(direction.multiplyScalar(speed), 0.1);
    player.position.add(gameState.playerVelocity.clone().multiplyScalar(delta));
    
    // Keep player on field
    // player.position.x = Math.max(-45, Math.min(45, player.position.x));
    // player.position.z = Math.max(-28, Math.min(28, player.position.z));
    
    // Ball follows player
    const ballOffset = new THREE.Vector3(0, 0.2, 1);
    ballOffset.applyQuaternion(player.quaternion);
    const targetBallPos = player.position.clone().add(ballOffset);
    
    ball.position.lerp(targetBallPos, 0.3);
    ball.rotation.x += delta * 5;
    ball.rotation.z += delta * 3;
}

