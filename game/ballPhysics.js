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

    // Stop very slow movement
    if (gameState.ballVelocity.length() < BALL_PHYSICS.STOP_THRESHOLD) {
        gameState.ballVelocity.set(0, 0, 0);
        // Keep ball on ground when stopped
        if (ball.position.y < BALL_PHYSICS.GROUND_Y) {
            ball.position.y = BALL_PHYSICS.GROUND_Y;
        }
    }
}

