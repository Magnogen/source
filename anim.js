const frame = () => new Promise(requestAnimationFrame);
const pause = (() => {
    let last = performance.now();
    return (time=1000/60) => (performance.now() - last > time) ? (last = performance.now(), frame()) : undefined;
})();