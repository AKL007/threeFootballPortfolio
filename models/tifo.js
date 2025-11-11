import * as THREE from 'three';

/**
 * Creates a TIFO banner (for 'Resume') with interactive texture.
 * @returns {THREE.Mesh} The TIFO banner mesh
 */
export function createTifo() {
    const tifoGeometry = new THREE.PlaneGeometry(24, 12);

    // Draw TIFO banner to a canvas (textured)
    const tifoCanvas = document.createElement('canvas');
    tifoCanvas.width = 1024;
    tifoCanvas.height = 512;
    const tifoCtx = tifoCanvas.getContext('2d');
    tifoCtx.fillStyle = '#123123';
    tifoCtx.fillRect(0, 0, tifoCanvas.width, tifoCanvas.height);
    tifoCtx.fillStyle = '#ffffff';
    tifoCtx.font = 'bold 80px Arial';
    tifoCtx.textAlign = 'center';
    tifoCtx.fillText('RESUME', tifoCanvas.width / 2, tifoCanvas.height / 2 - 40);
    tifoCtx.font = '40px Arial';
    tifoCtx.fillText('Click to View', tifoCanvas.width / 2, tifoCanvas.height / 2 + 60);

    const tifoTexture = new THREE.CanvasTexture(tifoCanvas);
    const tifo = new THREE.Mesh(
        tifoGeometry,
        new THREE.MeshBasicMaterial({
            map: tifoTexture,
            side: THREE.DoubleSide,
            flatShading: true
        })
    );
    tifo.position.set(0, 7, -51);
    tifo.rotation.x = -(Math.PI / 2 - Math.atan(0.3 / 0.4));
    tifo.userData = { type: 'resume' };
    
    return tifo;
}

