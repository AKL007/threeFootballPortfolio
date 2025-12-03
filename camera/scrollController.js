import * as THREE from 'three';
import { gameState } from '../core/gameState.js';
import { CAMERA } from '../config/camera.js';

/**
 * Scroll-based camera controller
 * Animates camera from top-down stadium view to player position based on scroll
 */

// Easing function for smooth camera movement
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Calculate scroll progress (0 to 1)
function getScrollProgress() {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return Math.min(Math.max(scrollTop / scrollHeight, 0), 1);
}

// Initialize scroll mode camera positions
let scrollModeInitialized = false;
let topDownPosition = new THREE.Vector3(0, 200, 0); // High above stadium
let topDownLookAt = new THREE.Vector3(0, 0, 0); // Center of field
let playerPosition = new THREE.Vector3(0, 0, 0); // Player position
let playerCameraOffset = CAMERA.FOLLOW.FIXED_OFFSET.clone(); // Normal camera offset

export function initScrollMode(camera, player) {
    if (!scrollModeInitialized) {
        // Set initial top-down camera position
        topDownPosition.set(0, 200, 0);
        topDownLookAt.set(0, 0, 0);
        
        // Use player position if available, otherwise use default
        if (player) {
            playerPosition.copy(player.position);
        } else {
            playerPosition.set(0, 0, 0); // Default center position
        }
        
        const targetPos = playerPosition.clone().add(playerCameraOffset);
        
        // Store for interpolation
        gameState.scrollStartPos = topDownPosition.clone();
        gameState.scrollStartLookAt = topDownLookAt.clone();
        gameState.scrollEndPos = targetPos.clone();
        gameState.scrollEndLookAt = playerPosition.clone();
        
        scrollModeInitialized = true;
    }
}

export function updateScrollCamera(camera, player) {
    // Initialize if not done yet
    if (!scrollModeInitialized) {
        initScrollMode(camera, player);
    }
    
    const scrollProgress = getScrollProgress();
    const easedProgress = easeInOutCubic(scrollProgress);
    
    // Update player position reference if player is available
    if (player) {
        playerPosition.copy(player.position);
        const targetPos = playerPosition.clone().add(playerCameraOffset);
        
        // Update end positions (in case player moved)
        if (gameState.scrollEndPos) {
            gameState.scrollEndPos.copy(targetPos);
            gameState.scrollEndLookAt.copy(playerPosition);
        }
    }
    
    // Interpolate camera position
    if (gameState.scrollStartPos && gameState.scrollEndPos) {
        camera.position.lerpVectors(
            gameState.scrollStartPos,
            gameState.scrollEndPos,
            easedProgress
        );
        
        // Interpolate look-at target
        const currentLookAt = new THREE.Vector3().lerpVectors(
            gameState.scrollStartLookAt,
            gameState.scrollEndLookAt,
            easedProgress
        );
        
        camera.lookAt(currentLookAt);
    }
    
    // Enable normal camera controls when scroll is complete
    if (scrollProgress >= 0.99) {
        gameState.scrollMode = false;
    } else {
        gameState.scrollMode = true;
    }
    
    // Update 2D HTML content layer visibility based on scroll mode
    updateContentLayerVisibility();
}

export function updateContentLayerVisibility() {
    const contentLayer = document.getElementById('content');
    if (contentLayer) {
        if (gameState.scrollMode) {
            contentLayer.style.visibility = 'visible';
            contentLayer.style.pointerEvents = 'auto';
        } else {
            contentLayer.style.visibility = 'hidden';
            contentLayer.style.pointerEvents = 'none';
        }
    }
    
    // Hide UI and instructions when in scroll mode
    const uiElement = document.getElementById('ui');
    const instructionsElement = document.getElementById('instructions');
    
    // Check if mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                     (window.innerWidth <= 768 && 'ontouchstart' in window);
    
    if (uiElement) {
        // Only show UI if debug mode is enabled and not in scroll mode
        uiElement.style.display = (gameState.debugMode && !gameState.scrollMode) ? 'block' : 'none';
    }
    
    if (instructionsElement) {
        // Hide instructions on mobile, or based on scroll mode on desktop
        instructionsElement.style.display = (isMobile || gameState.scrollMode) ? 'none' : 'block';
    }
    
    // Hide mobile controls when in scroll mode (website area)
    const mobileControlsContainer = document.getElementById('mobile-controls');
    const resetButtonContainer = document.querySelector('.reset-button-container');
    
    if (mobileControlsContainer) {
        // Hide controls when scrollMode is true (website area), show when false (3D scene area)
        mobileControlsContainer.style.display = (isMobile && !gameState.scrollMode) ? 'block' : 'none';
    }
    
    if (resetButtonContainer) {
        // Hide reset button when in scroll mode (website area)
        resetButtonContainer.style.display = (isMobile && !gameState.scrollMode) ? 'block' : 'none';
    }
}

// Store camera and player references for scroll updates
let cameraRef = null;
let playerRef = null;

export function setupScrollListener(camera, player) {
    cameraRef = camera;
    playerRef = player;
    
    let ticking = false;
    
    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateScrollCamera(cameraRef, playerRef);
                
                // Lock scroll position at bottom if scrollMode is false
                if (!gameState.scrollMode) {
                    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
                    if (window.pageYOffset < maxScroll) {
                        window.scrollTo(0, maxScroll);
                    }
                }
                
                ticking = false;
            });
            ticking = true;
        }
    }
    
    // Prevent wheel events from scrolling past bottom
    function onWheel(e) {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        
        // If at bottom and trying to scroll down, prevent it
        if (scrollTop >= scrollHeight - 1 && e.deltaY > 0) {
            e.preventDefault();
        }
    }
    
    // Prevent arrow keys from scrolling when player is in control
    function onKeyDown(e) {
        // Only prevent arrow key scrolling when scrollMode is false (player in control)
        if (!gameState.scrollMode && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
            e.preventDefault();
        }
    }
    
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown, { passive: false });
    
    // Initial update
    initScrollMode(camera, player);
    updateScrollCamera(camera, player);
    
    // Initial visibility update
    updateContentLayerVisibility();
}

// Function to update player reference when player loads
export function updatePlayerReference(player) {
    playerRef = player;
    if (scrollModeInitialized && player) {
        // Re-initialize with actual player position
        scrollModeInitialized = false;
        initScrollMode(cameraRef, player);
    }
}

