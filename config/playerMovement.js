/**
 * Player Movement Configuration
 * Constants for player movement, rotation, and animation
 */

export const PLAYER_MOVEMENT = {
    // Speed and acceleration
    MAX_SPEED: 6, // m/s - realistic running speed (~21.6 km/h)
    SPRINT_SPEED: 9, // m/s - sprint speed (~32.4 km/h)
    ACCELERATION: 4, // m/s² - acceleration rate
    DECELERATION: 8, // m/s² - deceleration rate (faster than acceleration)
    
    // Rotation
    ROTATION_SPEED: 8, // radians per second
    
    // Animation thresholds
    JOG_THRESHOLD: 4.5, // m/s - threshold between jog and run animation
    
    // Action charging
    CHARGE_RATE: 2.0, // Power per second
    MAX_POWER: 1.0, // Maximum power (0-1)
    MIN_POWER_TO_EXECUTE: 0.1, // Minimum power required to execute action
    
    // Animation transitions
    ANIMATION_FADE_TIME: 0.3, // seconds - fade time for animation transitions
    
    // Ball following (when in possession)
    BALL_OFFSET: { x: 0, y: 0.0, z: 1 }, // Ball offset from player
    BALL_LERP_SPEED: 0.3, // Lerp speed for ball following player
};

