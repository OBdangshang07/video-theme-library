# 主体档案 · paper-spec

「主体档案」的定版实样：一张**用宣纸语言写成的规格页**。

## 和主题库的关系

- **组件本体已经进了主题库**：`themes/paper-editorial/components.css` 末尾的
  「主体档案 record sheet」段落（`pe-ledger` / `pe-ticks` / `pe-tabs` / `pe-bar` /
  `pe-seal-mark` / `pe-artifact-mount` / `pe-plate`），并在 `theme.json` 登记为
  6 个主题专属组件 + `ink-plate`。
- **本目录的 `assets/paper-spec.css` 是设计留档**：它用 `ps-` 前缀保留了这一版的
  坐标与定版参数。生产合成请直接用库里的 `pe-` 组件，不要从这里复制。
- **主视觉的生成器随主题走**：`themes/paper-editorial/tools/ink-plate.mjs`。

## 主视觉：木刻谱

```bash
node themes/paper-editorial/tools/ink-plate.mjs 输入.png 输出.svg --w 168
```

图像 → 灰度 → 分成深墨/中墨/淡墨三版 → 每版输出成片的水平墨块（矢量路径），
最深一版可套朱红，做成真正的两色印刷。**输出顺序就是上版顺序**，
配 `plate-strike` 动效逐版套印。

> 试过但不成立的路子：把画面逐格换成宋体偏旁（"活字墨谱"）。宣纸是浅底，
> 深色图像一铺就是满版黑字，读起来像乱码文档——**形态靠颜色承载**这招在纸上不成立。
> 生成器仍留在本目录 `tools/type-field.mjs` 存档，未进主题。

## 复现

```bash
node tools/ink-plate.mjs assets/art/subject.png assets/art/typefield.svg --w 168
node tools/build-sheet.mjs
npx --yes hyperframes@0.8.56 snapshot --at 6.9 --no-end -o snapshots
npx --yes hyperframes@0.8.56 render -o renders/paper-spec.mp4
```
