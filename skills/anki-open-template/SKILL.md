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
uv run scripts/generate_apkg.py
```
5. For any field-contract change, update runtime parsing/templates, APKG generation data, README, TEST_DATA.md, and both skills together before validating.

## Repository Map

- `src/shared.ts`: shared field parsing, state helpers, MathJax normalization, DOM helpers
- `src/front.ts`: front-side interactivity and settings
- `src/back.ts`: back-side result rendering and state cleanup
- `templates/*.template.html`: static template shells with error-only diagnostic bootstrap
- `scripts/build_templates.mjs`: bundles TS into inline HTML
- `scripts/generate_apkg.py`: packages the test deck and media
- `styles.css`: shared visual system
- `TEST_DATA.md`: manual regression dataset

## Guardrails

- Do not hand-maintain large logic in generated `front.html` or `back.html`; regenerate them.
- Preserve the 9-field contract: `id`, `type`, `question`, `options`, plain-text `answer`, `notes`, strict JSON `extra`, `audio`, and `occlusion_image`.
- In Python generators, ordinary strings are escaped and intentional HTML in `question`, `options`, `notes`, or `occlusion_image` must explicitly wrap the final complete value with `trusted_html(...)`; never infer HTML from tag-like text.
- Treat mask labels, mindmap node text, tags, fill drafts, and QA answers as plain text at runtime. Sanitize field-provided rich HTML before insertion.
- For field-contract changes, update runtime parsing, templates, APKG generation, README, TEST_DATA.md, and skill docs together.
- Preserve occlusion's split: `occlusion_image` is rendered `<img>` HTML, while `extra.image` is the filename/logical image id and `extra.masks` defines masks.
- Keep session answer state isolated per card and clear it on the back side.
- Be conservative with Anki compatibility: avoid browser APIs that are likely to fail in embedded webviews.
- When debugging rendering failures, inspect generated inline script output first, not just TypeScript source.
- When adding repository cards, keep script data and manual docs in sync; avoid runtime/build edits unless behavior changes.

## Validation

Always run:

```bash
npm run build
npm test
uv run -m unittest discover -s tests -p "test_*.py"
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

- Plain field text interpolated into `innerHTML`, or rich fields rendered without sanitizing executable markup
- `TrustedHtml` values concatenated after wrapping, which turns the final value back into an ordinary escaped string
- Image paths resolving differently between AnkiWeb and desktop clients
- Cloze parsing breaking on braces, quotes, or MathJax delimiters
- Persisted review state leaking between cards or review sessions
- Choice display mode switches leaving stale reveal timers; moving from delay to manual or immediate must cancel the pending timer, and the delay control stays hidden outside delay mode
- Unescaped answer-internal `::` being mistaken for the cloze answer/hint separator; write literal separators as `\::`
- Template edits made in generated files but not reflected back into `src/` or `templates/`
