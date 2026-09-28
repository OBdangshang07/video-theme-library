#!/usr/bin/env node
// Image -> ASCII field.
//
// The form comes from COLOUR, not from glyph density: every cell gets a
// pseudo-random glyph out of a fixed pool, and the image's luminance drives the
// cell's colour and opacity. That is what makes it read as a scan rather than as
// a 1990s ASCII dump — and it keeps the glyph texture uniform, so the subject
// resolves out of a flat field of type.
//
// Deterministic: the glyph picker is a seeded LCG, so the same image always
// produces the same field.
import fs from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const exec = promisify(execFile);
const FF = process.env.FFMPEG_PATH || "ffmpeg";
const FP = process.env.FFPROBE_PATH || "ffprobe";

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf("--" + k); return i >= 0 ? args[i + 1] : d; };
const img = args[0], out = args[1];
const cols = +opt("cols", 100);
const font = +opt("font", 16);
const POOL = opt("pool", "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#$%&*+=<>/|_~^");
const RAMP = [
  [0.00, [8, 20, 44]],
  [0.28, [22, 48, 102]],
  [0.52, [58, 96, 158]],
  [0.75, [130, 164, 206]],
  [1.00, [206, 220, 238]]
];
const ACCENT = [[37, 99, 235], [22, 163, 74], [217, 119, 6]];

const dim = JSON.parse((await exec(FP, ["-v", "error", "-print_format", "json",
  "-select_streams", "v:0", "-show_entries", "stream=width,height", img])).stdout);
const iw = dim.streams[0].width, ih = dim.streams[0].height;
const rows = Math.max(6, Math.round(cols * (ih / iw) * 0.5));
const { stdout } = await exec(FF, ["-v", "error", "-i", img, "-vf",
  "scale=" + cols + ":" + rows + ":flags=area", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
  { encoding: "buffer", maxBuffer: 1 << 26 });

const lum = new Float32Array(cols * rows);
for (let i = 0; i < cols * rows; i++) {
  const r = stdout[i * 3], g = stdout[i * 3 + 1], b = stdout[i * 3 + 2];
  lum[i] = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}
const pick = (L) => {
  for (let i = 0; i < RAMP.length - 1; i++) {
    const [a, ca] = RAMP[i], [b, cb] = RAMP[i + 1];
    if (L <= b) {
      const t = (L - a) / (b - a || 1);
      return [0, 1, 2].map((k) => Math.round(ca[k] + (cb[k] - ca[k]) * t));
    }
  }
  return RAMP[RAMP.length - 1][1];
};
// edge cells get the accent colours — that is what makes the subject pop
const edge = new Float32Array(cols * rows);
for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
  const i = y * cols + x;
  const gx = Math.abs((lum[i + 1] || lum[i]) - (lum[i - 1] || lum[i]));
  const gy = Math.abs((lum[i + cols] || lum[i]) - (lum[i - cols] || lum[i]));
  edge[i] = gx + gy;
}
const lcg = (s) => () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
const rnd = lcg(20260921);

const cw = font * 0.6, ch = font;
const W = Math.ceil(cols * cw), H = Math.ceil(rows * ch) + font;
let svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + " " + H + '" width="' + W + '" height="' + H + '">';
svg += '<rect width="' + W + '" height="' + H + '" fill="#ffffff"/>';
// the scan header: a run of glyphs in the accent colours
let head = "";
for (let x = 0; x < Math.min(cols, 26); x++) {
  const c = ACCENT[Math.floor(rnd() * ACCENT.length)];
  head += '<tspan fill="rgb(' + c.join(",") + ')">' + POOL[Math.floor(rnd() * POOL.length)] + "</tspan>";
}
svg += '<text x="0" y="' + font + '" font-family="SC Mono" font-size="' + font + '" ' +
  'dominant-baseline="hanging" xml:space="preserve">' + head + "</text>";
for (let y = 0; y < rows; y++) {
  let row = "";
  let run = null, buf = "";
  for (let x = 0; x < cols; x++) {
    const i = y * cols + x;
    let col = pick(lum[i]);
    if (edge[i] > 0.42 && lum[i] < 0.8) col = ACCENT[Math.floor(rnd() * ACCENT.length)];
    const g = POOL[Math.floor(rnd() * POOL.length)];
    const op = (0.74 + lum[i] * 0.26).toFixed(2);
    const key = col.join(",") + "|" + op;
    if (key !== run) {
      if (buf) row += '<tspan fill="rgb(' + run.split("|")[0] + ')" opacity="' + run.split("|")[1] + '">' + buf + "</tspan>";
      run = key; buf = "";
    }
    buf += g === "&" ? "&amp;" : g === "<" ? "&lt;" : g === ">" ? "&gt;" : g;
  }
  if (buf) row += '<tspan fill="rgb(' + run.split("|")[0] + ')" opacity="' + run.split("|")[1] + '">' + buf + "</tspan>";
  svg += '<text x="0" y="' + (font * 2 + y * ch) + '" font-family="SC Mono" font-size="' + font + '" ' +
    'dominant-baseline="hanging" xml:space="preserve">' + row + "</text>";
}
svg += "</svg>";
fs.writeFileSync(out, svg);
console.log(img.split(/[\\/]/).pop() + " -> " + out + "  grid " + cols + "x" + rows + "  (" + (cols * rows) + " cells, " + Math.round(svg.length / 1024) + " KB)");
