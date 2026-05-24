import { escapeHtml, textareaValue } from "../utils/html.js";

function renderField(field) {
  const id = `edit-${field.name}`;
  if (field.type === "icon") {
    const options = Array.isArray(field.options) ? field.options : [];
    return `
      <fieldset class="edit-field icon-picker-field">
        <legend>${escapeHtml(field.label)}</legend>
        <div class="icon-picker-grid">
          ${options.map((option) => {
            const checked = option.id === field.value ? "checked" : "";
            return `
              <label class="icon-choice">
                <input type="radio" name="${escapeHtml(field.name)}" value="${escapeHtml(option.id)}" ${checked} />
                <span class="icon-choice-image">
                  <img src="${escapeHtml(option.path)}" alt="${escapeHtml(option.label)}" loading="lazy" />
                </span>
                <span class="icon-choice-label">${escapeHtml(option.label)}</span>
              </label>
            `;
          }).join("")}
        </div>
      </fieldset>
    `;
  }

  if (field.type === "select") {
    return `
      <label class="edit-field" for="${id}">
        <span>${escapeHtml(field.label)}</span>
        <select id="${id}" name="${escapeHtml(field.name)}">
          ${field.options.map((option) => `
            <option value="${escapeHtml(option)}" ${option === field.value ? "selected" : ""}>${escapeHtml(option)}</option>
          `).join("")}
        </select>
      </label>
    `;
  }

  if (field.type === "text") {
    return `
      <label class="edit-field" for="${id}">
        <span>${escapeHtml(field.label)}</span>
        <input id="${id}" name="${escapeHtml(field.name)}" value="${textareaValue(field.value)}" />
      </label>
    `;
  }

  return `
    <label class="edit-field" for="${id}">
      <span>${escapeHtml(field.label)}</span>
      <textarea id="${id}" name="${escapeHtml(field.name)}" rows="${field.rows || 4}">${textareaValue(field.value)}</textarea>
    </label>
  `;
}

export function renderEditSheet(editor) {
  if (!editor) return "";
  return `
    <div class="edit-sheet-backdrop" data-edit-cancel>
      <section class="edit-sheet" role="dialog" aria-modal="true" aria-labelledby="edit-sheet-title" data-edit-sheet>
        <form data-edit-form>
          <div class="edit-sheet-header">
            <div>
              <p class="eyebrow">Edit</p>
              <h2 id="edit-sheet-title">${escapeHtml(editor.title)}</h2>
            </div>
            <button class="icon-button" type="button" data-edit-cancel aria-label="閉じる">×</button>
          </div>
          <div class="edit-fields">
            ${editor.fields.map((field) => renderField(field)).join("")}
          </div>
          <div class="edit-actions">
            <button class="secondary-button" type="button" data-edit-cancel>キャンセル</button>
            <button class="primary-button" type="submit">${escapeHtml(editor.submitLabel || "保存する")}</button>
          </div>
        </form>
      </section>
    </div>
  `;
}

export function renderToast(toast) {
  if (!toast) return "";
  return `<div class="toast toast-${escapeHtml(toast.type || "success")}" role="status">${escapeHtml(toast.message)}</div>`;
}
