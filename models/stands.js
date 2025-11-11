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

    const stepHeight = 1.0;
    const stepDepth = 1.0;

    // Main stand base
    const base = new THREE.Mesh(
        new THREE.BoxGeometry(width, baseHeight, depth),
        new THREE.MeshLambertMaterial({ color: 0xda020e, flatShading: true })
    );
    base.position.y = baseHeight / 2;
    base.position.z = -stepDepth / 2;
    standsGroup.add(base);


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
        new THREE.BoxGeometry(width, 1, depth),
        railMaterial
    );
    topRail.position.set(0, baseHeight + depth * stepHeight, 0);
    standsGroup.add(topRail);

    // Stepped risers for seating
    for (let i = 0; i < depth; i++) {
        const stair = new THREE.Mesh(
            new THREE.BoxGeometry(width, stepHeight, stepDepth * (depth - i - 1)),
            new THREE.MeshLambertMaterial({ color: 0xbbbbbb, flatShading: true })
        );
        stair.position.set(0, baseHeight + stepHeight/2 + (stepHeight * i), i / 2 * stepDepth);
        standsGroup.add(stair);
    }

    // Stepped risers for stairs every 20 meters across the width of the stand
    const stairHeight = stepHeight / 5;
    for (let i = 0; i < depth; i++) {
        const numberOfSections = Math.floor(width / 20);
        const distanceBetweenStairs = (width - 3) / numberOfSections;
        for (let j = 1.5; j < width; j += distanceBetweenStairs) {
            for (let k = 0; k < stepHeight; k += stairHeight) {
                const stair = new THREE.Mesh(
                    new THREE.BoxGeometry(1, stairHeight, stepDepth * (stepHeight - k) / stepHeight),
                    new THREE.MeshLambertMaterial({ color: 0x000000, flatShading: true })
                );
                stair.position.set(-width/2 + j, (stepHeight * i) + k + stairHeight/2 + 0.01, -depth/2 + ((i - 1 - 0.3 - 0.01) * stepDepth) + stepDepth/2 + (k / stepHeight) * stepDepth / 2);
                standsGroup.add(stair);
            }
        }
    }
    

    // Improved: Use InstancedMesh for all seats for performance
    const seatWidth = 1.1;
    const seatDepth = 0.8;
    const seatHeight = 0.4;
    const seatLegHeight = 0.35;
    const seatColor = 0x35518a;
    // const seatBackColor = 0x12318a;

    // Spacing between seats
    const seatGap = 0.3;
    const seatAndGap = seatWidth + seatGap;

    // Function to determine if x is in a stairway
    function isInStairway(x, width, distanceBetweenStairs) {
        for (let stairPos = 1.5; stairPos < width; stairPos += distanceBetweenStairs) {
            if (Math.abs(x + width / 2 - stairPos) < seatWidth) {
                return true;
            }
        }
        return false;
    }

    // --- COUNT SEATS TO ALLOCATE INSTANCES ---
    let seatCount = 0;
    let seatBackCount = 0;

    for (let i = 0; i < depth - 3; i++) {
        // Same as before
        const y = baseHeight + stepHeight + (stepHeight * i) + seatHeight / 2;
        const z = -depth / 2 + (i * stepDepth) + seatDepth / 2 + 0.13;
        const numberOfSections = Math.floor(width / 20);
        const distanceBetweenStairs = (width - 3) / numberOfSections;

        for (
            let x = -width / 2 + seatWidth / 2;
            x <= width / 2 - seatWidth / 2;
            x += seatAndGap
        ) {
            if (isInStairway(x, width, distanceBetweenStairs)) continue;
            seatCount++;
            seatBackCount++;
        }
    }

    // --- CREATE INSTANCED MESHES ---
    const seatBaseGeometry = new THREE.BoxGeometry(seatWidth * 0.95, seatHeight * 0.5, seatDepth * 0.85);
    const seatBackGeometry = new THREE.BoxGeometry(seatWidth * 0.85, seatHeight * 3, seatDepth * 0.18);
    const seatMaterial = new THREE.MeshLambertMaterial({ color: seatColor, flatShading: true });
    const seatBaseInst = new THREE.InstancedMesh(seatBaseGeometry, seatMaterial, seatCount);
    const seatBackInst = new THREE.InstancedMesh(seatBackGeometry, seatMaterial, seatBackCount);
    seatBaseInst.castShadow = true;
    seatBackInst.castShadow = true;

    // --- SET INSTANCE MATRICES ---
    let seatIdx = 0, seatBackIdx = 0;
    for (let i = 0; i < depth - 3; i++) {
        const y = baseHeight + stepHeight + (stepHeight * i) + seatHeight / 2;
        const z = -depth / 2 + (i * stepDepth) + seatDepth / 2 + 0.13;

        const numberOfSections = Math.floor(width / 20);
        const distanceBetweenStairs = (width - 3) / numberOfSections;

        for (
            let x = -width / 2 + seatWidth / 2;
            x <= width / 2 - seatWidth / 2;
            x += seatAndGap
        ) {
            if (isInStairway(x, width, distanceBetweenStairs)) continue;

            // Seat base
            {
                const m = new THREE.Matrix4();
                m.makeTranslation(x, y, z);
                seatBaseInst.setMatrixAt(seatIdx, m);
                seatIdx++;
            }

            // Seat back
            {
                const m = new THREE.Matrix4();
                m.makeTranslation(x, y + seatHeight * 0.3, z + seatDepth * 0.3);
                // If seatback needs rotation, add here (commented out as in original)
                // m.multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));
                seatBackInst.setMatrixAt(seatBackIdx, m);
                seatBackIdx++;
            }
        }
    }
    // Required after setting matrices so shadows, raycasting, etc, will work
    seatBaseInst.instanceMatrix.needsUpdate = true;
    seatBackInst.instanceMatrix.needsUpdate = true;

    standsGroup.add(seatBaseInst);
    standsGroup.add(seatBackInst);

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

