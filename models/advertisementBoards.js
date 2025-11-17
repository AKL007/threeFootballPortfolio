import * as THREE from 'three';

/**
 * Creates a single advertisement board as a box mesh.
 * @param {number} x - X position
 * @param {number} z - Z position
 * @param {number} rotationY - Y-axis rotation in radians
 * @param {number} length - Length of board
 * @returns {THREE.Group} Group containing the advertisement board
 */
export function createAdvertisementBoard(x, z, rotationY, length) {
    const board = new THREE.Mesh(
        new THREE.BoxGeometry(length, 2, 0.1),
        new THREE.MeshLambertMaterial({ color: 0x001100, flatShading: true })
    );
    board.position.set(x, 0, z);
    board.rotateOnAxis(new THREE.Vector3(0, 1, 0), rotationY);
    board.rotateOnAxis(new THREE.Vector3(1, 0, 0), z > 0 ? Math.PI / 9 : -Math.PI / 9);

    const group = new THREE.Group();
    group.add(board);
    return group;
}

/**
 * Creates all advertisement boards around the stadium.
 * @returns {THREE.Group} Group containing all advertisement boards
 */
export function createAllAdvertisementBoards() {
    const boardsGroup = new THREE.Group();
    
    // Boards behind goals and along touchlines
    boardsGroup.add(createAdvertisementBoard(0, 40, 0, 120));
    boardsGroup.add(createAdvertisementBoard(0, -40, 0, 120));
    boardsGroup.add(createAdvertisementBoard(-60, 0, Math.PI / 2, 80));
    boardsGroup.add(createAdvertisementBoard(60, 0, -Math.PI / 2, 80));
    
    return boardsGroup;
}

