# signal-desk 组件参考

所有类名使用 `sd-` 前缀。主题展厅 `../../../showrooms/signal-desk.html` 是视觉参考，每个组件都以 1920×1080 真实场景等比呈现。

## canonical 映射（16/16）

| 组件 ID | 类名 | 说明 |
|---|---|---|
| `editorial-title` | `.sd-signal-title` | 开场或主判断的双栏标题组（大标题 + 琥珀顶边侧栏） |
| `folio-header` | `.sd-broadcast-header`（`.sd-live-dot`） | 栏目、时间与页码页眉，贯穿全片 |
| `paper-panel` | `.sd-story-card` | 单条新闻或一个观点的通用容器 |
| `stat-block` | `.sd-data-pulse`（`.sd-bars`） | 一个关键数据 + 趋势形状，配 `signal-count` / `bar-surge` |
| `metric-triptych` | `.sd-metric-deck` + `.sd-metric-cell` + `.sd-cell-bar` | 三个并列指标，琥珀顶边 + 底部证据条，重点格用 `.hot` |
| `comparison-split` | `.sd-comparison-board` | 双对象指标比较 |
| `ranked-list` | `.sd-headline-stack`（`.sd-headline-row`） | 多条消息按重要性排列 |
| `timeline-steps` | `.sd-timeline-feed` + `.sd-feed-item` | 按时间梳理连续事件 |
| `quote-pullout` | `.sd-quote-clip` | 引用、结论或关键表态，配 `quote-cut` |
| `artifact-frame` | `.sd-evidence-window` + `.sd-evidence-frame` | 16:9 证据画面 + 来源元信息侧栏，配 `evidence-reveal` |
| `verdict-stamp` | `.sd-verdict`（`.alert` 变体） | 判定印章（不是横幅）；风险判定用红色 `.alert`，配 `alert-hit` 落印 |
| `chapter-divider` | `.sd-segment`（`.sd-segment-index/.sd-segment-kicker/.sd-segment-title/.sd-segment-rule`） | 章节隔断，配 `chapter-signal` |
| `source-note` | `.sd-source-card` | 来源、引文与发布时间；锚边是 inset 阴影，配 `source-pin` |
| `progress-rail` | `.sd-progress` | 全宽进度轨，贯穿整个合成而非某个内框 |
| `end-card` | `.sd-signal-lockup` | 结尾观点与栏目署名，配 `desk-lock` |
| `screening-dossier` | `.sd-bulletin-media` + `.sd-bulletin` 全家桶 | 高密度全屏媒体档案，配 `bulletin-unveil` |

## 主题特色组件

| 组件 ID | 类名 | 说明 |
|---|---|---|
| `breaking-banner` | `.sd-breaking-banner` | 突发横幅，红色只用于突发、风险与修正，配 `alert-hit` |
| `market-strip` | `.sd-market-strip` | 价格、指标或版本状态横条（骨白底反色），配 `ticker-roll` |
| `model-release-card` | `.sd-release-card` | 模型或产品更新详情（主信息 + 关键参数侧栏） |
| `timestamp-marker` | `.sd-timestamp` | 画面内时间点或更新确认标记，配 `timecode-roll` |
| `news-ticker` | `.sd-news-ticker` | 短讯与持续信息轨（琥珀底），配 `ticker-roll` |

只复制生产合成实际需要的组件标记。

## bulletin-dossier（screening-dossier）说明

`bulletin-dossier` 是最高密度的全屏媒体布局：素材保持大而清晰（`.sd-bulletin-media`，1612×907 级窗口），同时提供常驻条目编号、主体名（独立大标题字级）、可选琥珀强调元数据、来源状态、时长、条目编号、左侧竖排书脊、卷次与全宽琥珀进度轨。结构：

- `.sd-bulletin-head`：`b.sd-bulletin-index` + `.sd-bulletin-title>strong+small` + `.sd-bulletin-meta`（可含 `.sd-bulletin-emphasis`）
- `.sd-bulletin-frame[data-frame-label]`：素材边框 + 左上角琥珀刻度 + 右上框签
- `.sd-bulletin-crop.tl/.tr/.bl/.br`：四角裁切标记
- `.sd-bulletin-spine` / `.sd-bulletin-edition`：书脊与卷次
- `.sd-bulletin-footer` + `.sd-bulletin-progress>span`

强调节点可选，无排名/状态场景直接删除；主体名与条目标题保持独立字级，不要为了塞元数据压缩主体名。`bulletin-unveil` 负责协同揭幕：`progressDuration` 传素材时长时进度轨线性走满。
