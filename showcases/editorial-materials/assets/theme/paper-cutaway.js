import { boxIn, clamp, contain, loadVisual, prepare, seeded, smooth } from "./material-utils.js";

/** Peel successive paper sheets to inspect aligned layers of evidence. */
export async function createPaperCutaway(canvas, options = {}) {
  const base = prepare(canvas, options, 6.6);
  const { ctx, width, height, duration } = base;
  const layers = options.layers || [];
  if (layers.length < 2 || layers.length > 4) {
    throw new Error("paper-cutaway needs 2–4 layers");
  }
  const box = boxIn(width, height, options.box || { x: .19, y: .16, width: .62, height: .67 });
  const images = await Promise.all(layers.map((layer) => loadVisual(layer.visual || layer)));
  const paper = options.paperColor || "#efe5ce";
  const ink = options.inkColor || "#20262c";
  const red = options.redColor || "#b83b2f";
  const random = seeded(options.seed ?? 5209);
  const fibers = Array.from({ length: 95 }, () => ({ y: random(), length: 3 + random() * 14,
    offset: (random() - .5) * 10, opacity: .15 + random() * .28 }));
  const sheets = images.map((image, index) => {
    const sheet = document.createElement("canvas");
    sheet.width = width; sheet.height = height;
    const pen = sheet.getContext("2d");
    if (!pen) throw new Error("paper-cutaway could not acquire sheet context");
    pen.fillStyle = paper;
    pen.fillRect(box.x, box.y, box.width, box.height);
    pen.strokeStyle = "#aa9f88"; pen.lineWidth = 2;
    pen.strokeRect(box.x + 1, box.y + 1, box.width - 2, box.height - 2);
    pen.strokeStyle = "rgba(32,38,44,.24)"; pen.lineWidth = 1;
    pen.beginPath();
    pen.moveTo(box.x + 42, box.y + 105);
    pen.lineTo(box.x + box.width - 42, box.y + 105);
    pen.stroke();
    const visualBox = { x: box.x + 60, y: box.y + 132,
      width: box.width - 120, height: box.height - 215 };
    contain(pen, image, visualBox);
    pen.fillStyle = ink;
    pen.font = '700 25px "Source Han Sans SC", "Microsoft YaHei", sans-serif';
    pen.textAlign = "left"; pen.textBaseline = "middle";
    pen.fillText(String(layers[index].label || `第 ${index + 1} 层`).slice(0, 36),
      box.x + 44, box.y + 61);
    pen.fillStyle = red;
    pen.font = '700 25px "JetBrains Mono", monospace';
    pen.textAlign = "right";
    pen.fillText(`${String(index + 1).padStart(2, "0")} / ${String(layers.length).padStart(2, "0")}`,
      box.x + box.width - 44, box.y + 61);
    pen.fillStyle = "#68645b";
    pen.font = '500 20px "JetBrains Mono", monospace';
    pen.textAlign = "left";
    pen.fillText(String(layers[index].caption || "PAPER LAYER / EVIDENCE"),
      box.x + 44, box.y + box.height - 48);
    return sheet;
  });

  function seam(y, u) {
    return box.x + box.width * (1 - u) +
      Math.sin(Math.PI * u) * (Math.sin(y * .027) * 9 + Math.sin(y * .073) * 4);
  }

  function render(localTime) {
    const t = clamp(Number(localTime) || 0, 0, duration);
    ctx.clearRect(0, 0, width, height);
    const stage = duration / (layers.length - 1);
    const index = Math.min(layers.length - 2, Math.floor(t / stage));
    const local = t - index * stage;
    const u = t >= duration ? 1 : smooth((local - stage * .14) / (stage * .68));
    const left = box.x, top = box.y, right = left + box.width, bottom = top + box.height;
    // The next paper is already aligned beneath the current sheet.
    ctx.fillStyle = "rgba(32,38,44,.12)";
    ctx.fillRect(left + 15, top + 17, box.width, box.height);
    ctx.drawImage(sheets[index + 1], 0, 0);
    if (u < 1) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(left, top);
      ctx.lineTo(seam(top, u), top);
      for (let y = top + 12; y <= bottom; y += 12) ctx.lineTo(seam(y, u), y);
      ctx.lineTo(left, bottom);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(sheets[index], 0, 0);
      ctx.restore();
    }
    if (u > 0 && u < 1) {
      const curl = 36 + 72 * Math.sin(Math.PI * u);
      ctx.save();
      ctx.shadowColor = "rgba(32,38,44,.28)";
      ctx.shadowBlur = 22; ctx.shadowOffsetX = 14;
      ctx.beginPath();
      ctx.moveTo(seam(top, u), top);
      for (let y = top + 12; y <= bottom; y += 12) ctx.lineTo(seam(y, u), y);
      for (let y = bottom; y >= top; y -= 12) ctx.lineTo(seam(y, u) + curl, y);
      ctx.closePath();
      const fold = ctx.createLinearGradient(seam(top, u), 0, seam(top, u) + curl, 0);
      fold.addColorStop(0, "#b9aa90");
      fold.addColorStop(.36, "#f8efd9");
      fold.addColorStop(1, "#d3c4a9");
      ctx.fillStyle = fold;
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.strokeStyle = "rgba(62,58,51,.34)";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      for (let i = 0; i <= 64; i++) {
        const y = top + box.height * i / 64;
        if (i) ctx.lineTo(seam(y, u), y); else ctx.moveTo(seam(y, u), y);
      }
      ctx.stroke();
      for (const fiber of fibers) {
        const y = top + fiber.y * box.height;
        const x = seam(y, u) + fiber.offset;
        ctx.strokeStyle = `rgba(79,72,61,${fiber.opacity})`;
        ctx.beginPath(); ctx.moveTo(x, y);
        ctx.lineTo(x + fiber.length, y + fiber.offset * .3); ctx.stroke();
      }
      ctx.restore();
    }
    // Registration marks remain fixed while the paper stack changes beneath.
    ctx.strokeStyle = "rgba(32,38,44,.52)"; ctx.lineWidth = 1.5;
    for (const [x, y, sx, sy] of [[left - 20, top - 20, 18, 0],
      [right + 20, top - 20, -18, 0], [left - 20, bottom + 20, 18, 0],
      [right + 20, bottom + 20, -18, 0]]) {
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + sx, y + sy); ctx.stroke();
    }
  }
  render(0);
  return { ...base, layerCount: layers.length, render };
}
