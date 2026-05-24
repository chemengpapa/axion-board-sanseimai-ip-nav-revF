import { iconForShelf, shelfIssueStats } from "../data-model.js";
import { escapeHtml, renderLines } from "../utils/html.js";

function renderList(items = []) {
  if (!items.length) return "<p>未設定</p>";
  return `<ul class="plain-list compact-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

export function renderShelfDetailView(shelf) {
  const icon = iconForShelf(shelf);
  return `
    <section class="shelf-detail-header">
      <span class="detail-avatar-frame">
        <img class="detail-avatar" src="${icon}" alt="" />
      </span>
      <div>
        <p class="eyebrow">${escapeHtml(shelf.category)}</p>
        <h1>${escapeHtml(shelf.name)}</h1>
        <div class="meta-row">
          <span class="meta-chip">${escapeHtml(shelf.status)}</span>
          <span class="meta-chip">優先度 ${escapeHtml(shelf.priority)}</span>
          <span class="meta-chip">${escapeHtml(shelf.energy)}</span>
        </div>
      </div>
      <button class="edit-button shelf-detail-edit" type="button" data-edit="shelf" data-shelf-id="${escapeHtml(shelf.id)}">編集</button>
    </section>

    <section class="detail-field">
      <h2>今月のゴール</h2>
      <p>${renderLines(shelf.monthly_goal)}</p>
    </section>
    <section class="detail-field accent-field">
      <h2>次の一手</h2>
      <p>${renderLines(shelf.next_action)}</p>
    </section>
    <section class="detail-field">
      <h2>メモ</h2>
      <p>${renderLines(shelf.memo, "メモはまだありません。")}</p>
    </section>
    <section class="detail-field">
      <h2>関連Phase</h2>
      ${renderList(shelf.related_phases)}
    </section>
    <section class="detail-field">
      <h2>関連source_file/source_folder</h2>
      ${renderList(shelf.source_files)}
    </section>
    <section class="savepoint-link-band compact">
      <div>
        <p class="eyebrow">Save Point</p>
        <h2>この棚を安心して置く</h2>
      </div>
      <button type="button" data-nav="save">Saveへ</button>
    </section>
  `;
}
