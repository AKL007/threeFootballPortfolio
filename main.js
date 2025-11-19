import * as THREE from 'three';

// Core modules
import { createScene, createCamera, createRenderer } from './core/scene.js';
import { setupLighting } from './core/lighting.js';
import { gameState } from './core/gameState.js';
import { GAME } from './config/game.js';
import './config/index.js'; // Make config available globally for UI play-testing

// Models
import { createStadium } from './models/stadium.js';
// import { createStadium } from './models/stadium-2.js';
import { createPlayer } from './models/player.js';
import { createBall } from './models/ball.js';
import { updateGrass } from './models/grass.js';

// Controls
import { setupMouseControls } from './controls/mouse.js';
import { setupKeyboardControls, setBallReference } from './controls/keyboard.js';

// Game logic
import { updatePlayerMovement } from './game/playerMovement.js';
import { updateBall } from './game/ballPhysics.js';
import { updateCamera } from './camera/cameraController.js';
import { setupScrollListener, updatePlayerReference } from './camera/scrollController.js';

// UI
import { updateUI } from './ui/ui.js';
import './ui/configPanel.js'; // Initialize config panel

// Initialize scene
const scene = createScene();
const camera = createCamera();
const renderer = createRenderer();

// Move canvas to canvas-container
const canvasContainer = document.getElementById('canvas-container');
if (canvasContainer) {
    canvasContainer.appendChild(renderer.domElement);
}

// Setup lighting
setupLighting(scene);

// Create game objects
// const stadium = await createStadium();
const stadium = createStadium(scene);
scene.add(stadium);
gameState.invisibleWalls = stadium.userData.invisibleWalls || [];

let player = null;
let playerMixer = null;

createPlayer((model, mixer) => {
    player = model;
    playerMixer = mixer;
    scene.add(player);
    // Update scroll controller with player reference
    updatePlayerReference(player);
});

const ball = createBall();
scene.add(ball);
setBallReference(ball); // Set ball reference for reset functionality

// Camera setup - start with top-down view for scroll animation
camera.position.set(0, 200, 0);
camera.lookAt(0, 0, 0);

// Setup scroll listener immediately (works even before player loads)
setupScrollListener(camera, null);

// Setup controls (will be set up after player loads)
let controlsSetup = false;

// Animation loop
let lastTime = performance.now();
let grassTime = 0;

function animate() {
    const currentTime = performance.now();
    let delta = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    
    // Clamp delta to prevent physics breaking when tab is hidden
    delta = Math.min(delta, GAME.MAX_DELTA);
    
    // Update grass animation
    grassTime += delta;
    if (stadium.userData.grassField) {
        updateGrass(stadium.userData.grassField, grassTime);
    }
    
    // Update TIFO cloth simulation
    if (stadium.userData.tifo) {
        stadium.userData.tifo.update(delta);
    }
    
    // Update player animation mixer
    if (playerMixer) {
        playerMixer.update(delta);
    }
    
    // Only update player-related systems if player is loaded
    if (player) {
        // Setup controls on first frame after player loads
        if (!controlsSetup) {
            setupMouseControls(renderer, player);
            setupKeyboardControls(player, camera);
            controlsSetup = true;
        }
        
        updatePlayerMovement(delta, player, ball);
        updateCamera(delta, camera, player);
        updateUI(player);
    }
    
    updateBall(delta, ball);
    
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Update pixel ratio on resize
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
