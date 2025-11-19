/**
 * Ball Physics Configuration
 * Constants for ball physics simulation
 */

export const BALL_PHYSICS = {
    // Gravity
    GRAVITY: 9.8, // m/s²
    
    // Ball dimensions
    RADIUS: 0.11, // meters
    GROUND_Y: 0.11, // Ball radius (ground level)
    
    // Bounce physics
    BOUNCE_ENERGY_RETENTION: 0.6, // 60% energy retention on bounce
    HORIZONTAL_VELOCITY_REDUCTION: 0.9, // Horizontal velocity reduction on bounce
    WALL_BOUNCE_ENERGY_RETENTION: 0.5, // Energy retention when bouncing off walls
    
    // Friction
    GROUND_FRICTION: 0.95, // Ground friction multiplier per frame
    
    // Movement thresholds
    STOP_THRESHOLD: 0.1, // Velocity threshold to stop ball (m/s)
    
    // Ball rotation
    ROTATION_SPEED_X: 5, // Ball rotation speed when in possession (rad/s)
    ROTATION_SPEED_Z: 3, // Ball rotation speed when in possession (rad/s)
    ROTATION_SPEED_IN_PLAY: 10, // Ball rotation speed when in play (rad/s)
};

