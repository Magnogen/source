// jshint esversion: 11
const $ = (query) => document.querySelector(query);
const $$ = (query) => document.querySelectorAll(query);
EventTarget.prototype.on = function (...args) {
    return this.addEventListener(...args);
};
EventTarget.prototype.trigger = function (name, options={}) {
    let event = new Event(name);
    for (const key in options) event[key] = options[key];
    return this.dispatchEvent(event)
};

const frame = () => new Promise(requestAnimationFrame);

const abs = (v)    => v < 0 ? -v : v;
const max = (a, b) => a < b ? b : a;
const min = (a, b) => a < b ? a : b;
// Thank you, Freya :D
// https://github.com/FreyaHolmer/Mathfs/blob/e70cadeb2e1dcffa0ba39168e6d0be037f7e55f6/Mathfs.cs#L594-L595
const mod = (v, d) => v < 0 ? (v%d+d)%d : v%d;

const rand = (a=1, b=0) => a+Math.random()*(b-a);
const randpom = (a=1, b=-a) => rand(a, b);
const choose = (arr) => arr[0|(rand(arr.length))];
const shuffle = (arr) => {
    let i = arr.length, ri = 0|rand(i);
    while (i-- > 0) {
        [arr[i], arr[ri]] = [arr[ri], arr[i]];
        ri = 0|rand(i);
    }
    return arr;
};
// Seeded mulberry random adapted from bryc
// https://stackoverflow.com/a/47593316/7429566
const seed_rand = (seed) => {
    const rand = (a=1, b=0) => {
        var t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        const r = ((t ^ t >>> 14) >>> 0) / 4294967296;
        return a+r*(b-a);
    };
    return {
        rand,
        randpom: (a=1, b=-a) => rand(a, b),
        choose: (arr) => arr[0|rand(arr.length)],
        shuffle: (arr) => {
            let i = arr.length, ri = 0|rand(i);
            while (i-- > 0) {
                [arr[i], arr[ri]] = [arr[ri], arr[i]];
                ri = 0|rand(i);
            }
            return arr;
        },
    }
}

// Thanks again, bryc :)
// https://stackoverflow.com/a/52171480/7429566
const hash = (str, seed = 0) => {
  let h1 = 0xdeadbeef ^ seed,
      h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};
