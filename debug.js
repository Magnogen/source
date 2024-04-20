const Debug = (object) => {
  if (object === null) {
    const span = document.createElement('span');
    span.innerText = 'null';
    span.classList.add('null');
    return span;
  }
  
  if (object === undefined) {
    const span = document.createElement('span');
    span.innerText = 'undefined';
    span.classList.add('undefined');
    return span;
  }

  if (typeof object == 'string') {
    const span = document.createElement('span');
    span.innerText = `"${object.replaceAll('\n', '\\n')}"`;
    span.classList.add('string');
    return span;
  }
  
  if (typeof object == 'number') {
    const span = document.createElement('span');
    span.innerText = `${object}`;
    span.classList.add('number');
    return span;
  }
  
  if (typeof object == 'boolean') {
    const span = document.createElement('span');
    span.innerText = `${object}`;
    span.classList.add('boolean');
    return span;
  }
  
  if (typeof object == 'function') {
    const span = document.createElement('span');
    span.innerHTML = `${
      object
        .toString()
        .split('\n')
        .map((line, i, lines) => {
          const endingWhitespace = lines[lines.length-1].match(/^\s+/)[0];
          if (line.startsWith(endingWhitespace)) return line.slice(endingWhitespace.length);
          return line;
        })
        .join('\n')
        .replaceAll('&', '&amp;')
        .replaceAll(' ', '&nbsp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('\n', '<br>')
    }`;
    span.classList.add('function');
    return span;
  }

  const details = document.createElement('details');
  details.open = 'open';
  details.classList.add('object');

  const summary = document.createElement('summary');
  details.appendChild(summary);

  const list = document.createElement('ol');
  details.appendChild(list);

  if (Array.isArray(object)) {
    summary.innerHTML = '[ ... ]';
    for (const value of object) {
      const item = document.createElement('li');
      item.appendChild(Debug(value));
      list.appendChild(item)
    }
  }

  else if (typeof object == 'object') {
    summary.innerHTML = '{ ... }';
    for (const [key, value] of Object.entries(object)) {
      const item = document.createElement('li');
      item.appendChild(document.createTextNode(`${key}`));
      item.appendChild(document.createTextNode(':\u00A0'));
      item.appendChild(Debug(value));
      list.appendChild(item)
    }
  }

  return details;
};

const Debugger = (element) => (object) => {
  element.appendChild(Debug(object));
  return object;
};