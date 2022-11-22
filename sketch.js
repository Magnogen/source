(() => {
    let c = $('canvas[background]');
    let ctx = c.getContext("2d"); 
    
    function random(n=8) {
        let res = 0;
        for (let i = 0; i < n; i++)
            res += rand();
        return 2*res/n - 1;
    }
  
    const clamp = (v, a, b) => {
        if (Array.isArray(v)) return v.map(e=>clamp(e, a, b));
        if (v > b) return b;
        if (v < a) return a;
        return v;
    }
    
    const glyphs = shuffle([
        ...'012345789',
        ...'$+*?!:%=;<~&^',
        '()', '[]', '{}', '=>',
        ...'$+*?!:%=;<~&^',
        '()', '[]', '{}', '=>',
        ':)'
    ]);
    
    let index = -1;
    let Ps = [...Array(8)].map((e, i) => ({
        i, x: random()*3/5, y: random()*3/5, a: rand(2*Math.PI), da: rand(10),
        r: devicePixelRatio*rand(12, 24), dir: rand(Math.PI), dtm: rand(1.2, 1.45),
        glyph: glyphs[index=(index+1)%glyphs.length],
        fade: 1, falling: false,
        xv: 0, yv: 0,
        reset() {
            this.falling = false;
            this.x = random()*3/5;
            this.y = random()*3/5;
            this.a = rand(2*Math.PI);
            this.da = 10*random()
            this.r = devicePixelRatio*rand(14, 24);
            this.dir = rand(Math.PI);
            this.dtm = rand(1.2, 1.45);
            this.glyph = glyphs[index=(index+1)%glyphs.length];
            this.xv = 0; this.yv = 0;
            this.fade = 0;
        },
        update(dt) {
            if (this.falling) {
            this.xv *= 0.99;
            this.yv += 0.0003;
            this.xv = clamp(this.xv, -0.02, 0.02);
            this.yv = clamp(this.yv, -0.02, 0.02);
            this.x += this.xv;
            this.y += this.yv;
            this.a += this.da * 1.5 * this.dtm * dt; this.a %= 360;
            if (this.y < -0.42 || this.y > 0.6) {
                this.reset();
                if (rand() < 1/20) this.sides = 45;
            }
            } else {
            const dist = Math.hypot(this.x, this.y);
            const dx =  this.dir * this.y/dist;
            const dy = -this.dir * this.x/dist;
            this.x += this.dtm * dt * dx;
            this.y += this.dtm * dt * dy;
            this.a += this.da * 1.5 * this.dtm * dt * -this.dir / dist;
            this.a %= 2*Math.PI;
            if (this.x > 0.5 || this.x < -0.5 || this.y > 0.5 || this.y < -0.5) {
                let glyph = this.glyph;
                this.reset();
                this.glyph = glyph;
            }
            }
            this.fade = clamp(this.fade + 50*dt, 0, 1);
        }
    }));
    
    on('resize', e => {
        c.width  = c.offsetWidth * devicePixelRatio;
        c.height = c.offsetHeight * devicePixelRatio;
    });
    trigger('resize');
    
    function snipeAt(X, Y) {
        let [x, y] = [X*devicePixelRatio, Y*devicePixelRatio];
        let amnt = 0;
        for (let p of Ps) {
            const dx = c.width*(p.x+0.5) - x;
            const dy = c.height*(p.y+0.5) - y;
            const d = dx*dx + dy*dy;
            const mult = p.falling ? 1.5*1.5 : 1;
            if (d < mult*p.r*p.r) {
            p.xv = 0.02 * random();
            p.yv = -0.01;
            p.da = rand() < 0.5 ? -1000 : 1000;
            p.falling = true;
            }
        }
    }
    
    on('click', e => snipeAt(e.clientX, e.clientY));
    on('touchstart', e => snipeAt(e.touches[0].clientX, e.touches[0].clientY));
    
    let lt = 0;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';    
    function animate(t) {
        const dt = t - lt;
        lt = t;
        
        ctx.clearRect(0, 0, c.width, c.height);
        for (let p of Ps) {
            ctx.fillStyle = `rgba(255,255,255,${p.fade*72/255})`;
            
            // ctx.beginPath();
            // ctx.moveTo(c.width*(p.x+0.5) + p.r, c.height*(p.y+0.5));
            // for (let theta = 0; theta < 2*Math.PI; theta += 2*Math.PI/30)
            //   ctx.lineTo(c.width*(p.x+0.5) + p.r*Math.cos(theta), c.height*(p.y+0.5) + p.r*Math.sin(theta));
            // ctx.closePath();
            // ctx.fill();
            
            let scale = 1.5;
            if (p.glyph.length == 1) scale = 2;
            ctx.font = `${scale*p.r}px "Fira Code"`;
            ctx.save();
            ctx.translate(c.width*(p.x+0.5), c.height*(p.y+0.5));
            ctx.rotate(p.a);
            ctx.fillText(p.glyph, 0, p.r*0.1);
            ctx.restore();
            p.update(dt/200000);
        }
        
        requestAnimationFrame(animate);
    }
  
    requestAnimationFrame(animate);
})();