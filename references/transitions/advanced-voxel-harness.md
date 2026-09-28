# voxel-harness 旗舰转场（GPU）

这 5 个转场通过 WebGL 同时处理前后两幅场景纹理，使用体素 / 游戏语言：方块崩解、传送门、像素排序、地形柱与红石电流。它们用于片头、章节断点、核心 UI 亮相或作品揭晓，不承担高频普通切换。

| ID | 视觉机制 | 适合位置 | 建议时长 | WebGL 不可用时回退 |
|---|---|---|---|---|
| `block-dissolve-chunks` | 旧场按 80px 方块网格逐块失稳滑落，落块描草绿边，块后露出新场 | 核心 UI 亮相、作品揭晓 | 1.0–1.2s | `block-shatter` |
| `portal-warp-swirl` | 双场反向漩涡扭曲，螺旋前缘带草绿辉光扫过完成穿越 | 片头、维度切换、品牌性交接 | 1.1–1.3s | `portal-cross` |
| `pixel-sort-cascade` | 逐列步进排序瀑布：列内行带垂直涂抹，列首草绿分界，按列错峰自上而下换场 | 数据对比、版本差异、强提示 | 0.9–1.1s | `command-cut` |
| `terrain-column-rise` | 旧场地形柱按 1/30 量化步长沉降，新场柱体隆升接管，柱顶草缘描边 | 大章节、世界或段落层级变化 | 1.2–1.4s | `terrain-wipe` |
| `redstone-surge-pulse` | 红石电流自左向右涌动，折线前缘辉光，刚过前缘的新场逐行步进增亮充能 | 结论落点、状态确认、充能提示 | 0.8–1.0s | `redstone-pulse` |

## 接入方式

从 `themes/voxel-harness/advanced-transitions.js` 导入：

```js
import {
  createVoxelHarnessAdvancedTransition,
  voxelHarnessAdvancedTransitionMeta
} from "./themes/voxel-harness/advanced-transitions.js";

const transition = createVoxelHarnessAdvancedTransition(canvas, {
  from: outgoingCanvas,
  to: incomingCanvas,
  effect: "block-dissolve-chunks"
});

const state = { progress: 0 };
tl.to(state, {
  progress: 1,
  duration: 1.1,
  ease: "none",
  onUpdate: () => transition.render(state.progress)
}, transitionStart);
```

`from` 与 `to` 接受可上传为 WebGL 纹理的 Canvas、Image 或 VideoSource。HyperFrames 项目中应在时间轴建立前完成场景捕获；`render(progress)` 只由单一 paused timeline 的确定进度驱动。不要在渲染路径使用运行时时钟、随机数或异步换纹理。

展厅中的自动播放只负责网页交互。生产合成必须显式调用 `render(progress)`，这样任意时间点都可直接寻帧。

## 确定性规则

- 着色器不使用 `u_time`、运行时时钟或 `Math.random`；全部"随机"来自 `hash21`（uv × resolution）或对进度 `p` 的确定性取步（如 `floor(p*16.)`）。
- 逐像素颗粒允许：`hash21(v_uv*u_resolution+常量)`。
- 同一 `(from, to, progress)` 输入必须逐位一致地产生同一帧。

## 使用边界

- 同一支视频优先选一个旗舰转场作为签名动作，最多再增加一个只出现一次的强调转场。
- 画面交接时前后场景必须同时存在；不要先淡出旧场景再启动 GPU 转场。
- 草绿只用作落块描边、前缘辉光或柱顶草缘的局部信号；红石橙只进 `redstone-surge-pulse`。
- 保留显式黑曜石或面板色背景，避免透明场景进入纹理后产生黑边。
- WebGL 不可用时按上表回退，不要复制一个近似的 CSS 假版本。
