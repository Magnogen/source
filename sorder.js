const Sorder = (object, property, { frequency, springiness, response }) => {
  if (Array.isArray(property)) {
    let updaters = property.map(prop => Sorder(object, prop, { frequency, springiness, response }));
    return (...args) => {
      for (const update of updaters) {
        update(...args);
      }
    };
  }
  
  // @t3ssel8r is godsend
  // f    -> frequency
  // zeta -> springiness
  // r    -> response
  
  let x = object[property];
  let xp = object[property];
  let y = object[property];
  let yd = 0;
  let k1 = springiness / (Math.PI * frequency),
      k2 = 1 / ((2 * Math.PI * frequency) ** 2),
      k3 = response * springiness / (2 * Math.PI * frequency);
  
  const update = (T) => {
    const xd = (x - xp) / T;
    xp = x;
    const k2_stable = Math.max(k2, 1.1 * (T*T/4 + T*k1/2));
    y += T*yd
    yd += T * (x + k3*xd - y - k1*yd) / k2_stable;
  }
  
  Reflect.defineProperty(object, property, {
    get() {
      return y;
    },
    set(value) {
      x = value;
    }
  });
  
  return update;
}

const createSpring = ({
  initial = 0,
  frequency = 2,
  springiness = 1,
  response = 1,
} = {}) => {
  let x = initial;  // target
  let xp = initial; // last target
  let y = initial;  // current value
  let yd = 0;       // current velocity

  const k1 = springiness / (Math.PI * frequency);
  const k2 = 1 / ((2 * Math.PI * frequency) ** 2);
  const k3 = response * springiness / (2 * Math.PI * frequency);

  const update = (dt) => {
    const xd = (x - xp) / dt;
    xp = x;
    const k2_stable = Math.max(k2, 1.1 * (dt * dt / 4 + dt * k1 / 2));
    y += dt * yd;
    yd += dt * (x + k3 * xd - y - k1 * yd) / k2_stable;
  };

  return {
    update,
    get value() {
      return y;
    },
    get velocity() {
      return yd;
    },
    set target(v) {
      x = v;
    },
    set velocity(v) {
      yd = v;
    },
    set value(v) {
      y = v;
    },
    snapTo(v) {
      x = v;
      xp = v;
      y = v;
      yd = 0;
    },
    impulse(v) {
      yd += v;
    }
  };
};
