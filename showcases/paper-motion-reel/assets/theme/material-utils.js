export const clamp = (value, low = 0, high = 1) => Math.min(high, Math.max(low, value));
export const mix = (a, b, t) => a + (b - a) * t;
export const smooth = (t) => { const x = clamp(t); return x * x * (3 - 2 * x); };
export const out = (t) => 1 - (1 - clamp(t)) ** 3;

export function seeded(seed = 1879) {
  let state = Number(seed) >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let v = state;
    v = Math.imul(v ^ (v >>> 15), v | 1);
    v ^= v + Math.imul(v ^ (v >>> 7), v | 61);
    return ((v ^ (v >>> 14)) >>> 0) / 4294967296;
  };
}

export function prepare(canvas, options, fallbackDuration) {
  if (!(canvas instanceof HTMLCanvasElement)) throw new Error("paper editorial material component needs a canvas");
  const width = Math.round(options.width || canvas.clientWidth || 1920);
  const height = Math.round(options.height || canvas.clientHeight || 1080);
  const duration = Number(options.duration || fallbackDuration);
  if (!(width > 0 && height > 0 && duration > 0)) throw new Error("material dimensions and duration must be positive");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("material component could not acquire 2D context");
  return { canvas, ctx, width, height, duration };
}

export function boxIn(width, height, box = { x: .17, y: .2, width: .66, height: .58 }) {
  const b = { x: box.x * width, y: box.y * height,
    width: box.width * width, height: box.height * height };
  if (b.width <= 0 || b.height <= 0 || b.x < 0 || b.y < 0 ||
      b.x + b.width > width || b.y + b.height > height) {
    throw new Error("material box must fit inside its canvas");
  }
  return b;
}

export async function loadVisual(spec) {
  const source = typeof spec === "string" ? spec : spec?.src ||
    (spec?.markup ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(spec.markup)}` : null);
  if (!source) throw new Error("material image needs local src or SVG markup");
  const image = new Image();
  image.src = source;
  await image.decode();
  if (!image.naturalWidth || !image.naturalHeight) throw new Error("material image has no visible dimensions");
  return image;
}

export function contain(ctx, image, box, inset = 0) {
  const x = box.x + inset, y = box.y + inset;
  const w = box.width - inset * 2, h = box.height - inset * 2;
  const scale = Math.min(w / image.naturalWidth, h / image.naturalHeight);
  const dw = image.naturalWidth * scale, dh = image.naturalHeight * scale;
  ctx.drawImage(image, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}
