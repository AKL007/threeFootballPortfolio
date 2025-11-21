import * as THREE from 'three';
import { gameState } from '../core/gameState.js';
import { passBall, throughPass, lobPass, shootBall, isBallInPossession, setBallInPossession, checkBallReturn, updateBallActions } from './ballActions.js';
import { ANIMATIONS } from './animations.js';
import { PLAYER_MOVEMENT } from '../config/playerMovement.js';
import { BALL_PHYSICS } from '../config/ballPhysics.js';
import { PENALTY } from '../config/penalty.js';

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
function switchAnimation(animationName, fadeTime = PLAYER_MOVEMENT.ANIMATION_FADE_TIME) {
    const newAction = animationActions[animationName];
    
    if (!newAction || newAction === currentAction) {
        return;
    }
    
    // Fade out current animation
    if (currentAction) {
        currentAction.fadeOut(fadeTime);
        // Stop the animation if it's a one-time animation that has finished
        if (currentAction.getClip().name === ANIMATIONS.SOCCER_PASS && 
            currentAction.time >= currentAction.getClip().duration - 0.1) {
            currentAction.stop();
        }
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
        
        if (isPassAnimation) {
            // Check if pass animation has finished
            const hasFinished = currentAction.time >= currentAction.getClip().duration - 0.1 || 
                               (currentAction.paused && currentAction.time > 0);
            
            if (!hasFinished) {
                // Pass animation is still playing, don't switch
                return;
            }
            // If it has finished, allow the animation to switch below
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
        // Select animation based on speed
        if (speed >= PLAYER_MOVEMENT.JOG_THRESHOLD) {
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
    // Check if Shift is held for sprint
    const isSprinting = gameState.keys['ShiftLeft'] || gameState.keys['ShiftRight'];
    const maxSpeed = isSprinting ? PLAYER_MOVEMENT.SPRINT_SPEED : PLAYER_MOVEMENT.MAX_SPEED;
    const acceleration = PLAYER_MOVEMENT.ACCELERATION;
    const deceleration = PLAYER_MOVEMENT.DECELERATION;
    
    // Compute target direction from key presses (discrete input)
    const targetDirection = new THREE.Vector3();
    let isMoving = false;
    
    // Movement with arrow keys only
    if (gameState.keys['ArrowUp']) {
        targetDirection.z -= 1;
        isMoving = true;
    }
    if (gameState.keys['ArrowDown']) {
        targetDirection.z += 1;
        isMoving = true;
    }
    if (gameState.keys['ArrowLeft']) {
        targetDirection.x -= 1;
        isMoving = true;
    }
    if (gameState.keys['ArrowRight']) {
        targetDirection.x += 1;
        isMoving = true;
    }

    // if ball is not in possession, and targetDirection is facing towards ball, set targetDirection to ball position
    if (!isBallInPossession() && targetDirection.dot(ball.position.clone().sub(player.position)) > 0) {
        targetDirection.copy(ball.position.clone().sub(player.position).normalize());
    }
    
    // Smoothly interpolate current input direction toward target direction
    // This creates analog-like behavior with continuous angles, not just 8 directions
    if (targetDirection.length() > 0) {
        targetDirection.normalize();
        const smoothingFactor = PLAYER_MOVEMENT.INPUT_SMOOTHING * delta;
        gameState.currentInputDirection.lerp(targetDirection, Math.min(smoothingFactor, 1));
    } else {
        // When no keys are pressed, smoothly return to zero
        const smoothingFactor = PLAYER_MOVEMENT.INPUT_SMOOTHING * delta;
        gameState.currentInputDirection.lerp(new THREE.Vector3(0, 0, 0), Math.min(smoothingFactor, 1));
    }

    if(Math.abs(gameState.currentInputDirection.x) < 0.01) gameState.currentInputDirection.x = 0;
    if(Math.abs(gameState.currentInputDirection.z) < 0.01) gameState.currentInputDirection.z = 0;
    
    // Use the smoothed direction for movement calculations
    const direction = gameState.currentInputDirection.clone();
    isMoving = direction.length() > 0.01; // Small threshold to prevent jitter
    
    // Ball actions with power charging
    let initiatedAction = false;
    const CHARGE_RATE = PLAYER_MOVEMENT.CHARGE_RATE;
    const MAX_POWER = PLAYER_MOVEMENT.MAX_POWER;
    
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
            const actionType = gameState.currentActionType;
            const validActions = ['pass', 'through', 'lob', 'shoot'];

            if (
                gameState.actionPower > PLAYER_MOVEMENT.MIN_POWER_TO_EXECUTE &&
                validActions.includes(actionType)
            ) {
                gameState.pendingAction = actionType;
                initiatedAction = true;
                gameState.pendingActionPower = gameState.actionPower;
                gameState.pendingAnimation = ANIMATIONS.SOCCER_PASS;
            }

            // Reset charging state
            gameState.isChargingAction = false;
            gameState.currentActionType = null;
            gameState.actionPower = 0;
        }
    }
    
    // Simplified animation trigger for pending action
    if (initiatedAction || gameState.pendingAnimation) {
        const pendingAnim = gameState.pendingAnimation;
        const animAction = animationActions[pendingAnim];
        if (animAction) {
            if (currentAction && currentAction !== animAction) currentAction.fadeOut(0.1);
            animAction
                .setLoop(THREE.LoopOnce)
                .reset()
                .fadeIn(0.1)
                .play();
            animAction.clampWhenFinished = true;
            currentAction = animAction;
        }
        gameState.pendingAnimation = null;
    }

    if (gameState.penaltyMode) {
        // Penalty mode controls
        if (gameState.keys['ArrowUp']) gameState.penaltyDirection.y += PENALTY.DIRECTION_STEP;
        if (gameState.keys['ArrowDown']) gameState.penaltyDirection.y -= PENALTY.DIRECTION_STEP;
        if (gameState.keys['ArrowLeft']) gameState.penaltyDirection.x -= PENALTY.DIRECTION_STEP;
        if (gameState.keys['ArrowRight']) gameState.penaltyDirection.x += PENALTY.DIRECTION_STEP;
        
        gameState.penaltyDirection.clampLength(0, 1);
        
        if (gameState.keys['Space']) {
            gameState.penaltyPower = Math.min(gameState.penaltyPower + delta * PENALTY.POWER_RATE, PENALTY.MAX_POWER);
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

    // Execute shoot action if it has been initiated and the pass animation is 33% complete
    if (
        gameState.pendingAction &&
        currentAction?.getClip().name === ANIMATIONS.SOCCER_PASS &&
        currentAction.time >= currentAction.getClip().duration * 0.33
    ) {
        const actionMap = {
            shoot: shootBall,
            through: throughPass,
            lob: lobPass,
            pass: passBall
        };

        const actionFunc = actionMap[gameState.pendingAction];
        if (actionFunc && actionFunc(player, gameState.pendingActionPower)) {
            initiatedAction = false;
            gameState.pendingAction = null;
            gameState.pendingActionPower = 0;
        }
    }

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
        const rotationSpeed = PLAYER_MOVEMENT.ROTATION_SPEED;
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
        const ballOffset = new THREE.Vector3(
            PLAYER_MOVEMENT.BALL_OFFSET.x,
            PLAYER_MOVEMENT.BALL_OFFSET.y,
            PLAYER_MOVEMENT.BALL_OFFSET.z
        );
        ballOffset.applyQuaternion(player.quaternion);
        const targetBallPos = player.position.clone().add(ballOffset);
        
        ball.position.lerp(targetBallPos, PLAYER_MOVEMENT.BALL_LERP_SPEED);
        ball.rotation.x += delta * BALL_PHYSICS.ROTATION_SPEED_X;
        ball.rotation.z += delta * BALL_PHYSICS.ROTATION_SPEED_Z;
    } else {
        // Check if ball should return to player
        checkBallReturn(player, ball);
        
        // Rotate ball based on velocity when in play
        if (gameState.ballVelocity.length() > 0.1) {
            const velocity = gameState.ballVelocity.clone().normalize();
            ball.rotation.x += velocity.z * delta * BALL_PHYSICS.ROTATION_SPEED_IN_PLAY;
            ball.rotation.z += velocity.x * delta * BALL_PHYSICS.ROTATION_SPEED_IN_PLAY;
        }
    }
}

