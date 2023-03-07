const Matrix = (obj, include_index=false) => {
    const props = Object.keys(obj);
    const length = props.reduce((a, e) => a*obj[e], 1);
    return {
        length,
        *[Symbol.iterator]() {
            for (let i = 0; i < length; i++) {
                let r = {};
                let m = 1;
                for (const prop of props) {
                    r[prop] = 0|(i/m)%obj[prop];
                    m *= obj[prop];
                }
                if (include_index) r.index = i;
                yield r
            }
        }
    }
}  