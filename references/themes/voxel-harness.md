# `voxel-harness` — 方块终端

方块终端是一套面向游戏插件、模组、开发工具和交互项目发布的深色像素工具界面。它为 Deepseek Harness Minecraft UI 插件首发设计，但组件与动效不绑定单一产品。

## 视觉语言

- 背景：黑曜石深绿 `#0E1410`
- 面板：`#172019` / `#202B22`
- 文字：沙色 `#ECE8D6`
- 主状态：草绿 `#7BD14B`
- 警告与构建变化：红石橙 `#E46F3A`
- 结构线：`#3B493D`
- 标题与短标签：仓库内置的开放字体 `Pixelify Sans`
- 正文：Inter / Noto Sans SC / 系统无衬线回退

Pixelify Sans 字体及其 OFL 1.1 许可证已冻结到 `themes/voxel-harness/fonts/`。标题、数字、状态和短标签使用像素字体；两行以上的解释正文使用高可读性无衬线字体。

## 设计边界

- 像素感来自 8px 栅格、4px 边框、阶梯阴影、槽位和块状遮罩。
- 不叠加全屏低分辨率滤镜，不把真实 UI 录屏主动模糊或马赛克化。
- 草绿代表可用、已连接和完成；红石橙只代表警告、变化或构建脉冲。
- 不复制 Minecraft 原版菜单、贴图和商标构图。方块几何与工具界面保持原创。
- 16:9 实机画面保持清晰，并通过 `gameplay-window` 与元信息区进入主题结构。

## 组件

`voxel-title`、`hud-header`、`voxel-panel`、`command-block`、`feature-slots`、`comparison-pane`、`patch-list`、`build-path`、`keybind-chip`、`gameplay-window`、`inventory-strip`、`plugin-status`、`chunk-divider`、`terminal-note`、`xp-progress`、`release-lockup`。

## 动效

`chunk-load`、`block-drop`、`slot-cascade`、`command-type`、`cursor-snap`、`bar-charge`、`item-pop`、`pane-unfold`、`status-flash`、`logo-craft`。

阶梯运动用于栅格揭示、指令输入和进度；弹性运动只用于物品或方块落点。每个场景使用 2–4 个动效家族。

## 转场

- Primary：`chunk-push`、`block-rise`、`portal-cross`、`camera-step`
- Section：`craft-grid`、`inventory-swap`、`terrain-wipe`、`command-cut`
- Accent：`ender-iris`、`block-shatter`、`redstone-pulse`、`voxel-fold`

插件发布视频建议以 `chunk-push` 作为主转场，功能章节使用 `craft-grid`，核心 UI 首次亮相使用一次 `portal-cross` 或 `block-shatter`。

## 文件

- Tokens：`themes/voxel-harness/tokens.css`
- Components：`themes/voxel-harness/components.css`
- Motions：`themes/voxel-harness/motions.js`
- Transitions：`themes/voxel-harness/transitions.js`
- Font：`themes/voxel-harness/fonts/PixelifySans-VariableFont_wght.ttf`
- Font license：`themes/voxel-harness/fonts/OFL-PixelifySans.txt`
- Showroom：`showrooms/voxel-harness.html`
