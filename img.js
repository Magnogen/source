const Img = (
  width,
  height,
  data = new Uint8ClampedArray(width * height * 4),
  offsetX = 0,
  offsetY = 0,
  stride = width,
) => {

  const indexAt = (x, y) => ((y + offsetY) * stride + (x + offsetX)) * 4;
  const inBounds = (x, y) => x >= 0 && y >= 0 && x < width && y < height;

  const createPixel = (i, x, y) => ({
    x, y, index: i / 4,

    get r() { return data[i + 0]; },
    set r(v) { data[i + 0] = v; },

    get g() { return data[i + 1]; },
    set g(v) { data[i + 1] = v; },

    get b() { return data[i + 2]; },
    set b(v) { data[i + 2] = v; },

    get a() { return data[i + 3]; },
    set a(v) { data[i + 3] = v; },

    get rgb() { return (data[i] + data[i + 1] + data[i + 2]) / 3; },
    set rgb(v) { data[i] = data[i + 1] = data[i + 2] = v; },

    sample(dx, dy) {
      const sx = x + dx, sy = y + dy;
      if (!inBounds(sx, sy)) return null;
      return createPixel(indexAt(sx, sy), sx, sy);
    },

    *region(sizeX, sizeY = sizeX) {
      const halfX = Math.floor(sizeX / 2);
      const halfY = Math.floor(sizeY / 2);
      for (let yy = y - halfY; yy <= y + halfY; yy++) {
        for (let xx = x - halfX; xx <= x + halfX; xx++) {
          if (inBounds(xx, yy)) yield createPixel(indexAt(xx, yy), xx, yy);
        }
      }
    },
  });

  const api = {
    width, height, data, offsetX, offsetY, stride,

    *pixels() {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = indexAt(x, y);
          yield createPixel(i, x, y);
        }
      }
    },

    drawTo(canvas, dx = 0, dy = 0) {
      const ctx = canvas.getContext("2d");
      const imgData = new ImageData(
        new Uint8ClampedArray(data.buffer, 0, stride * height * 4),
        stride,
        height
      );
      ctx.putImageData(imgData, dx, dy);
    },

    region(x, y, w, h) {
      return Img(w, h, data, offsetX + x, offsetY + y, stride);
    },

    *chunks(divisions = 4) {
      const chunkHeight = Math.ceil(height / divisions);
      for (let i = 0; i < divisions; i++) {
        const y = i * chunkHeight;
        const h = Math.min(chunkHeight, height - y);
        yield api.region(0, y, width, h);
      }
    },

    *tiles(divisions = 4) {
      const tileW = Math.ceil(width / divisions);
      const tileH = Math.ceil(height / divisions);
      for (let ty = 0; ty < divisions; ty++) {
        for (let tx = 0; tx < divisions; tx++) {
          const x = tx * tileW;
          const y = ty * tileH;
          const w = Math.min(tileW, width - x);
          const h = Math.min(tileH, height - y);
          yield api.region(x, y, w, h);
        }
      }
    },
  };

  return api;
};
