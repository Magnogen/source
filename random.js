const rand = (a=1, b=0) => a+Math.random()*(b-a);
const randpom = (a=1, b=-a) => rand(a, b);
const choose = (arr) => arr[0|(rand(arr.length))];
const shuffle = (arr) => {
    let i = arr.length, j = 0|rand(i);
    while (i-- > 0) {
        [arr[i], arr[j]] = [arr[j], arr[i]];
        j = 0|rand(i);
    }
    return arr;
};

const Mulberry = (seed) => {
    let state = seed;
    // Seeded mulberry random adapted from bryc
    // https://stackoverflow.com/a/47593316/7429566
    const hash = (value) => {
        let t = value + 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0);
    };
    const rand = (a=1, b=0) => a+(state=hash(state))/0x100000000*(b-a);
    const shuffle = (arr) => {
        let i = arr.length, j = 0|rand(i);
        while (i-- > 0) {
            [arr[i], arr[j]] = [arr[j], arr[i]];
            j = 0|rand(i);
        }
        return arr;
    };
    const dimension_primes = ((digits) => {
        const max = 0|(10**digits);
        let numbers = [...Array(max)].map((e,i) => i-1?i:0);
        const sqrt = 0|(max**0.5);
        const ij = [...Array(max*sqrt)]
            .map((e, i) => ({ i: i%sqrt, j: 0|(i/sqrt) }))
            .filter(({ i, j }) => (i > 1 && j > 1));
        for (let { i, j } of ij) numbers[i * j] = 0;
        return shuffle(numbers.filter(n => n && n > 10**(digits-1)));
    })(3.75);
    const hash_n = (...values) => {
        let value = seed;
        for (let i in values) {
            value ^= dimension_primes[i]*values[i];
        }
        return hash(value)/0x100000000;
    }
    return {
        seed, rand, hash: hash_n,
        randpom: (a=1, b=-a) => rand(a, b),
        choose: (arr) => arr[0|rand(arr.length)],
        shuffle
    }
};
