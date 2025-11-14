import * as THREE from 'three';

export const gameState = {
    keys: {},
    playerVelocity: new THREE.Vector3(),
    ballVelocity: new THREE.Vector3(),
    cameraOffset: new THREE.Vector3(0, 5, 10),
    penaltyMode: false,
    penaltyPower: 0,
    penaltyDirection: new THREE.Vector2(0, 0),
    currentInteraction: null,
    zoomMode: false,
    zoomTarget: null,
    originalCameraPos: new THREE.Vector3(),
    originalCameraLook: new THREE.Vector3(),
    flyMode: false,
    flyCameraVelocity: new THREE.Vector3(),
    flyCameraEuler: new THREE.Euler(0, 0, 0, 'YXZ'),
    currentLookAt: null,
    actionPower: 0, // Power level for pass/shoot/lob (0-1)
    isChargingAction: false,
    currentActionType: null // 'pass', 'through', 'lob', 'shoot'
};

