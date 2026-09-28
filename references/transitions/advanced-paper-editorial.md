# paper-editorial 旗舰转场（GPU）

这 5 个转场通过 WebGL 同时处理前后两幅场景纹理。它们用于片头、章节断点、核心结论或作品揭晓，不承担高频普通切换。

| ID | 视觉机制 | 适合位置 | 建议时长 | WebGL 不可用时回退 |
|---|---|---|---|---|
| `ink-diffusion-field` | 多层噪声模拟墨沿纸纤维渗化，边界有浓淡与朱砂积墨，积墨宽度随纤维走向变化 | 主结论、作品揭晓 | 1.0–1.3s | `paper-push` |
| `fiber-tear-displacement` | 不规则纤维断口、局部位移、纸浆高光、边缘阴影与一线朱砂纤维 | 反转、纠错、强对比 | 0.9–1.2s | `tear-wipe` |
| `editorial-depth-warp` | 两幅版面在透视纵深中弯折并压合，中央折脊承接空间关系 | 大章节、时空层级变化 | 1.1–1.4s | `chapter-bridge` |
| `vermilion-pressure-wave` | 朱砂冲击环推动像素折射与轻微色散，波心向外揭示新场景 | 结论落点、状态确认 | 0.8–1.05s | `red-rule-cut` |
| `calligraphy-stroke-morph` | 毛笔轨迹构成流场，笔锋、飞白和湿墨共同拖拽画面 | 片头、主角登场、品牌切换 | 1.0–1.3s | `ink-sweep` |

## 接入方式

从 `themes/paper-editorial/advanced-transitions.js` 导入：

```js
import {
  createPaperEditorialAdvancedTransition,
  paperEditorialAdvancedTransitionMeta
} from "./themes/paper-editorial/advanced-transitions.js";

const transition = createPaperEditorialAdvancedTransition(canvas, {
  from: outgoingCanvas,
  to: incomingCanvas,
  effect: "ink-diffusion-field"
});

const state = { progress: 0 };
tl.to(state, {
  progress: 1,
  duration: 1.18,
  ease: "none",
  onUpdate: () => transition.render(state.progress)
}, transitionStart);
```

`from` 与 `to` 接受可上传为 WebGL 纹理的 Canvas、Image 或 VideoSource。HyperFrames 项目中应在时间轴建立前完成场景捕获；`render(progress)` 只由单一 paused timeline 的确定进度驱动。不要在渲染路径使用运行时时钟、随机数或异步换纹理。

展厅中的自动播放只负责网页交互。生产合成必须显式调用 `render(progress)`，这样任意时间点都可直接寻帧。

## 使用边界

- 同一支视频优先选一个旗舰转场作为签名动作，最多再增加一个只出现一次的强调转场。
- 画面交接时前后场景必须同时存在；不要先淡出旧场景再启动 GPU 转场。
- 朱砂只用作积墨、断口或压力波的局部信号，避免整屏红色闪烁。
- 保留显式米白或墨黑背景，避免透明场景进入纹理后产生黑边。
- WebGL 不可用时按上表回退，不要复制一个近似的 CSS 假版本。
