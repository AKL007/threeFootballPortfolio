import * as THREE from 'three';
import { gameState } from '../core/gameState.js';
import { BALL_PHYSICS } from '../config/ballPhysics.js';

const netLocalNormal = new THREE.Vector3(0, 0, 1);
const planeNormal = new THREE.Vector3();
const worldQuaternion = new THREE.Quaternion();
const normalComponent = new THREE.Vector3();
const tangentialComponent = new THREE.Vector3();
const localBallPosition = new THREE.Vector3();

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

function handleNetCollisions(ball) {
    if (!gameState.goalNets?.length) {
        return;
    }

    for (const net of gameState.goalNets) {
        const mesh = net?.mesh;
        if (!mesh) {
            continue;
        }

        mesh.updateMatrixWorld(true);
        mesh.getWorldQuaternion(worldQuaternion);

        planeNormal.copy(netLocalNormal).applyQuaternion(worldQuaternion).normalize();

        localBallPosition.copy(ball.position);
        mesh.worldToLocal(localBallPosition);

        const radius = BALL_PHYSICS.RADIUS;
        const halfWidth = net.halfWidth ?? radius;
        const halfHeight = net.halfHeight ?? radius;

        const withinX = localBallPosition.x >= -halfWidth - radius && localBallPosition.x <= halfWidth + radius;
        const withinY = localBallPosition.y >= -halfHeight - radius && localBallPosition.y <= halfHeight + radius;
        const penetrationDepth = radius - localBallPosition.z;

        if (withinX && withinY && penetrationDepth > 0 && localBallPosition.z >= -radius) {
            ball.position.addScaledVector(planeNormal, penetrationDepth);

            const velocity = gameState.ballVelocity;
            const velocityAlongNormal = velocity.dot(planeNormal);

            if (velocityAlongNormal < 0) {
                normalComponent.copy(planeNormal).multiplyScalar(velocityAlongNormal);
                tangentialComponent.copy(velocity).sub(normalComponent);

                const bounceMagnitude = -velocityAlongNormal * BALL_PHYSICS.NET_BOUNCE_ENERGY_RETENTION;
                normalComponent.copy(planeNormal).multiplyScalar(bounceMagnitude);
                tangentialComponent.multiplyScalar(BALL_PHYSICS.NET_TANGENTIAL_ENERGY_RETENTION);

                velocity.copy(normalComponent).add(tangentialComponent);
            }
        }
    }
}

function handleGoalLineCrossing(ball) {
    const radius = BALL_PHYSICS.RADIUS;

    const goalHalfWidth = 7.32 / 2;
    const goalHalfHeight = 2.44 / 2;

    if (ball.position.x < -55) {
        // left goal
        const goalLineX = -55;
        const withinZ = ball.position.z >= -goalHalfWidth - radius && ball.position.z <= goalHalfWidth + radius;
        const withinY = ball.position.y >= -goalHalfHeight - radius && ball.position.y <= goalHalfHeight + radius;
        const withinX = (ball.position.x) <= goalLineX - radius;

        if (withinX && withinY && withinZ) {
            if (!gameState.justScored) {
                gameState.homeScore++;
                console.log('Home goal scored');
                console.log('Home score:', gameState.homeScore);
                console.log('Just scored:', gameState.justScored);
                gameState.justScored = true;
                
                // Update scoreboard
                if (gameState.scoreboardScreen?.userData.updateScore) {
                    gameState.scoreboardScreen.userData.updateScore();
                }
            }
        }
    }
    else if(ball.position.x > 55) {
        // right goal
        const goalLineX = 55;
        const withinZ = ball.position.z >= -goalHalfWidth - radius && ball.position.z <= goalHalfWidth + radius;
        const withinY = ball.position.y >= -goalHalfHeight - radius && ball.position.y <= goalHalfHeight + radius;
        const withinX = (ball.position.x) >= goalLineX + radius;

        if (withinX && withinY && withinZ) {
            if (!gameState.justScored) {
                gameState.awayScore++;
                console.log('Away goal scored');
                console.log('Away score:', gameState.awayScore);
                console.log('Just scored:', gameState.justScored);
                gameState.justScored = true;
                
                // Update scoreboard
                if (gameState.scoreboardScreen?.userData.updateScore) {
                    gameState.scoreboardScreen.userData.updateScore();
                }
            }
        }
    }
    else {
        gameState.justScored = false;
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
    
    handleNetCollisions(ball);
    handleInvisibleWallCollisions(ball);
    handleGoalLineCrossing(ball)

    // Stop very slow movement
    if (gameState.ballVelocity.length() < BALL_PHYSICS.STOP_THRESHOLD) {
        gameState.ballVelocity.set(0, 0, 0);
        // Keep ball on ground when stopped
        if (ball.position.y < BALL_PHYSICS.GROUND_Y) {
            ball.position.y = BALL_PHYSICS.GROUND_Y;
        }
    }
}

