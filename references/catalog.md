# Video Theme Library Catalog

## Themes

### `paper-editorial` — 宣纸编辑部

Warm editorial paper, ink-black information structure, vermilion annotations, archival labels, and decisive motion.

- Reference: `themes/paper-editorial.md`
- Best for: explainers, product/model reviews, comparisons, historical or technical topics, timelines, editorial summaries, work showcases, rankings, and evidence-led videos.
- Avoid for: neon gaming visuals, glossy luxury ads, playful children's content, or footage that needs a transparent overlay-first system.

### `modern-minimal` — 现代秩序

Warm-gray canvas, charcoal structure, cobalt focus, Swiss grid, large negative space, and precise directional motion.

- Reference: `themes/modern-minimal.md`
- Best for: product launches, technical explainers, brand films, enterprise content, interface showcases, portfolios, and concise data stories.
- Avoid for: nostalgic paper texture, playful illustration, neon spectacle, ornamental luxury, or content that needs intentionally dense archival framing.
- Showroom: `../../showrooms/modern-minimal.html`

### `voxel-harness` — 方块终端

Obsidian-green developer UI, open-source Pixelify Sans type, inventory-slot geometry, command-line structure, and stepped voxel motion.

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
| `verdict-stamp` | Decisive conclusion or status |
| `chapter-divider` | New section divider |
| `source-note` | Method, caveat, citation, or source |
| `progress-rail` | Full-width video progress rail |
| `end-card` | Closing statement and identity |

## Motions

| ID | Character | Typical target |
|---|---|---|
| `ink-slam` | Decisive headline hit | Main title |
| `paper-rise` | Editorial card arrival | Panels and cards |
| `count-up` | Numeric reveal | Stats |
| `bar-draw` | Evidence accumulation | Bars and rules |
| `cascade-list` | Fast ordered reveal | Lists |
| `editorial-wipe` | Print-like horizontal reveal | Chapters and media |
| `stamp-impact` | Final judgment | Verdict stamp |
| `underline-draw` | Annotation | Key phrase |
| `folio-swap` | Restrained metadata change | Header labels |
| `red-result-emphasis` | Highlight transition | Final value or conclusion |

## Transitions

The theme includes 16 base scene transitions organized as primary, section, and accent transitions, plus 5 GPU flagship transitions. Read `transitions/index.md` for the base system and `transitions/advanced.md` for per-pixel and spatial handoffs.

- Primary: `paper-push`, `folio-rise`, `focus-press`, `margin-pull`
- Section: `red-rule-cut`, `column-cascade`, `archive-shutter`, `chapter-bridge`
- Accent: `ink-sweep`, `tear-wipe`, `diagonal-slice`, `ink-iris`, `paper-fold`, `stamp-cover`, `paper-stack`, `ink-dip`
- Advanced: `ink-diffusion-field`, `fiber-tear-displacement`, `editorial-depth-warp`, `vermilion-pressure-wave`, `calligraphy-stroke-morph`

See `usage-contract.md` before mixing components and motion presets.

Visual references:

- `paper-editorial` component, motion, and transition gallery: `../../index.html`
- `modern-minimal` component, motion, and transition gallery: `../../showrooms/modern-minimal.html`
- `voxel-harness` component, motion, and transition gallery: `../../showrooms/voxel-harness.html`
- `signal-desk` component, motion, and transition gallery: `../../showrooms/signal-desk.html`
- Combined timing example: `../../timeline-demo/index.html`
