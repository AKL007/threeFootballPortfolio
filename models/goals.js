import * as THREE from 'three';
import { createLine } from './fieldMarkings.js';

/**
 * Creates a soccer goal with posts, crossbar, and net wireframe.
 * @param {number} x - X position (left/right end of field)
 * @param {number} z - Z position (center on z)
 * @returns {THREE.Group} Group containing the goal
 */
export function createGoal(x, z) {
    const goalGroup = new THREE.Group();

    // Dimensions (standard soccer goal in meters)
    const goalWidth = 7.32;
    const goalHeight = 2.44;
    const goalDepth = 1.5;

    // Materials
    const postMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true });
    const netMaterial = new THREE.MeshBasicMaterial({
        color: 0xbbbbbb,
        wireframe: true,
        side: THREE.DoubleSide,
        flatShading: true
    });
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

    // Posts (left/right)
    const postGeometry = new THREE.BoxGeometry(0.1, goalHeight, 0.1);
    const leftPost = new THREE.Mesh(postGeometry, postMaterial);
    leftPost.position.set(-goalWidth / 2, goalHeight / 2, 0);
    goalGroup.add(leftPost);
    
    const rightPost = new THREE.Mesh(postGeometry, postMaterial);
    rightPost.position.set(goalWidth / 2, goalHeight / 2, 0);
    goalGroup.add(rightPost);

    // Crossbar
    const crossbar = new THREE.Mesh(
        new THREE.BoxGeometry(goalWidth, 0.1, 0.1),
        postMaterial
    );
    crossbar.position.set(0, goalHeight, 0);
    goalGroup.add(crossbar);

    // Net support lines (visual guides for net corners)
    // Top net lines
    goalGroup.add(createLine([
        new THREE.Vector3(-goalWidth / 2, goalHeight, 0),
        new THREE.Vector3(-goalWidth / 2, goalHeight, -goalDepth)
    ], lineMaterial));
    goalGroup.add(createLine([
        new THREE.Vector3(goalWidth / 2, goalHeight, 0),
        new THREE.Vector3(goalWidth / 2, goalHeight, -goalDepth)
    ], lineMaterial));
    
    // Bottom net lines
    goalGroup.add(createLine([
        new THREE.Vector3(-goalWidth / 2, 0, 0),
        new THREE.Vector3(-goalWidth / 2, 0, -goalDepth)
    ], lineMaterial));
    goalGroup.add(createLine([
        new THREE.Vector3(goalWidth / 2, 0, 0),
        new THREE.Vector3(goalWidth / 2, 0, -goalDepth)
    ], lineMaterial));

    // Net mesh (wireframe)
    const netMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(goalWidth, goalHeight, 10, 5),
        netMaterial
    );
    netMesh.position.set(0, goalHeight / 2, -goalDepth);
    goalGroup.add(netMesh);

    // Position and rotate the whole goal at correct end.
    goalGroup.position.set(x, 0, z);
    goalGroup.rotation.y = x > 0 ? -Math.PI / 2 : Math.PI / 2;

    return goalGroup;
}

