import * as THREE from 'three';
import { gameState } from '../core/gameState.js';
import { BALL_ACTIONS } from '../config/ballActions.js';

// Track if ball is in possession (following player) or in play
let ballInPossession = true;
let actionCooldown = 0;

export function isBallInPossession() {
    return ballInPossession;
}

export function setBallInPossession(value) {
    ballInPossession = value;
}

export function updateBallActions(delta) {
    if (actionCooldown > 0) {
        actionCooldown -= delta;
    }
}

export function resetActionCooldown() {
    actionCooldown = 0;
}

export function canPerformAction() {
    return actionCooldown <= 0 && ballInPossession;
}

// Calculate pass direction based on player's facing direction and movement
function getPassDirection(player, aheadDistance = 0) {
    const forward = new THREE.Vector3(0, 0, 1); // Player's forward direction
    forward.applyQuaternion(player.quaternion);
    
    // If player is moving, use movement direction, otherwise use facing direction
    if (gameState.playerVelocity.length() > BALL_ACTIONS.DIRECTION.MOVEMENT_THRESHOLD) {
        const moveDir = gameState.playerVelocity.clone().normalize();
        forward.lerp(moveDir, BALL_ACTIONS.DIRECTION.MOVEMENT_BLEND_FACTOR); // Blend facing and movement direction
        forward.normalize();
    }
    
    // Add ahead offset for through passes
    if (aheadDistance > 0) {
        forward.multiplyScalar(1 + aheadDistance);
    }
    
    return forward;
}

// Pass the ball
export function passBall(player, ball, power = 1.0) {
    if (!canPerformAction()) return false;
    
    const passDirection = getPassDirection(player);
    const passSpeed = BALL_ACTIONS.PASS.BASE_SPEED + (BALL_ACTIONS.PASS.MAX_SPEED - BALL_ACTIONS.PASS.BASE_SPEED) * power;
    
    // Set ball velocity
    gameState.ballVelocity.set(
        passDirection.x * passSpeed,
        BALL_ACTIONS.PASS.UPWARD_BASE + BALL_ACTIONS.PASS.UPWARD_POWER_MULTIPLIER * power,
        passDirection.z * passSpeed
    );
    
    ballInPossession = false;
    actionCooldown = BALL_ACTIONS.ACTION_COOLDOWN_TIME;
    
    return true;
}

// Through pass (pass ahead)
export function throughPass(player, ball, power = 1.0) {
    if (!canPerformAction()) return false;
    
    const passDirection = getPassDirection(player, BALL_ACTIONS.THROUGH_PASS.AHEAD_DISTANCE);
    const passSpeed = BALL_ACTIONS.THROUGH_PASS.BASE_SPEED + (BALL_ACTIONS.THROUGH_PASS.MAX_SPEED - BALL_ACTIONS.THROUGH_PASS.BASE_SPEED) * power;
    
    // Set ball velocity
    gameState.ballVelocity.set(
        passDirection.x * passSpeed,
        BALL_ACTIONS.THROUGH_PASS.UPWARD_BASE + BALL_ACTIONS.THROUGH_PASS.UPWARD_POWER_MULTIPLIER * power,
        passDirection.z * passSpeed
    );
    
    ballInPossession = false;
    actionCooldown = BALL_ACTIONS.ACTION_COOLDOWN_TIME;
    
    return true;
}

// Lob pass (high arc)
export function lobPass(player, ball, power = 1.0) {
    if (!canPerformAction()) return false;
    
    const passDirection = getPassDirection(player);
    const lobSpeed = BALL_ACTIONS.LOB_PASS.BASE_SPEED + (BALL_ACTIONS.LOB_PASS.MAX_SPEED - BALL_ACTIONS.LOB_PASS.BASE_SPEED) * power;
    
    // Calculate velocity with high arc
    const horizontalSpeed = lobSpeed * Math.cos(BALL_ACTIONS.LOB_PASS.ANGLE);
    const verticalSpeed = lobSpeed * Math.sin(BALL_ACTIONS.LOB_PASS.ANGLE);
    
    // Set ball velocity
    gameState.ballVelocity.set(
        passDirection.x * horizontalSpeed,
        verticalSpeed,
        passDirection.z * horizontalSpeed
    );
    
    ballInPossession = false;
    actionCooldown = BALL_ACTIONS.ACTION_COOLDOWN_TIME;
    
    return true;
}

// Shoot the ball
export function shootBall(player, ball, power = 1.0) {
    if (!canPerformAction()) return false;
    
    const shootDirection = getPassDirection(player);
    const shootSpeed = BALL_ACTIONS.SHOOT.BASE_SPEED + (BALL_ACTIONS.SHOOT.MAX_SPEED - BALL_ACTIONS.SHOOT.BASE_SPEED) * power;
    const shootAngle = BALL_ACTIONS.SHOOT.ANGLE_BASE + BALL_ACTIONS.SHOOT.ANGLE_POWER_MULTIPLIER * power;
    const shootAngleRad = shootAngle * (Math.PI / 180);
    
    // Calculate velocity for shot
    const horizontalSpeed = shootSpeed * Math.cos(shootAngleRad);
    const verticalSpeed = shootSpeed * Math.sin(shootAngleRad);
    
    // Set ball velocity
    gameState.ballVelocity.set(
        shootDirection.x * horizontalSpeed,
        verticalSpeed,
        shootDirection.z * horizontalSpeed
    );
    
    ballInPossession = false;
    actionCooldown = BALL_ACTIONS.ACTION_COOLDOWN_TIME;
    
    return true;
}

// Check if ball should return to player (when it stops moving)
export function checkBallReturn(player, ball) {
    if (!ballInPossession && gameState.ballVelocity.length() < BALL_ACTIONS.BALL_RETURN.VELOCITY_THRESHOLD) {
        const distanceToPlayer = ball.position.distanceTo(player.position);
        if (distanceToPlayer < BALL_ACTIONS.BALL_RETURN.DISTANCE_THRESHOLD) {
            ballInPossession = true;
        }
    }
}

