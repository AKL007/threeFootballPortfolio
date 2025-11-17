import * as THREE from 'three';
import { SCOREBOARD_COLORS } from '../config/colors.js';

/**
 * Creates a scoreboard screen (for 'Projects') with canvas texture.
 * Note: The scoreboard box is intentionally not created, only the screen is used.
 * @returns {THREE.Mesh} The scoreboard screen mesh
 */
export function createScoreboard() {

    const pillarGroup = new THREE.Group();

    const pillarGeometry = new THREE.CylinderGeometry(0.2, 0.2, 8, 32);
    const pillarMaterial = new THREE.MeshStandardMaterial({ 
        color: SCOREBOARD_COLORS.PILLAR,
        roughness: 0.6,
        metalness: 0.2
    });
    
    const pillarLeft = new THREE.Mesh(pillarGeometry, pillarMaterial);
    pillarLeft.position.set(66-5, 4, -46-5);
    pillarGroup.add(pillarLeft);

    const pillarRight = new THREE.Mesh(pillarGeometry, pillarMaterial);
    pillarRight.position.set(66+5, 4, -46+5);
    pillarGroup.add(pillarRight);

    const screenGeometry = new THREE.BoxGeometry(16, 9, 0.4);

    const scoreboardCanvas = document.createElement('canvas');
    scoreboardCanvas.width = 1600/2;
    scoreboardCanvas.height = 900/2;
    const scoreboardCtx = scoreboardCanvas.getContext('2d');
    // Background
    scoreboardCtx.fillStyle = SCOREBOARD_COLORS.BACKGROUND;
    scoreboardCtx.fillRect(0, 0, scoreboardCanvas.width, scoreboardCanvas.height);

    // Draw a gray rectangle boundary (stroke)
    scoreboardCtx.strokeStyle = SCOREBOARD_COLORS.BORDER;
    scoreboardCtx.lineWidth = 10;
    scoreboardCtx.strokeRect(
        5, 
        5, 
        scoreboardCanvas.width - 10, 
        scoreboardCanvas.height - 10
    );

    // Title: Home : Away
    scoreboardCtx.fillStyle = SCOREBOARD_COLORS.HOME_COLOR;
    scoreboardCtx.font = 'bold 60px Arial';
    scoreboardCtx.textAlign = 'center';
    scoreboardCtx.fillText('HOME', scoreboardCanvas.width / 4, 100);
    
    scoreboardCtx.fillStyle = SCOREBOARD_COLORS.AWAY_COLOR;
    scoreboardCtx.font = 'bold 60px Arial';
    scoreboardCtx.textAlign = 'center';
    scoreboardCtx.fillText('AWAY', scoreboardCanvas.width * 3 / 4, 100);

    // Score: 3 : 2
    scoreboardCtx.fillStyle = SCOREBOARD_COLORS.SCORE;
    scoreboardCtx.font = 'bold 170px Arial';
    scoreboardCtx.fillText('3  :  2', scoreboardCanvas.width / 2, 300);

    // Optional: Add a subtle "FULL TIME" label below the scores (optional)
    scoreboardCtx.fillStyle = SCOREBOARD_COLORS.LABEL;
    scoreboardCtx.font = '40px Arial';
    scoreboardCtx.fillText('FULL TIME', scoreboardCanvas.width / 2, 400);


    const screen = new THREE.Mesh(
        screenGeometry, 
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(scoreboardCanvas), flatShading: true })
    );
    screen.position.set(66, 12, -46);
    screen.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 4);
    pillarGroup.add(screen);

    return pillarGroup;
    
    // Scoreboard screen with canvas texture (projects preview)
    // const screenGeometry = new THREE.PlaneGeometry(18, 10);
    // const scoreboardCanvas = document.createElement('canvas');
    // scoreboardCanvas.width = 1024;
    // scoreboardCanvas.height = 568;
    // const scoreboardCtx = scoreboardCanvas.getContext('2d');
    // scoreboardCtx.fillStyle = '#000';
    // scoreboardCtx.fillRect(0, 0, scoreboardCanvas.width, scoreboardCanvas.height);
    // scoreboardCtx.fillStyle = '#00ff00';
    // scoreboardCtx.font = 'bold 60px Arial';
    // scoreboardCtx.textAlign = 'center';
    // scoreboardCtx.fillText('PROJECTS', scoreboardCanvas.width / 2, 80);
    // scoreboardCtx.fillStyle = '#ffffff';
    // scoreboardCtx.font = '30px Arial';
    // scoreboardCtx.fillText('Click to View Details', scoreboardCanvas.width / 2, scoreboardCanvas.height - 40);

    // const screen = new THREE.Mesh(
    //     screenGeometry,
    //     new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(scoreboardCanvas), flatShading: true })
    // );
    
    // // Position the screen at the scoreboard location
    // // The screen is positioned relative to where the scoreboard box would be
    // screen.position.set(65, 10, -45);
    // screen.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 4);
    // screen.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 16);
    // // screen.translateZ(0.6); // Move forward from the box position
    
    // screen.userData = { type: 'projects', position: new THREE.Vector3(45, 8, -25) };

    // return screen;
}

