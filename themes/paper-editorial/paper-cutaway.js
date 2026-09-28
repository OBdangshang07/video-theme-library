import { boxIn, clamp, contain, loadVisual, mix, prepare, seeded, smooth } from "./material-utils.js";
import { edgeProfile, makeCanvas } from "./paper-kit.js";

// Clip a convex polygon to the half-plane dot(p − origin, n) ≥ 0 (Sutherland–Hodgman).
function clipHalf(poly, origin, n) {
  const side = (p) => (p[0] - origin[0]) * n[0] + (p[1] - origin[1]) * n[1];
  const res = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length], sa = side(a), sb = side(b);
    if (sa >= 0) res.push(a);
    if ((sa >= 0) !== (sb >= 0)) { const k = sa / (sa - sb); res.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]); }
  }
  return res;
}
const trace = (ctx, poly) => { ctx.beginPath(); poly.forEach((p, i) => ctx[i ? "lineTo" : "moveTo"](p[0], p[1])); ctx.closePath(); };

/**
 * 纸层剖视 — aligned sheets of evidence peeled one by one.
 * Each sheet is peeled from its top-right corner along a travelling fold line: the peeled part
 * flips over and lies across the sheet, showing its paper back (with the front faintly showing
 * through, mirrored), shaded by its curl and casting a soft shadow. The next sheet sits
 * registered underneath and brightens as it is uncovered. render(t) is a pure function of t.
 */
export async function createPaperCutaway(canvas, options = {}) {
  const base = prepare(canvas, options, 6.6);
  const { ctx, width, height, duration } = base;
  const layers = options.layers || [];
  if (layers.length < 2 || layers.length > 4) throw new Error("paper-cutaway needs 2–4 layers");
  const box = boxIn(width, height, options.box || { x: .19, y: .16, width: .62, height: .67 });
  const images = await Promise.all(layers.map((layer) => loadVisual(layer.visual || layer)));
  const paper = options.paperColor || "#efe5ce";
  const ink = options.inkColor || "#20262c";
  const red = options.redColor || "#b83b2f";
  const seed = options.seed ?? 5209;
  const random = seeded(seed);
  const k = Math.min(box.width, box.height) / 720;
  const deckle = edgeProfile(seed + 1, 7, 140);

  const sheets = images.map((image, index) => {
    const sheet = makeCanvas(width, height), pen = sheet.getContext("2d");
    pen.fillStyle = paper; pen.fillRect(box.x, box.y, box.width, box.height);
    const fibres = seeded(seed + 17 + index);
    for (let i = 0; i < 520; i++) {
      const x = box.x + fibres() * box.width, y = box.y + fibres() * box.height, len = (4 + fibres() * 18) * k, a = fibres() * Math.PI;
      pen.strokeStyle = `rgba(130,108,76,${(.05 + fibres() * .08).toFixed(3)})`; pen.lineWidth = .7 * k;
      pen.beginPath(); pen.moveTo(x, y); pen.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len); pen.stroke();
    }
    pen.strokeStyle = "#aa9f88"; pen.lineWidth = 2 * k;
    pen.strokeRect(box.x + k, box.y + k, box.width - 2 * k, box.height - 2 * k);
    pen.strokeStyle = "rgba(32,38,44,.24)"; pen.lineWidth = k;
    pen.beginPath(); pen.moveTo(box.x + 42 * k, box.y + 105 * k); pen.lineTo(box.x + box.width - 42 * k, box.y + 105 * k); pen.stroke();
    contain(pen, image, { x: box.x + 60 * k, y: box.y + 132 * k, width: box.width - 120 * k, height: box.height - 215 * k });
    pen.fillStyle = ink; pen.font = `700 ${25 * k}px "Source Han Sans SC", "Microsoft YaHei", sans-serif`;
    pen.textAlign = "left"; pen.textBaseline = "middle";
    pen.fillText(String(layers[index].label || `第 ${index + 1} 层`).slice(0, 36), box.x + 44 * k, box.y + 61 * k);
    pen.fillStyle = red; pen.font = `700 ${25 * k}px "JetBrains Mono", monospace`; pen.textAlign = "right";
    pen.fillText(`${String(index + 1).padStart(2, "0")} / ${String(layers.length).padStart(2, "0")}`, box.x + box.width - 44 * k, box.y + 61 * k);
    pen.fillStyle = "#68645b"; pen.font = `500 ${20 * k}px "JetBrains Mono", monospace`; pen.textAlign = "left";
    pen.fillText(String(layers[index].caption || "PAPER LAYER / EVIDENCE"), box.x + 44 * k, box.y + box.height - 48 * k);
    // Registration pin holes punched through every sheet at the same spot.
    for (const [px, py] of [[box.x + 22 * k, box.y + box.height / 2], [box.x + box.width - 22 * k, box.y + box.height / 2]]) {
      pen.fillStyle = "rgba(40,32,22,.55)"; pen.beginPath(); pen.arc(px, py, 5 * k, 0, Math.PI * 2); pen.fill();
      pen.fillStyle = "rgba(255,250,236,.6)"; pen.beginPath(); pen.arc(px + k, py + k, 5 * k, Math.PI * .1, Math.PI * .9); pen.fill();
    }
    return sheet;
  });
  // Paper back: plain fibre with a faint mirrored show-through added per frame.
  const back = makeCanvas(width, height), bpen = back.getContext("2d");
  bpen.fillStyle = "#f4ecd9"; bpen.fillRect(0, 0, width, height);
  for (let i = 0; i < 700; i++) {
    const x = random() * width, y = random() * height, len = (4 + random() * 16) * k, a = random() * Math.PI;
    bpen.strokeStyle = `rgba(150,126,90,${(.05 + random() * .07).toFixed(3)})`; bpen.lineWidth = .7 * k;
    bpen.beginPath(); bpen.moveTo(x, y); bpen.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len); bpen.stroke();
  }

  const rect = [[box.x, box.y], [box.x + box.width, box.y], [box.x + box.width, box.y + box.height], [box.x, box.y + box.height]];
  const corner = [box.x + box.width, box.y];
  const diag = Math.hypot(box.width, box.height);

  function peel(index, u, variant) {
    // Fold direction: from the top-right corner toward bottom-left, varied a little per sheet.
    const angle = Math.atan2(box.height, -box.width) + (variant - .5) * .25;
    const d = [Math.cos(angle), Math.sin(angle)];
    // Fold point P travels from the corner past the far corner; the flipped corner moves twice as fast.
    const P = [corner[0] + d[0] * diag * 1.08 * u, corner[1] + d[1] * diag * 1.08 * u];
    const flat = clipHalf(rect, P, d);                       // still lying down
    const lifted = clipHalf(rect, P, [-d[0], -d[1]]);        // peeled part, before reflection
    const reflect = (p) => { const s = (p[0] - P[0]) * d[0] + (p[1] - P[1]) * d[1]; return [p[0] - 2 * s * d[0], p[1] - 2 * s * d[1]]; };
    const flap = lifted.map(reflect);
    // Next sheet, darkened where it is still covered.
    ctx.drawImage(sheets[index + 1], 0, 0);
    ctx.fillStyle = `rgba(32,26,18,${(.14 * (1 - u)).toFixed(3)})`; trace(ctx, rect); ctx.fill();
    // The part of the current sheet still lying flat.
    if (flat.length > 2) { ctx.save(); trace(ctx, flat); ctx.clip(); ctx.drawImage(sheets[index], 0, 0); ctx.restore(); }
    if (flap.length > 2) {
      const fade = 1 - smooth((u - .78) / .22);
      ctx.save(); ctx.globalAlpha = fade;
      // Shadow the flap throws on whatever is beneath it.
      ctx.shadowColor = "rgba(30,22,12,.34)"; ctx.shadowBlur = 30 * k; ctx.shadowOffsetX = -d[0] * 14 * k; ctx.shadowOffsetY = -d[1] * 14 * k;
      trace(ctx, flap); ctx.fillStyle = "#efe5cf"; ctx.fill();
      ctx.shadowColor = "transparent";
      trace(ctx, flap); ctx.clip();
      ctx.drawImage(back, 0, 0);
      // Show-through: the printed front, mirrored across the fold, faintly visible from behind.
      ctx.save();
      const [nx, ny] = d, a = 1 - 2 * nx * nx, b = -2 * nx * ny, c = -2 * nx * ny, e = 1 - 2 * ny * ny;
      const dot = P[0] * nx + P[1] * ny;
      ctx.transform(a, b, c, e, 2 * dot * nx, 2 * dot * ny);
      ctx.globalAlpha = .1 * fade; ctx.drawImage(sheets[index], 0, 0);
      ctx.restore();
      // Curl shading: dark crease at the fold, a highlight where the sheet bends toward the light.
      const far = diag * .5;
      // The flap lies on the +d side of the fold (it was reflected across it).
      const g = ctx.createLinearGradient(P[0], P[1], P[0] + d[0] * far, P[1] + d[1] * far);
      g.addColorStop(0, "rgba(96,76,48,.34)"); g.addColorStop(.06, "rgba(150,126,90,.12)");
      g.addColorStop(.16, "rgba(255,252,242,.5)"); g.addColorStop(.42, "rgba(255,250,236,0)");
      g.addColorStop(1, "rgba(120,98,66,.12)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, width, height);
      ctx.restore();
      // Torn-fibre highlight along the crease.
      ctx.save(); ctx.globalAlpha = fade;
      trace(ctx, rect); ctx.clip();
      ctx.strokeStyle = "rgba(255,250,236,.7)"; ctx.lineWidth = 1.4 * k;
      const t = [-d[1], d[0]];
      ctx.beginPath();
      for (let i = -40; i <= 40; i++) {
        const s = i / 40 * diag, w = deckle(i / 80 + .5) * 2 * k;
        ctx[i === -40 ? "moveTo" : "lineTo"](P[0] + t[0] * s + d[0] * w, P[1] + t[1] * s + d[1] * w);
      }
      ctx.stroke(); ctx.restore();
    }
  }

  const variants = layers.map(() => random());
  function render(localTime) {
    const t = clamp(Number(localTime) || 0, 0, duration);
    ctx.clearRect(0, 0, width, height);
    const stage = duration / (layers.length - 1);
    const index = Math.min(layers.length - 2, Math.floor(t / stage));
    const local = t - index * stage;
    const u = t >= duration ? 1 : smooth((local - stage * .12) / (stage * .72));
    // Stack thickness: the remaining sheets offset slightly under the current one.
    const remaining = layers.length - 1 - index;
    for (let i = remaining; i >= 1; i--) {
      ctx.fillStyle = `rgba(40,32,22,${(.05 + .03 * i).toFixed(3)})`;
      ctx.fillRect(box.x + (4 + i * 3) * k, box.y + (5 + i * 4) * k, box.width, box.height);
    }
    ctx.fillStyle = "rgba(32,38,44,.12)"; ctx.fillRect(box.x + 15 * k, box.y + 17 * k, box.width, box.height);
    if (u <= 0) ctx.drawImage(sheets[index], 0, 0);
    else if (u >= 1) ctx.drawImage(sheets[index + 1], 0, 0);
    else peel(index, u, variants[index]);
    // Registration marks stay fixed while the stack changes beneath.
    const left = box.x, top = box.y, right = left + box.width, bottom = top + box.height;
    ctx.strokeStyle = "rgba(32,38,44,.52)"; ctx.lineWidth = 1.5 * k;
    for (const [x, y, sx, sy] of [[left - 20 * k, top - 20 * k, 18 * k, 0], [right + 20 * k, top - 20 * k, -18 * k, 0],
      [left - 20 * k, bottom + 20 * k, 18 * k, 0], [right + 20 * k, bottom + 20 * k, -18 * k, 0]]) {
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + sx, y + sy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + sx / 2, y - 9 * k); ctx.lineTo(x + sx / 2, y + 9 * k); ctx.stroke();
    }
  }
  render(0);
  return { ...base, layerCount: layers.length, render };
}
