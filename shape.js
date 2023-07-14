const Shape = (base) => {
    let translation = { x: 0, y: 0 };
    let rotation = 0;
    let scale = 1;
    
    let cosRot = Math.cos(rotation);
    let sinRot = Math.sin(rotation);
  
    const transform = ({ x: X, y: Y }) => {
        let x = X, y = Y;
        
        x *= scale;
        y *= scale;
    
        const t = x;
        x = x * cosRot - y * sinRot;
        y = t * sinRot + y * cosRot;
    
        x += translation.x;
        y += translation.y;
        
        return { x, y };
    };
    
    const verts = function* (base) {
        for (const vert of base) {
            yield transform(vert);
        }
    };
  
    let hasTransformed = true;
    let min, max;
    const getBoundingBox = (base) => {
        if (!hasTransformed) return { min, max };
    
        let newMin = { x: Infinity, y: Infinity };
        let newMax = { x: -Infinity, y: -Infinity };
    
        for (const vert of verts(base)) {
            newMin.x = Math.min(newMin.x, vert.x);
            newMin.y = Math.min(newMin.y, vert.y);
            newMax.x = Math.max(newMax.x, vert.x);
            newMax.y = Math.max(newMax.y, vert.y);
        }
    
        [min, max] = [newMin, newMax];
        hasTransformed = false;
    
        return { min, max };
    }; getBoundingBox(base);
  
    return {
        base,
        get verts() { return verts(this.base) },
        get boundingBox() { return getBoundingBox(this.base) },
        get translation() { return translation },
        set translation(value) {
            if (value.x !== translation.x || value.y !== translation.y) {
            translation = value;
            hasTransformed = true;
            }
        },
        get rotation() { return rotation },
        set rotation(value) {
            if (value !== rotation) {
            rotation = value;
            cosRot = Math.cos(rotation);
            sinRot = Math.sin(rotation);
            hasTransformed = true;
            }
        },
        get scale() { return scale },
        set scale(value) {
            if (value !== scale) {
            scale = value;
            hasTransformed = true;
            }
        },
    };
};