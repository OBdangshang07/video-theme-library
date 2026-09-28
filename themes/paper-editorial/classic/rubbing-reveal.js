import { boxIn, clamp, contain, loadVisual, prepare, seeded, smooth } from "../material-utils.js";

function rgb(hex) {
  const match = /^#?([\da-f]{6})$/i.exec(hex);
  if (!match) throw new Error("rubbing-reveal inkColor must be a six-digit hex color");
  const value = parseInt(match[1], 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

/** A pressure pad makes successive rubbing passes across a supplied visual. */
export async function createRubbingReveal(canvas, options = {}) {
  const base = prepare(canvas, options, 5.4);
  const { ctx, width, height, duration } = base;
  const box = boxIn(width, height, options.box || { x: .22, y: .16, width: .56, height: .67 });
  const visualSource = options.visual || options.target;
  if (!visualSource) throw new Error("rubbing-reveal needs visual src or SVG markup");
  const visual = await loadVisual(visualSource);
  const inkColor = options.inkColor || "#20262c";
  const [r, g, b] = rgb(inkColor);
  const density = clamp(Number(options.density ?? 1), .2, 1.8);
  const random = seeded(options.seed ?? 3841);
  const source = document.createElement("canvas");
  source.width = width; source.height = height;
  const sourceCtx = source.getContext("2d", { willReadFrequently: true });
  if (!sourceCtx) throw new Error("rubbing-reveal could not acquire source context");
  contain(sourceCtx, visual, box, 12);
  const sourceData = sourceCtx.getImageData(0, 0, width, height);
  const plate = document.createElement("canvas");
  plate.width = width; plate.height = height;
  const plateCtx = plate.getContext("2d");
  if (!plateCtx) throw new Error("rubbing-reveal could not acquire plate context");
  const out = plateCtx.createImageData(width, height);
  for (let i = 0; i < sourceData.data.length; i += 4) {
    const alpha = sourceData.data[i + 3] / 255;
    if (!alpha) continue;
    const light = (sourceData.data[i] * .2126 + sourceData.data[i + 1] * .7152 +
      sourceData.data[i + 2] * .0722) / 255;
    const grain = .56 + random() * .44;
    const strength = clamp(alpha * Math.pow(1 - light, .72) * grain * density);
    out.data[i] = r; out.data[i + 1] = g; out.data[i + 2] = b;
    out.data[i + 3] = Math.round(strength * 255);
  }
  plateCtx.putImageData(out, 0, 0);
  const mask = document.createElement("canvas");
  mask.width = width; mask.height = height;
  const maskCtx = mask.getContext("2d");
  const work = document.createElement("canvas");
  work.width = width; work.height = height;
  const workCtx = work.getContext("2d");
  if (!maskCtx || !workCtx) throw new Error("rubbing-reveal could not acquire working contexts");

  function render(localTime) {
    const t = clamp(Number(localTime) || 0, 0, duration);
    const progress = clamp(t / (duration * .8));
    ctx.clearRect(0, 0, width, height);
    maskCtx.clearRect(0, 0, width, height);
    maskCtx.strokeStyle = "#000";
    maskCtx.lineWidth = box.height * .35;
    maskCtx.lineCap = "round"; maskCtx.lineJoin = "round";
    let pad = null;
    for (let pass = 0; pass < 4; pass++) {
      const u = smooth((progress - pass * .18) / .46);
      if (u <= 0) continue;
      const fromX = pass % 2 ? box.x + box.width + 40 : box.x - 40;
      const toX = pass % 2 ? box.x - 40 : box.x + box.width + 40;
      const yBase = box.y + box.height * (.13 + pass * .245);
      const steps = Math.max(1, Math.ceil(u * 60));
      maskCtx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const f = (i / steps) * u;
        const x = fromX + (toX - fromX) * f;
        const y = yBase + Math.sin(f * Math.PI * 2 + pass * 1.3) * box.height * .018;
        if (i) maskCtx.lineTo(x, y); else maskCtx.moveTo(x, y);
      }
      maskCtx.stroke();
      if (u < 1) pad = { x: fromX + (toX - fromX) * u,
        y: yBase + Math.sin(u * Math.PI * 2 + pass * 1.3) * box.height * .018,
        direction: pass % 2 ? -1 : 1 };
    }
    workCtx.clearRect(0, 0, width, height);
    workCtx.globalCompositeOperation = "source-over";
    workCtx.drawImage(plate, 0, 0);
    workCtx.globalCompositeOperation = "destination-in";
    workCtx.drawImage(mask, 0, 0);
    workCtx.globalCompositeOperation = "source-over";
    ctx.drawImage(work, 0, 0);
    if (pad && progress < 1) {
      ctx.save();
      ctx.translate(pad.x, pad.y);
      ctx.rotate(pad.direction * -.12);
      ctx.shadowColor = "rgba(32,38,44,.3)";
      ctx.shadowBlur = 27; ctx.shadowOffsetY = 15;
      const gradient = ctx.createRadialGradient(-14, -16, 7, 0, 0, 72);
      gradient.addColorStop(0, "#b7aa91");
      gradient.addColorStop(.55, "#797469");
      gradient.addColorStop(.88, "#343839");
      gradient.addColorStop(1, "#252a2b");
      ctx.fillStyle = gradient;
      ctx.beginPath(); ctx.ellipse(0, 0, 77, 61, 0, 0, Math.PI * 2); ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.strokeStyle = "rgba(238,226,203,.53)"; ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const angle = i * Math.PI / 4;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * 15, Math.sin(angle) * 12);
        ctx.quadraticCurveTo(Math.cos(angle + .17) * 42,
          Math.sin(angle + .17) * 33,
          Math.cos(angle) * 68, Math.sin(angle) * 52);
        ctx.stroke();
      }
      ctx.fillStyle = "#343839";
      ctx.beginPath(); ctx.ellipse(0, 0, 17, 13, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }
  render(0);
  return { ...base, visual, render };
}
