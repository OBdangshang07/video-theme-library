// Builds the paper-editorial motion reel: one HyperFrames composition that plays
// every motion in the theme, one card at a time, driven by the theme's real modules.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const reel = path.resolve(here, "..");
const theme = path.resolve(reel, "../themes/paper-editorial");
const project = process.env.SOURCE_PROJECT_DIR;
if (!project) throw new Error("Set SOURCE_PROJECT_DIR to the source showcase project before rebuilding the reel.");

fs.mkdirSync(path.join(reel, "assets/theme"), { recursive: true });
fs.mkdirSync(path.join(reel, "assets/fonts"), { recursive: true });
for (const f of ["tokens.css", "components.css"]) fs.copyFileSync(path.join(theme, f), path.join(reel, "assets/theme", f));
for (const f of ["fonts.css", "source-han-serif-medium.otf", "source-han-sans-regular.otf", "cascadia-mono.ttf"]) {
  const src = path.join(project, "assets/fonts", f);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(reel, "assets/fonts", f));
}
fs.copyFileSync(path.join(project, "assets/lib/gsap.min.js"), path.join(reel, "assets/gsap.min.js"));

// the theme ships ESM; the composition needs a classic script
// A classic script's top-level const does NOT become a window property, so the
// bundle has to export it by hand.
const motionsSrc = fs.readFileSync(path.join(theme, "motions.js"), "utf8")
  .replace(/^export /gm, "") +
  "\nwindow.paperEditorialMotions = paperEditorialMotions;\nwindow.paperEditorialMotionMeta = paperEditorialMotionMeta;\n";
fs.writeFileSync(path.join(reel, "assets/motions.global.js"), motionsSrc);

const META = JSON.parse(fs.readFileSync(path.join(reel, "motion-meta.json"), "utf8"));

// ---- per-motion demo stage -------------------------------------------------
const stamp = '<i class="s-stamp">印</i>';
const STAGES = {
  "ink-slam": '<div class="s-title">墨定标题</div>',
  "paper-rise": '<div class="s-panels"><div class="s-panel">纸面板块</div><div class="s-panel">纸面板块</div><div class="s-panel">纸面板块</div></div>',
  "bar-draw": '<div class="s-bar"><span></span></div><div class="s-barcap">证据绘条 0.95s</div>',
  "cascade-list": '<div class="s-rows"><div class="s-row"><b>01</b>级联清单</div><div class="s-row"><b>02</b>级联清单</div><div class="s-row"><b>03</b>级联清单</div><div class="s-row"><b>04</b>级联清单</div></div>',
  "editorial-wipe": '<div class="s-wipe"><span>版面拭入</span></div>',
  "stamp-impact": stamp,
  "underline-draw": '<div class="s-ulwrap"><span class="s-ultext">批注下划线</span><i class="s-ul"></i></div>',
  "folio-swap": '<div class="s-folio">GPT-6 ASTRA · 前端作品展　　VOL.01 / 2026</div>',
  "red-result-emphasis": '<div class="s-num">87.4</div>',
  "count-up": '<div class="s-count">0</div>',
  "ghost-settle": '<div class="s-ghost">编辑部</div>',
  "quote-reveal": '<div class="pe-quote s-quote"><blockquote>信息设计的价值，<br>在于快速建立阅读重点。</blockquote><cite>EDITORIAL NOTE</cite></div>',
  "chapter-mark": '<div class="pe-chapter s-chapter"><div class="pe-chapter-index">02</div><div class="pe-chapter-body"><div class="pe-chapter-kicker">CHAPTER</div><div class="pe-chapter-title">证据与方法</div><div class="pe-chapter-rule"></div></div></div>',
  "end-lock": '<div class="pe-end s-end"><div class="pe-end-line">一套主题，</div><div class="pe-end-line">覆盖多类内容<span class="pe-end-mark">。</span></div><div class="pe-end-note">PAPER EDITORIAL · 2026</div></div>',
  "screening-unveil": '<div class="pe-screening s-screening"><header class="pe-screening-head"><b class="pe-screening-index">06</b><span class="pe-screening-title"><strong>主体名称</strong><small><span class="pe-screening-work">《条目名称》</span></small></span></header><div class="pe-screening-frame"></div><div class="pe-screening-spine">CURATED SCREENING</div><div class="pe-screening-edition">VOL.01</div><i class="pe-screening-crop tl"></i><i class="pe-screening-crop tr"></i><i class="pe-screening-crop bl"></i><i class="pe-screening-crop br"></i><footer class="pe-screening-footer"><span>EXHIBITION</span><span>00:52 · 06/13</span></footer><div class="pe-screening-progress"><span></span></div></div><div class="s-well"></div>',
  "line-set": '<div class="s-lines"><div class="s-line">一行字，从基线印出来</div><div class="s-line">第二行按同样的方式定版</div><div class="s-line">第三行跟上</div></div>',
  "slate-flight": '<div class="s-flight"><b class="s-fidx">06</b><h2 class="s-ftitle">主体名称</h2></div>',
  "window-surface": '<div class="s-surface"></div>',
  "seal-press": '<div class="s-presswrap"><div class="s-press">印</div><i class="s-bleed"></i></div>',
  "seal-sheet": '<div class="s-sheet"><i class="s-seal"><span class="s-seal-in">01</span></i><i class="s-seal"><span class="s-seal-in">02</span></i><i class="s-seal"><span class="s-seal-in">03</span></i><i class="s-seal"><span class="s-seal-in">04</span></i><i class="s-seal"><span class="s-seal-in">05</span></i><i class="s-seal"><span class="s-seal-in">06</span></i></div>',
  "compare-pair": '<div class="pe-compare s-compare"><div class="cm-stage"><p class="cm-kicker">COMPARISON · 对照小结</p><h2 class="cm-title">同一命题下的两种做法</h2><div class="cm-grid"><article class="cm-col"><h3>原作品</h3><dl class="cm-rows"><div class="cm-row"><dt>命题</dt><dd>自我介绍</dd></div><div class="cm-row"><dt>分辨率</dt><dd>1920×930</dd></div></dl></article><article class="cm-col dark"><h3>对照作品</h3><dl class="cm-rows"><div class="cm-row"><dt>命题</dt><dd>自我介绍</dd></div><div class="cm-row"><dt>分辨率</dt><dd>2560×1242</dd></div></dl></article></div></div></div>',
  "handoff-swap": '<div class="handoff-frame"><div class="handoff-head"><p class="handoff-kicker">COMPARISON · 对照</p><h2 class="handoff-thesis">同一命题 · 另一模型</h2></div><div class="handoff-deck"><div class="handoff-zone out"><p class="handoff-role">原作 · ORIGINAL</p><p class="handoff-model" style="font-size:64px">GPT-6 ASTRA</p><p class="handoff-work">《BETWEEN · 之间》</p></div><div class="handoff-zone in"><span class="handoff-bloom" data-layout-ignore></span><span class="handoff-seal" data-layout-ignore></span><p class="handoff-role">对照作品 · COMPARISON</p><p class="handoff-model" style="font-size:64px"><span>O</span><span>P</span><span>U</span><span>S</span><span>&nbsp;</span><span>5</span></p><p class="handoff-work">《线 LOOM》</p></div></div><div class="handoff-centre" data-layout-ignore></div><div class="handoff-brush" data-layout-ignore><svg viewBox="0 0 2440 220" aria-hidden="true"><path class="brush-body" d="M10 128 C 320 84, 800 60, 1320 72 C 1800 83, 2170 102, 2432 116 C 2170 142, 1810 162, 1320 172 C 820 182, 340 172, 10 150 Z"/><path class="brush-tail" d="M14 158 C 420 188, 1120 190, 2420 132 C 2140 176, 1520 208, 820 206 C 430 204, 160 186, 14 168 Z"/></svg></div><i class="handoff-splat" data-dx="220" data-dy="-140"></i><i class="handoff-splat" data-dx="300" data-dy="120"></i><i class="handoff-splat" data-dx="-200" data-dy="160"></i><p class="handoff-caption">SAME BRIEF · DIFFERENT MODEL</p><p class="handoff-foot">命题 · 一句话说明</p></div>',  "paper-drift": '<div class="s-drift"></div><div class="s-driftcap">纸面漂移 · 整场底噪</div>'
};
// components that position themselves in full 1920x1080 space
const FULL = new Set(["quote-reveal", "chapter-mark", "end-lock", "screening-unveil", "compare-pair", "handoff-swap", "slate-flight", "paper-drift"]);
const CALLS = {
  "ink-slam": (s) => `M.inkSlam(tl,"${s} .s-title",0);`,
  "paper-rise": (s) => `M.paperRise(tl,"${s} .s-panel",0,0.14);`,
  "bar-draw": (s) => `M.barDraw(tl,"${s} .s-bar > span",0);`,
  "cascade-list": (s) => `M.cascadeList(tl,"${s} .s-row",0);`,
  "editorial-wipe": (s) => `M.editorialWipe(tl,"${s} .s-wipe",0);`,
  "stamp-impact": (s) => `M.stampImpact(tl,"${s} .s-stamp",0);`,
  "underline-draw": (s) => `M.underlineDraw(tl,"${s} .s-ul",0);`,
  "folio-swap": (s) => `M.folioSwap(tl,"${s} .s-folio",0);`,
  "red-result-emphasis": (s) => `M.redResultEmphasis(tl,"${s} .s-num",0);`,
  "count-up": (s) => `M.countUp(tl,"${s} .s-count",0,87.4);`,
  "ghost-settle": (s) => `M.ghostSettle(tl,"${s} .s-ghost",0);`,
  "quote-reveal": (s) => `M.quoteReveal(tl,"${s}",0);`,
  "chapter-mark": (s) => `M.chapterMark(tl,"${s}",0);`,
  "end-lock": (s) => `M.endLock(tl,"${s}",0);`,
  "screening-unveil": (s) => `M.screeningUnveil(tl,"${s}",0,0);`,
  "line-set": (s) => `M.lineSet(tl,"${s} .s-line",0,{rise:22,stagger:.1});`,
  "slate-flight": (s) => `M.slateFlight(tl,[["${s} .s-fidx",{from:{x:-24,y:150,scale:2.3},to:{x:-40,y:-230,scale:.45}}],["${s} .s-ftitle",{from:{x:-24,y:250,scale:2.7},to:{x:60,y:-300,scale:.45}}]],0,.86);`,
  "window-surface": (s) => `M.windowSurface(tl,"${s} .s-surface",0);`,
  "seal-press": (s) => `M.sealPress(tl,"${s} .s-press",0,{bloom:"${s} .s-bleed"});`,
  "seal-sheet": (s) => `M.sealSheet(tl,"${s} .s-seal",0,{inner:"${s} .s-seal-in",stagger:.1,duration:.3});`,
  "compare-pair": (s) => `M.comparePair(tl,"${s}",0);`,
  "handoff-swap": (s) => `M.handoffSwap(tl,"${s}",0);`,
  "paper-drift": (s) => `M.paperDrift(tl,[["${s} .s-drift",0,3.2]],{});`
};

const LEAD = 1.0, TAIL = 0.55;
let t = 0;
const cards = [];
cards.push({ id: "intro", name: "宣纸编辑部", en: "PAPER EDITORIAL", dur: 3.6, at: t, kind: "intro" });
t += 3.6;
const rows = [];
for (const m of META) {
  const dur = Math.max(m.duration + LEAD + TAIL, 2.7);
  rows.push({ ...m, at: t, dur });
  cards.push({ ...m, at: t, dur, kind: "motion" });
  t += dur;
}
cards.push({ id: "outro", name: "23 个动效", en: "END", dur: 3.0, at: t, kind: "outro" });
const TOTAL = +(t + 3.0).toFixed(3);

const body = cards.map((c) => {
  if (c.kind === "intro") return `    <section class="rv-card clip" id="m-intro" data-start="${c.at}" data-duration="${c.dur}">
      <div class="rv-head" data-layout-ignore><b>纸 · 编</b><span>宣纸编辑部</span><em>PAPER EDITORIAL · MOTION REEL</em></div>
      <div class="rv-body"><h1 class="rv-big">动效演示</h1><p class="rv-sub">${META.length} 个元素动效 · 16 + 6 个组件 · 16 基础转场 · 5 GPU 旗舰转场</p><p class="rv-note">全部由主题真实模块驱动</p></div>
    </section>`;
  if (c.kind === "outro") return `    <section class="rv-card clip" id="m-outro" data-start="${c.at}" data-duration="${c.dur}">
      <div class="rv-head" data-layout-ignore><b>纸 · 编</b><span>宣纸编辑部</span><em>PAPER EDITORIAL</em></div>
      <div class="rv-body"><h1 class="rv-big">${META.length} 个动效</h1><p class="rv-sub">line-set · slate-flight · window-surface · handoff-swap · paper-drift</p></div>
    </section>`;
  return `    <section class="rv-card clip" id="m-${c.id}" data-start="${c.at}" data-duration="${c.dur}">
      <div class="rv-head" data-layout-ignore><b>${c.id}</b><span>${c.label}</span><em>${c.duration}s</em></div>
      <div class="rv-stage${FULL.has(c.id) ? " full" : ""}">${FULL.has(c.id) ? (STAGES[c.id] || "") : '<div class="s-mid">' + (STAGES[c.id] || "") + "</div>"}</div>
    </section>`;
}).join("\n");

// No autoAlpha on the cards themselves: the framework owns clip visibility, and
// the lint rejects GSAP writing to a .clip element. Each card's window is its
// data-start / data-duration, and the motions inside run from that same instant.
// Each card's motions run on their own child timeline pinned to that card's
// start time. The presets take `at` relative to their own scene, so the offset
// lives here — one place — and every interior beat (slate-flight's header line,
// paper-drift's span window) shifts with it.
const timeline = rows.map((m) => {
  const call = CALLS[m.id]("#m-" + m.id).replace(/\btl\b/g, "t");
  return `        (function () { var t = gsap.timeline(); ${call} tl.add(t, ${m.at}); })();`;
}).join("\n");

const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>宣纸编辑部 · 动效演示</title>
    <link rel="stylesheet" href="assets/fonts/fonts.css" />
    <link rel="stylesheet" href="assets/theme/tokens.css" />
    <link rel="stylesheet" href="assets/theme/components.css" />
    <link rel="stylesheet" href="assets/reel.css" />
    <script src="assets/gsap.min.js"></script>
    <script src="assets/motions.global.js"></script>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="1920" data-height="1080">
      <div class="rv-scene">
        <div class="pe-paper-bg"></div>
        <div class="pe-grain"></div>
        <div class="rv-folio" data-layout-ignore><span>宣纸编辑部 · PAPER EDITORIAL</span><span>MOTION REEL · VOL.01 / 2026</span></div>
        <div class="rv-rail" data-layout-ignore><span></span></div>
${body}
      </div>
    </div>
    <script>
      (function () {
        var M = window.paperEditorialMotions;
        var tl = gsap.timeline({ paused: true });
        tl.fromTo(".rv-rail > span", { scaleX: 0 }, { scaleX: 1, duration: ${TOTAL}, ease: "none" }, 0);
${timeline}
        window.__timelines = window.__timelines || {};
        window.__timelines.main = tl;
        tl.seek(0);
      })();
    </script>
  </body>
</html>
`;
fs.writeFileSync(path.join(reel, "index.html"), html);
fs.writeFileSync(path.join(reel, "hyperframes.json"), JSON.stringify({ projectId: "video-theme-library-motion-reel", entry: "index.html", compositionId: "main", output: "renders/paper-editorial-motion-reel.mp4" }, null, 2) + "\n");
fs.writeFileSync(path.join(reel, "meta.json"), JSON.stringify({ title: "Paper Editorial Motion Reel", description: "Every element motion in the paper-editorial theme, played one card at a time." }, null, 2) + "\n");
console.log("cards:", cards.length, "| total:", TOTAL + "s");
