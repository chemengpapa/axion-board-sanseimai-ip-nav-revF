import { iconForShelf, shelfIssueStats } from "../data-model.js";
import { escapeHtml, renderLines } from "../utils/html.js";

function renderSourceFiles(files = []) {
  if (!files.length) return "<p>公開seedでは未設定です。</p>";
  return `
    <ul class="plain-list compact-list">
      ${files.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
  `;
}

export function renderShelvesView(board) {
  return `
    <section class="page-title">
      <p class="eyebrow">Shelves</p>
      <h1>棚ナビ</h1>
      <p>全般、note、小説、青PDP、ワールドアーカイブ、RPG、設計資料、Axion Boardを社会実装フローに沿って見ます。</p>
    </section>

    <section class="page-section">
      <div class="sanseimai-shelf-list">
        ${board.shelves.map((shelf) => {
          const icon = iconForShelf(shelf);
          const stats = shelfIssueStats(board, shelf);
          return `
            <article class="sanseimai-shelf-card" data-shelf-card="${escapeHtml(shelf.id)}">
              <div class="sanseimai-shelf-head">
                <span class="shelf-avatar-frame">
                  <img class="shelf-avatar" src="${icon}" alt="" loading="lazy" />
                </span>
                <div>
                  <p class="eyebrow">${escapeHtml(shelf.category)}</p>
                  <h2>${escapeHtml(shelf.name)}</h2>
                  <div class="meta-row">
                    <span class="meta-chip">${escapeHtml(shelf.status)}</span>
                    <span class="meta-chip">課題 ${stats.issueCount}</span>
                    <span class="meta-chip">要確認 ${stats.verifyCount}</span>
                  </div>
                </div>
              </div>
              <dl class="savepoint-fields shelf-overview-fields">
                <div>
                  <dt>現在地</dt>
                  <dd>${escapeHtml(shelf.status)}</dd>
                </div>
                <div>
                  <dt>今月のゴール</dt>
                  <dd>${renderLines(shelf.monthly_goal)}</dd>
                </div>
                <div>
                  <dt>次の一手</dt>
                  <dd>${renderLines(shelf.next_action)}</dd>
                </div>
                <div>
                  <dt>関連Phase</dt>
                  <dd>${(shelf.related_phases || []).map((item) => `<span class="meta-chip">${escapeHtml(item)}</span>`).join(" ") || "未設定"}</dd>
                </div>
                <div>
                  <dt>関連source_file/source_folder</dt>
                  <dd>${renderSourceFiles(shelf.source_files)}</dd>
                </div>
              </dl>
              <div class="shelf-card-actions">
                <button class="secondary-button" type="button" data-shelf-card="${escapeHtml(shelf.id)}">棚詳細</button>
                <button class="primary-button" type="button" data-nav="save">Save Pointへ</button>
              </div>
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;
}
