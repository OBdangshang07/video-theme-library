# signal-desk 旗舰转场（GPU）

这 5 个转场通过 WebGL 同时处理前后两幅场景纹理，使用信号 / 广播语言：静噪、滚动带、雷达、数据流与色散。它们用于片头、章节断点、核心结论或作品揭晓，不承担高频普通切换。

| ID | 视觉机制 | 适合位置 | 建议时长 | WebGL 不可用时回退 |
|---|---|---|---|---|
| `signal-static-interference` | 逐扫描线噪声位移 + 静噪雪花前缘，前缘带琥珀镶边，模拟模拟信号受扰的溶解 | 信号中断、反转、强对比 | 0.9–1.1s | `static-wipe` |
| `broadcast-roll-band` | VHS 滚动亮带自上而下滑落，带内行同步滑移（sync slip）与扫描线，带后完成换场 | 片头、栏目包装、品牌切换 | 1.0–1.2s | `teletype-roll` |
| `radar-sweep-reveal` | 雷达束自圆心扫掠一整圈，磷光余辉拖尾，扫过区域揭示新场并带琥珀距离环 | 主结论、关键信号、作品揭晓 | 1.1–1.3s | `signal-cut` |
| `data-stream-collapse` | 画面向水平中线坍缩，琥珀数据字形车道倾泻，中线闪光后新场展开 | 大章节、数据段落收束再展开 | 1.0–1.25s | `data-collapse` |
| `spectrum-dispersion-split` | RGB 通道水平色散分离到极值后，新场通道重新聚合，伴扫描线与轻微撕裂带 | 结论落点、状态确认、强提示 | 0.85–1.05s | `channel-zap` |

## 接入方式

从 `themes/signal-desk/advanced-transitions.js` 导入：

```js
import {
  createSignalDeskAdvancedTransition,
  signalDeskAdvancedTransitionMeta
} from "./themes/signal-desk/advanced-transitions.js";

const transition = createSignalDeskAdvancedTransition(canvas, {
  from: outgoingCanvas,
  to: incomingCanvas,
  effect: "radar-sweep-reveal"
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

- 着色器不得使用 `u_time`、运行时时钟或 `Math.random`；全部“随机”来自 `hash21(uv × resolution)` 或对进度 `p` 的确定性取步（如 `floor(p*13.)`）。
- 逐像素胶片颗粒允许：`hash21(v_uv*u_resolution+常量)`。
- 同一 `(from, to, progress)` 输入必须逐位一致地产生同一帧。

## 使用边界

- 同一支视频优先选一个旗舰转场作为签名动作，最多再增加一个只出现一次的强调转场。
- 画面交接时前后场景必须同时存在；不要先淡出旧场景再启动 GPU 转场。
- 琥珀只用作前缘、波束或数据流的局部信号；红色不进 GPU 转场（突发用 `breaking-flash` 基础转场）。
- 保留显式海军蓝或骨白背景，避免透明场景进入纹理后产生黑边。
- WebGL 不可用时按上表回退，不要复制一个近似的 CSS 假版本。
