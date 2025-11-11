import * as THREE from 'three';

/**
 * Creates a TIFO banner (for 'Resume') with interactive cloth-like physics.
 * @returns {Object} Object containing the mesh and update function
 */
export function createTifo() {
    const TIFO_WIDTH = 24;
    const TIFO_HEIGHT = 12;
    const CANVAS_WIDTH = 1600;
    const CANVAS_HEIGHT = 900;
    const IMAGE_SRC = 'public/images/adidasWallpaper.jpg';
    
    // Cloth simulation parameters
    const SEGMENTS_X = 32; // Number of horizontal segments
    const SEGMENTS_Y = 18; // Number of vertical segments
    const STIFFNESS = 0.7; // Cloth stiffness (0-1)
    const DAMPING = 0.95; // Velocity damping
    const WIND_STRENGTH = 0.3; // Wind force strength
    const GRAVITY = 0; // Gravity effect

    // Helper to draw default background
    function drawDefault(ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.font = 'bold 80px Arial';
        ctx.textAlign = 'center';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 8;
    }

    // Create canvas and texture
    const tifoCanvas = document.createElement('canvas');
    tifoCanvas.width = CANVAS_WIDTH;
    tifoCanvas.height = CANVAS_HEIGHT;
    const tifoCtx = tifoCanvas.getContext('2d');
    drawDefault(tifoCtx);

    // Prepare texture for use by Three.js
    const tifoTexture = new THREE.CanvasTexture(tifoCanvas);
    tifoTexture.needsUpdate = true;

    // Handle image loading for dynamic banner
    const adidasImg = new window.Image();
    adidasImg.src = IMAGE_SRC;
    adidasImg.onload = () => {
        tifoCtx.drawImage(adidasImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        tifoTexture.needsUpdate = true;
    };
    adidasImg.onerror = () => {
        // On error, just use default (already drawn)
    };

    // Create cloth geometry with grid of vertices
    const tifoGeometry = new THREE.PlaneGeometry(TIFO_WIDTH, TIFO_HEIGHT, SEGMENTS_X, SEGMENTS_Y);
    const positions = tifoGeometry.attributes.position;
    const numVertices = positions.count;

    // Initialize cloth particles (Verlet integration)
    const particles = [];
    const originalPositions = [];
    const velocities = [];
    const constraints = [];

    // Store original positions and initialize particles
    for (let i = 0; i < numVertices; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = positions.getZ(i);
        
        originalPositions.push(new THREE.Vector3(x, y, z));
        particles.push(new THREE.Vector3(x, y, z));
        velocities.push(new THREE.Vector3(0, 0, 0));
    }

    // Create distance constraints (springs) between adjacent particles
    for (let y = 0; y <= SEGMENTS_Y; y++) {
        for (let x = 0; x <= SEGMENTS_X; x++) {
            const idx = y * (SEGMENTS_X + 1) + x;
            
            // Horizontal constraints
            if (x < SEGMENTS_X) {
                constraints.push({
                    a: idx,
                    b: idx + 1,
                    restLength: TIFO_WIDTH / SEGMENTS_X
                });
            }
            
            // Vertical constraints
            if (y < SEGMENTS_Y) {
                constraints.push({
                    a: idx,
                    b: idx + (SEGMENTS_X + 1),
                    restLength: TIFO_HEIGHT / SEGMENTS_Y
                });
            }
        }
    }

    // Create TIFO mesh
    const tifoMaterial = new THREE.MeshBasicMaterial({
        map: tifoTexture,
        side: THREE.DoubleSide,
        flatShading: true
    });
    const tifoMesh = new THREE.Mesh(tifoGeometry, tifoMaterial);
    tifoMesh.position.set(0, 10.5, -50);
    tifoMesh.userData = { type: 'resume' };

    // Wind function (creates varying wind over time)
    let windTime = 0;
    function getWindForce(time) {
        return new THREE.Vector3(
            Math.sin(time * 0.5) * WIND_STRENGTH,
            Math.sin(time * 0.3) * WIND_STRENGTH * 0.5,
            Math.cos(time * 0.4) * WIND_STRENGTH * 0.3
        );
    }

    // Update function to be called in animation loop
    function updateTifo(delta) {
        windTime += delta;
        const windForce = getWindForce(windTime);

        // Apply forces to particles (except fixed top edge)
        for (let i = 0; i < numVertices; i++) {
            const y = Math.floor(i / (SEGMENTS_X + 1));
            const isTopEdge = y === SEGMENTS_Y; // Top edge is fixed
            
            if (!isTopEdge) {
                // Apply wind
                velocities[i].add(windForce.clone().multiplyScalar(delta));
                
                // Apply gravity
                velocities[i].y -= GRAVITY * delta;
                
                // Apply damping
                velocities[i].multiplyScalar(DAMPING);
                
                // Update position (Verlet integration)
                particles[i].add(velocities[i].clone().multiplyScalar(delta));
            }
        }

        // Apply constraints (multiple iterations for stability)
        for (let iter = 0; iter < 3; iter++) {
            for (const constraint of constraints) {
                const a = particles[constraint.a];
                const b = particles[constraint.b];
                const deltaPos = b.clone().sub(a);
                const distance = deltaPos.length();
                
                if (distance < 0.0001) continue; // Avoid division by zero
                
                const diff = (distance - constraint.restLength) / distance;
                
                // Move particles to satisfy constraint (split correction between both)
                const correction = deltaPos.multiplyScalar(diff * STIFFNESS * 0.5);
                
                // Don't move fixed top edge
                const aY = Math.floor(constraint.a / (SEGMENTS_X + 1));
                const bY = Math.floor(constraint.b / (SEGMENTS_X + 1));
                
                if (aY !== SEGMENTS_Y) {
                    a.add(correction);
                }
                if (bY !== SEGMENTS_Y) {
                    b.sub(correction);
                }
            }
        }

        // Update geometry positions
        for (let i = 0; i < numVertices; i++) {
            positions.setXYZ(
                i,
                particles[i].x,
                particles[i].y,
                particles[i].z
            );
        }
        positions.needsUpdate = true;
        
        // Update normals for lighting
        tifoGeometry.computeVertexNormals();
    }

    return {
        mesh: tifoMesh,
        update: updateTifo
    };
}
