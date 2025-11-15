import { gameState } from '../core/gameState.js';
import { BALL_PHYSICS } from '../config/ballPhysics.js';

export function updateBall(delta, ball) {
    // Apply gravity
    gameState.ballVelocity.y -= BALL_PHYSICS.GRAVITY * delta;
    
    // Update position
    ball.position.add(gameState.ballVelocity.clone().multiplyScalar(delta));
    
    const isOnGround = ball.position.y <= BALL_PHYSICS.GROUND_Y;
    
    // Ground collision and bounce
    if (isOnGround) {
        ball.position.y = BALL_PHYSICS.GROUND_Y;
        
        // Realistic bounce with energy loss
        if (gameState.ballVelocity.y < 0) {
            gameState.ballVelocity.y *= -BALL_PHYSICS.BOUNCE_ENERGY_RETENTION;
            
            // Reduce horizontal velocity on bounce (friction) - only when on ground
            gameState.ballVelocity.x *= BALL_PHYSICS.HORIZONTAL_VELOCITY_REDUCTION;
            gameState.ballVelocity.z *= BALL_PHYSICS.HORIZONTAL_VELOCITY_REDUCTION;
        }
        
        // Ground friction - only apply when on ground
        gameState.ballVelocity.x *= BALL_PHYSICS.GROUND_FRICTION;
        gameState.ballVelocity.z *= BALL_PHYSICS.GROUND_FRICTION;
    }
    // No friction when ball is in air - only gravity affects it
    
    // Stop very slow movement
    if (gameState.ballVelocity.length() < BALL_PHYSICS.STOP_THRESHOLD) {
        gameState.ballVelocity.set(0, 0, 0);
        // Keep ball on ground when stopped
        if (ball.position.y < BALL_PHYSICS.GROUND_Y) {
            ball.position.y = BALL_PHYSICS.GROUND_Y;
        }
    }
}

