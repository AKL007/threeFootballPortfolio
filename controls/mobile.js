import { gameState } from '../core/gameState.js';
import { resetGameState } from '../game/reset.js';

// Virtual joystick for movement
class VirtualJoystick {
    constructor(container) {
        this.container = container;
        this.base = document.createElement('div');
        this.stick = document.createElement('div');
        this.isActive = false;
        this.centerX = 0;
        this.centerY = 0;
        this.radius = 0;
        
        this.setupElements();
        this.setupEvents();
    }
    
    setupElements() {
        this.base.className = 'joystick-base';
        this.stick.className = 'joystick-stick';
        this.base.appendChild(this.stick);
        this.container.appendChild(this.base);
    }
    
    setupEvents() {
        const handleStart = (e) => {
            e.preventDefault();
            const touch = e.touches ? e.touches[0] : e;
            const rect = this.base.getBoundingClientRect();
            this.centerX = rect.left + rect.width / 2;
            this.centerY = rect.top + rect.height / 2;
            this.radius = rect.width / 2;
            this.isActive = true;
            this.updateStick(touch.clientX, touch.clientY);
        };
        
        const handleMove = (e) => {
            if (!this.isActive) return;
            e.preventDefault();
            const touch = e.touches ? e.touches[0] : e;
            this.updateStick(touch.clientX, touch.clientY);
        };
        
        const handleEnd = (e) => {
            if (!this.isActive) return;
            e.preventDefault();
            this.isActive = false;
            this.resetStick();
        };
        
        this.base.addEventListener('touchstart', handleStart, { passive: false });
        this.base.addEventListener('touchmove', handleMove, { passive: false });
        this.base.addEventListener('touchend', handleEnd, { passive: false });
        this.base.addEventListener('touchcancel', handleEnd, { passive: false });
        
        // Mouse support for testing
        this.base.addEventListener('mousedown', handleStart);
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleEnd);
    }
    
    updateStick(clientX, clientY) {
        const deltaX = clientX - this.centerX;
        const deltaY = clientY - this.centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Clamp to circle
        const clampedDistance = Math.min(distance, this.radius);
        const angle = Math.atan2(deltaY, deltaX);
        
        const stickX = Math.cos(angle) * clampedDistance;
        const stickY = Math.sin(angle) * clampedDistance;
        
        this.stick.style.transform = `translate(${stickX}px, ${stickY}px)`;
        
        // Update gameState keys based on joystick position
        // Normalize to -1 to 1 range
        const normalizedX = stickX / this.radius;
        const normalizedY = stickY / this.radius;
        
        // Dead zone to prevent drift
        const deadZone = 0.1;
        
        // Update movement keys
        gameState.keys['ArrowUp'] = normalizedY < -deadZone;
        gameState.keys['ArrowDown'] = normalizedY > deadZone;
        gameState.keys['ArrowLeft'] = normalizedX < -deadZone;
        gameState.keys['ArrowRight'] = normalizedX > deadZone;
    }
    
    resetStick() {
        this.stick.style.transform = 'translate(0, 0)';
        gameState.keys['ArrowUp'] = false;
        gameState.keys['ArrowDown'] = false;
        gameState.keys['ArrowLeft'] = false;
        gameState.keys['ArrowRight'] = false;
    }
}

// Action button for pass/shoot/through/chip
class ActionButton {
    constructor(container, key, label, position) {
        this.container = container;
        this.key = key;
        this.label = label;
        this.position = position;
        this.button = document.createElement('div');
        this.isPressed = false;
        
        this.setupElement();
        this.setupEvents();
    }
    
    setupElement() {
        this.button.className = 'action-button';
        this.button.textContent = this.label;
        this.button.dataset.action = this.key;
        this.button.dataset.position = this.position;
        this.container.appendChild(this.button);
    }
    
    setupEvents() {
        const handleStart = (e) => {
            e.preventDefault();
            this.isPressed = true;
            this.button.classList.add('pressed');
            // Simulate keydown event
            gameState.keys[this.key] = true;
        };
        
        const handleEnd = (e) => {
            if (!this.isPressed) return;
            e.preventDefault();
            this.isPressed = false;
            this.button.classList.remove('pressed');
            
            // Simulate keyup event - this triggers the action execution
            gameState.keys[this.key] = false;
            
            // Reset processed flags like keyboard.js does
            if (this.key === 'KeyS') {
                gameState.keys['KeyS_processed'] = false;
            } else if (this.key === 'KeyW') {
                gameState.keys['KeyW_processed'] = false;
            } else if (this.key === 'KeyA') {
                gameState.keys['KeyA_processed'] = false;
            } else if (this.key === 'KeyD') {
                gameState.keys['KeyD_processed'] = false;
            }
        };
        
        this.button.addEventListener('touchstart', handleStart, { passive: false });
        this.button.addEventListener('touchend', handleEnd, { passive: false });
        this.button.addEventListener('touchcancel', handleEnd, { passive: false });
        
        // Mouse support for testing
        this.button.addEventListener('mousedown', handleStart);
        this.button.addEventListener('mouseup', handleEnd);
        this.button.addEventListener('mouseleave', handleEnd);
    }
}

// Store references to player and ball
let playerRef = null;
let ballRef = null;

export function setPlayerReference(player) {
    playerRef = player;
}

export function setBallReference(ball) {
    ballRef = ball;
}

// Reset button class
class ResetButton {
    constructor(container) {
        this.container = container;
        this.button = document.createElement('div');
        this.setupElement();
        this.setupEvents();
    }
    
    setupElement() {
        this.button.className = 'reset-button';
        this.button.textContent = 'Kick Off';
        this.container.appendChild(this.button);
    }
    
    setupEvents() {
        const handleClick = (e) => {
            e.preventDefault();
            if (playerRef && ballRef && !gameState.flyMode) {
                resetGameState(playerRef, ballRef);
            }
        };
        
        this.button.addEventListener('touchstart', handleClick, { passive: false });
        this.button.addEventListener('touchend', (e) => {
            e.preventDefault();
        });
        
        // Mouse support for testing
        this.button.addEventListener('click', handleClick);
    }
}

// Main mobile controls setup
export function setupMobileControls() {
    // Only show on mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                     (window.innerWidth <= 768 && 'ontouchstart' in window);
    
    if (!isMobile) {
        return;
    }
    
    // Create reset button container (top right) - add directly to body
    const resetContainer = document.createElement('div');
    resetContainer.className = 'reset-button-container';
    // Hide initially - will be shown by scroll controller based on scroll mode
    resetContainer.style.display = 'none';
    document.body.appendChild(resetContainer);
    new ResetButton(resetContainer);
    
    // Create controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.id = 'mobile-controls';
    controlsContainer.className = 'mobile-controls-container';
    // Hide initially - will be shown by scroll controller based on scroll mode
    controlsContainer.style.display = 'none';
    document.body.appendChild(controlsContainer);
    
    // Create joystick container (bottom left)
    const joystickContainer = document.createElement('div');
    joystickContainer.className = 'joystick-container';
    controlsContainer.appendChild(joystickContainer);
    
    // Create action buttons container (bottom right)
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'action-buttons-container';
    controlsContainer.appendChild(buttonsContainer);
    
    // Initialize joystick
    const joystick = new VirtualJoystick(joystickContainer);
    
    // Initialize action buttons (Xbox controller layout)
    // Top: Through (W)
    // Right: Shoot (D)
    // Bottom: Pass (S)
    // Left: Chip/Lob (A)
    const buttonLayout = [
        { key: 'KeyW', label: 'Through', position: 'top' },
        { key: 'KeyD', label: 'Shoot', position: 'right' },
        { key: 'KeyS', label: 'Pass', position: 'bottom' },
        { key: 'KeyA', label: 'Chip', position: 'left' }
    ];
    
    buttonLayout.forEach(({ key, label, position }) => {
        new ActionButton(buttonsContainer, key, label, position);
    });
}

