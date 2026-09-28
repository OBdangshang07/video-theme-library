import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const exec = promisify(execFile);
const FF = process.env.FFMPEG_PATH || "ffmpeg";
const out = process.env.OUTPUT_DIR || path.join(os.tmpdir(), "hf-pg2");
fs.mkdirSync(out, { recursive: true });
const html = fs.readFileSync(process.argv[2], "utf8");
const mp4 = process.argv[3];
const cards = [...html.matchAll(/<section class="rv-card[^"]*" id="([^"]+)" data-start="([\d.]+)" data-duration="([\d.]+)"/g)]
  .map((m) => ({ id: m[1], start: parseFloat(m[2]), dur: parseFloat(m[3]) }));
const shots = [];
for (const c of cards) {
  const t = +(c.start + c.dur - 0.2).toFixed(2);
  const f = out + "/" + c.id + ".png";
  await exec(FF, ["-v", "error", "-ss", String(t), "-i", mp4, "-frames:v", "1", "-vf", "scale=640:-2", "-y", f]);
  shots.push({ id: c.id, t, f });
}
const groups = [shots.slice(0, 9), shots.slice(9, 17), shots.slice(17, 25)];
const names = ["sheetA", "sheetB", "sheetC"];
for (let g = 0; g < groups.length; g++) {
  const grp = groups[g];
  const inputs = grp.flatMap((s) => ["-i", s.f]);
  const layout = grp.map((_, i) => (i % 3) * 640 + "_" + Math.floor(i / 3) * 360).join("|");
  await exec(FF, ["-v", "error", ...inputs, "-filter_complex",
    "xstack=inputs=" + grp.length + ":layout=" + layout, "-frames:v", "1", "-y", out + "/" + names[g] + ".png"],
    { maxBuffer: 1 << 26 });
  console.log(names[g] + ": " + grp.map((s) => s.id).join(", "));
}
