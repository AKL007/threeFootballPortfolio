/**
 * Animation name constants
 * Update this file when adding new animations to the player model
 */

export const ANIMATIONS = {
    IDLE: 'Idle',
    JOG_FORWARD: 'JogForward',
    JOG_STRAFE_LEFT: 'JogStrafeLeft',
    JOG_STRAFE_RIGHT: 'JogStrafeRight',
    RUNNING_FORWARD: 'RunningForward',
    SOCCER_PASS: 'SoccerPass',
    SOCCER_PENALTY_KICK: 'SoccerPenaltyKick',
};

// Animation categories for easier access
export const MOVEMENT_ANIMATIONS = {
    IDLE: ANIMATIONS.IDLE,
    JOG: ANIMATIONS.JOG_FORWARD,
    RUN: ANIMATIONS.RUNNING_FORWARD,
};

export const ACTION_ANIMATIONS = {
    PASS: ANIMATIONS.SOCCER_PASS,
    PENALTY_KICK: ANIMATIONS.SOCCER_PENALTY_KICK,
};

