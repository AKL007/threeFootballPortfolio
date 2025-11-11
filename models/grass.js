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

// Create grass field using instanced meshes
export function createGrassField(width, height, density = 200) {
    const grassGroup = new THREE.Group();
    
    // Create base plane for the field (for shadows and base color)
    const baseGeometry = new THREE.PlaneGeometry(width + 20, height + 20, 8, 1);
    const baseMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x85b485,
        flatShading: true 
    });
    const basePlane = new THREE.Mesh(baseGeometry, baseMaterial);
    basePlane.rotation.x = -Math.PI / 2;
    basePlane.receiveShadow = true;
    grassGroup.add(basePlane);
    
    // Create grass blade geometry
    const grassBladeLength = 0.02;
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
            windStrength: { value: 0.005 },
            // lightDirection: { value: new THREE.Vector3(-50, -100, -50).normalize() }, // Matches scene directional light
            // lightIntensity: { value: 1.0 }
        }
    });
    
    grassMesh.material = grassMaterial;
    grassMesh.castShadow = true;
    grassMesh.receiveShadow = false;
    grassMesh.frustumCulled = false; // ADD THIS LINE - prevents culling when camera moves
    
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
        
        // Random scale (0.7 to 1.3)
        // instanceScales[i] = 0.7 + random() * 0.6;
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

// Update grass animation
export function updateGrass(grassGroup, time) {
    if (grassGroup.userData.material) {
        grassGroup.userData.material.uniforms.time.value = time;
    }
}

