import { boxIn, clamp, contain, loadVisual, mix, out, prepare, seeded, smooth } from "./material-utils.js";
import { edgeProfile, fbm, hexRGB, makeCanvas, valueNoise } from "./paper-kit.js";

/**
 * 拓印显影 — a traditional 扑拓 rubbing.
 * 覆纸：a damp sheet settles over the relief and is tamped until the relief embosses through.
 * 扑墨：a cloth pad dabs hundreds of times in three passes (light wash → cross pass → targeted
 *       deepening). Ink accumulates dab by dab and saturates like real rubbing ink; raised marks
 *       go dark first, their edges crisp, recesses keep a faint grey wash.
 * 收拓：the pad lifts away and the wet ink dries slightly lighter.
 * render(t) depends only on t and the seed. Forward playback is incremental; seeking backwards
 * rebuilds from zero with the same ordered operations, so both paths give identical pixels.
 */
export async function createRubbingReveal(canvas, options = {}) {
  const base = prepare(canvas, options, 5.4);
  const { ctx, width, height, duration } = base;
  const box = boxIn(width, height, options.box || { x: .22, y: .16, width: .56, height: .67 });
  const visualSource = options.visual || options.target;
  if (!visualSource) throw new Error("rubbing-reveal needs visual src or SVG markup");
  const visual = await loadVisual(visualSource);
  const inkColor = options.inkColor || "#20262c";
  const [r, g, b] = hexRGB(inkColor);
  const density = clamp(Number(options.density ?? 1), .2, 1.8);
  const seed = options.seed ?? 3841;
  const random = seeded(seed);
  const useSheet = options.sheet !== false;
  const sheetColor = options.sheetColor || "#f6eedb";
  const S = (seconds) => seconds / 5.4 * duration;

  // ---------- relief: how strongly each pixel takes ink ----------
  const source = makeCanvas(width, height);
  const sourceCtx = source.getContext("2d", { willReadFrequently: true });
  contain(sourceCtx, visual, box, 12);
  const src = sourceCtx.getImageData(0, 0, width, height).data;
  const relief = new Float32Array(width * height);
  const silhouette = sourceCtx.createImageData(width, height);
  const x0 = Math.floor(box.x), y0 = Math.floor(box.y);
  const x1 = Math.ceil(box.x + box.width), y1 = Math.ceil(box.y + box.height);
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const i = y * width + x, alpha = src[i * 4 + 3] / 255;
    if (!alpha) continue;
    const light = (src[i * 4] * .2126 + src[i * 4 + 1] * .7152 + src[i * 4 + 2] * .0722) / 255;
    relief[i] = alpha * Math.pow(1 - light, .72);
    silhouette.data[i * 4 + 3] = Math.round(relief[i] * 255);
  }
  const reliefCanvas = makeCanvas(width, height);
  reliefCanvas.getContext("2d").putImageData(silhouette, 0, 0);
  // Blurred relief: the difference marks raised edges, where the pad bites hardest.
  const blurCanvas = makeCanvas(width, height);
  const blurCtx = blurCanvas.getContext("2d", { willReadFrequently: true });
  blurCtx.filter = `blur(${Math.max(2, Math.round(Math.min(width, height) / 270))}px)`;
  blurCtx.drawImage(reliefCanvas, 0, 0);
  const blurred = blurCtx.getImageData(0, 0, width, height).data;

  // Object surface = everything enclosed by the marks: flood the box from its border
  // through non-mark pixels; whatever the flood cannot reach is the object the sheet rests on.
  const bw = x1 - x0, bh = y1 - y0;
  const outside = new Uint8Array(bw * bh), queue = new Int32Array(bw * bh);
  let head = 0, tail = 0;
  const wall = (lx, ly) => blurred[((ly + y0) * width + lx + x0) * 4 + 3] > 20;
  const seedFlood = (lx, ly) => { const k = ly * bw + lx; if (!outside[k] && !wall(lx, ly)) { outside[k] = 1; queue[tail++] = k; } };
  for (let lx = 0; lx < bw; lx++) { seedFlood(lx, 0); seedFlood(lx, bh - 1); }
  for (let ly = 0; ly < bh; ly++) { seedFlood(0, ly); seedFlood(bw - 1, ly); }
  while (head < tail) {
    const k = queue[head++], lx = k % bw, ly = (k / bw) | 0;
    if (lx > 0) seedFlood(lx - 1, ly); if (lx < bw - 1) seedFlood(lx + 1, ly);
    if (ly > 0) seedFlood(lx, ly - 1); if (ly < bh - 1) seedFlood(lx, ly + 1);
  }
  const area = new Float32Array(width * height);
  for (let ly = 0; ly < bh; ly++) for (let lx = 0; lx < bw; lx++) {
    const i = (ly + y0) * width + lx + x0;
    area[i] = outside[ly * bw + lx] ? relief[i] : 1;
  }

  const intaglio = options.mode === "intaglio";
  const fiber = fbm(seed + 1, 4), tooth = valueNoise(seed + 2), cloud = fbm(seed + 3, 4);
  const plate = makeCanvas(width, height), surface = makeCanvas(width, height);
  const plateCtx = plate.getContext("2d"), surfaceCtx = surface.getContext("2d");
  const plateImg = plateCtx.createImageData(width, height), surfaceImg = surfaceCtx.createImageData(width, height);
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const i = y * width + x;
    if (!area[i]) continue;
    // The pad bites hardest on the rim where surface meets mark.
    const edge = Math.max(0, blurred[i * 4 + 3] / 255 - relief[i]);
    const paper = .78 + .22 * fiber(x * .045, y * .16);
    const grain = .86 + .14 * tooth(x * .9, y * .9);
    const receptive = intaglio
      ? area[i] * (1 - relief[i]) * (1 + edge * .5)
      : relief[i] + Math.max(0, relief[i] - blurred[i * 4 + 3] / 255) * .9;
    const o = i * 4;
    plateImg.data[o] = r; plateImg.data[o + 1] = g; plateImg.data[o + 2] = b;
    plateImg.data[o + 3] = Math.round(clamp(receptive * paper * grain * density) * 255);
    // Cloudy pad tone across the whole object surface (marks mode only).
    const tone = intaglio ? 0 : area[i] * (1 - relief[i]) * (.3 + .7 * cloud(x * .011, y * .011)) * paper;
    surfaceImg.data[o] = r; surfaceImg.data[o + 1] = g; surfaceImg.data[o + 2] = b;
    surfaceImg.data[o + 3] = Math.round(clamp(tone) * 255);
  }
  plateCtx.putImageData(plateImg, 0, 0);
  surfaceCtx.putImageData(surfaceImg, 0, 0);

  // Emboss: relief pushes through the damp sheet as a light/dark rim before any ink.
  const emboss = makeCanvas(width, height);
  const embossCtx = emboss.getContext("2d");
  const rim = (dx, dy, color, alpha) => {
    const layer = makeCanvas(width, height), l = layer.getContext("2d");
    l.drawImage(reliefCanvas, dx, dy);
    l.globalCompositeOperation = "source-in"; l.fillStyle = color; l.fillRect(0, 0, width, height);
    l.globalCompositeOperation = "destination-out"; l.drawImage(reliefCanvas, 0, 0);
    embossCtx.globalAlpha = alpha; embossCtx.drawImage(layer, 0, 0);
  };
  const lift = Math.max(1.5, Math.min(width, height) / 540);
  rim(lift, lift, "#3a3226", .5);
  rim(-lift, -lift, "#fffaf0", .9);
  embossCtx.globalAlpha = 1;

  // ---------- the sheet ----------
  const sheetBox = { x: box.x - box.width * .045, y: box.y - box.height * .04,
    width: box.width * 1.09, height: box.height * 1.08 };
  const deckle = [edgeProfile(seed + 11, 6, 120), edgeProfile(seed + 12, 6, 120),
    edgeProfile(seed + 13, 6, 120), edgeProfile(seed + 14, 6, 120)];
  const amp = Math.min(width, height) * .004;
  const sheetPath = (c) => {
    const { x, y, width: w, height: h } = sheetBox, n = 90;
    c.beginPath();
    for (let i = 0; i <= n; i++) c[i ? "lineTo" : "moveTo"](x + w * i / n, y + deckle[0](i / n) * amp);
    for (let i = 0; i <= n; i++) c.lineTo(x + w + deckle[1](i / n) * amp, y + h * i / n);
    for (let i = n; i >= 0; i--) c.lineTo(x + w * i / n, y + h + deckle[2](i / n) * amp);
    for (let i = n; i >= 0; i--) c.lineTo(x + deckle[3](i / n) * amp, y + h * i / n);
    c.closePath();
  };
  const sheet = makeCanvas(width, height);
  if (useSheet) {
    const s = sheet.getContext("2d");
    sheetPath(s); s.save(); s.clip();
    s.fillStyle = sheetColor; s.fillRect(0, 0, width, height);
    const fibres = seeded(seed + 21);
    for (let i = 0; i < 900; i++) {
      const fx = sheetBox.x + fibres() * sheetBox.width, fy = sheetBox.y + fibres() * sheetBox.height;
      const len = 4 + fibres() * 22, a = fibres() * Math.PI;
      s.strokeStyle = `rgba(140,118,84,${(.05 + fibres() * .09).toFixed(3)})`;
      s.lineWidth = .6 + fibres() * .8;
      s.beginPath(); s.moveTo(fx, fy);
      s.quadraticCurveTo(fx + Math.cos(a) * len * .5 + 3, fy + Math.sin(a) * len * .5,
        fx + Math.cos(a) * len, fy + Math.sin(a) * len);
      s.stroke();
    }
    const shade = s.createLinearGradient(sheetBox.x, sheetBox.y, sheetBox.x + sheetBox.width, sheetBox.y + sheetBox.height);
    shade.addColorStop(0, "rgba(255,255,255,.18)"); shade.addColorStop(1, "rgba(120,98,66,.08)");
    s.fillStyle = shade; s.fillRect(0, 0, width, height);
    s.restore();
  }

  // ---------- pad imprint sprites (cloth weave + creases) ----------
  const spriteSize = 160;
  const sprites = [0, 1, 2].map((v) => {
    const sp = makeCanvas(spriteSize, spriteSize), c = sp.getContext("2d");
    const img = c.createImageData(spriteSize, spriteSize);
    const weave = valueNoise(seed + 31 + v), creases = fbm(seed + 41 + v, 3);
    for (let y = 0; y < spriteSize; y++) for (let x = 0; x < spriteSize; x++) {
      const u = x / spriteSize - .5, w = y / spriteSize - .5, d = Math.hypot(u, w) * 2;
      if (d >= 1) continue;
      const a = Math.atan2(w, u);
      const body = 1 - smooth((d - .55) / .45);
      const cloth = .72 + .28 * weave(x * .55, y * .55);
      const fold = 1 - .55 * smooth(1 - Math.abs(Math.sin(a * 5 + creases(u * 3, w * 3) * 3)) * 6) * smooth((d - .2) / .5);
      const o = (y * spriteSize + x) * 4;
      img.data[o + 3] = Math.round(clamp(body * cloth * fold) * 255);
    }
    c.putImageData(img, 0, 0);
    return sp;
  });

  // ---------- dab schedule: three passes ----------
  const r0 = Math.min(box.width, box.height) * .13;
  const dabs = [];
  const inside = (x, y) => [clamp(x, box.x + r0 * .3, box.x + box.width - r0 * .3),
    clamp(y, box.y + r0 * .3, box.y + box.height - r0 * .3)];
  const serpentine = (rows, angle, spacing) => {
    const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
    const ca = Math.cos(angle), sa = Math.sin(angle);
    const half = Math.hypot(box.width, box.height) / 2;
    const points = [];
    for (let row = 0; row < rows; row++) {
      const v = -half * .82 + (row + .5) / rows * half * 1.64;
      const line = [];
      for (let u = -half; u <= half; u += spacing) {
        const jx = (random() - .5) * spacing * .55, jy = (random() - .5) * spacing * .55;
        const x = cx + (u + jx) * ca - (v + jy) * sa, y = cy + (u + jx) * sa + (v + jy) * ca;
        if (x < box.x - r0 * .2 || x > box.x + box.width + r0 * .2 ||
          y < box.y - r0 * .2 || y > box.y + box.height + r0 * .2) continue;
        line.push(inside(x, y));
      }
      if (row % 2) line.reverse();
      points.push(...line);
    }
    return points;
  };
  const schedule = (points, start, end, make) => {
    let travel = 0;
    const cum = points.map((p, i) => (travel += i ? Math.hypot(p[0] - points[i - 1][0], p[1] - points[i - 1][1]) + r0 * .6 : 0));
    points.forEach((p, i) => dabs.push({ x: p[0], y: p[1], t: mix(start, end, travel ? cum[i] / travel : 0), ...make(i) }));
  };
  schedule(serpentine(5, .06, r0 * .6), S(.78), S(2.02), () => ({
    r: r0 * mix(.95, 1.12, random()), p: mix(.22, .32, random()) }));
  schedule(serpentine(6, -.62, r0 * .54), S(2.08), S(3.24), () => ({
    r: r0 * mix(.8, .98, random()), p: mix(.28, .4, random()) }));
  // Targeted deepening: stratified over a grid so no quadrant is left pale,
  // weighted toward strong marks, visited by greedy nearest-neighbour.
  const candidates = [];
  const cells = 9;
  for (let cy = 0; cy < cells; cy++) for (let cx = 0; cx < cells; cx++) {
    let picked = 0;
    for (let tries = 0; tries < 260 && picked < (intaglio ? 3 : 2); tries++) {
      const x = Math.floor(box.x + (cx + random()) / cells * box.width);
      const y = Math.floor(box.y + (cy + random()) / cells * box.height);
      const i = y * width + x, target = intaglio ? area[i] * (1 - relief[i]) : relief[i];
      if (target > .2 + random() * .5) { candidates.push(inside(x, y)); picked++; }
    }
  }
  const ordered = [];
  let cursor = dabs.length ? [dabs[dabs.length - 1].x, dabs[dabs.length - 1].y] : [box.x, box.y];
  while (candidates.length) {
    let best = 0, bestD = Infinity;
    candidates.forEach((p, i) => { const d = Math.hypot(p[0] - cursor[0], p[1] - cursor[1]); if (d < bestD) { bestD = d; best = i; } });
    cursor = candidates.splice(best, 1)[0];
    ordered.push(cursor);
  }
  schedule(ordered, S(3.3), S(4.36), () => ({ r: r0 * mix(.55, .75, random()), p: mix(.34, .48, random()) }));
  dabs.forEach((dab) => { dab.rot = random() * Math.PI * 2; dab.sprite = sprites[Math.floor(random() * 3)]; });
  const lastDab = dabs[dabs.length - 1];

  // ---------- accumulation ----------
  const coverage = makeCanvas(width, height), covCtx = coverage.getContext("2d");
  const work = makeCanvas(width, height), workCtx = work.getContext("2d");
  const wet = makeCanvas(width, height), wetCtx = wet.getContext("2d");
  let applied = 0;
  const stamp = (c, dab, alpha) => {
    c.save(); c.globalAlpha = alpha; c.translate(dab.x, dab.y); c.rotate(dab.rot);
    c.drawImage(dab.sprite, -dab.r, -dab.r, dab.r * 2, dab.r * 2); c.restore();
  };
  const countAt = (t) => { let lo = 0, hi = dabs.length; while (lo < hi) { const m = (lo + hi) >> 1; if (dabs[m].t <= t) lo = m + 1; else hi = m; } return lo; };
  const applyUpTo = (n) => {
    if (n < applied) { covCtx.clearRect(0, 0, width, height); applied = 0; }
    for (; applied < n; applied++) stamp(covCtx, dabs[applied], dabs[applied].p);
  };
  const masked = (mask, alpha, layer = plate, gain = 1) => {
    workCtx.globalCompositeOperation = "copy"; workCtx.drawImage(layer, 0, 0);
    workCtx.globalCompositeOperation = "destination-in"; workCtx.drawImage(mask, 0, 0);
    workCtx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = alpha * gain; ctx.drawImage(work, 0, 0); ctx.globalAlpha = 1;
  };

  // ---------- pad ----------
  const padR = r0 * .78;
  const enterFrom = [box.x + box.width + padR * 2.4, box.y + box.height * .9];
  const exitTo = [box.x + box.width + padR * 2.6, box.y - padR * 1.6];
  function padState(t) {
    const first = dabs[0];
    if (t < first.t - S(.5) || t > lastDab.t + S(.72)) return null;
    if (t < first.t) {
      const v = out((t - (first.t - S(.5))) / S(.5));
      return { x: mix(enterFrom[0], first.x, v), y: mix(enterFrom[1], first.y, v), z: 1 - smooth((v - .6) / .4), squash: 0, angle: -.3 * (1 - v) };
    }
    if (t >= lastDab.t) {
      const v = clamp((t - lastDab.t) / S(.72));
      const press = 1 - smooth(v / .18);
      const go = smooth((v - .12) / .88);
      return { x: mix(lastDab.x, exitTo[0], go), y: mix(lastDab.y, exitTo[1], go), z: smooth(v / .3), squash: press, angle: .35 * go };
    }
    const i = countAt(t) - 1, a = dabs[i], n = dabs[i + 1];
    const u = (t - a.t) / Math.max(1e-6, n.t - a.t);
    const contact = .26;
    const squash = 1 - smooth(u / contact);
    const v = smooth((u - contact) / (1 - contact));
    const hop = Math.sin(Math.PI * clamp((u - contact * .6) / (1 - contact * .6))) ** .8;
    return { x: mix(a.x, n.x, v), y: mix(a.y, n.y, v) - hop * padR * .12, z: hop * .75, squash,
      angle: Math.atan2(n.y - a.y, n.x - a.x) * .08 + Math.sin(a.rot) * .12 };
  }
  function drawPad(state) {
    const { x, y, z, squash, angle } = state;
    const scale = 1 + z * .09 - squash * .03;
    ctx.save();
    // Shadow separates from the pad as it lifts.
    ctx.fillStyle = `rgba(32,30,26,${(.3 - z * .14).toFixed(3)})`;
    ctx.filter = `blur(${(3 + z * 12).toFixed(1)}px)`;
    ctx.beginPath(); ctx.ellipse(x + 6 + z * padR * .34, y + 8 + z * padR * .42, padR * (1.02 + squash * .06), padR * (.9 + squash * .05), 0, 0, Math.PI * 2); ctx.fill();
    ctx.filter = "none";
    ctx.translate(x, y); ctx.rotate(angle); ctx.scale(scale * (1 + squash * .06), scale * (1 - squash * .05));
    const body = ctx.createRadialGradient(-padR * .28, -padR * .34, padR * .08, 0, 0, padR);
    body.addColorStop(0, "#e2d7c1"); body.addColorStop(.45, "#b4a68b");
    body.addColorStop(.82, "#6d6555"); body.addColorStop(1, "#3a3833");
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.ellipse(0, 0, padR, padR * .92, 0, 0, Math.PI * 2); ctx.fill();
    // Inked rim just visible at the contact edge.
    ctx.strokeStyle = `rgba(${r},${g},${b},.55)`; ctx.lineWidth = padR * .07;
    ctx.beginPath(); ctx.ellipse(0, 0, padR * .96, padR * .88, 0, .3, Math.PI * 1.25); ctx.stroke();
    // Silk gathered into the tie: radial creases toward the knot.
    const knot = [-padR * .06, -padR * .1];
    for (let i = 0; i < 11; i++) {
      const a = i / 11 * Math.PI * 2 + .2;
      ctx.strokeStyle = i % 2 ? "rgba(58,52,42,.34)" : "rgba(250,244,230,.38)";
      ctx.lineWidth = padR * (i % 2 ? .035 : .025);
      ctx.beginPath(); ctx.moveTo(knot[0], knot[1]);
      ctx.quadraticCurveTo(Math.cos(a + .35) * padR * .5, Math.sin(a + .35) * padR * .46, Math.cos(a) * padR * .9, Math.sin(a) * padR * .83);
      ctx.stroke();
    }
    const tie = ctx.createRadialGradient(knot[0] - padR * .05, knot[1] - padR * .05, 1, knot[0], knot[1], padR * .24);
    tie.addColorStop(0, "#d6c8ac"); tie.addColorStop(1, "#5d5446");
    ctx.fillStyle = tie; ctx.beginPath(); ctx.arc(knot[0], knot[1], padR * .2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function render(localTime) {
    const t = clamp(Number(localTime) || 0, 0, duration);
    ctx.clearRect(0, 0, width, height);
    if (useSheet) {
      const lay = out(t / S(.62));
      if (lay > 0) {
        const cx = sheetBox.x + sheetBox.width / 2, cy = sheetBox.y + sheetBox.height / 2;
        const scale = mix(1.045, 1, lay), air = 1 - lay;
        ctx.save();
        ctx.globalAlpha = smooth(t / S(.22));
        ctx.translate(cx, cy + air * sheetBox.height * -.03); ctx.scale(scale, scale); ctx.translate(-cx, -cy);
        ctx.shadowColor = `rgba(40,32,22,${(.16 + air * .12).toFixed(3)})`;
        ctx.shadowBlur = 8 + air * 40; ctx.shadowOffsetY = 4 + air * 26; ctx.shadowOffsetX = 2 + air * 10;
        ctx.fillStyle = sheetColor; sheetPath(ctx); ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.drawImage(sheet, 0, 0);
        // Damp sheet dries from darker to its resting tone.
        const damp = .1 * (1 - smooth((t - S(.4)) / S(4.4)));
        if (damp > .002) { ctx.fillStyle = `rgba(120,98,66,${damp.toFixed(3)})`; sheetPath(ctx); ctx.fill(); }
        ctx.restore();
        ctx.globalAlpha = smooth((t - S(.34)) / S(.5)) * mix(1, .55, smooth((t - S(2.2)) / S(2)));
        ctx.drawImage(emboss, 0, 0);
        ctx.globalAlpha = 1;
      }
    }
    applyUpTo(countAt(t));
    if (applied) {
      masked(coverage, mix(1, .95, smooth((t - lastDab.t) / S(.9))), surface, .16);
      masked(coverage, mix(1, .95, smooth((t - lastDab.t) / S(.9))));
    }
    // Wet sheen: the newest dabs sit darker for a moment before soaking in.
    const wetWindow = S(.42);
    let from = countAt(t - wetWindow);
    if (from < applied) {
      wetCtx.clearRect(0, 0, width, height);
      for (; from < applied; from++) {
        const dab = dabs[from];
        stamp(wetCtx, dab, dab.p * 2.4 * (1 - (t - dab.t) / wetWindow) ** 2);
      }
      masked(wet, .5);
    }
    const pad = padState(t);
    if (pad) drawPad(pad);
  }
  render(0);
  return { ...base, visual, dabCount: dabs.length, render };
}
