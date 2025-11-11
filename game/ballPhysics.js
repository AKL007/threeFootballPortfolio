import { gameState } from '../core/gameState.js';

export function updateBall(delta, ball) {
    if (gameState.ballVelocity.length() > 0.1) {
        ball.position.add(gameState.ballVelocity.clone().multiplyScalar(delta));
        gameState.ballVelocity.multiplyScalar(0.95); // Friction
        
        // Bounce off ground
        if (ball.position.y < 0.2) {
            ball.position.y = 0.2;
            gameState.ballVelocity.y *= -0.5;
        }
        
        // Gravity
        gameState.ballVelocity.y -= 9.8 * delta;
    } else {
        gameState.ballVelocity.set(0, 0, 0);
    }
}

