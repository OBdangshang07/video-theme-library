# voxel-harness 动效参考

导入 `themes/voxel-harness/motions.js`，把项目的单一 paused GSAP timeline 传给每个助手。签名统一为 `(tl, target, at=0, ...)` 并返回 timeline；全部为有限补间，seek-safe。

```js
import { voxelHarnessMotions } from "./themes/voxel-harness/motions.js";

const tl = gsap.timeline({ paused: true });
voxelHarnessMotions.chunkLoad(tl, "#scene-1 .panel", 0.25);
voxelHarnessMotions.slotCascade(tl, "#scene-1 .vh-slot", 0.75);
voxelHarnessMotions.xpCount(tl, "#xp-stat-value", 1.0, 87);
voxelHarnessMotions.hudUnveil(tl, "#gameplay-dossier", 3.0, 52.0);
window.__timelines = window.__timelines || {};
window.__timelines.main = tl;
```

## 单目标动效

阶梯（steps）缓动保留像素节奏；弹性（bounce/back）只用于方块与物品的落点。

| ID | 机制 | 默认时长 | 参数 | 典型目标 |
|---|---|---|---|---|
| `chunk-load` | clip-path 对角 inset 揭示，steps(6) | .62s | `duration` | 面板、整版内容的区块加载 |
| `block-drop` | y −96→0 + 微旋落定，bounce.out | .5s | `duration` | 方块、物品、重点元素落点 |
| `slot-cascade` | scale .45→1 + 淡入，back.out(1.7) | .44s | `duration`、`stagger=.055` | 物品栏、功能槽位序列 |
| `command-type` | clip-path 自左步进揭示，steps(12) | .72s | `duration` | 命令行、路径、代码行 |
| `cursor-snap` | x −48→0 + 淡入，expo.out | .38s | `duration` | 提示符、状态行锁定 |
| `bar-charge` | scaleX 0→1，steps(16) | .82s | `duration` | XP 条、进度与加载刻度 |
| `item-pop` | scale .2→1 + 旋转 −18°→0，back.out(2.2) | .42s | `duration` | 图标、标记、快捷键 |
| `pane-unfold` | rotationY −82°→0（左轴），power3.out | .66s | `duration` | UI 面板 3D 展开 |
| `status-flash` | 红石橙闪态回到稳定面板色 + 压实 | .54s | `duration` | 构建/发布状态确认（plugin-status） |
| `logo-craft` | scale 1.45→1 + 模糊聚焦 + 微旋 | .74s | `duration` | 英雄标题与发布主张 |
| `xp-count` | 状态对象插值写 textContent，steps(16) | 1.1s | `end=100`、`duration`、`formatter` | 统计数值（target 为元素或选择器） |

`status-flash` 的颜色取自 motions.js 顶部常量（`ALERT` / `SURFACE` / `INK`），与 tokens.css 的 `--vh-alert` / `--vh-surface` / `--vh-ink` 对应；改主题色时同步顶部常量。

## 组合动效（多相协同）

组合动效的 target 是组件根节点（选择器字符串），内部按类名查找子元素，要求使用对应组件的标准类名。

| ID | 编排 | 总跨度 | 目标组件 |
|---|---|---|---|
| `hud-unveil` | 头部(steps4 .3s@+.04) → 边框步进拭入(.6s@+.08) → 裁切标记弹出(.26s 级联@+.22) → 页脚(@+.26) → 书脊/卷次(@+.32)；`progressDuration>0` 时进度轨全程线性推进 | ~1s + 进度轨 | `vh-dossier` |
| `chunk-mark` | kicker 落位(.28s) → 序号定版(.46s@+.06) → 标题步进拭入(.5s@+.18) → 草绿规线充能(.46s@+.3) | ~.76s | `vh-chunk` |
| `lockup-boot` | 结语句步进升起(.5s 级联.12) → 光标句读落印(.28s@+.48) → 落款淡入(.34s@+.66) | ~1s | `vh-lockup` |

`hudUnveil(tl, root, at, progressDuration)`：`progressDuration` 传 0 表示该场景不需要进度轨动画；否则传素材完整时长，草绿进度轨从 `at` 开始线性走满。

## 使用规则

- 同一场景组合 2–4 个动效族，重复产生识别度，全用产生噪音。
- 扩展 motions.js 时保持：显式 `at` 定位、有限补间、无定时器/随机/播放态假设。
- 像素字体（Pixelify Sans）上下文只用 ASCII 分隔符（`/`、`:`、`>`）；`·`、`×`、箭头等字符会落到错误字形。
