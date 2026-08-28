# `signal-desk` — 信号台

信号台是一套面向科技快讯、模型发布、产品更新、政策变化、融资消息与行业事件的新闻编辑台系统。名称不绑定更新频率，可用于单条快讯、专题、周报和事件追踪。

## 视觉语言

- 深海军蓝 `#0B1320`：稳定背景。
- 骨白 `#F3EFE4`：标题与正文。
- 琥珀色 `#FFB000`：时间、状态、重点数据与来源锚点。
- 红色 `#EF4B3F`：仅用于突发、风险与修正。
- 标题与正文使用 Inter / Noto Sans SC / 系统无衬线回退；时间、来源和数据使用 JetBrains Mono / 系统等宽回退。
- 时间码、来源卡、快讯带和数据栅格属于内容结构，不是无意义 HUD 装饰。

## 设计边界

- 不使用蓝紫渐变、霓虹描边、扫描线、玻璃拟态或无意义角标。
- 不把每条消息都标成 Breaking；红色需有明确语义。
- 信息必须标明来源或来源占位，演示文案不能直接复制到成片。
- 主画面与证据素材使用至少 16:9 的 `evidence-window`。
- 文案专业直接，少用反问、口号堆叠和“不是……而是……”结构。

## 组件

`signal-title`、`broadcast-header`、`headline-stack`、`breaking-banner`、`story-card`、`source-card`、`timeline-feed`、`market-strip`、`model-release-card`、`quote-clip`、`evidence-window`、`comparison-board`、`data-pulse`、`timestamp-marker`、`news-ticker`、`signal-lockup`。

## 动效

`headline-split`、`ticker-roll`、`timecode-roll`、`source-pin`、`signal-pulse`、`story-stack`、`bar-surge`、`quote-cut`、`alert-hit`、`desk-lock`。

每个场景使用 2–4 个动效家族。信号脉冲只运行有限次数；生产实现使用主题文件中的 paused GSAP timeline 函数。

## 转场

- Primary：`ribbon-handoff`、`headline-push`、`desk-cross`、`feed-rise`
- Section：`timecode-jump`、`bulletin-shutter`、`source-stack`、`signal-cut`
- Accent：`breaking-flash`、`headline-crush`、`map-aperture`、`data-collapse`

常规快讯建议以 `ribbon-handoff` 或 `headline-push` 为主转场；进入专题时使用 `timecode-jump` 或 `source-stack`；只有突发消息与关键数据揭晓才使用强调转场。

## 文件

- Tokens：`themes/signal-desk/tokens.css`
- Components：`themes/signal-desk/components.css`
- Motions：`themes/signal-desk/motions.js`
- Transitions：`themes/signal-desk/transitions.js`
- Showroom：`showrooms/signal-desk.html`
