const Lexer = () => {
  const collection = [];

  const sanitizeMatcher = (matcher) =>
    typeof matcher === "string"
      ? new RegExp(`^${matcher.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`)
      : matcher;

  const define = (name, matcher, { ignore = false } = {}) => {
    collection.push({ name, matcher: sanitizeMatcher(matcher), ignore });
  };

  const tokenize = (input) => {
    const tokens = [];
    let index = 0;

    while (index < input.length) {
      const tokenDef = collection.find(({ matcher }) => input.slice(index).match(matcher)?.index === 0);
      if (!tokenDef) throw new Error(`Unexpected token at index ${index}: '${input[index]}'`);

      const { name, matcher, ignore } = tokenDef;
      let value = input.slice(index).match(matcher)[0];
      
      const start = index;
      index += value.length;
      if (ignore) continue;
      tokens.push({ type: name, value, start, end: index });
    }

    return tokens;
  };

  return { define, tokenize };
};

const Parser = () => {
  const parseWith = (fn) => ({
    parse: fn,
    map: (mapper) => parseWith((input, index) => {
      const result = fn(input, index);
      return result ? {
        result: mapper(result.result),
        nextIndex: result.nextIndex
      } : null;
    })
  });
  
  const token = (type) => parseWith((input, index) =>
    index < input.length && input[index].type === type
      ? { result: input[index], nextIndex: index + 1 }
      : null
  );

  const repeat = (combinator, min = 1, max = Infinity) => parseWith((input, index) => {
    let results = [], nextIndex = index, count = 0;

    while (count < max) {
      let match = combinator.parse(input, nextIndex);
      if (!match) break;
      results.push(match.result);
      nextIndex = match.nextIndex;
      count++;
    }

    return count >= min ? { result: results, nextIndex } : null;
  });

  const chain = (...combinators) => parseWith((input, index) => {
    let results = [], nextIndex = index;

    for (let combinator of combinators) {
      let match = combinator.parse(input, nextIndex);
      if (!match) return null;
      if (match.result != SKIP) results.push(match.result);
      nextIndex = match.nextIndex;
    }

    return { result: results, nextIndex };
  });

  const any = (...combinators) => parseWith((input, index) => {
    for (let combinator of combinators) {
      let match = combinator.parse(input, index);
      if (match) return match;
    }
    return null;
  });

  const lazy = (fn) => parseWith((input, index) => fn().parse(input, index));

  return {
    token,
    repeat,
    many: (combinator) => repeat(combinator, 0, Infinity),
    maybe: (combinator) => repeat(combinator, 0, 1),
    chain,
    any,
    lazy,
  };
};
