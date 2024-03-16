const FSM = (config) => {
  const {
    initially,
    states = {},
    fallback = {},
    before = {},
    after = {},
    entering = {},
    leaving = {},
    debug = false,
  } = config;

  let currentState = initially ?? Object.keys(states)[0];

  const log = (message) => {
    if (debug) console.log('%c' + message, 'color: green');
  };

  const call = (event, parameters) => {
    log(`"${event}" begin`);
    before[event]?.(...parameters);
    const newState = (states[currentState]?.[event] ?? fallback[event] ?? (()=>{}))();
    after[event]?.(...parameters);
    log(`"${event}" completed`);
    if (newState != undefined) {
      log(`Transition: [${currentState}] -> [${newState}]`);
      leaving[currentState]?.();
      currentState = newState;
      entering[currentState]?.();
    }
  };

  const event = (eventName) => (...parameters) => {
    call(eventName, parameters);
  };

  const setState = (state) => {
    currentState = state;
    log(`State set to: ${state}`);
  };

  const getState = () => {
    log(`Current state: ${currentState}`);
    return currentState;
  };

  return {
    call,
    event,
    setState,
    getState,
  };
};