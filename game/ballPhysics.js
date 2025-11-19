import { gameState } from '../core/gameState.js';
import { BALL_PHYSICS } from '../config/ballPhysics.js';

function handleInvisibleWallCollisions(ball) {
    if (!gameState.invisibleWalls?.length) {
        return;
    }

    const radius = BALL_PHYSICS.RADIUS;

    for (const wall of gameState.invisibleWalls) {
        const collisionPlane = wall?.userData?.collisionPlane;
        if (!collisionPlane) {
            continue;
        }

        const { axis, normal, position } = collisionPlane;
        const ballCoordinate = ball.position[axis];
        const signedDistance = (ballCoordinate - position) * normal;

        if (signedDistance < radius) {
            const penetrationDepth = radius - signedDistance;
            ball.position[axis] += penetrationDepth * normal;

            const velocityComponent = gameState.ballVelocity[axis];
            if (velocityComponent * normal < 0) {
                gameState.ballVelocity[axis] = -velocityComponent * BALL_PHYSICS.WALL_BOUNCE_ENERGY_RETENTION;
            } else if (velocityComponent === 0) {
                gameState.ballVelocity[axis] = 0;
            } else {
                gameState.ballVelocity[axis] = Math.abs(velocityComponent) * normal;
            }
        }
    }
}

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
    
    handleInvisibleWallCollisions(ball);

    // Stop very slow movement
    if (gameState.ballVelocity.length() < BALL_PHYSICS.STOP_THRESHOLD) {
        gameState.ballVelocity.set(0, 0, 0);
        // Keep ball on ground when stopped
        if (ball.position.y < BALL_PHYSICS.GROUND_Y) {
            ball.position.y = BALL_PHYSICS.GROUND_Y;
        }
    }
}

