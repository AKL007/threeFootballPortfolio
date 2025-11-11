import { showModal } from './modal.js';
import { drawXGMap, drawPossessionArea, drawBallTrajectory } from './analytics.js';

export function showResume() {
    const resumeContent = `
        <h1>Resume</h1>
        <h2>Your Name</h2>
        <p><strong>Email:</strong> your.email@example.com</p>
        <p><strong>Phone:</strong> +1 (555) 123-4567</p>
        <h3>Experience</h3>
        <ul>
            <li>Software Developer - Company Name (2020-Present)</li>
            <li>Junior Developer - Previous Company (2018-2020)</li>
        </ul>
        <h3>Skills</h3>
        <ul>
            <li>JavaScript, TypeScript</li>
            <li>Three.js, WebGL</li>
            <li>React, Node.js</li>
            <li>Game Development</li>
        </ul>
        <h3>Education</h3>
        <p>Bachelor's in Computer Science - University Name</p>
    `;
    showModal(resumeContent);
}

export function showProjects() {
    const projectsContent = `
        <h1>Projects</h1>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 20px;">
            <div style="background: #2a2a2a; padding: 20px; border-radius: 8px;">
                <h3>Project 1</h3>
                <p>Description of your first project. This could be a web application, game, or any other project you've worked on.</p>
                <p><strong>Tech Stack:</strong> React, Node.js, MongoDB</p>
            </div>
            <div style="background: #2a2a2a; padding: 20px; border-radius: 8px;">
                <h3>Project 2</h3>
                <p>Description of your second project. Showcase your skills and achievements here.</p>
                <p><strong>Tech Stack:</strong> Three.js, WebGL, GLSL</p>
            </div>
            <div style="background: #2a2a2a; padding: 20px; border-radius: 8px;">
                <h3>Project 3</h3>
                <p>Description of your third project. Highlight what makes it special.</p>
                <p><strong>Tech Stack:</strong> Python, Django, PostgreSQL</p>
            </div>
        </div>
    `;
    showModal(projectsContent);
}

export function showAnalytics() {
    const analyticsContent = `
        <h1>Analytics Dashboard</h1>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 20px;">
            <div style="background: #2a2a2a; padding: 20px; border-radius: 8px;">
                <h3>xG Map</h3>
                <canvas id="xgCanvas" width="300" height="200" style="background: #1a1a1a; border-radius: 4px; width: 100%;"></canvas>
            </div>
            <div style="background: #2a2a2a; padding: 20px; border-radius: 8px;">
                <h3>Possession Area</h3>
                <canvas id="possessionCanvas" width="300" height="200" style="background: #1a1a1a; border-radius: 4px; width: 100%;"></canvas>
            </div>
            <div style="background: #2a2a2a; padding: 20px; border-radius: 8px;">
                <h3>Ball Trajectory</h3>
                <canvas id="trajectoryCanvas" width="300" height="200" style="background: #1a1a1a; border-radius: 4px; width: 100%;"></canvas>
            </div>
        </div>
    `;
    showModal(analyticsContent);
    
    // Draw analytics after modal is shown
    setTimeout(() => {
        drawXGMap();
        drawPossessionArea();
        drawBallTrajectory();
    }, 100);
}

