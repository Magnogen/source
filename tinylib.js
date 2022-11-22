// jshint esversion: 11
const $ = query => document.querySelector(query);
const $$ = query => document.querySelectorAll(query);
EventTarget.prototype.on = function (...args) {
    return this.addEventListener(...args);
};
EventTarget.prototype.trigger = function (name, options={}) {
    let event = new Event(name);
    for (const key in options) event[key] = options[key];
    return this.dispatchEvent(event)
};

const abs = (v)    => v < 0 ? -v : v;
const max = (a, b) => a < b ? b : a;
const min = (a, b) => a < b ? a : b;
// Thank you, Freya, for good modulo: https://github.com/FreyaHolmer/Mathfs/blob/e70cadeb2e1dcffa0ba39168e6d0be037f7e55f6/Mathfs.cs#L594-L595
const mod = (v, d) => v < 0 ? (v%d+d)%d : v%d;

const rand = (a=1, b=0) => a+Math.random()*(b-a);
const choose = arr => arr[0|(rand(arr.length))];
const shuffle = arr => {
    let i = arr.length, ri = 0|rand(i);
    while (i-- > 0) {
        [arr[i], arr[ri]] = [arr[ri], arr[i]];
        ri = 0|rand(i);
    }
    return arr;
};
