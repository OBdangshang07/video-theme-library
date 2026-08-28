# Paper Editorial Transitions

The `paper-editorial` theme includes 16 base scene transitions and 5 GPU flagship transitions. Base transitions are grouped by narrative role so a production can stay consistent.

For per-pixel deformation, paper-fiber edges, or spatial warping on a rare hero handoff, read [advanced.md](advanced.md). Do not replace the primary transition system with a different flagship effect at every cut.

## Primary transitions

Use one of these for roughly 60–70% of scene changes.

| ID | Use | Typical duration |
|---|---|---|
| `paper-push` | Related points, normal forward motion | 0.55–0.7s |
| `folio-rise` | Ordered steps, vertical progression | 0.6–0.75s |
| `focus-press` | Calm analysis, evidence handoff | 0.65–0.8s |
| `margin-pull` | Firm editorial cut | 0.6–0.75s |

## Section transitions

Use these to mark a topic or chapter change.

| ID | Use | Typical duration |
|---|---|---|
| `red-rule-cut` | Short emphatic section cut | 0.5–0.65s |
| `column-cascade` | New information group | 0.7–0.85s |
| `archive-shutter` | Method, archive, or evidence section | 0.65–0.8s |
| `chapter-bridge` | Major chapter number or title | 0.75–0.95s |

## Accent transitions

Reserve these for openings, key reveals, or one-off emphasis.

| ID | Use | Typical duration |
|---|---|---|
| `ink-sweep` | Organic editorial reveal | 0.7–0.85s |
| `tear-wipe` | Strong comparison or correction | 0.65–0.8s |
| `diagonal-slice` | Faster analytical handoff | 0.55–0.7s |
| `ink-iris` | Hero result or central subject | 0.7–0.9s |
| `paper-fold` | Document or version change | 0.65–0.8s |
| `stamp-cover` | Verdict, pass/fail, final status | 0.55–0.7s |
| `paper-stack` | Multi-source synthesis | 0.7–0.9s |
| `ink-dip` | Calm close or tonal reset | 0.65–0.85s |

## HyperFrames integration

Import `themes/paper-editorial/transitions.js`. Every preset receives the project's single paused GSAP timeline, the relevant selectors or elements, an absolute timeline position, and an optional duration.

```js
import { paperEditorialTransitions } from "./themes/paper-editorial/transitions.js";

paperEditorialTransitions.paperPush(tl, {
  outgoing: "#scene-a .scene-inner",
  incoming: "#scene-b .scene-inner"
}, 5.4, 0.62);
```

For HyperFrames clip-based projects, overlap the outgoing and incoming clips for the transition duration on separate tracks. Animate `.scene-inner` wrappers and dedicated overlay elements; the framework continues to own clip visibility. Cover transitions require a full-frame overlay. `archive-shutter`, `column-cascade`, and `paper-stack` require prebuilt overlay children supplied through `slats`, `columns`, or `sheets`.

Choose one primary transition and one or two accents for a video. `chapter-bridge` or `stamp-cover` should remain rare so their impact is preserved.
