# 组件参考

组件是内容中性的布局原语，按传达的信息选择，不绑定任何叙事。全库 16 个 canonical 组件 ID 在各主题都有专属样式；主题可以额外提供特色组件。

按主题阅读类名映射与用法：

- [paper-editorial](paper-editorial.md) — `pe-` 前缀，16/16 覆盖
- [modern-minimal](modern-minimal.md) — `mm-` 前缀，16/16 覆盖 + 1 个主题特色组件（status-pill 状态丸）
- [voxel-harness](voxel-harness.md) — `vh-` 前缀，16/16 覆盖 + 4 个主题特色组件（指令块、功能槽位、键位提示、物品栏条）
- [signal-desk](signal-desk.md) — `sd-` 前缀，16/16 覆盖 + 5 个新闻台特色组件（突发横幅、市场横条、发布卡、时间标记、快讯轨）

通用规则：只复制生产合成实际需要的组件标记；保持所选主题的字级、间距、配色与材质；`screening-dossier` 类高密度媒体布局中，主体名与条目标题保持独立层级。
