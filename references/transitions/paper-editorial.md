# paper-editorial 转场参考

16 个基础转场按叙事角色分组，5 个 GPU 旗舰转场见 [advanced-paper-editorial.md](advanced-paper-editorial.md)。基础转场全部接收 `(tl, parts, at, duration)`：项目的单一 paused GSAP timeline、所需元素、绝对时间位置、可选时长。

```js
import { paperEditorialTransitions } from "./themes/paper-editorial/transitions.js";

paperEditorialTransitions.paperPush(tl, {
  outgoing: "#scene-a .scene-inner",
  incoming: "#scene-b .scene-inner"
}, 5.4, 0.62);
```

HyperFrames 接入：让前后两个 clip 在转场时长内于不同轨道上重叠，动画作用于 `.scene-inner` 包装层，clip 可见性仍由框架托管。大多数转场在中点用 `set` 交换前后场景的不透明度。

## Primary 主转场（约 60–70% 的切换）

| ID | 机制 | parts | 默认时长 |
|---|---|---|---|
| `paper-push` | 新页自右全宽推入，旧页 560px 视差滞后 | outgoing, incoming | .62s |
| `folio-rise` | 新页自下升起，旧页上飘 320px 并微缩 | outgoing, incoming | .66s |
| `focus-press` | 旧页放大失焦，新页延迟 22% 从景深压合 | outgoing, incoming | .72s |
| `margin-pull` | 墨版带纸纤维毛边自上向下扯过（clip-path 毛边内置于覆盖层） | outgoing, incoming, overlay | .7s |

## Section 章节转场

| ID | 机制 | parts | 默认时长 |
|---|---|---|---|
| `red-rule-cut` | 朱线自左绘出 → 朱砂铺满 → 交换 → 收拢归线 | outgoing, incoming, overlay, rule | .66s |
| `column-cascade` | 8 栏片上下交错 scaleY 编织覆盖再展开 | outgoing, incoming, columns | .76s |
| `archive-shutter` | 8 叶片左右交错 scaleX 合拢再开启 | outgoing, incoming, slats | .72s |
| `chapter-bridge` | 墨版斜切扫过，旧页微缩新页景深落定 | outgoing, incoming, overlay | .82s |

## Accent 点缀转场

| ID | 机制 | parts | 默认时长 |
|---|---|---|---|
| `ink-sweep` | 粗纤维有机前缘扫入，旧页视差后退 | outgoing, incoming | .78s |
| `tear-wipe` | 细纤维撕口前缘，旧页轻微倾斜 | outgoing, incoming | .7s |
| `diagonal-slice` | 对角裁切揭示，可带朱砂裁缝线掠过 | outgoing, incoming, slash（可选） | .62s |
| `ink-iris` | 墨圈自中心圈入，新页 1.04→1 落定，旧页失焦 | outgoing, incoming | .76s |
| `paper-fold` | 旧页 3D 折出并随折痕变暗，新页延迟推入 | outgoing, incoming | .72s |
| `stamp-cover` | 朱砂印章加速盖满 → 交换 → 向右上揭起离场 | outgoing, incoming, overlay | .66s |
| `paper-stack` | 3 张纸页自右飞入码齐，交换后自左飞出 | outgoing, incoming, sheets | .78s |
| `ink-dip` | 画面沉入墨黑再浮出，谷底一线朱砂掠过 | outgoing, incoming, overlay, flash（可选） | .74s |

## parts 契约

- `outgoing` / `incoming`：前后场景的 `.scene-inner` 包装元素，必填。
- `overlay`：全帧覆盖层 div，初始 `opacity:0`，颜色由预设设置。
- `rule` / `flash`：全宽水平细条（rule 4px、flash 3px，垂直居中），初始 `opacity:0`。
- `slash`：约 2600px 长、5px 高的细条，旋转约 −29° 置于舞台中心，初始 `opacity:0`。
- `slats`：8 条全宽水平叶片（各 12.5% 高）；`columns`：8 条全高竖栏（各 12.5% 宽）；`sheets`：3 张全帧纸页。颜色由调用方给定。
- 标注"可选"的 parts 缺省时预设自动跳过对应细节，不影响主机制。

## 选择纪律

一支视频选一个主转场承担大部分切换，加一两个点缀；`chapter-bridge`、`stamp-cover`、`red-rule-cut` 保持少见以保住冲击力。需要逐像素形变的英雄时刻才去读 GPU 旗舰文档。
