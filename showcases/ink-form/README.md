# 墨迹聚形 · 可回放样片

此样片使用宣纸编辑部主题的真实 `ink-form.js` 和 `motions.js`，顺序展示单字、短句和本地 SVG 图形。运行 `node tools/sync-theme.mjs` 可把主题文件冻结到 `assets/theme/`；正式合成也应以相同方式冻结依赖。

```powershell
node tools/sync-theme.mjs
npx hyperframes check
npx hyperframes snapshot --at 3.9,8.9,13.9
```

成片总长 15 秒。每段都是固定种子、5 秒的同一组件实例；中间时间可以任意 seek，输出不依赖鼠标、滚动或上一帧。
