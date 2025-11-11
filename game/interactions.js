import * as THREE from 'three';
import { startPenaltyMode } from './penalty.js';
import { startZoomMode } from '../camera/cameraController.js';
import { showResume, showProjects, showAnalytics } from '../ui/content.js';

export function checkInteractions(player, camera) {
    const playerPos = player.position;
    const interactionDistance = 5;
    
    // Check penalty spot
    const penaltySpot1 = new THREE.Vector3(-11, 0, 0);
    const penaltySpot2 = new THREE.Vector3(11, 0, 0);
    
    if (playerPos.distanceTo(penaltySpot1) < interactionDistance || 
        playerPos.distanceTo(penaltySpot2) < interactionDistance) {
        startPenaltyMode();
        return;
    }
    
    // Check scoreboard
    const scoreboardPos = new THREE.Vector3(45, 8, -25);
    if (playerPos.distanceTo(scoreboardPos) < interactionDistance) {
        startZoomMode(scoreboardPos, new THREE.Vector3(45, 8, -25), () => showProjects(), camera, player);
        return;
    }
    
    // Check dugout
    const dugoutPos = new THREE.Vector3(0, 2.5, 30);
    if (playerPos.distanceTo(dugoutPos) < interactionDistance) {
        startZoomMode(dugoutPos, new THREE.Vector3(0, 2.5, 30), () => showAnalytics(), camera, player);
        return;
    }
    
    // Check TIFO
    const tifoPos = new THREE.Vector3(0, 12, -32);
    if (playerPos.distanceTo(tifoPos) < 15) {
        showResume();
        return;
    }
}

