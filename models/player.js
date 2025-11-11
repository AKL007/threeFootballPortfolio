import * as THREE from 'three';

export function createPlayer() {
    const playerGroup = new THREE.Group();
    
    // Body
    const bodyGeometry = new THREE.CapsuleGeometry(0.3, 1.2, 4, 4);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x0066ff, flatShading: true });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.6;
    body.castShadow = true;
    playerGroup.add(body);
    
    // Head
    const headGeometry = new THREE.SphereGeometry(0.2, 16, 8);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xffdbac, flatShading: true });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.5;
    head.castShadow = true;
    playerGroup.add(head);
    
    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 4);
    const legMaterial = new THREE.MeshLambertMaterial({ color: 0x0066ff, flatShading: true });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.15, 0.4, 0);
    leftLeg.castShadow = true;
    playerGroup.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.15, 0.4, 0);
    rightLeg.castShadow = true;
    playerGroup.add(rightLeg);
    
    playerGroup.position.set(0, 0, 0);
    return playerGroup;
}

