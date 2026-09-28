// 主体档案 · 组件与动效预览
// One card at a time: seven components, then the four motions that drive them.
// Everything is drawn with the theme's real modules — the showroom and this reel
// cannot drift apart, because both read the same CSS and the same motions.js.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const theme = path.resolve(root, "../../themes/paper-editorial");

// classic-script build of the theme's motions (top-level const is not a window prop)
fs.writeFileSync(path.join(root, "assets/motions.global.js"),
  fs.readFileSync(path.join(theme, "motions.js"), "utf8").replace(/^export /gm, "") +
  "\nwindow.paperEditorialMotions = paperEditorialMotions;\n");
// the theme's own stylesheets travel with the reel
fs.copyFileSync(path.join(theme, "tokens.css"), path.join(root, "assets/theme/tokens.css"));
fs.copyFileSync(path.join(theme, "components.css"), path.join(root, "assets/theme/components.css"));

const plate = fs.readFileSync(path.join(root, "assets/art/plate.svg"), "utf8")
  .replace(/^<svg/, '<svg class="pe-plate-forme"');
const ticks = Array.from({ length: 21 }, (_, i) => "<i class=\"" + (i % 5 === 0 ? "major" : "") + "\"></i>").join("");
const ledger = [["测试主体", "GPT-6 Astra", ""], ["思考档位", "effort = max", "mono"],
  ["展品数量", "十三件前端作品", ""], ["播放规格", "1920×1080 · 18:38", "mono"]]
  .map(([k, v, c]) => `            <div class="pe-ledger-row"><dt>${k}</dt><dd${c ? ' class="mono"' : ""}>${v}</dd></div>`).join("\n");
const tabs = [["2026-09-21", true], ["十三件展品", false], ["全片零评分", false], ["素材原速", false]]
  .map(([t, d]) => `<span class="pe-tab${d ? "" : " is-plain"}">${t}</span>`).join("");

const C = [
  { id: "intro", dur: 2.8, kind: "intro" },
  { id: "ledger-table", cn: "度支谱", dur: 3.2, html: `<div id="s" style="position:absolute;left:460px;top:420px;width:1000px"><div class="pe-ledger" style="width:100%">\n${ledger}\n</div></div>` , cap: ["left:460px;top:664px", "多行参数的账目：标签在左、值在右、发丝线分行，数字走等宽。"]},
  { id: "tick-rule", cn: "刻度尺", dur: 3.0, html: `<div id="s" style="position:absolute;left:460px;top:520px;width:1000px"><div class="pe-ticks">${ticks}</div></div>` , cap: ["left:460px;top:664px", "刻度尺：给\"精确\"一个可见的凭据，压在账目旁边。"]},
  { id: "status-tabs", cn: "状态签", dur: 3.0, html: `<div id="s" style="position:absolute;left:660px;top:510px"><div class="pe-tabs">${tabs}</div></div>` , cap: ["left:460px;top:620px", "状态签：朱红描边小签，比圆角药丸更印刷、更编辑部。"]},
  { id: "vermilion-bar", cn: "朱红横带", dur: 3.2, html: `<div id="s" style="position:absolute;inset:0"><div class="pe-bar" style="position:absolute;left:0;right:0;bottom:0"><b>本期主角 · 十三件前端作品原速放完</b><em>GPT-6 Astra</em></div></div>` , cap: ["left:92px;bottom:170px", "朱红横带：全画面唯一一处饱和色，留到最后用一次。"]},
  { id: "seal-mark", cn: "落印", dur: 3.0, html: `<div id="s" style="position:absolute;left:0;right:0;top:500px;display:flex;gap:56px;justify-content:center;align-items:center"><span class="pe-seal-mark" style="width:132px;height:132px;font-size:66px">印</span><span class="pe-seal-mark is-word" style="width:132px;height:132px;font-size:30px">ASTRA</span><span class="pe-seal-mark is-vermilion" style="width:96px;height:96px;font-size:48px">展</span></div>` , cap: ["left:0;right:0;top:700px;text-align:center", "落印：小尺寸朱印，落款、确认与横带收尾共用一枚。"]},
  { id: "artifact-mount", cn: "界格装裱", dur: 3.2, html: `<div id="s" style="position:absolute;left:660px;top:300px;width:600px"><figure class="pe-artifact-mount" style="margin:0"><div style="height:400px;background:var(--pe-well)"></div></figure><p class="pe-artifact-caption">PLATE 01 · 木刻套版 · 源：02 SINGULARITY</p></div>` , cap: ["left:660px;top:764px;width:600px", "界格装裱：细线收边 + 朱红角标 + 图注。"]},
  { id: "ink-plate", cn: "木刻谱", dur: 3.4, html: `<div id="s" style="position:absolute;left:620px;top:250px;width:680px"><figure class="pe-plate" style="margin:0">${plate}</figure><p class="pe-plate-caption">PLATE 01 · 木刻套版 · 生成器 tools/ink-plate.mjs</p></div>` , cap: ["left:620px;top:794px;width:680px", "木刻谱：一张图刻成平版，矢量分版套色，生成器随主题走。"]},
  { id: "ledger-strike", cn: "度支谱入账", dur: 4.2, mot: true, html: `<div id="s" style="position:absolute;inset:0"><div style="position:absolute;left:460px;top:360px;width:1000px"><div class="pe-ticks">${ticks}</div></div><div style="position:absolute;left:460px;top:430px;width:1000px"><div class="pe-ledger" style="width:100%">\n${ledger}\n</div></div></div>` },
  { id: "bar-pull", cn: "朱红横带", dur: 3.6, mot: true, html: `<div id="s" style="position:absolute;inset:0"><div class="pe-bar" style="position:absolute;left:0;right:0;bottom:0"><b>本期主角 · 十三件前端作品原速放完</b><em>GPT-6 Astra</em></div></div>` },
  { id: "mount-seat", cn: "装裱落框", dur: 4.0, mot: true, html: `<div id="s" style="position:absolute;left:620px;top:280px;width:680px"><figure class="pe-artifact-mount" style="margin:0"><div style="height:420px;background:var(--pe-well)"></div></figure><p class="pe-artifact-caption">PLATE 01 · 木刻套版</p></div>` },
  { id: "plate-strike", cn: "分版套印", dur: 4.0, mot: true, html: `<div id="s" style="position:absolute;left:620px;top:250px;width:680px"><figure class="pe-plate" style="margin:0">${plate}</figure></div>` },
  { id: "outro", dur: 2.8, kind: "outro" }
];
let t = 0;
const cards = C.map((c) => { const o = { ...c, at: t }; t += c.dur; return o; });
const TOTAL = +t.toFixed(3);

const body = cards.map((c) => {
  const head = c.kind === "intro" ? `<b>纸 · 编</b><span>主体档案</span><em>PAPER EDITORIAL · RECORD SHEET</em>`
    : c.kind === "outro" ? `<b>纸 · 编</b><span>主体档案</span><em>PAPER EDITORIAL</em>`
    : `<b>${c.id}</b><span>${c.cn}</span><em>${c.mot ? "动效" : "组件"} · ${c.dur}s</em>`;
  const stage = c.kind === "intro"
    ? `<div class="rv-body"><h1 class="rv-big">主体档案</h1><p class="rv-sub">7 个新组件 · 4 个新动效</p><p class="rv-note">宣纸编辑部 · 用纸与墨写成的规格页</p></div>`
    : c.kind === "outro"
    ? `<div class="rv-body"><h1 class="rv-big">29 个组件</h1><p class="rv-sub">ledger-table · tick-rule · status-tabs · vermilion-bar · seal-mark · artifact-mount · ink-plate</p></div>`
    : `<div class="rv-stage${c.mot ? " full" : ""}">${c.mot ? c.html : '<div class="s-wrap">' + c.html + (c.cap ? '<p class="rv-cap" style="' + c.cap[0] + '">' + c.cap[1] + "</p>" : "") + "</div>"}</div>`;
  return `    <section class="rv-card clip" id="m-${c.id}" data-start="${c.at}" data-duration="${c.dur}">
      <div class="rv-head" data-layout-ignore>${head}</div>
${stage}
    </section>`;
}).join("\n");

const M = (sel, at, code) => `        (function () { var t = gsap.timeline(); ${code.replace(/\btl\b/g, "t")} tl.add(t, ${at}); })();`;
const timeline = cards.filter((c) => c.mot).map((c) => {
  const s = "#m-" + c.id + " ";
  const code = c.id === "ledger-strike" ? `M.ledgerStrike(t,"#m-${c.id}",0);`
    : c.id === "bar-pull" ? `M.barPull(t,"#m-${c.id}",0);`
    : c.id === "mount-seat" ? `M.mountSeat(t,"#m-${c.id}",0,{art:"#m-${c.id} .pe-artifact-mount"});`
    : `M.plateStrike(t,"#m-${c.id}",0);`;
  return `        (function () { var t = gsap.timeline(); ${code} tl.add(t, ${c.at}); })();`;
}).join("\n");
const appear = cards.filter((c) => !c.mot && c.kind !== "intro" && c.kind !== "outro")
  .map((c) => `        (function () { var t = gsap.timeline(); M.mountSeat(t,"#m-${c.id}",0); M.lineSet(t,"#m-${c.id} .pe-ledger-row, #m-${c.id} .pe-ticks i, #m-${c.id} .pe-tab, #m-${c.id} .pe-seal-mark, #m-${c.id} .pe-artifact-caption, #m-${c.id} .pe-plate-caption",0.12,{rise:0,blur:4,stagger:.06}); tl.add(t, ${c.at}); })();`).join("\n");

const html = `<!doctype html>
<html lang="zh-CN"><head><meta charset="UTF-8" /><meta name="viewport" content="width=1920, height=1080" />
<title>主体档案 · 预览</title>
<link rel="stylesheet" href="assets/fonts/fonts.css" />
<link rel="stylesheet" href="assets/theme/tokens.css" />
<link rel="stylesheet" href="assets/theme/components.css" />
<link rel="stylesheet" href="assets/preview.css" />
<script src="assets/gsap.min.js"></script><script src="assets/motions.global.js"></script></head>
<body>
<div id="root" data-composition-id="paper-record" data-start="0" data-duration="${TOTAL}" data-width="1920" data-height="1080">
  <div class="pe-paper-bg"></div><div class="pe-grain"></div>
  <div class="rv-folio" data-layout-ignore><span>宣纸编辑部 · 主体档案</span><span>COMPONENTS &amp; MOTIONS · VOL.01 / 2026</span></div>
  <div class="rv-rail" data-layout-ignore><span></span></div>
${body}
</div>
<script>
  (function () {
    var M = window.paperEditorialMotions;
    var tl = gsap.timeline({ paused: true });
    tl.fromTo(".rv-rail > span", { scaleX: 0 }, { scaleX: 1, duration: ${TOTAL}, ease: "none" }, 0);
${timeline}
${appear}
    window.__timelines = window.__timelines || {};
    window.__timelines["paper-record"] = tl;
    tl.seek(0);
  })();
</script>
</body></html>
`;
fs.writeFileSync(path.join(root, "index.html"), html);
fs.writeFileSync(path.join(root, "hyperframes.json"), JSON.stringify({ projectId: "video-theme-library-paper-record", entry: "index.html", compositionId: "paper-record", output: "renders/paper-record.mp4" }, null, 2) + "\n");
fs.writeFileSync(path.join(root, "meta.json"), JSON.stringify({ title: "Paper Record Preview", description: "主体档案 — the seven new paper-editorial components and the four motions that drive them." }, null, 2) + "\n");
console.log("cards:", cards.length, "| total:", TOTAL + "s");