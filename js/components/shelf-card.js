import { energyTone, iconForShelf, priorityTone } from "../data-model.js";
import { escapeHtml } from "../utils/html.js";

export function renderShelfCard(shelf, options = {}) {
  const mode = options.mode || "compact";
  const icon = iconForShelf(shelf);
  return `
    <article class="shelf-card shelf-card-${mode}" data-shelf-card="${escapeHtml(shelf.id)}">
      <span class="shelf-avatar-frame">
        <img class="shelf-avatar" src="${icon}" alt="" loading="lazy" />
      </span>
      <div class="shelf-card-body">
        <div class="shelf-card-top">
          <span class="category">${escapeHtml(shelf.category)}</span>
          <span class="status-pill">${escapeHtml(shelf.status)}</span>
        </div>
        <h3>${escapeHtml(shelf.name)}</h3>
        <div class="meta-row" aria-label="優先度・エネルギー">
          <span class="meta-chip priority-${priorityTone(shelf.priority)}">優先度 ${escapeHtml(shelf.priority)}</span>
          <span class="meta-chip energy-${energyTone(shelf.energy)}">${escapeHtml(shelf.energy)}</span>
        </div>
        <p class="next-action">${escapeHtml(shelf.next_action)}</p>
      </div>
    </article>
  `;
}
