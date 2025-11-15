/**
 * Configuration Manager
 * Centralized configuration for all game constants
 * Exposes configs for UI play-testing
 */

import { BALL_PHYSICS } from './ballPhysics.js';
import { BALL_ACTIONS } from './ballActions.js';
import { PLAYER_MOVEMENT } from './playerMovement.js';
import { CAMERA } from './camera.js';
import { INTERACTIONS } from './interactions.js';
import { PENALTY } from './penalty.js';
import { GAME } from './game.js';

// Main config object that can be accessed from UI
export const CONFIG = {
    BALL_PHYSICS,
    BALL_ACTIONS,
    PLAYER_MOVEMENT,
    CAMERA,
    INTERACTIONS,
    PENALTY,
    GAME,
};

// Export individual configs for direct imports
export { BALL_PHYSICS } from './ballPhysics.js';
export { BALL_ACTIONS } from './ballActions.js';
export { PLAYER_MOVEMENT } from './playerMovement.js';
export { CAMERA } from './camera.js';
export { INTERACTIONS } from './interactions.js';
export { PENALTY } from './penalty.js';
export { GAME } from './game.js';

// Make config accessible globally for UI play-testing
if (typeof window !== 'undefined') {
    window.GAME_CONFIG = CONFIG;
}

