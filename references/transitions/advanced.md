# 旗舰转场（GPU）

旗舰转场通过 WebGL 同时处理前后两幅场景纹理，用于片头、章节断点、核心结论或作品揭晓，不承担高频普通切换。`render(progress)` 必须是进度的纯函数，只由单一 paused timeline 驱动。

按主题阅读：

- [paper-editorial](advanced-paper-editorial.md) — 5 个效果：墨场渗化 / 纤维断页 / 纵深折版 / 朱砂压力波 / 笔势流场
- [modern-minimal](advanced-modern-minimal.md) — 5 个效果：网格翘曲场 / 钴蓝扫描 / 轴镜分裂 / 景深焦移 / 阈值解析
- [voxel-harness](advanced-voxel-harness.md) — 5 个效果：方块崩解 / 传送门旋涡 / 像素排序瀑布 / 地形柱隆升 / 红石涌流
- [signal-desk](advanced-signal-desk.md) — 5 个效果：静噪干扰 / 滚动带滑落 / 雷达扫掠揭示 / 数据流坍缩 / 频谱色散分裂

通用边界：同一支视频优先选一个旗舰转场作为签名动作；交接时前后场景必须同时存在；保留显式不透明背景；WebGL 不可用时回退到该主题文档指定的基础转场，不要伪造 CSS 近似版。
