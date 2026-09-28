import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const art = fs.readFileSync(path.join(root, "assets/art/typefield.svg"), "utf8")
  .replace(/^<svg/, '<svg class="ps-forme"');

const DUR = 7.2;
const tabs = [["2026-09-21", true], ["十三件展品", false], ["全片零评分", false], ["素材原速", false]]
  .map(([t, d]) => `<span class="ps-tab${d ? "" : " is-plain"}">${t}</span>`).join("");
const rows = [
  ["测试主体", "GPT-6 Astra", ""],
  ["思考档位", "effort = max", "mono"],
  ["展品数量", "十三件前端作品", ""],
  ["对照设置", "前三件 · 同题并置", ""],
  ["播放规格", "1920×1080 · 18:38 · 原速", "mono"]
].map(([k, v, c]) => `        <div class="ps-ledger-row"><dt>${k}</dt><dd${c ? ' class="mono"' : ""}>${v}</dd></div>`).join("\n");
const ticks = Array.from({ length: 21 }, (_, i) => `<i class="${i % 5 === 0 ? "major" : ""}"></i>`).join("");

const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>主体档案 · GPT-6 Astra</title>
    <link rel="stylesheet" href="assets/fonts/fonts.css" />
    <link rel="stylesheet" href="assets/paper-spec.css" />
    <script src="assets/gsap.min.js"></script>
  </head>
  <body>
    <div id="root" data-composition-id="paper-spec" data-start="0" data-duration="${DUR}" data-width="1920" data-height="1080">
      <div class="ps-scene">
        <div class="ps-grid"></div>
        <div class="ps-folio"><span>GPT-6 ASTRA · 前端作品展</span><span>主体档案 · VOL.01 / 2026</span></div>
        <div class="ps-folio-rule"></div>
        <div class="ps-tabs">${tabs}</div>

        <div class="ps-eyebrow">Model under test · 主体档案</div>
        <h1 class="ps-display">GPT-6 Astra</h1>

        <div class="ps-ledger">
${rows}
        </div>
        <div class="ps-ticks">${ticks}</div>

        <figure class="ps-plate"><div class="ps-field">${art}</div><figcaption>PLATE 01 · 木刻套版 · 源：02 SINGULARITY / 不可见之墙</figcaption></figure>

        <div class="ps-bar"><b>本期主角 · 十三件前端作品原速放完</b><em>GPT-6 Astra</em></div>
        <div class="ps-seal">印</div>
      </div>
    </div>
    <script>
      (function () {
        var tl = gsap.timeline({ paused: true });
        var NR = { immediateRender: false };
        tl.fromTo(".ps-folio", { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "power2.out" }, 0.05);
        tl.fromTo(".ps-folio-rule", { scaleX: 0 }, { scaleX: 1, duration: 0.55, ease: "power2.out" }, 0.18);
        tl.fromTo(".ps-tab", { autoAlpha: 0, y: -8 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.07, ease: "power2.out" }, 0.34);
        tl.fromTo(".ps-eyebrow", { autoAlpha: 0, x: -16 }, { autoAlpha: 1, x: 0, duration: 0.6, ease: "power3.out" }, 0.5);
        tl.fromTo(".ps-display", { clipPath: "inset(100% 0 0 0)", y: 40, autoAlpha: 0 },
          { clipPath: "inset(0% 0 0 0)", y: 0, autoAlpha: 1, duration: 1.0, ease: "expo.out" }, 0.7);
        tl.fromTo(".ps-ticks i", { scaleY: 0 }, { scaleY: 1, duration: 0.3, stagger: 0.018, ease: "power2.out" }, 1.3);
        tl.fromTo(".ps-ledger-row", { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.09, ease: "power3.out" }, 1.5);
        tl.fromTo(".ps-forme text", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, stagger: 0.004, ease: "power1.out" }, 1.1);
        tl.fromTo(".ps-bar", { scaleX: 0 }, { scaleX: 1, duration: 0.72, ease: "power3.inOut" }, 2.9);
        tl.fromTo(".ps-bar b, .ps-bar em", { autoAlpha: 0, x: -22 }, { autoAlpha: 1, x: 0, duration: 0.5, stagger: 0.12, ease: "power3.out" }, 3.45);
        tl.fromTo(".ps-seal", { scale: 2.2, autoAlpha: 0, rotation: -14 }, { scale: 1, autoAlpha: 1, rotation: -3, duration: 0.34, ease: "back.out(2.2)" }, 3.5);
        window.__timelines = window.__timelines || {};
        window.__timelines["paper-spec"] = tl;
        tl.seek(0);
      })();
    </script>
  </body>
</html>
`;
fs.writeFileSync(path.join(root, "index.html"), html);
fs.writeFileSync(path.join(root, "hyperframes.json"), JSON.stringify({ projectId: "video-theme-library-paper-spec", entry: "index.html", compositionId: "paper-spec", output: "renders/paper-spec.mp4" }, null, 2) + "\n");
fs.writeFileSync(path.join(root, "meta.json"), JSON.stringify({ title: "Paper Spec Sheet", description: "主体档案 — paper-editorial spec sheet with a movable-type field." }, null, 2) + "\n");
console.log("built paper-spec:", DUR + "s");
