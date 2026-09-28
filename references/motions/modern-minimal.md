# modern-minimal 动效参考

导入 `themes/modern-minimal/motions.js`，把项目的单一 paused GSAP timeline 传给每个助手。签名统一为 `(tl, target, at=0, ...)` 并返回 timeline；全部为有限补间，seek-safe（无定时器、无随机数、无无限循环）。

```js
import { modernMinimalMotions } from "./themes/modern-minimal/motions.js";

const tl = gsap.timeline({ paused: true });
modernMinimalMotions.gridReveal(tl, "#scene-1 .headline", 0.25);
modernMinimalMotions.precisionRise(tl, "#scene-1 .panel", 0.75, 0.12);
modernMinimalMotions.numberRoll(tl, "#stat-value", 1.0, 87);
modernMinimalMotions.showcaseUnveil(tl, "#showcase-overlay", 3.0, 52.0);
window.__timelines = window.__timelines || {};
window.__timelines.main = tl;
```

## 单目标动效

| ID | 机制 | 默认时长 | 参数 | 典型目标 |
|---|---|---|---|---|
| `grid-reveal` | clip-path inset 自左揭示 + 淡入，expo.out | .72s | `duration` | 主标题、媒体、整版内容 |
| `precision-rise` | y 48→0 + 淡入，power3.out | .54s | `stagger=0` | 面板、卡片短距离入场，可级联 |
| `number-roll` | 状态对象插值写 textContent，power3.out | .9s | `end=100`、`duration`、`formatter` | 统计数值（target 为元素或选择器） |
| `rule-expand` | scaleX 0→1，expo.out | .5s | `origin="left center"` | 结构线、进度刻度 |
| `list-stagger` | x −38→0 + 淡入，级联 .08，power3.out | .5s | `stagger=.08` | 排行、目录、有序条目 |
| `mask-slide` | x −70→0 + clip-path inset 揭示，power4.out | .68s | `duration` | 方向性内容揭示 |
| `focus-snap` | scale 1.08→1 + 模糊 12px→0 + 淡入，power2.out | .48s | `duration` | 主体由虚焦锁定到网格 |
| `soft-emphasis` | 炭黑转钴蓝 + scale .94→1，back.out(1.25) | .72s | `duration` | 关键词、最终数值 |
| `index-shift` | x −86→0 + 字距 .08em→−.07em + 淡入，expo.out | .62s | `duration` | 大号章节/索引编号 |
| `closing-compress` | scaleX 1.14→1（左缘原点）+ 淡入，power3.out | .66s | `duration` | 结尾署名横向压合落定 |
| `grid-settle` | opacity 0→1 + scale 1.05→1（中心原点），power2.out | 1.1s | `duration` | mm-grid 背景网格落定 |

## 组合动效（多相协同）

组合动效的 target 是组件根节点（选择器字符串），内部按类名查找子元素，要求使用对应组件的标准类名。

| ID | 编排 | 总跨度 | 目标组件 |
|---|---|---|---|
| `metric-sweep` | 指标单元格升起级联(.5s 级联.09) → 数值逐行落位(.38s 级联@+.16) | ~.75s | `mm-metric-row` |
| `section-mark` | kicker 淡入(.3s) → 序号定版(.5s@+.06) → 标题拭入(.55s@+.18) → 钴蓝规线绘出(.5s@+.3) | ~1.05s | `mm-chapter` |
| `showcase-unveil` | 头部(.32s@+.04) → 边框拭入(.62s@+.08) → 裁切标记(.3s 级联@+.22) → 页脚(@+.26) → 书脊/卷次(@+.32)；`progressDuration>0` 时进度轨全程线性推进 | ~1s + 进度轨 | `mm-dossier` |

`showcaseUnveil(tl, root, at, progressDuration)`：`progressDuration` 传 0 表示该场景不需要进度轨动画；否则传素材完整时长，钴蓝进度轨从 `at` 开始线性走满。

## 使用规则

- 同一场景组合 2–4 个动效族，重复产生识别度，全用产生噪音。元素进入后快速静止，不做持续漂浮或呼吸。
- 钴蓝只承担焦点、状态与最终值；`soft-emphasis` 是唯一的变色动效，一场最多一次。
- 扩展 motions.js 时保持：显式 `at` 定位、有限补间、无定时器/随机/播放态假设。
- `soft-emphasis` 的炭黑/钴蓝色值与 tokens.css 的 `--mm-ink` / `--mm-accent` 对应；改主题色时同步 motions.js 顶部常量。
