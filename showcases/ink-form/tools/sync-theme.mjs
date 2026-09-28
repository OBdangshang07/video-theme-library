import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const project = path.resolve(here, "..");
const library = path.resolve(project, "../..");
const theme = path.join(library, "themes/paper-editorial");
const output = path.join(project, "assets/theme");
fs.mkdirSync(path.join(output, "fonts"), { recursive: true });
for (const name of ["tokens.css", "components.css", "motions.js", "ink-form.js"]) {
  fs.copyFileSync(path.join(theme, name), path.join(output, name));
}
fs.copyFileSync(path.join(theme, "fonts/source-han-serif-medium.otf"),
  path.join(output, "fonts/source-han-serif-medium.otf"));
fs.copyFileSync(path.join(library, "motion-reel/assets/gsap.min.js"),
  path.join(project, "assets/gsap.min.js"));
console.log("Ink form showcase theme assets synced.");
