---
name: anki-card-authoring
description: Use when the task is to create, expand, or revise Anki cards for this project. This skill hides template internals and lets the agent work from simple card intent: question, answer, options, notes, image masks, mindmap nodes, or audio.
---

# Anki Card Authoring

Use this skill to create cards quickly without reasoning about template runtime details.

## Goal

Convert user content into a valid card with the smallest necessary set of decisions:

1. choose card type
2. fill the card fields
3. keep notes concise and useful
4. avoid leaking template implementation details unless explicitly asked

## Supported Card Types

### Choice

Use for single-answer or multi-answer option questions.

Required content:

- question
- options
- correct option index or indices

Output shape:

- `type`: `choice`
- `options`: join with `||`
- `answer`: 1-based option index or indices, such as `1` or `1||3||5`

### QA

Use for open-ended prompts with a reference answer.

Required content:

- question
- answer

Output shape:

- `type`: `qa`
- `options`: empty
- `answer`: plain text

### Fill

Use for sentence completion or concept recall.

Required content:

- source sentence
- answer span or spans
- optional hint text

Output shape:

- `type`: `fill`
- write cloze inline as `{{c1::answer::hint}}`
- leave `options` empty
- put canonical answers in `answer`, joined by `||`

### Occlusion

Use when the card is driven by an image with hidden regions.

Required content:

- prompt
- image filename or image HTML
- mask rectangles

Output shape:

- `type`: `occlusion`
- `occlusion_image`: rendered `<img>` HTML shown by the template
- `extra`: strict JSON with logical `image` filename/id and `masks` rectangles

### Mindmap

Use for hierarchical recall.

Required content:

- node tree

Output shape:

- `type`: `mindmap`
- `extra`: strict JSON with `mindmap`

### Audio

Use when playback is part of the prompt.

Output shape:

- usually `type`: `qa`
- `audio`: `[sound:file.ext]`

## Minimal Authoring Rules

- Prefer one clear learning objective per card.
- Keep the prompt shorter than the explanation.
- Put supporting explanation in `notes`, not `question`.
- When mathematical notation is involved, prefer LaTeX wrapped in `$...$` or `$$...$$` instead of raw Unicode symbols.
- Do not write bare special Unicode characters such as `Σ`, `Γ`, `ε`, `∈`, `⊆`, `⋃`, `^*`-style pseudo notation when a clean LaTeX form like `$\Sigma$`, `$\epsilon$`, `$x \in A$`, `$L \subseteq \Sigma^*$`, or `$$A^* = \bigcup_{n \ge 0} A^n$$` is available.
- Prefer visually standard mathematical forms because they are easier to read, easier to memorize, and render more consistently across cards.
- For choice cards, avoid ambiguous distractors.
- For fill cards, only cloze the part that should be recalled.
- For multi-answer choice cards, ensure the question wording says multiple answers may be correct.
- For choice answers, count options from 1, not 0.
- For occlusion cards, keep masks large enough to tap on mobile.
- For mindmaps, keep each node label short.

## ID Conventions

Use these prefixes unless the user gives another scheme:

- `C` for choice
- `Q` for QA
- `F` for fill
- `O` for occlusion
- `M` for mindmap
- `A` for audio
- `R` for regression or edge-case cards

## Output Contract

When producing a card, give or write these fields:

- `id`
- `type`
- `question`
- `options`
- `answer`
- `notes`
- `extra`
- `audio`
- `occlusion_image`

If a field is unused, leave it empty.

## Default Behavior

- If the user gives raw study material, choose the simplest effective card type.
- If the user does not request a specific format, prefer:
  - `choice` for recognition
  - `fill` for exact recall
  - `qa` for short explanation
- If the user asks for a batch, keep card difficulty mixed but consistent.
- If the user asks to add cards into this repository, update the existing script data and manual card docs together; do not touch runtime, template, or build files unless the card behavior itself changes.

## What Not To Do

- Do not explain the front/back template architecture unless asked.
- Do not expose runtime storage keys, generated HTML structure, or build internals.
- Do not overuse cloze for content better expressed as choice or QA.
- Do not create cards whose answer cannot be judged clearly.
- Do not default to raw Unicode math symbols when LaTeX notation would express the same content more cleanly.
- Do not change the 9-field contract in card examples without checking README, TEST_DATA.md, and the template-maintenance skill.
