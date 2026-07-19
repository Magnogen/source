const Sound = ({
  sampleRate = 44100,
  duration = 1,
  channels = 1,
} = {}) => {
  const length = sampleRate * duration;
  const data = Array.from({ length: channels }, () => new Float32Array(length));

  const toBlob = () => {
    const buffer = new ArrayBuffer(44 + length * channels * 2);
    const view = new DataView(buffer);

    const writeString = (offset, str) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * channels * 2, true); // ChunkSize
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (PCM)
    view.setUint16(20, 1, true);  // AudioFormat (1 for PCM)
    view.setUint16(22, channels, true);  // Number of Channels
    view.setUint32(24, sampleRate, true);   // SampleRate
    view.setUint32(28, sampleRate * channels * 2, true); // ByteRate
    view.setUint16(32, channels * 2, true); // BlockAlign
    view.setUint16(34, 16, true); // BitsPerSample
    writeString(36, 'data');
    view.setUint32(40, length * channels * 2, true); // Subchunk2Size

    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let c = 0; c < channels; c++) {
        const s = Math.max(-1, Math.min(1, data[c][i]));
        view.setInt16(offset, s * 0x7FFF, true);
        offset += 2;
      }
    }

    return new Blob([view], { type: 'audio/wav' });
  };

  const play = () => {
    const context = new AudioContext();
    const buffer = context.createBuffer(channels, length, sampleRate);
    for (let c = 0; c < channels; c++) {
      buffer.getChannelData(c).set(data[c]);
    }
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start();
  };

  return {
    data,
    toBlob,
    play,
  };
};
