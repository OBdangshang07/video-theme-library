# Agent notes

## Verification
- `npm run validate:catalog` — catalog / theme.json / showroom coverage + Node smoke test of every motion & transition preset (presets must not touch `document` when it is undefined).
- `node scripts/verify-paper-showroom.mjs` — paper-editorial showroom (Playwright + local Chrome, paths in `scripts/lib/showroom.mjs`).
- `node scripts/verify-paper-pilot.mjs` — classic/new comparison frames to `snapshots/pilot/`, seek-determinism hash check (sequential vs shuffled seeks) and per-frame cost of canvas materials.
- Browser checks need no network: `launchPage` serves the pinned jsDelivr GSAP URL from the byte-identical `motion-reel/assets/gsap.min.js`. If the installed Playwright doesn't match its bundled browser, set `CHROME_EXECUTABLE` to a local Chromium.
- HyperFrames showcases: `node tools/sync-theme.mjs`, then `npx hyperframes check --snapshots` and `npx hyperframes render` inside the project (needs ffmpeg/ffprobe on PATH or `HYPERFRAMES_FFMPEG_PATH` / `HYPERFRAMES_FFPROBE_PATH`).

## paper-editorial 3.0 upgrade conventions
- v2.3 implementations are frozen in `themes/paper-editorial/classic/`; new defaults keep identical signatures. Classic exports: `paperEditorialMotionsClassic`, `paperEditorialTransitionsClassic`, `classic/rubbing-reveal.js`.
- Export names for classic must NOT end in `Motions` / `Transitions` (validate-catalog picks the first export with that suffix alphabetically).
- Shared seeded material generators live in `themes/paper-editorial/paper-kit.js` (noise, soak masks, wet-ink SVG filters, ink sheets). Generate at timeline-build time; never in the render path.
- Never end a var()-driven `mask-image` by setting the var to `none` — Chrome skips the repaint and the element vanishes. End on `linear-gradient(#000,#000)` instead.
- `node scripts/verify-paper-motions.mjs motion|transition` writes contact sheets (all cards seeked to the same fraction) to `snapshots/<kind>-sheets/`.
- Canvas readback flips Chrome canvases GPU→CPU; warm readbacks before hashing frames.
- Showroom duration badges, motion card footers and GPU fallback labels are rendered from `paperEditorialMotionMeta`, `paperEditorialTransitionMeta` and `paperEditorialAdvancedTransitionMeta` (v2.3 values from the classic meta). Keep meta durations equal to what the preset actually produces; never hand-write numbers in `index.html`.
- `classic/advanced-transitions.js` mounts showroom GPU cards as an import side effect — never import it from `index.html` or a composition.
- Showcase theme copies must include the full import closure (`classic/`, `paper-kit.js`, `material-utils.js`); see `showcases/paper-motion-reel/tools/sync-theme.mjs`. The older `ink-form` / `editorial-materials` sync scripts predate 3.0 and only copy entry files.
- In HyperFrames, out-of-window clips are hidden with `visibility:hidden`, so build-time measurement works; but `ink-slam` / `line-set` measure text when the timeline is built, so await the fonts first.
- `rubbing-reveal` composites only inside its relief box (`inkRect`) and reuses a pre-composited resting sheet after `S(.62)`; new ink layers must stay inside `inkRect`.
