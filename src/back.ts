import {
  STORAGE_KEYS,
  type Mask,
  type MindmapNode,
  byId,
  clearReviewState,
  collectClozeTokens,
  listToFlagMap,
  loadSessionState,
  loadSettings,
  mountAudio,
  normalizeCard,
  normalizeMathHtml,
  queueMathTypeset,
  readFields,
  renderCloze,
  renderInlineCloze,
  renderTags,
  setTheme,
  sortMasks,
  splitItems,
  trim,
} from "./shared";

interface ChoiceOption {
  key: string;
  label: string;
}

const card = normalizeCard(readFields());
const settings = loadSettings();
const selectedList = splitItems(loadSessionState(STORAGE_KEYS.selectedPrefix, card.id, ""));
const fillDraft = parseDraft(loadSessionState(STORAGE_KEYS.fillPrefix, card.id, "{}"));
const visibleMasks = listToFlagMap(splitItems(loadSessionState(STORAGE_KEYS.occlusionPrefix, card.id, "")));
const optionOrder = splitItems(loadSessionState(STORAGE_KEYS.orderPrefix, card.id, ""));

function parseDraft(raw: string): Record<string, string> {
  try {
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function renderHeader(): void {
  byId("card-id").textContent = `#${card.id}`;
  byId("card-type").textContent = settings.showType ? card.label : "";
  byId("deck-name").textContent = settings.showDeck ? card.deck : "";
  byId("tag-bar").innerHTML = renderTags(card.tags);
}

function renderPrompt(): void {
  byId("prompt").innerHTML = card.kind === "fill"
    ? renderCloze(card.question, "back")
    : normalizeMathHtml(card.question);
}

function letters(keys: string[]): string {
  return keys
    .map((key) => Number.parseInt(key, 10))
    .filter((value) => !Number.isNaN(value))
    .map((value) => String.fromCharCode(64 + value))
    .join(", ");
}

function getChoiceOrder(): ChoiceOption[] {
  const items = card.options.map((label, index) => ({ key: String(index + 1), label }));
  if (optionOrder.length !== items.length) {
    return items;
  }
  const arranged = optionOrder
    .map((key) => items.find((item) => item.key === key))
    .filter((item): item is ChoiceOption => Boolean(item));
  return arranged.length === items.length ? arranged : items;
}

function renderChoice(): void {
  const selected = listToFlagMap(selectedList);
  const answers = listToFlagMap(card.answers);
  let hits = 0;
  const html = getChoiceOrder()
    .map((option, index) => {
      let status = "未作答";
      let extraClass = "";
      const isSelected = Boolean(selected[option.key]);
      const isCorrect = Boolean(answers[option.key]);
      if (isCorrect && isSelected) {
        extraClass = " is-correct";
        status = "答对";
        hits += 1;
      } else if (isCorrect) {
        extraClass = " is-missed";
        status = "正确但未选";
      } else if (isSelected) {
        extraClass = " is-wrong";
        status = "误选";
      }
      return `<div class="option-card result-card${extraClass}"><span class="option-index">${String.fromCharCode(65 + index)}</span><span class="option-label">${normalizeMathHtml(option.label)}</span><span class="option-result">${status}</span></div>`;
    })
    .join("");
  byId("back-interaction").innerHTML = `<div class="option-list">${html}</div>`;
  byId("answer-summary").textContent = settings.choiceStats
    ? `正确答案：${letters(card.answers) || "未作答"} · 你的作答：${letters(selectedList) || "未作答"} · 命中：${hits}/${card.answers.length || 1}`
    : `正确答案：${letters(card.answers) || "未作答"}`;
}

function renderFill(): void {
  const rows = collectClozeTokens(card.question)
    .map((token, index) => {
      const value = fillDraft[String(index + 1)] || "";
      const matched = trim(value) === trim(token.answer);
      return `<div class="result-row"><span class="result-index">空${index + 1}</span><span class="result-user ${matched ? "is-correct" : "is-wrong"}">${value || "未填写"}</span><span class="result-answer">正确答案：${token.answer}</span></div>`;
    })
    .join("");
  byId("back-interaction").innerHTML = `<div class="result-list">${rows}</div>`;
  byId("answer-summary").textContent = "填空答案已回显";
}

function getOcclusionMasks(): Mask[] {
  const masks = Array.isArray(card.extra.masks) ? (card.extra.masks as Mask[]) : [];
  return sortMasks(masks, settings.occlusionOrder);
}

function renderOcclusion(): void {
  const masks = getOcclusionMasks();
  if (!trim(card.occlusionImage) || !masks.length) {
    byId("back-interaction").innerHTML = '<div class="info-card">图片遮挡数据无效，无法展示背面结果。</div>';
    byId("answer-summary").textContent = "遮挡数据无效";
    return;
  }
  const maskHtml = masks
    .map((mask, index) => {
      const id = String(mask.id || index + 1);
      const revealed = visibleMasks[id] ? " is-revealed" : "";
      return `<div class="occlusion-mask is-answer${revealed}" style="left:${Number(mask.x || 0)}%;top:${Number(mask.y || 0)}%;width:${Number(mask.w || 10)}%;height:${Number(mask.h || 10)}%;"><span>${mask.label || ""}</span></div>`;
    })
    .join("");
  byId("back-interaction").innerHTML = `<div class="occlusion-shell"><div class="occlusion-canvas">${card.occlusionImage}${maskHtml}</div></div>`;
  byId("answer-summary").textContent = "已显示全部遮挡区域";
}

function renderMindmapNode(node: MindmapNode): string {
  const children = Array.isArray(node.children) ? node.children : [];
  const toggle = children.length ? "▾" : "•";
  const childHtml = children.length
    ? `<ul class="mindmap-children">${children.map((child) => renderMindmapNode(child)).join("")}</ul>`
    : "";
  return `<li class="mindmap-node"><span class="mindmap-toggle">${toggle}</span><div class="mindmap-label">${renderInlineCloze(String(node.text || ""), "back")}</div>${childHtml}</li>`;
}

function renderMindmap(): void {
  const tree = Array.isArray(card.extra.mindmap) ? (card.extra.mindmap as MindmapNode[]) : [];
  byId("back-interaction").innerHTML = `<ul class="mindmap-root">${tree.map((node) => renderMindmapNode(node)).join("")}</ul>`;
  byId("answer-summary").textContent = "思维导图已展开";
}

function renderNotes(): void {
  const panel = byId("notes-panel");
  if (!trim(card.notes)) {
    panel.className = "notes-panel hidden";
    panel.innerHTML = "";
    return;
  }
  panel.className = "notes-panel";
  panel.innerHTML = `<div class="notes-title">解析 / 笔记</div><div class="notes-content">${normalizeMathHtml(card.notes)}</div>`;
}

function renderInteraction(): void {
  if (card.kind === "choice") {
    renderChoice();
    return;
  }
  if (card.kind === "fill") {
    renderFill();
    return;
  }
  if (card.kind === "occlusion") {
    renderOcclusion();
    return;
  }
  if (card.kind === "mindmap") {
    renderMindmap();
    return;
  }
  byId("back-interaction").innerHTML = `<div class="info-card">答案：${card.answers.join(" / ") || "请结合解析阅读"}</div>`;
  byId("answer-summary").textContent = card.answers.join(" / ") || "已翻到背面";
}

function main(): void {
  setTheme(settings.theme);
  renderHeader();
  renderPrompt();
  renderInteraction();
  renderNotes();
  mountAudio(byId("audio-panel"), card.audio);
  clearReviewState(card.id);
  queueMathTypeset(["prompt", "back-interaction", "notes-panel"]);
}

main();
