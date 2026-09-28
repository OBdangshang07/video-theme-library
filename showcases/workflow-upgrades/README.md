# 宣纸编辑部 · 两类工作流升级 demo

两支独立 HyperFrames 小样，各 30.5 秒、1920×1080、30 fps。已发布的原工程未被修改。

本轮数字落印与转场修订成片：`gpt-showcase/renders/gpt-workflow-demo-seal-20260926.mp4`、`mimo-review/renders/mimo-workflow-demo-seal-20260926.mp4`。

| 项目 | 时间线 | 重点 |
| --- | --- | --- |
| `gpt-showcase` | 0–5.5s OpenAI 标识墨迹聚形；5.5–9.5s 同题导页；9.5–14.5s SOL 作品；14.5–18.5s 活字交接；18.5–23.5s ASTRA 作品；23.5–30.5s 实帧对照 | 同题作品的视口与交棒 |
| `mimo-review` | 0–5.5s MiMo 字标聚形；5.5–9.5s 阅读路径；9.5–14.5s 黑洞作品；14.5–21.5s 证据纸层；21.5–30.5s 六边形面板 | 作品、证据和结果各自清楚 |

两张聚形图标保存在 `reference/`，来自本次用户提供的图片。标识图片虽有浅色背景，`ink-form` 的 `target.maskMode: "dark"` 仅采样深色轮廓；成品没有实心垫图。

剪辑点使用内容接力：两支片头标识在成形后以细墨粒缓慢散去；GPT 导页的标题与红色 `01` 一同飞入 SOL 作品页眉，交接页作品名沿右侧页边上行后飞入 ASTRA 页眉，避开交接页主标题，ASTRA 真实末帧缩入右侧对照卡。没有自然来源可飞的章节数字——GPT ASTRA 页的 `01` 与 MiMo 作品页的 `02`——在本页原位以无底、轻微缺墨的朱砂钤印盖下。作品窗口紧接落字或落印显影，缩短空白等待。证据页收束后，六边形刻度、轴线与标签从面板自身的位置依次显现，不插入线缩成点的转场。作品页底部的朱砂进度线在末尾收成短笔，切页后沿空白宣纸续写为下一页的规线，避免红线横穿作品画面。保留的飞行层位于主时间轴，越过 clip 边界仍连续可见。

MiMo 面板的六边形尺寸和成形节奏对照已发布原片 `compositions/panel.html` 与实际 MP4 抽帧校正：先出四层刻度与六轴，再逐边描红色分数轮廓，随后朱砂薄填与六个落点，最后出总分。中间没有圆章。

作品片段和音乐已冻结在各项目的 `assets/media/`。作品片段各为 5 秒、原速；MiMo 配乐截取 31.5 秒以覆盖片尾淡出。GPT 对照页的原工程时长按文件核验为 SOL 61.0 秒、ASTRA 66.0 秒。

主题源组件位于 `themes/paper-editorial/`；两项目共享 `shared/layout.css` 和 `shared/layout-motion.js`。运行 `node tools/sync-assets.mjs` 可把当前主题、配方和两张冻结标识同步到项目本地。同步脚本只在原工程字体仍存在时更新本地字体；冻结副本已经保存在 demo 中。

```powershell
cd gpt-showcase
npx hyperframes check --snapshots
npx hyperframes preview --background --port 3017
npx hyperframes render --quality delivery --output renders/gpt-workflow-demo.mp4

cd ../mimo-review
npx hyperframes check --snapshots
npx hyperframes preview --background --port 3018
npx hyperframes render --quality delivery --output renders/mimo-workflow-demo.mp4
```

通用工作流规则见 `references/workflows/paper-editorial-work-showcase.md` 和 `references/workflows/paper-editorial-six-dimension.md`。更换模型和素材时请改项目内容，不要直接复用本 demo 的分数、作品事实或结论。
