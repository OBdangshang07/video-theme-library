# `signal-desk` — 信号台

信号台是一套面向科技快讯、模型发布、产品更新、政策变化、融资消息与行业事件的新闻编辑台系统。名称不绑定更新频率，可用于单条快讯、专题、周报和事件追踪。

## 视觉语言

- 深海军蓝 `#0B1320`：稳定背景。
- 骨白 `#F3EFE4`：标题与正文。
- 琥珀色 `#FFB000`：时间、状态、重点数据与来源锚点。
- 红色 `#EF4B3F`：仅用于突发、风险与修正。
- 标题使用 Oswald；正文使用 Noto Sans JP 与中文无衬线回退；时间、来源和数据使用 IBM Plex Mono。
- 时间码、来源卡、快讯带和数据栅格属于内容结构，不是无意义 HUD 装饰。

## 设计边界

- 不使用蓝紫渐变、霓虹描边、扫描线、玻璃拟态或无意义角标。
- 不把每条消息都标成 Breaking；红色需有明确语义。
- 信息必须标明来源或来源占位，演示文案不能直接复制到成片。
- 主画面与证据素材使用至少 16:9 的 `evidence-window`。
- 文案专业直接，少用反问、口号堆叠和“不是……而是……”结构。

## 组件

21 个主题组件覆盖全部 16 个 canonical ID（映射见 `themes/signal-desk/components.css` 顶部 catalog 头与 `../components/signal-desk.md`）：

`signal-title`、`broadcast-header`、`headline-stack`、`breaking-banner`、`story-card`、`source-card`、`timeline-feed`、`market-strip`、`model-release-card`、`quote-clip`、`evidence-window`、`comparison-board`、`data-pulse`、`timestamp-marker`、`news-ticker`、`signal-lockup`、`metric-deck`、`desk-verdict`、`segment-divider`、`signal-rail`、`bulletin-dossier`。

## 动效

14 个动效：标题以编辑切入定版（`headline-split`）；来源卡钉上琥珀锚边（`source-pin`，inset 阴影生长，不碰布局）；时间码、快讯轨、数据条各司其职（`timecode-roll` / `ticker-roll` / `bar-surge`）；消息卡按编辑顺序叠入（`story-stack`）；状态点只做一次有限脉冲（`signal-pulse`）；红色突发短促落位（`alert-hit`）；数值参数化滚动（`signal-count`）。缓动快速果断，然后完全静止。

组合动效协同整个组件：`bulletin-unveil`（bulletin-dossier 的分层揭幕：头部、边框、裁切标记、页脚、书脊依次落位，进度轨持续线性推进）、`chapter-signal`（segment-divider：序号定版、标题拭入、琥珀规线绘出）、`evidence-reveal`（evidence-window：画面拭入、元信息升起、标题落位）。

`signal-pulse` 只运行有限次数；生产实现使用主题文件中的 paused GSAP timeline 函数。逐动效表格见 `../motions/signal-desk.md`。

## 转场

16 个基础转场（parts 契约见 `../transitions/signal-desk.md`）：

- Primary：`ribbon-handoff`、`headline-push`、`desk-cross`、`feed-rise`
- Section：`timecode-jump`、`bulletin-shutter`、`source-stack`、`signal-cut`
- Accent：`breaking-flash`、`headline-crush`、`map-aperture`、`data-collapse`、`static-wipe`、`amber-rule-cut`、`teletype-roll`、`channel-zap`

5 个 GPU 旗舰转场（见 `../transitions/advanced-signal-desk.md`）：`signal-static-interference`、`broadcast-roll-band`、`radar-sweep-reveal`、`data-stream-collapse`、`spectrum-dispersion-split`。

常规快讯建议以 `ribbon-handoff` 或 `headline-push` 为主转场；进入专题时使用 `timecode-jump` 或 `source-stack`；`breaking-flash` 严格留给突发消息；英雄时刻从 GPU 旗舰里选一个签名动作。

## 文件

- Tokens：`themes/signal-desk/tokens.css`
- Components：`themes/signal-desk/components.css`
- Motions：`themes/signal-desk/motions.js`
- Transitions：`themes/signal-desk/transitions.js`
- Advanced transitions（GPU）：`themes/signal-desk/advanced-transitions.js`
- Manifest：`themes/signal-desk/theme.json`
- Showroom：`showrooms/signal-desk.html`
- 组件 / 动效 / 转场 / GPU 转场文档：`references/{components,motions,transitions}/signal-desk.md`、`references/transitions/advanced-signal-desk.md`
