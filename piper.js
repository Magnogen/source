// jshint esversion: 11
const Pipe = value => ({
    value,
    do:    f  => Pipe(f(value)),
    abs:   () => Pipe(Math.abs(value)),
    floor: () => Pipe(Math.floor(value)),
    ceil:  () => Pipe(Math.ceil(value)),
    round: () => Pipe(Math.round(value)),
    int:   () => Pipe(0|value),
    fract: () => Pipe(value%1),
    add:   v  => Pipe(value + v),
    sub:   v  => Pipe(value - v),
    mul:   v  => Pipe(value * v),
    div:   v  => Pipe(value / v),
    pow:   v  => Pipe(value ** v),
    inc:   () => Pipe(++value),
    dec:   () => Pipe(--value),
    sq:    () => Pipe(value*value),
    sqrt:  () => Pipe(Math.sqrt(value)),
    exp:   (v=Math.E) => Pipe(v ** value),
    log:   (v=Math.E) => Pipe(Math.log(value) / Math.log(v)),
});
