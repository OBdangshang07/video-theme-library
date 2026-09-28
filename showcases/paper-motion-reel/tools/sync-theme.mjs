import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Freeze the paper-editorial 3.0 theme into assets/theme/. motions.js and transitions.js import
// ./classic/*.js and ./paper-kit.js, so the whole import closure is copied, not just the entry files.
const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const library = path.resolve(project, "../..");
const theme = path.join(library, "themes/paper-editorial");
const output = path.join(project, "assets/theme");
const copy = (from, to) => {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
};

for (const name of ["tokens.css", "components.css", "motions.js", "transitions.js", "advanced-transitions.js",
  "paper-kit.js", "material-utils.js", "rubbing-reveal.js", "movable-type.js",
  "classic/motions.js", "classic/transitions.js", "fonts/source-han-serif-medium.otf"]) {
  copy(path.join(theme, name), path.join(output, name));
}
// Sans and mono faces are bound by url() in assets/theme/fonts/fonts.css so the render never
// depends on locally installed fonts. The serif face above is shared with components.css.
for (const name of ["source-han-sans-regular.otf", "cascadia-mono.ttf"]) {
  copy(path.join(library, "motion-reel/assets/fonts", name), path.join(output, "fonts", name));
}
copy(path.join(library, "motion-reel/assets/gsap.min.js"), path.join(project, "assets/gsap.min.js"));
copy(path.join(library, "showcases/editorial-materials/assets/mirror.svg"), path.join(project, "assets/mirror.svg"));
console.log("Paper motion reel theme assets synced.");
