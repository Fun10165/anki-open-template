export interface TemplateFields {
  id: string;
  type: string;
  question: string;
  options: string;
  answer: string;
  notes: string;
  extra: string;
  audio: string;
  occlusionImage: string;
  tags: string;
  deck: string;
}

export interface CardData {
  id: string;
  kind: "choice" | "qa" | "fill" | "occlusion" | "mindmap";
  question: string;
  options: string[];
  answers: string[];
  notes: string;
  extra: Record<string, unknown>;
  audio: string;
  occlusionImage: string;
  tags: string[];
  deck: string;
  label: string;
}

export interface Settings {
  showType: boolean;
  showDeck: boolean;
  showNotesFront: boolean;
  autoFlip: boolean;
  randomOptions: boolean;
  choiceStats: boolean;
  fillMode: "line" | "box" | "mask";
  occlusionOrder: "tb-lr" | "lr-tb";
  theme: "warm" | "mint" | "slate";
}

export interface ClozeToken {
  answer: string;
  hint: string;
}

export interface Mask {
  id?: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  label?: string;
}

export interface MindmapNode {
  text?: string;
  children?: MindmapNode[];
}

export const DEFAULT_SETTINGS: Settings = {
  showType: true,
  showDeck: false,
  showNotesFront: true,
  autoFlip: true,
  randomOptions: false,
  choiceStats: true,
  fillMode: "line",
  occlusionOrder: "tb-lr",
  theme: "warm",
};

export const STORAGE_KEYS = {
  settings: "AAS-SETTINGS",
  selectedPrefix: "AAS-SELECTED-",
  fillPrefix: "AAS-FILL-",
  occlusionPrefix: "AAS-OCCLUSION-",
  orderPrefix: "AAS-ORDER-",
};

const OPEN_BRACE = String.fromCharCode(123);
const CLOSE_BRACE = String.fromCharCode(125);
const CLOZE_START = `${OPEN_BRACE}${OPEN_BRACE}c`;
const CLOZE_END = `${CLOSE_BRACE}${CLOSE_BRACE}`;

export function trim(value: unknown): string {
  return String(value ?? "").replace(/^\s+|\s+$/g, "");
}

function getText(id: string): string {
  const element = document.getElementById(id);
  return element ? element.textContent || "" : "";
}

function cloneHtmlWithResolvedImages(element: HTMLElement): string {
  const clone = element.cloneNode(true) as HTMLElement;
  const originalImages = element.querySelectorAll<HTMLImageElement>("img[src]");
  const cloneImages = clone.querySelectorAll<HTMLImageElement>("img[src]");
  for (let index = 0; index < originalImages.length; index += 1) {
    const cloneImage = cloneImages[index];
    const originalImage = originalImages[index];
    if (!cloneImage || !originalImage) {
      continue;
    }
    cloneImage.setAttribute("src", originalImage.src || originalImage.getAttribute("src") || "");
  }
  return clone.innerHTML || "";
}

function getHtml(id: string): string {
  const element = document.getElementById(id);
  return element ? cloneHtmlWithResolvedImages(element as HTMLElement) : "";
}

export function readFields(): TemplateFields {
  return {
    id: trim(getText("raw-id")) || "0",
    type: trim(getText("raw-type")),
    question: getHtml("raw-question"),
    options: getHtml("raw-options"),
    answer: trim(getText("raw-answer")),
    notes: getHtml("raw-notes"),
    extra: trim(getText("raw-extra")),
    audio: trim(getHtml("raw-audio")),
    occlusionImage: getHtml("raw-occlusion-image"),
    tags: trim(getText("raw-tags")),
    deck: trim(getText("raw-deck")),
  };
}

export function parseJSON<T>(value: string, fallback: T): T {
  try {
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function loadSettings(): Settings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.settings);
    const parsed = parseJSON<Partial<Settings>>(raw || "", {});
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: Settings): void {
  try {
    window.localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  } catch {
    // Ignore storage failures in restrictive environments.
  }
}

export function loadSessionState(prefix: string, cardId: string, fallback: string): string {
  try {
    const value = window.sessionStorage.getItem(prefix + cardId);
    return value == null ? fallback : value;
  } catch {
    return fallback;
  }
}

export function saveSessionState(prefix: string, cardId: string, value: string): void {
  try {
    window.sessionStorage.setItem(prefix + cardId, value);
  } catch {
    // Ignore storage failures in restrictive environments.
  }
}

export function clearSessionState(prefix: string, cardId: string): void {
  try {
    window.sessionStorage.removeItem(prefix + cardId);
  } catch {
    // Ignore storage failures in restrictive environments.
  }
}

export function clearReviewState(cardId: string): void {
  clearSessionState(STORAGE_KEYS.selectedPrefix, cardId);
  clearSessionState(STORAGE_KEYS.fillPrefix, cardId);
  clearSessionState(STORAGE_KEYS.occlusionPrefix, cardId);
  clearSessionState(STORAGE_KEYS.orderPrefix, cardId);
}

export function splitItems(value: string): string[] {
  const normalized = trim(value);
  if (!normalized) {
    return [];
  }
  if (normalized.indexOf("||") > -1) {
    return normalized.split("||").map((item) => trim(item)).filter(Boolean);
  }
  return normalized.split("\n").map((item) => trim(item)).filter(Boolean);
}

export function normalizeType(rawType: string, fields: TemplateFields, extra: Record<string, unknown>): CardData["kind"] {
  const value = trim(rawType).toLowerCase();
  if (value === "choice" || value === "single" || value === "multiple" || value === "选择题") {
    return "choice";
  }
  if (value === "fill" || value === "cloze" || value === "填空题") {
    return "fill";
  }
  if (value === "occlusion" || value === "mixed" || value === "挖空混合" || value === "图片遮挡") {
    return "occlusion";
  }
  if (value === "mindmap" || value === "思维导图") {
    return "mindmap";
  }
  if (trim(fields.options)) {
    return "choice";
  }
  if (fields.question.indexOf(CLOZE_START) > -1) {
    return "fill";
  }
  if (typeof extra.image === "string" && Array.isArray(extra.masks)) {
    return "occlusion";
  }
  if (Array.isArray(extra.mindmap)) {
    return "mindmap";
  }
  return "qa";
}

export function typeLabel(kind: CardData["kind"], answers: string[]): string {
  if (kind === "choice") {
    return answers.length > 1 ? "多选题" : "单选题";
  }
  if (kind === "fill") {
    return "填空题";
  }
  if (kind === "occlusion") {
    return "图片遮挡";
  }
  if (kind === "mindmap") {
    return "思维导图";
  }
  return "问答题";
}

export function normalizeCard(fields: TemplateFields): CardData {
  const extra = parseJSON<Record<string, unknown>>(fields.extra, {});
  const answers = splitItems(fields.answer);
  const kind = normalizeType(fields.type, fields, extra);
  return {
    id: fields.id,
    kind,
    question: fields.question,
    options: splitItems(fields.options),
    answers,
    notes: fields.notes,
    extra,
    audio: fields.audio,
    occlusionImage: fields.occlusionImage,
    tags: fields.tags ? fields.tags.split(" ").map((item) => trim(item)).filter(Boolean) : [],
    deck: fields.deck,
    label: typeLabel(kind, answers),
  };
}

export function setTheme(theme: Settings["theme"]): void {
  document.documentElement.setAttribute("data-theme", theme);
}

export function byId<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Missing element: ${id}`);
  }
  return element as T;
}

export function listToFlagMap(items: string[]): Record<string, boolean> {
  const flags: Record<string, boolean> = {};
  items.forEach((item) => {
    if (item) {
      flags[item] = true;
    }
  });
  return flags;
}

export function flagMapToList(flags: Record<string, boolean>): string[] {
  return Object.keys(flags)
    .filter((key) => flags[key])
    .sort();
}

export function escapeAttribute(value: string): string {
  return value
    .split("&").join("&amp;")
    .split('"').join("&quot;")
    .split("<").join("&lt;")
    .split(">").join("&gt;");
}

export function convertMathDelimiters(text: string): string {
  let result = "";
  let index = 0;
  let inInline = false;
  let inBlock = false;
  while (index < text.length) {
    const current = text.charAt(index);
    const next = text.charAt(index + 1);
    if (current === "\\") {
      if (next === "$") {
        result += "$";
        index += 2;
        continue;
      }
      result += current;
      index += 1;
      continue;
    }
    if (current === "$" && next === "$" && !inInline) {
      result += inBlock ? "\\]" : "\\[";
      inBlock = !inBlock;
      index += 2;
      continue;
    }
    if (current === "$" && !inBlock) {
      result += inInline ? "\\)" : "\\(";
      inInline = !inInline;
      index += 1;
      continue;
    }
    result += current;
    index += 1;
  }
  return result;
}

export function normalizeMathHtml(html: string): string {
  if (!trim(html)) {
    return html;
  }
  const wrapper = document.createElement("div");
  wrapper.innerHTML = String(html || "");
  const walk = (node: Node): void => {
    let child = node.firstChild;
    while (child) {
      if (child.nodeType === Node.TEXT_NODE) {
        child.nodeValue = convertMathDelimiters(child.nodeValue || "");
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child);
      }
      child = child.nextSibling;
    }
  };
  walk(wrapper);
  return wrapper.innerHTML;
}

export function queueMathTypeset(ids: string[]): void {
  const globalMathJax = window as Window & {
    MathJax?: {
      startup?: { promise: Promise<unknown> };
      typesetClear?: () => void;
      typesetPromise?: (nodes: HTMLElement[]) => Promise<unknown>;
    };
  };
  try {
    const api = globalMathJax.MathJax;
    if (!api || !api.startup || !api.typesetPromise) {
      return;
    }
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node));
    if (!nodes.length) {
      return;
    }
    api.startup.promise
      .then(() => {
        if (api.typesetClear) {
          api.typesetClear();
        }
        return api.typesetPromise ? api.typesetPromise(nodes) : Promise.resolve();
      })
      .catch(() => {
        // Ignore MathJax failures and leave raw text visible.
      });
  } catch {
    // Ignore MathJax failures and leave raw text visible.
  }
}

export function collectClozeTokens(question: string): ClozeToken[] {
  const tokens: ClozeToken[] = [];
  let cursor = 0;
  while (cursor < question.length) {
    const start = question.indexOf(CLOZE_START, cursor);
    if (start === -1) {
      break;
    }
    const firstSep = question.indexOf("::", start);
    const end = question.indexOf(CLOZE_END, firstSep + 2);
    if (firstSep === -1 || end === -1) {
      break;
    }
    const content = question.substring(firstSep + 2, end);
    const secondSep = content.indexOf("::");
    tokens.push({
      answer: secondSep === -1 ? content : content.substring(0, secondSep),
      hint: secondSep === -1 ? "" : content.substring(secondSep + 2),
    });
    cursor = end + 2;
  }
  return tokens;
}

export function renderCloze(
  question: string,
  mode: "front" | "back",
  fillMode?: Settings["fillMode"],
  draft?: Record<string, string>,
): string {
  let html = "";
  let cursor = 0;
  let order = 0;
  while (cursor < question.length) {
    const start = question.indexOf(CLOZE_START, cursor);
    if (start === -1) {
      html += question.substring(cursor);
      break;
    }
    const firstSep = question.indexOf("::", start);
    const end = question.indexOf(CLOZE_END, firstSep + 2);
    if (firstSep === -1 || end === -1) {
      html += question.substring(cursor);
      break;
    }
    html += question.substring(cursor, start);
    const content = question.substring(firstSep + 2, end);
    const secondSep = content.indexOf("::");
    const answer = secondSep === -1 ? content : content.substring(0, secondSep);
    const hint = secondSep === -1 ? "" : content.substring(secondSep + 2);
    order += 1;
    if (mode === "back") {
      html += `<span class="inline-answer">${answer}</span>`;
    } else if (fillMode) {
      const value = draft?.[String(order)] || "";
      const placeholder = hint || "请输入";
      html += `<span class="fill-slot fill-slot-${fillMode}"><input class="fill-input" data-fill-index="${order}" value="${escapeAttribute(value)}" placeholder="${escapeAttribute(placeholder)}"></span>`;
    } else {
      html += `<span class="inline-blank">${hint || "请作答"}</span>`;
    }
    cursor = end + 2;
  }
  return normalizeMathHtml(html);
}

export function renderInlineCloze(question: string, mode: "front" | "back"): string {
  return renderCloze(question, mode);
}

export function revealAnswer(): void {
  const globalWindow = window as Window & {
    pycmd?: (message: string) => void;
    study?: { drawAnswer: () => void };
    showAnswer?: () => void;
    anki?: unknown;
    sendMessage2?: (channel: string, message: string) => void;
  };
  if (typeof globalWindow.pycmd === "function") {
    globalWindow.pycmd("ans");
    return;
  }
  if (globalWindow.study && typeof globalWindow.study.drawAnswer === "function") {
    globalWindow.study.drawAnswer();
    return;
  }
  if (typeof globalWindow.showAnswer === "function") {
    globalWindow.showAnswer();
    return;
  }
  if (globalWindow.anki && typeof globalWindow.sendMessage2 === "function") {
    globalWindow.sendMessage2("ankitap", "midCenter");
  }
}

export function mountAudio(container: HTMLElement, audioField: string): void {
  if (!trim(audioField)) {
    container.innerHTML = "";
    return;
  }
  container.innerHTML = `<div class="audio-player audio-player-native"><div class="audio-native-label">音频</div><div class="audio-native-body">${audioField}</div></div>`;
}

export function renderTags(tags: string[]): string {
  return tags.map((tag) => `<span class="tag-chip">${tag}</span>`).join("");
}

export function sortMasks(masks: Mask[], order: Settings["occlusionOrder"]): Mask[] {
  return [...masks].sort((left, right) => {
    if (order === "lr-tb") {
      return Number(left.x || 0) - Number(right.x || 0) || Number(left.y || 0) - Number(right.y || 0);
    }
    return Number(left.y || 0) - Number(right.y || 0) || Number(left.x || 0) - Number(right.x || 0);
  });
}
