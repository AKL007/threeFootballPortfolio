import { gameState } from '../core/gameState.js';

export function updateUI(player) {
    const speed = gameState.playerVelocity.length() * 3.6; // Convert to km/h
    document.getElementById('speed').textContent = speed.toFixed(1);
    document.getElementById('position').textContent = 
        `${player.position.x.toFixed(1)}, ${player.position.z.toFixed(1)}`;
    document.getElementById('gamestate').textContent = gameState.zoomMode ? 'Zoom Mode' : 'Normal Mode';
    
    // Update power bar
    const powerBarContainer = document.getElementById('power-bar-container');
    const powerBar = document.getElementById('power-bar');
    const powerBarLabel = document.getElementById('power-bar-label');
    
    if (gameState.isChargingAction) {
        powerBarContainer.style.display = 'block';
        powerBar.style.width = `${gameState.actionPower * 100}%`;
        
        // Update label based on action type
        const actionLabels = {
            'pass': 'Pass',
            'through': 'Through Pass',
            'lob': 'Lob Pass',
            'shoot': 'Shoot'
        };
        powerBarLabel.textContent = actionLabels[gameState.currentActionType] || 'Power';
    } else {
        powerBarContainer.style.display = 'none';
        powerBar.style.width = '0%';
    }
}

