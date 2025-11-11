import * as THREE from 'three';
import { createGrassField } from './grass.js';

/**
 * Creates and returns a fully decorated 3D stadium for use with Three.js.
 */
export function createStadium() {
    const stadiumGroup = new THREE.Group();

    // ----- Ground Plane -----
    // Large flat ground plane on which everything sits.
    const stadiumWidth = 2000;
    const stadiumDepth = 1400;
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(stadiumWidth, stadiumDepth),
        new THREE.MeshLambertMaterial({ color: 0x555555, flatShading: true })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.1, 0);
    ground.receiveShadow = true;
    stadiumGroup.add(ground);

    // ----- Grass Field -----
    // Realistic grass field (imported/shader-based).
    const fieldWidth = 110;
    const fieldHeight = 70;
    const grassField = createGrassField(fieldWidth, fieldHeight);
    stadiumGroup.add(grassField);
    stadiumGroup.userData.grassField = grassField; // Reference for animation.

    // ----- Field Lines and Markings -----
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

    // Helper for creating field lines.
    function createLine(points) {
        return new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(points),
            lineMaterial
        );
    }

    // Center Line
    stadiumGroup.add(createLine([
        new THREE.Vector3(0, 0.01, -35),
        new THREE.Vector3(0, 0.01, 35)
    ]));

    // Side Lines (top/bottom)
    stadiumGroup.add(createLine([
        new THREE.Vector3(-55, 0.01, -35),
        new THREE.Vector3(55, 0.01, -35)
    ]));
    stadiumGroup.add(createLine([
        new THREE.Vector3(-55, 0.01, 35),
        new THREE.Vector3(55, 0.01, 35)
    ]));

    // Goal Lines (left/right ends)
    stadiumGroup.add(createLine([
        new THREE.Vector3(-55, 0.01, -35),
        new THREE.Vector3(-55, 0.01, 35)
    ]));
    stadiumGroup.add(createLine([
        new THREE.Vector3(55, 0.01, -35),
        new THREE.Vector3(55, 0.01, 35)
    ]));

    // Center Circle
    const centerCircle = new THREE.Mesh(
        new THREE.RingGeometry(10, 10.05, 64),
        new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, flatShading: true })
    );
    centerCircle.rotation.x = -Math.PI / 2;
    centerCircle.position.y = 0.01;
    stadiumGroup.add(centerCircle);

    // Center Spot
    const centerSpot = new THREE.Mesh(
        new THREE.CircleGeometry(0.2, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff, flatShading: true })
    );
    centerSpot.rotation.x = -Math.PI / 2;
    centerSpot.position.set(0, 0.01, 0);
    stadiumGroup.add(centerSpot);

    // ----- Goals -----
    /**
     * Creates a soccer goal with posts, crossbar, net wireframe.
     * @param {number} x - X position (left/right end of field)
     * @param {number} z - Z position (center on z)
     */
    function createGoal(x, z) {
        const goalGroup = new THREE.Group();

        // Dimensions (standard soccer goal in meters)
        const goalWidth = 7.32;
        const goalHeight = 2.44;
        const goalDepth = 1.5;

        // Materials
        const postMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true });
        const netMaterial = new THREE.MeshBasicMaterial({
            color: 0xbbbbbb,
            wireframe: true,
            side: THREE.DoubleSide,
            flatShading: true
        });

        // Posts (left/right)
        const postGeometry = new THREE.BoxGeometry(0.1, goalHeight, 0.1);
        const leftPost = new THREE.Mesh(postGeometry, postMaterial);
        leftPost.position.set(-goalWidth / 2, goalHeight / 2, 0);
        goalGroup.add(leftPost);
        const rightPost = new THREE.Mesh(postGeometry, postMaterial);
        rightPost.position.set(goalWidth / 2, goalHeight / 2, 0);
        goalGroup.add(rightPost);

        // Crossbar
        const crossbar = new THREE.Mesh(
            new THREE.BoxGeometry(goalWidth, 0.1, 0.1),
            postMaterial
        );
        crossbar.position.set(0, goalHeight, 0);
        goalGroup.add(crossbar);

        // Net support lines (visual guides for net corners)
        // Top net lines
        goalGroup.add(createLine([
            new THREE.Vector3(-goalWidth / 2, goalHeight, 0),
            new THREE.Vector3(-goalWidth / 2, goalHeight, -goalDepth)
        ]));
        goalGroup.add(createLine([
            new THREE.Vector3(goalWidth / 2, goalHeight, 0),
            new THREE.Vector3(goalWidth / 2, goalHeight, -goalDepth)
        ]));
        // Bottom net lines
        goalGroup.add(createLine([
            new THREE.Vector3(-goalWidth / 2, 0, 0),
            new THREE.Vector3(-goalWidth / 2, 0, -goalDepth)
        ]));
        goalGroup.add(createLine([
            new THREE.Vector3(goalWidth / 2, 0, 0),
            new THREE.Vector3(goalWidth / 2, 0, -goalDepth)
        ]));

        // Net mesh (wireframe)
        const netMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(goalWidth, goalHeight, 10, 5),
            netMaterial
        );
        netMesh.position.set(0, goalHeight / 2, -goalDepth);
        goalGroup.add(netMesh);

        // Position and rotate the whole goal at correct end.
        goalGroup.position.set(x, 0, z);
        goalGroup.rotation.y = x > 0 ? -Math.PI / 2 : Math.PI / 2;

        return goalGroup;
    }
    // Add goals to each end
    stadiumGroup.add(createGoal(-55, 0));
    stadiumGroup.add(createGoal(55, 0));

    // ----- Penalty and Six-yard Areas -----
    /**
     * Creates a penalty area and six-yard box for given goal side.
     * @param x - X (goal position: negative for left, positive for right)
     * @param z - Z center of field
     */
    function createPenaltyArea(x, z) {
        const penaltyGroup = new THREE.Group();

        // Penalty box outline
        const penaltyBoxPts = [
            new THREE.Vector3(0, 0.01, -22),
            new THREE.Vector3(0, 0.01, 22),
            new THREE.Vector3(x > 0 ? -18 : 18, 0.01, 22),
            new THREE.Vector3(x > 0 ? -18 : 18, 0.01, -22)
        ];
        penaltyGroup.add(new THREE.LineLoop(
            new THREE.BufferGeometry().setFromPoints(penaltyBoxPts), lineMaterial
        ));

        // Six-yard box outline
        const sixYardPts = [
            new THREE.Vector3(0, 0.01, -10),
            new THREE.Vector3(0, 0.01, 10),
            new THREE.Vector3(x > 0 ? -6 : 6, 0.01, 10),
            new THREE.Vector3(x > 0 ? -6 : 6, 0.01, -10)
        ];
        penaltyGroup.add(new THREE.LineLoop(
            new THREE.BufferGeometry().setFromPoints(sixYardPts), lineMaterial
        ));

        // Penalty spot
        const penSpot = new THREE.Mesh(
            new THREE.CircleGeometry(0.2, 8),
            new THREE.MeshBasicMaterial({ color: 0xffffff, flatShading: true })
        );
        penSpot.rotation.x = -Math.PI / 2;
        penSpot.position.set(x > 0 ? -12 : 12, 0.02, 0);
        penaltyGroup.add(penSpot);

        penaltyGroup.position.set(x, 0, z);
        return penaltyGroup;
    }
    // Add penalty area to both sides
    stadiumGroup.add(createPenaltyArea(-55, 0));
    stadiumGroup.add(createPenaltyArea(55, 0));

    // ----- Advertisement Boards -----
    /**
     * Creates a single advertisement board as a box mesh.
     * @param {number} x - X position
     * @param {number} z - Z position
     * @param {number} rotationY - Y-axis rotation in radians
     * @param {number} length - Length of board
     */
    function createAdvertisementBoard(x, z, rotationY, length) {
        const board = new THREE.Mesh(
            new THREE.BoxGeometry(length, 2, 0.1),
            new THREE.MeshLambertMaterial({ color: 0xda020e, flatShading: true })
        );
        board.position.set(x, 0, z);
        board.rotateOnAxis(new THREE.Vector3(0, 1, 0), rotationY);
        board.rotateOnAxis(new THREE.Vector3(1, 0, 0), z > 0 ? Math.PI / 9 : -Math.PI / 9);

        const group = new THREE.Group();
        group.add(board);
        return group;
    }

    // Boards behind goals and along touchlines
    stadiumGroup.add(createAdvertisementBoard(0, 40, 0, 120));
    stadiumGroup.add(createAdvertisementBoard(0, -40, 0, 120));
    stadiumGroup.add(createAdvertisementBoard(-60, 0, Math.PI / 2, 80));
    stadiumGroup.add(createAdvertisementBoard(60, 0, -Math.PI / 2, 80));

    // ----- Stadium Stands (Bleachers) -----
    /**
     * Creates a stadium stand block, including base, rails, and stepped seating.
     * @param x - X center
     * @param z - Z center
     * @param width - Width of stand
     * @param depth - Stepped depth (number of rows)
     * @param baseHeight - Base block height
     * @param rotationY - Orientation (radians)
     * @param cornerAffordanceRight - Offset to ignore right-side (seating affordance)
     * @param cornerAffordanceLeft  - Offset to ignore left-side (seating affordance)
     */
    function createStands(x, z, width, depth, baseHeight, rotationY, cornerAffordanceRight, cornerAffordanceLeft) {
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

    // Add stands on each side of the field
    const standDepth = 30;
    const baseHeight = 1;
    stadiumGroup.add(createStands(0, -60, 120, standDepth, baseHeight, Math.PI, 10, 0));
    stadiumGroup.add(createStands(0, 60, 120, standDepth, baseHeight, 0));
    stadiumGroup.add(createStands(-80, 0, 80, standDepth, baseHeight, -Math.PI / 2));
    stadiumGroup.add(createStands(80, 0, 80, standDepth, baseHeight, Math.PI / 2, 0, 10));

    // ----- TIFO Area (for 'Resume') -----
    // Large cloth/banner in stand with interactive texture.
    const tifoGeometry = new THREE.PlaneGeometry(24, 12);

    // Draw TIFO banner to a canvas (textured)
    const tifoCanvas = document.createElement('canvas');
    tifoCanvas.width = 1024;
    tifoCanvas.height = 512;
    const tifoCtx = tifoCanvas.getContext('2d');
    tifoCtx.fillStyle = '#123123';
    tifoCtx.fillRect(0, 0, tifoCanvas.width, tifoCanvas.height);
    tifoCtx.fillStyle = '#ffffff';
    tifoCtx.font = 'bold 80px Arial';
    tifoCtx.textAlign = 'center';
    tifoCtx.fillText('RESUME', tifoCanvas.width / 2, tifoCanvas.height / 2 - 40);
    tifoCtx.font = '40px Arial';
    tifoCtx.fillText('Click to View', tifoCanvas.width / 2, tifoCanvas.height / 2 + 60);

    const tifoTexture = new THREE.CanvasTexture(tifoCanvas);
    const tifo = new THREE.Mesh(
        tifoGeometry,
        new THREE.MeshBasicMaterial({
            map: tifoTexture,
            side: THREE.DoubleSide,
            flatShading: true
        })
    );
    tifo.position.set(0, 7, -51);
    tifo.rotation.x = -(Math.PI / 2 - Math.atan(0.3 / 0.4));
    tifo.userData = { type: 'resume' };
    stadiumGroup.add(tifo);

    // ----- Scoreboard (for 'Projects') -----
    // Large box, but not added to stadiumGroup (example usage only).
    const scoreboardGeometry = new THREE.BoxGeometry(20, 12, 1);
    const scoreboardMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000, flatShading: true });
    const scoreboard = new THREE.Mesh(scoreboardGeometry, scoreboardMaterial);
    scoreboard.position.set(65, 10, -45);
    scoreboard.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 4);
    scoreboard.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 8);
    scoreboard.userData = { type: 'projects' };
    // stadiumGroup.add(scoreboard); // Intentionally not shown, only screen used

    // Scoreboard screen with canvas texture (projects preview)
    const screenGeometry = new THREE.PlaneGeometry(18, 10);
    const scoreboardCanvas = document.createElement('canvas');
    scoreboardCanvas.width = 1024;
    scoreboardCanvas.height = 568;
    const scoreboardCtx = scoreboardCanvas.getContext('2d');
    scoreboardCtx.fillStyle = '#000';
    scoreboardCtx.fillRect(0, 0, scoreboardCanvas.width, scoreboardCanvas.height);
    scoreboardCtx.fillStyle = '#00ff00';
    scoreboardCtx.font = 'bold 60px Arial';
    scoreboardCtx.textAlign = 'center';
    scoreboardCtx.fillText('PROJECTS', scoreboardCanvas.width / 2, 80);
    scoreboardCtx.fillStyle = '#ffffff';
    scoreboardCtx.font = '30px Arial';
    scoreboardCtx.fillText('Click to View Details', scoreboardCanvas.width / 2, scoreboardCanvas.height - 40);

    const screen = new THREE.Mesh(
        screenGeometry,
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(scoreboardCanvas), flatShading: true })
    );
    screen.position.set(0, 0, 0.6);
    scoreboard.add(screen);
    screen.userData = { type: 'projects', position: new THREE.Vector3(45, 8, -25) };

    // ----- Dugout (for 'Analytics') with iPad displays -----
    // Dugout object (placed near half-line)
    const dugout = new THREE.Mesh(
        new THREE.BoxGeometry(8, 5, 0.5),
        new THREE.MeshLambertMaterial({ color: 0x222222, flatShading: true })
    );
    dugout.position.set(0, 2.5, 40);
    dugout.rotation.y = Math.PI;
    dugout.userData = { type: 'analytics' };
    stadiumGroup.add(dugout);

    // iPad-like displays inside dugout
    for (let i = 0; i < 3; i++) {
        const ipad = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 2, 0.1),
            new THREE.MeshLambertMaterial({ color: 0x000000, flatShading: true })
        );
        ipad.position.set((i - 1) * 2.5, 1, 0.3);
        ipad.userData = { type: 'analytics', index: i };
        dugout.add(ipad);

        // iPad white screen
        const ipadScreen = new THREE.Mesh(
            new THREE.PlaneGeometry(1.3, 1.8),
            new THREE.MeshBasicMaterial({ color: 0xffffff, flatShading: true })
        );
        ipadScreen.position.z = 0.06;
        ipad.add(ipadScreen);
        ipadScreen.userData = { type: 'analytics', index: i };
    }

    return stadiumGroup;
}
