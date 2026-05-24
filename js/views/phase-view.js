import { escapeHtml } from "../utils/html.js";

function renderConditions(items) {
  if (!items?.length) return "";
  return `
    <ul class="plain-list compact-list">
      ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
  `;
}

export function renderPhaseView(board) {
  const nav = board.ip_nav || {};
  const currentPhaseId = nav.current_phase;
  return `
    <section class="page-title">
      <p class="eyebrow">Implementation Flow</p>
      <h1>社会実装Phase</h1>
      <p>三姉妹IPを社会に出すまでの流れです。現在地Phaseを起点に、関連課題へ降りていきます。</p>
    </section>

    <section class="page-section">
      <div class="phase-list">
        ${(nav.phases || []).map((phase) => `
          <article class="phase-card ${phase.id === currentPhaseId ? "is-current" : ""}" data-phase-card="${escapeHtml(phase.id)}">
            <div class="phase-card-head">
              <div>
                <p class="eyebrow">${escapeHtml(phase.status)}</p>
                <h2>${escapeHtml(phase.label)}</h2>
              </div>
              ${phase.id === currentPhaseId ? '<span class="status-pill">現在地</span>' : ""}
            </div>
            <p>${escapeHtml(phase.purpose)}</p>
            <div class="tag-row">
              ${phase.related_shelves.map((item) => `<span class="meta-chip">${escapeHtml(item)}</span>`).join("")}
            </div>
            ${renderConditions(phase.completion_conditions)}
            <button class="secondary-button phase-issue-button" type="button" data-phase-card="${escapeHtml(phase.id)}">関連課題を見る</button>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}
