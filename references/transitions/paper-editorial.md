# paper-editorial 转场参考（3.0）

16 个基础转场按叙事角色分组，5 个 GPU 旗舰转场见 [advanced-paper-editorial.md](advanced-paper-editorial.md)。基础转场全部接收 `(tl, parts, at, duration)`：项目的单一 paused GSAP timeline、所需元素、绝对时间位置、可选时长（省略时取下表 3.0 默认值）。

```js
import { paperEditorialTransitions, paperEditorialTransitionMeta } from "./themes/paper-editorial/transitions.js";

paperEditorialTransitions.paperPush(tl, {
  outgoing: "#scene-a .scene-inner",
  incoming: "#scene-b .scene-inner"
}, 5.4); // 时长省略 → paperEditorialTransitionMeta.presets["paper-push"].duration（.8s）
```

HyperFrames 接入：让前后两个 clip 在转场时长内于不同轨道上重叠，动画作用于 `.scene-inner` 包装层，clip 可见性仍由框架托管。多数转场在中点用 `set` 交换前后场景的不透明度。

## 3.0 与 classic 的契约

- **没有平涂色块，没有直线几何边。** 每个覆盖层都是生成的材料（湿墨版、朱砂印面、带纸纹的纸条），每条揭示边都带纤维。材料在**建轴时**按种子生成一次并缓存，之后只补间 transform / CSS 变量。
- **签名与 parts 不变。** 函数名、`parts` 键名与 v2.3 完全一致；v2.3 实现冻结在 `classic/transitions.js`，通过 `paperEditorialTransitionsClassic` / `paperEditorialTransitionMetaClassic` 导出。旧片需逐帧复现时改用 classic。
- **自动回退。** 所需 part 解析不到 DOM 元素（无 DOM 环境、选择器为空）时，预设自动调用同名 classic 实现。
- **时长全部上调。** 材料需要行程：例如 `margin-pull` .7s → 1.0s，`chapter-bridge` .82s → 1.05s。转场段的 clip 重叠长度要跟着加长；想保留旧节奏就显式传 `duration`。
- **百分比定位。** 材料层用 `xPercent` / `yPercent` 定位，展厅缩略图与 1920×1080 成片共享同一组数字；材料画布分辨率取宿主的屏幕像素宽度，夹在 960–1920。

### 预设会往 DOM 里挂的东西

| 预设 | 建轴时挂载 | 位置 | 备注 |
|---|---|---|---|
| `margin-pull` / `chapter-bridge` / `ink-dip` | `canvas.pe-tx-sheet`（湿墨版） | `overlay` 内 | `overlay.dataset.seed` 可换墨版种子（默认 23 / 31 / 47） |
| `ink-sweep` / `tear-wipe` | 笔带 / 撕口纸浆条 canvas | `incoming` 的父节点末尾，`z-index:20` | 父节点应是与画面等大的舞台容器 |
| `paper-fold` | 折面暗部 / 移动折影 div | `outgoing` / `incoming` 的父节点 | 同上 |
| `focus-press` / `ink-iris` / `ink-sweep` / `tear-wipe` | `--pe-tx-mask` 遮罩变量 | `incoming` 自身 | 结束时变量设为 `linear-gradient(#000,#000)`（不透明，勿改成 `none`） |

挂载按宿主缓存：同一宿主重复调用不会重复插入。同一对场景在一条时间线上多次使用同一预设时，材料画布共享。

## Primary 主转场（约 60–70% 的切换）

| ID | 3.0 材料行为 | parts | 3.0 / v2.3 |
|---|---|---|---|
| `paper-push` | 新页如纸自右滑入放平（−9° 透视展平），前缘投影压住旧页；旧页视差后退 28% 并压暗 | outgoing, incoming | .8s / .62s |
| `folio-rise` | 新页自下翻起放平（下缘先到），旧页推上、缩远 .965、压暗 | outgoing, incoming | .82s / .66s |
| `focus-press` | 旧页放大失焦推远，新页如墨滴自纸心沿纤维洇开并收焦 | outgoing, incoming | .86s / .72s |
| `margin-pull` | 一整张湿墨版纵向扯过：积墨前缘垂坠墨滴，尾部散成干笔飞白，新页先从飞白丝缝里透出 | outgoing, incoming, overlay | 1.0s / .7s |

## Section 章节转场

| ID | 3.0 材料行为 | parts | 3.0 / v2.3 |
|---|---|---|---|
| `red-rule-cut` | 朱砂一笔划过中线（笔形遮罩 + 纤维前缘），湿朱砂以毛边沿线上下涨满，换页后退回线里，横线收笔离场 | outgoing, incoming, overlay, rule | .8s / .66s |
| `column-cascade` | 带纸纹与投影的纸条上下交错落下、编成纸墙，换页后继续穿出 | outgoing, incoming, columns | .9s+ / .76s |
| `archive-shutter` | 墨纹百叶片从侧立 88° 翻平合拢，受光由暗到亮，换页后反向翻开 | outgoing, incoming, slats | .86s+ / .72s |
| `chapter-bridge` | 湿墨版自左横扫，前缘积墨、尾部飞白；旧页缩远 .972，新页由 1.03 落定 | outgoing, incoming, overlay | 1.05s / .82s |

## Accent 点缀转场

| ID | 3.0 材料行为 | parts | 3.0 / v2.3 |
|---|---|---|---|
| `ink-sweep` | 饱蘸的笔带自左扫过，新页从笔带身后以纤维边显出（边界与笔带同步），旧页被推开 | outgoing, incoming | .92s / .78s |
| `tear-wipe` | 旧页被撕开：撕口露出白色纸浆与翘起的纤维，身后新页带撕口投影 | outgoing, incoming | .84s / .7s |
| `diagonal-slice` | 裁纸刀斜切（刀口干净），一线湿朱砂沿刀口拉过，旧页顺刀口滑落 | outgoing, incoming, slash（可选） | .72s / .62s |
| `ink-iris` | 一滴墨落在主体上，沿纤维不规则洇开成新页；旧页压暗推远 | outgoing, incoming | .9s / .76s |
| `paper-fold` | 旧页沿左缘 3D 折起，折面随角度变暗；新页早已在下，被折起的纸投下一道移动折影 | outgoing, incoming | .84s / .72s |
| `stamp-cover` | 巨印悬空压下（先是虚化朱影），接触瞬间印泥不均转印、迅速压实，换页后带纸纤维揭起离场 | outgoing, incoming, overlay | .92s / .66s |
| `paper-stack` | 带纸纹与投影的档案纸自右斜飞入层层压上，换页后向左掀走 | outgoing, incoming, sheets | .95s / .78s |
| `ink-dip` | 墨沿纸纤维自下而上吸满，谷底一线朱砂划过，换页后墨继续上行、从飞白里放出新页 | outgoing, incoming, overlay, flash（可选） | 1.0s / .74s |

`column-cascade` / `archive-shutter` 的总长在默认值上另加各片的级联偏移（8 片约 +.3s）。

## parts 契约

- `outgoing` / `incoming`：前后场景的 `.scene-inner` 包装元素，必填。**不要**直接传 `<video>`：`diagonal-slice` 用 `clip-path`，`focus-press` 等用 `mask`，都会让 Chrome 停止合成视频画面。
- `overlay`：全帧覆盖层 div，初始 `opacity:0`。3.0 会把它设为 `overflow:hidden` 并在其中挂载材料画布。
- `rule` / `flash`：全宽水平细条（rule 4px、flash 3px，垂直居中），初始 `opacity:0`。
- `slash`：约 2600px 长、5px 高的细条，旋转约 −29° 置于舞台中心，初始 `opacity:0`。
- `slats`：8 条全宽水平叶片（各 12.5% 高）；`columns`：8 条全高竖栏（各 12.5% 宽）；`sheets`：3 张全帧纸页。3.0 会给它们写入纸纹/墨纹背景与投影。
- 标注「可选」的 parts 缺省时预设自动跳过对应细节，不影响主机制。

## 确定性与验收

- 生成器（`inkSheetCanvas`、`orientedInkSheet`、`tornEdgeStrip`、`edgeMaskURL`、`soakMaskURL`、`materialURL`）都在 `paper-kit.js`，固定种子、只在建轴时运行。渲染路径没有随机数与运行时时钟。
- 场景级遮罩的种子来自模块内计数器，按调用顺序递增：同一合成必须以相同顺序建轴。
- `node scripts/verify-paper-motions.mjs transition` 把展厅全部转场 seek 到同一进度，输出对照表到 `snapshots/transition-sheets/`；样板区的 `margin-pull` 对照见 `node scripts/verify-paper-pilot.mjs`。

## 选择纪律

一支视频选一个主转场承担大部分切换，加一两个点缀；`chapter-bridge`、`stamp-cover`、`red-rule-cut` 保持少见以保住冲击力。需要逐像素形变的英雄时刻才去读 GPU 旗舰文档。
