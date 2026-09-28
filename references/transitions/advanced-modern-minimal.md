# modern-minimal 旗舰转场（GPU）

这 5 个转场通过 WebGL 同时处理前后两幅场景纹理，使用精确 / 秩序语言：网格形变、扫描线、轴镜、景深与阈值解析。它们用于片头、章节断点、核心结论或作品揭晓，不承担高频普通切换。

| ID | 视觉机制 | 适合位置 | 建议时长 | WebGL 不可用时回退 |
|---|---|---|---|---|
| `grid-warp-field` | 瑞士网格随交换前缘弯曲形变再回弹归位，形变区网格转钴蓝，前缘带钴蓝高光 | 大章节、结构变化与维度切换 | 1.1–1.3s | `grid-shift` |
| `cobalt-scan-sweep` | 精密钴蓝扫描线自上而下扫过，线附近行级滑移与扫描线微光，扫过区域揭示新场，校准刻度尾随 | 片头、品牌性切换与栏目包装 | 0.9–1.1s | `blue-line-cut` |
| `axis-mirror-split` | 画面沿垂直中轴裂开，左右两半镜像分离，钴蓝接缝跟随开口，新场自中心展开 | 反转、纠错与强对比 | 0.8–1.0s | `split-slide` |
| `focus-rack-depth` | 旧场先行失焦（多点采样景深模糊），新场自模糊中重新合焦，中段轻微暗角与钴蓝呼吸 | 主结论、关键证据或作品揭晓 | 1.0–1.2s | `clean-cross` |
| `threshold-resolve` | 画面压成两色海报化，16×9 网格单元按阅读顺序解析为新场，翻转前缘带钴蓝闪格 | 结论落点、状态确认与强提示 | 0.7–0.9s | `precision-zoom` |

## 接入方式

从 `themes/modern-minimal/advanced-transitions.js` 导入：

```js
import {
  createModernMinimalAdvancedTransition,
  modernMinimalAdvancedTransitionMeta
} from "./themes/modern-minimal/advanced-transitions.js";

const transition = createModernMinimalAdvancedTransition(canvas, {
  from: outgoingCanvas,
  to: incomingCanvas,
  effect: "grid-warp-field"
});

const state = { progress: 0 };
tl.to(state, {
  progress: 1,
  duration: 1.2,
  ease: "none",
  onUpdate: () => transition.render(state.progress)
}, transitionStart);
```

`from` 与 `to` 接受可上传为 WebGL 纹理的 Canvas、Image 或 VideoSource。HyperFrames 项目中应在时间轴建立前完成场景捕获；`render(progress)` 只由单一 paused timeline 的确定进度驱动。不要在渲染路径使用运行时时钟、随机数或异步换纹理。

展厅中的自动播放只负责网页交互。生产合成必须显式调用 `render(progress)`，这样任意时间点都可直接寻帧。

## 确定性规则

- 着色器不得使用 `u_time`、运行时时钟或 `Math.random`；全部"随机"来自 `hash21(uv × resolution)` 或对进度 `p` 的确定性取步。
- 逐像素胶片颗粒允许：`hash21(v_uv*u_resolution+常量)`。
- 同一 `(from, to, progress)` 输入必须逐位一致地产生同一帧。

## 使用边界

- 同一支视频优先选一个旗舰转场作为签名动作，最多再增加一个只出现一次的强调转场。
- 画面交接时前后场景必须同时存在；不要先淡出旧场景再启动 GPU 转场。
- 钴蓝只用作前缘、接缝、扫描线或闪格的局部信号，避免整屏蓝色闪烁。
- 保留显式暖灰白或炭黑背景，避免透明场景进入纹理后产生黑边。
- WebGL 不可用时按上表回退，不要复制一个近似的 CSS 假版本。
