// Colour
//   Creating and editing colours
//   RGBA, HSLA and CMYA are supported
//   Might include CNS in future too
//   https://documentation.sas.com/doc/en/pgmsascdc/9.4_3.5/grstatgraph/p0edl20cvxxmm9n1i9ht3n21eict.htm
//   ^ Helpful resource

const Colour = (type, ...data) => {
    let r = 0, g = 0, b = 0, a = 255,
        h = 0, s = 0, l = 0;
    if (typeof type == 'string') {
        if (!['rgb', 'rgba', 'hsl', 'hsla', 'cmy', 'cmya'].includes(type.toLowerCase())) throw {
            name: 'Elements.Colour',
            message: `Expected Colour Type and received ${type}`
        };
        else if (['hsl', 'hsla'].includes(type)) {
            [r, g, b, a] = [...Colour.hsl2rgb(...data), 255];
            [h, s, l] = data;
        }
        else if (['cmy', 'cmya'].includes(type)) {
            [r, g, b, a] = [...Colour.cmy2rgb(...data), 255];
            [h, s, l] = [...Colour.rgb2hsl(r, g, b)];
        }
        else {
            [r, g, b, a] = [...data];
            [h, s, l] = [...Colour.rgb2hsl(r, g, b)];
        }
    } else if (typeof type === 'object' && type instanceof Colour) {
        [r, g, b, a] = type.rgba;
        [h, s, l] = type.hsl;
    }

    return {
        r, g, b, a,
        h, s, l,
        toRGB() { return `rgba(${this.rgba.map(n => 0 | n).join(', ')})` },
        toHex() { return '#' + this.rgba.map(c => (0 | c).toString(16).padStart(2, '0')).join('') },

        // this.r, this.g, this.b, and this.a are all actual values
        get rgb() { return [this.r, this.g, this.b] },
        get rgba() { return [this.r, this.g, this.b, this.a] },
        set rgb(data) { this.rgba = [data, this.a] },
        set rgba(_data) {
            let data = _data.flat(Infinity);
            this.r = data[0] === undefined ? this.r : data[0];
            this.g = data[1] === undefined ? this.g : data[1];
            this.b = data[2] === undefined ? this.b : data[2];
            this.a = data[3] === undefined ? this.a : data[3];
        },

        get h() { return this.hsl[0] },
        get s() { return this.hsl[1] },
        get l() { return this.hsl[2] },
        set h(hue) { let b4 = this.hsla; this.hsla = [hue, b4[1], b4[2], b4[3]] },
        set s(sat) { let b4 = this.hsla; this.hsla = [b4[0], sat, b4[2], b4[3]] },
        set l(lig) { let b4 = this.hsla; this.hsla = [b4[0], b4[1], lig, b4[3]] },
        get hsl() { return Colour.rgb2hsl(this.r, this.g, this.b) },
        get hsla() { return [...this.hsl, this.a] },
        set hsl(data) { this.hsla = [...data, this.a]; },
        set hsla(_data) {
            let data = _data.flat(Infinity);
            let b4 = this.hsl;
            data[0] = data[0] ? data[0] : b4[0];
            data[1] = data[1] ? data[1] : b4[1];
            data[2] = data[2] ? data[2] : b4[2];
            data = [...Colour.hsl2rgb(data[0], data[1], data[2]), data[3]];
            this.r = data[0];
            this.g = data[1];
            this.b = data[2];
            this.a = data[3] === undefined ? this.a : data[3];
        },

        get c() { return this.cmy[0] },
        get m() { return this.cmy[1] },
        get y() { return this.cmy[2] },
        set c(cyn) { let b4 = this.cmya; this.cmya = [cyn, b4[1], b4[2], b4[3]] },
        set m(mag) { let b4 = this.cmya; this.cmya = [b4[0], mag, b4[2], b4[3]] },
        set y(yel) { let b4 = this.cmya; this.cmya = [b4[0], b4[1], yel, b4[3]] },
        get cmy() { return [255 - this.r, 255 - this.g, 255 - this.b] },
        set cmy(data) { this.cmya = [data, this.a] },
        get cmya() { return [...this.cmy, this.a] },
        set cmya(_data) {
            let data = _data.flat(Infinity);
            this.r = data[0] === undefined ? this.r : 255 - data[0];
            this.g = data[1] === undefined ? this.g : 255 - data[1];
            this.b = data[2] === undefined ? this.b : 255 - data[2];
            this.a = data[3] === undefined ? this.a : data[3];
        }
    }
};

// hsl2rgb() and rgb2hsl() adapted from Kamil Kiełczewski's answer from StackOverflow
// https://stackoverflow.com/a/64090995

// h[0-360] s[0-1] l[0-1] -> r[0-255] g[0-255] b[0-255]
Colour.hsl2rgb = (h = 0, s = 1, l = 0.5) => {
    let a = s * Math.min(l, 1 - l);
    let f = (n, k = (n + (h + 360) / 30) % 12) => l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return [255 * f(0), 255 * f(8), 255 * f(4)]
}
// r[0-255] g[0-255] b[0-255] -> h[0-360] s[0-1] l[0-1]
Colour.rgb2hsl = (_r = 0, _g = 0, _b = 0) => {
    let [r, g, b] = [_r / 255, _g / 255, _b / 255];
    let v = Math.max(r, g, b), c = v - Math.min(r, g, b), f = (1 - Math.abs(v + v - c - 1));
    let h = c && ((v == r) ? (g - b) / c : ((v == g) ? 2 + (b - r) / c : 4 + (r - g) / c));
    return [60 * (h < 0 ? h + 6 : h), f ? c / f : 0, (v + v - c) / 2]
}

// c[0-255] m[0-255] y[0-255] <-> r[0-255] g[0-255] b[0-255]
Colour.cmy2rgb = (c = 0, m = 0, y = 0) => [255 - c, 255 - m, 255 - y];
Colour.rgb2cmy = Colour.cmy2rgb;
