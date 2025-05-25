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

const El = (tag) => (...children) => {
    const el = document.createElement(tag);
    for (const child of children) {
        el.appendChild(
            typeof child === "string" ?
                document.createTextNode(child)
            : child instanceof Node ?
                child
            :
                null
        );
    }
    return el;
};
const tags = new Proxy({}, { get: (, tag) => El(tag) });