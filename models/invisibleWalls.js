import * as THREE from 'three';

const WALL_THICKNESS = 1;
const WALL_HEIGHT = 20;
const HALF_WALL_HEIGHT = WALL_HEIGHT / 2;
const ROTATION_THRESHOLD = Math.cos(Math.PI / 4);

function getCollisionAxis(rotationY) {
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);
    return Math.abs(cosY) >= ROTATION_THRESHOLD ? 'x' : 'z';
}

function getInwardNormal(positionValue) {
    return positionValue < 0 ? 1 : -1;
}

function buildCollisionPlane(axis, positionValue, normal) {
    const planePosition = positionValue + normal * (WALL_THICKNESS / 2);
    return {
        axis,
        normal,
        position: planePosition
    };
}

export function createInvisibleWall(x, z, length, rotationY = 0, color = 0xffffff) {
    const wall = new THREE.Mesh(
        new THREE.BoxGeometry(WALL_THICKNESS, WALL_HEIGHT, length),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.01 })
    );

    wall.rotateOnAxis(new THREE.Vector3(0, 1, 0), rotationY);
    wall.position.set(x, HALF_WALL_HEIGHT, z);

    const axis = getCollisionAxis(rotationY);
    const positionValue = axis === 'x' ? wall.position.x : wall.position.z;
    const normal = getInwardNormal(positionValue);

    wall.userData.isInvisibleWall = true;
    wall.userData.collisionPlane = buildCollisionPlane(axis, positionValue, normal);

    return wall;
}