# 纸墨动效串联 · 宣纸编辑部 3.0

一支 37 秒、1920×1080、30 fps 的 HyperFrames 合成，把 paper-editorial 3.0 的材料动效、基础转场与一个 GPU 旗舰转场串成一条时间线。全部动画挂在单一 paused GSAP 时间线上，纹理、遮罩与 SVG 滤镜在建轴时按固定种子生成；任意帧都可直接 seek。

成片：`renders/paper-motion-reel.mp4`。

| 时间 | 场景 | 动效 | 进入转场 |
| --- | --- | --- | --- |
| 0–5.2s | 墨定标题 | `ghost-settle` · `line-set` · **`ink-slam`**（墨渗遮罩 + 湿墨滤镜）· `underline-draw` · `folio-swap` | — |
| 4.2–10.1s | 三联指标 | `line-set` · `paper-rise` · `count-up` · `bar-draw` · `red-result-emphasis` | `margin-pull` 1.0s |
| 9.2–14.6s | 引文与判定 | `quote-reveal` · `stamp-impact` | `ink-sweep` .92s |
| 13.8–18.4s | 章节 | `chapter-mark` · `line-set` | `red-rule-cut` .8s |
| 17.6–25.4s | 拓印显影 | `rubbing-reveal`（`mode:"intaglio"`） | `tear-wipe` .84s |
| 24.1–32.4s | 活字归版 | `movable-type` | GPU `ink-diffusion-field` 1.3s（无 WebGL 回退 `paper-push`） |
| 31.4–37s | 收尾 | `end-lock` · `seal-press` | `ink-dip` 1.0s |

页眉、纸纹与朱砂进度轨是全片常驻层，盖在所有场景与转场之上。

## 结构

- 每个场景是一个 `.clip`，内容放在 `.scene-inner` 包装层里；转场只作用于包装层，clip 的可见性仍由 HyperFrames 托管。相邻场景在转场时长内于不同轨道重叠。
- 转场部件（`overlay`、`rule`、`flash`）集中在 `.tx-layer`，初始 `opacity:0`。
- GPU 转场的前后纹理在建轴前生成：场景用同一张纸（底色 + 54px 网格，见 `assets/reel.css` 的 `.scene-inner`），`paperTexture()` 在 Canvas 上画出同样的纸，再叠上材料画布在切点那一刻的画面。WebGL 画布进出时因此没有跳变。
- 字体以 `url()` 绑定到私有族名（`assets/reel.css`），渲染不依赖本机字体；建轴前先 `document.fonts.load()`，因为 `ink-slam` 会在建轴时测量字面外框。

## 同步与渲染

```powershell
node tools/sync-theme.mjs          # 冻结 themes/paper-editorial 到 assets/theme/（含 classic/ 与 paper-kit.js）
npx hyperframes check --snapshots
npx hyperframes render --quality high --output renders/paper-motion-reel.mp4
```

`motions.js` 与 `transitions.js` 会导入 `./classic/*.js` 与 `./paper-kit.js`，同步脚本复制的是完整导入闭包；只复制入口文件会在浏览器里报模块缺失。

## 真实管线验证

这是 `ink-slam` 的 SVG 滤镜与 CSS 遮罩第一次走完整的 HyperFrames 渲染管线。已确认：

- HyperFrames 以 `visibility:hidden` 隐藏窗口外的 clip，而不是 `display:none`；建轴时 `ink-slam` 测到的字面外框有效，墨渗遮罩尺寸正确。
- 湿墨滤镜挂在 `body` 末尾的隐藏 `<svg><defs>` 中，由 `filter:url(#…)` 引用，逐帧截图保留滤镜效果；var() 驱动的 `mask-image` 在每帧 seek 后正确重绘，收尾的 `linear-gradient(#000,#000)` 不会让标题消失。
- 渲染用的 Chrome Headless Shell 提供 WebGL（无独立 GPU 时为 SwiftShader），GPU 转场走 shader 路径；`window.__reel.engine` 为 `false` 时说明回退到了 `paper-push`。
