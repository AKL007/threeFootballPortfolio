// TODO: change from Math.atan to Math.atan2 (check other files as well)

import * as THREE from 'three';
import { Scene } from 'three';
import { STANDS_COLORS, LIGHTING_COLORS } from '../config/colors.js';

/**
 * Creates a stadium stand block, including base, rails, and stepped seating.
 * @param {number} x - X center
 * @param {number} z - Z center
 * @param {number} width - Width of stand
 * @param {number} depth - Stepped depth (number of rows)
 * @param {number} baseHeight - Base block height
 * @param {number} rotationY - Orientation (radians)
 * @param {THREE.Object3D} helperParent - Optional parent for light helpers (should be scene or untransformed group)
 * @returns {THREE.Group} Group containing the stadium stand
 */
export function createStands(
  x,
  z,
  width,
  depth,
  baseHeight,
  rotationY,
  helperParent = null
) {
  const standsGroup = new THREE.Group();

  //--- CONSTANTS ---
  const stepHeight = 0.8;
  const stepDepth = 1.0;
  const wallHeight = 5;
  const stairHeight = stepHeight / 5;
  const baseMaterial = new THREE.MeshLambertMaterial({
    color: STANDS_COLORS.BASE,
    flatShading: true,
  });

  //--- HELPERS ---
  const addMesh = (geometry, material, position, rotation = null, parent = standsGroup) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    if (rotation) mesh.rotation.set(...rotation);
    parent.add(mesh);
    return mesh;
  };

  //-- BASE --
  addMesh(
    new THREE.BoxGeometry(width, baseHeight, depth),
    baseMaterial,
    [0, baseHeight / 2, -stepDepth / 2 + 0.01]
  );

  //-- STEPPED RISERS FOR SEATING --
  for (let i = 0; i < depth; i++) {
    addMesh(
      new THREE.BoxGeometry(width, stepHeight, stepDepth * (depth - i - 1)),
      new THREE.MeshLambertMaterial({ color: STANDS_COLORS.STEPPED_RISERS, flatShading: true }),
      [0, baseHeight + stepHeight / 2 + stepHeight * i, (i / 2) * stepDepth]
    );
  }

  //-- BACK WALL SEGMENTS (with 3 cavities) --
  const numCavities = 3;
  const cavityWidth = width / 10;
  const totalCavityWidth = numCavities * cavityWidth;
  const remainingWidth = width - totalCavityWidth;
  const segmentWidth = remainingWidth / (numCavities + 1);

  // Segment positions
  const segmentPositions = Array.from({ length: numCavities + 1 }, (_, i) =>
    -width / 2 + segmentWidth / 2 + i * (segmentWidth + cavityWidth)
  );
  const wallY = baseHeight + stepHeight * (depth - 1) + wallHeight / 2;
  const wallZ = depth / 2 - 1;

  segmentPositions.forEach((posX) => {
    addMesh(
      new THREE.BoxGeometry(segmentWidth, wallHeight, 1),
      baseMaterial,
      [posX, wallY, wallZ]
    );
  });

  //-- STAIRS DOWN STAND (every ~20m) --
  const numberOfSections = Math.floor(width / 20);
  const distanceBetweenStairs = (width - 3) / numberOfSections;
  for (let i = 0; i < depth; i++) {
    for (let j = 1.5; j < width; j += distanceBetweenStairs) {
      for (let k = 0; k < stepHeight; k += stairHeight) {
        addMesh(
          new THREE.BoxGeometry(1, stairHeight, stepDepth * (stepHeight - k) / stepHeight),
          baseMaterial,
          [
            -width / 2 + j,
            stepHeight * i + k + stairHeight / 2 + 0.01,
            -depth / 2 + ((i - 1.45) * stepDepth) + stepDepth / 2 + (k / stepHeight) * (stepDepth / 2),
          ]
        );
      }
    }
  }

  //-- TOP CEILING --
  const topCeiling = addMesh(
    new THREE.BoxGeometry(width, 1, (depth * 3) / 4),
    baseMaterial,
    [0, baseHeight + (depth - 1) * stepHeight + wallHeight, 2 * stepDepth]
  );

  //-- FLOODLIGHTS --
  const floodlightWidth = 5;
  const floodlightHeight = 2;
  const floodlightDepth = 2;
  const minSpacing = 15;
  const numFloodlights = Math.max(2, Math.floor(width / (floodlightWidth + minSpacing)));
  const floodlightSpacing = width / numFloodlights;
  const floodlightY = baseHeight + (depth - 1) * stepHeight + wallHeight + floodlightHeight / 2 + 0.15;
  const floodlightZ = topCeiling.position.z - (depth * 3) / 8 + 0.1;

  for (let i = 0; i < numFloodlights; i++) {
    const fx = -width / 2 + (i + 0.5) * floodlightSpacing;

    const housing = new THREE.Mesh(
      new THREE.BoxGeometry(floodlightWidth, floodlightHeight, floodlightDepth),
      new THREE.MeshLambertMaterial({ color: STANDS_COLORS.FLOODLIGHT_HOUSING, emissive: STANDS_COLORS.FLOODLIGHT_HOUSING_EMISSIVE, flatShading: true })
    );
    housing.position.set(fx, floodlightY, floodlightZ);

    // Cavity (visual only)
    const cavity = new THREE.Mesh(
      new THREE.BoxGeometry(
        floodlightWidth * 0.82,
        floodlightHeight * 0.60,
        floodlightDepth * 0.7
      ),
      new THREE.MeshLambertMaterial({ color: STANDS_COLORS.FLOODLIGHT_CAVITY, flatShading: true })
    );
    cavity.position.set(0, -0.01, floodlightDepth / 2 - 0.7 * floodlightDepth / 2 - 0.04);
    housing.add(cavity);

    // 5 Inner lights in cavity
    for (let j = 0; j < 5; j++) {
      const cavityWidth = floodlightWidth * 0.82;
      const cavityHeight = floodlightHeight * 0.60;
      const boxWidth = cavityWidth * 0.18;
      const boxHeight = cavityHeight;
      const boxDepth = 0.08;
      const xLight = -cavityWidth / 2 + (j + 0.5) * (cavityWidth / 5);
      const yLight = 0;
      const zLight = floodlightDepth / 2 - 0.03;

      const innerLight = new THREE.Mesh(
        new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth),
        new THREE.MeshLambertMaterial({
          color: STANDS_COLORS.FLOODLIGHT_INNER,
          emissive: STANDS_COLORS.FLOODLIGHT_INNER_EMISSIVE,
          emissiveIntensity: 1.1,
          flatShading: true,
        })
      );
      innerLight.position.set(xLight, yLight, zLight);
      housing.add(innerLight);
    }

    // Add a DirectionalLight to each floodlight housing
    const floodLightDir = new THREE.DirectionalLight(LIGHTING_COLORS.FLOODLIGHT, 0.15);
    floodLightDir.position.set(0 ,0 ,0);
    floodLightDir.target.position.set(0, -1, 5);
    housing.add(floodLightDir);
    housing.add(floodLightDir.target);

    // Visualize direction light with helper (add to helperParent to avoid double transform)
    // if (helperParent) {
    //   const helper = new THREE.DirectionalLightHelper(floodLightDir, 1, 0xffff88);
    //   helperParent.add(helper);
    // }

    housing.rotation.y = Math.PI;
    housing.rotation.x = -Math.PI / 9;
    standsGroup.add(housing);
  }

  //-- RAILINGS --
  const hypotenuseLength = depth * Math.sqrt(stepHeight ** 2 + stepDepth ** 2);
  const railMaterial = new THREE.MeshStandardMaterial({ color: STANDS_COLORS.RAIL, roughness: 0.3, metalness: 0.8 });

  // Utility for rails
  const addRail = (side) => {
    const sign = side === 'left' ? -1 : 1;
    // Rail
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(hypotenuseLength + 1, 1, 1),
      railMaterial
    );
    rail.position.set(sign * (width / 2 - 0.45), baseHeight + (depth * stepHeight) / 2, 0);
    rail.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI / 2);
    rail.rotateOnAxis(new THREE.Vector3(0, 0, 1), -Math.atan(stepHeight / stepDepth));
    standsGroup.add(rail);

    // Rail end
    const railEnd = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), railMaterial);
    railEnd.position.set(sign * (width / 2 - 0.45), 0, -depth / 2);
    standsGroup.add(railEnd);
  };

  addRail('left');
  addRail('right');

  //-- SEATING: InstancedMesh for performance --
  const seatWidth = 1.1;
  const seatDepthValue = 0.8;
  const seatHeight = 0.4;
  const seatColor = STANDS_COLORS.SEAT;
  const seatGap = 0.3;
  const seatAndGap = seatWidth + seatGap;

  // Determine stairway seat skip
  function isInStairway(x, width, dist) {
    for (let stairPos = 1.5; stairPos < width; stairPos += dist) {
      if (Math.abs(x + width / 2 - stairPos) < seatWidth) return true;
    }
    return false;
  }

  // Count seats
  let seatCount = 0;
  for (let i = 0; i < depth - 3; i++) {
    const y = baseHeight + stepHeight + stepHeight * i + seatHeight / 2;
    const z = -depth / 2 + i * stepDepth + seatDepthValue / 2 + 0.13;
    for (
      let xPos = -width / 2 + seatWidth / 2;
      xPos <= width / 2 - seatWidth / 2;
      xPos += seatAndGap
    ) {
      if (isInStairway(xPos, width, distanceBetweenStairs)) continue;
      seatCount++;
    }
  }

  const seatBaseGeometry = new THREE.BoxGeometry(seatWidth * 0.95, seatHeight * 0.5, seatDepthValue * 0.75);
  const seatBackGeometry = new THREE.BoxGeometry(seatWidth * 0.85, seatHeight * 3, seatDepthValue * 0.18);
  const seatMaterial = new THREE.MeshLambertMaterial({ color: seatColor, flatShading: true });
//   const seatMaterial = new THREE.MeshStandardMaterial({ color: seatColor, roughness: 0.1, metalness: 0.8 });

  const seatBaseInst = new THREE.InstancedMesh(seatBaseGeometry, seatMaterial, seatCount);
  const seatBackInst = new THREE.InstancedMesh(seatBackGeometry, seatMaterial, seatCount);
  seatBaseInst.castShadow = seatBackInst.castShadow = true;

  // Set seat matrix
  let idx = 0;
  for (let i = 0; i < depth - 3; i++) {
    const y = baseHeight + stepHeight + stepHeight * i + seatHeight / 2;
    const zBase = -depth / 2 + i * stepDepth + seatDepthValue;
    for (
      let xPos = -width / 2 + seatWidth / 2;
      xPos <= width / 2 - seatWidth / 2;
      xPos += seatAndGap
    ) {
      if (isInStairway(xPos, width, distanceBetweenStairs)) continue;

      let mBase = new THREE.Matrix4();
      mBase.makeTranslation(xPos, y, zBase);
      seatBaseInst.setMatrixAt(idx, mBase);

      let mBack = new THREE.Matrix4();
      mBack.makeTranslation(xPos, y + seatHeight * 0.3, zBase + seatDepthValue * 0.3);
      seatBackInst.setMatrixAt(idx, mBack);

      idx++;
    }
  }
  seatBaseInst.instanceMatrix.needsUpdate = true;
  seatBackInst.instanceMatrix.needsUpdate = true;

  standsGroup.add(seatBaseInst);
  standsGroup.add(seatBackInst);

  //-- FINAL PLACEMENT --
  standsGroup.position.set(x, 0, z);
  standsGroup.rotation.y = rotationY;


  return standsGroup;
}

/**
 * Creates all stadium stands around the field.
 * @param {number} standDepth - Depth of the stands
 * @param {THREE.Object3D} helperParent - Optional parent for light helpers (should be scene or untransformed group)
 * @returns {THREE.Group} Group containing all stadium stands
 */
export function createAllStands(standDepth = 30, helperParent = null) {
  const standsGroup = new THREE.Group();
  const baseHeight = 1;
  // Add stands on each side of the field
  standsGroup.add(createStands(0, -55, 120, standDepth, baseHeight, Math.PI, helperParent));
  standsGroup.add(createStands(0, 55, 120, standDepth, baseHeight, 0, helperParent));
  standsGroup.add(createStands(-75, 0, 80, standDepth, baseHeight, -Math.PI / 2, helperParent));
  standsGroup.add(createStands(75, 0, 80, standDepth, baseHeight, Math.PI / 2, helperParent));
  return standsGroup;
}
