# SKILLS KNOWLEDGE BASE

## OVERVIEW

`skills/` contains Codex-facing workflows shipped with the Anki template project. It is not runtime code; it defines when agents should maintain the template versus author cards.

## STRUCTURE

```text
skills/
├── anki-open-template/
│   ├── SKILL.md
│   └── agents/openai.yaml
└── anki-card-authoring/
    ├── SKILL.md
    └── agents/openai.yaml
```

## SKILL SELECTION

| User intent | Skill | Boundary |
|-------------|-------|----------|
| Fix or extend template behavior | `anki-open-template` | `src/`, `templates/`, `styles.css`, build, APKG validation. |
| Debug Anki client rendering | `anki-open-template` | Cross-client compatibility and generated inline HTML. |
| Create or revise cards | `anki-card-authoring` | Card fields only; hide runtime internals. |
| Convert study material into cards | `anki-card-authoring` | Choose simplest effective card type. |

## MAINTENANCE BOUNDARIES

- `anki-open-template` is for developers/maintainers. It may mention source files, generated HTML, storage, build commands, APKG generation, and manual regression checks.
- `anki-card-authoring` is for authors/end users. It should not expose runtime storage keys, generated HTML structure, or build internals unless explicitly asked.
- The shared interface between skills is the 9-field card contract: `id`, `type`, `question`, `options`, `answer`, `notes`, `extra`, `audio`, `occlusion_image`.
- Template-level concerns flow to `anki-open-template`; content-shaping concerns flow to `anki-card-authoring`.
- Repository card additions must keep script data, manual docs, and skill guidance in sync; do not touch runtime/build files unless card behavior changes.

## FILE CONVENTIONS

- Each skill directory name matches `SKILL.md` frontmatter `name`.
- `SKILL.md` frontmatter `description` is the invocation trigger; keep it specific and task-oriented.
- `SKILL.md` body is execution guidance; keep it concrete, not marketing copy.
- `agents/openai.yaml` is a separate agent-system surface with `version`, `display_name`, `short_description`, and `default_prompt`.
- Skills are independent; do not create hidden import/state coupling between skill folders.

## AUTHORING CONTRACT

- Choice cards: `options` joined with `||`; `answer` uses 1-based option indices such as `1` or `1||3||5`.
- QA cards: `options` is empty; `answer` is the reference answer.
- Fill cards: cloze syntax in `question`; canonical answers joined with `||`.
- Occlusion cards: `occlusion_image` contains rendered `<img>` HTML; strict `extra` JSON contains the logical `image` filename/id and `masks`.
- Mindmap cards: strict `extra` JSON contains the `mindmap` node tree.
- Audio cards: usually QA cards with `[sound:file.ext]` in `audio`.
- Regression or edge-case cards use the `R` id prefix unless the user gives another scheme.

## ANTI-PATTERNS

- Do not make the card-authoring skill explain front/back template architecture by default.
- Do not let template maintenance guidance leak into simple card output.
- Do not add a new skill without a clear audience split and invocation description.
- Do not change field contract wording in one skill without checking the other skill, README, and TEST_DATA.md.
