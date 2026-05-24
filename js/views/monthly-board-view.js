import { currentWeeklyFocus, parkedShelves, shelvesForWeek } from "../data-model.js";
import { renderShelfCard } from "../components/shelf-card.js";
import { escapeHtml } from "../utils/html.js";

function renderTextList(items) {
  return `<ul class="plain-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function renderEditableSummary(title, listKey, items) {
  return `
    <article class="summary-card">
      <div class="summary-card-head">
        <h2>${escapeHtml(title)}</h2>
        <button class="edit-button" type="button" data-edit="monthly-list" data-list-key="${escapeHtml(listKey)}" data-title="${escapeHtml(title)}">編集</button>
      </div>
      ${renderTextList(items)}
    </article>
  `;
}

export function renderMonthlyBoardView(board, activeWeek) {
  const week = activeWeek || board.current_week;
  const weekShelves = shelvesForWeek(board, week);
  const parked = parkedShelves(board);
  const weeklyFocus = currentWeeklyFocus(board);
  return `
    <section class="page-title">
      <p class="eyebrow">Monthly</p>
      <h1>月間ボード</h1>
      <p>${escapeHtml(board.month_label)} / ${week}週目</p>
    </section>

    <section class="board-summary-grid">
      ${renderEditableSummary("今月の優先事項", "priorities", board.priorities)}
      ${renderEditableSummary("やらないこと", "not_to_do", board.not_to_do)}
      ${renderEditableSummary("勝利条件", "success_conditions", board.success_conditions)}
    </section>

    <section class="page-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Focus</p>
          <h2>今週のフォーカス</h2>
        </div>
        <button class="edit-button" type="button" data-edit="weekly-focus">編集</button>
      </div>
      <ol class="focus-list">
        ${weeklyFocus.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ol>
    </section>

    <section class="page-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Weeks</p>
          <h2>週別カード</h2>
        </div>
      </div>
      <div class="week-tabs" role="tablist" aria-label="週を選ぶ">
        ${board.weeks.map((item) => `
          <button class="${item.id === week ? "is-active" : ""}" type="button" data-week="${item.id}">
            <span>${escapeHtml(item.label)}</span>
            <small>${escapeHtml(item.range)}</small>
          </button>
        `).join("")}
      </div>
      <div class="week-card">
        <p class="eyebrow">${week}週目</p>
        <h2>${escapeHtml(board.weeks.find((item) => item.id === week)?.range || "")}</h2>
        <div class="card-list">
          ${weekShelves.length ? weekShelves.map((shelf) => renderShelfCard(shelf)).join("") : '<p class="empty-text">この週に置いた棚はありません。</p>'}
        </div>
      </div>
    </section>

    <section class="page-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Shelves</p>
          <h2>棚カード一覧</h2>
        </div>
      </div>
      <div class="card-list">
        ${board.shelves.map((shelf) => renderShelfCard(shelf, { mode: "list" })).join("")}
      </div>
    </section>

    <section class="page-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Parking</p>
          <h2>保留棚</h2>
        </div>
      </div>
      <div class="rest-list">
        ${parked.map((item) => `
          <article class="rest-card" data-shelf-card="${escapeHtml(item.shelf.id)}">
            <span>${escapeHtml(item.shelf.name)}</span>
            <p>${escapeHtml(item.reason)}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}
