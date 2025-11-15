import * as THREE from 'three';
import { BALL_PHYSICS } from '../config/ballPhysics.js';

export function createBall() {
    const ballGeometry = new THREE.SphereGeometry(BALL_PHYSICS.RADIUS, 16, 8);
    const ballMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true });
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.castShadow = true;
    ball.position.set(0, BALL_PHYSICS.RADIUS / 2, 1);
    return ball;
}

