#!/usr/bin/env node
// 活字墨谱 — an image printed out of movable type.
//
// This is the paper-editorial answer to a character-field hero image: the same
// idea (form carried by colour over a uniform field of glyphs) but struck in
// Song type and ink instead of a monospace terminal. Every cell takes a
// pseudo-random glyph from a pool of stroke-bearing characters; the image's
// luminance drives the ink density, and high-gradient cells are struck in
// vermilion so the subject's contour lifts off the page.
//
// Deterministic: the picker is a seeded LCG, so the same image always strikes
// the same forme.
import fs from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const exec = promisify(execFile);
const FF = process.env.FFMPEG_PATH || "ffmpeg";
const FP = process.env.FFPROBE_PATH || "ffprobe";

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf("--" + k); return i >= 0 ? args[i + 1] : d; };
const img = args[0], out = args[1];
const cols = +opt("cols", 52);
const font = +opt("font", 24);
const FAMILY = opt("family", "PE Serif SC");
// radicals and stroke-bearing characters — a forme of type, not a paragraph
const POOL = opt("pool",
  "一丨丶丿乙亅二三十干工土士艹寸大尢弋小口囗山巾彳彡夕夂丬广廴廾弓彐心戈户手支攴文斗斤方无日曰月木欠止歹殳毋比毛氏气水火爪父爻爿片牙牛犬玄玉瓜瓦甘生用田疋疒癶白皮皿目矛矢石示禸禾穴立")
  .split("");
const RAMP = [
  [0.00, [26, 31, 36]],
  [0.32, [58, 60, 62]],
  [0.58, [122, 120, 112]],
  [0.80, [176, 168, 148]],
  [1.00, [214, 202, 176]]
];
const VERMILION = [184, 59, 47];

const dim = JSON.parse((await exec(FP, ["-v", "error", "-print_format", "json",
  "-select_streams", "v:0", "-show_entries", "stream=width,height", img])).stdout);
const iw = dim.streams[0].width, ih = dim.streams[0].height;
const rows = Math.max(6, Math.round(cols * (ih / iw)));
const { stdout } = await exec(FF, ["-v", "error", "-i", img, "-vf",
  "scale=" + cols + ":" + rows + ":flags=area", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
  { encoding: "buffer", maxBuffer: 1 << 26 });

const lum = new Float32Array(cols * rows);
for (let i = 0; i < cols * rows; i++) {
  lum[i] = (0.2126 * stdout[i * 3] + 0.7152 * stdout[i * 3 + 1] + 0.0722 * stdout[i * 3 + 2]) / 255;
}
const rampAt = (L) => {
  for (let i = 0; i < RAMP.length - 1; i++) {
    const [a, ca] = RAMP[i], [b, cb] = RAMP[i + 1];
    if (L <= b) { const t = (L - a) / (b - a || 1); return [0, 1, 2].map((k) => Math.round(ca[k] + (cb[k] - ca[k]) * t)); }
  }
  return RAMP[RAMP.length - 1][1];
};
const edge = new Float32Array(cols * rows);
for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
  const i = y * cols + x;
  const gx = Math.abs((lum[i + 1] ?? lum[i]) - (lum[i - 1] ?? lum[i]));
  const gy = Math.abs((lum[i + cols] ?? lum[i]) - (lum[i - cols] ?? lum[i]));
  edge[i] = gx + gy;
}
const lcg = (s) => () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
const rnd = lcg(20260921);

let drawn = 0, struck = 0;
const W = cols * font, H = rows * font;
let svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + " " + H + '" width="' + W + '" height="' + H + '">';
for (let y = 0; y < rows; y++) {
  for (let x = 0; x < cols; x++) {
    const i = y * cols + x;
    const L = lum[i];
    const glyph = POOL[Math.floor(rnd() * POOL.length)];
    // ink coverage rises as the image darkens
    const ink = 1 - L;
    if (ink < 0.06) continue;                       // bare paper: no type at all
    let col = rampAt(L), op = Math.min(1, 0.35 + ink * 0.72);
    if (edge[i] > 0.5 && ink > 0.3) { col = VERMILION; op = Math.min(1, op + 0.16); struck++; }
    drawn++;
    svg += '<text x="' + (x * font) + '" y="' + (y * font) + '" font-family="' + FAMILY +
      '" font-size="' + font + '" dominant-baseline="hanging" fill="rgb(' + col.join(",") +
      ')" opacity="' + op.toFixed(2) + '">' + glyph + "</text>";
  }
}
svg += "</svg>";
fs.writeFileSync(out, svg);
console.log("type field " + cols + "x" + rows + " -> " + out + "  (" + drawn + " struck, " + struck + " in vermilion, " + Math.round(svg.length / 1024) + " KB)");
