// jshint esversion: 11
const Pipe = value => ({
    get val() { return value },
    abs:   () => Pipe(Math.abs(value)),
    floor: () => Pipe(Math.floor(value)),
    ceil:  () => Pipe(Math.ceil(value)),
    round: () => Pipe(Math.round(value)),
    add:   v  => Pipe(value + v),
    sub:   v  => Pipe(value - v),
    mul:   v  => Pipe(value * v),
    div:   v  => Pipe(value / v),
    pow:   v  => Pipe(value ** v),
    exp:   (v=Math.E) => Pipe(v ** value),
    log:   (v=Math.E) => Pipe(Math.log(value) / Math.log(v)),
})
