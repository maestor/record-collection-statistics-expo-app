import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";

const APP_BLUE = { r: 7, g: 90, b: 152, a: 255 };
const HALO_BLUE = { r: 20, g: 123, b: 201, a: 255 };
const ICON_SIZE = 1024;
const FAVICON_SIZE = 48;

const sourcePath = process.argv[2];

if (!sourcePath) {
  throw new Error("Usage: node scripts/generate-brand-assets.mjs <foreground-source>");
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const loadPng = (filePath) => PNG.sync.read(fs.readFileSync(filePath));

const savePng = (filePath, image) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, PNG.sync.write(image));
};

const toHsv = (r, g, b) => {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  let hue = 0;

  if (delta !== 0) {
    switch (max) {
      case red:
        hue = ((green - blue) / delta) % 6;
        break;
      case green:
        hue = (blue - red) / delta + 2;
        break;
      default:
        hue = (red - green) / delta + 4;
        break;
    }
  }

  return {
    h: (hue * 60 + 360) % 360,
    s: max === 0 ? 0 : delta / max,
    v: max,
  };
};

const readPixel = (image, x, y) => {
  const index = (image.width * y + x) * 4;

  return {
    r: image.data[index],
    g: image.data[index + 1],
    b: image.data[index + 2],
    a: image.data[index + 3],
  };
};

const writePixel = (image, x, y, color) => {
  const index = (image.width * y + x) * 4;
  image.data[index] = color.r;
  image.data[index + 1] = color.g;
  image.data[index + 2] = color.b;
  image.data[index + 3] = color.a;
};

const isMagentaBackground = (pixel) => {
  if (pixel.a === 0) {
    return false;
  }

  const { h, s, v } = toHsv(pixel.r, pixel.g, pixel.b);
  const magentaHue = h >= 275 || h <= 15;

  return magentaHue && s >= 0.45 && v >= 0.35;
};

const isLooseMagenta = (pixel) => {
  if (pixel.a === 0) {
    return false;
  }

  const { h, s, v } = toHsv(pixel.r, pixel.g, pixel.b);
  const magentaHue = h >= 260 || h <= 25;

  return magentaHue && s >= 0.2 && v >= 0.25;
};

const extractForeground = (sourceImage) => {
  const mask = new Uint8Array(sourceImage.width * sourceImage.height);
  const queue = [];
  let head = 0;

  const pushIfBackground = (x, y) => {
    const position = y * sourceImage.width + x;

    if (mask[position] !== 0) {
      return;
    }

    if (!isMagentaBackground(readPixel(sourceImage, x, y))) {
      return;
    }

    mask[position] = 1;
    queue.push(position);
  };

  for (let x = 0; x < sourceImage.width; x += 1) {
    pushIfBackground(x, 0);
    pushIfBackground(x, sourceImage.height - 1);
  }

  for (let y = 0; y < sourceImage.height; y += 1) {
    pushIfBackground(0, y);
    pushIfBackground(sourceImage.width - 1, y);
  }

  while (head < queue.length) {
    const position = queue[head];
    head += 1;
    const x = position % sourceImage.width;
    const y = Math.floor(position / sourceImage.width);

    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nextX = x + dx;
      const nextY = y + dy;

      if (
        nextX < 0 ||
        nextY < 0 ||
        nextX >= sourceImage.width ||
        nextY >= sourceImage.height
      ) {
        continue;
      }

      pushIfBackground(nextX, nextY);
    }
  }

  const foreground = new PNG({
    width: sourceImage.width,
    height: sourceImage.height,
  });

  let minX = sourceImage.width;
  let minY = sourceImage.height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < sourceImage.height; y += 1) {
    for (let x = 0; x < sourceImage.width; x += 1) {
      const position = y * sourceImage.width + x;
      const pixel = readPixel(sourceImage, x, y);

      if (mask[position] === 1) {
        writePixel(foreground, x, y, { r: 0, g: 0, b: 0, a: 0 });
        continue;
      }

      let alpha = pixel.a;

      if (isLooseMagenta(pixel)) {
        const neighbors = [
          [x - 1, y],
          [x + 1, y],
          [x, y - 1],
          [x, y + 1],
          [x - 1, y - 1],
          [x + 1, y - 1],
          [x - 1, y + 1],
          [x + 1, y + 1],
        ];
        const backgroundNeighbors = neighbors.filter(([neighborX, neighborY]) => {
          if (
            neighborX < 0 ||
            neighborY < 0 ||
            neighborX >= sourceImage.width ||
            neighborY >= sourceImage.height
          ) {
            return true;
          }

          return mask[neighborY * sourceImage.width + neighborX] === 1;
        }).length;

        alpha = clamp(255 - backgroundNeighbors * 36, 0, 255);
      }

      writePixel(foreground, x, y, {
        r: pixel.r,
        g: pixel.g,
        b: pixel.b,
        a: alpha,
      });

      if (alpha > 0) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  return {
    foreground,
    bounds: { minX, minY, maxX, maxY },
  };
};

const cropImage = (image, bounds, margin) => {
  const left = clamp(bounds.minX - margin, 0, image.width - 1);
  const top = clamp(bounds.minY - margin, 0, image.height - 1);
  const right = clamp(bounds.maxX + margin, 0, image.width - 1);
  const bottom = clamp(bounds.maxY + margin, 0, image.height - 1);
  const width = right - left + 1;
  const height = bottom - top + 1;
  const cropped = new PNG({ width, height });

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      writePixel(cropped, x, y, readPixel(image, left + x, top + y));
    }
  }

  return cropped;
};

const sampleBilinear = (image, x, y) => {
  const clampedX = clamp(x, 0, image.width - 1);
  const clampedY = clamp(y, 0, image.height - 1);
  const x0 = Math.floor(clampedX);
  const y0 = Math.floor(clampedY);
  const x1 = Math.min(x0 + 1, image.width - 1);
  const y1 = Math.min(y0 + 1, image.height - 1);
  const tx = clampedX - x0;
  const ty = clampedY - y0;
  const topLeft = readPixel(image, x0, y0);
  const topRight = readPixel(image, x1, y0);
  const bottomLeft = readPixel(image, x0, y1);
  const bottomRight = readPixel(image, x1, y1);
  const channels = ["r", "g", "b", "a"];
  const color = { r: 0, g: 0, b: 0, a: 0 };

  for (const channel of channels) {
    const top = topLeft[channel] * (1 - tx) + topRight[channel] * tx;
    const bottom = bottomLeft[channel] * (1 - tx) + bottomRight[channel] * tx;
    color[channel] = Math.round(top * (1 - ty) + bottom * ty);
  }

  return color;
};

const resizeImage = (image, targetWidth, targetHeight) => {
  const resized = new PNG({ width: targetWidth, height: targetHeight });
  const scaleX = image.width / targetWidth;
  const scaleY = image.height / targetHeight;

  for (let y = 0; y < targetHeight; y += 1) {
    for (let x = 0; x < targetWidth; x += 1) {
      writePixel(
        resized,
        x,
        y,
        sampleBilinear(image, (x + 0.5) * scaleX - 0.5, (y + 0.5) * scaleY - 0.5),
      );
    }
  }

  return resized;
};

const createCanvas = (width, height, fill) => {
  const canvas = new PNG({ width, height });

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      writePixel(canvas, x, y, fill);
    }
  }

  return canvas;
};

const createBlueIconCanvas = () => {
  const canvas = new PNG({ width: ICON_SIZE, height: ICON_SIZE });
  const center = ICON_SIZE / 2;
  const maxDistance = Math.sqrt(center ** 2 + center ** 2);

  for (let y = 0; y < ICON_SIZE; y += 1) {
    for (let x = 0; x < ICON_SIZE; x += 1) {
      const dx = x - center;
      const dy = y - center;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const halo = clamp(1 - distance / maxDistance, 0, 1) ** 1.8;

      writePixel(canvas, x, y, {
        r: Math.round(APP_BLUE.r + (HALO_BLUE.r - APP_BLUE.r) * halo * 0.8),
        g: Math.round(APP_BLUE.g + (HALO_BLUE.g - APP_BLUE.g) * halo * 0.8),
        b: Math.round(APP_BLUE.b + (HALO_BLUE.b - APP_BLUE.b) * halo * 0.8),
        a: 255,
      });
    }
  }

  return canvas;
};

const alphaBlend = (bottom, top) => {
  const topAlpha = top.a / 255;
  const bottomAlpha = bottom.a / 255;
  const outputAlpha = topAlpha + bottomAlpha * (1 - topAlpha);

  if (outputAlpha === 0) {
    return { r: 0, g: 0, b: 0, a: 0 };
  }

  return {
    r: Math.round(
      (top.r * topAlpha + bottom.r * bottomAlpha * (1 - topAlpha)) / outputAlpha,
    ),
    g: Math.round(
      (top.g * topAlpha + bottom.g * bottomAlpha * (1 - topAlpha)) / outputAlpha,
    ),
    b: Math.round(
      (top.b * topAlpha + bottom.b * bottomAlpha * (1 - topAlpha)) / outputAlpha,
    ),
    a: Math.round(outputAlpha * 255),
  };
};

const drawCentered = (canvas, image, maxSize) => {
  const scale = Math.min(maxSize / image.width, maxSize / image.height);
  const targetWidth = Math.round(image.width * scale);
  const targetHeight = Math.round(image.height * scale);
  const resized = resizeImage(image, targetWidth, targetHeight);
  const offsetX = Math.round((canvas.width - targetWidth) / 2);
  const offsetY = Math.round((canvas.height - targetHeight) / 2);

  for (let y = 0; y < targetHeight; y += 1) {
    for (let x = 0; x < targetWidth; x += 1) {
      const base = readPixel(canvas, offsetX + x, offsetY + y);
      const top = readPixel(resized, x, y);
      writePixel(canvas, offsetX + x, offsetY + y, alphaBlend(base, top));
    }
  }
};

const sourceImage = loadPng(sourcePath);
const { foreground, bounds } = extractForeground(sourceImage);
const croppedForeground = cropImage(foreground, bounds, 16);

const adaptiveForeground = createCanvas(ICON_SIZE, ICON_SIZE, {
  r: 0,
  g: 0,
  b: 0,
  a: 0,
});
drawCentered(adaptiveForeground, croppedForeground, 760);

const splashImage = createCanvas(ICON_SIZE, ICON_SIZE, {
  r: 0,
  g: 0,
  b: 0,
  a: 0,
});
drawCentered(splashImage, croppedForeground, 620);

const iconImage = createBlueIconCanvas();
drawCentered(iconImage, croppedForeground, 720);

const faviconImage = resizeImage(iconImage, FAVICON_SIZE, FAVICON_SIZE);

savePng("assets/adaptive-icon-foreground.png", adaptiveForeground);
savePng("assets/splash-icon.png", splashImage);
savePng("assets/icon.png", iconImage);
savePng("assets/favicon.png", faviconImage);
