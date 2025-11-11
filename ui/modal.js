import { exitZoomMode } from '../camera/cameraController.js';

export function showModal(content) {
    document.getElementById('modal-content').innerHTML = content;
    document.getElementById('modal').style.display = 'flex';
}

export function closeModal() {
    document.getElementById('modal').style.display = 'none';
    exitZoomMode();
}

// Make closeModal available globally
window.closeModal = closeModal;

