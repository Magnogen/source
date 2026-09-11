const Mulberry = (seed = 0 | Math.random() * 0xffffffff) => {
  let initialSeed = seed;

  // Seeded mulberry random adapted from bryc
  // https://stackoverflow.com/a/47593316/7429566
  const hashInt = (value) => {
    let t = value + 0x6d2b79f5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return (t ^ (t >>> 14)) >>> 0;
  };

  const hash = (...values) => {
    let value = initialSeed;
    for (let i = 0; i < values.length; i++) {
      // "Golden ratio" bit scrambling - 0x9e3779b9 ~= phi * 2^32
      const primeLike = hashInt(i * 0x9e3779b9) | 1;
      const coord = 0 | values[i] - (values[i] < 0);
      value ^= Math.imul(primeLike, coord);
    }
    return hashInt(value) / 0x100000000;
  };

  hash.getSeed = () => initialSeed;
  hash.setSeed = (newSeed) => initialSeed = newSeed;

  return hash;
};

const sfc32 = (seed = 0 | Math.random() * 0xffffffff) => {
  let initialSeed = seed;

  // Seeded sfc32 random adapted from bryc
  // https://stackoverflow.com/a/47593316/7429566
  const hashInt = (value) => {
    a |= 0; b |= 0; c |= 0; d |= 0;
    let t = (a + b | 0) + d | 0;
    d = d + 1 | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    c = c + t | 0;
    return t >>> 0;
  };

  const hash = (...values) => {
    let value = initialSeed;
    for (let i = 0; i < values.length; i++) {
      // "Golden ratio" bit scrambling - 0x9e3779b9 ~= phi * 2^32
      const primeLike = hashInt(i * 0x9e3779b9) | 1;
      const coord = 0 | values[i] - (values[i] < 0);
      value ^= Math.imul(primeLike, coord);
    }
    return hashInt(value) / 0x100000000;
  };

  hash.getSeed = () => initialSeed;
  hash.setSeed = (newSeed) => initialSeed = newSeed;

  return hash;
};

const Rng = (hash = Mulberry()) => {
  let state = hash.getSeed();

  const rand = (a = 1, b = 0) => (
    b < a ?
      b + (state = hash(state * 0x100000000)) * (a - b)
      : a + (state = hash(state * 0x100000000)) * (b - a)
  );
  const randpom = (a = 1, b = -a) => rand(a, b);
  const randbin = (mean = 0, stdev = 1) => { // modified from https://stackoverflow.com/a/36481059/7429566
    const u = 1 - rand();
    const v = rand();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
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

  return { rand, randpom, randbin, chance, choose, shuffle };
};

const Noise = (hash = Mulberry()) => {

  const value = (...coords) => {
    const smoothStep = x => x * x * (3 - 2 * x);
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

  const worley = (...coords) => {
    const n = coords.length;
    const base = coords.map(Math.floor);
    let minDistSq = Infinity;

    const totalCells = 3 ** n;
    for (let index = 0; index < totalCells; index++) {
      let tmp = index;
      const cell = new Array(n);
      for (let dim = 0; dim < n; dim++) {
        const offset = (tmp % 3) - 1;
        tmp = Math.floor(tmp / 3);
        cell[dim] = base[dim] + offset;
      }

      const feature = new Array(n);
      for (let i = 0; i < n; i++)
        feature[i] = cell[i] + hash(i, ...cell);

      let distSq = 0;
      for (let i = 0; i < n; i++) {
        const d = coords[i] - feature[i];
        distSq += d * d;
      }

      if (distSq < minDistSq)
        minDistSq = distSq;
    }

    return Math.sqrt(minDistSq);
  };

  const worley2 = (...coords) => {
    const n = coords.length;
    const base = coords.map(Math.floor);

    let min1 = Infinity;
    let min2 = Infinity;

    const totalCells = 3 ** n;
    for (let index = 0; index < totalCells; index++) {
      let tmp = index;
      const cell = new Array(n);
      for (let dim = 0; dim < n; dim++) {
        const offset = (tmp % 3) - 1;  // -1, 0, 1
        tmp = Math.floor(tmp / 3);
        cell[dim] = base[dim] + offset;
      }

      const feature = new Array(n);
      for (let i = 0; i < n; i++)
        feature[i] = cell[i] + hash(i, ...cell);

      let distSq = 0;
      for (let i = 0; i < n; i++) {
        const d = coords[i] - feature[i];
        distSq += d * d;
      }

      if (distSq < min1) {
        min2 = min1;
        min1 = distSq;
      } else if (distSq < min2) {
        min2 = distSq;
      }
    }

    return Math.sqrt(min2);
  };


  const voronoi = (...coords) => {
    const n = coords.length;
    const base = coords.map(Math.floor);
    let minDistSq = Infinity;
    let closestFeature = null;

    const totalCells = 3 ** n;
    for (let index = 0; index < totalCells; index++) {
      let tmp = index;
      const cell = new Array(n);
      for (let dim = 0; dim < n; dim++) {
        const offset = (tmp % 3) - 1;
        tmp = Math.floor(tmp / 3);
        cell[dim] = base[dim] + offset;
      }

      const feature = new Array(n);
      for (let i = 0; i < n; i++)
        feature[i] = cell[i] + hash(i, ...cell);

      let distSq = 0;
      for (let i = 0; i < n; i++) {
        const d = coords[i] - feature[i];
        distSq += d * d;
      }

      if (distSq < minDistSq) {
        minDistSq = distSq;
        closestFeature = feature;
      }
    }

    return hash(...closestFeature);
  };

  const perlin = (...coords) => {
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

  return { value, worley, worley2, voronoi, perlin };
};
