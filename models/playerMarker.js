import * as THREE from 'three';

const PLAYER_MARKER_HEIGHT = 0.1;
const PLAYER_MARKER_COLOR = 0xffffff;

export function createPlayerMarker() {
    const playerMarkerGeometry = new THREE.RingGeometry(0.7, 0.8, 16);
    // const playerMarkerGeometry = new THREE.ConeGeometry(0.1, 0.3, 16);
    const playerMarker = new THREE.Mesh(
        playerMarkerGeometry,
        new THREE.MeshBasicMaterial({ color: PLAYER_MARKER_COLOR, opacity: 0.4, transparent: true, flatShading: true })
    );
    playerMarker.position.set(0, PLAYER_MARKER_HEIGHT, 0);
    playerMarker.rotation.x = -Math.PI/2;
    return playerMarker;
}


export function updatePlayerMarker(player, playerMarker) {
    playerMarker.position.copy(player.position);
    playerMarker.position.y = PLAYER_MARKER_HEIGHT;
    // playerMarker.position.x += gameState.playerVelocity.x/20;
}