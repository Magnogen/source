const Shader = async (canvas, N, libs=[]) => {
  const context = canvas.getContext('2d');

  const workerCode = (()=>{
    
    {{LIBRARIES}}
    
    let shadePixel;

    onmessage = async (event) => {
      if (event.data.type === 'init') {
        let { funcString, width, height, params } = event.data;
        shadePixel = await new Function('return ' + funcString)()(width, height, params);
        postMessage(true);
        return;
      }

      let { imageData, xStart, yStart } = event.data;
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const newPixel = shadePixel({
          x: xStart + (i >> 2) % imageData.width,
          y: yStart + (i >> 2) / imageData.width,
          r: data[i],
          g: data[i + 1],
          b: data[i + 2],
          a: data[i + 3],
        });

        data[i] = newPixel.r;
        data[i + 1] = newPixel.g;
        data[i + 2] = newPixel.b;
        data[i + 3] = newPixel.a;
      }

      postMessage(imageData);
    };
  }).toString()
  .slice(6, -4)
  .split('\n')
  .map(e => e.slice(4))
  .join('\n')
  .replace(
    '{{LIBRARIES}}',
    (await Promise.all(
      libs.map(url =>
        fetch(url)
        .then(e=>e.text())
      )
    )).join('\n\n')
  );

  const splitImage = (ctx, N) => {
    const { canvas } = ctx;
    const { width, height } = canvas;
    const sections = [];

    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const xStart = j * Math.ceil(width / N);
        const yStart = i * Math.ceil(height / N);
        const squareWidth = Math.min(Math.ceil(width / N), width - xStart);
        const squareHeight = Math.min(Math.ceil(height / N), height - yStart);
        const squareImageData = ctx.getImageData(xStart, yStart, squareWidth, squareHeight);

        sections.push({ imageData: squareImageData, xStart, yStart });
      }
    }

    return sections;
  };

  const shade = (func, params = {}) => {
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
          return new Promise((resolve, reject) => {
            res = resolve;
            worker.postMessage({
              type: 'init',
              funcString: func.toString(),
              width: canvas.width,
              height: canvas.height,
              params
            });
          });
        }
      };
    });

    const queue = (data) => new Promise((resolve, reject) => {
      taskQueue.push({ res: resolve, data });
    });

    const sections = splitImage(context, N);
    let promises = [];

    for (let { imageData, xStart, yStart } of sections) {
      promises.push(
        queue({
          imageData,
          xStart,
          yStart,
        }).then((result) => {
          context.putImageData(result.imageData, xStart, yStart);
        })
      );
    }

    for (const worker of workers) {
      worker.init();
    }

    return Promise.all(promises);
  };

  return {
    shade
  };
};
