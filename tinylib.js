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

const min = (a, b) => a < b ? a : b;
const max = (a, b) => a > b ? a : b;
const rand = (a=1, b=0) => a+Math.random()*(b-a);
const choose = arr => arr[0|(rand(arr.length))];
