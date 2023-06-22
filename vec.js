const vec2 = (() => {
    function add(other)  { return vec2(this.x + other.x, this.y + other.y) }
    function sub(other)  { return vec2(this.x - other.x, this.y - other.y) }
    function mul(val)    { return vec2(this.x * val, this.y * val) }
    function div(val)    { return vec2(this.x / val, this.y / val) }
    function length()    { return Math.hypot(this.x, this.y) }
    function angle()     { return Math.atan2(this.y, this.x) }
    function turn(a)     { return vec2(
        this.x*Math.cos(a) - this.y*Math.sin(a),
        this.x*Math.sin(a) + this.y*Math.cos(a)
    ) }
    function dot(other)  { return this.x*other.x + this.y*other.y }
    function normalize() {
        const len = this.length();
        return vec2(this.x / len, this.y / len);
    }
    return (x, y) => ({
        x, y,
        add, sub,
        mul, div,
        length, normalize,
        angle, turn,
        dot,
    })
})();
