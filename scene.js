/**
 * Creates a scene with a framesGenerator and options.
 * 
 * @param {Generator} framesGenerator - Generator function for frames.
 * @param {Object} options - Options for the scene.
 * @returns {Object} - The scene object.
 */
const Scene = (framesGenerator, options = {}) => {
    const debug = document.createElement('div');
    document.body.appendChild(debug);
  
    /**
     * Scales a canvas to the dimensions specified in options.
     * 
     * @param {HTMLCanvasElement} canvas - The canvas to scale.
     * @returns {HTMLCanvasElement} - The scaled canvas.
     */
    const scaleCanvas = (canvas) => {
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = options.width;
      outputCanvas.height = options.height;
      const context = outputCanvas.getContext('2d');
      context.imageSmoothingEnabled = options.scaleMethod === 'bilinear';
      context.drawImage(canvas, 0, 0, outputCanvas.width, outputCanvas.height);
      return outputCanvas;
    };
    
    const upload = (canvas, frameCount) => new Promise(res => canvas.toBlob(blob => {
      const url = 'http://localhost:3000/upload';
      const formData = new FormData();
      formData.append('frame', blob, `${options.title||'project'}_${String(frameCount).padStart(8, '0')}.png`);
  
      fetch(url, {
        method: 'POST',
        body: formData
      })
      .then(response => response.text())
      .then(data => {
        debug.innerText = data;
      })
      .finally(res);
    }, 'image/png'));
    
    return {
      frames: async function*() {
        const duration = options.duration;
        const frameRate = options.fps;
        let frameNumber = 0;
        const length = duration * frameRate;
        const getFrame = () => frameNumber;
        const getNow = () => getFrame()/frameRate;
        const getPercent = () => getFrame()/length;
        for await (const c of framesGenerator({
          getNow, duration, // in seconds
          getFrame, length, // in frames
          getPercent, // as percentage
        })) {
          yield c;
          frameNumber++;
        }
      },
  
      /**
       * Renders each frame and uploads it to a server
       * @returns {Promise} Resolves when all frames have been uploaded
       */
      render: async function() {
        let frameCount = 0;
        for await (let canvas of this.frames()) {
          if (!canvas) continue;
          let scaledCanvas = scaleCanvas(canvas);
          await upload(scaledCanvas, frameCount);
          frameCount++;
        }
      },
    };
  };