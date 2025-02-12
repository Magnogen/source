const Lexer = () => {
    const collection = [];

    const sanitizeMatcher = (matcher) =>
        typeof matcher === "string"
            ? new RegExp(`^${matcher.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`)
            : matcher;

    const define = (name, matcher, { ignore = false } = {}) => {
        const tokenDef = { name, matcher: sanitizeMatcher(matcher), ignore, mappers: [] };
        collection.push(tokenDef);

        return { map: (fn) => tokenDef.mappers.push(fn) };
    };

    const tokenize = (input) => {
        const tokens = [];
        let index = 0;

        while (index < input.length) {
            const tokenDef = collection.find(({ matcher }) => input.slice(index).match(matcher)?.index === 0);
            if (!tokenDef) throw new Error(`Unexpected token at index ${index}: '${input[index]}'`);

            const { name, matcher, ignore, mappers } = tokenDef;
            let value = input.slice(index).match(matcher)[0];

            index += value.length;
            if (ignore) break;
            const token = { type: name, value };
            mappers.forEach(fn => fn(token));
            tokens.push(token);
        }

        return tokens;
    };

    return { define, tokenize };
};


const Parser = () => {
    const parseWith = (fn) => ({ parse: (input, index) => fn(input, index) });

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
            results.push(match.result);
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

    const map = (combinator, mapper) => parseWith((input, index) => {
        let match = combinator.parse(input, index);
        return match ? { result: mapper(match.result), nextIndex: match.nextIndex } : null;
    });

    return {
        token,
        repeat,
        many: (combinator) => repeat(combinator, 0, Infinity),
        maybe: (combinator) => repeat(combinator, 0, 1),
        chain,
        any,
        map,
    };
};
