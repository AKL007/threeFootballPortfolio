#!/usr/bin/env node

/**
 * Script to optimize GLB files using gltf-transform
 * This applies the full optimization pipeline:
 * 1. Deduplicate vertices
 * 2. Prune unused nodes/animations
 * 3. Resize textures to 1024px
 * 4. Convert textures to KTX2 (supercompressed)
 * 5. Apply mesh quantization
 * 6. Apply Draco compression
 */

const { execSync } = require('child_process');
const { readdirSync, existsSync, mkdirSync } = require('fs');
const { join, basename } = require('path');

// Get the directory where this script is located
const scriptDir = __dirname || process.cwd();

// Directories to process
const GLB_DIRS = [
    join(scriptDir, 'public/models/glb')
];

// Output directory for optimized files
const PUBLIC_OPTIMIZED_DIR = join(scriptDir, 'public/models/glb/optimized');

// Create output directory if it doesn't exist
if (!existsSync(PUBLIC_OPTIMIZED_DIR)) {
    mkdirSync(PUBLIC_OPTIMIZED_DIR, { recursive: true });
}

function optimizeGLB(inputPath, outputPath) {
    console.log(`\nOptimizing: ${basename(inputPath)}`);
    
    const steps = [
        { name: 'Deduplicating vertices', cmd: `npx gltf-transform dedup "${inputPath}" "${outputPath}.step1.glb"`, required: true },
        { name: 'Pruning unused nodes', cmd: `npx gltf-transform prune "${outputPath}.step1.glb" "${outputPath}.step2.glb"`, required: true },
        { name: 'Resizing textures', cmd: `npx gltf-transform resize --width 1024 --height 1024 "${outputPath}.step2.glb" "${outputPath}.step3.glb"`, required: true },
        { name: 'Converting to KTX2', cmd: `npx gltf-transform etc1s "${outputPath}.step3.glb" "${outputPath}.step4.glb"`, required: false },
        { name: 'Quantizing mesh', cmd: `npx gltf-transform quantize "${outputPath}.step4.glb" "${outputPath}.step5.glb"`, required: true },
        { name: 'Applying Draco compression', cmd: `npx gltf-transform draco "${outputPath}.step5.glb" "${outputPath}"`, required: true }
    ];
    
    try {
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            console.log(`  → ${step.name}...`);
            
            try {
                execSync(step.cmd, { stdio: 'inherit' });
            } catch (error) {
                if (step.required) {
                    throw error;
                } else {
                    console.log(`  ⚠ ${step.name} skipped (optional step failed, continuing...)`);
                    // If KTX2 step fails, use step3 for quantization instead of step4
                    if (i === 3) { // KTX2 step
                        // Update next step to use step3 instead of step4
                        steps[i + 1].cmd = steps[i + 1].cmd.replace('.step4.glb', '.step3.glb');
                    }
                }
            }
        }
        
        // Clean up intermediate files
        for (let i = 1; i <= 5; i++) {
            const tempFile = `${outputPath}.step${i}.glb`;
            if (existsSync(tempFile)) {
                execSync(`rm "${tempFile}"`);
            }
        }
        
        console.log(`  ✓ Optimized: ${basename(outputPath)}`);
        return true;
    } catch (error) {
        console.error(`  ✗ Error optimizing ${basename(inputPath)}:`, error.message);
        // Clean up intermediate files on error
        for (let i = 1; i <= 5; i++) {
            const tempFile = `${outputPath}.step${i}.glb`;
            if (existsSync(tempFile)) {
                try {
                    execSync(`rm "${tempFile}"`);
                } catch (e) {
                    // Ignore cleanup errors
                }
            }
        }
        return false;
    }
}

// Find and optimize all GLB files
let processed = 0;
let failed = 0;

GLB_DIRS.forEach(dir => {
    if (!existsSync(dir)) {
        console.log(`Directory not found: ${dir}`);
        return;
    }
    
    const files = readdirSync(dir).filter(file => file.endsWith('.glb'));
    
    files.forEach(file => {
        const inputPath = join(dir, file);
        const outputPath = join(PUBLIC_OPTIMIZED_DIR, file);
        
        if (optimizeGLB(inputPath, outputPath)) {
            processed++;
        } else {
            failed++;
        }
    });
});

console.log(`\n=== Optimization Complete ===`);
console.log(`Processed: ${processed}`);
console.log(`Failed: ${failed}`);
console.log(`\nOptimized files saved to:`);
console.log(`  - ${PUBLIC_OPTIMIZED_DIR}`);

