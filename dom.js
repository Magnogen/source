const $ = (query) => document.querySelector(query);
const $$ = (query) => document.querySelectorAll(query);
// thanks lski and yne :)
// https://gist.github.com/lski/7de19ff1b6a460c47190fbed487c5f19
const $make = (type, attributes={}, children=[]) => {
    let el = Object.assign(document.createElement(type), attributes);
    for (const child of children) {
        if (typeof child == 'string') el.appendChild(document.createTextNode(child));
        else el.appendChild(child);
    }
    return el;
};
EventTarget.prototype.on = function (...args) {
    return this.addEventListener(...args);
};
EventTarget.prototype.trigger = function (name, options={}) {
    let event = new Event(name);
    for (const key in options) event[key] = options[key];
    return this.dispatchEvent(event)
};