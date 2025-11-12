import * as THREE from 'three';
import { gameState } from '../core/gameState.js';

// Animation state management
let currentAction = null;
let animationActions = {};

// Initialize animation actions from player model
function initializeAnimations(player) {
    if (!player.userData.mixer || !player.userData.animations) {
        return;
    }
    
    const mixer = player.userData.mixer;
    const clips = player.userData.animations;
    
    // Create actions for all available animations
    clips.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.setLoop(THREE.LoopRepeat);
        animationActions[clip.name] = action;
    });
    
    // Start with idle animation
    const idleClip = THREE.AnimationClip.findByName(clips, 'Idle');
    if (idleClip) {
        currentAction = animationActions['Idle'];
        if (currentAction) {
            currentAction.play();
        }
    }
}

// Switch to a different animation with smooth transition
function switchAnimation(animationName, fadeTime = 0.3) {
    const newAction = animationActions[animationName];
    
    if (!newAction || newAction === currentAction) {
        return;
    }
    
    // Fade out current animation
    if (currentAction) {
        currentAction.fadeOut(fadeTime);
    }
    
    // Fade in new animation
    newAction.reset().fadeIn(fadeTime).play();
    currentAction = newAction;
}

// Determine which animation to play based on movement
function updatePlayerAnimation(player, isMoving, speed) {
    if (!player.userData.mixer || Object.keys(animationActions).length === 0) {
        // Initialize animations if not already done
        if (player.userData.mixer && player.userData.animations) {
            initializeAnimations(player);
        }
        return;
    }
    
    // Determine animation based on movement state
    let targetAnimation = 'Idle';
    
    if (isMoving) {
        // Check for available running/walking animations
        // Try different common animation names
        if (animationActions['RunningForward'] || animationActions['Running']) {
            targetAnimation = animationActions['RunningForward'] ? 'RunningForward' : 'Running';
        } else if (animationActions['JogForward'] || animationActions['Jog']) {
            targetAnimation = animationActions['JogForward'] ? 'JogForward' : 'Jog';
        } else if (animationActions['Walk'] || animationActions['Walking']) {
            targetAnimation = animationActions['Walk'] ? 'Walk' : 'Walking';
        } else {
            // Fallback to any movement animation
            const movementAnims = Object.keys(animationActions).filter(name => 
                name.toLowerCase().includes('run') || 
                name.toLowerCase().includes('jog') || 
                name.toLowerCase().includes('walk')
            );
            if (movementAnims.length > 0) {
                targetAnimation = movementAnims[0];
            }
        }
    }
    
    // Switch animation if needed
    if (currentAction?.getClip().name !== targetAnimation) {
        switchAnimation(targetAnimation);
    }
}

export function updatePlayerMovement(delta, player, ball) {
    // Don't allow movement during zoom mode or fly mode
    if (gameState.zoomMode || gameState.flyMode) {
        return;
    }
    
    const speed = 15;
    const direction = new THREE.Vector3();
    let isMoving = false;
    
    if (gameState.keys['KeyW'] || gameState.keys['ArrowUp']) {
        direction.z -= 1;
        isMoving = true;
    }
    if (gameState.keys['KeyS'] || gameState.keys['ArrowDown']) {
        direction.z += 1;
        isMoving = true;
    }
    if (gameState.keys['KeyA'] || gameState.keys['ArrowLeft']) {
        direction.x -= 1;
        isMoving = true;
    }
    if (gameState.keys['KeyD'] || gameState.keys['ArrowRight']) {
        direction.x += 1;
        isMoving = true;
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
        
        // Use penalty kick animation if available
        const penaltyAnimName = animationActions['SoccerPenaltyKick'] ? 'SoccerPenaltyKick' : 
                                (animationActions['PenaltyKick'] ? 'PenaltyKick' : null);
        if (penaltyAnimName && currentAction?.getClip().name !== penaltyAnimName) {
            switchAnimation(penaltyAnimName);
        }
        return;
    }
    
    // Update player animation based on movement
    const movementSpeed = gameState.playerVelocity.length();
    updatePlayerAnimation(player, isMoving, movementSpeed);
    
    if (isMoving) {
        // Normalize direction to get the desired movement direction (in world space)
        direction.normalize();
        
        // Calculate the target Y rotation angle to face the movement direction
        // atan2(x, z) gives the angle around Y axis in world space
        const targetAngle = Math.atan2(direction.x, direction.z);
        
        // Get current Y rotation from player's quaternion
        const euler = new THREE.Euler().setFromQuaternion(player.quaternion, 'YXZ');
        const currentAngle = euler.y;
        
        // Calculate angle difference and handle wrapping
        let angleDiff = targetAngle - currentAngle;
        // Normalize to [-PI, PI]
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        
        // Smoothly rotate player towards the movement direction
        const rotationSpeed = 8; // Rotation speed in radians per second
        const rotationStep = Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), rotationSpeed * delta);
        euler.y += rotationStep;
        
        // Update player quaternion from euler
        player.quaternion.setFromEuler(euler);
        
        // Apply movement in the direction the player is facing
        // Use (0, 0, 1) instead of (0, 0, -1) because player model faces opposite direction
        const moveDirection = new THREE.Vector3(0, 0, 1);
        moveDirection.applyQuaternion(player.quaternion);
        moveDirection.normalize();
        
        gameState.playerVelocity.lerp(moveDirection.multiplyScalar(speed), 0.1);
    } else {
        // When not moving, gradually slow down
        gameState.playerVelocity.lerp(new THREE.Vector3(0, 0, 0), 0.2);
    }
    
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

