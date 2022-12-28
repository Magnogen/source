// Limit
//   Restricting numbers between two values
//   Clamp, Wrap, Fold and Sigmoid are supported

const Limit = (low, high) => {
    const [min, max] = low < high ? [low, high] : [high, low];
    return {
        min, max,
        clamp(n) {
            if (n < this.min) return this.min;
            if (n > this.max) return this.max;
            return n;
        },
        wrap(n) {
            const d = this.max - this.min;
            return this.min + (n < 0 ? (n%d+d)%d : n%d);
        },
        fold(n) {
            const N = (n - this.min) % (2 * (this.max - this.min)) + this.min;
            if (N > this.max) return 2 * this.max - N;
            return N;
        },
        sigmoid(n) {
            const d = this.max - this.min;
            return d / (1 + Math.exp(4 * (this.min - n) / d + 2)) + this.min;
        }
    };
};

Limit.clamp = (n, a, b) => {
    if (b < a) return Limit.clamp(n, b, a);
    if (n < a) return a;
    if (n > b) return b;
    return n;
};
Limit.wrap = (n, a, b) => {
    if (b < a) return Limit.wrap(n, b, a);
    const d = b - a;
    return this.min + (n < 0 ? (n%d+d)%d : n%d);
};
Limit.fold = (n, a, b) => {
    if (b < a) return Limit.fold(n, b, a);
    const N = (n - a) % (2 * (b - a)) + a;
    if (N > b) return 2 * b - N;
    return N;
};
Limit.sigmoid = (n, a, b) => {
    if (b < a) return Limit.sigmoid(n, b, a);
    return (b - a) / (1 + Math.exp(4 * (a - n) / (b - a) + 2)) + a;
};