# `modern-minimal` — 现代秩序

现代秩序是一套以瑞士网格、比例和留白为核心的现代简约主题。它适合产品发布、科技解释、品牌片、企业内容、界面展示、数据概览和作品集。

## 视觉语言

- 背景：暖灰白 `#F4F5F2`
- 前景：炭黑 `#111317`
- 强调：钴蓝 `#2455FF`
- 表面：纯白 `#FFFFFF`
- 辅助文字：冷灰 `#666C75`
- 结构线：`#D8DBE0`
- 标题：Montserrat 900；中文使用同一无衬线字形回退
- 正文：Helvetica Neue 400
- 数据与标签：IBM Plex Mono 700

蓝色只用于主焦点、状态和进度。不要使用蓝紫渐变、发光描边或大面积蓝色背景。

## 布局规则

- 默认使用 12 列隐形网格；展厅以可见网格展示其对齐逻辑。
- 1920×1080 画布保留 96px 水平安全区、72px 垂直安全区。
- 每页设置一个主焦点和一个辅助焦点。主标题通常占画面宽度的 55–78%。
- 用结构线、对齐和比例分区，不用同尺寸圆角卡片铺满画面。
- 圆角仅用于状态标签和少量面板锁合，常规容器使用 0–4px。
- 阴影只表达真实层级；普通信息块依靠边界线和留白区分。

## 组件

`modern-title`、`grid-header`、`surface-panel`、`number-focus`、`metric-row`、`split-compare`、`ranked-table`、`process-line`、`quote-block`、`media-window`、`status-pill`、`section-index`、`footnote`、`progress-line`、`closing-lockup`。

组件语义保持中立，可以承载产品、技术、历史、价格、作品、流程或比较内容。

## 动效

`grid-reveal`、`precision-rise`、`number-roll`、`rule-expand`、`list-stagger`、`mask-slide`、`focus-snap`、`soft-emphasis`、`index-shift`、`closing-compress`。

一个场景选择 2–4 个动效家族。元素进入后快速稳定，不添加持续漂浮、循环呼吸或无目的扫描。

## 转场

- Primary：`split-slide`、`axis-rise`、`clean-cross`、`frame-pull`
- Section：`blue-line-cut`、`grid-shift`、`panel-lock`、`section-index-swap`
- Accent：`aperture-box`、`precision-zoom`、`axis-fold`、`dot-expand`

常规切换使用一个 Primary；章节变化选一个 Section；Accent 每支视频保留一到两种。

## 文件

- Tokens：`themes/modern-minimal/tokens.css`
- Components：`themes/modern-minimal/components.css`
- Motions：`themes/modern-minimal/motions.js`
- Transitions：`themes/modern-minimal/transitions.js`
- Showroom：`showrooms/modern-minimal.html`
