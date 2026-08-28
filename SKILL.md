---
name: video-theme-library
description: Reuse the user's personal HyperFrames video themes, components, motion presets, and scene transitions. Use when a video should follow an existing library theme or when the user names a theme/component/motion/transition ID from this library.
---

# Video Theme Library

This skill is the source of truth for the user's reusable video visual system.

## Start here

1. Read `references/catalog.md`.
2. Load only the selected theme reference plus the component and motion references needed for the current video.
3. For any actual video work, also follow the installed `hyperframes` skill and the HyperFrames composition contract.
4. Copy the selected theme files into the new project's local assets or import them from this library. Freeze external media locally before rendering.

Use `index.html` to inspect `paper-editorial`, `showrooms/modern-minimal.html` for `modern-minimal`, `showrooms/voxel-harness.html` for `voxel-harness`, and `showrooms/signal-desk.html` for `signal-desk`. Use `timeline-demo/index.html` only when the first theme's combined timeline example is useful.
When the user requests scene transitions, read `references/transitions/index.md` and select transitions by narrative role. For a hero beat that explicitly needs per-pixel or spatial deformation, also read `references/transitions/advanced.md`.

## Core contract

- A theme defines visual language, not story structure. Never force a score reveal, leaderboard, or exam narrative onto unrelated content.
- Components are content-neutral layout primitives. Choose them for the information being communicated.
- Motions are independent, seek-safe animation recipes. Combine only 2–4 motion families in one scene.
- Transitions form a separate layer. Use one primary transition for most cuts plus one or two accents; do not cycle through the full catalog in one video.
- Advanced transitions are GPU effects for rare hero handoffs. Use at most one family repeatedly, or one to two isolated flagship moments; keep ordinary cuts on the base transition set.
- Demo copy and demo data are placeholders. Do not repeat them in production unless the user explicitly asks.
- Preserve the selected theme's type hierarchy, spacing, palette, texture, and motion character.
- Do not invent a near-match when an exact library ID is specified.
- Keep all HyperFrames animation deterministic: one paused timeline, no timers, randomness, infinite loops, or playback-state assumptions.

## Extending the library

When adding a theme, component, motion, or transition:

1. Add its files and documentation.
2. Register it in `library.json` and `references/catalog.md`.
3. Run `node scripts/validate-catalog.mjs`.
4. Update the showroom if the addition changes visual coverage.

## Current themes

- `paper-editorial` / 宣纸编辑部 — warm editorial paper, dense information hierarchy, restrained vermilion accents, archival labels, and decisive ink-like motion.
- `modern-minimal` / 现代秩序 — warm-gray canvas, charcoal structure, cobalt focus, Swiss grid, large negative space, and precise directional motion.
- `voxel-harness` / 方块终端 — obsidian-green tool UI, open-source Pixelify Sans type, inventory slots, terminal commands, stepped motion, and weighted voxel transitions.
- `signal-desk` / 信号台 — navy editorial desk, bone-white hierarchy, amber signals, timestamps, source rails, data structures, and layered bulletin transitions.
