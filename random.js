const rand = (a = 1, b = 0) => (
  b < a ?
    b + Math.random() * (a - b)
  : a + Math.random() * (b - a)
);
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
    	const j = 0 | rand(i + 1);
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

        const rand = (a = 1, b = 0) => (
          b < a ?
            b + (state = hash_int(state)) / 0x100000000 * (a - b)
          : a + (state = hash_int(state)) / 0x100000000 * (b - a)
        );
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
            	const j = 0 | rand(i + 1);
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
        const valueNoise = (() => {
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
        const worleyNoise = (...coords) => {
            const n = coords.length;
            const base = coords.map(Math.floor);
            let minDistSq = Infinity;

            const recurse = (dim, cell) => {
                if (dim == n) {
                  const feature = new Array(n);
                  for (let i = 0; i < n; i++)
                      feature[i] = cell[i] + hash(i, ...cell) * 1;

                  const distSq = feature.reduce((s, v, i) => s + (coords[i] - v) ** 2, 0);
                  if (distSq < minDistSq) minDistSq = distSq;
                  return;
                }
                for (let offset = -1; offset <= 1; offset++) {
                    cell[dim] = base[dim] + offset;
                    recurse(dim + 1, cell);
                }
            };

            recurse(0, new Array(n));
            return Math.sqrt(minDistSq);
        };
        const voronoiNoise = (...coords) => {
            const n = coords.length;
            const base = coords.map(Math.floor);
            let minDistSq = Infinity;
            let closestFeature = null;

            const recurse = (dim, cell) => {
                if (dim == n) {
                  const feature = new Array(n);
                  for (let i = 0; i < n; i++)
                      feature[i] = cell[i] + hash(i, ...cell) * 1;

                  const distSq = feature.reduce((s, v, i) => s + (coords[i] - v) ** 2, 0);
                  if (distSq < minDistSq) {
                      minDistSq = distSq;
                      closestFeature = feature;
                  }
                  return;
                }
                for (let offset = -1; offset <= 1; offset++) {
                    cell[dim] = base[dim] + offset;
                    recurse(dim + 1, cell);
                }
            };

            recurse(0, new Array(n));
            return hash(...closestFeature);
        };

        const perlinNoise = (...coords) => {
            const n = coords.length;
            const base = coords.map(Math.floor);
            const frac = coords.map((x, i) => x - base[i]);
            const interp = frac.map(f => f * f * (3 - 2 * f));

            const grad = (...corner) => {
                const r = hash(...corner);
                const vec = new Array(n);
                let sum = 0;
                for (let i = 0; i < n; i++) {
                    vec[i] = ((r * (i + 1) * 43758.5453) % 2) - 1;
                    sum += vec[i] * vec[i];
                }
                const invLen = 1 / Math.sqrt(sum);
                for (let i = 0; i < n; i++) vec[i] *= invLen;
                return vec;
            };

            const corners = 1 << n;
            let result = 0;

            for (let mask = 0; mask < corners; mask++) {
                const corner = new Array(n);
                const offset = new Array(n);
                let weight = 1;
                for (let i = 0; i < n; i++) {
                    const bit = (mask >> i) & 1;
                    corner[i] = base[i] + bit;
                    offset[i] = frac[i] - bit;
                    weight *= bit ? interp[i] : 1 - interp[i];
                }
                const g = grad(...corner);
                const dot = offset.reduce((s, v, i) => s + g[i] * v, 0);
                result += dot * weight;
            }
            return 0.5 + 0.5 * result;
        };
        
        return {
            getSeed, setSeed, // seeding
            rand, randpom, randbin, // floats
            choose, shuffle, // arrays
            chance, // booleans
            hash, // infinite dimensional hash
            valueNoise, worleyNoise, voronoiNoise, perlinNoise, // infinite dimensional noises
        };
    };
})();
