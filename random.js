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

const Mulberry = (() => {
    const twenty_primes = [
        2, 3, 5, 7,
        11, 13, 17, 19,
        23, 29, 31, 37,
        41, 43, 47, 53,
        59, 61, 67, 71
    ];
    return (seed = 0 | rand(0xffffffff)) => {
        let state = seed;
        let terms = {};
        // Seeded mulberry random adapted from bryc
        // https://stackoverflow.com/a/47593316/7429566
        const hash_int = (value) => {
            let t = value + 0x6d2b79f5;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return (t ^ (t >>> 14)) >>> 0;
        };

        const rand = (a = 1, b = 0) => {
          const r = a + (state = hash_int(state)) / 0x100000000 * (b - a);
          if (terms[r]) {
            state++;
            terms = {};
            return rand(a, b);
          }
          terms[r] = true;
          return r;
        };
        const randpom = (a = 1, b = -a) => rand(a, b);
        const choose = (arr) => arr[0 | rand(arr.length)];
        const shuffle = (arr) => {
            let i = arr.length, j = 0 | rand(i);
            while (i-- > 0) {
                [arr[i], arr[j]] = [arr[j], arr[i]];
                j = 0 | rand(i);
            }
            return arr;
        };
        const chance = (prob) => rand() < prob;

        const dimension_primes = ((size) => {
            let result = [], primes = shuffle(twenty_primes.slice(0));
            while (primes.length > 0) {
                const [a, b] = [primes.pop(), primes.pop()];
                let coprime = 1;
                do coprime *= chance(0.5) ? a : b; while (coprime < size);
                result.push(coprime);
            } return result;
        })(10 ** 6); // in the 1-99 million range
        const hash = (...values) => {
            let value = seed;
            for (let v in values) value ^= dimension_primes[v] * (0 | values[v]);
            return hash_int(value) / 0x100000000;
        };
        const noise = (() => {
            const lerp = (a, b, t) => a*(1-t) + b*t;
            const smooth = (x) => x*x*(3-2*x);
            const f = (index, map, coords) => {
                if (index == coords.length)
                    return hash(...coords.map((e, i) => 0|e-(e<0) + ((map>>i)&1)));
                return lerp(
                    f(index+1, map | (0<<index), coords),
                    f(index+1, map | (1<<index), coords),
                    smooth(coords[index] - (0|coords[index] - (coords[index]<0)))
                );
            };
            return (...coords) => f(0, 0, coords);
        })();

        return {
            seed, // seed
            rand, randpom, // floats
            choose, shuffle, // arrays
            chance, // booleans
            hash, noise, // multiple dimensions
        };
    };
})();