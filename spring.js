const IS_SPRING = Symbol();
const spring = (initial, options = {}) => {
  const vectorAdapter = (sample) => {
    if (typeof sample === "number") {
      return {
        toVec: (v) => [v],
        fromVec: ([v]) => v,
      };
    }
    if (sample && typeof sample.x === "number" && typeof sample.y === "number") {
      return {
        toVec: (v) => [v.x, v.y],
        fromVec: ([x, y]) => ({ x, y }),
      };
    }
    if (sample && typeof sample.css === "function") {
      return {
        toVec: (v) => [v.l, v.a, v.b, v.t],
        fromVec: ([l, a, b, t]) => color(l, a, b, t),
      };
    }
    throw new Error(`spring: unsupported initial value type, ${JSON.stringify(sample)}`);
  };

  const adapter = vectorAdapter(initial);

  let x  = adapter.toVec(initial);
  let xp = x.slice();
  let y  = x.slice();
  let yd = x.map(() => 0);

  let frequency = options.frequency ?? 1;
  let stiffness = options.stiffness ?? 1;
  let response  = options.response ?? 0;

  let k1, k2, k3;
  const updateConstants = () => {
    k1 = stiffness / (Math.PI * frequency);
    k2 = 1 / ((2 * Math.PI * frequency) ** 2);
    k3 = response * stiffness / (2 * Math.PI * frequency);
  };
  updateConstants();

  const update = (dt) => {
    if (dt <= 0) return;
    const k2_stable = Math.max(k2, 1.1 * (dt * dt / 4 + dt * k1 / 2));
    for (let i = 0; i < x.length; i++) {
      const xd = (x[i] - xp[i]) / dt;
      xp[i] = x[i];
      y[i] += dt * yd[i];
      yd[i] += dt * (x[i] + k3 * xd - y[i] - k1 * yd[i]) / k2_stable;
    }
  };
};