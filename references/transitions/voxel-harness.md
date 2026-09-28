# voxel-harness 转场参考

16 个基础转场按叙事角色分组，5 个 GPU 旗舰转场见 [advanced-voxel-harness.md](advanced-voxel-harness.md)。基础转场全部接收 `(tl, parts, at, duration)`：项目的单一 paused GSAP timeline、所需元素、绝对时间位置、可选时长。

```js
import { voxelHarnessTransitions } from "./themes/voxel-harness/transitions.js";

voxelHarnessTransitions.chunkPush(tl, {
  outgoing: "#scene-a .scene-inner",
  incoming: "#scene-b .scene-inner"
}, 5.4, 0.56);
```

HyperFrames 接入：让前后两个 clip 在转场时长内于不同轨道上重叠，动画作用于 `.scene-inner` 包装层，clip 可见性仍由框架托管。交换型转场在中点用零时长 `fromTo` 交换前后场景的不透明度（fromTo 的 immediateRender 保证 build 态与重放时初始态一致，无残留）。覆盖类 parts 在转场结束时回到 `opacity:0`，重复播放幂等。

## Primary 主转场（约 60–70% 的切换）

| ID | 机制 | parts | 默认时长 |
|---|---|---|---|
| `chunk-push` | 新页自右全宽步进推入（steps 8），旧页同速退出 | outgoing, incoming | .56s |
| `block-rise` | 新页自下步进升起后落块压实（末端 −18px 回顿），旧页 420px 视差滞后并变暗 | outgoing, incoming | .6s |
| `portal-cross` | 新场自中心圆形光圈放大聚焦展开，旧场放大失焦 | outgoing, incoming | .78s |
| `camera-step` | 旧场推进放大退出，新场延迟 14% 步进跟拍入场 | outgoing, incoming | .64s |

## Section 章节转场

| ID | 机制 | parts | 默认时长 |
|---|---|---|---|
| `craft-grid` | 24 格合成格 steps(3) 拼满覆盖 → 交换 → 逐格拆解 | outgoing, incoming, tiles | .72s |
| `inventory-swap` | 9 格热键栏自下方弹入 → 交换 → 向上飞出 | outgoing, incoming, slots | .68s |
| `terrain-wipe` | 8 根地形柱自下生长覆盖（草缘在顶）→ 交换 → 整柱沉降让位 | outgoing, incoming, columns | .72s |
| `command-cut` | 草绿指令带自左步进铺满 → 交换 → 向右收起 | outgoing, incoming, overlay | .58s |

## Accent 点缀转场

| ID | 机制 | parts | 默认时长 |
|---|---|---|---|
| `ender-iris` | 方形光圈自中心扩成全帧并伴随微旋，旧场失焦 | outgoing, incoming | .76s |
| `block-shatter` | 24 块盖面方块向外碎散飞落，露出新场 | outgoing, incoming, tiles | .7s |
| `redstone-pulse` | 红石橙覆盖层 steps(4) 脉冲铺满 → 交换 → 衰减 | outgoing, incoming, overlay | .64s |
| `voxel-fold` | 旧场绕左轴 3D 折出，新场绕右轴折入（steps 8） | outgoing, incoming | .72s |
| `pixel-rain` | 8 根方块柱自上方步进坠落覆盖 → 交换 → 继续坠落离场 | outgoing, incoming, drops | .78s |
| `craft-flip` | 24 格翻板绕横轴 steps(4) 合拢 → 交换 → 反向翻开 | outgoing, incoming, tiles | .76s |
| `torch-flicker-cut` | 暖橙覆盖层不规则烁亮（8 段 steps(1) 亮度跳变）完成交换 | outgoing, incoming, overlay | .62s |
| `xp-drain` | 全宽 XP 槽充能（steps 10）→ 纵向爆满覆盖 → 交换 → 回流成槽 → 排空 | outgoing, incoming, track, fill | .7s |

## parts 契约

- `outgoing` / `incoming`：前后场景的 `.scene-inner` 包装元素，必填。交换型预设由 `setSwap` 在中点处理；揭示型预设由 fromTo 管理 `incoming` 的不透明度。
- `overlay`：全帧覆盖层 div，初始 `opacity:0`，颜色由预设设置（command-cut 草绿、redstone-pulse / torch-flicker-cut 红石橙）。
- `tiles`：24 个格片（6 列 × 4 行，各 16.6667% 宽、25% 高），表面色描边，每第 5 片草绿；craft-grid 用 scale、block-shatter 用位移飞散、craft-flip 用 rotationX。
- `slots`：9 个热键槽（各 7% 宽、12.4% 高，横向居中分布于帧的 44% 纵深处）。
- `columns`：8 根全高地形柱（各 12.5% 宽），表面色，顶部 6px 草缘；生长 origin 在底。
- `drops`：8 根全高方块柱（各 12.5% 宽），30px 方块重复纹理；用 yPercent 坠落，行程与帧高无关。
- `track` / `fill`（xp-drain）：全宽 18px 高槽轨（深底描边）与同位置草绿填充条，垂直居中；fill 的 scaleY 在覆盖期放大到 64 倍。
- 所有 parts 初始 `opacity:0`（CSS 或调用方保证）；预设结束时会将其归位隐藏，重复调用幂等。

## 选择纪律

一支视频选一个主转场承担大部分切换，加一两个点缀；`block-shatter`、`xp-drain`、`craft-flip` 保持少见以保住冲击力。插件发布视频建议以 `chunk-push` 为主转场，功能章节用 `craft-grid`，核心 UI 首次亮相用一次 `portal-cross` 或 `block-shatter`。需要逐像素形变的英雄时刻去读 GPU 旗舰文档。
