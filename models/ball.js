import * as THREE from 'three';

export function createBall() {
    const ballGeometry = new THREE.SphereGeometry(0.2, 16, 8);
    const ballMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true });
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.castShadow = true;
    ball.position.set(0, 0.2, 1);
    return ball;
}

