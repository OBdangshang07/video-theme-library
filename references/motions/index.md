# 动效参考

动效是独立、seek-safe 的动画配方，签名统一为 `(tl, target, at=0, ...)`，接收项目的单一 paused GSAP timeline 并返回它。同一场景组合 2–4 个动效族。

按主题阅读：

- [paper-editorial](paper-editorial.md) — 15 个动效：11 个单目标 + count-up + 4 个多相组合（quote-reveal / chapter-mark / end-lock / screening-unveil）
- [modern-minimal](modern-minimal.md) — 14 个动效：11 个单目标（含 number-roll 计数、soft-emphasis 钴蓝点题、grid-settle 网格落定）+ 3 个多相组合（metric-sweep / section-mark / showcase-unveil）
- [voxel-harness](voxel-harness.md) — 14 个动效：11 个单目标（steps 阶梯 + 落点弹性，含 xp-count 计数）+ 3 个多相组合（hud-unveil / chunk-mark / lockup-boot）
- [signal-desk](signal-desk.md) — 14 个动效：11 个单目标（含 source-pin 阴影锚边、signal-count 计数）+ 3 个多相组合（bulletin-unveil / chapter-signal / evidence-reveal）

通用规则：显式 `at` 定位、有限补间、无定时器/随机数/无限循环/播放态假设。扩展任何主题的 motions.js 都必须保持 seek safety。
