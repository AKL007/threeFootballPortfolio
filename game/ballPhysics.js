import { gameState } from '../core/gameState.js';

export function updateBall(delta, ball) {
    // Apply gravity
    gameState.ballVelocity.y -= 9.8 * delta;
    
    // Update position
    ball.position.add(gameState.ballVelocity.clone().multiplyScalar(delta));
    
    const isOnGround = ball.position.y <= 0.11; // Ball radius is 0.11
    
    // Ground collision and bounce
    if (isOnGround) {
        ball.position.y = 0.11;
        
        // Realistic bounce with energy loss
        if (gameState.ballVelocity.y < 0) {
            gameState.ballVelocity.y *= -0.6; // Bounce with 60% energy retention
            
            // Reduce horizontal velocity on bounce (friction) - only when on ground
            gameState.ballVelocity.x *= 0.9;
            gameState.ballVelocity.z *= 0.9;
        }
        
        // Ground friction - only apply when on ground
        const groundFriction = 0.95;
        gameState.ballVelocity.x *= groundFriction;
        gameState.ballVelocity.z *= groundFriction;
    }
    // No friction when ball is in air - only gravity affects it
    
    // Stop very slow movement
    if (gameState.ballVelocity.length() < 0.1) {
        gameState.ballVelocity.set(0, 0, 0);
        // Keep ball on ground when stopped
        if (ball.position.y < 0.11) {
            ball.position.y = 0.11;
        }
    }
}

