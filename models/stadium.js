import * as THREE from 'three';
import { createGrassField } from './grass.js';
import { createFieldMarkings, createPenaltyArea } from './fieldMarkings.js';
import { createGoal } from './goals.js';
import { createAllAdvertisementBoards } from './advertisementBoards.js';
import { createAllStands } from './stands.js';
import { createTifo } from './tifo.js';
import { createScoreboard } from './scoreboard.js';
import { createDugout } from './dugout.js';

/**
 * Creates and returns a fully decorated 3D stadium for use with Three.js.
 * @param {THREE.Object3D} helperParent - Optional parent for light helpers (should be scene or untransformed group)
 */
export function createStadium(helperParent = null) {
    const stadiumGroup = new THREE.Group();

    // ----- Ground Plane -----
    // Large flat ground plane on which everything sits.
    const stadiumWidth = 1000;
    const stadiumDepth = 1000;
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(stadiumWidth, stadiumDepth),
        new THREE.MeshStandardMaterial({ 
            color: 0x555555,
            roughness: 0.8,
            metalness: 0.0
        })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.05, 0);
    ground.receiveShadow = true;
    stadiumGroup.add(ground);

    // ----- Grass Field -----
    // Realistic grass field (imported/shader-based).
    const fieldWidth = 110;
    const fieldHeight = 70;
    const grassField = createGrassField(fieldWidth, fieldHeight);
    stadiumGroup.add(grassField);
    stadiumGroup.userData.grassField = grassField; // Reference for animation.

    // ----- Field Lines and Markings -----
    stadiumGroup.add(createFieldMarkings());

    // ----- Goals -----
    stadiumGroup.add(createGoal(-55, 0));
    stadiumGroup.add(createGoal(55, 0));

    // ----- Penalty and Six-yard Areas -----
    stadiumGroup.add(createPenaltyArea(-55, 0));
    stadiumGroup.add(createPenaltyArea(55, 0));

    // ----- Advertisement Boards -----
    stadiumGroup.add(createAllAdvertisementBoards());

    // ----- Stadium Stands (Bleachers) -----
    stadiumGroup.add(createAllStands(20, helperParent));

    // ----- TIFO Area (for 'Resume') -----
    const tifo = createTifo();
    stadiumGroup.add(tifo.mesh);
    stadiumGroup.userData.tifo = tifo; // Reference for animation

    // ----- Scoreboard (for 'Projects') -----
    // Note: Only the screen is created and added, not the box
    stadiumGroup.add(createScoreboard());

    // ----- Dugout (for 'Analytics') with iPad displays -----
    stadiumGroup.add(createDugout());

    return stadiumGroup;
}
