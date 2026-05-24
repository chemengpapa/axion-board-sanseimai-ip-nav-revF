import { decisionById, evidenceById } from "../data-model.js";
import { escapeHtml, renderLines } from "../utils/html.js";

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function optionList(values, selected, allLabel) {
  return `
    <option value="">${escapeHtml(allLabel)}</option>
    ${values.map((value) => `<option value="${escapeHtml(value)}" ${value === selected ? "selected" : ""}>${escapeHtml(value)}</option>`).join("")}
  `;
}

function matchesFilters(issue, filters) {
  if (filters.shelf && issue.shelf !== filters.shelf && issue.shelf_id !== filters.shelf) return false;
  if (filters.phase && issue.phase !== filters.phase) return false;
  if (filters.priority && issue.priority_temp !== filters.priority) return false;
  if (filters.status && issue.status !== filters.status) return false;
  if (filters.needsCheck && !(issue.status?.includes("要確認") || issue.issue_type?.includes("確認"))) return false;
  return true;
}

function renderField(label, value) {
  return `
    <div>
      <dt>${escapeHtml(label)}</dt>
      <dd>${renderLines(value || "未設定")}</dd>
    </div>
  `;
}

function renderIssueDetail(board, issue) {
  if (!issue) {
    return `
      <article class="detail-field">
        <h2>Issue詳細</h2>
        <p>表示する課題がありません。</p>
      </article>
    `;
  }

  const evidence = issue.related_evidence.map((id) => evidenceById(board, id)).filter(Boolean);
  const decisions = issue.related_decision.map((id) => decisionById(board, id)).filter(Boolean);

  return `
    <article class="issue-detail-panel">
      <p class="eyebrow">${escapeHtml(issue.issue_id)}</p>
      <h2>${escapeHtml(issue.title)}</h2>
      <dl class="savepoint-fields">
        ${renderField("description", issue.description)}
        ${renderField("background", issue.background)}
        ${renderField("next_action_candidate", issue.next_action_candidate)}
        ${renderField("source_file", issue.source_file)}
        ${renderField("source_folder", issue.source_folder)}
        ${renderField("notes", issue.notes)}
      </dl>

      <section class="nested-panel">
        <h3>Evidence</h3>
        ${evidence.length ? evidence.map((item) => `
          <article class="evidence-card">
            <p class="eyebrow">${escapeHtml(item.evidence_id)} / ${escapeHtml(item.evidence_type)}</p>
            <p>${escapeHtml(item.summary)}</p>
            <small>${escapeHtml(item.source_file)} / ${escapeHtml(item.source_folder)}</small>
          </article>
        `).join("") : "<p>関連Evidenceはまだありません。</p>"}
      </section>

      <section class="nested-panel">
        <h3>Decision Log</h3>
        ${decisions.length ? decisions.map((item) => `
          <article class="evidence-card">
            <p class="eyebrow">${escapeHtml(item.decision_date)} / ${escapeHtml(item.decision_id)}</p>
            <h4>${escapeHtml(item.decision)}</h4>
            <p>${escapeHtml(item.reason)}</p>
            <small>next_review: ${escapeHtml(item.next_review || "未設定")} / source: ${escapeHtml(item.source_file || "未設定")}</small>
          </article>
        `).join("") : "<p>関連Decisionはまだありません。</p>"}
      </section>
    </article>
  `;
}

export function renderIssuesView(board, filters = {}, selectedIssueId = "") {
  const issues = board.ip_nav?.issues || [];
  const filtered = issues.filter((issue) => matchesFilters(issue, filters));
  const selected = filtered.find((issue) => issue.issue_id === selectedIssueId) || filtered[0];
  const shelves = unique(issues.map((issue) => issue.shelf));
  const phases = unique(issues.map((issue) => issue.phase));
  const priorities = unique(issues.map((issue) => issue.priority_temp));
  const statuses = unique(issues.map((issue) => issue.status));

  return `
    <section class="page-title">
      <p class="eyebrow">Issues</p>
      <h1>課題ナビ</h1>
      <p>実データはローカルJSONで読み込む前提です。公開seedではダミー課題だけを表示します。</p>
    </section>

    <section class="issue-filter-panel">
      <label>
        <span>棚</span>
        <select data-issue-filter="shelf">${optionList(shelves, filters.shelf, "すべて")}</select>
      </label>
      <label>
        <span>Phase</span>
        <select data-issue-filter="phase">${optionList(phases, filters.phase, "すべて")}</select>
      </label>
      <label>
        <span>優先度</span>
        <select data-issue-filter="priority">${optionList(priorities, filters.priority, "すべて")}</select>
      </label>
      <label>
        <span>状態</span>
        <select data-issue-filter="status">${optionList(statuses, filters.status, "すべて")}</select>
      </label>
      <label class="check-filter">
        <input type="checkbox" data-issue-filter="needsCheck" ${filters.needsCheck ? "checked" : ""} />
        <span>要確認のみ</span>
      </label>
    </section>

    <section class="page-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">List</p>
          <h2>${filtered.length}件の課題</h2>
        </div>
      </div>
      <div class="issue-list">
        ${filtered.map((issue) => `
          <article class="issue-card ${selected?.issue_id === issue.issue_id ? "is-selected" : ""}" data-issue-card="${escapeHtml(issue.issue_id)}">
            <div class="issue-card-head">
              <span class="category">${escapeHtml(issue.issue_id)}</span>
              <span class="status-pill">${escapeHtml(issue.status)}</span>
            </div>
            <h3>${escapeHtml(issue.title)}</h3>
            <div class="tag-row">
              <span class="meta-chip">${escapeHtml(issue.shelf)}</span>
              <span class="meta-chip">${escapeHtml(issue.phase)}</span>
              <span class="meta-chip">${escapeHtml(issue.issue_type)}</span>
              <span class="meta-chip">優先度 ${escapeHtml(issue.priority_temp)}</span>
            </div>
            <p>${escapeHtml(issue.next_action_candidate)}</p>
            <dl class="mini-dl">
              <div><dt>confidence</dt><dd>${escapeHtml(issue.confidence)}</dd></div>
              <div><dt>due</dt><dd>${escapeHtml(issue.due_temp)}</dd></div>
              <div><dt>source_file</dt><dd>${escapeHtml(issue.source_file)}</dd></div>
              <div><dt>source_folder</dt><dd>${escapeHtml(issue.source_folder)}</dd></div>
            </dl>
          </article>
        `).join("") || '<p class="empty-text">条件に合う課題はありません。</p>'}
      </div>
    </section>

    <section class="page-section">
      ${renderIssueDetail(board, selected)}
    </section>
  `;
}
