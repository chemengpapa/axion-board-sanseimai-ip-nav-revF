import { iconForGuide } from "../data-model.js";
import { escapeHtml } from "../utils/html.js";

export function renderAxionGuide(board, message, mood = "smile") {
  const icon = iconForGuide(board);
  return `
    <aside class="axion-guide axion-guide-${mood}">
      <div class="guide-copy">
        <span class="category">Axion</span>
        <p>${escapeHtml(message)}</p>
      </div>
      <span class="guide-icon-frame">
        <img src="${icon}" alt="アクシオン" loading="lazy" />
      </span>
    </aside>
  `;
}
