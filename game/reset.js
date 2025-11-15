import { gameState } from '../core/gameState.js';
import { setBallInPossession, resetActionCooldown } from './ballActions.js';
import { BALL_PHYSICS } from '../config/ballPhysics.js';

export function resetGameState(player, ball) {
    // Reset player position and velocity
    player.position.set(0, 0, 0);
    gameState.playerVelocity.set(0, 0, 0);
    
    // Reset player rotation to default (facing forward)
    player.rotation.set(0, 0, 0);
    player.quaternion.set(0, 0, 0, 1);
    
    // Reset ball position (near player) and velocity
    ball.position.set(0, BALL_PHYSICS.GROUND_Y, 1); // Slightly in front of player
    gameState.ballVelocity.set(0, 0, 0);
    
    // Reset ball possession
    setBallInPossession(true);
    resetActionCooldown();
    
    // Reset action states
    gameState.actionPower = 0;
    gameState.isChargingAction = false;
    gameState.currentActionType = null;
    
    // Reset penalty mode if active
    if (gameState.penaltyMode) {
        gameState.penaltyMode = false;
        gameState.penaltyPower = 0;
        gameState.penaltyDirection.set(0, 0);
    }
    
    // Reset zoom mode if active
    if (gameState.zoomMode) {
        gameState.zoomMode = false;
        gameState.zoomTarget = null;
    }
    
    // Reset camera look-at
    if (gameState.currentLookAt) {
        gameState.currentLookAt.set(0, 0, 0);
    }
    
    console.log('Game state reset');
}

