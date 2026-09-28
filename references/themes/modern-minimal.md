# `modern-minimal` — 现代秩序

现代秩序是一套以瑞士网格、比例和留白为核心的现代简约主题。它适合产品发布、科技解释、品牌片、企业内容、界面展示、数据概览和作品集。

## 视觉语言

- 背景：暖灰白 `#F4F5F2`；表面：纯白 `#FFFFFF`
- 前景：炭黑 `#111317`；辅助文字：冷灰 `#666C75`；结构线：`#D8DBE0`
- 强调：钴蓝 `#2455FF`，只用于主焦点、状态和进度
- 标题：Montserrat 900；中文使用同一无衬线字形回退
- 正文：Helvetica Neue 400；数据与标签：IBM Plex Mono 700

不要使用蓝紫渐变、发光描边或大面积蓝色背景。

## 布局规则

- 默认使用 12 列隐形网格；展厅以 120px 可见网格展示其对齐逻辑。
- 1920×1080 画布保留 96px 水平安全区、72px 垂直安全区。
- 每页设置一个主焦点和一个辅助焦点。主标题通常占画面宽度的 55–78%。
- 用结构线、对齐和比例分区，不用同尺寸圆角卡片铺满画面。
- 圆角仅用于状态标签（`mm-status`）和面板锁合转场，常规容器使用 0–4px。
- 阴影只表达真实层级；普通信息块依靠边界线和留白区分。

## 组件

17 个主题组件覆盖全部 16 个 canonical ID（映射见 `themes/modern-minimal/components.css` 顶部 catalog 头与 `../components/modern-minimal.md`）：

`modern-title`、`grid-header`、`surface-panel`、`number-focus`、`metric-row`、`split-compare`、`ranked-table`、`process-line`、`quote-block`、`media-window`、`status-pill`、`verdict-slab`、`section-index`、`footnote`、`progress-line`、`closing-lockup`、`showcase-dossier`。

组件语义保持中立，可以承载产品、技术、历史、价格、作品、流程或比较内容。`verdict-slab` 是判定色板（炭黑板面 + 钴蓝锚边），不是装饰印章；`status-pill` 是唯一的圆角组件。

## 动效

14 个动效：标题沿网格揭示（`grid-reveal`）；面板短距升起（`precision-rise`）；数字参数化递读（`number-roll`）；结构线展开（`rule-expand`）；列表级联（`list-stagger`）；方向遮罩（`mask-slide`）；虚焦锁定（`focus-snap`）；钴蓝点题（`soft-emphasis`）；索引贴合（`index-shift`）；背景网格落定（`grid-settle`）；结尾压合（`closing-compress`）。缓动快速果断，然后完全静止。

组合动效协同整个组件：`metric-sweep`（metric-row：单元格级联升起、数值逐行落位）、`section-mark`（section-index：kicker、序号定版、标题拭入、钴蓝规线绘出）、`showcase-unveil`（showcase-dossier 分层揭幕：头部、边框、裁切标记、页脚、书脊依次落位，进度轨持续线性推进）。

生产实现使用主题文件中的 paused GSAP timeline 函数。逐动效表格见 `../motions/modern-minimal.md`。

## 转场

16 个基础转场（parts 契约见 `../transitions/modern-minimal.md`）：

- Primary：`split-slide`、`axis-rise`、`clean-cross`、`frame-pull`
- Section：`blue-line-cut`、`grid-shift`、`panel-lock`、`section-index-swap`
- Accent：`aperture-box`、`precision-zoom`、`axis-fold`、`dot-expand`、`swiss-cross-cut`、`grid-dissolve`、`measure-cut`、`panel-slide-over`

5 个 GPU 旗舰转场（见 `../transitions/advanced-modern-minimal.md`）：`grid-warp-field`、`cobalt-scan-sweep`、`axis-mirror-split`、`focus-rack-depth`、`threshold-resolve`。

常规切换使用一个 Primary；章节变化选一个 Section；Accent 每支视频保留一到两种；英雄时刻从 GPU 旗舰里选一个签名动作。

## 文件

- Tokens：`themes/modern-minimal/tokens.css`
- Components：`themes/modern-minimal/components.css`
- Motions：`themes/modern-minimal/motions.js`
- Transitions：`themes/modern-minimal/transitions.js`
- Advanced transitions（GPU）：`themes/modern-minimal/advanced-transitions.js`
- Manifest：`themes/modern-minimal/theme.json`
- Showroom：`showrooms/modern-minimal.html`
- 组件 / 动效 / 转场 / GPU 转场文档：`references/{components,motions,transitions}/modern-minimal.md`、`references/transitions/advanced-modern-minimal.md`
