/**
 * Centralized color configuration for the entire application
 * All colors used in 3D models, UI, and canvas elements are defined here
 */

import * as THREE from 'three';

// ============================================
// SCENE & ENVIRONMENT
// ============================================
export const SCENE_COLORS = {
    SKY_BLUE: 0xb9defe,
    GROUND: 0x555555,
};

// ============================================
// GRASS & FIELD
// ============================================
export const GRASS_COLORS = {
    COLUMN_SHADE_1: 0x7ab37a,  // Lighter green for even columns
    COLUMN_SHADE_2: 0x6a9a6a,  // Darker green for odd columns
    ROW_SHADE_1: 0x85b485,      // Lighter green for even rows
    ROW_SHADE_2: 0x75a575,      // Darker green for odd rows
    BORDER: 0x7fb37f,           // Basic grass green for borders
    BASE_PLANE: 0x85b485,       // Base plane color
};

// ============================================
// STANDS
// ============================================
export const STANDS_COLORS = {
    BASE: 0x333333, // black
    STEPPED_RISERS: 0x444444,
    FLOODLIGHT_HOUSING: 0x444444,
    FLOODLIGHT_HOUSING_EMISSIVE: 0x181818,
    FLOODLIGHT_CAVITY: 0x202833,
    FLOODLIGHT_INNER: 0xeaf5ff,
    FLOODLIGHT_INNER_EMISSIVE: 0xbfe7fb,
    RAIL: 0xffe400, // yellow
    SEAT: 0xffe400,
};

// ============================================
// LIGHTING
// ============================================
export const LIGHTING_COLORS = {
    AMBIENT: 0xffffff,
    DIRECTIONAL: 0xffffff,
    FILL: 0xffffff,
    FLOODLIGHT: 0xeaf5ff,
};

// ============================================
// FIELD MARKINGS
// ============================================
export const FIELD_MARKINGS_COLORS = {
    WHITE: 0xffffff,
};

// ============================================
// GOALS
// ============================================
export const GOAL_COLORS = {
    POST: 0xffffff,
    NET: 0xbbbbbb,
};

// ============================================
// BALL
// ============================================
export const BALL_COLORS = {
    WHITE: 0xffffff,
};

// ============================================
// SCOREBOARD
// ============================================
export const SCOREBOARD_COLORS = {
    PILLAR: 0xffffff,
    BACKGROUND: '#000',
    BORDER: '#888',
    HOME_COLOR: '#ffffff',
    AWAY_COLOR: '#ffffff',
    SCORE: '#ffffff',
    LABEL: '#cccccc',
};

// ============================================
// DUGOUT
// ============================================
export const DUGOUT_COLORS = {
    BENCH: 0x222222,
    BENCH_LEGS: 0x3e2723,
    POSTS: 0x000000,
    GLASS: 0x9cd6f7,
    WATER_BOTTLE_DEFAULT: 0x1C8ADB,
    WATER_BOTTLE_ORANGE: 0xE83E0B,
    WATER_BOTTLE_YELLOW: 0xFFD600,
    WATER_BOTTLE_GREEN: 0x098f13,
    WATER_BOTTLE_CAP: 0x0d2046,
    CRATE: 0x4d2600,
    CRATE_LID: 0xef652a,
    TACTICS_BOARD_BG: '#ffffff',
    TACTICS_BOARD_BORDER: '#222222',
    TACTICS_BOARD_PITCH: '#34a853',
    TACTICS_BOARD_CENTER_LINE: '#228b22',
    TACTICS_BOARD_GOAL: '#333333',
    TACTICS_BOARD_HOME: '#215eef',
    TACTICS_BOARD_AWAY: '#ee4135',
    TACTICS_BOARD_STROKE: '#ffffff',
    BACKPACK: 0x25435b,
    FOOTBALL: 0xffffff,
};

// ============================================
// STADIUM
// ============================================
export const STADIUM_COLORS = {
    GROUND: 0x555555,
};

// ============================================
// ADVERTISEMENT BOARDS
// ============================================
export const AD_BOARD_COLORS = {
    BOARD: 0x001100,
};

// ============================================
// TIFO
// ============================================
export const TIFO_COLORS = {
    BACKGROUND: '#ffffff',
    STROKE: 'black',
};

// ============================================
// UI COLORS
// ============================================
export const UI_COLORS = {
    // Config Panel
    CONFIG_PANEL_BG: 'rgba(0, 0, 0, 0.95)',
    CONFIG_PANEL_BORDER: '#4a9eff',
    CONFIG_PANEL_TEXT: 'white',
    CONFIG_PANEL_HEADER: '#4a9eff',
    CONFIG_PANEL_INPUT_BORDER: '#555',
    CONFIG_PANEL_INPUT_BG: '#2a2a2a',
    CONFIG_PANEL_CLOSE_BTN: '#ff4444',
    CONFIG_PANEL_CLOSE_BTN_HOVER: '#ff6666',
    
    // Modal
    MODAL_BG: 'rgba(0,0,0,0.9)',
    MODAL_CONTENT_BG: '#1a1a1a',
    
    // Content Cards
    CARD_BG: '#2a2a2a',
    CANVAS_BG: '#1a1a1a',
    
    // Power Bar
    POWER_BAR_BG: 'rgba(0,0,0,0.7)',
    POWER_BAR_GRADIENT_START: '#00ff00',
    POWER_BAR_GRADIENT_MID: '#ffff00',
    POWER_BAR_GRADIENT_END: '#ff0000',
    
    // Instructions
    INSTRUCTIONS_BG: 'rgba(0,0,0,0.5)',
    
    // Text
    TEXT_WHITE: 'white',
    TEXT_SHADOW: 'rgba(0,0,0,0.8)',
};

// ============================================
// ANALYTICS CANVAS COLORS
// ============================================
export const ANALYTICS_COLORS = {
    FIELD: '#2d5016',
    GOAL_STROKE: '#ffffff',
    XG_HIGH: 'rgba(255, 0, 0, 1)',      // Red for high xG
    XG_LOW: 'rgba(255, 255, 0, 0)',     // Yellow for low xG
    POSSESSION: 'rgba(0, 150, 255, 1)', // Blue for possession
    TRAJECTORY: '#ffff00',               // Yellow for trajectory
    BALL: '#ffffff',                     // White for ball
};

// ============================================
// HELPER FUNCTIONS
// ============================================
/**
 * Converts a hex number to THREE.Color
 * @param {number} hex - Hex color value (e.g., 0xffffff)
 * @returns {THREE.Color}
 */
export function hexToThreeColor(hex) {
    return new THREE.Color(hex);
}

/**
 * Converts a hex string to THREE.Color
 * @param {string} hexString - Hex color string (e.g., '#ffffff')
 * @returns {THREE.Color}
 */
export function hexStringToThreeColor(hexString) {
    return new THREE.Color(hexString);
}

