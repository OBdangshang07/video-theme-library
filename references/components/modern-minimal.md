# modern-minimal 组件参考

所有类名使用 `mm-` 前缀。主题展厅 `../../../showrooms/modern-minimal.html` 是视觉参考，每个组件都以 1920×1080 真实场景等比呈现。

## canonical 映射（16/16）

| 组件 ID | 类名 | 说明 |
|---|---|---|
| `editorial-title` | `.mm-kicker` + `.mm-title` + `.mm-subtitle` | 开场或主论点的三级标题组 |
| `folio-header` | `.mm-frame-header` | 顶部炭线 + 左右元数据，贯穿全片 |
| `paper-panel` | `.mm-panel`（`.accent` 变体） | 通用信息容器，钴蓝顶边只给一个重点 |
| `stat-block` | `.mm-stat`（`.mm-number`） | 一个大数字，配 `number-roll` |
| `metric-triptych` | `.mm-metric-row` + `.mm-metric` | 三个并列指标，配 `metric-sweep` |
| `comparison-split` | `.mm-split` | 双栏对比，一侧反白为炭黑底 |
| `ranked-list` | `.mm-table`（`.mm-table-row`） | 排行、优先级、目录，配 `list-stagger` |
| `timeline-steps` | `.mm-process` + `.mm-step` | 四步流程、编年、方法 |
| `quote-pullout` | `.mm-quote`（含 `cite`） | 论点、引用、关键结论，钴蓝侧条 |
| `artifact-frame` | `.mm-media` + `.mm-media-window` | 16:9 作品/截图/视频 + 侧栏信息 |
| `verdict-stamp` | `.mm-verdict` | 判定色板（炭黑板面 + 钴蓝锚边），配 `focus-snap` |
| `chapter-divider` | `.mm-chapter`（`.mm-chapter-index/.mm-chapter-kicker/.mm-chapter-title/.mm-chapter-rule`） | 章节隔断，配 `section-mark` |
| `source-note` | `.mm-note` | 来源、方法、限制条件 |
| `progress-rail` | `.mm-progress` | 全宽进度轨，贯穿整个合成而非某个内框 |
| `end-card` | `.mm-lockup` | 收尾锁定，配 `closing-compress` |
| `screening-dossier` | `.mm-dossier-media` + `.mm-dossier` 全家桶 | 高密度全屏媒体档案，配 `showcase-unveil` |

## 主题特色组件

| 组件 ID | 类名 | 说明 |
|---|---|---|
| `status-pill` | `.mm-status` | 状态与短标签（圆角只给状态丸），蓝点即状态点 |

只复制生产合成实际需要的组件标记。

## showcase-dossier（screening-dossier）说明

`showcase-dossier` 是最高密度的全屏媒体布局：素材保持大而清晰（`.mm-dossier-media`，1612×907 级炭黑窗口），同时提供常驻条目编号、主体名（独立大标题字级）、可选钴蓝强调元数据、来源状态、时长、条目编号、左侧竖排书脊、卷次与全宽钴蓝进度轨。结构：

- `.mm-dossier-head`：`b.mm-dossier-index` + `.mm-dossier-title>strong+small` + `.mm-dossier-meta`（可含 `.mm-dossier-emphasis`）
- `.mm-dossier-frame[data-frame-label]`：素材边框 + 左上角钴蓝刻度 + 右上框签
- `.mm-dossier-crop.tl/.tr/.bl/.br`：四角裁切标记
- `.mm-dossier-spine` / `.mm-dossier-edition`：书脊与卷次
- `.mm-dossier-footer` + `.mm-dossier-progress>span`

强调节点可选，无排名/状态场景直接删除；主体名与条目标题保持独立字级，不要为了塞元数据压缩条目标题。`showcase-unveil` 负责协同揭幕：`progressDuration` 传素材时长时进度轨线性走满。
