# modern-minimal 转场参考

16 个基础转场按叙事角色分组，5 个 GPU 旗舰转场见 [advanced-modern-minimal.md](advanced-modern-minimal.md)。基础转场全部接收 `(tl, parts, at, duration)`：项目的单一 paused GSAP timeline、所需元素、绝对时间位置、可选时长。

```js
import { modernMinimalTransitions } from "./themes/modern-minimal/transitions.js";

modernMinimalTransitions.axisRise(tl, {
  outgoing: "#scene-a .scene-inner",
  incoming: "#scene-b .scene-inner",
  rule: "#tx-rule"
}, 5.4, 0.66);
```

HyperFrames 接入：让前后两个 clip 在转场时长内于不同轨道上重叠，动画作用于 `.scene-inner` 包装层，clip 可见性仍由框架托管。交换型转场在覆盖完成的瞬间用零时长 `set` 交换前后场景的不透明度。全 bleed 位移统一用 `xPercent/yPercent` 或 `left/top` 百分比表达，1920×1080 与缩放预览下行为一致；大多数 parts 在转场结束时回到 `opacity:0`，重复播放幂等。

## Primary 主转场（约 60–70% 的切换）

| ID | 机制 | parts | 默认时长 |
|---|---|---|---|
| `split-slide` | 新页自右全宽推入（xPercent），旧页 360px 视差滞后 | outgoing, incoming | .58s |
| `axis-rise` | 新页自下上卷，钴蓝引导规线贴新页上缘行走，旧页延迟 8% 上飘微缩 | outgoing, incoming, rule | .66s |
| `clean-cross` | 双方微缩呼吸的干净叠化（.985↔1.015），sine.inOut | outgoing, incoming | .68s |
| `frame-pull` | 新页自右侧 7% 开口拉满画框，旧页 90px 轻退 | outgoing, incoming | .64s |

## Section 章节转场

| ID | 机制 | parts | 默认时长 |
|---|---|---|---|
| `blue-line-cut` | 钴蓝线自左铺满全帧 → 中点交换 → 自右收拢 | outgoing, incoming, overlay | .52s |
| `grid-shift` | 8 根柱列（钴蓝/炭黑相间）错位纵向飞越，柱列覆盖期交换 | outgoing, incoming, columns | .7s |
| `panel-lock` | 炭黑面板自 82% 圆角锁合到全帧 → 交换 → 再释放为圆角淡出 | outgoing, incoming, overlay | .66s |
| `section-index-swap` | 巨号章节索引横穿画面（1920→−1920），覆盖中点交换，新页微缩落定 | outgoing, incoming, index | .76s |

## Accent 点缀转场

| ID | 机制 | parts | 默认时长 |
|---|---|---|---|
| `aperture-box` | 中心矩形光圈自 48% inset 打开揭示新页，旧页放大失焦 | outgoing, incoming | .68s |
| `precision-zoom` | 旧页前推 1.32× 失焦退出，新页自 .72× 景深收回 | outgoing, incoming | .62s |
| `axis-fold` | 旧页绕顶缘水平轴 3D 折出，新页自底缘展开 | outgoing, incoming | .72s |
| `dot-expand` | 焦点圆自 (78%,22%) 扩开圈入新页，旧页轻微偏移 | outgoing, incoming | .7s |
| `swiss-cross-cut` | 钴蓝竖规线骑行 clip 揭示前缘，炭黑横规线同步下行，两线在精确中心相交并弹出钴蓝交点 | outgoing, incoming, ruleV, ruleH, cross | .66s |
| `grid-dissolve` | 24 格（6×4）按阅读顺序 rotationX 翻牌覆盖 → 中点交换 → 同序翻开 | outgoing, incoming, cells | .78s |
| `measure-cut` | 两根量规自两侧夹紧至中线，咬合压缩瞬间交换，随后释放退回 | outgoing, incoming, caliperL, caliperR | .7s |
| `panel-slide-over` | 新面板带钴蓝前缘滑覆旧页（旧页滞留可见），到位后旧页快速左出 | outgoing, incoming, edge | .74s |

## parts 契约

- `outgoing` / `incoming`：前后场景的 `.scene-inner` 包装元素，必填。`incoming` 在揭示型预设里由 fromTo 管理；交换型预设由 `setSwap` 在中点处理。
- `overlay`：全帧覆盖层 div，初始 `opacity:0`，颜色由预设设置（`blue-line-cut` 为钴蓝、`panel-lock` 为炭黑）。
- `rule`：全宽 6px 水平规线（贴帧顶，`top:0`），由预设以 `top` 百分比驱动为引导线；颜色由预设设置（钴蓝）。
- `columns`：8 根全高竖栏（各 12.5% 宽），钴蓝/炭黑相间（颜色由调用方给定）；用 yPercent 飞行，行程与帧高无关。
- `index`：居中巨号 display 数字（如 `02`，约 180px，钴蓝），初始 `opacity:0`。
- `ruleV` / `ruleH`：全高 5px 竖规线（初始 `left:0`，钴蓝）与全宽 5px 横规线（初始 `top:0`，炭黑），分别以 `left/top` 百分比 0%→100% 同步扫过，在画面中心相交。
- `cross`：26px 正方形，定位于精确中心（`left/top:50%`，margin −13px），两线相交时弹出后消散。
- `cells`：24 块网格瓦片（6 列 × 4 行，各 16.667%×25%，留少量重叠防发丝缝），炭黑底、每第 5 块钴蓝；需父级 `perspective` 支持 rotationX 翻牌。
- `caliperL` / `caliperR`：全高 6px 量规，分别贴左/右缘（`left:0` / `right:0`），以 `left/right` 百分比夹紧到中线，咬合时 scaleY 压缩。
- `edge`：全高 6px 钴蓝前缘条，初始 `left:100%`，贴新面板前缘行至 `0%`。
- 所有 parts 初始 `opacity:0`（CSS 或调用方保证）；预设结束时会将其归位隐藏，重复调用幂等。

## 选择纪律

一支视频选一个主转场承担大部分切换，加一两个点缀；`section-index-swap`、`grid-dissolve`、`measure-cut` 保持少见以保住冲击力。需要逐像素形变的英雄时刻才去读 GPU 旗舰文档。
