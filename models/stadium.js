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
 */
export function createStadium() {
    const stadiumGroup = new THREE.Group();

    // ----- Ground Plane -----
    // Large flat ground plane on which everything sits.
    const stadiumWidth = 2000;
    const stadiumDepth = 1400;
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(stadiumWidth, stadiumDepth),
        new THREE.MeshLambertMaterial({ color: 0x555555, flatShading: true })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.1, 0);
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
    stadiumGroup.add(createAllStands());

    // ----- TIFO Area (for 'Resume') -----
    stadiumGroup.add(createTifo());

    // ----- Scoreboard (for 'Projects') -----
    // Note: Only the screen is created and added, not the box
    const scoreboard = createScoreboard();
    stadiumGroup.add(scoreboard);

    // ----- Dugout (for 'Analytics') with iPad displays -----
    stadiumGroup.add(createDugout());

    return stadiumGroup;
}
