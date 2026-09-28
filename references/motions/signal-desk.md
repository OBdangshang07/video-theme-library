# signal-desk 动效参考

导入 `themes/signal-desk/motions.js`，把项目的单一 paused GSAP timeline 传给每个助手。签名统一为 `(tl, target, at=0, ...)` 并返回 timeline；全部为有限补间，seek-safe（无定时器、无随机数、无无限循环）。

```js
import { signalDeskMotions } from "./themes/signal-desk/motions.js";

const tl = gsap.timeline({ paused: true });
signalDeskMotions.headlineSplit(tl, "#scene-1 .headline", 0.25);
signalDeskMotions.storyStack(tl, "#scene-1 .story-row", 0.8);
signalDeskMotions.signalCount(tl, "#pulse-value", 1.2, 87);
signalDeskMotions.bulletinUnveil(tl, "#bulletin-overlay", 3.0, 52.0);
window.__timelines = window.__timelines || {};
window.__timelines.main = tl;
```

## 单目标动效

| ID | 机制 | 默认时长 | 参数 | 典型目标 |
|---|---|---|---|---|
| `headline-split` | x −62→0 + clip-path inset 揭示，expo.out | .64s | `duration` | 主标题、栏目名 |
| `ticker-roll` | xPercent 18→0 + 淡入，power3.out | .72s | `duration` | 快讯轨、市场横条 |
| `timecode-roll` | y −34→0 + 字距 .16em→0，power4.out | .48s | `duration` | 时间码、编号、更新标记 |
| `source-pin` | x −48→0 + 琥珀锚边 inset 阴影 0→8px 生长，expo.out | .58s | `duration` | 来源卡（锚边为 inset box-shadow，不动布局） |
| `signal-pulse` | scale .35→1 + 琥珀光晕 0→16px 一次落定，back.out | .56s | `duration` | 直播点、状态指示 |
| `story-stack` | x 70→0 + clip inset 揭示，级联 .09，power4.out | .58s | `duration`、`stagger` | 多条消息卡按编辑顺序入场 |
| `bar-surge` | scaleY 0→1（底缘原点），级联 .035，expo.out | .68s | `duration`、`stagger` | 数据条、趋势柱 |
| `quote-cut` | 斜切 clip polygon 揭示 + 字距收紧，power3.out | .62s | `duration` | 引文、关键表态 |
| `alert-hit` | scaleX .72→1 + 亮度 1.8→1 落位，back.out | .46s | `duration` | 突发横幅、判定印（红色仅突发/风险） |
| `desk-lock` | scale .92→1 + inset clip 收拢展开，expo.out | .7s | `duration` | 结尾署名锁定 |
| `signal-count` | 状态对象插值写 textContent，power3.out | 1.0s | `end=100`、`duration`、`formatter` | data-pulse 数值（target 为元素或选择器） |

`source-pin` 不再使用 `borderLeftWidth`（触发布局）；锚边是组件自身的 `box-shadow: inset 8px 0 0 var(--sd-accent)`，动效只做 0→8px 的阴影插值，等价于一根琥珀条的 scaleX 生长。

## 组合动效（多相协同）

组合动效的 target 是组件根节点（选择器字符串），内部按类名查找子元素，要求使用对应组件的标准类名。

| ID | 编排 | 总跨度 | 目标组件 |
|---|---|---|---|
| `bulletin-unveil` | 头部(.3s@+.04) → 边框拭入(.6s@+.08) → 裁切标记(.28s 级联@+.22) → 页脚(@+.26) → 书脊/卷次(@+.32)；`progressDuration>0` 时进度轨全程线性推进 | ~1s + 进度轨 | `sd-bulletin` |
| `chapter-signal` | kicker 淡入(.28s) → 序号定版(.46s@+.06) → 标题拭入(.5s@+.18) → 琥珀规线绘出(.46s@+.3) | ~.76s | `sd-segment` |
| `evidence-reveal` | 证据帧拭入(.6s) → 元信息栏升起(.5s@+.14) → 标题与标签逐行落位(.34s 级联@+.3) | ~.7s | `sd-evidence-window` |

`bulletinUnveil(tl, root, at, progressDuration)`：`progressDuration` 传 0 表示该场景不需要进度轨动画；否则传素材完整时长，琥珀进度轨从 `at` 开始线性走满。

## 使用规则

- 同一场景组合 2–4 个动效族，重复产生识别度，全用产生噪音。
- 琥珀色承担焦点、状态、时间与数据；`alert-hit` 的红色只给突发、风险与修正，一场最多一次。
- 扩展 motions.js 时保持：显式 `at` 定位、有限补间、无定时器/随机/播放态假设。
- `signal-pulse`、`source-pin` 的琥珀色值与 tokens.css 的 `--sd-accent` 对应；改主题色时同步 motions.js 顶部常量。
