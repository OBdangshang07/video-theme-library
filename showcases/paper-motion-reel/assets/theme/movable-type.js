import { boxIn, clamp, mix, out, prepare, seeded, smooth } from "./material-utils.js";
import { fbm, makeCanvas, valueNoise } from "./paper-kit.js";

/**
 * 活字归版 — letterpress with wood type.
 * 拣字：each block flies in with its own spin and height, lands with a damped bounce.
 * 锁版：four chase rails slide in and lock the forme.
 * 上墨：a brayer rolls across; glyph faces turn from bare wood to glossy ink behind it.
 * 压印：the forme presses down, then lifts away — leaving an uneven, debossed ink impression.
 * render(t) is a pure function of t and the seed.
 */
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
  const fontSize = cell * .74;
  const family = options.fontFamily || '"Paper Ink Form Serif", serif';
  const weight = options.fontWeight || 500;
  if (document.fonts) await document.fonts.load(`${weight} ${Math.floor(fontSize)}px ${family}`);
  const seed = options.seed ?? 2801;
  const random = seeded(seed);
  const inkColor = options.inkColor || "#20262c";
  const redColor = options.redColor || "#b83b2f";
  const accentIndex = Number.isInteger(options.accentIndex) ? options.accentIndex : -1;
  const P = (seconds) => seconds / 5.6 * duration;
  const rowGap = cell * 1.12;
  const block = cell * .94, depth = cell * .16;

  let printedIndex = 0;
  const glyphs = lines.flatMap((line, row) => line.map((char, column) => {
    const index = printedIndex++;
    const x = box.x + box.width / 2 + (column - (line.length - 1) / 2) * cell;
    const y = box.y + box.height / 2 + (row - (lines.length - 1) / 2) * rowGap;
    const angle = random() * Math.PI * 2, radius = Math.min(width, height) * mix(.3, .6, random());
    return { char, index, x, y, blank: char.trim() === "",
      sx: clamp(x + Math.cos(angle) * radius, cell, width - cell),
      sy: clamp(y + Math.sin(angle) * radius, cell, height - cell),
      spin: mix(-1.1, 1.1, random()), lift: mix(.7, 1.2, random()), lag: random() * .14,
      wobble: random() * Math.PI * 2, exitX: mix(-1, 1, random()), exitSpin: mix(-.5, .5, random()) };
  }));
  const count = glyphs.length;
  const stagger = Math.min(.11, 1.15 / Math.max(1, count));
  const forme = { left: box.x + box.width / 2 - (maxLength / 2) * cell - cell * .12,
    right: box.x + box.width / 2 + (maxLength / 2) * cell + cell * .12,
    top: box.y + box.height / 2 - (lines.length / 2) * rowGap - cell * .1,
    bottom: box.y + box.height / 2 + (lines.length / 2) * rowGap + cell * .1 };

  // ---------- block faces: bare wood with raised glyph, and the same face inked ----------
  const grain = fbm(seed + 3, 3), fine = valueNoise(seed + 4);
  const faceSize = Math.ceil(block);
  function face(glyph, inked) {
    const c = makeCanvas(faceSize, faceSize), g = c.getContext("2d");
    const img = g.createImageData(faceSize, faceSize);
    const tint = glyph.index * 1.7;
    for (let y = 0; y < faceSize; y++) for (let x = 0; x < faceSize; x++) {
      // Long grain running vertically: a few soft growth rings bent by noise, plus fine fibre.
      const rings = Math.sin((x / faceSize * 3.4 + grain(x / faceSize * 1.5 + tint, y / faceSize * 2.2) * 1.8) * Math.PI) * .5 + .5;
      const shade = mix(-14, 12, rings ** 1.6) + (fine(x * .9, y * .05 + tint) - .5) * 12 - (inked ? 34 : 0);
      const i = (y * faceSize + x) * 4;
      img.data[i] = clamp(186 + shade, 0, 255); img.data[i + 1] = clamp(158 + shade, 0, 255);
      img.data[i + 2] = clamp(118 + shade * .8, 0, 255); img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    g.strokeStyle = inked ? "rgba(20,18,14,.55)" : "rgba(80,62,38,.5)"; g.lineWidth = Math.max(1, faceSize * .025);
    g.strokeRect(g.lineWidth / 2, g.lineWidth / 2, faceSize - g.lineWidth, faceSize - g.lineWidth);
    g.font = `${weight} ${fontSize}px ${family}`; g.textAlign = "center"; g.textBaseline = "middle";
    const cx = faceSize / 2, cy = faceSize / 2 + fontSize * .04, lift = Math.max(1, faceSize * .018);
    if (inked) {
      g.fillStyle = glyph.index === accentIndex ? redColor : "#15181b";
      g.fillText(glyph.char, cx, cy);
      g.fillStyle = "rgba(255,255,255,.16)";                  // wet sheen on the inked relief
      g.save(); g.beginPath(); g.rect(0, 0, faceSize, faceSize * .42); g.clip();
      g.fillText(glyph.char, cx - lift * .6, cy - lift * .6); g.restore();
    } else {
      g.fillStyle = "rgba(60,44,24,.55)"; g.fillText(glyph.char, cx + lift, cy + lift);   // relief shadow
      g.fillStyle = "rgba(255,240,210,.5)"; g.fillText(glyph.char, cx - lift * .6, cy - lift * .6);
      g.fillStyle = "#c9ad83"; g.fillText(glyph.char, cx, cy);
    }
    return c;
  }
  const faces = glyphs.map((glyph) => glyph.blank ? null : { bare: face(glyph, false), inked: face(glyph, true) });

  // ---------- the impression left on the paper ----------
  const imprint = makeCanvas(width, height);
  const print = imprint.getContext("2d", { willReadFrequently: true });
  print.textAlign = "center"; print.textBaseline = "middle";
  print.font = `${weight} ${fontSize}px ${family}`;
  for (const glyph of glyphs) {
    if (glyph.blank) continue;
    print.fillStyle = glyph.index === accentIndex ? redColor : inkColor;
    print.fillText(glyph.char, glyph.x, glyph.y + fontSize * .04);
  }
  // Uneven ink: thin where the roller starved, voids in the paper tooth, squeeze at the edges.
  const inkData = print.getImageData(0, 0, width, height);
  const starve = fbm(seed + 7, 4), tooth = valueNoise(seed + 8);
  const x0 = Math.floor(forme.left), x1 = Math.ceil(forme.right), y0 = Math.floor(forme.top), y1 = Math.ceil(forme.bottom);
  for (let y = Math.max(0, y0); y < Math.min(height, y1); y++) for (let x = Math.max(0, x0); x < Math.min(width, x1); x++) {
    const i = (y * width + x) * 4;
    if (!inkData.data[i + 3]) continue;
    const cover = .78 + .22 * starve(x * .012, y * .012);
    const pit = tooth(x * .7, y * .7) > .9 ? .35 : 1;
    inkData.data[i + 3] = Math.round(inkData.data[i + 3] * clamp(cover * pit * 1.08));
  }
  print.putImageData(inkData, 0, 0);
  print.globalCompositeOperation = "source-over";
  print.lineJoin = "round";
  print.strokeStyle = "rgba(18,20,22,.3)"; print.lineWidth = Math.max(1, fontSize * .012);
  for (const glyph of glyphs) if (!glyph.blank) print.strokeText(glyph.char, glyph.x, glyph.y + fontSize * .04);
  // Deboss: the type bit into the paper — dark lip on top-left, light lip bottom-right.
  const deboss = makeCanvas(width, height), d = deboss.getContext("2d");
  d.textAlign = "center"; d.textBaseline = "middle"; d.font = `${weight} ${fontSize}px ${family}`;
  const lip = Math.max(1, fontSize * .012);
  for (const glyph of glyphs) {
    if (glyph.blank) continue;
    d.fillStyle = "rgba(255,250,236,.55)"; d.fillText(glyph.char, glyph.x + lip, glyph.y + fontSize * .04 + lip);
    d.fillStyle = "rgba(70,56,36,.3)"; d.fillText(glyph.char, glyph.x - lip, glyph.y + fontSize * .04 - lip);
  }

  // ---------- motion ----------
  function blockState(glyph, t) {
    const arrive = P(.12 + glyph.index * stagger + glyph.lag);
    const flight = P(.95);
    const u = clamp((t - arrive) / flight);
    if (u <= 0) return null;
    const land = out(u);
    let x = mix(glyph.sx, glyph.x, land), y = mix(glyph.sy, glyph.y, land);
    // Height: arc up and down, then a damped bounce after touchdown.
    let z = Math.sin(Math.PI * Math.min(1, u * 1.05)) * .9 * glyph.lift;
    const after = t - (arrive + flight * .95);
    if (after > 0) z = Math.abs(Math.sin(after / P(.16) * Math.PI)) * .12 * Math.exp(-after / P(.14));
    let rot = glyph.spin * (1 - land) + (after > 0 ? Math.sin(after * 26 + glyph.wobble) * .03 * Math.exp(-after / P(.12)) : 0);
    // Lock: rails squeeze the forme a hair tighter.
    const lock = smooth((t - P(1.95)) / P(.3));
    x = mix(x, glyph.x + (glyph.x - (forme.left + forme.right) / 2) * -.012, lock);
    // Press and lift.
    const press = smooth((t - P(3.05)) / P(.2)) * (1 - smooth((t - P(3.4)) / P(.1)));
    const leave = smooth((t - P(3.48)) / P(.95));
    z = z - press * .08 + leave * 1.6;
    x += leave * glyph.exitX * cell * .8; y -= leave * cell * 1.3;
    rot += leave * glyph.exitSpin;
    const alpha = 1 - smooth((leave - .45) / .55);
    return { x, y, z, rot, alpha, press };
  }
  const rollerAt = (t) => mix(forme.left - cell * .9, forme.right + cell * .9, smooth((t - P(2.2)) / P(.8)));
  const rollerOn = (t) => t > P(2.1) && t < P(3.1);

  function drawBlock(glyph, s, inkAmount) {
    const scale = 1 + s.z * .12;
    ctx.save();
    ctx.globalAlpha = s.alpha;
    ctx.translate(s.x, s.y); ctx.rotate(s.rot); ctx.scale(scale, scale);
    const half = block / 2, dz = depth * (1 + s.z * .5);
    ctx.shadowColor = `rgba(30,24,16,${(.34 * (1 - s.press) * s.alpha).toFixed(3)})`;
    ctx.shadowBlur = 6 + s.z * 34; ctx.shadowOffsetX = 3 + s.z * 22; ctx.shadowOffsetY = 5 + s.z * 30;
    // Side faces give the block its thickness (lit from top-left).
    ctx.fillStyle = "#7a664a";
    ctx.beginPath(); ctx.moveTo(half, -half); ctx.lineTo(half + dz * .55, -half + dz * .75);
    ctx.lineTo(half + dz * .55, half + dz * .75); ctx.lineTo(-half + dz * .55, half + dz * .75);
    ctx.lineTo(-half, half); ctx.closePath(); ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.fillStyle = "#5e4d36";
    ctx.beginPath(); ctx.moveTo(-half, half); ctx.lineTo(-half + dz * .55, half + dz * .75);
    ctx.lineTo(half + dz * .55, half + dz * .75); ctx.lineTo(half, half); ctx.closePath(); ctx.fill();
    const f = faces[glyph.index];
    ctx.drawImage(f.bare, -half, -half, block, block);
    if (inkAmount > 0) { ctx.globalAlpha = s.alpha * inkAmount; ctx.drawImage(f.inked, -half, -half, block, block); }
    ctx.restore();
  }
  function drawRails(t) {
    const lock = out((t - P(1.8)) / P(.4)), fade = 1 - smooth((t - P(3.5)) / P(.5));
    if (lock <= 0 || fade <= 0) return;
    const w = cell * .16, gap = cell * 1.8 * (1 - lock);
    ctx.save(); ctx.globalAlpha = fade;
    ctx.fillStyle = "#8a7356"; ctx.shadowColor = "rgba(30,24,16,.3)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4;
    ctx.fillRect(forme.left - w - gap, forme.top - w, w, forme.bottom - forme.top + w * 2);
    ctx.fillRect(forme.right + gap, forme.top - w, w, forme.bottom - forme.top + w * 2);
    ctx.fillRect(forme.left - w, forme.top - w - gap, forme.right - forme.left + w * 2, w);
    ctx.fillRect(forme.left - w, forme.bottom + gap, forme.right - forme.left + w * 2, w);
    ctx.restore();
  }
  function drawRoller(t) {
    const x = rollerAt(t), h = forme.bottom - forme.top + cell * .5, r = cell * .24;
    const enter = smooth((t - P(2.1)) / P(.15)) * (1 - smooth((t - P(2.98)) / P(.12)));
    ctx.save(); ctx.globalAlpha = enter;
    ctx.shadowColor = "rgba(20,16,10,.35)"; ctx.shadowBlur = 20; ctx.shadowOffsetX = 12; ctx.shadowOffsetY = 10;
    const g = ctx.createLinearGradient(x - r, 0, x + r, 0);
    g.addColorStop(0, "#0e1012"); g.addColorStop(.35, "#3a4046"); g.addColorStop(.5, "#6d737a");
    g.addColorStop(.62, "#2a2f34"); g.addColorStop(1, "#0b0d0f");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.roundRect(x - r, forme.top - cell * .25, r * 2, h, r * .6); ctx.fill();
    ctx.shadowColor = "transparent";
    // Yoke and wooden grip.
    ctx.strokeStyle = "#3b3a36"; ctx.lineWidth = cell * .045; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(x, forme.top - cell * .25); ctx.lineTo(x - cell * .42, forme.top - cell * .62); ctx.stroke();
    const grip = ctx.createLinearGradient(x - cell * .6, 0, x - cell * .3, 0);
    grip.addColorStop(0, "#6b5236"); grip.addColorStop(.5, "#a88760"); grip.addColorStop(1, "#5a432b");
    ctx.fillStyle = grip;
    ctx.beginPath(); ctx.roundRect(x - cell * .56, forme.top - cell * 1.2, cell * .28, cell * .62, cell * .12); ctx.fill();
    ctx.restore();
  }

  function render(localTime) {
    const t = clamp(Number(localTime) || 0, 0, duration);
    ctx.clearRect(0, 0, width, height);
    const printed = smooth((t - P(3.25)) / P(.12));
    if (printed > 0) {
      ctx.globalAlpha = printed * .9; ctx.drawImage(deboss, 0, 0);
      // Wet ink first reads a touch darker, then dries back.
      ctx.globalAlpha = printed; ctx.drawImage(imprint, 0, 0);
      const wet = printed * (1 - smooth((t - P(3.6)) / P(1.6)));
      if (wet > .01) { ctx.globalAlpha = wet * .35; ctx.drawImage(imprint, 0, 0); }
      ctx.globalAlpha = 1;
    }
    drawRails(t);
    const rx = rollerAt(t);
    const states = glyphs.map((g) => g.blank ? null : blockState(g, t));
    // Draw airborne blocks last so they pass over the ones already seated.
    const order = glyphs.map((g, i) => i).filter((i) => states[i]).sort((a, b) => states[a].z - states[b].z);
    for (const i of order) {
      const g = glyphs[i], s = states[i];
      if (s.alpha <= 0) continue;
      const ink = t < P(2.1) ? 0 : clamp((rx - (g.x - block / 2)) / block);
      drawBlock(g, s, ink);
    }
    if (rollerOn(t)) drawRoller(t);
  }
  render(0);
  return { ...base, text, glyphCount: count, render };
}
