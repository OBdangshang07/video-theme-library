import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const library = path.resolve(project, "../..");
const theme = path.join(library, "themes/paper-editorial");
const output = path.join(project, "assets/theme");
fs.mkdirSync(path.join(output, "fonts"), { recursive: true });
for (const name of ["tokens.css", "components.css", "motions.js", "material-utils.js",
  "movable-type.js", "rubbing-reveal.js", "paper-cutaway.js"]) {
  fs.copyFileSync(path.join(theme, name), path.join(output, name));
}
fs.copyFileSync(path.join(theme, "fonts/source-han-serif-medium.otf"),
  path.join(output, "fonts/source-han-serif-medium.otf"));
fs.copyFileSync(path.join(library, "motion-reel/assets/gsap.min.js"),
  path.join(project, "assets/gsap.min.js"));
console.log("Editorial materials showcase assets synced.");
