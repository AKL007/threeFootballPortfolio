import * as THREE from 'three';

/**
 * Creates a stadium stand block, including base, rails, and stepped seating.
 * @param {number} x - X center
 * @param {number} z - Z center
 * @param {number} width - Width of stand
 * @param {number} depth - Stepped depth (number of rows)
 * @param {number} baseHeight - Base block height
 * @param {number} rotationY - Orientation (radians)
 * @param {number} cornerAffordanceRight - Offset to ignore right-side (seating affordance)
 * @param {number} cornerAffordanceLeft - Offset to ignore left-side (seating affordance)
 * @returns {THREE.Group} Group containing the stadium stand
 */
export function createStands(x, z, width, depth, baseHeight, rotationY, cornerAffordanceRight, cornerAffordanceLeft) {
    const standsGroup = new THREE.Group();

    // Main stand base
    const base = new THREE.Mesh(
        new THREE.BoxGeometry(width, baseHeight, depth),
        new THREE.MeshLambertMaterial({ color: 0xda020e, flatShading: true })
    );
    base.position.y = baseHeight / 2;
    standsGroup.add(base);

    const stepHeight = 0.4;
    const stepDepth = 1.0;

    // Railing geometries
    const hypotenuseLength = depth * Math.sqrt(stepHeight * stepHeight + stepDepth * stepDepth);
    const railGeometry = new THREE.BoxGeometry(hypotenuseLength + 1, 1, 1);
    const railEndGeometry = new THREE.BoxGeometry(1, 2, 1);
    const railMaterial = new THREE.MeshLambertMaterial({ color: 0xda020e, flatShading: true });

    // Left rail and end
    const leftRail = new THREE.Mesh(railGeometry, railMaterial);
    leftRail.position.set(-width/2 + 0.45, baseHeight + (depth * stepHeight) / 2, 0);
    leftRail.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI / 2);
    leftRail.rotateOnAxis(new THREE.Vector3(0, 0, 1), -Math.atan(stepHeight / stepDepth));
    standsGroup.add(leftRail);

    const leftRailEnd = new THREE.Mesh(railEndGeometry, railMaterial);
    leftRailEnd.position.set(-width/2 + 0.45, 0, -depth/2);
    standsGroup.add(leftRailEnd);

    // Right rail and end
    const rightRail = new THREE.Mesh(railGeometry, railMaterial);
    rightRail.position.set(width/2 - 0.45, baseHeight + (depth * stepHeight) / 2, 0);
    rightRail.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI / 2);
    rightRail.rotateOnAxis(new THREE.Vector3(0, 0, 1), -Math.atan(stepHeight / stepDepth));
    standsGroup.add(rightRail);

    const rightRailEnd = new THREE.Mesh(railEndGeometry, railMaterial);
    rightRailEnd.position.set(width/2 - 0.45, 0, -depth/2);
    standsGroup.add(rightRailEnd);

    // Top rail across back
    const topRail = new THREE.Mesh(
        new THREE.BoxGeometry(width, 1, 1),
        railMaterial
    );
    topRail.position.set(0, baseHeight + depth * stepHeight, depth / 2 - 0.05);
    standsGroup.add(topRail);

    // Stepped risers
    for (let i = 0; i < depth; i++) {
        const stair = new THREE.Mesh(
            new THREE.BoxGeometry(width, stepHeight, stepDepth * (depth - i - 1)),
            new THREE.MeshLambertMaterial({ color: 0xbbbbbb, flatShading: true })
        );
        stair.position.set(0, baseHeight + stepHeight/2 + (stepHeight * i), i / 2 * stepDepth);
        standsGroup.add(stair);
    }

    // (Commented out: future seating capability)
    // cornerAffordanceRight = cornerAffordanceRight || 0;
    // cornerAffordanceLeft = width - cornerAffordanceLeft || width - 2;
    // Add seats here if needed

    // Final placement
    standsGroup.position.set(x, 0, z);
    standsGroup.rotation.y = rotationY;
    return standsGroup;
}

/**
 * Creates all stadium stands around the field.
 * @returns {THREE.Group} Group containing all stadium stands
 */
export function createAllStands() {
    const standsGroup = new THREE.Group();
    const standDepth = 30;
    const baseHeight = 1;
    
    // Add stands on each side of the field
    standsGroup.add(createStands(0, -60, 120, standDepth, baseHeight, Math.PI, 10, 0));
    standsGroup.add(createStands(0, 60, 120, standDepth, baseHeight, 0));
    standsGroup.add(createStands(-80, 0, 80, standDepth, baseHeight, -Math.PI / 2));
    standsGroup.add(createStands(80, 0, 80, standDepth, baseHeight, Math.PI / 2, 0, 10));
    
    return standsGroup;
}

