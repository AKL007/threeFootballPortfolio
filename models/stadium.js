import * as THREE from 'three';
import { createGrassField, createExtendedGrassArea } from './grass.js';
import { createFieldMarkings, createPenaltyArea } from './fieldMarkings.js';
import { createGoal } from './goals.js';
import { createAllAdvertisementBoards } from './advertisementBoards.js';
import { createAllStands } from './stands.js';
import { createTifo } from './tifo.js';
import { createScoreboard } from './scoreboard.js';
import { createDugout } from './dugout.js';
import { createTreeCluster } from './trees.js';
import { STADIUM_COLORS } from '../config/colors.js';
import { createInvisibleWall } from './invisibleWalls.js';
import { gameState } from '../core/gameState.js';

/**
 * Creates and returns a fully decorated 3D stadium for use with Three.js.
 * @param {THREE.Object3D} helperParent - Optional parent for light helpers (should be scene or untransformed group)
 */
export function createStadium(helperParent = null) {
    const stadiumGroup = new THREE.Group();
    const invisibleWalls = [];
    gameState.goalNets = [];

    const addInvisibleWall = (wall) => {
        invisibleWalls.push(wall);
        stadiumGroup.add(wall);
    };

    // ----- Ground Plane -----
    // Large flat ground plane on which everything sits.
    const stadiumWidth = 1000;
    const stadiumDepth = 1000;
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(stadiumWidth, stadiumDepth),
        new THREE.MeshStandardMaterial({ 
            color: STADIUM_COLORS.GROUND,
            roughness: 0.8,
            metalness: 0.0
        })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.05, 0);
    ground.receiveShadow = true;
    stadiumGroup.add(ground);

    // ----- Extended Grass Area (under stands) -----
    const fieldLength = 110;
    const fieldWidth = 70;
    const extendedGrass = createExtendedGrassArea(fieldLength, fieldWidth, 10);
    stadiumGroup.add(extendedGrass);

    // ----- Grass Field -----
    // Realistic grass field (imported/shader-based).
    const grassField = createGrassField(fieldLength, fieldWidth, 'instanced', {density: 400});
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

    // ----- Trees in Corner Areas -----
    // Add trees in three corners (excluding northeast corner where scoreboard is)
    // Northwest corner
    // stadiumGroup.add(createTreeCluster(-70, 50, 6, 10));
    // // Southwest corner
    // stadiumGroup.add(createTreeCluster(-70, -50, 6, 10));
    // // Southeast corner
    // stadiumGroup.add(createTreeCluster(70, 50, 6, 10));
    // Northeast corner (where scoreboard is) - skipped

    // ----- Trees behind the stands all along the sides -----
    for (let i = -95; i < 105; i+=10) {
        stadiumGroup.add(createTreeCluster(i, -85 , 10, 20));
        stadiumGroup.add(createTreeCluster(i, 85, 10, 20));
    }
    for (let i = -75; i < 75; i+=10) {
        stadiumGroup.add(createTreeCluster(-105, i, 10, 20));
    stadiumGroup.add(createTreeCluster(105, i, 10, 20));
    }

    // ----- Invisble Walls -----
    addInvisibleWall(createInvisibleWall(-fieldLength / 2 - 10, 0, 70 + 20, 0));
    addInvisibleWall(createInvisibleWall(fieldLength / 2 + 10, 0, 70 + 20, Math.PI));
    addInvisibleWall(createInvisibleWall(0, -fieldWidth / 2 - 10, 110 + 20, Math.PI / 2));
    addInvisibleWall(createInvisibleWall(0, fieldWidth / 2 + 10, 110 + 20, -Math.PI / 2));

    stadiumGroup.userData.invisibleWalls = invisibleWalls;

    return stadiumGroup;
}
