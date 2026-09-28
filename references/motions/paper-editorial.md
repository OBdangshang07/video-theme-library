# paper-editorial 动效参考（3.0）

导入 `themes/paper-editorial/motions.js`，把项目的单一 paused GSAP timeline 传给每个助手。签名统一为 `(tl, target, at=0, ...)` 并返回 timeline；全部为有限补间，seek-safe。

```js
import { paperEditorialMotions } from "./themes/paper-editorial/motions.js";

const tl = gsap.timeline({ paused: true });
paperEditorialMotions.inkSlam(tl, "#scene-1 .headline", 0.25);
paperEditorialMotions.paperRise(tl, "#scene-1 .panel", 0.75, 0.1);
paperEditorialMotions.countUp(tl, "#metric-value", 1.0, 87);
paperEditorialMotions.screeningUnveil(tl, "#screening-overlay", 3.0, 52.0);
window.__timelines = window.__timelines || {};
window.__timelines.main = tl;
```

## 3.0 与 classic 的契约

- **默认导出即 3.0。** `paperEditorialMotions` 的每个预设都改成一次材料事件：墨沿纤维渗开、湿墨收紧为锐边、毛笔顿笔与飞白、印泥不均转印、纸页带空气垫落下。**函数名、参数顺序与返回值与 v2.3 完全一致**，旧合成不改代码即可升级。
- **v2.3 冻结为 classic。** 需要逐帧复现旧片时改用：

  ```js
  import { paperEditorialMotionsClassic as M } from "./themes/paper-editorial/motions.js";
  // 或直接从 ./themes/paper-editorial/classic/motions.js 导入
  ```

  classic 的导出名刻意不以 `Motions` 结尾（目录校验按后缀取主题的主导出）。
- **自动回退。** 3.0 预设在拿不到 DOM 元素时（Node 冒烟测试、目标选择器为空）自动调用同名 classic 预设，保证无 DOM 环境不报错。
- **时长变了。** 材料事件比纯变换长，多数预设默认时长上调（见下表「3.0 / v2.3」列）。如果旧合成把后续补间硬编码在 `at + 0.58` 这类位置，升级后请按新时长复核，或传 `o.duration` 压回原节奏。
- **确定性。** 纹理、遮罩与 SVG 滤镜只在**建轴时**生成一次（`paper-kit.js`，固定种子）；渲染路径只改补间属性。没有 `Math.random`、`Date.now`、`performance.now`。模块内的种子计数器按调用顺序递增，因此**同一合成必须以相同顺序建轴**——不要按运行时状态有条件地插入预设。

### 材料原语（motions.js 内部）

| 原语 | 材料行为 | 驱动方式 |
|---|---|---|
| `soak` | 以字面中心为圆心，纤维毛边的圆形墨团向外吸开 | `soakMaskURL` 生成遮罩，补间 `--pe-soak` 控制 `mask-size` |
| `wetSettle` | 字形先晕成墨团（高斯模糊 + alpha 对比），纤维位移让湿边抖动，外圈墨晕渗开后干透 | `wetInkFilter` 生成 SVG 滤镜，GSAP attr 插件补间滤镜原语 |
| `edgeReveal` | 一条带纤维毛边的边界扫过元素；`hide` 反向吞掉 | `edgeMaskURL`，补间 `--pe-edge` 控制 `mask-position` |
| `brushStroke` | 笔锋边界沿行笔方向推进，笔形遮罩（顿笔、提按、飞白收尾）常驻 | 双层遮罩 intersect + `scaleY` 压笔 |
| `sealImpress` | 悬空时是虚化朱影；接触瞬间印泥按分形噪声不均转印，压实回弹，朱砂渗纸 | `sealInkFilter`，补间覆盖阈值 `intercept` |
| `paperLand` | 纸页前倾放平，投影由散到实再消失 | `rotationX` + `boxShadow` |

遮罩收尾一律把变量设为 `linear-gradient(#000,#000)`，**不要**设为 `none`——Chrome 在 var() 驱动的 `mask-image` 切到 `none` 时会跳过重绘，元素整块消失。

## 单目标动效

「3.0 / v2.3」为源码元数据 `paperEditorialMotionMeta` 与 classic 的默认时长；带 `+` 的项随级联数量增长。

| ID | 3.0 机制 | 3.0 / v2.3 | 参数 | 典型目标 |
|---|---|---|---|---|
| `ink-slam` | 墨团自中心渗开（`soak`）→ 字形由墨团收紧为锐边（`wetSettle`）→ 击打下沉 .982 回弹 → 墨晕吸散 | .96s / .58s | `o.duration`、`o.stagger`、`o.color` | 主标题、关键判断 |
| `paper-rise` | 纸页带空气垫落下：前倾 14° 放平、投影由散到实（`paperLand`） | 1.0s / .62s | `stagger=0` | 面板、卡片整组入场 |
| `bar-draw` | 一笔毛笔横画：顿笔起、中段行、飞白收（`brushStroke`） | 1.02s / .95s | `origin="left center"`（`right …` 反向） | 证据条、规则线 |
| `cascade-list` | 每行像纸条滑入 x −64→0，前缘纤维毛边随行揭开 | .58s+ / .5s+ | `stagger=.07` | 排行、目录、有序条目 |
| `editorial-wipe` | 纤维毛边扫过版面（.72s），内容带 1.018→1 景深落定 | .9s / .65s | `direction="ltr"`（ltr/rtl/ttb/btt） | 图片、整版内容（**不要**直接用于 `<video>`，见契约 2） |
| `stamp-impact` | 印面斜砸（−12°→−3°，1.8→1），接触时印泥不均转印，压实回弹，朱砂渗纸 | 1.1s / .48s | — | verdict-stamp、状态确认 |
| `underline-draw` | 朱砂细笔快速一挑，收笔带飞白 | .56s / .5s | `origin="left center"` | 关键词句的朱砂批注 |
| `folio-swap` | 细纤维边自左拭入，元数据只轻移 −8px | .46s / .32s | — | 页眉、编号、元数据 |
| `red-result-emphasis` | 墨色被朱砂浸透：转红同时朱砂外渗，.92→1.045→1 轻压回弹 | .9s / .5s | — | 最终数值、结论 |
| `count-up` | 高速段纵向动态模糊（由缓动导数算出，逐帧确定），落定时轻压 1.035 | 1.1s（+.24 落定）/ 1.1s | `end=100`、`duration=1.1`、`formatter` | 统计数值 |
| `ghost-settle` | 大号淡墨被水洇开（慢 `soak` + 强位移 `wetSettle`），渗出轮廓后落定 | 1.3s / 1.1s | — | pe-ghost 背景水印 |
| `line-set` | 纤维边自基线向上打开，笔画先微晕再收锐，可级联 | .72s+ / .68s+ | `rise=0`、`blur=5`、`duration`、`stagger=0`、`ease` | **所有文字行的默认出场**，取代纯 opacity 淡入 |
| `window-surface` | 显影浮出：虚焦 + 过曝 + 低饱和一起收回，像相纸在显影液里浮出 | .9s / .8s | `scale=1.035`、`blur=10`、`duration`、`ease` | 录屏 / 媒体面；**绝不**用 clip/mask |
| `seal-press` | 纵向盖下（无旋转），印泥转印 + 压实；可选墨晕扩散 | 1.1s（带 `bloom` ~1.55s）/ .69s | `bloom`、`drop`、`bloomDuration=1.25` | 印章、落款的纵向盖印 |
| `seal-sheet` | 一组朱印逐枚盖下，印泥滤镜作用在**内层**，外层独立倾角保持不动 | 1.1s+ / .34s+ | `inner`、`stagger=.12`、`fromScale=1.6`、`spin=-6` | 印谱、编号阵列 |
| `paper-drift` | 颗粒背景匀速平移；`o.breathe` 给纸面极轻的呼吸缩放 | 整场 | `spans=[[选择器,起始秒,持续秒],…]`、`grainX`、`grainY`、`breathe` | `pe-grain` 底噪；**整片底噪的唯一来源** |
| `bar-pull` | 湿朱砂一刀横拉（纤维边前缘 + 1.18→1 压笔），文字随后吃墨入场 | 1.4s+ / .87s | `duration=.8`（横带本身） | `vermilion-bar`；全画面唯一饱和色，一部片只用一次 |
| `plate-strike` | 按墨版次序上纸，每版印泥不均转印并带 ±5px 套准偏移归位 | 版数 × .24 + .26s / .9s+ | `duration=.5`、`stagger=.24` | `ink-plate` 的 `path`；**绘制顺序就是印刷顺序** |

## 材料组件动效（Canvas）

这四个动效驱动一个 controller：先 `await create…()` 完成解码与材料生成，再把 controller 交给同名 motion。motion 只是一段线性补间，`onUpdate` 调用 `controller.render(localSeconds)`。

| ID | 3.0 材料行为 | 默认时长 | 组件 |
|---|---|---|---|
| `ink-form` | 固定种子的短笔触先散开、聚环、再聚成目标轮廓 | 4.8s | `pe-ink-form-canvas` |
| `movable-type` | 拣字（每块自旋落位、阻尼回弹）→ 锁版（四根版框滑入）→ 上墨（墨辊滚过，字面由木色转湿墨）→ 压印抬版，留下不均匀的凹印墨字 | 5.6s | `pe-movable-type canvas` |
| `rubbing-reveal` | 覆纸捶实浮出凸痕 → 拓包三遍扑墨（淡扫、交叉、定点加深），布纹印迹逐次积墨饱和、新印短暂湿亮 → 收拓晾干略变浅 | 5.4s | `pe-rubbing-reveal canvas`；`mode:"intaglio"` 为阴刻拓，默认 `marks` |
| `paper-cutaway` | 纸层自右上角沿移动折线卷起，折过去的部分露出纸背（正面反向透出），带卷曲阴影；下层对位纸随揭开而提亮 | 6.6s | `pe-paper-cutaway canvas`，2–4 层 |

`render(t)` 只取决于 `t` 与种子。`rubbing-reveal` 顺序播放时增量累积拓包印迹，倒退 seek 时从零按同一顺序重建，两条路径像素一致（`node scripts/verify-paper-materials.mjs` 以顺序/乱序像素哈希验证）。

## 组合动效（多相协同）

组合动效的 target 是组件根节点（选择器字符串），内部按类名查找子元素，要求使用对应组件的标准类名。

| ID | 3.0 编排 | 总跨度 | 参数 | 目标组件 |
|---|---|---|---|---|
| `quote-reveal` | 纸条自左落定(.6s) → 引文逐行吃墨(`line-set` .8s@+.1) → 出处纤维边拭入(.5s@+.52) | 1.02s | — | `pe-quote` |
| `chapter-mark` | 栏目纤维边拭入(.42s) → 序号墨定(`ink-slam` .9s@+.06) → 标题吃墨(.72s@+.24) → 朱砂一笔横画(.7s@+.42) | 1.12s | — | `pe-chapter` |
| `end-lock` | 结语逐行吃墨(.8s 级联 .14) → 朱砂句读盖印(@+.52) → 落款拭入(.56s@+.86) | ~1.42–1.6s | — | `pe-end` |
| `screening-unveil` | 头部拭入(@+.04) → 画框纤维边展开(.72s@+.1) → 角标钉入(级联@+.3) → 页脚(@+.34) → 书脊/卷次(@+.42)；`progressDuration>0` 时进度轨全程线性推进 | ~1.1s + 进度轨 | `progressDuration` | `pe-screening` |
| `slate-flight` | 同一节点从引导页排版飞进作品页页眉；x/y 分用不同缓动走弧线 | .86s（可调） | `legs=[[选择器,{from,to}],…]`、`duration`、`ease` | 引导页与作品页共用的标题节点 |
| `compare-pair` | 分栏格自上纤维边展开(.76s) → 两侧条目逐行吃墨(.5s 级联 .05@+.42) | ~1.2s | `gridDuration`、`stagger` | `pe-compare` / `cm-stage` |
| `ledger-strike` | 刻度逐齿点下带墨珠回弹(`back.out` .34s 级联 .018) → 账目逐行吃墨(`line-set` .6s 级联 .09@+.2) | ~1.0s+ | `tickStagger`、`stagger`、`duration`、`lead` | `ledger-table` + `tick-rule` |
| `mount-seat` | 界格纤维边绘出(.76s) → 画面显影(`window-surface`@+.08，需传 `art`) → 图注吃墨(@+.84) | 1.4s | `art`、`duration` | `artifact-mount` / `ink-plate` |
| `handoff-swap` | 论点墨定 → 左栏纸落 → 中缝绘出 → 朱砂笔带横扫吞掉左半(1.24) → 笔锋离场(2.42) → 朱印盖进右半(2.16) → 整页四拍冲击 → 墨点飞散 → 活字落下 → 角色/作品/说明/脚注(2.46–3.62) | ~3.9–4.1s | `root` | 同题换模型的双栏交接卡 |

`screeningUnveil(tl, root, at, progressDuration)`：`progressDuration` 传 0 表示该场景不需要进度轨动画；否则传素材完整时长，朱砂进度轨从 `at` 开始线性走满。

## 时序契约（本主题的硬约束）

1. **静止态必须写在 CSS 里。** 任何以 `immediateRender:false` 起手的 `fromTo` 揭示，
   该元素的静止态（`opacity:0` + `visibility:hidden`）必须先落到样式表。否则元素会先以
   自然可见态渲染，等补间开始时才跳回起点——画面上就是「先出现，再原地演一次」，在首帧尤其明显。
   用 `opacity` 不够，用 `visibility` 才能同时避开版面审计的遮挡判定。
2. **媒体面不要 clip。** 对 `<video>` 施加 `clip-path` 或 `mask` 会让 Chrome 停止合成视频画面，
   整个补间期间素材是空白的。用 `window-surface`，或者把裁切加在外层容器上。
3. **先飞，再开窗。** 引导页→作品页的顺序固定为：文字先飞（`slate-flight`），
   落位之后作品窗才出场（`window-surface` + `screening-unveil`）。
   作品窗的边框、素材、页脚、进度轨在整段飞行期间必须完全不可见。
4. **不要覆盖别人写好的 transform。** GSAP 写 `transform` 时会整条替换掉 CSS 里的
   transform。`seal-sheet` 因此把缩放与印泥放在内层 `.end-seal-in` 上。
5. **遮罩收尾不用 `none`。** 见上文材料原语一节。
6. **滤镜节点在建轴时注入。** 湿墨与印泥滤镜挂在 `document.body` 末尾一个隐藏的 `<svg><defs>` 里，
   以 `filter:url(#pe-wet-ink-N)` 引用。不要在建轴后清空 `body` 或把场景移进 shadow DOM。

## 使用规则

- 同一场景组合 2–4 个动效族，重复产生识别度，全用产生噪音。
- 扩展 motions.js 时保持：显式 `at` 定位、有限补间、无定时器/随机/播放态假设；新的材料纹理放进 `paper-kit.js`，在建轴时生成。
- `ink-form` 的目标采样在时间线注册前完成；不要把 `requestAnimationFrame`、滚动或鼠标状态放进视频合成。组件用法见 `references/components/paper-editorial.md`。
- `movable-type`、`rubbing-reveal`、`paper-cutaway` 同样先 `await create...`，再把 controller 交给同名 motion。三者是场景内内容组件，不替代场景间转场。
- `red-result-emphasis` 的墨/朱砂色值与 tokens.css 的 `--pe-ink` / `--pe-red` 对应；改主题色时同步 motions.js 顶部常量。
- 展厅（`index.html#motions`）每张卡的时长角标直接读源码元数据，划线为 v2.3 旧值；`node scripts/verify-paper-motions.mjs motion` 把全部卡片 seek 到同一进度，输出对照表到 `snapshots/motion-sheets/`。
