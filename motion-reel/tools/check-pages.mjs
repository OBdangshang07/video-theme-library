import fs from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const exec = promisify(execFile);
const FF = process.env.FFMPEG_PATH || "ffmpeg";
const html = fs.readFileSync(process.argv[2], "utf8");
const mp4 = process.argv[3];
const out = process.argv[4];
const cards = [...html.matchAll(/<section class="rv-card[^"]*" id="([^"]+)" data-start="([\d.]+)" data-duration="([\d.]+)"/g)]
  .map((m) => ({ id: m[1], start: parseFloat(m[2]), dur: parseFloat(m[3]) }));
console.log("cards:", cards.length);
fs.mkdirSync(out, { recursive: true });
const shots = [];
for (const c of cards) {
  const t = +(c.start + c.dur - 0.2).toFixed(2);
  const f = out + "/" + c.id + ".png";
  await exec(FF, ["-v", "error", "-ss", String(t), "-i", mp4, "-frames:v", "1", "-vf", "scale=384:-2", "-y", f]);
  shots.push({ ...c, t, f });
}
const inputs = shots.flatMap((s) => ["-i", s.f]);
const cols = 5;
const layout = shots.map((_, i) => (i % cols) * 384 + "_" + Math.floor(i / cols) * 216).join("|");
await exec(FF, ["-v", "error", ...inputs, "-filter_complex",
  "xstack=inputs=" + shots.length + ":layout=" + layout, "-frames:v", "1", "-y", out + "/sheet.png"],
  { maxBuffer: 1 << 26 });
console.log("sheet:", out + "/sheet.png");
console.log(shots.map((s, i) => (i + 1) + "." + s.id + "@" + s.t).join("  "));
