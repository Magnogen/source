const FSM = (transitions, initial = 'idle') => {
  let state = initial;

  const handle = (event, ...payload) => {
    const key = `${state}:${event}`;
    const action = transitions[key];
    if (typeof action != 'function') return state;
    const next = action(...payload);
    if (typeof next != 'string') return state;
    state = next;
    return state;
  }
  
  return {
    getState: () => state,
    setState: (newState) => state = newState,
    call: (event, ...params) => handle(event, ...params),
    event: (event) => (...params) => handle(event, ...params),
  };
}
