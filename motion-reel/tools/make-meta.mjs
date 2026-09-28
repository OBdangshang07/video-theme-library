import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const reel = path.resolve(here, "..");
const theme = path.resolve(reel, "../themes/paper-editorial");
const src = fs.readFileSync(path.join(theme, "motions.js"), "utf8");
const block = src.slice(src.indexOf("paperEditorialMotionMeta"));
const re = /"([a-z0-9-]+)":\{label:"([^"]+)",duration:([\d.]+)/g;
const out = [];
let m;
while ((m = re.exec(block))) out.push({ id: m[1], label: m[2], duration: parseFloat(m[3]) });
// handoff-swap is a 3.9s sequence even though its meta duration is nominal
for (const row of out) if (row.id === "handoff-swap") row.duration = 3.9;
fs.writeFileSync(path.join(reel, "motion-meta.json"), JSON.stringify(out, null, 2) + "\n");
console.log("motions:", out.length, "|", out.map((o) => o.id).join(", "));
