# Usage Contract

## Selection

Select the theme first, then choose components according to content. A component ID does not prescribe copy, data, pacing, or narrative order.

Use 2–4 motion families per scene. Repetition creates identity; adding every motion creates noise.

## Composition rules

- Default canvas: 1920×1080 unless the user specifies another format.
- Maintain the selected theme's declared safe area.
- Prefer one dominant message per scene.
- Preserve the selected theme's type roles and accent-color limits.
- Preserve a minimum 16:9 ratio for main footage/artifact frames unless the source format requires otherwise.
- The progress rail spans the entire composition, not an inner preview frame.

## Theme-specific constraints

- `paper-editorial`: serif headlines, sans explanatory copy, mono data; vermilion is an annotation, not a general background.
- `modern-minimal`: use one grotesque voice with strong weight contrast plus mono metadata; cobalt marks focus and state, never a blue-purple gradient or decorative glow.
- `voxel-harness`: Pixelify Sans is limited to titles, numbers, status, commands, and short labels; grass green marks available/complete, redstone orange marks warnings or build changes; keep real gameplay and UI footage sharp.
- `signal-desk`: amber marks focus, status, time, and data; red is reserved for breaking, risk, and correction; every factual claim should carry a source or source placeholder; timestamps and rails must organize content rather than imitate a decorative HUD.

## HyperFrames rules

- Every visual clip is a direct child of the composition root.
- Use a single paused GSAP timeline registered as `window.__timelines.main`.
- Motion must be seek-safe and deterministic.
- Avoid `setTimeout`, random values, infinite CSS animations, and playback event state.
- Scene timing lives in `data-start` and `data-duration` attributes.

## Adaptation

The following are valid uses of `paper-editorial` without any scorecard:

- A technical concept explained through a title, timeline, artifact, and conclusion.
- A two-product comparison using split panels and a verdict stamp.
- A historical story using folios, quote pullouts, and dated steps.
- A portfolio or generated-work showcase with 16:9 artifact frames.
- A news or pricing analysis using stats, source notes, and comparison tables.

Valid uses of `modern-minimal` include a product launch, interface showcase, concise technical explainer, portfolio reel, brand update, or data overview.

Valid uses of `voxel-harness` include a plugin release, mod showcase, development tool launch, UI walkthrough, build-log summary, installation guide, or gameplay feature comparison.

Valid uses of `signal-desk` include a short technology bulletin, one-company update, model release briefing, pricing change, policy timeline, funding roundup, product comparison, or weekly signal review.
