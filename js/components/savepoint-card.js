import { iconForSavepoint } from "../data-model.js";
import { escapeHtml, renderLines } from "../utils/html.js";

export function renderSavepointCard(savepoint) {
  const icon = iconForSavepoint(savepoint);
  return `
    <article class="savepoint-card" data-savepoint-card="${escapeHtml(savepoint.id)}">
      <div class="savepoint-symbol" aria-hidden="true">
        <img src="${icon}" alt="" loading="lazy" />
      </div>
      <div class="savepoint-body">
        <div class="savepoint-card-top">
          <div>
            <span class="category">${escapeHtml(savepoint.saved_at)}</span>
            <h3>${escapeHtml(savepoint.shelf.name)}</h3>
          </div>
          <button class="edit-button dark-edit-button" type="button" data-edit="savepoint" data-savepoint-id="${escapeHtml(savepoint.id)}">編集</button>
        </div>
        <dl class="savepoint-fields">
          <div>
            <dt>現在地</dt>
            <dd>${renderLines(savepoint.current_location)}</dd>
          </div>
          <div>
            <dt>できていること</dt>
            <dd>${renderLines(savepoint.completed)}</dd>
          </div>
          <div>
            <dt>次に再開するなら</dt>
            <dd>${renderLines(savepoint.resume_next)}</dd>
          </div>
          <div>
            <dt>今止める理由</dt>
            <dd>${renderLines(savepoint.stop_reason)}</dd>
          </div>
          <div>
            <dt>再開条件</dt>
            <dd>${renderLines(savepoint.resume_conditions)}</dd>
          </div>
          <div>
            <dt>触らない間に忘れてよいこと</dt>
            <dd>${renderLines(savepoint.forgettable)}</dd>
          </div>
          <div>
            <dt>補足メモ</dt>
            <dd>${renderLines(savepoint.notes, "補足メモはまだありません。")}</dd>
          </div>
        </dl>
      </div>
    </article>
  `;
}
