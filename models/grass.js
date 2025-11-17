import * as THREE from 'three';

// Grass shader material
const grassVertexShader = `
    attribute float instanceId;
    attribute vec3 instancePosition;
    attribute float instanceRotation;
    attribute float instanceScale;
    attribute vec3 instanceColor;
    
    uniform float time;
    uniform vec3 windDirection;
    uniform float windStrength;
    
    varying vec3 vColor;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying float vHeight;
    
    void main() {
        vColor = instanceColor;
        
        // Transform position based on instance
        vec3 pos = position;
        
        // Scale
        pos *= instanceScale;
        
        // Rotate around Y axis
        float cosR = cos(instanceRotation);
        float sinR = sin(instanceRotation);
        vec2 rotatedXZ = mat2(cosR, -sinR, sinR, cosR) * pos.xz;
        pos.x = rotatedXZ.x;
        pos.z = rotatedXZ.y;
        
        // Rotate normal as well
        vec3 norm = normal;
        vec2 rotatedNormalXZ = mat2(cosR, -sinR, sinR, cosR) * norm.xz;
        norm.x = rotatedNormalXZ.x;
        norm.z = rotatedNormalXZ.y;
        vNormal = norm;
        
        // Apply wind effect based on height
        float heightFactor = (pos.y + 0.5) / 1.0; // Normalize height to 0-1
        heightFactor = max(0.0, heightFactor);
        
        // Wind swaying effect
        float windOffset = sin(time * 2.0 + instanceId * 0.1) * windStrength * heightFactor;
        float windOffset2 = sin(time * 1.5 + instanceId * 0.15) * windStrength * 0.5 * heightFactor;
        
        // Apply wind in X and Z directions
        pos.x += windOffset * windDirection.x;
        pos.z += windOffset * windDirection.z;
        pos.x += windOffset2 * windDirection.x * 0.5;
        pos.z += windOffset2 * windDirection.z * 0.5;
        
        // Bend grass based on height
        // float bendAmount = heightFactor * heightFactor * 0.3;
        // pos.x += bendAmount * sin(instanceRotation);
        // pos.z += bendAmount * cos(instanceRotation);
        
        vHeight = heightFactor;
        vPosition = pos;
        
        // Final position
        vec4 worldPosition = modelMatrix * vec4(pos + instancePosition, 1.0);
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
`;

const grassFragmentShader = `
    uniform vec3 lightDirection;
    uniform float lightIntensity;
    
    varying vec3 vColor;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying float vHeight;
    
    void main() {
        // Base color with height variation
        vec3 baseColor = vColor;
        
        // Add slight color variation based on height
        baseColor = mix(baseColor * 0.8, baseColor * 1.2, vHeight);
        
        // Simple lighting calculation
        vec3 normal = normalize(vNormal);
        // Transform normal to world space (simplified)
        float light = max(dot(normal, lightDirection), 0.2);
        light = mix(0.2, 1.0, light);
        
        // Add some depth with darker base
        float depth = 1.0 - vHeight * 0.3;
        
        vec3 finalColor = baseColor * light * depth;
        
        // Add slight gradient from bottom to top
        finalColor = mix(finalColor * 0.7, finalColor, vHeight);
        
        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

// Create a single grass blade geometry
function createGrassBladeGeometry(length, width) {
    const geometry = new THREE.PlaneGeometry(length, width, 1, 1);
    
    // Make it double-sided
    const positions = geometry.attributes.position.array;
    const normals = geometry.attributes.normal.array;
    
    // Add some variation to the blade shape
    const vertices = geometry.attributes.position;
    for (let i = 0; i < vertices.count; i++) {
        const x = vertices.getX(i);
        const y = vertices.getY(i);
        
        // Add slight curve to the blade
        const curve = Math.sin((y + 0.5) * Math.PI) * 0.05;
        vertices.setX(i, x + curve);
    }
    
    geometry.computeVertexNormals();
    return geometry;
}

/**
 * Creates a grid pattern grass field mimicking mowed grass (alternating columns and rows)
 * @param {number} width - Field width
 * @param {number} height - Field height
 * @param {number} numColumns - Number of columns (default: 18)
 * @param {number} numRows - Number of rows (default: 18)
 * @returns {THREE.Group} Group containing the grass grid
 */
export function createGridPatternGrass(width, height, numColumns = 18, numRows = 18) {
    const grassGroup = new THREE.Group();
    
    const columnWidth = width / numColumns;
    const rowHeight = height / numRows;
    
    // Define base shades for columns and rows
    const columnShade1 = new THREE.Color(0x7ab37a); // Lighter green for even columns
    const columnShade2 = new THREE.Color(0x6a9a6a); // Darker green for odd columns
    const rowShade1 = new THREE.Color(0x85b485);    // Lighter green for even rows
    const rowShade2 = new THREE.Color(0x75a575);    // Darker green for odd rows
    
    // Helper function to blend two colors
    const blendColors = (color1, color2) => {
        const blended = new THREE.Color();
        blended.r = (color1.r + color2.r) / 2;
        blended.g = (color1.g + color2.g) / 2;
        blended.b = (color1.b + color2.b) / 2;
        return blended;
    };
    
    // Create 2m border around the field with basic grass color
    const borderWidth = 1.0;
    const borderColor = new THREE.Color(0x7fb37f); // Basic grass green
    
    const borderMaterial = new THREE.MeshStandardMaterial({ 
        color: borderColor,
        roughness: 0.9,
        metalness: 0.0
    });
    
    // Create borders (extended to cover corners)
    const borders = [
        { width: width + 2 * borderWidth, height: borderWidth, x: 0, z: height / 2 + borderWidth / 2 },      // Top
        { width: width + 2 * borderWidth, height: borderWidth, x: 0, z: -height / 2 - borderWidth / 2 },   // Bottom
        { width: borderWidth, height: height + 2 * borderWidth, x: -width / 2 - borderWidth / 2, z: 0 },   // Left
        { width: borderWidth, height: height + 2 * borderWidth, x: width / 2 + borderWidth / 2, z: 0 }     // Right
    ];
    
    borders.forEach(border => {
        const mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(border.width, border.height, 1, 1),
            borderMaterial
        );
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(border.x, 0, border.z);
        mesh.receiveShadow = true;
        grassGroup.add(mesh);
    });
    
    // Create grid of squares with blended colors
    for (let col = 0; col < numColumns; col++) {
        for (let row = 0; row < numRows; row++) {
            // Determine column and row shades (alternating)
            const columnShade = col % 2 === 0 ? columnShade1 : columnShade2;
            const rowShade = row % 2 === 0 ? rowShade1 : rowShade2;
            
            // Blend column and row shades where they overlap
            const blendedColor = blendColors(columnShade, rowShade);
            
            // Create material with blended color
            const material = new THREE.MeshStandardMaterial({ 
                color: blendedColor,
                roughness: 0.9,
                metalness: 0.0
            });
            
            // Create square plane (low-poly: 1x1 segments)
            const square = new THREE.Mesh(
                new THREE.PlaneGeometry(columnWidth, rowHeight, 1, 1),
                material
            );
            
            // Rotate to lie flat on the ground
            square.rotation.x = -Math.PI / 2;
            
            // Position the square in the grid (centered)
            square.position.set(
                (col - numColumns / 2) * columnWidth + columnWidth / 2,
                0,
                (row - numRows / 2) * rowHeight + rowHeight / 2
            );
            
            square.receiveShadow = true;
            grassGroup.add(square);
        }
    }
    
    return grassGroup;
}

/**
 * Creates an instanced grass field with individual grass blades
 * @param {number} width - Field width
 * @param {number} height - Field height
 * @param {number} density - Grass density (default: 200)
 * @returns {THREE.Group} Group containing the grass field with base plane and instanced blades
 */
export function createInstancedGrassBlades(width, height, density = 200) {
    const grassGroup = new THREE.Group();
    
    // Create base plane for the field (for shadows and base color)
    const baseGeometry = new THREE.PlaneGeometry(width + 20, height + 20, 8, 1);
    const baseMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x85b485,
        roughness: 0.9,
        metalness: 0.0
    });
    const basePlane = new THREE.Mesh(baseGeometry, baseMaterial);
    basePlane.rotation.x = -Math.PI / 2;
    basePlane.receiveShadow = true;
    grassGroup.add(basePlane);
    
    // Create grass blade geometry
    const grassBladeLength = 0.005;
    const grassBladeWidth = 0.1;
    const bladeGeometry = createGrassBladeGeometry(grassBladeLength, grassBladeWidth);
    
    // Calculate number of instances
    const instanceCount = Math.floor(width * height * density);
    
    // Create instanced mesh
    const grassMesh = new THREE.InstancedMesh(
        bladeGeometry,
        null,
        instanceCount
    );
    
    // Create shader material
    const grassMaterial = new THREE.ShaderMaterial({
        vertexShader: grassVertexShader,
        fragmentShader: grassFragmentShader,
        side: THREE.DoubleSide,
        uniforms: {
            time: { value: 0 },
            windDirection: { value: new THREE.Vector3(1, 0, 0.5).normalize() },
            windStrength: { value: 0.005 }
        }
    });
    
    grassMesh.material = grassMaterial;
    grassMesh.frustumCulled = false;
    
    // Create instance attributes
    const instancePositions = new Float32Array(instanceCount * 3);
    const instanceRotations = new Float32Array(instanceCount);
    const instanceScales = new Float32Array(instanceCount);
    const instanceColors = new Float32Array(instanceCount * 3);
    const instanceIds = new Float32Array(instanceCount);
    
    // Random number generator
    const random = () => Math.random();
    
    // Populate instances
    for (let i = 0; i < instanceCount; i++) {
        // Random position within field bounds
        const x = (random() - 0.5) * width;
        const z = (random() - 0.5) * height;
        const y = 0.01; // Slightly above base plane to avoid z-fighting
        
        instancePositions[i * 3] = x;
        instancePositions[i * 3 + 1] = y;
        instancePositions[i * 3 + 2] = z;
        
        // Random rotation around Y axis
        instanceRotations[i] = random() * Math.PI * 2;
        
        // Random scale based on position pattern
        instanceScales[i] = (Math.floor(z / 3.5, 0) % 2 == 0 ? 0.5 : 0.2) + (Math.floor(x / 5.5, 0) % 2 == 0 ? 1 : 0) * 0.3;
        
        // Random color variation (green shades)
        const colorVariation = 0.8 + random() * 0.4;
        instanceColors[i * 3] = 0.2 * colorVariation;     // R
        instanceColors[i * 3 + 1] = 0.5 * colorVariation; // G
        instanceColors[i * 3 + 2] = 0.15 * colorVariation; // B
        
        // Instance ID for wind variation
        instanceIds[i] = i;
    }
    
    // Set instance attributes
    grassMesh.geometry.setAttribute('instancePosition', new THREE.InstancedBufferAttribute(instancePositions, 3));
    grassMesh.geometry.setAttribute('instanceRotation', new THREE.InstancedBufferAttribute(instanceRotations, 1));
    grassMesh.geometry.setAttribute('instanceScale', new THREE.InstancedBufferAttribute(instanceScales, 1));
    grassMesh.geometry.setAttribute('instanceColor', new THREE.InstancedBufferAttribute(instanceColors, 3));
    grassMesh.geometry.setAttribute('instanceId', new THREE.InstancedBufferAttribute(instanceIds, 1));
    
    grassGroup.add(grassMesh);
    
    // Store reference for animation
    grassGroup.userData.grassMesh = grassMesh;
    grassGroup.userData.material = grassMaterial;
    
    return grassGroup;
}

/**
 * Creates a grass field using the specified method
 * @param {number} width - Field width
 * @param {number} height - Field height
 * @param {string} method - 'grid' for grid pattern, 'instanced' for instanced blades (default: 'grid')
 * @param {object} options - Additional options based on method
 * @returns {THREE.Group} Group containing the grass field
 */
export function createGrassField(width, height, method = 'grid', options = {}) {
    if (method === 'instanced') {
        const density = options.density || 200;
        return createInstancedGrassBlades(width, height, density);
    } else {
        const numColumns = options.numColumns || 18;
        const numRows = options.numRows || 18;
        return createGridPatternGrass(width, height, numColumns, numRows);
    }
}

/**
 * Creates an extended grass area that goes under the stands
 * @param {number} fieldWidth - Field width
 * @param {number} fieldHeight - Field height
 * @param {number} extension - How many meters to extend beyond the field (default: 10)
 * @returns {THREE.Mesh} Mesh containing the extended grass area
 */
export function createExtendedGrassArea(fieldWidth, fieldHeight, extension = 10) {
    const extendedWidth = fieldWidth + 2 * extension;
    const extendedHeight = fieldHeight + 2 * extension;
    
    const grassMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x7fb37f, // Basic grass green
        roughness: 0.9,
        metalness: 0.0
    });
    
    const extendedGrass = new THREE.Mesh(
        new THREE.PlaneGeometry(extendedWidth, extendedHeight, 1, 1),
        grassMaterial
    );
    
    extendedGrass.rotation.x = -Math.PI / 2;
    extendedGrass.position.set(0, -0.01, 0); // Slightly below field grass but above ground
    extendedGrass.receiveShadow = true;
    
    return extendedGrass;
}

// Update grass animation
export function updateGrass(grassGroup, time) {
    if (grassGroup.userData.material) {
        grassGroup.userData.material.uniforms.time.value = time;
    }
}

