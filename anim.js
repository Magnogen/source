const frame = (frames=1) => new Promise(async (res) => {
  const start = performance.now();
  for (let i = 0; i < frames; i++) {
    await new Promise(requestAnimationFrame);
  }
  res((performance.now() - start)/1000);
});

const pause = (() => {
  let last = performance.now();
  return (time=1000/60, onFrame=()=>{}) => new Promise(async (res) => {
    const now = performance.noe()
    if (now - last > time) {
      const result = onFrame((now - last)/1000);
      await frame();
      last = performance.now();
      res(result);
      return;
    }
    res(undefined);
  })
})();

const  lerp = (a, b, t) => a*(1-t) + b*t;
const ilerp = (a, b, v) => (v-a)/(b-a);
const map = (v, i1, i2, o1, o2) => lerp(o1, o2, ilerp(i1, i2, v));

// mostly from https://easings.net
const Ease = (() => {
  const swap = (f) => (e) => t => 1 - f(e)(1-t);
  const io   = (f) => (e) => t => t < 0.5 ? swap(f)(e)(2*t)/2 : (1+f(e)(2*t-1))/2;

  const linear   = ( ) => t => t;
  const sine     = ( ) => t => Math.sin(t*Math.PI/2);
  const pow      = (p) => t => t**p;
  const exp      = (e) => t => t*2**(e*t-e);
  const circular = ( ) => t => 1-(1-t**2)**0.5;
  const back     = ( ) => t => 2.70158*t**3 - 1.70158*t**2;
  const elastic  = ( ) => t => 2**(-10*t)*Math.sin((10*t-0.75)*2*Math.PI/3)+1;
  const bounce   = ( ) => T => {
    let t = T;
    const [n1, d1] = [7.5625, 2.75];
    if (t < 1.0 / d1) return n1*t*t;
    if (t < 2.0 / d1) return n1*(t -= 1.5/d1)*t + 0.75;
    if (t < 2.5 / d1) return n1*(t -= 2.25/d1)*t + 0.9375;
    return n1*(t -= 2.625/d1)*t + 0.984375;
  }
  // Super Smooth function with "perfect" derivatives
  // From https://youtu.be/vD5g8aVscUI
  const super_smooth = ( ) => t => {
    if (t <= 0) return 0
    if (t >= 1) return 1
    const f = (t) => Math.exp(-1/t)
    return f(t)/(f(t) + f(1-t))
  };

  return {
    In: {
      Linear: linear,
      Sine: swap(sine),
      Pow: pow,
      Exp: exp,
      Circular: circular,
      Back: back,
      Elastic: swap(elastic),
      Bounce: swap(bounce),
    },
    Out: {
      Linear: linear,
      Sine: sine,
      Pow: swap(pow),
      Exp: swap(exp),
      Circular: swap(circular),
      Back: swap(back),
      Elastic: elastic,
      Bounce: bounce
    },
    Linear: linear,
    Sine: io(sine),
    Pow: io(swap(pow)),
    Exp: io(swap(exp)),
    Circular: io(swap(circular)),
    Back: io(swap(back)),
    Elastic: io(elastic),
    Bounce: io(bounce),
    Super: super_smooth
  };
})();


const Tweenify = (object, property, {
  start:      Start     = object[property],
  end:        End       = object[property],
  length:     Length    = "1s",
  delay:      Delay     = "0s",
  ease:       Easing    = Ease.Linear,
  repeat:     Repeat    = 0,
  foldBack:   Fold      = false,
  keepValue:  Keep      = true,
  automatic:  Automatic = true
}) => {
  let tweening = false;
  // values
  let value = object[property];
  let startValue = Start;
  let endValue = End;
  // times
  let startTime = 0;
  let currentTime = 0;
  let duration = Length;
  let delayTime = Delay;
  // options
  let ease = Easing;
  let repeat = Repeat;
  let foldBack = Fold;
  let keepValue = Keep;
  let automatic = Automatic;

  const timeMultipliers = {
    MS: 1,
    F:  1000/60,
    S:  1000,
    M:  60000,
    H:  1440000,
  };
  const timeRegex = new RegExp(`^-?[0-9]+(\.[0-9]+)?(${Object.keys(timeMultipliers).join('|')})$`, 'i');
  const timeValue = /^-?[0-9]+(\.[0-9]+)?/;
  const parseTime = (time) => {
    const correctSyntax = timeRegex.test(time);
    if (!correctSyntax) return 1;
    const valueStr = timeValue.exec(time)[0];
    const value = parseFloat(valueStr);
    const unit = time.substring(valueStr.length, time.length).toUpperCase();
    const multiplier = timeMultipliers[unit];
    return value*multiplier;
  };

  Reflect.defineProperty(object, property, {
    get() {
      if (!tweening) return keepValue ? (foldBack ? startValue : endValue) : value;
      
      const now = automatic ? performance.now() : currentTime;
      let t = (now - (startTime + delayTime))/duration;
      
      if (t < 0) return value;
      if (t > (foldBack ? 2 : 1)) {
        if (repeat > 0) {
          delayTime = 0;
          while ((startTime += duration, startTime+duration) < now && repeat-- > 0);
          return object[property]; // recompute value and return it, recursion
        }
        if (keepValue) {
          if (foldBack) value = startValue;
          else value = endValue;
        }
        tweening = false;
        return value;
      }
      // foldback && t between 1 and 2
      if (t > 1) return lerp(startValue, endValue, ease(2-t));
      return lerp(startValue, endValue, ease(t));
    },
    set({
      start:      Start   = value,
      end:        End     = value,
      length:     Length  = "1s",
      delay:      Delay   = "0s",
      ease:       Easing  = Ease.Linear,
      repeat:     Repeat  = 0,
      foldBack:   Fold    = false,
      keepValue:  Keep    = true,
    }) {
      value       = object[property];
      tweening    = true;
      startValue  = Start;
      endValue    = End;
      startTime   = automatic ? performance.now() : currentTime;
      duration    = parseTime(Length);
      delayTime   = parseTime(Delay);
      ease        = Easing;
      repeat      = Repeat;
      foldBack    = Fold;
      keepValue   = Keep;
    },
    configurable: true,
    enumerable: true
  });

  const advance = (time='1f') => (currentTime += parseTime(time), undefined);

  const isComplete = () => {
    if (!tweening) return true;
    
    const now = automatic ? performance.now() : currentTime;
    let t = (now - (startTime + delayTime))/duration;

    if (t > (foldBack ? 2 : 1)) {
      if (repeat > 0) {
        delayTime = 0;
        while ((startTime += duration, startTime+duration) < now && repeat-- > 0);
        return isComplete();
      }
      if (keepValue) {
        if (foldBack) value = startValue;
        else value = endValue;
      }
      tweening = false;
      return true;
    }
    return false;
  }

  return {
    advance, isComplete
  }
}