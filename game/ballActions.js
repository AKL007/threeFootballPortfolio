import * as THREE from 'three';
import { gameState } from '../core/gameState.js';

// Track if ball is in possession (following player) or in play
let ballInPossession = true;
let actionCooldown = 0;
const ACTION_COOLDOWN_TIME = 0.5; // 0.5 seconds between actions

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
    if (gameState.playerVelocity.length() > 0.1) {
        const moveDir = gameState.playerVelocity.clone().normalize();
        forward.lerp(moveDir, 0.7); // Blend facing and movement direction
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
    const basePassSpeed = 5; // m/s - base pass speed
    const maxPassSpeed = 15; // m/s - max pass speed
    const passSpeed = basePassSpeed + (maxPassSpeed - basePassSpeed) * power;
    
    // Set ball velocity
    gameState.ballVelocity.set(
        passDirection.x * passSpeed,
        0.3 + 0.2 * power, // Upward component scales with power
        passDirection.z * passSpeed
    );
    
    ballInPossession = false;
    actionCooldown = ACTION_COOLDOWN_TIME;
    
    return true;
}

// Through pass (pass ahead)
export function throughPass(player, ball, power = 1.0) {
    if (!canPerformAction()) return false;
    
    const passDirection = getPassDirection(player, 0.3); // Pass further ahead
    const basePassSpeed = 20; // m/s - base through pass speed
    const maxPassSpeed = 30; // m/s - max through pass speed
    const passSpeed = basePassSpeed + (maxPassSpeed - basePassSpeed) * power;
    
    // Set ball velocity
    gameState.ballVelocity.set(
        passDirection.x * passSpeed,
        0.2 + 0.2 * power, // Small upward component
        passDirection.z * passSpeed
    );
    
    ballInPossession = false;
    actionCooldown = ACTION_COOLDOWN_TIME;
    
    return true;
}

// Lob pass (high arc)
export function lobPass(player, ball, power = 1.0) {
    if (!canPerformAction()) return false;
    
    const passDirection = getPassDirection(player);
    const baseLobSpeed = 15; // m/s - base lob speed
    const maxLobSpeed = 22; // m/s - max lob speed
    const lobSpeed = baseLobSpeed + (maxLobSpeed - baseLobSpeed) * power;
    const lobAngle = 45 * (Math.PI / 180); // 45 degree angle
    
    // Calculate velocity with high arc
    const horizontalSpeed = lobSpeed * Math.cos(lobAngle);
    const verticalSpeed = lobSpeed * Math.sin(lobAngle);
    
    // Set ball velocity
    gameState.ballVelocity.set(
        passDirection.x * horizontalSpeed,
        verticalSpeed,
        passDirection.z * horizontalSpeed
    );
    
    ballInPossession = false;
    actionCooldown = ACTION_COOLDOWN_TIME;
    
    return true;
}

// Shoot the ball
export function shootBall(player, ball, power = 1.0) {
    if (!canPerformAction()) return false;
    
    const shootDirection = getPassDirection(player);
    const baseShootSpeed = 10; // m/s - base shot speed
    const maxShootSpeed = 40; // m/s - powerful shot speed
    const shootSpeed = baseShootSpeed + (maxShootSpeed - baseShootSpeed) * power;
    const shootAngle = 10 + 10 * power; // Angle increases with power (10-20 degrees)
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
    actionCooldown = ACTION_COOLDOWN_TIME;
    
    return true;
}

// Check if ball should return to player (when it stops moving)
export function checkBallReturn(player, ball) {
    if (!ballInPossession && gameState.ballVelocity.length() < 0.5) {
        const distanceToPlayer = ball.position.distanceTo(player.position);
        if (distanceToPlayer < 1) { // Within 1 meters
            ballInPossession = true;
        }
    }
}

