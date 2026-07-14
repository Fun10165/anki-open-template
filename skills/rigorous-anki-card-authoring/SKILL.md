---
name: rigorous-anki-card-authoring
description: Use when the user wants carefully audited, iteratively designed Anki cards from study material, with explicit concept coverage, prerequisite bridges, source grounding, per-card seven-principle audits, and approval before repository or APKG changes. Use anki-card-authoring instead for quick or lightweight card work.
---

# Rigorous Anki Card Authoring

Design a small, coherent section of cards, prove their quality in text, and obtain the user's explicit approval before implementing them. This is the rigorous alternative to `anki-card-authoring`; do not use it merely to produce a quick batch.

## Non-negotiable boundary

Work in two phases:

1. **Text planning and audit:** inspect the source, inventory the section, draft every card completely, self-correct, and show the audited plan.
2. **Repository/APKG implementation:** only after the audited plan has passed all checks **and the user explicitly confirms that section and draft version**.

Before that confirmation, do not edit or create generation scripts, insert card data into repository scripts, run packaging, or create/overwrite an APKG. An initial request to “make cards” or “produce an APKG” is not approval of drafts the user has not yet seen. Silence is not approval. If later feedback changes card substance, re-run the audits and obtain confirmation again before implementation.

Never plan many sections or a very large card batch at once. Select one natural section and a reviewable number of cards; finish its plan, audit, confirmation, and implementation before moving to the next section.

## The seven principles

Apply every principle to every card. A later principle never excuses violating Principles 1 or 2.

### 1. Context independence

- A card must remain understandable when shown alone, out of source order and without neighboring cards.
- Qualify ambiguous abbreviations, symbols, pronouns, and generic nouns with a compact domain label or full name, for example `[TCP 拥塞控制]` rather than an isolated “窗口”.
- Include only the minimum context needed to identify the intended domain and task.
- Phrase the prompt so a knowledgeable reviewer can judge the answer uniquely. Eliminate hidden assumptions, multiple defensible interpretations, and answers whose required granularity is unclear.
- Make time, version, jurisdiction, model, or source scope explicit whenever it changes the answer.

### 2. Minimum information

- Test one retrievable fact or one indivisible reasoning step per card. In particular, each QA card asks for one fact and expects one short answer.
- Do not ask for a multi-item list merely because the source presents an enumeration. Split it into one card per item, using that item's distinctive role, trigger, contrast, consequence, or example as the cue.
- Keep prompts and expected answers short. Put optional explanation outside the tested answer.
- Use the user's explicitly preferred language; otherwise follow the language used by the user or source. For Chinese users or source material, write concise, natural Chinese instead of unnecessary English labels, boilerplate, or verbose translated prose.
- Preserve canonical technical English, code, and symbols. Introduce an English term once in parentheses only when it improves precision or future recognition; do not make every term bilingual.
- Optimize learner-visible text for fast mobile review: keep fronts, answers, and notes compact, and avoid needless line breaks, stacked fragments, or layout-driven repetition.
- Split multi-clause and multi-fact answers. If an answer contains “and”, a semicolon, several bullets, or several independent grading units, assume it needs splitting unless those parts form one indivisible relation.
- Prefer an image or image occlusion when spatial, visual, anatomical, diagrammatic, or appearance-based recognition is the actual learning objective.
- Avoid true/false framing: it encourages recognition and guessing rather than precise recall.
- Never make a card broad merely to reduce card count.

### 3. Grounding

- Ground every falsifiable claim that is not a high-confidence formal fact.
- Record a usable source (author/organization and title, with URL, section, page, or other locator when available) and a time marker appropriate to the claim (publication/update date, version, effective period, or access date).
- Tie the source and time marker to the exact claim; do not attach a generic bibliography that leaves provenance ambiguous.
- Formal definitions, proved mathematics, and similarly stable high-confidence facts may omit repetitive citations, but uncertainty about stability means the claim must be grounded.
- Do not convert an unsupported source statement into a stronger or timeless claim.

### 4. Importance

- Assign each planned card an explicit importance level, such as high, medium, or low, with a one-line reason based on usefulness, frequency, risk, prerequisite value, or user goals.
- Importance controls emphasis and review priority, not whether a necessary card exists.
- Keep low-priority cards when they close a prerequisite, disambiguate a concept, or make an important chain complete. Do not delete them merely to make the deck look lean.
- Importance is planning metadata, not a new field in the project's card schema.

### 5. Connectivity

- Connect each target to its prerequisites and motivation: what must already be known, why the fact matters, and where it is used.
- State the logic chain for every card. A useful shape is `prerequisite → cue/condition → inference or relation → target answer → consequence/use`.
- Inspect adjacent chains for gaps. If a learner must silently supply a concept or a nontrivial inference, add a concise explanation or an atomic prerequisite/bridge card.
- Prefer cards that create meaningful retrieval paths rather than isolated trivia, while keeping each card independently understandable and atomic.

### 6. Cloze preference

- Prefer cloze when it removes boilerplate question wording and leaves a natural, unambiguous sentence.
- Cloze only the smallest meaningful answer span and retain enough domain context for unique recall.
- Do not use cloze to hide several independent facts, an entire list, or so much text that the learner can answer from grammar or sentence shape alone.
- Use QA, choice, image, or another form when cloze would weaken judging, understanding, or cue quality.

### 7. Controlled redundancy

- Add redundancy only when it creates a distinct retrieval route: reversible translation, a second semantic formulation, a contrast, or a separate reasoning cue/step.
- Put each direction or formulation on its own atomic, context-independent card; do not combine both directions or several reasoning steps into one answer.
- For reversible translation, test both `A → B` and `B → A` only when both directions matter and each has a unique answer.
- For reasoning, separate cues and intermediate steps when they are independently useful or too long to remain implicit.
- Do not create cosmetic paraphrases with the same cue, duplicate facts without a retrieval purpose, or redundancy that violates Principles 1–2.

## Choice-card and distractor quality

Use choice only when recognition or discrimination is the objective, not as an easier substitute for recall.

- Every distractor must be plausible to a learner with a specific misconception, and belong to the same conceptual category and granularity as the answer.
- Keep options parallel in grammar, style, precision, and approximate length. Remove lexical overlap, copied source phrases, formatting, absolutes, or unusual detail that points to the answer.
- Do not use nonsense, category errors, obviously false statements, mutually redundant options, or distractors disproved by surface inspection.
- Ensure no distractor is arguably correct under a reasonable interpretation. State whether multiple selections are allowed and make the keyed set uniquely judgeable.
- Avoid “all/none of the above” unless the learning objective genuinely requires it.
- Vary and balance answer position across a set; do not introduce a predictable position or length pattern.
- In the audit, explain the misconception targeted by each distractor and why no surface cue reveals the key.

## Section workflow

### 1. Scope one section

Choose one source section with a coherent objective. State its boundaries and defer later sections. If the source is large, do not silently draft the whole source.

### 2. Build a textual inventory

Before any implementation, list:

- the section's learning objectives;
- all explicit concepts, claims, terms, symbols, abbreviations, examples, contrasts, and enumerated items;
- implied prerequisites and motivations;
- claims needing source/time grounding;
- likely logical gaps or long implicit reasoning;
- proposed atomic cards and their importance.

The inventory is a coverage map, not card code. It must make omissions visible.

### 3. Draft complete cards

Write the full learner-visible content for every proposed card: card type, domain-qualified prompt or cloze, exact expected answer, concise explanation/notes when needed, sources/time markers when required, and all choice options with the key when applicable. Use the preferred/source language and a compact, mobile-scannable layout. Drafts must be complete enough that approval fixes the actual content, not merely titles or intentions.

During planning, do not expose repository field arrays, helper calls, script structure, or packaging internals unless the user asks for them or they are needed to resolve a content decision.

### 4. Audit every card with the required template

Immediately after **each** card, output:

```text
Card <ID or planning label>
- Type:
- Importance + reason:
- Prompt/cloze/options:
- Expected answer:
- Explanation/grounding (source + time marker when required):

Checks 1–7
1. Context independence — [符合/不符合]: check every sub-rule separately: domain labels, standalone context, ambiguity, unique grading, and scope/time/version qualifiers; give a detailed card-specific reason for each.
2. Minimum information — [符合/不符合]: check every sub-rule separately: one fact/step, enumeration splitting, prompt/answer length, preferred/source language, concise natural Chinese where applicable, justified retention of technical English/code/symbols or a one-time bilingual term, mobile scanability with no needless line breaks or fragmented layout, image suitability, no true/false framing, and no multi-fact answer; give a detailed reason for each.
3. Grounding — [符合/不符合]: classify the claim and give its exact source and time marker, or explain precisely why it is a stable high-confidence formal fact.
4. Importance — [符合/不符合]: state the level and detailed reason, including whether a necessary low-priority role is preserved.
5. Connectivity — [符合/不符合]: check prerequisites, prior motivation card or motivation statement, downstream use, and every required bridge; give a detailed reason for each.
6. Cloze — [符合/不符合]: check whether cloze is the leanest unambiguous form, whether only a small answer span is hidden, and whether grammar leaks the answer.
7. Controlled redundancy — [符合/不符合]: identify the distinct retrieval route and counterpart, or why no redundancy is needed; separately confirm that Principles 1–2 remain intact.

All concepts mentioned
- Every concept appearing anywhere in the prompt, answer, options/distractors, explanation, source framing, or required reasoning—not only the main concept.
- For each concept: already explained / common prerequisite / requires explanation or bridge card. Even when treated as a common prerequisite, introduce it briefly before first use; a concept may not appear unexplained merely because the author assumes the reader once learned it.

Logic chain
- prerequisite → cue/condition → inference/relation → target answer → consequence/use

Choice-only distractor audit
- For each distractor: intended misconception, plausibility, category/granularity match, and why it has no answer-revealing surface cue.
```

Mark every principle and each of its sub-rules explicitly as `符合` or `不符合`, then give detailed card-specific evidence; a bare pass label is never enough. Do not summarize concepts once for the batch; list them after every card.

### 5. Self-iterate to compliance

Compare the inventory with all per-card concept lists and logic chains. Detect:

- unexplained or ambiguously scoped concepts;
- inventory concepts with no justified coverage;
- missing prerequisites or motivation;
- hidden multi-fact answers and un-split enumerations;
- missing, important, or overly long implicit reasoning;
- unsupported or time-sensitive claims;
- redundant cards without distinct retrieval routes;
- clozes or distractors that leak the answer.

Revise cards, add explanations, or add atomic prerequisite/bridge cards. Then regenerate the affected per-card audits. Repeat until the plan is internally compliant; never present a known violation as something the user must discover.

### 6. Run a hostile audit

After the ordinary audit passes, review the whole section while deliberately assuming that Principles **1, 2, and 5** and concept coverage have been violated. Try to break it by asking:

- What context would disappear if this card were shuffled into another deck?
- Can two knowledgeable graders disagree about the expected answer?
- Does any prompt or answer test more than one fact, list, or inference step?
- Does the learner-visible language match the user's preference/source, and can the card be scanned quickly on mobile without needless English, verbosity, or fragmented line breaks?
- Is any word, symbol, distractor, or explanatory concept used without qualification or prerequisite support?
- Does a learner need to make an unstated, important, or long inference?
- Is the motivation or downstream use missing from the chain?
- Does every inventory item have explicit coverage or a stated reason for exclusion?

Report concrete attacks and corrections. If a correction changes a card, update that card and its full audit, then rerun the hostile audit. “No issues” is acceptable only after showing what was attacked.

### 7. Request explicit confirmation

Present only the fully revised section plan and ask the user to approve that named section/version for implementation. Do not imply that repository or APKG work has started. Approval must follow the completed ordinary and hostile audits.

### 8. Implement only the approved section

After explicit approval, map approved content to the existing 9-field contract, without adding fields:

`id`, `type`, `question`, `options`, `answer`, `notes`, `extra`, `audio`, `occlusion_image`.

For repository work, follow the existing `scripts/generate_*_apkg.py` conventions and reuse the project's `note()` and `write_deck()` patterns rather than inventing another generator path. Preserve strict JSON requirements where relevant. Implement only the approved section and validate its generated artifact according to repository guidance.

Keep planning metadata such as the seven-part audit, concept lists, logic chains, and importance outside the 9-field card schema unless the user explicitly wants selected learner-facing material in `notes`.

## Completion rules

- A section is not ready for approval until every card has a complete draft, detailed 1–7 audit, exhaustive concept list, logic chain, and any choice distractor audit.
- A section is not ready for implementation until both the ordinary self-audit and hostile audit pass and the user explicitly confirms it.
- Approval for one section never authorizes later sections.
- Do not trade coverage for a smaller count; add necessary low-priority prerequisite or bridge cards while keeping every card atomic.
- Use `anki-card-authoring` instead when the user explicitly wants fast, lightweight card creation without this audit-and-confirmation workflow.
