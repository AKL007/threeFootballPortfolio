import * as THREE from 'three';

// Core modules
import { createScene, createCamera, createRenderer } from './core/scene.js';
import { setupLighting } from './core/lighting.js';
import { gameState } from './core/gameState.js';

// Models
import { createStadium } from './models/stadium.js';
// import { createStadium } from './models/stadium-2.js';
import { createPlayer } from './models/player.js';
import { createBall } from './models/ball.js';
import { updateGrass } from './models/grass.js';

// Controls
import { setupMouseControls } from './controls/mouse.js';
import { setupKeyboardControls } from './controls/keyboard.js';

// Game logic
import { updatePlayerMovement } from './game/playerMovement.js';
import { updateBall } from './game/ballPhysics.js';
import { updateCamera } from './camera/cameraController.js';

// UI
import { updateUI } from './ui/ui.js';

// Initialize scene
const scene = createScene();
const camera = createCamera();
const renderer = createRenderer();

// Setup lighting
setupLighting(scene);

// Create game objects
// const stadium = await createStadium();
const stadium = createStadium();
scene.add(stadium);

const player = createPlayer();
scene.add(player);

const ball = createBall();
scene.add(ball);

// Camera setup
camera.position.set(0, 90, 20);
camera.lookAt(0,0,0);

// Setup controls
setupMouseControls(renderer, player);
setupKeyboardControls(player, camera);

// Animation loop
let lastTime = performance.now();
let grassTime = 0;

function animate() {
    const currentTime = performance.now();
    let delta = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    
    // Clamp delta to prevent physics breaking when tab is hidden
    const MAX_DELTA = 0.1; // 100ms max
    delta = Math.min(delta, MAX_DELTA);
    
    // Update grass animation
    grassTime += delta;
    if (stadium.userData.grassField) {
        updateGrass(stadium.userData.grassField, grassTime);
    }
    
    // Update TIFO cloth simulation
    if (stadium.userData.tifo) {
        stadium.userData.tifo.update(delta);
    }
    
    updatePlayerMovement(delta, player, ball);
    updateBall(delta, ball);
    updateCamera(delta, camera, player);
    updateUI(player);
    
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
