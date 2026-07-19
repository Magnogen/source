const BinaryReader = (buffer) => {
  let offset = 0;
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

  return {
    tell: () => offset,
    seek: (pos) => {
      offset = pos;
    },
    uint8: () => {
      const val = view.getUint8(offset);
      offset += 1;
      return val;
    },
    uint16: () => {
      const val = view.getUint16(offset, true);
      offset += 2;
      return val;
    },
    int32: () => {
      const val = view.getInt32(offset, true);
      offset += 4;
      return val;
    },
    float32: () => {
      const val = view.getFloat32(offset, true);
      offset += 4;
      return val;
    },
    string: (length) => {
      let chars = [];
      for (let i = 0; i < length; i++) {
        const code = view.getUint8(offset++);
        if (code !== 0) chars.push(String.fromCharCode(code));
      }
      return chars.join('');
    },
    bytes: (length) => {
      const slice = buffer.slice(offset, offset + length);
      offset += length;
      return slice;
    }
  };
};

const BinaryWriter = (initialSize = 1024) => {
  let buffer = new Uint8Array(initialSize);
  let view = new DataView(buffer.buffer);
  let offset = 0;

  const ensureCapacity = (n) => {
    if (offset + n > buffer.length) {
      const newBuffer = new Uint8Array((offset + n) * 2);
      newBuffer.set(buffer);
      buffer = newBuffer;
      view = new DataView(buffer.buffer);
    }
  };

  return {
    uint8: (val) => {
      ensureCapacity(1);
      view.setUint8(offset, val);
      offset += 1;
    },
    uint16: (val) => {
      ensureCapacity(2);
      view.setUint16(offset, val, true);
      offset += 2;
    },
    int32: (val) => {
      ensureCapacity(4);
      view.setInt32(offset, val, true);
      offset += 4;
    },
    float32: (val) => {
      ensureCapacity(4);
      view.setFloat32(offset, val, true);
      offset += 4;
    },
    string: (str, length) => {
      ensureCapacity(length);
      for (let i = 0; i < length; i++) {
        const char = str.charCodeAt(i) || 0;
        view.setUint8(offset++, char);
      }
    },
    bytes: (arr) => {
      ensureCapacity(arr.length);
      buffer.set(arr, offset);
      offset += arr.length;
    },
    pad: (length, value = 0) => {
      ensureCapacity(length);
      for (let i = 0; i < length; i++) {
        view.setUint8(offset++, value);
      }
    },
    toBuffer: () => buffer.slice(0, offset)
  };
};
