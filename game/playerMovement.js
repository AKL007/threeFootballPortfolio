import * as THREE from 'three';
import { gameState } from '../core/gameState.js';
import { passBall, throughPass, lobPass, shootBall, isBallInPossession, setBallInPossession, checkBallReturn, updateBallActions } from './ballActions.js';
import { ANIMATIONS } from './animations.js';

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
    const idleClip = THREE.AnimationClip.findByName(clips, ANIMATIONS.IDLE);
    if (idleClip) {
        currentAction = animationActions[ANIMATIONS.IDLE];
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
function updatePlayerAnimation(player, isMoving, speed, forceAnimation = null) {
    if (!player.userData.mixer || Object.keys(animationActions).length === 0) {
        // Initialize animations if not already done
        if (player.userData.mixer && player.userData.animations) {
            initializeAnimations(player);
        }
        return;
    }
    
    // If a pass animation is playing, don't switch until it's finished
    if (currentAction) {
        const currentClipName = currentAction.getClip().name;
        const isPassAnimation = currentClipName === ANIMATIONS.SOCCER_PASS;
        
        if (isPassAnimation && !currentAction.paused && currentAction.time < currentAction.getClip().duration - 0.1) {
            // Pass animation is still playing, don't switch
            return;
        }
    }
    
    // If force animation is specified, use it
    if (forceAnimation && animationActions[forceAnimation]) {
        if (currentAction?.getClip().name !== forceAnimation) {
            switchAnimation(forceAnimation);
        }
        return;
    }
    
    // Determine animation based on movement state and speed
    let targetAnimation = ANIMATIONS.IDLE;
    
    if (isMoving) {
        // Speed thresholds (m/s) - maxSpeed is 6 m/s
        const JOG_THRESHOLD = 4.5;    // Medium: 0-4.5 m/s (Jog), Fast: 4.5-6 m/s (Run)
        
        // Select animation based on speed
        if (speed >= JOG_THRESHOLD) {
            // Fast speed - use running animation
            targetAnimation = ANIMATIONS.RUNNING_FORWARD;
        } else {
            // Medium/slow speed - use jogging animation
            targetAnimation = ANIMATIONS.JOG_FORWARD;
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
    
    // Update ball actions cooldown
    updateBallActions(delta);
    
    // Realistic player speed and acceleration
    const maxSpeed = 6; // m/s - realistic running speed (~21.6 km/h)
    const acceleration = 4; // m/s² - acceleration rate
    const deceleration = 8; // m/s² - deceleration rate (faster than acceleration)
    
    const direction = new THREE.Vector3();
    let isMoving = false;
    
    // Movement with arrow keys only
    if (gameState.keys['ArrowUp']) {
        direction.z -= 1;
        isMoving = true;
    }
    if (gameState.keys['ArrowDown']) {
        direction.z += 1;
        isMoving = true;
    }
    if (gameState.keys['ArrowLeft']) {
        direction.x -= 1;
        isMoving = true;
    }
    if (gameState.keys['ArrowRight']) {
        direction.x += 1;
        isMoving = true;
    }
    
    // Ball actions with power charging
    let actionPerformed = false;
    const CHARGE_RATE = 2.0; // Power per second
    const MAX_POWER = 1.0;
    
    // Handle key down - start charging (only if not already charging and ball in possession)
    if (!gameState.isChargingAction && isBallInPossession()) {
        if (gameState.keys['KeyS']) {
            gameState.isChargingAction = true;
            gameState.currentActionType = 'pass';
            gameState.actionPower = 0;
        } else if (gameState.keys['KeyW']) {
            gameState.isChargingAction = true;
            gameState.currentActionType = 'through';
            gameState.actionPower = 0;
        } else if (gameState.keys['KeyA']) {
            gameState.isChargingAction = true;
            gameState.currentActionType = 'lob';
            gameState.actionPower = 0;
        } else if (gameState.keys['KeyD']) {
            gameState.isChargingAction = true;
            gameState.currentActionType = 'shoot';
            gameState.actionPower = 0;
        }
    }
    
    // Charge power while key is held
    if (gameState.isChargingAction) {
        gameState.actionPower = Math.min(gameState.actionPower + CHARGE_RATE * delta, MAX_POWER);
        
        // Check if key is still held
        const keyHeld = (gameState.currentActionType === 'pass' && gameState.keys['KeyS']) ||
                        (gameState.currentActionType === 'through' && gameState.keys['KeyW']) ||
                        (gameState.currentActionType === 'lob' && gameState.keys['KeyA']) ||
                        (gameState.currentActionType === 'shoot' && gameState.keys['KeyD']);
        
        if (!keyHeld) {
            // Key released - execute action if power is sufficient
            if (gameState.actionPower > 0.1) {
                let executed = false;
                if (gameState.currentActionType === 'pass') {
                    executed = passBall(player, ball, gameState.actionPower);
                } else if (gameState.currentActionType === 'through') {
                    executed = throughPass(player, ball, gameState.actionPower);
                } else if (gameState.currentActionType === 'lob') {
                    executed = lobPass(player, ball, gameState.actionPower);
                } else if (gameState.currentActionType === 'shoot') {
                    executed = shootBall(player, ball, gameState.actionPower);
                }
                
                if (executed) {
                    actionPerformed = true;
                }
            }
            
            // Reset charging state
            gameState.isChargingAction = false;
            gameState.currentActionType = null;
            gameState.actionPower = 0;
        }
    }
    
    // Play pass animation when action is performed
    if (actionPerformed) {
        const passAction = animationActions[ANIMATIONS.SOCCER_PASS];
        if (passAction) {
            // Play pass animation once (not looped)
            passAction.setLoop(THREE.LoopOnce);
            passAction.reset().play();
            passAction.clampWhenFinished = true;
            currentAction = passAction;
        }
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
        
        // Use penalty kick animation
        if (animationActions[ANIMATIONS.SOCCER_PENALTY_KICK] && 
            currentAction?.getClip().name !== ANIMATIONS.SOCCER_PENALTY_KICK) {
            switchAnimation(ANIMATIONS.SOCCER_PENALTY_KICK);
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
        const moveDirection = new THREE.Vector3(0, 0, 1);
        moveDirection.applyQuaternion(player.quaternion);
        moveDirection.normalize();
        
        // Accelerate towards max speed
        const targetVelocity = moveDirection.multiplyScalar(maxSpeed);
        const velocityDiff = targetVelocity.clone().sub(gameState.playerVelocity);
        const velocityDiffLength = velocityDiff.length();
        
        if (velocityDiffLength > 0.01) {
            const accelAmount = Math.min(acceleration * delta, velocityDiffLength);
            const accelVector = velocityDiff.normalize().multiplyScalar(accelAmount);
            gameState.playerVelocity.add(accelVector);
        } else {
            gameState.playerVelocity.copy(targetVelocity);
        }
        
        // Clamp to max speed
        const currentSpeed = gameState.playerVelocity.length();
        if (currentSpeed > maxSpeed) {
            gameState.playerVelocity.normalize().multiplyScalar(maxSpeed);
        }
    } else {
        // When not moving, decelerate
        const currentSpeed = gameState.playerVelocity.length();
        if (currentSpeed > 0.1) {
            const decelAmount = deceleration * delta;
            if (decelAmount >= currentSpeed) {
                gameState.playerVelocity.set(0, 0, 0);
            } else {
                gameState.playerVelocity.normalize().multiplyScalar(currentSpeed - decelAmount);
            }
        } else {
            gameState.playerVelocity.set(0, 0, 0);
        }
    }
    
    player.position.add(gameState.playerVelocity.clone().multiplyScalar(delta));
    
    // Keep player on field
    // player.position.x = Math.max(-45, Math.min(45, player.position.x));
    // player.position.z = Math.max(-28, Math.min(28, player.position.z));
    
    // Ball follows player only when in possession
    if (isBallInPossession()) {
        const ballOffset = new THREE.Vector3(0, 0.2, 1);
        ballOffset.applyQuaternion(player.quaternion);
        const targetBallPos = player.position.clone().add(ballOffset);
        
        ball.position.lerp(targetBallPos, 0.3);
        ball.rotation.x += delta * 5;
        ball.rotation.z += delta * 3;
    } else {
        // Check if ball should return to player
        checkBallReturn(player, ball);
        
        // Rotate ball based on velocity when in play
        if (gameState.ballVelocity.length() > 0.1) {
            const velocity = gameState.ballVelocity.clone().normalize();
            ball.rotation.x += velocity.z * delta * 10;
            ball.rotation.z += velocity.x * delta * 10;
        }
    }
}

