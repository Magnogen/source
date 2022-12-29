// Meal
//   Consuming a string
//   Good for programming languages and syntax highlighting and parsing and such

const Meal = (plate, tokensOnly = false) => {
    if (typeof plate != 'string') throw {
        name: 'MealError',
        message: `Expected String and received ${typeof plate}`
    };
    let index = 0;
    let line = 0;
    let column = 0;
    return {
        plate, tokensOnly, index, line, column,
        finished() { return this.index >= this.plate.length },
        first(check) {
            if (this.finished()) return;
            if (typeof check == 'string')
                return this.plate.substring(this.index, this.index + check.length) == check;
            if (typeof check == 'number')
                return this.plate.substring(this.index, this.index + check + 1);
            if (typeof check == 'undefined')
                return this.plate[this.index];
        },
        leftover() { return this.plate.substring(this.index, this.plate.length) },
        eat(edible, tokensOnly = this.tokensOnly) {
            if (typeof edible == 'string') {
                if (!this.first(edible)) return null;
                this.index += edible.length;
                const lines = edible.split('\n');
                this.line += lines.length - 1;
                if (lines.length > 1) this.column = 0;
                this.column += lines[lines.length - 1].length;
                return edible;
            }
            else if (typeof edible == 'function') {
                const copy = Meal(this.plate, tokensOnly);
                copy.index = this.index;
                copy.line = this.line;
                copy.column = this.column;
                const out = edible(copy);
                if (out === null) return null;
                this.index = copy.index;
                this.line = copy.line;
                this.column = copy.column;
                return out;
            }
        }
    }
};

Meal.any = (...edibles) => food => {
    for (let edible of edibles) {
        const value = food.eat(edible);
        if (value != null) return value;
    }
    return null;
}
Meal.around = (edible, start, end) => food => {
    const value = food.eat(edible);
    if (value == null) return null;
    return start + value + end;
}
Meal.chain = (...edibles) => food => {
    let content = [], current;
    for (let edible of edibles) {
        current = food.eat(edible)
        if (current == null) return null;
        else content.push(current);
    }
    return food.tokensOnly ? content : content.join('');
}
Meal.many = edible => food => {
    let content = [], current;
    while (true) {
        current = food.eat(edible);
        if (current === null) return null;
        content.push(current);
    }
    if (content.length == 0) return null;
    return food.tokensOnly ? content : content.join('');
}
Meal.map = (edible, mapper) => food => {
    const value = food.eat(edible);
    if (value == null) return null;
    if (Array.isArray(value)) return mapper(...value);
    return mapper(value);
};
Meal.n = (edible, amount) => food => {
    let content = [], current;
    for (let i = 0; i < amount; i++) {
        current = food.eat(edible);
        if (current === null) return null;
        content.push(current);
    }
    return food.tokensOnly ? content : content.join('');
}
Meal.need = (edible, messenger) => food => {
    const content = food.eat(edible)
    if (content == null) throw {
        name: 'Meal.Need',
        message: typeof messenger == 'function' ? messenger(food) : messenger
    };
    return content;
};
Meal.not = edible => food => food.eat(edible) == null ? food.eat(food.first()) : null;

Meal.ignore = edible => food => food.eat(edible) == null ? null : '';
Meal.maybe = edible => food => (food.eat(edible) ?? '');
Meal.upto = edible => food => food.eat(Meal.many(Meal.not(edible)));
Meal._ = food => {
    const out = food.eat(Meal.maybe(Meal.many(Meal.any(' ', '\t'))));
    if (out === null) return null;
    return food.tokensOnly ? out : out.join('');
}
Meal.__ = food => {
    const out = food.eat(Meal.many(Meal.any(' ', '\t')));
    if (out === null) return null;
    return food.tokensOnly ? out : out.join('');
}