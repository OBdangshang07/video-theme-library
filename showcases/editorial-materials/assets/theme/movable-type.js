import { boxIn, clamp, mix, out, prepare, seeded, smooth } from "./material-utils.js";

/** Wood type gathers into a forme, presses, then leaves a textured ink imprint. */
export async function createMovableType(canvas, options = {}) {
  const base = prepare(canvas, options, 5.6);
  const { ctx, width, height, duration } = base;
  const text = String(options.text || "").trim();
  if (!text) throw new Error("movable-type needs non-empty text");
  const lines = text.split("\n").map((line) => Array.from(line));
  const box = boxIn(width, height, options.box || { x: .14, y: .22, width: .72, height: .56 });
  const maxLength = Math.max(...lines.map((line) => line.length));
  const cell = Math.min(box.width / Math.max(1, maxLength) * .94,
    box.height / Math.max(1, lines.length) * .78, 230);
  const fontSize = cell * .78;
  const family = options.fontFamily || '"Paper Ink Form Serif", serif';
  const weight = options.fontWeight || 500;
  if (document.fonts) await document.fonts.load(`${weight} ${Math.floor(fontSize)}px ${family}`);
  const random = seeded(options.seed ?? 2801);
  const inkColor = options.inkColor || "#20262c";
  const redColor = options.redColor || "#b83b2f";
  const accentIndex = Number.isInteger(options.accentIndex) ? options.accentIndex : -1;
  const rowGap = cell * 1.18;
  let printedIndex = 0;
  const glyphs = lines.flatMap((line, row) => line.map((char, column) => {
    const index = printedIndex++;
    const x = box.x + box.width / 2 + (column - (line.length - 1) / 2) * cell;
    const y = box.y + box.height / 2 + (row - (lines.length - 1) / 2) * rowGap;
    const angle = random() * Math.PI * 2;
    const radius = Math.min(width, height) * mix(.29, .61, random());
    return { char, index, x, y,
      sx: clamp(x + Math.cos(angle) * radius, cell, width - cell),
      sy: clamp(y + Math.sin(angle) * radius, cell, height - cell),
      spin: mix(-.58, .58, random()),
      lag: random() * .18,
    };
  }));
  const impression = document.createElement("canvas");
  impression.width = width; impression.height = height;
  const print = impression.getContext("2d", { willReadFrequently: true });
  if (!print) throw new Error("movable-type could not acquire imprint context");
  print.textAlign = "center"; print.textBaseline = "middle";
  print.font = `${weight} ${fontSize}px ${family}`;
  for (const glyph of glyphs) {
    print.fillStyle = glyph.index === accentIndex ? redColor : inkColor;
    print.fillText(glyph.char, glyph.x, glyph.y + fontSize * .05);
  }
  // Tiny punched voids keep the settled type closer to a pressure print.
  print.globalCompositeOperation = "destination-out";
  for (let i = 0; i < Math.min(4500, glyphs.length * 360); i++) {
    const x = box.x + random() * box.width, y = box.y + random() * box.height;
    print.fillRect(x, y, .5 + random() * 1.6, .5 + random() * 1.6);
  }
  print.globalCompositeOperation = "source-over";
  const phase = (seconds) => seconds / 5.6 * duration;

  function render(localTime) {
    const t = clamp(Number(localTime) || 0, 0, duration);
    ctx.clearRect(0, 0, width, height);
    const ink = smooth((t - phase(2.65)) / phase(.72));
    if (ink) {
      ctx.globalAlpha = ink;
      ctx.drawImage(impression, 0, 0);
      ctx.globalAlpha = 1;
    }
    const lock = smooth((t - phase(1.85)) / phase(.62));
    if (lock > 0) {
      ctx.strokeStyle = `rgba(32,38,44,${.22 * lock})`;
      ctx.lineWidth = 1;
      const left = box.x - cell * .52, right = box.x + box.width + cell * .52;
      const top = box.y - cell * .22, bottom = box.y + box.height + cell * .22;
      for (const [x, y, sx, sy] of [[left, top, 28, 0], [right, top, -28, 0],
        [left, bottom, 28, 0], [right, bottom, -28, 0]]) {
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + sx, y + sy); ctx.stroke();
      }
    }
    for (const glyph of glyphs) {
      if (glyph.char.trim() === "") continue;
      const arriveAt = phase(.12 + glyph.index * .115 + glyph.lag);
      const u = out((t - arriveAt) / phase(1.48));
      const press = smooth((t - phase(2.4)) / phase(.38)) *
        (1 - smooth((t - phase(3.06)) / phase(.27)));
      const lift = smooth((t - phase(3.18)) / phase(1.12));
      const alpha = 1 - lift;
      if (alpha <= 0) continue;
      const x = mix(glyph.sx, glyph.x, u);
      const y = mix(glyph.sy, glyph.y, u) - lift * 75 + Math.sin(Math.PI * u) * 18;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);
      ctx.rotate(glyph.spin * (1 - u));
      const scale = 1 - press * .08;
      ctx.scale(scale, scale);
      const half = cell * .46;
      ctx.shadowColor = `rgba(31,34,34,${.28 * (1 - press)})`;
      ctx.shadowBlur = 18 * (1 - press) + 2;
      ctx.shadowOffsetY = 15 * (1 - press) + 2;
      ctx.fillStyle = "#b3a58e";
      ctx.fillRect(-half, -half, half * 2, half * 2);
      ctx.shadowColor = "transparent";
      ctx.strokeStyle = "#5f5b51"; ctx.lineWidth = 3;
      ctx.strokeRect(-half + 3, -half + 3, half * 2 - 6, half * 2 - 6);
      ctx.fillStyle = "#35383a";
      ctx.fillRect(-half + 12, -half + 12, half * 2 - 24, half * 2 - 24);
      ctx.fillStyle = glyph.index === accentIndex ? "#d99182" : "#e8dcc4";
      ctx.font = `${weight} ${fontSize}px ${family}`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(glyph.char, 0, fontSize * .05);
      ctx.restore();
    }
  }
  render(0);
  return { ...base, text, glyphCount: glyphs.length, render };
}
