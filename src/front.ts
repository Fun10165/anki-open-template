import {
  STORAGE_KEYS,
  type Mask,
  type MindmapNode,
  type Settings,
  byId,
  flagMapToList,
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
  revealAnswer,
  saveSessionState,
  saveSettings,
  setTheme,
  sortMasks,
  splitItems,
  trim,
} from "./shared";

interface ChoiceOption {
  key: string;
  label: string;
}

interface FrontState {
  selectedMap: Record<string, boolean>;
  fillDraft: Record<string, string>;
  visibleMasks: Record<string, boolean>;
  optionOrder: string[];
}

const card = normalizeCard(readFields());
const settings = loadSettings();
const state: FrontState = {
  selectedMap: listToFlagMap(splitItems(loadSessionState(STORAGE_KEYS.selectedPrefix, card.id, ""))),
  fillDraft: parseDraft(loadSessionState(STORAGE_KEYS.fillPrefix, card.id, "{}")),
  visibleMasks: listToFlagMap(splitItems(loadSessionState(STORAGE_KEYS.occlusionPrefix, card.id, ""))),
  optionOrder: splitItems(loadSessionState(STORAGE_KEYS.orderPrefix, card.id, "")),
};

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
  const prompt = byId("prompt");
  prompt.innerHTML = card.kind === "fill"
    ? renderCloze(card.question, "front", settings.fillMode, state.fillDraft)
    : normalizeMathHtml(card.question);
}

function persistSelectedMap(): void {
  saveSessionState(STORAGE_KEYS.selectedPrefix, card.id, flagMapToList(state.selectedMap).join("||"));
}

function countSelected(): number {
  return flagMapToList(state.selectedMap).length;
}

function getChoiceOrder(): ChoiceOption[] {
  const items = card.options.map((label, index) => ({ key: String(index + 1), label }));
  if (!settings.randomOptions) {
    return items;
  }
  if (state.optionOrder.length === items.length) {
    const arranged = state.optionOrder
      .map((key) => items.find((item) => item.key === key))
      .filter((item): item is ChoiceOption => Boolean(item));
    if (arranged.length === items.length) {
      return arranged;
    }
  }
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  state.optionOrder = shuffled.map((item) => item.key);
  saveSessionState(STORAGE_KEYS.orderPrefix, card.id, state.optionOrder.join("||"));
  return shuffled;
}

function bindChoiceButtons(): void {
  document.querySelectorAll<HTMLElement>("[data-option-key]").forEach((button) => {
    button.onclick = () => {
      const key = button.getAttribute("data-option-key") || "";
      if (!key) {
        return;
      }
      if (card.answers.length > 1) {
        state.selectedMap[key] = !state.selectedMap[key];
      } else {
        state.selectedMap = { [key]: true };
      }
      persistSelectedMap();
      renderChoice();
      if (settings.autoFlip && countSelected() === (card.answers.length || 1)) {
        revealAnswer();
      }
    };
  });
}

function renderChoice(): void {
  const options = getChoiceOrder();
  const html = options
    .map((option, index) => {
      const selectedClass = state.selectedMap[option.key] ? " selected-option" : "";
      return `<button class="option-card${selectedClass}" type="button" data-option-key="${option.key}"><span class="option-index">${String.fromCharCode(65 + index)}</span><span class="option-label">${normalizeMathHtml(option.label)}</span></button>`;
    })
    .join("");
  byId("front-interaction").innerHTML = `<div class="option-list">${html}</div>`;
  byId("front-controls").innerHTML = "";
  bindChoiceButtons();
}

function persistFillDraft(): void {
  const draft: Record<string, string> = {};
  document.querySelectorAll<HTMLInputElement>(".fill-input").forEach((input) => {
    const index = input.getAttribute("data-fill-index") || "";
    if (index) {
      draft[index] = input.value;
    }
  });
  state.fillDraft = draft;
  saveSessionState(STORAGE_KEYS.fillPrefix, card.id, JSON.stringify(draft));
}

function bindFillInputs(): void {
  document.querySelectorAll<HTMLInputElement>(".fill-input").forEach((input) => {
    input.oninput = () => {
      persistFillDraft();
    };
    input.onkeydown = (event) => {
      if (event.key === "Enter") {
        persistFillDraft();
        if (settings.autoFlip) {
          revealAnswer();
        }
      }
    };
  });
}

function renderFillControls(): void {
  byId("front-interaction").innerHTML = '<div class="info-card">填写答案后，可点击检查或直接翻到背面。</div>';
  byId("front-controls").innerHTML = '<button class="ghost-button" type="button" id="fill-submit">检查填写</button><button class="ghost-button" type="button" id="fill-clear">清空输入</button>';
  byId<HTMLElement>("fill-submit").onclick = () => {
    persistFillDraft();
    if (settings.autoFlip) {
      revealAnswer();
    }
  };
  byId<HTMLElement>("fill-clear").onclick = () => {
    state.fillDraft = {};
    saveSessionState(STORAGE_KEYS.fillPrefix, card.id, "{}");
    renderPrompt();
    bindFillInputs();
  };
  bindFillInputs();
}

function getOcclusionMasks(): Mask[] {
  const masks = Array.isArray(card.extra.masks) ? (card.extra.masks as Mask[]) : [];
  return sortMasks(masks, settings.occlusionOrder);
}

function persistVisibleMasks(masks: Mask[]): void {
  const visible = masks
    .map((mask, index) => String(mask.id || index + 1))
    .filter((id) => state.visibleMasks[id]);
  saveSessionState(STORAGE_KEYS.occlusionPrefix, card.id, visible.join("||"));
}

function bindOcclusionButtons(masks: Mask[]): void {
  document.querySelectorAll<HTMLElement>("[data-mask-id]").forEach((button) => {
    button.onclick = () => {
      const id = button.getAttribute("data-mask-id") || "";
      if (!id) {
        return;
      }
      state.visibleMasks[id] = !state.visibleMasks[id];
      persistVisibleMasks(masks);
      renderOcclusion();
    };
  });
  byId<HTMLElement>("mask-next").onclick = () => {
    for (let index = 0; index < masks.length; index += 1) {
      const id = String(masks[index].id || index + 1);
      if (!state.visibleMasks[id]) {
        state.visibleMasks[id] = true;
        break;
      }
    }
    persistVisibleMasks(masks);
    renderOcclusion();
  };
  byId<HTMLElement>("mask-toggle").onclick = () => {
    const allShown = masks.every((mask, index) => state.visibleMasks[String(mask.id || index + 1)]);
    state.visibleMasks = {};
    if (!allShown) {
      masks.forEach((mask, index) => {
        state.visibleMasks[String(mask.id || index + 1)] = true;
      });
    }
    persistVisibleMasks(masks);
    renderOcclusion();
  };
}

function renderOcclusion(): void {
  const masks = getOcclusionMasks();
  if (!trim(card.occlusionImage) || !masks.length) {
    byId("front-interaction").innerHTML = '<div class="info-card">图片遮挡数据无效，已跳过交互渲染。</div>';
    byId("front-controls").innerHTML = "";
    return;
  }
  const maskHtml = masks
    .map((mask, index) => {
      const id = String(mask.id || index + 1);
      const revealed = state.visibleMasks[id] ? " is-revealed" : "";
      return `<button class="occlusion-mask${revealed}" type="button" data-mask-id="${id}" style="left:${Number(mask.x || 0)}%;top:${Number(mask.y || 0)}%;width:${Number(mask.w || 10)}%;height:${Number(mask.h || 10)}%;"><span>${mask.label || ""}</span></button>`;
    })
    .join("");
  byId("front-interaction").innerHTML = `<div class="occlusion-shell"><div class="occlusion-canvas">${card.occlusionImage}${maskHtml}</div></div>`;
  byId("front-controls").innerHTML = '<button class="ghost-button" type="button" id="mask-next">显示下一个挖空</button><button class="ghost-button" type="button" id="mask-toggle">切换全部遮挡</button>';
  bindOcclusionButtons(masks);
}

function renderMindmapNode(node: MindmapNode): string {
  const children = Array.isArray(node.children) ? node.children : [];
  const toggle = children.length ? "▸" : "•";
  const childHtml = children.length
    ? `<ul class="mindmap-children">${children.map((child) => renderMindmapNode(child)).join("")}</ul>`
    : "";
  return `<li class="mindmap-node"><button class="mindmap-toggle" type="button">${toggle}</button><div class="mindmap-label">${renderInlineCloze(String(node.text || ""), "front")}</div>${childHtml}</li>`;
}

function bindMindmapButtons(): void {
  document.querySelectorAll<HTMLElement>(".mindmap-toggle").forEach((button) => {
    button.onclick = () => {
      const node = button.parentElement;
      if (node) {
        node.classList.toggle("is-collapsed");
      }
    };
  });
}

function renderMindmap(): void {
  const tree = Array.isArray(card.extra.mindmap) ? (card.extra.mindmap as MindmapNode[]) : [];
  byId("front-interaction").innerHTML = `<ul class="mindmap-root">${tree.map((node) => renderMindmapNode(node)).join("")}</ul>`;
  byId("front-controls").innerHTML = "";
  bindMindmapButtons();
}

function renderNotes(): void {
  const notes = byId("front-notes");
  if (!settings.showNotesFront || !trim(card.notes)) {
    notes.className = "notes-panel notes-panel-front hidden";
    notes.innerHTML = "";
    return;
  }
  notes.className = "notes-panel notes-panel-front";
  notes.innerHTML = `<div class="notes-title">解析 / 笔记</div><div class="notes-content">${normalizeMathHtml(card.notes)}</div>`;
}

function bindBooleanSetting(
  id: string,
  key: "showType" | "showDeck" | "showNotesFront" | "autoFlip" | "randomOptions" | "choiceStats",
): void {
  const input = byId<HTMLInputElement>(id);
  input.checked = settings[key];
  input.onchange = () => {
    settings[key] = input.checked;
    saveSettings(settings);
    if (key === "randomOptions") {
      state.optionOrder = [];
      saveSessionState(STORAGE_KEYS.orderPrefix, card.id, "");
    }
    renderAll();
  };
}

function bindSelectSetting(id: string, key: "fillMode" | "occlusionOrder" | "theme"): void {
  const input = byId<HTMLSelectElement>(id);
  input.value = settings[key];
  input.onchange = () => {
    if (key === "fillMode") {
      settings.fillMode = input.value as Settings["fillMode"];
    } else if (key === "occlusionOrder") {
      settings.occlusionOrder = input.value as Settings["occlusionOrder"];
    } else {
      settings.theme = input.value as Settings["theme"];
    }
    saveSettings(settings);
    renderAll();
  };
}

function bindSettings(): void {
  byId<HTMLElement>("settings-trigger").onclick = () => {
    byId("settings-modal").className = "modal";
  };
  byId<HTMLElement>("settings-close").onclick = () => {
    byId("settings-modal").className = "modal hidden";
  };
  bindBooleanSetting("setting-show-type", "showType");
  bindBooleanSetting("setting-show-deck", "showDeck");
  bindBooleanSetting("setting-show-notes-front", "showNotesFront");
  bindBooleanSetting("setting-auto-flip", "autoFlip");
  bindBooleanSetting("setting-random-options", "randomOptions");
  bindBooleanSetting("setting-choice-stats", "choiceStats");
  bindSelectSetting("setting-fill-mode", "fillMode");
  bindSelectSetting("setting-occlusion-order", "occlusionOrder");
  bindSelectSetting("setting-theme", "theme");
}

function bindSpaceFlip(): void {
  document.onkeydown = (event) => {
    const target = event.target as HTMLElement | null;
    const tagName = target?.tagName.toLowerCase() || "";
    if (tagName === "input" || tagName === "textarea") {
      return;
    }
    if (event.keyCode === 32) {
      if (typeof event.preventDefault === "function") {
        event.preventDefault();
      } else {
        event.returnValue = false;
      }
      revealAnswer();
    }
  };
}

function renderInteraction(): void {
  if (card.kind === "choice") {
    renderChoice();
    return;
  }
  if (card.kind === "fill") {
    renderFillControls();
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
  byId("front-interaction").innerHTML = '<div class="info-card">按空格或显示答案翻到背面。</div>';
  byId("front-controls").innerHTML = "";
}

function renderAll(): void {
  setTheme(settings.theme);
  renderHeader();
  renderPrompt();
  renderInteraction();
  renderNotes();
  mountAudio(byId("audio-panel"), card.audio);
  queueMathTypeset(["prompt", "front-interaction", "front-notes"]);
}

function main(): void {
  bindSettings();
  bindSpaceFlip();
  renderAll();
}

main();
