import { gameState } from '../core/gameState.js';

export function updateUI(player) {
    const speed = gameState.playerVelocity.length() * 3.6; // Convert to km/h
    document.getElementById('speed').textContent = speed.toFixed(1);
    document.getElementById('position').textContent = 
        `${player.position.x.toFixed(1)}, ${player.position.z.toFixed(1)}`;
    document.getElementById('gamestate').textContent = gameState.zoomMode ? 'Zoom Mode' : 'Normal Mode';
}

