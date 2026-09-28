# voxel-harness 组件参考

所有类名使用 `vh-` 前缀。主题展厅 `../../../showrooms/voxel-harness.html` 是视觉参考，每个组件都以 1920×1080 真实场景等比呈现。

## canonical 映射（16/16）

| 组件 ID | 类名 | 说明 |
|---|---|---|
| `editorial-title` | `.vh-label` + `.vh-title` + `.vh-body` | 开场或发布主张的三级标题组 |
| `folio-header` | `.vh-hud-header` | 顶部 HUD 条：构建版本与运行状态，贯穿全片 |
| `paper-panel` | `.vh-panel`（`.vh-corner` / 草绿描边变体） | 通用信息容器，4px 硬边 + 阶梯投影 |
| `stat-block` | `.vh-xp-stat` + `.vh-xp-stat-value` | 一个大数字占据一页，配 `xp-count` |
| `metric-triptych` | `.vh-stat-bench` + `.vh-bench-cell` + `.vh-bench-bar` | 三个并列指标，底部 XP 证据条，重点格用 `.hot` |
| `comparison-split` | `.vh-panes` + `.vh-pane` | 双栏对比，后栏反白为沙底 |
| `ranked-list` | `.vh-list` + `.vh-list-row` | 补丁记录、优先级与文件清单 |
| `timeline-steps` | `.vh-path` + `.vh-path-step` | 安装、构建与启动流程 |
| `quote-pullout` | `.vh-lore-quote`（`blockquote` + `cite`） | 设定引文与设计注解，草绿左锚条 |
| `artifact-frame` | `.vh-gameplay` + `.vh-game-window` | 16:9 实机画面或录屏 + 元信息侧栏 |
| `verdict-stamp` | `.vh-status` | 状态印：兼容 / 构建 / 发布判定，配 `status-flash`（见下注） |
| `chapter-divider` | `.vh-chunk`（`.vh-chunk-index/.vh-chunk-kicker/.vh-chunk-title/.vh-chunk-rule`） | 区块章节隔断，配 `chunk-mark` |
| `source-note` | `.vh-note` | 依赖、限制与技术说明（红石橙左边条） |
| `progress-rail` | `.vh-xp` | 全宽 XP 进度轨，贯穿整个合成而非某个内框 |
| `end-card` | `.vh-lockup`（`.vh-lockup-line/.vh-lockup-mark/.vh-lockup-note`） | 发布署名收尾，配 `lockup-boot` |
| `screening-dossier` | `.vh-dossier-media` + `.vh-dossier` 全家桶 | 高密度全屏实机档案，配 `hud-unveil` |

`verdict-stamp` 继续映射到既有的 `plugin-status`（`.vh-status`）：状态点 + 边框章在视觉上是"判定章"，配 `status-flash` 完成红石脉冲到稳定态的确认，与 verdict 语义一致，无需另起组件。

## 主题特色组件

| 组件 ID | 类名 | 说明 |
|---|---|---|
| `command-block` | `.vh-command` | 命令、安装步骤与路径，配 `command-type` |
| `feature-slots` | `.vh-slots` + `.vh-slot` | 并列功能槽位，配 `slot-cascade` |
| `keybind-chip` | `.vh-key` | 快捷键与交互提示，配 `item-pop` |
| `inventory-strip` | `.vh-inventory` | 9 格热键栏导航与页面进度 |

只复制生产合成实际需要的组件标记。

## gameplay-dossier（screening-dossier）说明

`gameplay-dossier` 是最高密度的全屏媒体布局：实机素材保持大而清晰（`.vh-dossier-media`，1612×907 级窗口），同时提供常驻条目编号、主体名（独立像素字级）、可选草绿强调元数据、来源状态、时长、条目编号、左侧竖排书脊、卷次与全宽 XP 进度轨。结构：

- `.vh-dossier-head`：`b.vh-dossier-index` + `.vh-dossier-title>strong+small` + `.vh-dossier-meta`（可含 `.vh-dossier-emphasis`）
- `.vh-dossier-frame[data-frame-label]`：素材边框 + 左上草绿刻度 + 右上框签
- `.vh-dossier-crop.tl/.tr/.bl/.br`：四角裁切标记
- `.vh-dossier-spine` / `.vh-dossier-edition`：书脊与卷次
- `.vh-dossier-footer` + `.vh-dossier-progress>span`

强调节点可选，无排名/状态场景直接删除；主体名与条目标题保持独立字级，不要为了塞元数据压缩主体名。`hud-unveil` 负责协同揭幕：`progressDuration` 传素材时长时进度轨线性走满。
