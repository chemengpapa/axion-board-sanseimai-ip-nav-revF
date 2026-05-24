import { currentPhase, iconForShelf, parkedShelves, shelfIssueStats, todayShelves } from "../data-model.js";
import { renderAxionGuide } from "../components/axion-guide.js";
import { escapeHtml } from "../utils/html.js";

function renderList(items) {
  return `<ul class="plain-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

export function renderHomeView(board) {
  const nav = board.ip_nav || {};
  const phase = currentPhase(board);
  const focus = nav.weekly_top3?.length ? nav.weekly_top3 : board.weekly_focus?.items || [];
  const parked = parkedShelves(board);
  const issueCount = board.ip_nav?.issues?.length || 0;
  const needsCheckCount = (board.ip_nav?.issues || []).filter((issue) => issue.status?.includes("要確認")).length;

  return `
    <section class="home-hero lunier-hero ip-hero">
      <div class="hero-copy">
        <p class="eyebrow">Sanseimai IP Navigation</p>
        <h1>三姉妹実装ナビ</h1>
        <p class="month-label">${escapeHtml(nav.current_location?.label || phase?.label || "")}</p>
        <p class="theme-line">${escapeHtml(nav.current_location?.description || board.theme)}</p>
      </div>
      <button class="hero-edit-button" type="button" data-edit="home">編集</button>
    </section>

    ${renderAxionGuide(board, board.guide?.home || "今週動かす3本だけを見ましょう。")}

    <section class="page-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Policy</p>
          <h2>最重要方針</h2>
        </div>
      </div>
      <article class="summary-card highlight-card">
        <p>${escapeHtml(nav.most_important_policy || board.theme)}</p>
      </article>
    </section>

    <section class="page-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Monthly</p>
          <h2>今月の重点</h2>
        </div>
      </div>
      <div class="tag-row">
        ${(nav.monthly_focus || []).map((item) => `<span class="meta-chip">${escapeHtml(item)}</span>`).join("")}
      </div>
    </section>

    <section class="page-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Top 3</p>
          <h2>今週動かす3本</h2>
        </div>
        <button class="edit-button" type="button" data-edit="weekly-focus">編集</button>
      </div>
      <ol class="focus-list">
        ${focus.slice(0, 3).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ol>
    </section>

    <section class="page-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Shelves</p>
          <h2>棚ステータス概要</h2>
        </div>
      </div>
      <div class="card-list">
        ${todayShelves(board).map((shelf) => {
          const icon = iconForShelf(shelf);
          const stats = shelfIssueStats(board, shelf);
          return `
            <article class="shelf-card shelf-card-compact ip-shelf-summary-card" data-shelf-card="${escapeHtml(shelf.id)}">
              <span class="shelf-avatar-frame">
                <img class="shelf-avatar" src="${icon}" alt="" loading="lazy" />
              </span>
              <div class="shelf-card-body">
                <div class="shelf-card-top">
                  <span class="category">${escapeHtml(shelf.category)}</span>
                  <span class="status-pill">${escapeHtml(shelf.status)}</span>
                </div>
                <h3>${escapeHtml(shelf.name)}</h3>
                <p class="next-action">${escapeHtml(shelf.next_action)}</p>
              </div>
              <div class="shelf-stats-inline">
                <span>課題 ${stats.issueCount}</span>
                <span>要確認 ${stats.verifyCount}</span>
              </div>
            </article>
          `;
        }).join("")}
      </div>
    </section>

    <section class="page-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Hold</p>
          <h2>保留すること</h2>
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

    <section class="page-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Current</p>
          <h2>現在地Phase</h2>
        </div>
        <button class="edit-button" type="button" data-nav="phase">Phaseへ</button>
      </div>
      <article class="phase-card is-current" data-phase-card="${escapeHtml(phase?.id || "")}">
        <p class="eyebrow">${escapeHtml(phase?.status || "")}</p>
        <h3>${escapeHtml(phase?.label || "")}</h3>
        <p>${escapeHtml(phase?.purpose || "")}</p>
        ${phase?.completion_conditions?.length ? renderList(phase.completion_conditions) : ""}
      </article>
    </section>

    <section class="savepoint-link-band">
      <div>
        <p class="eyebrow">Issues</p>
        <h2>課題 ${issueCount}件 / 要確認 ${needsCheckCount}件</h2>
      </div>
      <button type="button" data-nav="issues">Issuesへ</button>
    </section>
  `;
}
