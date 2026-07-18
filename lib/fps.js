const FPS = () => {
  let frameTimes = [];
  let lastUpdateTime = performance.now();
  
  let minimum = Infinity;
  let maximum = -Infinity;
  let average = 0;
  
  const submit = (delta) => {
    const now = performance.now();
    frameTimes.push(delta);

    if (now - lastUpdateTime >= 1000) {
      const fpsValues = frameTimes.map(time => 1000 / time);

      minimum = Math.min(...fpsValues);
      maximum = Math.max(...fpsValues);
      average = fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length;

      frameTimes = [];
      lastUpdateTime = now;
    }
  }

  return {
    submit,
    get minimum() { return minimum },
    get maximum() { return maximum },
    get average() { return average },
  };
}
