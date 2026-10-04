const TFJS_URL = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.17.0/dist/tf.min.js';
const COCO_SSD_URL = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js';

let modelPromise = null;

async function chooseBackend() {
  for (const backend of ['webgl', 'cpu']) {
    try {
      if (await tf.setBackend(backend)) {
        await tf.ready();
        return backend;
      }
    } catch {
      continue;
    }
  }
  throw new Error('No TensorFlow backend available');
}

function loadModel() {
  if (!modelPromise) {
    modelPromise = (async () => {
      importScripts(TFJS_URL, COCO_SSD_URL);
      const backend = await chooseBackend();
      const model = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
      return { model, backend };
    })();
    modelPromise.catch(() => {
      modelPromise = null;
    });
  }
  return modelPromise;
}

async function pixelsFromSource(source, maxSide) {
  const blob = await (await fetch(source)).blob();
  const bitmap = await createImageBitmap(blob);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return { scale, imageData: context.getImageData(0, 0, width, height) };
}

self.onmessage = async ({ data }) => {
  const { id, source, maxSide } = data;
  let input = null;
  try {
    const [{ model, backend }, { scale, imageData }] = await Promise.all([loadModel(), pixelsFromSource(source, maxSide)]);
    input = tf.browser.fromPixels(imageData);
    const detections = (await model.detect(input, 20, 0.45)).map((detection) => ({
      ...detection,
      bbox: detection.bbox.map((value) => value / scale),
    }));
    self.postMessage({ id, detections, backend });
  } catch (error) {
    self.postMessage({ id, error: String((error && error.message) || error) });
  } finally {
    if (input) input.dispose();
  }
};
