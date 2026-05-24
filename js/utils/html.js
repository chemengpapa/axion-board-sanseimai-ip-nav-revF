export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function textareaValue(value) {
  return escapeHtml(value);
}

export function renderText(value, emptyText = "") {
  const text = String(value ?? "").trim();
  return escapeHtml(text || emptyText);
}

export function renderLines(value, emptyText = "") {
  const text = String(value ?? "").trim();
  if (!text) return escapeHtml(emptyText);
  return escapeHtml(text).replace(/\n/g, "<br>");
}

export function linesFromTextarea(value) {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}
