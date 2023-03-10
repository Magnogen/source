const Vec = (() => {
    function set(x, y)  { [this.x, this.y] = [x, y]; return this }
    function copy()     { return Vec(this.x, this.y) }
    function add(other) { this.x += other.x; this.y += other.y; return this }
    function sub(other) { this.x -= other.x; this.y -= other.y; return this }
    function mul(val)   { this.x *= val; this.y *= val; return this }
    function div(val)   { this.x /= val; this.y /= val; return this }
    function length()   { return Math.hypot(this.x, this.y) }
    function angle()    { return Math.atan2(this.y, this.x) }
    function rotate(a)  { 
      const { x, y } = this;
      this.x = x*Math.cos(a) - y*Math.sin(a);
      this.y = x*Math.sin(a) + y*Math.cos(a);
      return this;
    }
    function dot(other) { return this.x*other.x + this.y*other.y }
    return (x, y) => {
        const vector = {
            x, y,
            set, copy, clone: copy,
            add, sub,
            mul, div,
            length,
            angle, rotate,
            dot,
        };
        return vector
    }
})();