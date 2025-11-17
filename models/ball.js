import * as THREE from 'three';
import { BALL_PHYSICS } from '../config/ballPhysics.js';
import { BALL_COLORS } from '../config/colors.js';

export function createBall() {
    const ballGeometry = new THREE.SphereGeometry(BALL_PHYSICS.RADIUS, 16, 8);
    const ballMaterial = new THREE.MeshStandardMaterial({ 
        color: BALL_COLORS.WHITE,
        roughness: 0.3,
        metalness: 0.1
    });
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.castShadow = true;
    ball.position.set(0, BALL_PHYSICS.RADIUS / 2, 1);
    return ball;
}

