import fs from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const exec = promisify(execFile);
const FF = process.env.FFMPEG_PATH || "ffmpeg";
const html = fs.readFileSync(process.argv[2], "utf8");
const mp4 = process.argv[3], out = process.argv[4];
fs.mkdirSync(out, { recursive: true });
const cards = [...html.matchAll(/<section class="rv-card[^"]*" id="([^"]+)" data-start="([\d.]+)" data-duration="([\d.]+)"/g)]
  .map((m) => ({ id: m[1], start: +m[2], dur: +m[3] }));
const shots = [];
for (const c of cards) {
  // for motion cards sample mid-motion; for component cards sample settled
  const t = +(c.start + (c.id.match(/strike|pull|seat/) ? c.dur * 0.45 : c.dur - 0.35)).toFixed(2);
  const f = out + "/" + c.id + ".png";
  await exec(FF, ["-v", "error", "-ss", String(t), "-i", mp4, "-frames:v", "1", "-vf", "scale=480:-2", "-y", f]);
  shots.push({ ...c, t, f });
}
const inputs = shots.flatMap((s) => ["-i", s.f]);
const layout = shots.map((_, i) => (i % 5) * 480 + "_" + Math.floor(i / 5) * 270).join("|");
await exec(FF, ["-v", "error", ...inputs, "-filter_complex",
  "xstack=inputs=" + shots.length + ":layout=" + layout, "-frames:v", "1", "-y", out + "/sheet.png"], { maxBuffer: 1 << 26 });
console.log(shots.map((s) => s.id + "@" + s.t).join("  "));
