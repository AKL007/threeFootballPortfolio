import * as THREE from 'three';

/**
 * Creates a scoreboard screen (for 'Projects') with canvas texture.
 * Note: The scoreboard box is intentionally not created, only the screen is used.
 * @returns {THREE.Mesh} The scoreboard screen mesh
 */
export function createScoreboard() {
    // Scoreboard screen with canvas texture (projects preview)
    const screenGeometry = new THREE.PlaneGeometry(18, 10);
    const scoreboardCanvas = document.createElement('canvas');
    scoreboardCanvas.width = 1024;
    scoreboardCanvas.height = 568;
    const scoreboardCtx = scoreboardCanvas.getContext('2d');
    scoreboardCtx.fillStyle = '#000';
    scoreboardCtx.fillRect(0, 0, scoreboardCanvas.width, scoreboardCanvas.height);
    scoreboardCtx.fillStyle = '#00ff00';
    scoreboardCtx.font = 'bold 60px Arial';
    scoreboardCtx.textAlign = 'center';
    scoreboardCtx.fillText('PROJECTS', scoreboardCanvas.width / 2, 80);
    scoreboardCtx.fillStyle = '#ffffff';
    scoreboardCtx.font = '30px Arial';
    scoreboardCtx.fillText('Click to View Details', scoreboardCanvas.width / 2, scoreboardCanvas.height - 40);

    const screen = new THREE.Mesh(
        screenGeometry,
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(scoreboardCanvas), flatShading: true })
    );
    
    // Position the screen at the scoreboard location
    // The screen is positioned relative to where the scoreboard box would be
    screen.position.set(65, 10, -45);
    screen.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 4);
    screen.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 8);
    screen.translateZ(0.6); // Move forward from the box position
    
    screen.userData = { type: 'projects', position: new THREE.Vector3(45, 8, -25) };

    return screen;
}

