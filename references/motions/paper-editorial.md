# paper-editorial 动效参考

导入 `themes/paper-editorial/motions.js`，把项目的单一 paused GSAP timeline 传给每个助手。签名统一为 `(tl, target, at=0, ...)` 并返回 timeline；全部为有限补间，seek-safe。

```js
import { paperEditorialMotions } from "./themes/paper-editorial/motions.js";

const tl = gsap.timeline({ paused: true });
paperEditorialMotions.inkSlam(tl, "#scene-1 .headline", 0.25);
paperEditorialMotions.paperRise(tl, "#scene-1 .panel", 0.75, 0.1);
paperEditorialMotions.countUp(tl, "#metric-value", 1.0, 87);
paperEditorialMotions.screeningUnveil(tl, "#screening-overlay", 3.0, 52.0);
window.__timelines = window.__timelines || {};
window.__timelines.main = tl;
```

## 单目标动效

| ID | 机制 | 默认时长 | 参数 | 典型目标 |
|---|---|---|---|---|
| `ink-slam` | 缩放 1.22→1 + 模糊聚焦 + 16px 下沉，power4.out | .58s | — | 主标题、关键判断 |
| `paper-rise` | 自底部 64px 升起 + 0.6° 旋转落定，expo.out | .62s | `stagger=0` | 面板、卡片整组入场 |
| `bar-draw` | scaleX 0→1，power2.out | .95s | `origin="left center"` | 证据条、规则线 |
| `cascade-list` | x −96→0 + 淡入，expo.out | .5s | `stagger=.07` | 排行、目录、有序条目 |
| `editorial-wipe` | clip-path inset 揭示，power3.inOut | .65s | `direction="ltr"`（ltr/rtl/ttb/btt） | 图片、媒体、整版内容 |
| `stamp-impact` | 三相：加速砸落 → 压实 1.06 → 回弹归位 | .48s | — | verdict-stamp、状态确认 |
| `underline-draw` | scaleX 0→1，power2.out | .5s | `origin="left center"` | 关键词句的朱砂批注 |
| `folio-swap` | y −18→0 + 淡入，power2.out | .32s | — | 页眉、编号、元数据 |
| `red-result-emphasis` | 两相：墨色转朱砂 + 回弹归位 | .5s | — | 最终数值、结论 |
| `count-up` | 状态对象插值写 textContent，power3.out | 1.1s | `end=100`、`duration`、`formatter` | 统计数值（target 为元素或选择器） |
| `ghost-settle` | x 56→0 + 模糊落定 + 淡入，power3.out | 1.1s | — | pe-ghost 背景水印 |
| `line-set` | 行遮罩 `inset(100% 0 0 0)`→`inset(0% 0 0 0)` 自基线打开 + 可选上浮 + 虚焦收束 | .68s | `rise=0`、`blur=6`、`duration`、`stagger=0`、`ease` | **所有文字行的默认出场**，取代纯 opacity 淡入 |
| `window-surface` | autoAlpha + 轻微缩放（1.035→1）+ 虚焦收束，power3.out | .8s | `scale=1.035`、`blur=10`、`duration`、`ease` | 录屏 / 媒体面的揭示；**不得**改用 clip-path |
| `seal-press` | scaleY 0→1 纵向盖下 → 压实 .968 → 回弹归位；可选墨晕扩散 | .69s | `bloom`（墨晕选择器）、`drop`、`press`、`bloomDuration` | 印章、落款、状态确认的纵向盖印 |
| `seal-sheet` | 朱印逐枚落下；缩放与旋转只作用在**内层**节点上 | .34s | `inner`、`stagger`、`fromScale`、`spin`、`duration`、`ease` | 印谱、编号阵列、批量落款 |
| `paper-drift` | 颗粒背景 position 匀速平移，由根时间轴驱动 | 整场 | `spans=[[选择器,起始秒,持续秒],…]`、`grainX`、`grainY` | `pe-grain` 底噪；**整片底噪的唯一来源** |
| `bar-pull` | `scaleX` 0→1 满宽拉开（origin left），文字/落印随后 x −22→0 入位 | .87s | `duration` | `vermilion-bar`；全画面唯一饱和色，一部片只用一次 |
| `plate-strike` | 逐版 `autoAlpha` 上纸，stagger 决定上版节奏 | .9s+ | `duration`、`stagger` | `ink-plate` 的 `path`；**绘制顺序就是印刷顺序** |
| `ink-form` | 固定种子的短笔触先散开、聚环、再聚成目标轮廓；Canvas 由绝对时间重画 | 4.8s | `controller`、`duration` | `pe-ink-form-canvas`；先 `await createInkForm`，再注册时间线 |
| `movable-type` | 活字散置 → 归入行列 → 压印 → 字块抬离，留下干刻墨字 | 5.6s | `controller`、`duration` | `pe-movable-type canvas`；任意文字 |
| `rubbing-reveal` | 拓包沿四次压力路径擦过，图像的深浅纹理逐步显出 | 5.4s | `controller`、`duration` | `pe-rubbing-reveal canvas`；本地图片或 SVG |
| `paper-cutaway` | 对位纸层逐张卷开，纤维边与阴影揭示下层证据 | 6.6s | `controller`、`duration` | `pe-paper-cutaway canvas`；2–4 层图像 |

## 组合动效（多相协同）

组合动效的 target 是组件根节点（选择器字符串），内部按类名查找子元素，要求使用对应组件的标准类名。

| ID | 编排 | 总跨度 | 目标组件 |
|---|---|---|---|
| `quote-reveal` | 引文块滑入(.5s) → blockquote 升起(.55s@+.08) → cite 淡入(.35s@+.3) | ~.93s | `pe-quote` |
| `chapter-mark` | kicker 淡入(.3s) → 序号定版(.5s@+.06) → 标题拭入(.55s@+.18) → 朱线绘出(.5s@+.3) | ~1.05s | `pe-chapter` |
| `end-lock` | 结语句升起(.6s 级联.12) → 朱砂句读落印(.3s@+.5) → 落款淡入(.35s@+.7) | ~1.05s | `pe-end` |
| `screening-unveil` | 头部(.32s@+.04) → 边框拭入(.65s@+.08) → 裁切标记(.3s 级联@+.22) → 页脚(@+.26) → 书脊/卷次(@+.32)；`progressDuration>0` 时进度轨全程线性推进 | ~1s + 进度轨 | `pe-screening` |
| `slate-flight` | 同一节点从引导页排版飞进作品页页眉；`legs=[[选择器,{from,to}],…]`，`from` 在 0 时刻写入，`to` 在 `at` 落位 | `.86s`（可调） | `legs`、`duration`、`ease` | 引导页与作品页共用的标题节点 |
| `compare-pair` | 分栏格 `inset(0 0 100% 0)`→`0` 自上绘出(.7s) → 两侧条目遮罩上浮 + 级联(.44s@+.42) | ~1.12s | `gridDuration`、`stagger` | `pe-compare` 对照双栏 |
| `ledger-strike` | 刻度尺逐齿立起(.3s 级联 .018) → 账目逐行打出(.5s 级联 .09@+.2) | ~.9s | `tickStagger`、`stagger`、`duration`、`lead` | `ledger-table` + `tick-rule` |
| `mount-seat` | 界格自左拭入(.7s) → 画面浮定(.7s@+.08，需传 `art`) → 图注落款(.4s@+.8) | ~1.2s | `art`（画面选择器）、`duration` | `artifact-mount` / `ink-plate` |
| `handoff-swap` | kicker/论点入场 → 左栏升起 → 中缝绘出 → 笔锋横扫(1.24) → 左半被吃掉(1.30) → 笔锋离场(2.42) → 朱印砸进右半(2.16) → 整页四拍冲击(2.56) → 墨点飞散(2.56) → 活字落下(2.60) → 角色/作品/说明/脚注(2.46–3.62) | ~3.9s | `root`（选择器字符串） | 同题换模型的双栏交接卡 |

`screeningUnveil(tl, root, at, progressDuration)`：`progressDuration` 传 0 表示该场景不需要进度轨动画；否则传素材完整时长，朱砂进度轨从 `at` 开始线性走满。

## 时序契约（本主题的硬约束）

这三条是本期作品里踩出来的，违反任何一条都会立刻看出破绽：

1. **静止态必须写在 CSS 里。** 任何以 `immediateRender:false` 起手的 `fromTo` 揭示，
   该元素的静止态（`opacity:0` + `visibility:hidden`）必须先落到样式表。否则元素会先以
   自然可见态渲染，等补间开始时才跳回起点——画面上就是「先出现，再原地演一次」。
   用 `opacity` 不够，用 `visibility` 才能同时避开版面审计的遮挡判定。
2. **媒体面不要 clip。** 对 `<video>` 施加 `clip-path` 会让 Chrome 停止合成视频画面，
   整个补间期间素材是空白的，看起来像"素材卡住了一下"。用 `window-surface`，
   或者把裁切加在外层容器上。
3. **先飞，再开窗。** 引导页→作品页的顺序固定为：文字先飞（`slate-flight`），
   落位之后作品窗才出场（`window-surface` + `screening-unveil`）。
   作品窗的边框、素材、页脚、进度轨在整段飞行期间必须完全不可见。
4. **不要覆盖别人写好的 transform。** GSAP 写 `transform` 时会整条替换掉 CSS 里的
   transform，而不是叠加。`seal-sheet` 因此把缩放放在内层 `.end-seal-in` 上——
   直接对 `.end-seal` 写 scale/rotation，会把每枚印章的独立倾角全部抹平，
   整张印谱会平掉。（本期成片里踩过这个坑。）

## 使用规则

- 同一场景组合 2–4 个动效族，重复产生识别度，全用产生噪音。
- 扩展 motions.js 时保持：显式 `at` 定位、有限补间、无定时器/随机/播放态假设。
- `ink-form` 的目标采样在时间线注册前完成；不要把 ZIP 里的 `requestAnimationFrame`、滚动或鼠标状态直接放进视频合成。组件接受文本、本地 SVG、透明 PNG 的轮廓，使用文档见 `references/components/paper-editorial.md`。
- `movable-type`、`rubbing-reveal`、`paper-cutaway` 同样先 `await create...`，再把 controller 交给同名 motion。三者是场景内内容组件，不替代场景间转场。
- `red-result-emphasis` 的墨/朱砂色值与 tokens.css 的 `--pe-ink` / `--pe-red` 对应；改主题色时同步 motions.js 顶部常量。
