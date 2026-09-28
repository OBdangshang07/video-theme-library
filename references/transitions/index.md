# 转场参考

转场是独立的一层：基础转场按叙事角色（主 / 章节 / 点缀）分组，GPU 旗舰转场用于罕见的英雄交接。签名统一为 `(tl, parts, at, duration)`；一支视频选一个主转场承担大部分切换，加一两个点缀。

按主题阅读：

- [paper-editorial](paper-editorial.md) — 16 基础转场（4 主 / 4 章节 / 8 点缀）+ parts 契约
- [modern-minimal](modern-minimal.md) — 16 基础转场（4 主 / 4 章节 / 8 点缀）+ 完整 parts 契约（引导规线、柱列、索引、翻牌格、量规等 11 类预建 DOM）
- [voxel-harness](voxel-harness.md) — 16 基础转场（4 主 / 4 章节 / 8 点缀）+ 完整 parts 契约（合成格、热键栏、地形柱、方块柱、XP 槽轨等 7 类预建 DOM）
- [signal-desk](signal-desk.md) — 16 基础转场（4 主 / 4 章节 / 8 点缀）+ 完整 parts 契约（快讯带、规线、竖条、来源卡、静噪带等 21 类预建 DOM）

GPU 旗舰转场见 [advanced.md](advanced.md)。

HyperFrames 通用接入：让前后两个 clip 在转场时长内于不同轨道上重叠，动画作用于 `.scene-inner` 包装层，clip 可见性由框架托管。需要预建 DOM（overlay / slats / columns 等）的转场，在各主题文档的 parts 契约里逐项写明。
