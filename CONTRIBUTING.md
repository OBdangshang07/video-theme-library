# Contributing

Issues and pull requests are welcome. Keep each change focused on one theme, component, motion family, transition family, or documentation concern.

## Before opening a pull request

1. Read `SKILL.md`, `references/catalog.md`, and `references/usage-contract.md`.
2. Register new items in both `library.json` and the relevant reference file.
3. Update the matching showroom when visual coverage changes.
4. Include the license and source for every new third-party asset.
5. Run:

```bash
npm install
npx playwright install chromium
npm run validate:catalog
npm run verify:showrooms
npm run check
```

Do not submit copied game UI, logos, commercial fonts, private media, credentials, absolute local paths, or generated assets whose redistribution terms are unclear.

## Design rules

- A theme defines visual language, not a forced narrative.
- Components must stay content-neutral.
- Motion must be deterministic and seek-safe.
- Use exact registered IDs and document intended narrative roles.
- Prefer one primary transition system with only a few accents.
