# Anki Open Template

`Anki Open Template` is a maintained multi-format Anki card template bundle for choice, QA, fill-in, image occlusion, mindmap, and audio cards.

The repository keeps TypeScript as the source of truth and generates inline `front.html` / `back.html` templates for Anki import and packaging.

## What It Supports

- Single-choice and multi-choice cards
- QA cards with notes / explanation panels
- Cloze-style fill cards with `{{c1::answer::hint}}`
- Image occlusion with per-mask reveal, reveal-next, and reveal-all
- Mindmap cards, including inline cloze inside nodes
- Native Anki audio embedding
- Theme switching, deck / type display, random option order, and front-side notes
- MathJax delimiter normalization for `$...$` and `$$...$$`

## Repository Layout

```text
src/
  shared.ts          Shared runtime helpers
  front.ts           Front-side runtime
  back.ts            Back-side runtime
templates/
  front.template.html
  back.template.html
scripts/
  build_templates.mjs
  generate_apkg.py
styles.css
front.html           Generated template output
back.html            Generated template output
TEST_DATA.md         Manual test dataset
skills/
  anki-open-template/
```

## Build Workflow

1. Edit runtime logic in `src/`.
2. Edit HTML skeletons in `templates/`.
3. Run:

```bash
npm run build
```

This performs:

- `tsc -p tsconfig.json`
- `eslint src --ext .ts`
- template bundling through `scripts/build_templates.mjs`

## Export Test Deck

Install Python packaging dependencies in the project virtualenv first:

```bash
./.venv/bin/pip install -r requirements.txt
```

Generate a ready-to-import APKG:

```bash
./.venv/bin/python scripts/generate_apkg.py
```

Output:

- `anki-open-template-test.apkg`

## Required Note Fields

The generated note model expects these fields:

1. `id`
2. `type`
3. `question`
4. `options`
5. `answer`
6. `notes`
7. `extra`
8. `audio`
9. `occlusion_image`

## Field Semantics

- `type`: `choice`, `qa`, `fill`, `occlusion`, `mindmap`
- `question`: main prompt HTML
- `options`: choice options, split by `||` or newlines
- `answer`: choice indices or free-text answer
- `notes`: explanation / notes area
- `extra`: JSON payload for complex card types
- `audio`: usually Anki sound markup like `[sound:test.wav]`
- `occlusion_image`: raw image HTML for occlusion cards

## `extra` Examples

Image occlusion:

```json
{
  "image": "red.png",
  "masks": [
    { "id": "1", "x": 10, "y": 10, "w": 25, "h": 30, "label": "区域1" },
    { "id": "2", "x": 55, "y": 45, "w": 25, "h": 30, "label": "区域2" }
  ]
}
```

Mindmap:

```json
{
  "mindmap": [
    {
      "text": "前端",
      "children": [
        { "text": "框架：{{c1::React}}" },
        { "text": "样式：CSS" }
      ]
    }
  ]
}
```

## Compatibility Notes

- The runtime is optimized for modern Anki Desktop, AnkiWeb, AnkiDroid, and AnkiMobile.
- Session-only answer state is cleared on the back side to avoid stale fill / mask carryover.
- Image occlusion uses field-provided HTML so image paths resolve the same way Anki expects.

## Manual Testing

Use [TEST_DATA.md](TEST_DATA.md) and the packaged `anki-open-template-test.apkg`.

Recommended order:

1. Base flow
2. Math and media
3. Occlusion and mindmap
4. Edge and regression cases

## Skills

This repository ships reusable skills in:

- `skills/anki-open-template/`
- `skills/anki-card-authoring/`

The first is for repository maintenance. The second is for simple card authoring without exposing template internals.

## License

This repository currently keeps the existing [LICENSE](LICENSE) file from the workspace.
