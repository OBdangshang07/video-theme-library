# Agent notes

## Verification
- `npm run validate:catalog` — catalog / theme.json / showroom coverage + Node smoke test of every motion & transition preset (presets must not touch `document` when it is undefined).
- `node scripts/verify-paper-showroom.mjs` — paper-editorial showroom (Playwright + local Chrome, paths in `scripts/lib/showroom.mjs`).
- `node scripts/verify-paper-pilot.mjs` — classic/new comparison frames to `snapshots/pilot/`, seek-determinism hash check (sequential vs shuffled seeks) and per-frame cost of canvas materials.

## paper-editorial 3.0 upgrade conventions
- v2.3 implementations are frozen in `themes/paper-editorial/classic/`; new defaults keep identical signatures. Classic exports: `paperEditorialMotionsClassic`, `paperEditorialTransitionsClassic`, `classic/rubbing-reveal.js`.
- Export names for classic must NOT end in `Motions` / `Transitions` (validate-catalog picks the first export with that suffix alphabetically).
- Shared seeded material generators live in `themes/paper-editorial/paper-kit.js` (noise, soak masks, wet-ink SVG filters, ink sheets). Generate at timeline-build time; never in the render path.
- Never end a var()-driven `mask-image` by setting the var to `none` — Chrome skips the repaint and the element vanishes. End on `linear-gradient(#000,#000)` instead.
- `node scripts/verify-paper-motions.mjs motion|transition` writes contact sheets (all cards seeked to the same fraction) to `snapshots/<kind>-sheets/`.
- Canvas readback flips Chrome canvases GPU→CPU; warm readbacks before hashing frames.
