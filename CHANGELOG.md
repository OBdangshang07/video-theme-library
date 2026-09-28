# Changelog

All notable changes to this project are documented here.

## Unreleased

- `paper-editorial` theme manifest 3.0.0: all motions and transitions are material-driven (seeded ink soaks, wet-ink and seal-ink SVG filters, generated ink sheets, fibrous edges); v2.3 remains available as `paperEditorialMotionsClassic` / `paperEditorialTransitionsClassic` and under `themes/paper-editorial/classic/`.
- Default durations follow the materials (for example `ink-slam` .58s → .96s, `margin-pull` .7s → 1.0s); the showroom reads its duration badges from source metadata.
- `ink-diffusion-field` falls back to `paper-push` again when WebGL is unavailable, matching the documented v2.3 mapping.
- Adds `showcases/paper-motion-reel/`, a HyperFrames composition that chains the 3.0 motions and transitions.
- Fixes `metric-triptych` evidence bars: the vermilion-bar component's `.pe-bar` flex layout and 92px padding leaked into `.pe-metric .pe-bar`, offsetting and shrinking every bar fill.
- `rubbing-reveal` composites only inside its relief box, caches the settled sheet, and blurs the pad shadow on a small scratch canvas: about half the per-frame cost, output within 2/255 of the previous pixels and still seek-deterministic.
- `quote-reveal` and `chapter-mark` metadata durations now match what the presets produce (1.02s / 1.12s).

## 5.2.0 - 2026-09-28

- Expands the four theme catalogs to 16 canonical components, 73 motions, 64 base transitions, and 20 advanced transitions.
- Adds paper-editorial 3.0 materials, classic implementations, workflow showcases, motion reel, and visual verification snapshots.
- Includes source projects and rendered previews for the showcase examples.
- Documents and licenses bundled open-source fonts; keeps private and system fonts out of the public repository.

## 4.0.0 - 2026-08-28

- Open-source release of four stable HyperFrames themes.
- Includes 15 shared components, 10 shared motion presets, 16 base transitions, and 5 GPU flagship transitions for `paper-editorial`.
- Adds independent showrooms for `modern-minimal`, `voxel-harness`, and `signal-desk`.
- Replaces the privately sourced Minecraft AE font with OFL-licensed Pixelify Sans.
- Standardizes cross-platform font fallbacks and records third-party licensing.
- Adds catalog, showroom, and HyperFrames validation for CI.
