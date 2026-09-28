# `voxel-harness` — 方块终端

方块终端是一套面向游戏插件、模组、开发工具和交互项目发布的深色像素工具界面。它为 Deepseek Harness Minecraft UI 插件首发设计，但组件与动效不绑定单一产品。

## 视觉语言

- 背景：黑曜石深绿 `#0E1410`
- 面板：`#172019` / `#202B22`
- 文字：沙色 `#ECE8D6`
- 主状态：草绿 `#7BD14B`
- 警告与构建变化：红石橙 `#E46F3A`
- 结构线：`#3B493D`
- 标题与短标签：本地 `Pixelify Sans`
- 正文：Noto Sans JP / 中文无衬线回退

字体文件已冻结到 `themes/voxel-harness/fonts/PixelifySans-VariableFont_wght.ttf`。标题、数字、状态和短标签使用像素字体；两行以上的解释正文使用高可读性无衬线字体。

## 设计边界

- 像素感来自 8px 栅格、4px 边框、阶梯阴影、槽位和块状遮罩。
- 不叠加全屏低分辨率滤镜，不把真实 UI 录屏主动模糊或马赛克化。
- 草绿代表可用、已连接和完成；红石橙只代表警告、变化或构建脉冲。
- 不复制 Minecraft 原版菜单、贴图和商标构图。方块几何与工具界面保持原创。
- 16:9 实机画面保持清晰，并通过 `gameplay-window` 与元信息区进入主题结构。
- 像素字体上下文只用 ASCII 分隔符（`/`、`:`、`>`）；`·`、`×`、`→` 等字符在该字体里会落到错误字形。

## 组件

20 个主题组件覆盖全部 16 个 canonical ID（映射见 `themes/voxel-harness/components.css` 顶部 catalog 头与 `../components/voxel-harness.md`）：

`voxel-title`、`hud-header`、`voxel-panel`、`command-block`、`feature-slots`、`comparison-pane`、`patch-list`、`build-path`、`keybind-chip`、`gameplay-window`、`inventory-strip`、`plugin-status`、`chunk-divider`、`terminal-note`、`xp-progress`、`release-lockup`、`xp-stat`、`stat-bench`、`lore-quote`、`gameplay-dossier`。

## 动效

14 个动效：阶梯（steps）缓动承担区块揭示（`chunk-load`）、指令输入（`command-type`）与 XP 充能（`bar-charge`）；弹性只用于方块与物品落点（`block-drop` / `item-pop` / `slot-cascade`）；界面沿轴展开（`pane-unfold`）；状态由红石脉冲回到稳定（`status-flash`）；数值步进滚动（`xp-count`）。快速果断，然后完全静止。逐动效表格见 `../motions/voxel-harness.md`。

组合动效协同整个组件：`hud-unveil`（gameplay-dossier 的分层揭幕：头部、边框、裁切标记、页脚、书脊依次落位，进度轨持续线性推进）、`chunk-mark`（chunk-divider：序号定版、标题步进拭入、草绿规线充能）、`lockup-boot`（release-lockup：结语句升起、光标句读落印、落款淡入）。

## 转场

16 个基础转场（parts 契约见 `../transitions/voxel-harness.md`）：

- Primary：`chunk-push`、`block-rise`、`portal-cross`、`camera-step`
- Section：`craft-grid`、`inventory-swap`、`terrain-wipe`、`command-cut`
- Accent：`ender-iris`、`block-shatter`、`redstone-pulse`、`voxel-fold`、`pixel-rain`、`craft-flip`、`torch-flicker-cut`、`xp-drain`

5 个 GPU 旗舰转场（见 `../transitions/advanced-voxel-harness.md`）：`block-dissolve-chunks`、`portal-warp-swirl`、`pixel-sort-cascade`、`terrain-column-rise`、`redstone-surge-pulse`。

插件发布视频建议以 `chunk-push` 作为主转场，功能章节使用 `craft-grid`，核心 UI 首次亮相使用一次 `portal-cross` 或 `block-shatter`；英雄时刻从 GPU 旗舰里选一个签名动作。

## 文件

- Tokens：`themes/voxel-harness/tokens.css`
- Components：`themes/voxel-harness/components.css`
- Motions：`themes/voxel-harness/motions.js`
- Transitions：`themes/voxel-harness/transitions.js`
- Advanced transitions（GPU）：`themes/voxel-harness/advanced-transitions.js`
- Font：`themes/voxel-harness/fonts/PixelifySans-VariableFont_wght.ttf`
- Manifest：`themes/voxel-harness/theme.json`
- Showroom：`showrooms/voxel-harness.html`
- 组件 / 动效 / 转场 / GPU 转场文档：`references/{components,motions,transitions}/voxel-harness.md`、`references/transitions/advanced-voxel-harness.md`
