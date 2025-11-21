import * as THREE from 'three';
import { gameState } from '../core/gameState.js';
import { BALL_PHYSICS } from '../config/ballPhysics.js';

const netLocalNormal = new THREE.Vector3(0, 0, 1);
const planeNormal = new THREE.Vector3();
const worldQuaternion = new THREE.Quaternion();
const normalComponent = new THREE.Vector3();
const tangentialComponent = new THREE.Vector3();
const localBallPosition = new THREE.Vector3();
const previousBallPosition = new THREE.Vector3();
const localPreviousBallPosition = new THREE.Vector3();
const movementVector = new THREE.Vector3();

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

function handleNetCollisions(ball, previousPosition) {
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

        // Convert both current and previous positions to local space
        localBallPosition.copy(ball.position);
        mesh.worldToLocal(localBallPosition);

        localPreviousBallPosition.copy(previousPosition);
        mesh.worldToLocal(localPreviousBallPosition);

        const radius = BALL_PHYSICS.RADIUS;
        const halfWidth = net.halfWidth ?? radius;
        const halfHeight = net.halfHeight ?? radius;

        // Calculate movement in local space
        movementVector.subVectors(localBallPosition, localPreviousBallPosition);
        const movementLength = movementVector.length();

        // Check if ball is within net bounds (with some margin for movement)
        const margin = radius + Math.abs(movementLength);
        const withinX = localBallPosition.x >= -halfWidth - margin && localBallPosition.x <= halfWidth + margin;
        const withinY = localBallPosition.y >= -halfHeight - margin && localBallPosition.y <= halfHeight + margin;

        if (!withinX || !withinY) {
            continue;
        }

        // Swept collision detection: check if ball's path intersects the net plane (z=0)
        // The net plane is at z=0 in local space
        const previousZ = localPreviousBallPosition.z;
        const currentZ = localBallPosition.z;
        const zDelta = currentZ - previousZ;

        // Check if the ball crossed the net plane (z=0) during this frame
        // We need to check if the path from previousZ to currentZ crosses z=0
        const crossedPlane = (previousZ >= 0 && currentZ < 0) || (previousZ < 0 && currentZ >= 0);

        if (crossedPlane && Math.abs(zDelta) > 0.0001) {
            // Calculate intersection point with the net plane (z=0)
            // t is the interpolation parameter: 0 = previous position, 1 = current position
            const t = -previousZ / zDelta;
            const intersectionZ = 0;

            // Check if intersection point is within net bounds
            const intersectionX = localPreviousBallPosition.x + movementVector.x * t;
            const intersectionY = localPreviousBallPosition.y + movementVector.y * t;

            const intersectionWithinX = intersectionX >= -halfWidth - radius && intersectionX <= halfWidth + radius;
            const intersectionWithinY = intersectionY >= -halfHeight - radius && intersectionY <= halfHeight + radius;

            if (intersectionWithinX && intersectionWithinY) {
                // Ball hit the net - move it to the intersection point
                const intersectionLocal = new THREE.Vector3(intersectionX, intersectionY, intersectionZ + radius);
                const intersectionWorld = new THREE.Vector3();
                intersectionWorld.copy(intersectionLocal);
                mesh.localToWorld(intersectionWorld);
                ball.position.copy(intersectionWorld);

                // Handle bounce
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
        } else {
            // Check for static penetration (ball already inside net)
            const penetrationDepth = radius - localBallPosition.z;
            if (penetrationDepth > 0 && localBallPosition.z >= -radius) {
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
    // Store previous position for swept collision detection
    previousBallPosition.copy(ball.position);
    
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
    
    handleNetCollisions(ball, previousBallPosition);
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

