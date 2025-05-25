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

const El = (tag, { class: cls, id, style, ...attrs } = {}) => (...children) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (id) el.id = id;
    if (style) Object.assign(el.style, style);
    for (const [key, val] of Object.entries(attrs)) e.setAttribute(key, val);

    for (const child of children) {
        el.append( typeof child === "string" ? document.createTextNode(child) : child);
    }
    return el;
};
const tags = new Proxy({}, { get: (_, tag) => El(tag) });