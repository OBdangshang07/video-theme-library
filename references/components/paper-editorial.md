# paper-editorial 组件参考

所有类名使用 `pe-` 前缀。根展厅 `../../../index.html` 是视觉参考，每个组件都以 1920×1080 真实场景等比呈现。

| 组件 ID | 类名 | 说明 |
|---|---|---|
| `editorial-title` | `.pe-kicker` + `.pe-title` + `.pe-subtitle` | 开场或主论点的三级标题组 |
| `folio-header` | `.pe-folio` | 顶部规则线 + 左右元数据，贯穿全片 |
| `paper-panel` | `.pe-panel`（`.red` 变体） | 通用信息容器，朱砂底只给一个重点 |
| `stat-block` | `.pe-stat-label` + `.pe-stat-value` | 一个大数字，配 `count-up` |
| `metric-triptych` | `.pe-triptych` + `.pe-metric` + `.pe-bar` | 三个并列指标，底部证据条 |
| `comparison-split` | `.pe-compare` | 双栏对比，一侧可反白为墨底 |
| `ranked-list` | `.pe-list`（`.index` / `.name` / `.meta`） | 排行、优先级、目录 |
| `timeline-steps` | `.pe-timeline` + `.pe-step` | 四步流程、编年、方法 |
| `quote-pullout` | `.pe-quote`（`blockquote` + `cite`） | 论点、引用、关键结论，配 `quote-reveal` |
| `artifact-frame` | `.pe-artifact` + `.pe-artifact-frame` | 16:9 作品/截图/视频 + 侧栏信息 |
| `verdict-stamp` | `.pe-verdict` | 判定印章，配 `stamp-impact` |
| `chapter-divider` | `.pe-chapter`（`.pe-chapter-index/.pe-chapter-kicker/.pe-chapter-title/.pe-chapter-rule`） | 章节隔断，配 `chapter-mark` |
| `source-note` | `.pe-note` | 来源、方法、限制条件 |
| `progress-rail` | `.pe-progress` | 全宽进度轨，贯穿整个合成而非某个内框 |
| `end-card` | `.pe-end`（`.pe-end-line/.pe-end-mark/.pe-end-note`） | 收尾锁定，配 `end-lock` |
| `screening-dossier` | `.pe-screening-media` + `.pe-screening` 全家桶 | 高密度全屏媒体档案，配 `screening-unveil` |

### 场景专属组件（`paper-editorial` 独有，不属于 canonical 16）

这六个来自「GPT-6 ASTRA 前端作品展」的实际场景，是本主题的场景词汇，类名保持项目原样。
坐标按 1920×1080 场景空间书写，样式见 `components.css` 末尾的「本期展厅场景组件」段。

| ID | 类 | 用途与配用动效 |
|---|---|---|
| `manifest-sheet` | `.md-lead` 全家桶（`.md-flag/.md-name/.md-sub/.md-specs/.md-row/.md-seal/.md-bleed/.md-seal-svg/.md-banner`） | 片头/档案封面：主角名 + 规格行 + 印章 + 横幅。配 `ink-slam` + `cascade-list` + `seal-press` |
| `exhibit-index` | `.ix-stage`（`.ix-title` + `.ix-grid > .ix-item`） | 展品总览目录：编号 + 标题 + 时长。配 `line-set` 级联 |
| `compare-summary` | `.cm-stage`（`.cm-kicker/.cm-title/.cm-grid > .cm-col(.dark) > .cm-rows > .cm-row`） | 组间对照小结：双栏逐条对位，右栏 `.dark` 反白。配 `compare-pair` |
| `seal-sheet` | `.end-stage`（`.end-seals > .end-seal > .end-seal-in` + `.end-head` + `.end-note`） | 落款印谱：N 枚朱印 + 收束句 + 落款。配 `seal-sheet` |
| `handoff-card` | `.handoff-frame` 全家桶（`.handoff-zone.out/.in`、`.handoff-centre`、`.handoff-brush(> .brush-body/.brush-tail)`、`.handoff-seal`、`.handoff-model`、`.handoff-bloom`、`.handoff-splat[data-dx][data-dy]`、`.handoff-kicker/.handoff-thesis/.handoff-caption/.handoff-foot`） | 同题换模型的双栏交接卡。配 `handoff-swap` |
| `work-slate` | `.dk-index(> .dk-index-inner)/.dk-rule/.dk-title/.dk-work/.dk-model/.dk-question` | 作品页的引导排印，也是 `slate-flight` 的起点。配 `line-set`，飞行后转 `screening-dossier` |

> `.dk-*` 的 `z-index: 8` 是必需的：飞行的标题会横穿媒体窗，而视频是不透明的、
> DOM 又排在文字之后，不抬层就会被素材盖住。

### 主体档案组件（`paper-editorial` 独有 · 记录页语言）

这六个来自「主体档案」定版（`showcases/paper-spec/`）。它们把"仪器面板"的克制感
用宣纸的语言重新表述：**发丝线、宋体、等宽数字，朱红只出现一次**。
不是把冷色调的表单搬过来，是把"精确"翻译成印刷的精确。

| ID | 类 | 用途 |
|---|---|---|
| `ledger-table` | `.pe-ledger`（`.pe-ledger-row > dt + dd`，`dd.mono` 走等宽） | 度支谱：标签在左、值在右、发丝线分行。比 `stat-block` 更适合"多行参数" |
| `tick-rule` | `.pe-ticks > i`（`.major` 为重齿） | 刻度尺：给"精确"一个可见的凭据，常压在账目旁边 |
| `status-tabs` | `.pe-tabs > .pe-tab`（`.is-plain` 去朱红） | 状态签：朱红描边小签，比圆角药丸更印刷 |
| `vermilion-bar` | `.pe-bar`（`b` / `em`） | 朱红横带：满宽拉开的收束一击，**全画面唯一饱和色** |
| `seal-mark` | `.pe-seal-mark`（`.is-vermilion` 反白） | 落印：小尺寸朱印，落款、确认、横带收尾共用 |
| `artifact-mount` | `.pe-artifact-mount`（+ `.pe-artifact-caption`） | 界格装裱：`artifact-frame` 的档案化变体——细线收边 + 朱红角标 + 图注 |

### 材料动效组件（`paper-editorial` 独有 · 可复用的画面生成器）

这五个组件以文字、图形或分层图像作为输入，按时间绘制材料质感；其中木刻谱生成矢量图，其余四个在画布上逐帧绘制。

| ID | 类 | 用途 |
|---|---|---|
| `ink-plate` | `.pe-plate` + `.pe-plate-forme` + `.pe-plate-caption` | **木刻谱**：一张图被刻成平版（深墨/中墨/淡墨 + 可选朱红套版），矢量输出。生成器 `tools/ink-plate.mjs`，配 `plate-strike` 逐版套印 |
| `ink-form` | `.pe-ink-form > canvas.pe-ink-form-canvas` | **墨迹聚形**：数千道墨色短笔触由散到环，再聚成指定文字或图形。配 `ink-form` 动效。 |
| `movable-type` | `.pe-movable-type > canvas` | **活字归版**：任意文字由木活字归位、压印，留下干刻墨字。配同名动效。 |
| `rubbing-reveal` | `.pe-rubbing-reveal > canvas` | **拓印显影**：本地图片或 SVG 随压力擦拓路径渐显。配同名动效。 |
| `paper-cutaway` | `.pe-paper-cutaway > canvas` | **纸层剖视**：2–4 张对位纸层逐层卷开，展示同一位置的不同证据。配同名动效。 |

### 墨迹聚形：生产用法

`ink-form` 是可按绝对时间定位的 Canvas 组件。它保留了 `conceptual-creative-portfolio-design.zip` 的墨粒、环聚、字形采样和朱砂点缀；未落在目标轮廓上的游离墨粒会在成形阶段散尽，不会在定版后留下圆环。每帧都从本地时间和固定种子重画，适合 HyperFrames 任意跳帧渲染。它与静态的 `ink-plate` 是两个独立组件。

在 `.clip` 场景内放画布；纸底和标题仍用主题的普通组件：

```html
<div class="pe-paper-bg"></div>
<div class="pe-ink-form" style="position:absolute;inset:0">
  <canvas id="scene-ink" class="pe-ink-form-canvas" aria-label="墨迹聚成主题文字"></canvas>
</div>
```

把主题的 `tokens.css`、`components.css`、`motions.js`、`ink-form.js` 和 `fonts/source-han-serif-medium.otf` 冻结到项目本地，保持 `components.css` 到 `fonts/` 的相对路径。字体或目标图片解码后再注册时间线：

```js
import { createInkForm } from "./assets/theme/ink-form.js";
import { paperEditorialMotions as M } from "./assets/theme/motions.js";

const ink = await createInkForm(document.querySelector("#scene-ink"), {
  width: 1920, height: 1080, duration: 4.8, seed: 42,
  target: { kind: "text", value: "山海有信" },
  box: { x: .15, y: .18, width: .7, height: .64 },
});
const tl = gsap.timeline({ paused: true });
M.inkForm(tl, ink, 2.0);
window.__timelines.main = tl; // 依实际 data-composition-id 命名；注册前先完成所有其他补间
```

`target` 可用以下三种本地输入：

- `{ kind: "text", value: "墨" }`：单字、短句或带 `\n` 的多行文字；可加 `fontFamily`、`fontWeight`。默认使用组件附带的宋体。超出该字体字库的字符应另配本地字体。
- `{ kind: "image", src: "./assets/logo.svg" }`：本地 SVG 或透明 PNG，默认按 alpha 采样；彩色源图会变成墨色轮廓。若用户提供的是浅色底、深色图标，可传 `maskMode: "dark"`，按明度提取深色轮廓，不把背景聚成实心矩形。先检查定版帧是否保留图标内部的留白与细线。
- `{ kind: "svg", markup: "<svg …>…</svg>" }`：由项目内代码生成的 SVG 字符串，也按 alpha 采样。不要引用远程图片或字体。

`box` 是画面宽高的比例坐标，控制目标轮廓的位置和大小。可选参数有 `particleCount`（总墨粒数，默认按画布面积，最多 14000）、`ringParticleCount`（圆环阶段的墨粒数，1080p 默认 3200）、`sampleStep`、`strokeWidth`（默认 1.1 像素）、`inkColor`、`redColor` 和 `seed`。需要片尾散去时可设置 `exitScatterStart`（组件本地秒数，须晚于聚形完成）与 `exitScatterDistance`（散开的像素距离）；墨粒沿各自方向渐散并在片尾归零，不会变成一张飞走的实心图。额外的墨粒只在圆环聚成轮廓时进入，因此可提高成形密度而不挤满前半段圆环。最终字形与图形只由墨色短笔触组成，没有实心文字底图。同一目标与种子在任意时间点都会得到相同画面；更换目标需新建 controller。多镜头各用自己的画布和 controller。完整三段样片见 `showcases/ink-form/`。

### 三个材料动效组件：生产用法

三个组件都使用透明 Canvas，纸底、页眉和说明由场景另外放置。先把 `material-utils.js`、所需组件模块、`motions.js`、CSS 和字体冻结到项目本地，再完成字体/图片解码并注册单一 paused 时间线。`render(localSeconds)` 只依赖传入的绝对时间和固定种子，可从任意帧开始渲染。

```js
import { createMovableType } from "./assets/theme/movable-type.js";
import { createRubbingReveal } from "./assets/theme/rubbing-reveal.js";
import { createPaperCutaway } from "./assets/theme/paper-cutaway.js";
import { paperEditorialMotions as M } from "./assets/theme/motions.js";

const type = await createMovableType(document.querySelector("#type"), {
  width: 1920, height: 1080, duration: 6, seed: 71,
  text: "见字如面", // 可换成任意文案；用 \n 分行
  accentIndex: -1, // 可选：指定一个朱砂字，从 0 开始
});
const rubbing = await createRubbingReveal(document.querySelector("#rubbing"), {
  width: 1920, height: 1080, duration: 6, seed: 83,
  visual: { src: "./assets/artifact.svg" }, // 或 { markup: "<svg ...>" }
  density: 1.2,
});
const cutaway = await createPaperCutaway(document.querySelector("#cutaway"), {
  width: 1920, height: 1080, duration: 7, seed: 97,
  layers: [
    { src: "./assets/surface.svg", label: "表层", caption: "SURFACE / 01" },
    { src: "./assets/strata.svg", label: "深层", caption: "STRATA / 02" },
  ],
});
const tl = gsap.timeline({ paused: true });
M.movableType(tl, type, 0);
M.rubbingReveal(tl, rubbing, 6);
M.paperCutaway(tl, cutaway, 12);
window.__timelines.main = tl;
```

`movable-type` 的 `text` 自动按 `box` 缩放；默认使用主题附带的宋体。超出字库的字符应配本地字体并传 `fontFamily`。`rubbing-reveal` 接受本地 SVG/PNG 或内联 SVG，把透明度与明暗转换为墨色颗粒；浅色透明图案若几乎没有暗部，需先改成深墨色。`paper-cutaway` 的各层应使用相同画布比例并自行对位，图片可为本地 SVG/PNG 或内联 SVG。三者均可传比例坐标 `box`、`inkColor`、`duration` 与 `seed`；活字和纸层另可传 `redColor`。完整 19 秒样片见 `showcases/editorial-materials/`。

**配用动效**：账目逐行入账用 `line-set`；刻度尺逐齿立起用 `underline-draw` 的 scaleY 变体；
横带用 `scaleX` 拉开（`transform-origin: left center`），落印用 `stamp-impact`。

> 定版实样：`showcases/paper-spec/renders/paper-spec-still.png`。
> 主视觉「木刻谱」由 `showcases/paper-spec/tools/ink-plate.mjs` 生成（分版套色，矢量输出）——
> 它还不是库里的 canonical 组件，登记需要四个主题一起动 canonical 契约，待定。

只复制生产合成实际需要的组件标记。

`screening-dossier` 是最高密度的全屏媒体布局：素材保持大而清晰，同时提供常驻主体名、条目标题、可选朱砂强调元数据、来源状态、时长、条目编号与进度。生产可用的完整标记在 `themes/paper-editorial/snippets/screening-dossier.html`。强调节点可选，无排名/状态场景直接删除；主体名与条目标题保持独立字级，不要为了塞元数据压缩条目标题。
