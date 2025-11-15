/**
 * Camera Configuration
 * Constants for camera behavior and controls
 */

import * as THREE from 'three';

export const CAMERA = {
    // Fly camera mode
    FLY: {
        SPEED: 100, // Movement speed
        ACCELERATION: 400, // Acceleration rate
        DAMPING: 0.85, // Velocity damping
        MAX_PITCH: Math.PI / 2 - 0.1, // Maximum pitch angle to prevent gimbal lock
    },
    
    // Normal camera following
    FOLLOW: {
        LERP_SPEED: 0.1, // Camera position lerp speed
        LOOK_AT_LERP_SPEED: 0.15, // Camera look-at lerp speed
        FIXED_OFFSET: new THREE.Vector3(0, 10, 15), // Behind and above player
    },
    
    // Zoom mode
    ZOOM: {
        SPEED: 2, // Zoom animation speed
        DISTANCE: -8, // Distance from target
        HEIGHT_OFFSET: 2, // Height offset from target
    },
    
    // Penalty mode camera
    PENALTY: {
        GOAL_OFFSET_X: 50, // X offset for goal position
        GOAL_OFFSET_Y: 5, // Y offset for goal position
        LERP_SPEED: 0.1, // Camera lerp speed
    },
    
    // Mouse controls
    MOUSE: {
        SENSITIVITY: 0.002, // Mouse sensitivity for fly camera
    },
};

