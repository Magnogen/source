const Camera2D = (canvasWidth, canvasHeight) => {
    let sinRot, cosRot, rot;
    const updateRot = (angle) => {
        rot = angle;
        sinRot = Math.sin(-angle);
        cosRot = Math.cos(-angle);
    }; 
    updateRot(0);
  
    return {
        position: { x: 0, y: 0 },
        anchor: { x: 0.5, y: 0.5 },
        scale: 1,
        get rotation() { return rot },
        set rotation(angle) { updateRot(angle) },
        at({ x: X, y: Y }) {
            let x = X;
            let y = Y;
    
            x -= this.position.x;
            y -= this.position.y;
    
            const rotatedX = x * cosRot - y * sinRot;
            const rotatedY = x * sinRot + y * cosRot;
            x = rotatedX;
            y = rotatedY;
    
            x /= this.scale;
            y /= this.scale;
    
            x += this.anchor.x * canvasWidth;
            y += this.anchor.y * canvasHeight;
    
            return { x, y };
        },
    };
};  