# Video Theme Library

用户个人 HyperFrames 视频主题、组件、元素动效与场景转场库。

当前稳定主题：

- `paper-editorial`（宣纸编辑部）：编辑、档案与内容密集型视觉。
- `modern-minimal`（现代秩序）：瑞士网格、大留白、炭黑结构与钴蓝焦点。
- `voxel-harness`（方块终端）：黑曜石工具界面、Pixelify Sans 字体、像素槽位与阶梯运动。
- `signal-desk`（信号台）：海军蓝新闻编辑台、琥珀信号、时间码、来源结构与分层快讯转场。

## 给其他 Agent 的用法

让 Agent 读取根目录 `SKILL.md`，然后直接指定：

> 使用 `$video-theme-library` 的 `paper-editorial` 主题，调用 `artifact-frame`、`comparison-split` 与 `stamp-impact`，制作这期视频。

完整播放网页录屏、作品或演示素材：

> 使用 `$video-theme-library` 的 `paper-editorial` 主题，调用 `screening-dossier` 和 `screening-unveil`。主体名与作品名都保持醒目，强调元数据按内容决定是否保留。

指定转场体系：

> 使用 `paper-push` 作为主转场，章节切换使用 `chapter-bridge`，关键结果使用一次 `stamp-cover`。

也可以只指定主题：

> 使用 `$video-theme-library` 的 `paper-editorial` 主题，组件由你根据内容选择，不要照搬展厅文案。

调用第二套主题：

> 使用 `$video-theme-library` 的 `modern-minimal` 主题，主转场使用 `split-slide`，章节切换使用 `blue-line-cut`。

调用第三套主题：

> 使用 `$video-theme-library` 的 `voxel-harness` 主题，主转场使用 `chunk-push`，功能章节使用 `craft-grid`，核心界面亮相使用一次 `portal-cross`。

调用第四套主题：

> 使用 `$video-theme-library` 的 `signal-desk` 主题，主转场使用 `ribbon-handoff`，专题章节使用 `timecode-jump`，关键数据使用一次 `data-collapse`。

## 本地检查

```powershell
npm run validate:catalog
npm run check
```

`index.html` 是 `paper-editorial` 的可滚动设计展厅：16 个 canonical 组件 + 17 个主题专属组件、31 个元素动效、16 个基础场景转场和 5 个 GPU 旗舰转场均可独立查看与重播，全部演示由主题真实模块驱动。

`ink-form` / 墨迹聚形：把 ZIP 项目的墨粒成字效果改造成可按时间任意定位的 Canvas 组件。可传文字、本地 SVG、透明 PNG 轮廓，或用 `maskMode: "dark"` 提取浅底图片中的深色图标；代码在 `themes/paper-editorial/ink-form.js`，生产用法见 `references/components/paper-editorial.md`。`showcases/ink-form/` 是单字、短句和图形三段 HyperFrames 样片。

`showcases/workflow-upgrades/` 有同题双模型作品展与六维测评的两支独立 demo；工作流配方见 `references/workflows/`。其中六维结果保留六边形面板，以墨色刻度、朱砂轮廓与精准索引收束。

`movable-type` / 活字归版、`rubbing-reveal` / 拓印显影、`paper-cutaway` / 纸层剖视：三个可按绝对时间回放的宣纸材料组件，分别接收任意文字、本地图像、2–4 层对位图像。代码在 `themes/paper-editorial/`，生产用法见 `references/components/paper-editorial.md`，三段样片见 `showcases/editorial-materials/`。

`themes/paper-editorial/snippets/slate-flight.html`：引导页 → 作品页的完整时序片段（定行 → 导语飞行 → 作品窗浮出），
附带三条硬约束：静止态必须写在 CSS、媒体面不要 clip、先飞再开窗。

`showrooms/modern-minimal.html`：`modern-minimal` 展厅，17 个组件、14 个动效、16 + 5 个转场。

`showrooms/voxel-harness.html`：`voxel-harness` 展厅，20 个组件、14 个动效、16 + 5 个转场。

`showrooms/signal-desk.html`：`signal-desk` 展厅，21 个组件、14 个动效、16 + 5 个转场。

每个主题的逐条参考文档位于 `references/{components,motions,transitions}/<theme>.md` 与 `references/transitions/advanced-<theme>.md`。

`timeline-demo/index.html` 保留原有的 56 秒 HyperFrames 合成演示，仅作为时间轴组合参考。它是独立的 HyperFrames 子项目。
