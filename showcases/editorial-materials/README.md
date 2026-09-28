# 宣纸编辑部 · 三个材料动效组件

19 秒 HyperFrames 样片：活字归版、拓印显影、纸层剖视。三个场景都使用主题库的真实模块和同一条 paused 时间线，支持从任意时间点直接求帧。组件分别接收可替换文案、本地 SVG/PNG、2–4 层对位图像；详情见 `../../references/components/paper-editorial.md`。

```powershell
node tools/make-mirror.mjs
node tools/sync-theme.mjs
npx hyperframes check
npx hyperframes snapshot --at 2.6,4.9,9.3,11.5,14.6,18.5
npx hyperframes preview --background
npx hyperframes render --quality delivery --output renders/editorial-materials-showcase.mp4
```

`assets/theme/` 是从 `themes/paper-editorial/` 冻结的副本。修改主题模块后须重新运行同步脚本，保证样片与主题库一致。`assets/mirror.svg` 为本地生成的示例图像；正式合成可替换为项目内的任意图像轮廓。渲染无需鼠标、滚动、实时时钟或网络媒体。
