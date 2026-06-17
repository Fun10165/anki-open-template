---
name: anki-open-template
description: Use when maintaining or extending this repository or similar Anki template projects that generate inline front/back HTML from TypeScript, package APKG test decks, and must preserve behavior across Anki Desktop, Web, iOS, and Android.
---

# Anki Open Template

Use this skill when the task is about an Anki template bundle with generated `front.html` / `back.html`, TypeScript runtime sources, APKG packaging, or cross-client rendering regressions.

## Workflow

1. Treat `src/` as the source of truth.
2. Only edit `templates/` for static HTML skeleton changes.
3. Rebuild generated templates after code changes:

```bash
npm run build
```

4. Regenerate the importable deck when card structure, templates, media, or test data changes:

```bash
./.venv/bin/python scripts/generate_apkg.py
```
5. For any field-contract change, update runtime parsing/templates, APKG generation data, README, TEST_DATA.md, and both skills together before validating.

## Repository Map

- `src/shared.ts`: shared field parsing, state helpers, MathJax normalization, DOM helpers
- `src/front.ts`: front-side interactivity and settings
- `src/back.ts`: back-side result rendering and state cleanup
- `templates/*.template.html`: static template shells with debug bootstrap
- `scripts/build_templates.mjs`: bundles TS into inline HTML
- `scripts/generate_apkg.py`: packages the test deck and media
- `styles.css`: shared visual system
- `TEST_DATA.md`: manual regression dataset

## Guardrails

- Do not hand-maintain large logic in generated `front.html` or `back.html`; regenerate them.
- Preserve the 9-field contract: `id`, `type`, `question`, `options`, `answer`, `notes`, strict JSON `extra`, `audio`, and `occlusion_image`.
- For field-contract changes, update runtime parsing, templates, APKG generation, README, TEST_DATA.md, and skill docs together.
- Preserve occlusion's split: `occlusion_image` is rendered `<img>` HTML, while `extra.image` is the filename/logical image id and `extra.masks` defines masks.
- Keep session answer state isolated per card and clear it on the back side.
- Be conservative with Anki compatibility: avoid browser APIs that are likely to fail in embedded webviews.
- When debugging rendering failures, inspect generated inline script output first, not just TypeScript source.
- When adding repository cards, keep script data and manual docs in sync; avoid runtime/build edits unless behavior changes.

## Validation

Always run:

```bash
npm run typecheck
npm run lint
npm run build
```

For field-contract changes, explicitly cross-check README, TEST_DATA.md, `scripts/generate_apkg.py`, and both skill documents before exporting.

If behavior changed, also export the APKG and verify at least:

- single-choice
- multi-choice
- fill
- image occlusion
- mindmap
- audio
- math

## Common Failure Modes

- Raw field HTML injected into JavaScript strings without escaping
- Image paths resolving differently between AnkiWeb and desktop clients
- Cloze parsing breaking on braces, quotes, or MathJax delimiters
- Persisted review state leaking between cards or review sessions
- Template edits made in generated files but not reflected back into `src/` or `templates/`
