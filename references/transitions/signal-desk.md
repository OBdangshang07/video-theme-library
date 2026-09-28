# signal-desk 转场参考

16 个基础转场按叙事角色分组，5 个 GPU 旗舰转场见 [advanced-signal-desk.md](advanced-signal-desk.md)。基础转场全部接收 `(tl, parts, at, duration)`：项目的单一 paused GSAP timeline、所需元素、绝对时间位置、可选时长。

```js
import { signalDeskTransitions } from "./themes/signal-desk/transitions.js";

signalDeskTransitions.ribbonHandoff(tl, {
  outgoing: "#scene-a .scene-inner",
  incoming: "#scene-b .scene-inner",
  ribbon: "#tx-ribbon"
}, 5.4, 0.72);
```

HyperFrames 接入：让前后两个 clip 在转场时长内于不同轨道上重叠，动画作用于 `.scene-inner` 包装层，clip 可见性仍由框架托管。交换型转场在中点用零时长 `fromTo` 交换前后场景的不透明度（fromTo 的 immediateRender 保证 build 态与重放时初始态一致，无残留）。大多数 parts 在转场结束时回到 `opacity:0`，重复播放幂等。

## Primary 主转场（约 60–70% 的切换）

| ID | 机制 | parts | 默认时长 |
|---|---|---|---|
| `ribbon-handoff` | 琥珀快讯带斜切扫过全帧，新页自右带 clip 迎入，旧页 120px 视差退场 | outgoing, incoming, ribbon | .72s |
| `headline-push` | 骨白标题带横向贯穿，旧页上收 48% 裁切、新页自下迎入 | outgoing, incoming, headline | .68s |
| `desk-cross` | 5 根琥珀规线自左编织铺满 → 旧页微缩压暗 → 新页景深落定 → 规线向右收起 | outgoing, incoming, rails | .74s |
| `feed-rise` | 6 条信息行整体匀速上卷飞过（yPercent ±640），新页随后升起 | outgoing, incoming, rows | .7s |

## Section 章节转场

| ID | 机制 | parts | 默认时长 |
|---|---|---|---|
| `timecode-jump` | 时间码放大 5.8× 扑出画面 → 中点交换 → 新场自 45% 竖向开口展开 | outgoing, incoming, timecode | .76s |
| `bulletin-shutter` | 8 根琥珀竖条自上而下合拢 → 交换 → 换底缘原点反向展开（尾序反向） | outgoing, incoming, slats | .78s |
| `source-stack` | 4 张来源卡自右飞入横穿、自左飞出（±125% 卡宽），新页随后落定 | outgoing, incoming, cards | .8s |
| `signal-cut` | 信号点弹落焦点 (78%,22%) → 三层环扩散 → 旧场圆孔收拢、新场圆孔打开 | outgoing, incoming, signal, rings | .68s |

## Accent 点缀转场

| ID | 机制 | parts | 默认时长 |
|---|---|---|---|
| `breaking-flash` | 红色闪屏自中线铺满 → 交换 → 收拢，红色突发带同步横穿；仅突发/修正 | outgoing, incoming, flash, banner | .58s |
| `headline-crush` | 旧场向左压扁成 12% 并失焦，两个关键词从右侧砸入再退出，新场自右揭示 | outgoing, incoming, words | .72s |
| `map-aperture` | 旋转光圈自中心扩成斜置窗口覆盖旧场（标记点弹出），随后光圈淡出揭示新场 | outgoing, incoming, aperture, markers | .82s |
| `data-collapse` | 10 根数据条自两端向中间坍缩 → 单值 6× 放大定格 → 新场竖向开口展开 | outgoing, incoming, bars, datum | .78s |
| `static-wipe` | 22% 宽静噪带左→右扫过，旧场过曝一闪，中点交换，新场微缩落定 | outgoing, incoming, band | .64s |
| `amber-rule-cut` | 琥珀规线自左绘出 → 上下两块琥珀板自中线铺满 → 交换 → 两板向上下分裂滑出 | outgoing, incoming, rule, slabs | .66s |
| `teletype-roll` | 新场以 steps(14) 步进自下电传式上卷，琥珀引导规线贴在卷动前缘 | outgoing, incoming, bar | .7s |
| `channel-zap` | 旧场压成一根 2.2× 亮线（换台感），辉光线扩张，新场自亮线展开 | outgoing, incoming, glow | .62s |

## parts 契约

- `outgoing` / `incoming`：前后场景的 `.scene-inner` 包装元素，必填。`incoming` 在大多数预设里由 fromTo 管理不透明度；交换型预设由 `setSwap` 在中点处理。
- `ribbon` / `headline` / `banner`：全宽横向带（高约 70px / 55px / 70px，置于纵向 40% 处），ribbon 为琥珀、headline 为骨白、banner 为红色。初始 `opacity:0`。
- `rails`：5 根全宽水平琥珀规线（各高约 12px，分布于 22%–82% 纵向区间）。
- `rows`：6 条全宽信息行，各 1/6 帧高，半透明琥珀底 + 琥珀下缘线；用 yPercent 飞行，行程与帧高无关。
- `slats`：8 根全高竖条（各 12.5% 宽），琥珀色。`cards`：4 张全宽来源卡（骨白底 + 琥珀左锚边，高约 46–52px，分布于 26%–59%）。
- `timecode`：居中大号等宽时间码（琥珀）；`datum`：居中大号数值（琥珀 display 字）。
- `signal`：焦点 (78%,22%) 处的琥珀圆点（46px）；`rings`：同圆心的 3 个琥珀描边圆环（46px，5px 边）。
- `flash`：全帧红色覆盖层，初始 `opacity:0`，scaleY 自中线展开。
- `words`：2 个大写 display 关键词（琥珀），位于左侧 8%、纵向 36%/51%。
- `aperture`：全帧 surface-2 色覆盖层，内置斜置四边形 clip-path 动画，覆盖期不透明度 .92。
- `markers`：3 个琥珀地图标记（26px 圆点 + 深色描边），位置约 (30%,58%) / (54%,36%) / (70%,62%)。
- `bars`：10 根底对齐琥珀竖条（各 7% 宽，高度 35%–88% 参差）。`band`：22% 宽全高静噪带（重复渐变噪纹）。
- `rule`：全宽 4px 琥珀水平规线（垂直居中）。`slabs`：上下两块各 50% 高的琥珀板。
- `bar`（teletype-roll）：全宽 6px 琥珀引导规线，初始位于帧底下方（y=1080），随上卷同步到帧顶。
- `glow`：全宽 3px 骨白辉光线（垂直居中，带外发光）。
- 所有 parts 初始 `opacity:0`（CSS 或调用方保证）；预设结束时会将其归位隐藏，重复调用幂等。

## 选择纪律

一支视频选一个主转场承担大部分切换，加一两个点缀；`breaking-flash` 严格留给突发与修正，`data-collapse`、`timecode-jump` 保持少见以保住冲击力。需要逐像素形变的英雄时刻才去读 GPU 旗舰文档。
