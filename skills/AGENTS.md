# SKILLS KNOWLEDGE BASE

## OVERVIEW

`skills/` contains agent-facing workflows shipped with the Anki template project. It is not runtime code; it defines when agents should maintain the template versus author cards.

## STRUCTURE

```text
skills/
├── anki-open-template/
│   ├── SKILL.md
│   └── agents/openai.yaml
├── guided-concept-learning/
│   ├── SKILL.md
│   └── agents/openai.yaml
├── anki-card-authoring/
│   ├── SKILL.md
│   └── agents/openai.yaml
└── rigorous-anki-card-authoring/
    ├── SKILL.md
    └── agents/openai.yaml
```

## SKILL SELECTION

| User intent | Skill | Boundary |
|-------------|-------|----------|
| Fix or extend template behavior | `anki-open-template` | `src/`, `templates/`, `styles.css`, build, APKG validation. |
| Debug Anki client rendering | `anki-open-template` | Cross-client compatibility and generated inline HTML. |
| Learn a concept or audit a definition | `guided-concept-learning` | Explain and validate concepts; do not create cards. |
| Create or revise cards directly | `anki-card-authoring` | Lightweight path for quick card work; use the simplest effective card type. |
| Convert material through an audited design process | `rigorous-anki-card-authoring` | Work section by section; self-audit the text card plan and obtain explicit user approval before scripts or APKG output. |

## MAINTENANCE BOUNDARIES

- `anki-open-template` is for developers/maintainers. It may mention source files, generated HTML, storage, build commands, APKG generation, and manual regression checks.
- `guided-concept-learning` is for concept teaching and definition audits. It stops before card design or creation.
- `anki-card-authoring` is the lightweight direct-authoring path. It should not expose runtime storage keys, generated HTML structure, or build internals unless explicitly asked.
- `rigorous-anki-card-authoring` is the approval-gated path for high-rigor card design. For each section, it must present and self-audit the text card plan, then wait for explicit user approval before writing scripts or producing APKG files.
- The shared interface between card-authoring skills is the 9-field card contract: `id`, `type`, `question`, `options`, `answer`, `notes`, `extra`, `audio`, `occlusion_image`.
- Template-level concerns flow to `anki-open-template`; card-content concerns flow to `anki-card-authoring` for direct work or `rigorous-anki-card-authoring` for the audited, approval-gated process.
- Repository card additions must keep script data, manual docs, and skill guidance in sync; do not touch runtime/build files unless card behavior changes.

## FILE CONVENTIONS

- Each skill directory name matches `SKILL.md` frontmatter `name`.
- `SKILL.md` frontmatter `description` is the invocation trigger; keep it specific and task-oriented.
- `SKILL.md` body is execution guidance; keep it concrete, not marketing copy.
- `agents/openai.yaml` is a separate agent-system surface with `version`, `display_name`, `short_description`, and `default_prompt`.
- Skills are independent; do not create hidden import/state coupling between skill folders.

## AUTHORING CONTRACT

- Choice cards: `options` joined with `||`; `answer` uses 1-based option indices such as `1` or `1||3||5`.
- Choice distractors must be plausible and must not leak answer patterns, such as the correct option being much longer than the wrong options.
- QA cards: `options` is empty; `answer` is a plain-text reference answer, including literal angle-bracket syntax such as `std::vector<int>`.
- Fill cards: cloze syntax in `question`; canonical answers joined with `||`; `::` is reserved for the cloze answer/hint separator.
- Occlusion cards: `occlusion_image` contains rendered `<img>` HTML; strict `extra` JSON contains the logical `image` filename/id and `masks`; mask labels are plain text.
- Mindmap cards: strict `extra` JSON contains the `mindmap` node tree; node text is plain text.
- Audio cards: usually QA cards with `[sound:file.ext]` in `audio`.
- Regression or edge-case cards use the `R` id prefix unless the user gives another scheme.

## ANTI-PATTERNS

- Do not make the card-authoring skill explain front/back template architecture by default.
- Do not let template maintenance guidance leak into simple card output.
- Do not add a new skill without a clear audience split and invocation description.
- Do not change field contract wording in one skill without checking the other skill, README, and TEST_DATA.md.
