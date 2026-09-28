---
name: video-theme-library
description: Reuse the user's personal HyperFrames video themes, components, motion presets, and scene transitions. Use when a video should follow an existing library theme or when the user names a theme/component/motion/transition ID from this library.
---

# Video Theme Library

This skill is the source of truth for the user's reusable video visual system.

## Start here

1. Read `references/catalog.md`.
2. Load only the selected theme reference plus the component and motion references needed for the current video: `references/themes/<theme>.md` for direction, then `references/components/<theme>.md`, `references/motions/<theme>.md`, `references/transitions/<theme>.md` (and `references/transitions/advanced-<theme>.md` for GPU flagship work) as needed.
3. For any actual video work, also follow the installed `hyperframes` skill and the HyperFrames composition contract.
4. Copy the selected theme files into the new project's local assets or import them from this library. Freeze external media locally before rendering.

Use `index.html` to inspect `paper-editorial`, `showrooms/modern-minimal.html` for `modern-minimal`, `showrooms/voxel-harness.html` for `voxel-harness`, and `showrooms/signal-desk.html` for `signal-desk`. Every showroom is driven by the theme's real modules — what you see is what the presets do. Use `timeline-demo/index.html` only when the `paper-editorial` combined timeline example is useful.
When the user requests scene transitions, read the selected theme's `references/transitions/<theme>.md` and select transitions by narrative role; every preset that needs prebuilt DOM lists its parts contract there. For a hero beat that explicitly needs per-pixel or spatial deformation, also read `references/transitions/advanced-<theme>.md`.

## Core contract

- A theme defines visual language, not story structure. Never force a score reveal, leaderboard, or exam narrative onto unrelated content.
- Components are content-neutral layout primitives. Choose them for the information being communicated.
- Motions are independent, seek-safe animation recipes. Combine only 2–4 motion families in one scene.
- Transitions form a separate layer. Use one primary transition for most cuts plus one or two accents; do not cycle through the full catalog in one video.
- Advanced transitions are GPU effects for rare hero handoffs. Use at most one family repeatedly, or one to two isolated flagship moments; keep ordinary cuts on the base transition set.
- Demo copy and demo data are placeholders. Do not repeat them in production unless the user explicitly asks.
- `paper-editorial` 的 `ink-form` 接收文字、本地 SVG、透明图片轮廓，或用 `target.maskMode: "dark"` 从浅底图中提取深色标识；先 `await createInkForm(canvas, options)`，再把返回的 controller 交给 `paperEditorialMotions.inkForm`。先完成字体与图形解码，最后注册 paused timeline。详细用法见 `references/components/paper-editorial.md`。
- 同题双模型作品展与六维模型测评有专门的宣纸编辑部工作流配方，分别见 `references/workflows/paper-editorial-work-showcase.md` 和 `references/workflows/paper-editorial-six-dimension.md`；六维测评保持六边形面板的主体形态。
- 用户要求按这两套工作流直接制作成片时，分别加载 `$paper-editorial-work-showcase` 或 `$paper-editorial-six-dimension-review`。它们负责从真实素材和证据适配母版、重排时间线、逐帧验收到导出成片。
- `movable-type` 接收任意文字，`rubbing-reveal` 接收本地图片或 SVG，`paper-cutaway` 接收 2–4 层对位图像。都先 `await create...`，再交给同名 motion；完整用法与样片见 `references/components/paper-editorial.md` 和 `showcases/editorial-materials/`。
- Preserve the selected theme's type hierarchy, spacing, palette, texture, and motion character.
- Do not invent a near-match when an exact library ID is specified.
- Keep all HyperFrames animation deterministic: one paused timeline, no timers, randomness, infinite loops, or playback-state assumptions.

## Extending the library

When adding a theme, component, motion, or transition:

1. Add its files and documentation.
2. Register it in the theme's `theme.json`, in `library.json` (both the theme entry and the top-level union arrays), and in `references/catalog.md`.
3. Run `node scripts/validate-catalog.mjs` — it checks manifest/entry consistency, preset exports with a smoke test, showroom coverage, GPU metadata, and that every theme maps all 16 canonical components in its components.css `/* catalog: ... */` header.
4. Update the showroom if the addition changes visual coverage; run the theme's `scripts/verify-<theme>-showroom.mjs`.

## Current themes

- `paper-editorial` / 宣纸编辑部 — warm editorial paper, dense information hierarchy, restrained vermilion accents, archival labels, and decisive ink-like motion. 16 canonical + 17 theme components, 31 motions, 16 + 5 transitions.
- `modern-minimal` / 现代秩序 — warm-gray canvas, charcoal structure, cobalt focus, Swiss grid, large negative space, and precise directional motion. 17 components, 14 motions, 16 + 5 transitions.
- `voxel-harness` / 方块终端 — obsidian-green tool UI, Pixelify Sans pixel type, inventory slots, terminal commands, stepped motion, and weighted voxel transitions. 20 components, 14 motions, 16 + 5 transitions.
- `signal-desk` / 信号台 — navy editorial desk, bone-white hierarchy, amber signals, timestamps, source rails, data structures, and layered bulletin transitions. 21 components, 14 motions, 16 + 5 transitions.
