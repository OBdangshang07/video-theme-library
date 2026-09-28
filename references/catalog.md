# Video Theme Library Catalog

四个主题均已对齐统一契约：16 个 canonical 组件全覆盖（`paper-editorial` 另附 17 个主题专属组件：6 个场景组件、7 个主体档案组件、4 个内容驱动材料组件）、14–31 个动效、16 个基础转场（4 主 / 4 章节 / 8 点缀）、5 个 GPU 旗舰转场。每主题的逐条参考在 `references/motions/<theme>.md`、`references/transitions/<theme>.md`、`references/transitions/advanced-<theme>.md`、`references/components/<theme>.md`。

## Themes

### `paper-editorial` — 宣纸编辑部

Warm editorial paper, ink-black information structure, vermilion annotations, archival labels, and decisive motion.

- Reference: `themes/paper-editorial.md`
- Best for: explainers, product/model reviews, comparisons, historical or technical topics, timelines, editorial summaries, work showcases, rankings, and evidence-led videos.
- Avoid for: neon gaming visuals, glossy luxury ads, playful children's content, or footage that needs a transparent overlay-first system.
- Showroom: `../../index.html`

### `modern-minimal` — 现代秩序

Warm-gray canvas, charcoal structure, cobalt focus, Swiss grid, large negative space, and precise directional motion.

- Reference: `themes/modern-minimal.md`
- Best for: product launches, technical explainers, brand films, enterprise content, interface showcases, portfolios, and concise data stories.
- Avoid for: nostalgic paper texture, playful illustration, neon spectacle, ornamental luxury, or content that needs intentionally dense archival framing.
- Showroom: `../../showrooms/modern-minimal.html`

### `voxel-harness` — 方块终端

Obsidian-green developer UI, Pixelify Sans pixel type, inventory-slot geometry, command-line structure, and stepped voxel motion.

- Reference: `themes/voxel-harness.md`
- Best for: game plugins, mods, developer tools, interaction systems, build demos, release notes, and gameplay UI showcases.
- Avoid for: formal editorial analysis, soft lifestyle stories, luxury products, or videos where the game/tool language would distract from the subject.
- Showroom: `../../showrooms/voxel-harness.html`

### `signal-desk` — 信号台

Deep-navy editorial desk, bone-white hierarchy, amber signals, timestamps, source rails, data structures, and layered bulletin transitions.

- Reference: `themes/signal-desk.md`
- Best for: AI and technology briefings, model releases, product updates, policy changes, funding news, industry events, weekly reviews, and evidence-led explainers.
- Avoid for: playful gaming UI, nostalgic paper stories, soft lifestyle content, or a visual language that should hide sources and timestamps.
- Showroom: `../../showrooms/signal-desk.html`

## Components

16 canonical component IDs; every theme styles all of them (per-theme class names in `components/<theme>.md`; themes also ship extra theme-specific components):

| ID | Purpose |
|---|---|
| `editorial-title` | Opening headline or major thesis |
| `folio-header` | Persistent editorial metadata and page numbering |
| `paper-panel` | General information container |
| `stat-block` | One prominent number or short fact |
| `metric-triptych` | Three parallel dimensions or KPIs |
| `comparison-split` | Two-sided comparison |
| `ranked-list` | Ordered results, priorities, or options |
| `timeline-steps` | Process, chronology, or methodology |
| `quote-pullout` | Thesis, quote, or key conclusion |
| `artifact-frame` | 16:9 footage, screenshot, image, or project showcase |
| `screening-dossier` | Full-frame footage or screen recording with editorial identity, optional emphasis metadata, duration, entry number, and progress |
| `verdict-stamp` | Decisive conclusion or status |
| `chapter-divider` | New section divider |
| `source-note` | Method, caveat, citation, or source |
| `progress-rail` | Full-width video progress rail |
| `end-card` | Closing statement and identity |

## Motions

Per-theme rosters (details and per-ID tables in `motions/<theme>.md`):

- `paper-editorial` (31): `ink-slam`, `paper-rise`, `bar-draw`, `cascade-list`, `editorial-wipe`, `stamp-impact`, `underline-draw`, `folio-swap`, `red-result-emphasis`, `count-up`, `ghost-settle`, `quote-reveal`, `chapter-mark`, `end-lock`, `screening-unveil`, `line-set`, `slate-flight`, `window-surface`, `seal-press`, `seal-sheet`, `compare-pair`, `handoff-swap`, `paper-drift`, `ledger-strike`, `bar-pull`, `mount-seat`, `plate-strike`, `ink-form`, `movable-type`, `rubbing-reveal`, `paper-cutaway`
- `modern-minimal` (14): `grid-reveal`, `precision-rise`, `number-roll`, `rule-expand`, `list-stagger`, `mask-slide`, `focus-snap`, `soft-emphasis`, `index-shift`, `closing-compress`, `grid-settle`, `metric-sweep`, `section-mark`, `showcase-unveil`
- `voxel-harness` (14): `chunk-load`, `block-drop`, `slot-cascade`, `command-type`, `cursor-snap`, `bar-charge`, `item-pop`, `pane-unfold`, `status-flash`, `logo-craft`, `xp-count`, `hud-unveil`, `chunk-mark`, `lockup-boot`
- `signal-desk` (14): `headline-split`, `ticker-roll`, `timecode-roll`, `source-pin`, `signal-pulse`, `story-stack`, `bar-surge`, `quote-cut`, `alert-hit`, `desk-lock`, `signal-count`, `bulletin-unveil`, `chapter-signal`, `evidence-reveal`

## Transitions

Every theme carries 16 base transitions (4 primary / 4 section / 8 accent) plus 5 GPU flagship transitions. Parts contracts and per-ID tables in `transitions/<theme>.md`; GPU integration in `transitions/advanced-<theme>.md`.

- `paper-editorial` — primary: `paper-push`, `folio-rise`, `focus-press`, `margin-pull`; section: `red-rule-cut`, `column-cascade`, `archive-shutter`, `chapter-bridge`; accent: `ink-sweep`, `tear-wipe`, `diagonal-slice`, `ink-iris`, `paper-fold`, `stamp-cover`, `paper-stack`, `ink-dip`; GPU: `ink-diffusion-field`, `fiber-tear-displacement`, `editorial-depth-warp`, `vermilion-pressure-wave`, `calligraphy-stroke-morph`
- `modern-minimal` — primary: `split-slide`, `axis-rise`, `clean-cross`, `frame-pull`; section: `blue-line-cut`, `grid-shift`, `panel-lock`, `section-index-swap`; accent: `aperture-box`, `precision-zoom`, `axis-fold`, `dot-expand`, `swiss-cross-cut`, `grid-dissolve`, `measure-cut`, `panel-slide-over`; GPU: `grid-warp-field`, `cobalt-scan-sweep`, `axis-mirror-split`, `focus-rack-depth`, `threshold-resolve`
- `voxel-harness` — primary: `chunk-push`, `block-rise`, `portal-cross`, `camera-step`; section: `craft-grid`, `inventory-swap`, `terrain-wipe`, `command-cut`; accent: `ender-iris`, `block-shatter`, `redstone-pulse`, `voxel-fold`, `pixel-rain`, `craft-flip`, `torch-flicker-cut`, `xp-drain`; GPU: `block-dissolve-chunks`, `portal-warp-swirl`, `pixel-sort-cascade`, `terrain-column-rise`, `redstone-surge-pulse`
- `signal-desk` — primary: `ribbon-handoff`, `headline-push`, `desk-cross`, `feed-rise`; section: `timecode-jump`, `bulletin-shutter`, `source-stack`, `signal-cut`; accent: `breaking-flash`, `headline-crush`, `map-aperture`, `data-collapse`, `static-wipe`, `amber-rule-cut`, `teletype-roll`, `channel-zap`; GPU: `signal-static-interference`, `broadcast-roll-band`, `radar-sweep-reveal`, `data-stream-collapse`, `spectrum-dispersion-split`

See `usage-contract.md` before mixing components and motion presets.

Visual references:

- `paper-editorial` component, motion, and transition gallery: `../../index.html`
- `modern-minimal` component, motion, and transition gallery: `../../showrooms/modern-minimal.html`
- `voxel-harness` component, motion, and transition gallery: `../../showrooms/voxel-harness.html`
- `signal-desk` component, motion, and transition gallery: `../../showrooms/signal-desk.html`
- Combined timing example: `../../timeline-demo/index.html`
