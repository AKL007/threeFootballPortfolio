import * as THREE from 'three';
import { gameState } from '../core/gameState.js';

// Easing function for smooth zoom
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function startZoomMode(targetPos, lookAtPos, callback, camera, player) {
    gameState.zoomMode = true;
    gameState.originalCameraPos.copy(camera.position);
    gameState.originalCameraLook.copy(player.position);
    
    // Calculate target camera position (closer to the object)
    const direction = new THREE.Vector3().subVectors(lookAtPos, targetPos).normalize();
    const targetCameraPos = lookAtPos.clone().add(direction.multiplyScalar(-8));
    targetCameraPos.y += 2;
    
    gameState.zoomTarget = { 
        pos: targetPos, 
        lookAt: lookAtPos, 
        callback,
        targetCameraPos: targetCameraPos,
        zoomProgress: 0,
        called: false,
        startPos: camera.position.clone()
    };
}

export function exitZoomMode() {
    if (!gameState.zoomMode) return;
    gameState.zoomMode = false;
    gameState.zoomTarget = null;
    // Camera will smoothly return to following player in updateCamera
}

export function updateFlyCamera(delta, camera) {
    if (!gameState.flyMode) return;
    
    const speed = 100; // Movement speed
    const acceleration = 400; // Acceleration rate
    const damping = 0.85; // Velocity damping
    
    // Reset velocity
    gameState.flyCameraVelocity.multiplyScalar(damping);
    
    // Calculate movement direction based on camera orientation
    const direction = new THREE.Vector3();
    const right = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);
    
    // Get forward direction from camera rotation
    camera.getWorldDirection(direction);
    right.crossVectors(direction, up).normalize();
    
    // Apply movement based on keys
    const moveVector = new THREE.Vector3();
    
    if (gameState.keys['KeyW'] || gameState.keys['ArrowUp']) {
        moveVector.add(direction);
    }
    if (gameState.keys['KeyS'] || gameState.keys['ArrowDown']) {
        moveVector.sub(direction);
    }
    if (gameState.keys['KeyA'] || gameState.keys['ArrowLeft']) {
        moveVector.sub(right);
    }
    if (gameState.keys['KeyD'] || gameState.keys['ArrowRight']) {
        moveVector.add(right);
    }
    if (gameState.keys['KeyQ'] || gameState.keys['Space']) {
        moveVector.add(up);
    }
    if (gameState.keys['KeyE'] || gameState.keys['ShiftLeft']) {
        moveVector.sub(up);
    }
    
    // Normalize and apply acceleration
    if (moveVector.length() > 0) {
        moveVector.normalize();
        gameState.flyCameraVelocity.add(moveVector.multiplyScalar(acceleration * delta));
    }
    
    // Clamp velocity
    const maxSpeed = speed;
    if (gameState.flyCameraVelocity.length() > maxSpeed) {
        gameState.flyCameraVelocity.normalize().multiplyScalar(maxSpeed);
    }
    
    // Apply velocity to camera position
    camera.position.add(gameState.flyCameraVelocity.clone().multiplyScalar(delta));
    
    // Apply rotation from euler angles
    camera.quaternion.setFromEuler(gameState.flyCameraEuler);
}

export function updateCamera(delta, camera, player) {
    // Fly camera mode takes priority
    if (gameState.flyMode) {
        updateFlyCamera(delta, camera);
        return;
    }
    
    if (gameState.zoomMode && gameState.zoomTarget) {
        // Smooth zoom animation
        gameState.zoomTarget.zoomProgress = Math.min(gameState.zoomTarget.zoomProgress + delta * 2, 1);
        const easeProgress = easeInOutCubic(gameState.zoomTarget.zoomProgress);
        
        // Interpolate camera position from original to target
        const startPos = gameState.zoomTarget.startPos || gameState.originalCameraPos;
        
        // Calculate interpolated position manually
        camera.position.x = startPos.x + (gameState.zoomTarget.targetCameraPos.x - startPos.x) * easeProgress;
        camera.position.y = startPos.y + (gameState.zoomTarget.targetCameraPos.y - startPos.y) * easeProgress;
        camera.position.z = startPos.z + (gameState.zoomTarget.targetCameraPos.z - startPos.z) * easeProgress;
        camera.lookAt(gameState.zoomTarget.lookAt);
        
        // Call callback when zoom is complete
        if (gameState.zoomTarget.zoomProgress >= 1 && gameState.zoomTarget.callback && !gameState.zoomTarget.called) {
            gameState.zoomTarget.called = true;
            gameState.zoomTarget.callback();
        }
        return;
    }
    
    if (gameState.penaltyMode) {
        // Fixed camera for penalty
        const goalPos = player.position.z > 0 ? new THREE.Vector3(50, 5, 0) : new THREE.Vector3(-50, 5, 0);
        camera.position.lerp(goalPos, 0.1);
        camera.lookAt(player.position);
        return;
    }
    
    // FIFA-style fixed camera: fixed angle, follows player position but doesn't rotate with player
    // Camera positioned behind and above player, looking down at an angle
    const fixedOffset = new THREE.Vector3(0, 25, 30); // Behind (positive Z) and above player
    const targetPos = player.position.clone().add(fixedOffset);
    
    // Smoothly follow player position
    camera.position.lerp(targetPos, 0.1);
    
    // Always look at player position
    const targetLookAt = player.position.clone();
    
    // Initialize current look-at if not set
    if (!gameState.currentLookAt) {
        gameState.currentLookAt = targetLookAt.clone();
    }
    
    // Smoothly interpolate look-at target to prevent warping
    gameState.currentLookAt.lerp(targetLookAt, 0.15);
    camera.lookAt(gameState.currentLookAt);
}

