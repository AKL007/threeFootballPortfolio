import * as THREE from 'three';

/**
 * Creates a field line from an array of points.
 * @param {Array<THREE.Vector3>} points - Array of Vector3 points
 * @param {THREE.LineBasicMaterial} lineMaterial - Material for the line
 * @returns {THREE.Line} The created line
 */
export function createLine(points, lineMaterial) {
    return new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        lineMaterial
    );
}

/**
 * Creates all field markings including lines, center circle, and center spot.
 * @returns {THREE.Group} Group containing all field markings
 */
export function createFieldMarkings() {
    const markingsGroup = new THREE.Group();
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

    // Center Line
    markingsGroup.add(createLine([
        new THREE.Vector3(0, 0.01, -35),
        new THREE.Vector3(0, 0.01, 35)
    ], lineMaterial));

    // Side Lines (top/bottom)
    markingsGroup.add(createLine([
        new THREE.Vector3(-55, 0.01, -35),
        new THREE.Vector3(55, 0.01, -35)
    ], lineMaterial));
    markingsGroup.add(createLine([
        new THREE.Vector3(-55, 0.01, 35),
        new THREE.Vector3(55, 0.01, 35)
    ], lineMaterial));

    // Goal Lines (left/right ends)
    markingsGroup.add(createLine([
        new THREE.Vector3(-55, 0.01, -35),
        new THREE.Vector3(-55, 0.01, 35)
    ], lineMaterial));
    markingsGroup.add(createLine([
        new THREE.Vector3(55, 0.01, -35),
        new THREE.Vector3(55, 0.01, 35)
    ], lineMaterial));

    // Center Circle
    const centerCircle = new THREE.Mesh(
        new THREE.RingGeometry(10, 10.05, 64),
        new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, flatShading: true })
    );
    centerCircle.rotation.x = -Math.PI / 2;
    centerCircle.position.y = 0.01;
    markingsGroup.add(centerCircle);

    // Center Spot
    const centerSpot = new THREE.Mesh(
        new THREE.CircleGeometry(0.2, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff, flatShading: true })
    );
    centerSpot.rotation.x = -Math.PI / 2;
    centerSpot.position.set(0, 0.01, 0);
    markingsGroup.add(centerSpot);

    return markingsGroup;
}

/**
 * Creates a penalty area and six-yard box for a given goal side.
 * @param {number} x - X position (goal position: negative for left, positive for right)
 * @param {number} z - Z center of field
 * @returns {THREE.Group} Group containing penalty area markings
 */
export function createPenaltyArea(x, z) {
    const penaltyGroup = new THREE.Group();
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

    // Penalty box outline
    const penaltyBoxPts = [
        new THREE.Vector3(0, 0.01, -22),
        new THREE.Vector3(0, 0.01, 22),
        new THREE.Vector3(x > 0 ? -18 : 18, 0.01, 22),
        new THREE.Vector3(x > 0 ? -18 : 18, 0.01, -22)
    ];
    penaltyGroup.add(new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(penaltyBoxPts), 
        lineMaterial
    ));

    // Six-yard box outline
    const sixYardPts = [
        new THREE.Vector3(0, 0.01, -10),
        new THREE.Vector3(0, 0.01, 10),
        new THREE.Vector3(x > 0 ? -6 : 6, 0.01, 10),
        new THREE.Vector3(x > 0 ? -6 : 6, 0.01, -10)
    ];
    penaltyGroup.add(new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(sixYardPts), 
        lineMaterial
    ));

    // Penalty spot
    const penSpot = new THREE.Mesh(
        new THREE.CircleGeometry(0.2, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff, flatShading: true })
    );
    penSpot.rotation.x = -Math.PI / 2;
    penSpot.position.set(x > 0 ? -12 : 12, 0.02, 0);
    penaltyGroup.add(penSpot);

    penaltyGroup.position.set(x, 0, z);
    return penaltyGroup;
}

