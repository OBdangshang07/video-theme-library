// Per-card layout audit: where does the content actually sit on the canvas, and
// is anything running off an edge?
import fs from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const exec = promisify(execFile);
const FF = process.env.FFMPEG_PATH || "ffmpeg";
const html = fs.readFileSync(process.argv[2], "utf8");
const mp4 = process.argv[3];
const W = 192, H = 82;          // crop below the folio and above the rail
const CROP = "crop=1920:820:0:180";
const cards = [...html.matchAll(/<section class="rv-card[^"]*" id="([^"]+)" data-start="([\d.]+)" data-duration="([\d.]+)"/g)]
  .map((m) => ({ id: m[1], start: parseFloat(m[2]), dur: parseFloat(m[3]) }));

console.log("card".padEnd(24) + "content box (full-res px)".padEnd(34) + "centre".padEnd(16) + "flags");
for (const c of cards) {
  const t = +(c.start + c.dur - 0.2).toFixed(2);
  const { stdout } = await exec(FF, ["-v", "error", "-ss", String(t), "-i", mp4, "-frames:v", "1",
    "-vf", CROP + ",scale=" + W + ":" + H + ",format=gray", "-f", "rawvideo", "-"], { encoding: "buffer", maxBuffer: 1 << 22 });
  // paper is the dominant value; anything far from it is content
  const hist = new Array(256).fill(0);
  for (let i = 0; i < W * H; i++) hist[stdout[i]]++;
  let bg = 0;
  for (let v = 1; v < 256; v++) if (hist[v] > hist[bg]) bg = v;
  let x0 = W, y0 = H, x1 = -1, y1 = -1, n = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (Math.abs(stdout[y * W + x] - bg) > 26) {
      n++;
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
  }
  const sx = 1920 / W, sy = 820 / H, yOff = 180;
  const bx0 = Math.round(x0 * sx), bx1 = Math.round((x1 + 1) * sx);
  const by0 = Math.round(y0 * sy) + yOff, by1 = Math.round((y1 + 1) * sy) + yOff;
  const cx = Math.round((bx0 + bx1) / 2), cy = Math.round((by0 + by1) / 2);
  const flags = [];
  if (x0 <= 0 || x1 >= W - 1) flags.push("CLIPPED-X");
  if (y0 <= 0 || y1 >= H - 1) flags.push("CLIPPED-Y");
  if (Math.abs(cx - 960) > 190) flags.push("off-centre-x");
  if (n < 60) flags.push("nearly empty");
  console.log(c.id.padEnd(24) + (bx0 + "," + by0 + " -> " + bx1 + "," + by1).padEnd(34) +
    ((cx - 960 >= 0 ? "+" : "") + (cx - 960) + "," + (cy - 540 >= 0 ? "+" : "") + (cy - 540)).padEnd(16) +
    flags.join(" "));
}
