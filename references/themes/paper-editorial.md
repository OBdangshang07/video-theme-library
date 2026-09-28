# `paper-editorial` / 宣纸编辑部

## Creative direction

The frame should feel like a carefully typeset editorial dossier laid over warm Chinese paper. Ink-black rules establish hierarchy; vermilion behaves like an editor's annotation. The result is formal and information-dense without becoming bureaucratic.

## Visual anchors

- Warm paper field `#EFE5CE`
- Ink structure `#20262C`
- Vermilion emphasis `#B83B2F`
- Source Han Serif-style display titles
- Source Han Sans-style body copy
- JetBrains/Cascadia Mono for measurements and metadata
- 54 px grid, subtle fiber noise, low-opacity ghost typography
- Square corners, hard rules, no glossy cards
- Full-screen screening dossiers may combine a large protected media window with a numbered folio, two independent title levels, optional vermilion emphasis metadata, duration, entry number, and a full-width progress rail.

## Motion grammar

Since 3.0 every preset is a material event rather than a bare transform. Headlines land as ink: a wet blob soaks outward through the fibres, tightens into crisp glyph edges, strikes down and lets its halo wick into the paper. Panels settle like sheets on an air cushion, tilting flat as their shadow sharpens; rules and bars are single brush strokes with a pressed start and a dry-brush tail; lines of text "take ink" upward from the baseline; verdicts and seals transfer uneven seal paste, compress and bleed vermilion; ghost watermarks spread like diluted ink. Easing stays decisive, then fully still. Transitions follow the same rule: wet ink sheets with beaded leading edges and dry-brush tails, fibrous tear and reveal edges, textured paper strips and seal faces. There are no flat colour blocks or straight geometric wipes.

All textures, masks and SVG filters are generated from fixed seeds when the timeline is built (`paper-kit.js`); rendering only tweens properties, so any frame can be sought directly. The v2.3 presets are frozen under `classic/` with identical signatures for projects that must reproduce older renders.

Composite presets coordinate whole components: `quote-reveal` (pe-quote), `chapter-mark` (pe-chapter), `end-lock` (pe-end), and `screening-unveil` (pe-screening). For long-form footage or screen recordings, use `screening-dossier` with `screening-unveil`: metadata settles first, the frame writes across the page, crop marks and folio details follow, and only the progress rail remains in continuous linear motion.

`ink-form` is the deliberate exception to the quick-impact grammar: a 4.8-second hero moment where seeded ink strokes drift, scatter, circle, and settle into supplied text or an alpha-mask graphic. Use it for a title, emblem, section thesis, or closing mark when the subject deserves the time. Its Canvas painter is driven only by the composition timeline, so a frame can be sought directly or rendered out of order.

Three further scene-level material components extend that idea: `movable-type` sets wood type, locks the forme, rolls ink and presses a debossed impression; `rubbing-reveal` lays a damp sheet over the input image and dabs it up with a cloth pad in three passes (or an intaglio rubbing with `mode: "intaglio"`); `paper-cutaway` peels aligned evidence layers back along a travelling fold, showing the paper's reverse side. Each accepts new content and absolute local time. They are hero moments for a chosen scene, with the rest of the film retaining the theme's quick editorial rhythm.

Per-motion tables live in `../motions/paper-editorial.md`; scene transitions in `../transitions/paper-editorial.md` and `../transitions/advanced-paper-editorial.md`.

## Guardrails

- Do not introduce blue-purple gradients, scanning overlays, fake HUD elements, glassmorphism, or decorative badges without informational value.
- Do not overuse red. One red field or one dominant red annotation per scene is usually enough.
- Do not convert every subject into a result card. Use artifact, quote, timeline, comparison, and chapter layouts freely.
- Avoid rounded cards and pill-shaped UI.

## Files

- `../../themes/paper-editorial/tokens.css`
- `../../themes/paper-editorial/components.css`
- `../../themes/paper-editorial/motions.js`
- `../../themes/paper-editorial/ink-form.js`
- `../../themes/paper-editorial/material-utils.js`
- `../../themes/paper-editorial/paper-kit.js` — shared seeded material generators (noise, soak masks, wet-ink and seal-ink SVG filters, ink sheets)
- `../../themes/paper-editorial/classic/` — frozen v2.3 implementations
- `../../themes/paper-editorial/movable-type.js`
- `../../themes/paper-editorial/rubbing-reveal.js`
- `../../themes/paper-editorial/paper-cutaway.js`
- `../../themes/paper-editorial/fonts/source-han-serif-medium.otf`
- `../../themes/paper-editorial/transitions.js`
- `../../themes/paper-editorial/advanced-transitions.js`
- `../../themes/paper-editorial/snippets/screening-dossier.html`
- `../../themes/paper-editorial/theme.json`
