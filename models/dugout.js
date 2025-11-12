import * as THREE from 'three';

/**
 * Creates a dugout (for 'Analytics') with iPad displays.
 * @returns {THREE.Mesh} The dugout mesh with iPad displays
 */
export function createDugout() {
    // Dugout group: two benches, water bottles, crates, etc. on each side of halfway line

    const dugoutGroup = new THREE.Group();
    dugoutGroup.userData = { type: 'analytics' };

    // Dugout positions: one for each side of halfway line
    const dugoutZ = 45;
    const dugoutY = 0.1;

    // Helper: create a simple bench
    function createBench() {
        const benchGroup = new THREE.Group();

        // Bench base (seat)
        const seat = new THREE.Mesh(
            new THREE.BoxGeometry(5, 0.3, 0.7),
            new THREE.MeshLambertMaterial({ color: 0x222222, flatShading: true })
        );
        seat.position.set(0, 0.2, 0);
        benchGroup.add(seat);

        // Bench back
        const back = new THREE.Mesh(
            new THREE.BoxGeometry(5, 0.6, 0.2),
            new THREE.MeshLambertMaterial({ color: 0x222222, flatShading: true })
        );
        back.position.set(0, 0.65, -0.25);
        benchGroup.add(back);

        // Bench legs
        for (let x of [-2.1, 0, 2.1]) {
            for (let z of [0.28, -0.28]) {
                const leg = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8),
                    new THREE.MeshLambertMaterial({ color: 0x3e2723, flatShading: true })
                );
                leg.position.set(x, 0.04, z);
                benchGroup.add(leg);
            }
        }

        // Add glass canopy/shade above the bench
        const canopyGroup = new THREE.Group();

        // Canopy supports (vertical posts)
        const postMaterial = new THREE.MeshLambertMaterial({ color: 0x000000, flatShading: true });
        const postHeight = 2;
        const postY = 0.8;
        const postZFront = 0.42;
        const postZBack = -0.42;
        const postRadius = 0.02;
        for (let x of [-2.5, 2.5]) {
            // Front posts
            const postFront = new THREE.Mesh(
                new THREE.CylinderGeometry(postRadius, postRadius, postHeight, 10),
                postMaterial
            );
            postFront.position.set(x, postY, postZFront);
            canopyGroup.add(postFront);

            // Back posts (slightly higher for a sloped canopy)
            const postBack = new THREE.Mesh(
                new THREE.CylinderGeometry(postRadius, postRadius, postHeight + 0.2, 10),
                postMaterial
            );
            postBack.position.set(x, postY + 0.1, postZBack);
            canopyGroup.add(postBack);

            // Connect posts with a horizontal bar (left/right, front-back bottom)
            const barSideBottom = new THREE.Mesh(
                new THREE.BoxGeometry(2 * postRadius, 2 * postRadius, postZFront - postZBack),
                postMaterial
            );
            barSideBottom.position.set(x, postY + postHeight / 2, (postZFront + postZBack) / 2);
            canopyGroup.add(barSideBottom);

            // Connect posts with a diagonal bar (left/right, front-back bottom to top)
            const depth = Math.sqrt((postZFront - postZBack)**2 + (0.2)**2);
            const barSideTop = new THREE.Mesh(
                new THREE.BoxGeometry(2 * postRadius, 2 * postRadius, depth),
                postMaterial
            );
            barSideTop.position.set(x, postY + postHeight / 2 + 0.1 - 0.01, (postZFront + postZBack) / 2);
            barSideTop.rotation.x = Math.atan2(0.2, (postZFront - postZBack));
            canopyGroup.add(barSideTop);

        }
        // Canopy horizontal bars between left/right supports at front/back
        for (let z of [postZFront, postZBack]) {
            const horizBar = new THREE.Mesh(
                new THREE.BoxGeometry(5, 2 * postRadius, 2 * postRadius),
                postMaterial
            );
            // For front, position a bit lower (sloped canopy). For back, higher.
            const y = (z === postZFront) ? postY + postHeight / 2 : postY + postHeight / 2 + 0.2;
            horizBar.position.set(0, y, z);
            canopyGroup.add(horizBar);
        }

        // Glass canopy sheet (slight slope)
        // Transparent, light-blue-tinted glass
        const glassMat = new THREE.MeshPhysicalMaterial({
            color: 0x9cd6f7,
            transmission: 0.85,
            transparent: true,
            opacity: 0.55,
            roughness: 0.1,
            metalness: 0.1,
            ior: 1.5,
            thickness: 0.08,
            side: THREE.DoubleSide
        });
        const glassWidth = 5.0;
        const glassDepth = Math.sqrt((postZFront - postZBack)**2 + 0.2**2);
        const glass = new THREE.Mesh(
            new THREE.PlaneGeometry(glassWidth, glassDepth),
            glassMat
        );
        // Place the glass above the bench, center y between back and front top posts.
        glass.position.set(0, postY + postHeight / 2 + 0.1, 0);
        glass.rotation.x = -Math.atan2((postZFront - postZBack), 0.2); // Slope slightly downward toward front
        canopyGroup.add(glass);

        benchGroup.add(canopyGroup);

        return benchGroup;
    }

    // Helper: create a water bottle
    function createWaterBottle(color = 0x1C8ADB) {
        const bottle = new THREE.Group();
        const body = new THREE.Mesh(
            new THREE.CylinderGeometry(0.09, 0.11, 0.38, 12),
            new THREE.MeshLambertMaterial({ color: color, flatShading: true })
        );
        body.position.y = 0.19;
        bottle.add(body);

        const cap = new THREE.Mesh(
            new THREE.CylinderGeometry(0.07, 0.07, 0.06, 12),
            new THREE.MeshLambertMaterial({ color: 0x0d2046, flatShading: true })
        );
        cap.position.y = 0.39;
        bottle.add(cap);
        return bottle;
    }

    // Helper: create a crate
    function createCrate() {
        const crate = new THREE.Mesh(
            new THREE.BoxGeometry(0.75, 0.45, 0.55),
            new THREE.MeshLambertMaterial({ color: 0x4d2600, flatShading: true })
        );
        // Optionally add some stripes to look like a gatorade/ice crate:
        // for simplicity, just a colored "lid"
        const lid = new THREE.Mesh(
            new THREE.BoxGeometry(0.75, 0.05, 0.55),
            new THREE.MeshLambertMaterial({ color: 0xef652a, flatShading: true })
        );
        lid.position.y = 0.25;
        crate.add(lid);
        return crate;
    }

    // Helper: create a tactics board
    function createTacticsBoard() {
        // Use HTML canvas to draw a tactics/formation diagram
        const width = 1.3 * 256; // scale for texture resolution
        const height = 0.8 * 256;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Draw whiteboard base
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Draw black border
        ctx.strokeStyle = '#222222';
        ctx.lineWidth = 8;
        ctx.strokeRect(0, 0, width, height);

        // Draw half pitch: center line, penalty boxes, circles, goals.
        ctx.save();
        ctx.translate(width / 2, height / 2);
        const pitchW = 0.95 * width, pitchH = 0.91 * height;
        ctx.strokeStyle = "#34a853";
        ctx.lineWidth = 5;
        ctx.strokeRect(-pitchW/2, -pitchH/2, pitchW, pitchH);

        // Center line
        ctx.strokeStyle = "#228b22";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -pitchH/2);
        ctx.lineTo(0, pitchH/2);
        ctx.stroke();

        // Center circle
        ctx.beginPath();
        ctx.arc(0,0,pitchH*0.18,0,Math.PI*2);
        ctx.stroke();

        // Left penalty area
        ctx.strokeRect(-pitchW/2, -pitchH*0.21, pitchW*0.13, pitchH*0.42);
        // Right penalty area
        ctx.strokeRect(pitchW/2-pitchW*0.13, -pitchH*0.21, pitchW*0.13, pitchH*0.42);

        // Left goal
        ctx.strokeStyle = "#333333";
        ctx.strokeRect(-pitchW/2-8, -pitchH*0.08, 8, pitchH*0.16);
        // Right goal
        ctx.strokeRect(pitchW/2, -pitchH*0.08, 8, pitchH*0.16);

        ctx.restore();

        // Draw blue (home) formation, e.g., 4-3-3
        const home = [
            [0.10,0.50], // GK
            [0.23,0.14],[0.23,0.38],[0.23,0.62],[0.23,0.86], // Back four (DL, DC, DC, DR)
            [0.40,0.24],[0.40,0.5],[0.40,0.76], // 3 mids (LM, CM, RM)
            [0.58,0.18],[0.66,0.5],[0.58,0.82] // Front three (LW, ST, RW)
        ];
        ctx.fillStyle = '#215eef';
        home.forEach(pos => {
            ctx.beginPath();
            ctx.arc(pos[0]*width, pos[1]*height, width*0.025, 0, Math.PI*2);
            ctx.fill();
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 3;
            ctx.stroke();
        });

        // Draw red (away) formation, e.g., 4-4-2
        const away = [
            [0.95, 0.5], // GK
            [0.86, 0.18], [0.86, 0.5], [0.86, 0.82], // 3 Defenders
            [0.74, 0.12], [0.74, 0.29], [0.74, 0.5], [0.74, 0.71], [0.74, 0.88], // 5 Midfielders
            [0.63, 0.33], [0.63, 0.67] // 2 Forwards
        ];
        ctx.fillStyle = '#ee4135';
        away.forEach(pos => {
            ctx.beginPath();
            ctx.arc(pos[0]*width, pos[1]*height, width*0.025, 0, Math.PI*2);
            ctx.fill();
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 3;
            ctx.stroke();
        });

        // Draw "arrows" (tactics)
        function drawArrow(from, to, color) {
            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.7;
            const [fx, fy] = [from[0]*width, from[1]*height];
            const [tx, ty] = [to[0]*width, to[1]*height];
            ctx.beginPath();
            ctx.moveTo(fx,fy);
            ctx.lineTo(tx,ty);
            ctx.stroke();
            // Arrowhead
            const dx = tx-fx, dy = ty-fy, len = Math.sqrt(dx*dx+dy*dy);
            const nx = dx/len, ny = dy/len;
            const size = 12;
            ctx.beginPath();
            ctx.moveTo(tx,ty);
            ctx.lineTo(tx - size*nx + size*ny*0.6, ty - size*ny - size*nx*0.6);
            ctx.lineTo(tx - size*nx - size*ny*0.6, ty - size*ny + size*nx*0.6);
            ctx.lineTo(tx,ty);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
            ctx.restore();
        }
        // Example arrows: mids making runs
        drawArrow([0.40,0.24],[0.58,0.18],"#215eef");
        drawArrow([0.40,0.5],[0.66,0.5],"#215eef");
        drawArrow([0.40,0.76],[0.58,0.82],"#215eef");
        // drawArrow([0.58,0.18],[0.66,0.5],"#ee4135");
        // drawArrow([0.58,0.82],[0.66,0.5],"#ee4135");

        // Create texture
        const texture = new THREE.CanvasTexture(canvas);

        // Tactics board physical mesh
        const board = new THREE.Mesh(
            new THREE.BoxGeometry(1.3, 0.05, 0.8),
            new THREE.MeshLambertMaterial({ 
                map: texture,
                flatShading: true,
                color: 0xffffff,
                // Increased reflectivity or gloss if desired:
                reflectivity: 0.18 
            })
        );
        board.position.y = 0.025;

        return board;
    }

    // Arrangements:
    // Left side dugout
    const leftDugoutGroup = new THREE.Group();
    leftDugoutGroup.position.set(-12, dugoutY, dugoutZ);

    // Bench
    const leftBench = createBench();
    leftBench.position.y = 0; // seat at correct height
    leftDugoutGroup.add(leftBench);

    // Place water bottles by the bench
    for (let i = 0; i < 4; i++) {
        const bottle = createWaterBottle(i === 2 ? 0xE83E0B : 0x1C8ADB);
        bottle.position.set(-2 + i*1.3, -0.1, 0.53 + (i%2)*0.13);
        leftDugoutGroup.add(bottle);
    }

    // Crate next to the bench
    const leftCrate = createCrate();
    leftCrate.position.set(2.5, 0.22, +1.6);
    leftDugoutGroup.add(leftCrate);

    // Add tactics board om the ground
    const leftBoard = createTacticsBoard();
    leftBoard.position.set(-1.8, 0, +1.6);
    leftBoard.rotation.y = Math.PI/16;
    leftDugoutGroup.add(leftBoard);

    // Substitutes' backpack (simple)
    const backpack = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.45, 0.22),
        new THREE.MeshLambertMaterial({ color: 0x25435b, flatShading: true })
    );
    backpack.position.set(-2.5, 0.29, -0.75);
    leftDugoutGroup.add(backpack);

    // Right side dugout (mirror)
    const rightDugoutGroup = new THREE.Group();
    rightDugoutGroup.position.set(12, dugoutY, dugoutZ);

    // Bench
    const rightBench = createBench();
    rightDugoutGroup.add(rightBench);

    // Water bottles
    for (let i = 0; i < 3; i++) {
        const bottle = createWaterBottle(i === 1 ? 0xFFD600 : 0x098f13);
        bottle.position.set(-2 + i*2, -0.1, 0.63 - (i%2)*0.11);
        rightDugoutGroup.add(bottle);
    }

    // Crate
    const rightCrate = createCrate();
    rightCrate.position.set(-2.4, 0.22, +1.5);
    rightDugoutGroup.add(rightCrate);

    // Clipboard/tactic board
    const rightBoard = createTacticsBoard();
    rightBoard.rotation.z = -Math.PI/6;
    rightBoard.position.set(-1.5, 0.25, +1.6);
    rightDugoutGroup.add(rightBoard);

    // Footballs in net bag (three spheres in triangle, fake net)
    for (let i = 0; i < 3; i++) {
        const ball = new THREE.Mesh(
            new THREE.SphereGeometry(0.18, 16, 10),
            new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true })
        );
        ball.position.set(0.55 + 0.45*(i-1) + Math.random() * 0.2, 0.10, +1.9 + ((i%2)*0.18));
        rightDugoutGroup.add(ball);
    }

    leftDugoutGroup.rotation.y = Math.PI;
    rightDugoutGroup.rotation.y = Math.PI;
    // Add both dugouts to the main group
    dugoutGroup.add(leftDugoutGroup);
    dugoutGroup.add(rightDugoutGroup);

    return dugoutGroup;
}

