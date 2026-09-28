// Builds the spec-sheet composition, inlining the generated ASCII field so GSAP
// can scan it row by row (an <img> would be one opaque node).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
// Keep the <svg> wrapper: stripped, its <text> nodes become bare HTML and the
// whole field renders as literal text.
const art = fs.readFileSync(path.join(root, "assets/art/blackhole.svg"), "utf8")
  .replace(/^<svg/, '<svg class="ss-field"');
const project = process.env.SOURCE_PROJECT_DIR;
if (!project) throw new Error("Set SOURCE_PROJECT_DIR to the source showcase project before rebuilding the sheet.");
const gsap = fs.readFileSync(path.join(project, "assets/lib/gsap.min.js"), "utf8");
fs.mkdirSync(path.join(root, "assets/lib"), { recursive: true });
fs.writeFileSync(path.join(root, "assets/lib/gsap.min.js"), gsap);

const DUR = 6.8;
const chips = [
  ["2026-09-21", true], ["十三件展品", false], ["全片零评分", false], ["素材原速", false]
].map(([t, dot]) => `<span class="ss-chip${dot ? "" : " is-plain"}">${dot ? "<i></i>" : ""}${t}</span>`).join("");
const rows = [
  ["测试主体", "GPT-6 Astra", ""],
  ["思考档位", "effort = max", "mono"],
  ["展品数量", "十三件前端作品", ""],
  ["对照设置", "前三件 · 同题并置", ""],
  ["播放规格", "1920×1080 · 18:38 · 原速", "mono"]
].map(([k, v, c]) => `        <div class="ss-spec-row"><dt>${k}</dt><dd${c ? ' class="mono"' : ""}>${v}</dd></div>`).join("\n");

const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>spec-sheet · GPT-6 Astra</title>
    <link rel="stylesheet" href="assets/fonts/fonts.css" />
    <link rel="stylesheet" href="assets/spec-sheet.css" />
    <script src="assets/lib/gsap.min.js"></script>
  </head>
  <body>
    <div id="root" data-composition-id="spec-sheet" data-start="0" data-duration="${DUR}" data-width="1920" data-height="1080">
      <div class="ss-scene">
        <div class="ss-chips">${chips}</div>
        <div class="ss-rule-top"></div>
        <div class="ss-folio">SPEC SHEET · VOL.01 / 2026</div>

        <div class="ss-eyebrow">Model under test</div>
        <h1 class="ss-display">GPT-6 Astra</h1>
        <dl class="ss-spec">
${rows}
        </dl>

        <div class="ss-art" id="art">
${art}
        </div>

        <div class="ss-banner"><b>本期主角 · 十三件前端作品原速放完</b><em>GPT-6 Astra</em></div>
      </div>
    </div>
    <script>
      (function () {
        var tl = gsap.timeline({ paused: true });
        var NR = { immediateRender: false };
        // one rule draws, then the whispers, then the shout
        tl.fromTo(".ss-rule-top", { scaleX: 0 }, { scaleX: 1, duration: 0.55, ease: "power2.out" }, 0);
        tl.fromTo(".ss-folio", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "power2.out" }, 0.16);
        tl.fromTo(".ss-chip", { autoAlpha: 0, y: -8 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.07, ease: "power2.out" }, 0.30);
        tl.fromTo(".ss-eyebrow", { autoAlpha: 0, x: -16 }, { autoAlpha: 1, x: 0, duration: 0.62, ease: "power3.out" }, 0.52);
        tl.fromTo(".ss-display", { clipPath: "inset(100% 0 0 0)", y: 44, autoAlpha: 0 },
          { clipPath: "inset(0% 0 0 0)", y: 0, autoAlpha: 1, duration: 1.0, ease: "expo.out" }, 0.72);
        // the hairline table types itself in
        tl.fromTo(".ss-spec-row", { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.085, ease: "power3.out" }, 1.42);
        // the scan resolves the subject out of the character field
        tl.fromTo(".ss-field text", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.55, stagger: 0.014, ease: "power1.out" }, 1.05);
        tl.fromTo(".ss-art", { autoAlpha: 0.001 }, { autoAlpha: 1, duration: 0.4 }, 1.05);
        tl.fromTo(".ss-banner", { scaleX: 0 }, { scaleX: 1, duration: 0.72, ease: "power3.inOut" }, 2.55);
        tl.fromTo(".ss-banner b, .ss-banner em", { autoAlpha: 0, x: -22 },
          { autoAlpha: 1, x: 0, duration: 0.5, stagger: 0.12, ease: "power3.out" }, 3.10);
        window.__timelines = window.__timelines || {};
        window.__timelines["spec-sheet"] = tl;
        tl.seek(0);
      })();
    </script>
  </body>
</html>
`;
fs.writeFileSync(path.join(root, "index.html"), html);
fs.writeFileSync(path.join(root, "hyperframes.json"), JSON.stringify({ projectId: "video-theme-library-spec-sheet", entry: "index.html", compositionId: "spec-sheet", output: "renders/spec-sheet.mp4" }, null, 2) + "\n");
fs.writeFileSync(path.join(root, "meta.json"), JSON.stringify({ title: "Spec Sheet", description: "Instrument-panel model spec sheet with a generated ASCII portrait field." }, null, 2) + "\n");
console.log("built spec-sheet composition:", DUR + "s");
