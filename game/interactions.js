import * as THREE from 'three';
import { startPenaltyMode } from './penalty.js';
import { startZoomMode } from '../camera/cameraController.js';
import { showResume, showProjects, showAnalytics } from '../ui/content.js';
import { INTERACTIONS } from '../config/interactions.js';

export function checkInteractions(player, camera) {
    const playerPos = player.position;
    
    // Check penalty spots
    for (const penaltySpot of INTERACTIONS.PENALTY_SPOTS) {
        if (playerPos.distanceTo(penaltySpot) < INTERACTIONS.DISTANCE) {
            startPenaltyMode();
            return;
        }
    }
    
    // Check scoreboard
    if (playerPos.distanceTo(INTERACTIONS.SCOREBOARD.POSITION) < INTERACTIONS.DISTANCE) {
        startZoomMode(INTERACTIONS.SCOREBOARD.POSITION, INTERACTIONS.SCOREBOARD.POSITION.clone(), () => showProjects(), camera, player);
        return;
    }
    
    // Check left dugout
    if (playerPos.distanceTo(INTERACTIONS.LEFT_DUGOUT.POSITION) < INTERACTIONS.DISTANCE) {
        startZoomMode(INTERACTIONS.LEFT_DUGOUT.POSITION, INTERACTIONS.LEFT_DUGOUT.POSITION.clone(), () => showAnalytics(), camera, player);
        return;
    }

    // Check right dugout
    if (playerPos.distanceTo(INTERACTIONS.RIGHT_DUGOUT.POSITION) < INTERACTIONS.DISTANCE) {
        startZoomMode(INTERACTIONS.RIGHT_DUGOUT.POSITION, INTERACTIONS.RIGHT_DUGOUT.POSITION.clone(), () => showAnalytics(), camera, player);
        return;
    }
    
    // Check TIFO
    if (playerPos.distanceTo(INTERACTIONS.TIFO.POSITION) < INTERACTIONS.TIFO.DISTANCE) {
        showResume();
        return;
    }
}

