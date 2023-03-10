const frame = (frames=1) => new Promise(async (res) => {
    for (let i = 0; i < frames; i++) {
        await new Promise(requestAnimationFrame);
    }
    res();
});
const pause = (() => {
    let last = performance.now();
    return (time=1000/60, onFrame=()=>{}) => new Promise(async (res) => {
      if (performance.now() - last > time) {
        const result = onFrame();
        await frame();
        last = performance.now();
        res(result);
        return;
      }
      res(undefined);
    })
})();