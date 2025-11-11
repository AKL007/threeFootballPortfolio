import * as THREE from 'three';

/**
 * Creates a dugout (for 'Analytics') with iPad displays.
 * @returns {THREE.Mesh} The dugout mesh with iPad displays
 */
export function createDugout() {
    // Dugout object (placed near half-line)
    const dugout = new THREE.Mesh(
        new THREE.BoxGeometry(8, 5, 0.5),
        new THREE.MeshLambertMaterial({ color: 0x222222, flatShading: true })
    );
    dugout.position.set(0, 2.5, 40);
    dugout.rotation.y = Math.PI;
    dugout.userData = { type: 'analytics' };

    // iPad-like displays inside dugout
    for (let i = 0; i < 3; i++) {
        const ipad = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 2, 0.1),
            new THREE.MeshLambertMaterial({ color: 0x000000, flatShading: true })
        );
        ipad.position.set((i - 1) * 2.5, 1, 0.3);
        ipad.userData = { type: 'analytics', index: i };
        dugout.add(ipad);

        // iPad white screen
        const ipadScreen = new THREE.Mesh(
            new THREE.PlaneGeometry(1.3, 1.8),
            new THREE.MeshBasicMaterial({ color: 0xffffff, flatShading: true })
        );
        ipadScreen.position.z = 0.06;
        ipad.add(ipadScreen);
        ipadScreen.userData = { type: 'analytics', index: i };
    }

    return dugout;
}

