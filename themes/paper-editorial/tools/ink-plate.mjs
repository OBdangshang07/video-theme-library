#!/usr/bin/env node
// 木刻谱 — an image cut into flat ink plates.
//
// Not a character field: the frame is posterised into a few ink bands and each
// band is emitted as flat horizontal runs, so the result reads as a woodblock
// impression (or a rubbing) rather than as type. The darkest band can be struck
// as a second vermilion plate, which is how a two-colour print actually works.
//
// Deterministic and vector: the SVG scales without resampling.
import fs from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const exec = promisify(execFile);
const FF = process.env.FFMPEG_PATH || "ffmpeg";
const FP = process.env.FFPROBE_PATH || "ffprobe";

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf("--" + k); return i >= 0 ? args[i + 1] : d; };
const img = args[0], out = args[1];
const W = +opt("w", 168);                 // plate resolution (cells)
// Band ceilings are a per-image decision, not a constant. A night shot whose
// ground sits at L 0.12 must not be cut so that the whole ground becomes 深墨 —
// that prints a solid black block and the cuts stop reading. --bands 0.08,0.42,0.70
// pushes the ground into 中墨 and keeps 深墨 for the true shadow.
const BANDS = (opt("bands", "0.30,0.56,0.78")).split(",").map(Number);
const PLATES = [
  { max: BANDS[0], fill: "#20262c" },      // 深墨
  { max: BANDS[1], fill: "#6f7377" },      // 中墨
  { max: BANDS[2], fill: "#a9a396" }       // 淡墨
];
const KEY = opt("key", "#b83b2f");         // 朱红套版; pass --key none to skip
const KEY_BAND = +opt("keyBand", 0);

const dim = JSON.parse((await exec(FP, ["-v", "error", "-print_format", "json",
  "-select_streams", "v:0", "-show_entries", "stream=width,height", img])).stdout);
const iw = dim.streams[0].width, ih = dim.streams[0].height;
const H = Math.max(8, Math.round(W * (ih / iw)));
const { stdout } = await exec(FF, ["-v", "error", "-i", img, "-vf",
  "scale=" + W + ":" + H + ":flags=area,format=gray", "-f", "rawvideo", "-"],
  { encoding: "buffer", maxBuffer: 1 << 26 });

const bandOf = (v) => { const L = v / 255; for (let i = 0; i < PLATES.length; i++) if (L <= PLATES[i].max) return i; return -1; };
const runs = PLATES.map(() => []);
for (let y = 0; y < H; y++) {
  const line = PLATES.map(() => []);
  let cur = -2, start = 0;
  for (let x = 0; x <= W; x++) {
    const b = x < W ? bandOf(stdout[y * W + x]) : -2;
    if (b !== cur) {
      if (cur >= 0 && x > start) line[cur].push([start, x]);
      cur = b; start = x;
    }
  }
  line.forEach((rs, i) => { if (rs.length) runs[i].push([y, rs]); });
}

const cw = 1000 / W;
let svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 ' + Math.round(H * cw) + '" width="1000" height="' + Math.round(H * cw) + '">';
let cells = 0;
const pathFor = (rows, fill) => {
  let d = "";
  for (const [y, rs] of rows) for (const [x0, x1] of rs) {
    d += "M" + (x0 * cw).toFixed(2) + " " + (y * cw).toFixed(2) +
         "h" + ((x1 - x0) * cw).toFixed(2) + "v" + cw.toFixed(2) + "h" + (-(x1 - x0) * cw).toFixed(2) + "z";
    cells += x1 - x0;
  }
  svg += '<path fill="' + fill + '" d="' + d + '"/>';
};
// Document order IS the printing order: the light plate goes down first, then
// the mid tone, and the key plate is struck last — that is how a two-colour
// block print is pulled, and plate-strike simply staggers down this list.
// Emitting the darkest band first would lay the key colour under the two tints.
const isKey = (i) => KEY !== "none" && i === KEY_BAND;
for (let i = PLATES.length - 1; i >= 0; i--) {
  if (!runs[i].length || isKey(i)) continue;
  pathFor(runs[i], PLATES[i].fill);
}
if (KEY !== "none" && runs[KEY_BAND] && runs[KEY_BAND].length) pathFor(runs[KEY_BAND], KEY);
svg += "</svg>";
fs.writeFileSync(out, svg);
console.log("ink plates " + W + "x" + H + " -> " + out + "  (" + cells + " inked cells, " + Math.round(svg.length / 1024) + " KB)");
