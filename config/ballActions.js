/**
 * Ball Actions Configuration
 * Constants for ball actions (pass, shoot, lob, etc.)
 */

export const BALL_ACTIONS = {
    // Action cooldown
    ACTION_COOLDOWN_TIME: 0.5, // seconds between actions
    
    // Pass configuration
    PASS: {
        BASE_SPEED: 5, // m/s - base pass speed
        MAX_SPEED: 25, // m/s - max pass speed
        UPWARD_BASE: 0.3, // Base upward component
        UPWARD_POWER_MULTIPLIER: 0.2, // Upward component scales with power
    },
    
    // Through pass configuration
    THROUGH_PASS: {
        BASE_SPEED: 20, // m/s - base through pass speed
        MAX_SPEED: 30, // m/s - max through pass speed
        AHEAD_DISTANCE: 0.3, // Pass further ahead multiplier
        UPWARD_BASE: 0.2, // Base upward component
        UPWARD_POWER_MULTIPLIER: 0.2, // Upward component scales with power
    },
    
    // Lob pass configuration
    LOB_PASS: {
        BASE_SPEED: 15, // m/s - base lob speed
        MAX_SPEED: 22, // m/s - max lob speed
        ANGLE: 45 * (Math.PI / 180), // 45 degrees in radians
    },
    
    // Shoot configuration
    SHOOT: {
        BASE_SPEED: 10, // m/s - base shot speed
        MAX_SPEED: 40, // m/s - powerful shot speed
        ANGLE_BASE: 10, // Base angle in degrees
        ANGLE_POWER_MULTIPLIER: 10, // Additional angle per power (10-20 degrees total)
    },
    
    // Ball return to player
    BALL_RETURN: {
        DISTANCE_THRESHOLD: 1, // meters - distance to player to regain possession
        VELOCITY_THRESHOLD: 0.5, // m/s - velocity threshold to check return
    },
    
    // Direction calculation
    DIRECTION: {
        MOVEMENT_BLEND_FACTOR: 0.7, // Blend factor between facing and movement direction
        MOVEMENT_THRESHOLD: 0.1, // m/s - minimum movement to use movement direction
    },
};

