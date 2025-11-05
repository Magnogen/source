const rand = (a = 1, b = 0) => a + Math.random() * (b - a);
const randpom = (a = 1, b = -a) => rand(a, b);
const randbin = (mean=0, stdev=1) => { // modified from https://stackoverflow.com/a/36481059/7429566
    const u = 1 - rand();
    const v = rand();
    const z = Math.sqrt( -2 * Math.log( u ) ) * Math.cos( 2 * Math.PI * v );
    return z * stdev + mean;
}
const chance = (prob) => rand() < prob;
const choose = (arr) => arr[0 | rand(arr.length)];
const shuffle = (arr) => {
    let i = arr.length;
    while (i-- > 0) {
        const j = 0 | rand(i);
        [arr[i], arr[j]] = [arr[j], arr[i]];
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
        let initialSeed = seed;
        let state = seed;
        // Seeded mulberry random adapted from bryc
        // https://stackoverflow.com/a/47593316/7429566
        const hash_int = (value) => {
            let t = value + 0x6d2b79f5;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return (t ^ (t >>> 14)) >>> 0;
        };

        const getSeed = () => initialSeed;
        const setSeed = (newSeed) => state = (initialSeed = newSeed);

        let terms = new Set();
        const rand = (a = 1, b = 0) => a + (state = hash_int(state)) / 0x100000000 * (b - a);
        const randpom = (a = 1, b = -a) => rand(a, b);
        const randbin = (mean=0, stdev=1) => { // modified from https://stackoverflow.com/a/36481059/7429566
            const u = 1 - rand();
            const v = rand();
            const z = Math.sqrt( -2 * Math.log( u ) ) * Math.cos( 2 * Math.PI * v );
            return z * stdev + mean;
        }
        const choose = (arr) => arr[0 | rand(arr.length)];
        const shuffle = (arr) => {
            let i = arr.length;
            while (i-- > 0) {
                const j = 0 | rand(i);
                [arr[i], arr[j]] = [arr[j], arr[i]];
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
            for (let v in values) value ^= dimension_primes[v] * (0 | values[v] - (values[v]<0));
            return hash_int(value) / 0x100000000;
        };
        const noise = (() => {
            const smoothStep = x => x * x * (3 - 2 * x);
            return (...coords) => {
                const dimensions = coords.length;
                const baseCoords = new Array(dimensions);
                const interpolationFactors = new Array(dimensions);
                for (let i = 0; i < dimensions; i++) {
                    const integerCoord = Math.floor(coords[i]);
                    baseCoords[i] = integerCoord;
                    interpolationFactors[i] = smoothStep(coords[i] - integerCoord);
                }
                let result = 0;
                const cornerCount = 1 << dimensions;
                for (let cornerMask = 0; cornerMask < cornerCount; cornerMask++) {
                    let weight = 1;
                    const cornerCoords = new Array(dimensions);
                    for (let dim = 0; dim < dimensions; dim++) {
                        if (cornerMask & (1 << dim)) {
                            cornerCoords[dim] = baseCoords[dim] + 1;
                            weight *= interpolationFactors[dim];
                        } else {
                            cornerCoords[dim] = baseCoords[dim];
                            weight *= 1 - interpolationFactors[dim];
                        }
                    }
                    result += hash(...cornerCoords) * weight;
                }
                return result;
            };
        })();

        return {
            getSeed, setSeed, // seeding
            rand, randpom, randbin, // floats
            choose, shuffle, // arrays
            chance, // booleans
            hash, noise, // multiple dimensions
        };
    };
})();
