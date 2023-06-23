const Shader = (canvas, N) => {
  const context = canvas.getContext('2d');

  const workerCode = (()=>{
    let shadePixel;
    onmessage = (event) => {
      if (event.data.type == 'init') {
        let { funcString, width, height } = event.data;
        shadePixel = new Function('return ' + funcString)()(width, height);
        postMessage(true)
        return;
      }
      let { imageData, xStart, yStart } = event.data;

      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const x = xStart + (i / 4) % imageData.width;
        const y = yStart + Math.floor(i / 4 / imageData.width);
        const pixel = { r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3] };
        const newPixel = shadePixel({ x, y });
        data[i + 0] = newPixel.r;
        data[i + 1] = newPixel.g;
        data[i + 2] = newPixel.b;
        data[i + 3] = newPixel.a;
      }

      postMessage(imageData);
    };
  }).toString().slice(6, -4).split('\n').map(e=>e.slice(4)).join('\n');

  const splitImage = (ctx, N) => {
    const { canvas } = ctx;
    const { width, height } = canvas;
    
    const sections = [];
    
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const xStart = j * (width/N);
        const yStart = i * (height/N);
        const squareWidth = Math.min(width/N, width - xStart);
        const squareHeight = Math.min(height/N, height - yStart);

        const squareImageData = ctx.getImageData(xStart, yStart, squareWidth, squareHeight);

        sections.push({ imageData: squareImageData, xStart, yStart });
      }
    }

    return sections;
  };

  const shade = (func) => {
    
    let taskQueue = [];
    const workers = [...Array(navigator.hardwareConcurrency)].map(e => {
      const blob = new Blob([workerCode], { type: "text/javascript" });
      const workerUrl = URL.createObjectURL(blob);
      const worker = new Worker(workerUrl);
      let busy = false;
      let res;
      worker.onmessage = (event) => {
        res({ worker, imageData: event.data });
        if (taskQueue.length < 1) return;
        const task = taskQueue.shift();
        res = task.res;
        worker.postMessage(task.data);
      };
      return {
        init() {
          return new Promise((resolve, rej) => {
            res = resolve;
            worker.postMessage({
              type: 'init',
              funcString: func.toString(),
              width: canvas.width,
              height: canvas.height
            });
          })
        }
      }
    });
    
    const queue = (data) => new Promise((res, rej) => { taskQueue.push({ res, data }) });
    
    const sections = splitImage(context, N);

    return new Promise(async (resolve, reject) => {
      for (let { imageData, xStart, yStart } of sections) {
        queue({
          imageData,
          xStart, yStart,
        }).then((result) => {
          context.putImageData(result.imageData, xStart, yStart);
        })
      }
      for (const worker of workers) worker.init();
    });
  };

  return {
    shade
  };
};
