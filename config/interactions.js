/**
 * Interactions Configuration
 * Constants for player interactions with game objects
 */

import * as THREE from 'three';

export const INTERACTIONS = {
    // Interaction distance
    DISTANCE: 5, // meters - distance to trigger interaction
    
    // Penalty spots
    PENALTY_SPOTS: [
        new THREE.Vector3(-43, 0, 0),
        new THREE.Vector3(43, 0, 0),
    ],
    
    // Scoreboard
    SCOREBOARD: {
        POSITION: new THREE.Vector3(66, 0, -46),
    },
    
    // Left Dugout
    LEFT_DUGOUT: {
        POSITION: new THREE.Vector3(-12, 0.1, 45),
    },

    // Right Dugout
    RIGHT_DUGOUT: {
        POSITION: new THREE.Vector3(12, 0.1, 45),
    },
    
    // TIFO
    TIFO: {
        POSITION: new THREE.Vector3(0, 12, -32),
        DISTANCE: 15, // meters - larger distance for TIFO interaction
    },
};

