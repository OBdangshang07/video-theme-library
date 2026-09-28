// Seek-safe version of the ink field in conceptual-creative-portfolio-design.
// A frame is rebuilt from its local time; no playback state or browser input is read.
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const mix = (a, b, t) => a + (b - a) * t;
const ease = (t) => t * t * (3 - 2 * t);

function randomFrom(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function targetBox(width, height, box) {
  const b = box || { x: 0.18, y: 0.14, width: 0.64, height: 0.72 };
  return {
    x: b.x * width, y: b.y * height,
    width: b.width * width, height: b.height * height,
  };
}

async function paintTarget(ctx, target, box) {
  if (!target || !["text", "image", "svg"].includes(target.kind)) {
    throw new Error("ink-form target.kind must be text, image, or svg");
  }
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  if (target.kind === "text") {
    const lines = String(target.value || "").split("\n");
    if (!lines.some((line) => line.trim())) throw new Error("ink-form text is empty");
    const family = target.fontFamily || '"Paper Ink Form Serif", serif';
    const weight = target.fontWeight || 900;
    let size = Math.min(box.height / (lines.length * 1.14), box.width * 0.9);
    if (document.fonts) await document.fonts.load(`${weight} ${Math.max(12, Math.floor(size))}px ${family}`);
    ctx.font = `${weight} ${size}px ${family}`;
    const widest = Math.max(...lines.map((line) => ctx.measureText(line).width));
    if (widest > box.width * 0.96) {
      size *= box.width * 0.96 / widest;
      ctx.font = `${weight} ${size}px ${family}`;
    }
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    lines.forEach((line, i) => ctx.fillText(
      line, box.x + box.width / 2,
      box.y + box.height / 2 + (i - (lines.length - 1) / 2) * size * 1.14,
    ));
    return;
  }
  const source = target.kind === "svg"
    ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(target.markup || "")}`
    : target.src;
  if (!source) throw new Error("ink-form image source is empty");
  const image = new Image();
  image.src = source;
  await image.decode();
  const scale = Math.min(box.width / image.naturalWidth, box.height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  ctx.drawImage(image, box.x + (box.width - drawWidth) / 2,
    box.y + (box.height - drawHeight) / 2, drawWidth, drawHeight);
}

function sampleTarget(ctx, box, step, random, maskMode = "alpha") {
  const { width, height } = ctx.canvas;
  const pixels = ctx.getImageData(0, 0, width, height).data;
  const points = [];
  const left = Math.max(0, Math.floor(box.x));
  const top = Math.max(0, Math.floor(box.y));
  const right = Math.min(width, Math.ceil(box.x + box.width));
  const bottom = Math.min(height, Math.ceil(box.y + box.height));
  for (let y = top; y < bottom; y += step) {
    for (let x = left; x < right; x += step) {
      const index = (y * width + x) * 4;
      const alpha = pixels[index + 3];
      const luminance = .2126 * pixels[index] + .7152 * pixels[index + 1]
        + .0722 * pixels[index + 2];
      if (alpha > 96 && (maskMode !== "dark" || luminance < 165)) points.push([x, y]);
    }
  }
  if (!points.length) throw new Error("ink-form target has no visible alpha inside its box");
  for (let i = points.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [points[i], points[j]] = [points[j], points[i]];
  }
  return points;
}

function makeParticle(index, count, width, height, box, point, random, detail = false) {
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const angle = (index / count) * Math.PI * 6 + random() * 0.16;
  const scatterAngle = random() * Math.PI * 2;
  const scatterRadius = Math.min(width, height) * mix(0.18, 0.68, random());
  return {
    sx: random() * width, sy: random() * height,
    dx: cx + Math.cos(scatterAngle) * scatterRadius,
    dy: cy + Math.sin(scatterAngle) * scatterRadius,
    angle, ringRadius: Math.min(box.width, box.height) * mix(0.28, 0.38, random()),
    tx: point?.[0] ?? 0, ty: point?.[1] ?? 0, active: !!point, detail,
    phase: random() * Math.PI * 2, speed: mix(0.65, 1.35, random()),
    release: random(),
    red: random() < 0.025,
  };
}

/**
 * Prepare a reusable ink field. Call render(seconds) with absolute local time.
 * Text uses the shipped/local font; image uses alpha by default, or
 * target.maskMode="dark" for a dark mark on a light image;
 * svg accepts inline markup. The mask is sampled once before the timeline binds.
 */
export async function createInkForm(canvas, options = {}) {
  if (!(canvas instanceof HTMLCanvasElement)) throw new Error("ink-form needs a canvas");
  const width = Math.round(options.width || canvas.clientWidth || 1920);
  const height = Math.round(options.height || canvas.clientHeight || 1080);
  const duration = Number(options.duration || 4.8);
  if (!(width > 0 && height > 0 && duration > 0)) throw new Error("ink-form dimensions and duration must be positive");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("ink-form could not acquire 2D canvas context");
  const mask = document.createElement("canvas");
  mask.width = width; mask.height = height;
  const maskContext = mask.getContext("2d", { willReadFrequently: true });
  if (!maskContext) throw new Error("ink-form could not acquire mask context");
  const box = targetBox(width, height, options.box);
  await paintTarget(maskContext, options.target, box);
  const random = randomFrom(options.seed ?? 1879);
  const sampleStep = Math.max(2, Math.round(options.sampleStep || Math.min(width, height) / 270));
  const points = sampleTarget(maskContext, box, sampleStep, random,
    options.target?.maskMode);
  const count = clamp(Math.round(options.particleCount || width * height / 180), 300, 14000);
  const ringCount = Math.min(count, Math.max(300,
    Math.round(options.ringParticleCount || Math.min(width * height / 420, 3200))));
  const ringActiveCount = Math.floor(ringCount * 0.9);
  const particles = Array.from({ length: count }, (_, index) => {
    const detail = index >= ringCount;
    const pointIndex = detail ? ringActiveCount + index - ringCount : index;
    const point = !detail && index >= ringActiveCount
      ? null : points[pointIndex % points.length];
    return makeParticle(detail ? index - ringCount : index,
      detail ? count - ringCount : ringCount,
      width, height, box, point, random, detail);
  });
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const stirEnd = duration * 0.2;
  const ringEnd = duration * 0.5;
  const formEnd = duration * 0.82;
  const looseInkEnd = ringEnd + Math.min(duration * 0.18, 0.9);
  const inkColor = options.inkColor || "#20262c";
  const redColor = options.redColor || "#b83b2f";
  const strokeWidth = Number(options.strokeWidth || 1.1);
  const exitStart = options.exitScatterStart == null ? null : Number(options.exitScatterStart);
  const exitDistance = Number(options.exitScatterDistance || 170);
  if (exitStart != null && (!(exitStart > formEnd) || !(exitStart < duration))) {
    throw new Error("ink-form exitScatterStart must be after formation and before duration");
  }

  function free(p, time) {
    return [p.sx + Math.sin(time * p.speed * 1.4 + p.phase) * 20,
      p.sy + Math.cos(time * p.speed * 1.1 + p.phase) * 17];
  }
  function scatter(p, time) {
    return [p.dx + Math.sin(time * 4 + p.phase) * 22,
      p.dy + Math.cos(time * 3.5 + p.phase) * 18];
  }
  function ring(p, time) {
    const angle = p.angle + time * 1.3;
    return [cx + Math.cos(angle) * p.ringRadius,
      cy + Math.sin(angle) * p.ringRadius];
  }
  function position(p, time) {
    const t = clamp(time, 0, duration);
    if (t <= stirEnd) {
      const a = free(p, t), b = scatter(p, t);
      const k = ease(t / stirEnd);
      return [mix(a[0], b[0], k), mix(a[1], b[1], k)];
    }
    if (t <= ringEnd) {
      const a = scatter(p, t), b = ring(p, t);
      const u = (t - stirEnd) / (ringEnd - stirEnd);
      const k = 1 - Math.pow(1 - u, 3);
      return [mix(a[0], b[0], k), mix(a[1], b[1], k)];
    }
    const a = ring(p, ringEnd);
    if (!p.active) {
      const dt = t - ringEnd;
      const drift = Math.min(width, height) * 0.025 * dt;
      const angle = p.angle + ringEnd * 1.3 + dt * 0.6;
      return [a[0] + Math.cos(angle) * drift,
        a[1] + Math.sin(angle) * drift];
    }
    if (t <= formEnd) {
      const u = (t - ringEnd) / (formEnd - ringEnd);
      const k = 1 - Math.pow(1 - u, 3);
      const swirl = Math.sin(Math.PI * u) * (1 - u) * 34;
      return [mix(a[0], p.tx, k) + Math.cos(p.angle + Math.PI / 2) * swirl,
        mix(a[1], p.ty, k) + Math.sin(p.angle + Math.PI / 2) * swirl];
    }
    const breath = Math.sin((t - formEnd) * 3 + p.phase) * 1.2;
    if (exitStart != null && t >= exitStart) {
      const u = ease(clamp((t - exitStart) / (duration - exitStart), 0, 1));
      // Let each fleck loosen from the contour instead of drawing a radial burst.
      const angle = Math.atan2(p.ty - cy, p.tx - cx) + Math.sin(p.phase) * 1.65;
      const distance = exitDistance * mix(.55, 1.35, p.release) * u;
      return [p.tx + breath + Math.cos(angle) * distance,
        p.ty + Math.cos((t - formEnd) * 2.8 + p.phase) * 1.2 + Math.sin(angle) * distance];
    }
    return [p.tx + breath, p.ty + Math.cos((t - formEnd) * 2.8 + p.phase) * 1.2];
  }

  function render(localTime) {
    const time = clamp(Number(localTime) || 0, 0, duration);
    const exitProgress = exitStart == null ? 0 :
      ease(clamp((time - exitStart) / (duration - exitStart), 0, 1));
    const exitFade = 1 - exitProgress;
    ctx.clearRect(0, 0, width, height);
    const layers = [[0.34, 0.035], [0.24, 0.055], [0.16, 0.075],
      [0.1, 0.1], [0.05, 0.14], [0, 0.62]];
    for (const [age, opacity] of layers) {
      if (time < age) continue;
      // Collapse the aged ink impressions as the mark dissolves. Otherwise
      // each impression sits behind the moving fleck and reads as a long spike.
      const at = time - age * (1 - exitProgress * .8);
      for (const red of [false, true]) {
        ctx.beginPath();
        for (const p of particles) {
          if (p.red !== red) continue;
          // Extra strokes enter only as the ring becomes the target, keeping
          // the loading circle's original density while filling the final form.
          if (p.detail && (age > 0 || at < ringEnd
            + (formEnd - ringEnd) * 0.75 * p.release)) continue;
          // The flecks outside the target dissolve during formation instead of
          // leaving a visible lower ring after the lettering has settled.
          if (!p.active && at >= ringEnd + (looseInkEnd - ringEnd) * p.release) continue;
          const [x, y] = position(p, at);
          const [px, py] = position(p, Math.max(0, at - 1 / 60));
          let angle = Math.atan2(y - py, x - px);
          let length = Math.min(18, 2.4 + Math.hypot(x - px, y - py) * 2.1);
          if (exitProgress > 0) length = mix(Math.min(length, 6), 2.2, exitProgress);
          if (at < stirEnd * 0.8) {
            const field = (Math.sin(x * 0.0021 + at * 3)
              + Math.cos(y * 0.0027 - at * 2.1)
              + Math.sin((x + y) * 0.0011 + at)) * 1.9;
            const blend = 1 - ease(at / (stirEnd * 0.8));
            angle = Math.atan2(mix(Math.sin(angle), Math.sin(field), blend),
              mix(Math.cos(angle), Math.cos(field), blend));
            length = Math.max(length, (4 + p.speed * 6) * blend);
          }
          const dx = Math.cos(angle) * length / 2;
          const dy = Math.sin(angle) * length / 2;
          ctx.moveTo(x - dx, y - dy);
          ctx.lineTo(x + dx, y + dy);
        }
        ctx.globalAlpha = (red ? opacity * 1.2 : opacity) * exitFade;
        ctx.strokeStyle = red ? redColor : inkColor;
        const formed = ease(clamp((at - ringEnd) / (formEnd - ringEnd), 0, 1));
        ctx.lineWidth = (red ? strokeWidth * 1.45 : strokeWidth) * mix(1, 1.35, formed);
        ctx.lineCap = "round";
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }
  render(0);
  return { canvas, width, height, duration, particleCount: count, render };
}
