export function drawXGMap() {
    const canvas = document.getElementById('xgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Draw field
    ctx.fillStyle = '#2d5016';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw goal
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(canvas.width * 0.1, canvas.height * 0.2, canvas.width * 0.8, canvas.height * 0.6);
    
    // Draw xG zones (heat map)
    const zones = [
        { x: 0.3, y: 0.3, xg: 0.8, size: 30 },
        { x: 0.5, y: 0.4, xg: 0.5, size: 25 },
        { x: 0.7, y: 0.5, xg: 0.3, size: 20 },
        { x: 0.4, y: 0.6, xg: 0.4, size: 22 }
    ];
    
    zones.forEach(zone => {
        const alpha = zone.xg;
        ctx.fillStyle = `rgba(255, ${255 * (1 - alpha)}, 0, ${alpha})`;
        ctx.beginPath();
        ctx.arc(
            zone.x * canvas.width,
            zone.y * canvas.height,
            zone.size,
            0,
            Math.PI * 2
        );
        ctx.fill();
    });
}

export function drawPossessionArea() {
    const canvas = document.getElementById('possessionCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Draw field
    ctx.fillStyle = '#2d5016';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw possession zones
    const zones = [
        { x: 0.2, y: 0.3, w: 0.3, h: 0.4, possession: 0.6 },
        { x: 0.5, y: 0.3, w: 0.3, h: 0.4, possession: 0.4 }
    ];
    
    zones.forEach(zone => {
        ctx.fillStyle = `rgba(0, 150, 255, ${zone.possession})`;
        ctx.fillRect(
            zone.x * canvas.width,
            zone.y * canvas.height,
            zone.w * canvas.width,
            zone.h * canvas.height
        );
    });
}

export function drawBallTrajectory() {
    const canvas = document.getElementById('trajectoryCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Draw field
    ctx.fillStyle = '#2d5016';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw trajectory
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const points = 20;
    for (let i = 0; i <= points; i++) {
        const t = i / points;
        const x = 0.2 * canvas.width + t * 0.6 * canvas.width;
        const y = 0.5 * canvas.height - Math.sin(t * Math.PI) * 0.3 * canvas.height;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    
    // Draw ball at end
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0.8 * canvas.width, 0.5 * canvas.height, 5, 0, Math.PI * 2);
    ctx.fill();
}

