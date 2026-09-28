# paper-editorial 旗舰转场（GPU · 3.0）

这 5 个转场通过 WebGL 同时处理前后两幅场景纹理。它们用于片头、章节断点、核心结论或作品揭晓，不承担高频普通切换。

| ID | 3.0 视觉机制 | 节奏曲线 | 适合位置 | 3.0 / v2.3 | WebGL 不可用时回退 |
|---|---|---|---|---|---|
| `ink-diffusion-field` | 水痕先行（纸面先变浅再被墨压暗）→ 墨沿域扭曲 fbm 纤维场渗进 → 前缘积墨与朱砂沉淀 → 身后留下渐干的墨粒颗粒 | `diffusion`：落墨快、渗开慢、长尾收干 | 主结论、作品揭晓 | 1.3s / 1.18s | `paper-push` |
| `fiber-tear-displacement` | 撕口沿纸纤维不规则推进；纸浆高光、跨越撕口并随开口拉长的纤维丝、抬起纸页的阴影随时间加深 | `tear`：先绷住，再猛地撕开，末段拖出纤维 | 反转、纠错、强对比 | 1.1s / 1.06s | `tear-wipe` |
| `editorial-depth-warp` | 两版在透视纵深中弯折压合，中央折脊带高光与纸纹 | `warp`：对称但更陡，折脊停留短 | 大章节、时空层级变化 | 1.24s / 1.24s | `chapter-bridge` |
| `vermilion-pressure-wave` | 主波推开像素并揭出新页，第二道回波与朱砂色散随后跟进，朱砂在切到干净画面前干进纸里 | `impact`：瞬间冲击、指数衰减 | 结论落点、状态确认 | 1.0s / .94s | `red-rule-cut` |
| `calligraphy-stroke-morph` | 笔锋沿轨迹行进，鬃毛纹顺笔势流动，湿墨在笔头聚积，尾段散成飞白 | `brush`：起笔顿、中段疾行、收笔提 | 片头、主角登场、品牌切换 | 1.2s / 1.14s | `ink-sweep` |

时长、回退与节奏曲线均来自 `paperEditorialAdvancedTransitionMeta`，展厅卡片直接读取该元数据。v2.3 实现冻结在 `classic/advanced-transitions.js`（注意：该模块导入即挂载展厅卡片，生产中不要导入）。

## 生产 API

```js
import {
  createPaperEditorialAdvancedTransition,
  driveAdvancedTransition,
  paperEditorialAdvancedTransitionMeta
} from "./assets/theme/advanced-transitions.js";

// 1. 建轴之前：捕获前后两幅场景纹理（Canvas / Image / 已解码的 Video 帧）。
const from = await captureScene("#scene-a");   // 你自己的捕获函数：见下文「捕获场景」
const to = await captureScene("#scene-b");

// 2. 建立引擎。无 WebGL 时返回 null。
const canvas = document.querySelector("#gpu-transition"); // 1920×1080，盖在两幕之上，初始 visibility:hidden
canvas.width = 1920; canvas.height = 1080;
const engine = createPaperEditorialAdvancedTransition(canvas, { from, to, effect: "ink-diffusion-field" });

// 3. 在单一 paused 时间线里注册一段补间：画面只取决于时间线进度。
const tl = gsap.timeline({ paused: true });
driveAdvancedTransition(tl, engine, 12.0, {
  effect: "ink-diffusion-field",
  canvas,                                   // 驱动器在 at 时显示画布、at+duration 时隐藏
  parts: { outgoing: "#scene-a .scene-inner", incoming: "#scene-b .scene-inner" } // 回退用
});
window.__timelines.main = tl;
```

### `createPaperEditorialAdvancedTransition(canvas, { from, to, effect })`

返回引擎 `{ setEffect(id), setSources(from, to), render(progress, seconds?), destroy() }`，WebGL 不可用时返回 `null`。

- `render(progress, seconds)`：`progress` 为**线性** 0–1 进度（由时间线给出），引擎内部先套该效果的节奏曲线再送进 shader；`seconds` 驱动持续流动的纤维噪声，缺省为 `progress × meta.duration`。两者都只来自时间线，所以任意 seek 得到同一帧。
- `progress = 0` 为纯 `from`，`progress = 1` 为纯 `to`。
- 画布使用 `preserveDrawingBuffer:true`，截图与逐帧读回都能拿到最后一次 `render` 的结果。

### `driveAdvancedTransition(tl, engine, at, { effect, duration, parts, canvas })`

- 注册一段 `ease:"none"` 的补间，`onUpdate` 调用 `engine.render(p, p × duration)`；`duration` 缺省取 `meta.duration`。
- 传入 `canvas` 时：`at` 处 `autoAlpha 0→1`，`at + duration` 处隐藏。前后场景在转场结束前必须已切换好（incoming 可见、outgoing 隐藏），画布隐藏后露出的是真实的新场景。
- **WebGL 回退映射**：`engine` 为 `null` 时自动改调基础转场，`parts` 按该转场的约定传入（缺少 `parts` 会抛错）：

  | GPU 转场 | 回退基础转场 | 需要的 parts |
  |---|---|---|
  | ink diffusion（`ink-diffusion-field`） | `paper-push` | outgoing, incoming |
  | fiber tear（`fiber-tear-displacement`） | `tear-wipe` | outgoing, incoming |
  | depth warp（`editorial-depth-warp`） | `chapter-bridge` | outgoing, incoming, overlay |
  | pressure wave（`vermilion-pressure-wave`） | `red-rule-cut` | outgoing, incoming, overlay, rule |
  | calligraphy morph（`calligraphy-stroke-morph`） | `ink-sweep` | outgoing, incoming |

  回退使用基础转场自身的默认时长（见 [paper-editorial.md](paper-editorial.md)），不会拉伸到 GPU 时长。回退是真实的材料转场，不要另写一个近似的 CSS 假版本。

### 捕获场景

纹理是**静态快照**，在建轴前一次性上传；渲染路径里不换纹理、不异步读帧。

- 场景本身就是 Canvas（`ink-form`、材料组件、自绘版面）：先 `render(localTime)` 到切点那一刻，再把画布作为 `from` / `to`。
- 场景是图片或 SVG：`await img.decode()` 后直接传 `Image`。
- 场景是视频：把切点帧 seek 好、`requestVideoFrameCallback`/`seeked` 之后画进一张 Canvas，再传 Canvas。
- 场景是 DOM 版面：浏览器没有 DOM→纹理的同步 API。按版面在 Canvas 2D 上重绘一版（`createEditorialTexture` 是展厅用的示例），或事先把版面渲染成 PNG 冻结到项目里。
- 保持显式米白或墨黑背景，透明像素进入纹理会产生黑边。

## 确定性

- shader 里的噪声只由 `u_progress`、`u_time`（= 时间线秒数）与像素坐标决定；没有 `Math.random`、`Date.now`、`performance.now`。
- 展厅（`index.html#transitions`）的自动播放用 `requestAnimationFrame` 挂钟，仅限网页演示；生产合成必须由 paused 时间线调用 `render(progress)`。
- 验收：`node scripts/verify-advanced-showroom.mjs`（5 个 WebGL 卡中段截图）与 `node scripts/verify-paper-advanced-frames.mjs`（按固定进度逐帧出图到 `snapshots/advanced-transitions/`）。

## 使用边界

- 同一支视频优先选一个旗舰转场作为签名动作，最多再增加一个只出现一次的强调转场。
- 画面交接时前后场景必须同时存在；不要先淡出旧场景再启动 GPU 转场。
- 朱砂只用作积墨、断口或压力波的局部信号，避免整屏红色闪烁。
- 导入 `advanced-transitions.js` 会在文档中查找展厅卡片（`.transition-card[data-role="advanced"]`）并挂载演示；生产合成里没有这些节点，因此是空操作，但不要在合成里复用这个类名。
