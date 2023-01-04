const rand = (a = 1, b = 0) => a + Math.random() * (b - a);
const randpom = (a = 1, b = -a) => rand(a, b);
const chance = (prob) => rand() < prob;
const choose = (arr) => arr[0 | rand(arr.length)];
const shuffle = (arr) => {
    let i = arr.length, j = 0 | rand(i);
    while (i-- > 0) {
        [arr[i], arr[j]] = [arr[j], arr[i]];
        j = 0 | rand(i);
    }
    return arr;
};

const Mulberry = (seed = 0 | rand(0xffffffff)) => {
    let state = seed;
    // Seeded mulberry random adapted from bryc
    // https://stackoverflow.com/a/47593316/7429566
    const hash = (value) => {
        let t = value + 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return (t ^ t >>> 14) >>> 0;
    };
    const rand = (a = 1, b = 0) => a + (state = hash(state)) / 0x100000000 * (b - a);
    const shuffle = (arr) => {
        let i = arr.length, j = 0 | rand(i);
        while (i-- > 0) {
            [arr[i], arr[j]] = [arr[j], arr[i]];
            j = 0 | rand(i);
        }
        return arr;
    };
    const dimension_primes = ((digits, n) => {
        const gcd = (a, b) => b == 0 ? a : gcd(b, a % b);

        let result = [0 | rand(10 ** (digits - 1), 10 ** digits)];
        for (let i = 1; i < n; i++) {
            let candidate = 0 | rand(10 ** (digits - 1), 10 ** digits);
            while (result.some(num => gcd(candidate, num) != 1)) {
                candidate = 0 | rand(10 ** (digits - 1), 10 ** digits);
            }
            result.push(candidate);
        }
        return result;
    })(6, 8);
    const hash_n = (...values) => {
        let value = seed;
        for (let v in values) value ^= dimension_primes[v] * (0 | values[v]);
        return hash(value) / 0x100000000;
    };
    const noise = (() => {
        const lerp = (a, b, t) => a*(1-t) + b*t;
        const smooth = (x) => x*x*(3-2*x);
        const f = (index, map, coords) => {
            if (index == coords.length)
                return hash(...coords.map((e, i) => 0|e + (+map[i])));
            return lerp(
                f(index+1, map+'0', coords),
                f(index+1, map+'1', coords),
                smooth(coords[index] - (0|coords[index]))
            );
        };
        return (...coords) => f(0, '', coords);
    })();
    return {
        seed, rand, hash: hash_n, noise,
        randpom: (a = 1, b = -a) => rand(a, b),
        chance: (prob) => rand() < prob,
        choose: (arr) => arr[0 | rand(arr.length)],
        shuffle
    }
};
