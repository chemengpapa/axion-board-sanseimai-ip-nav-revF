import { linesFromTextarea } from "./utils/html.js";
import {
  exportBoardText,
  exportFileName,
  importBoardFile,
  loadBoardData,
  resetBoardData,
  restoreLastGoodData,
  saveBoardData
} from "./storage.js";
import { ICON_ASSETS, savepointById, shelfById } from "./data-model.js";
import { renderBottomNav } from "./components/bottom-nav.js";
import { renderEditSheet, renderToast } from "./components/edit-sheet.js";
import { renderHomeView } from "./views/home-view.js";
import { renderPhaseView } from "./views/phase-view.js";
import { renderIssuesView } from "./views/issues-view.js";
import { renderShelvesView } from "./views/shelves-view.js";
import { renderShelfDetailView } from "./views/shelf-detail-view.js";
import { renderSavepointView } from "./views/savepoint-view.js";
import { renderSettingsView } from "./views/settings-view.js";

const app = document.getElementById("app");
const bottomNav = document.getElementById("bottomNav");

const state = {
  board: null,
  view: "home",
  activeWeek: 1,
  selectedShelfId: "rpg",
  selectedIssueId: "",
  issueFilters: {
    shelf: "",
    phase: "",
    priority: "",
    status: "",
    needsCheck: false
  },
  editor: null,
  toast: null,
  toastTimer: null,
  storageMeta: {},
  loadSource: "seed"
};

function setView(view) {
  state.view = view;
  state.editor = null;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function render() {
  if (!state.board) return;
  const board = state.board;
  bottomNav.innerHTML = renderBottomNav(state.view);

  if (state.view === "home") {
    app.innerHTML = renderHomeView(board);
  } else if (state.view === "phase") {
    app.innerHTML = renderPhaseView(board);
  } else if (state.view === "issues") {
    app.innerHTML = renderIssuesView(board, state.issueFilters, state.selectedIssueId);
  } else if (state.view === "shelves") {
    app.innerHTML = renderShelvesView(board);
  } else if (state.view === "shelf") {
    app.innerHTML = renderShelfDetailView(shelfById(board, state.selectedShelfId));
  } else if (state.view === "save") {
    app.innerHTML = renderSavepointView(board);
  } else {
    app.innerHTML = renderSettingsView(board, state.storageMeta);
  }

  app.insertAdjacentHTML("beforeend", renderEditSheet(state.editor));
  app.insertAdjacentHTML("beforeend", renderToast(state.toast));
}

function showToast(message, type = "success") {
  state.toast = { message, type };
  render();
  clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => {
    state.toast = null;
    render();
  }, 2600);
}

function openEditor(button) {
  const kind = button.dataset.edit;
  if (kind === "home") {
    state.editor = {
      type: "home",
      title: "ホームを編集",
      submitLabel: "ここまで保存",
      fields: [
        { name: "theme", label: "最重要方針", value: state.board.theme, rows: 3 },
        { name: "guide_home", label: "アクシオンの一言", value: state.board.guide?.home || "", rows: 3 }
      ]
    };
  }

  if (kind === "monthly-list") {
    const listKey = button.dataset.listKey;
    state.editor = {
      type: "monthly-list",
      listKey,
      title: button.dataset.title || "項目を編集",
      submitLabel: "保存する",
      fields: [
        {
          name: "items",
          label: "1行に1つずつ書く",
          value: (state.board[listKey] || []).join("\n"),
          rows: 7
        }
      ]
    };
  }

  if (kind === "weekly-focus") {
    state.editor = {
      type: "weekly-focus",
      title: "今週動かす3本を編集",
      submitLabel: "保存する",
      fields: [
        {
          name: "items",
          label: "最大3件。増やしすぎない",
          value: (state.board.weekly_focus?.items || []).join("\n"),
          rows: 5
        }
      ]
    };
  }

  if (kind === "shelf") {
    const shelf = shelfById(state.board, button.dataset.shelfId);
    state.editor = {
      type: "shelf",
      shelfId: shelf.id,
      title: `${shelf.name}を編集`,
      submitLabel: "棚を保存",
      fields: [
        { type: "icon", name: "icon_asset_id", label: "棚アイコン", value: shelf.icon_asset_id, options: ICON_ASSETS },
        { type: "text", name: "status", label: "状態", value: shelf.status },
        { type: "select", name: "priority", label: "優先度", value: shelf.priority, options: ["高", "中", "低"] },
        { type: "select", name: "energy", label: "エネルギー", value: shelf.energy, options: ["軽い", "中", "重い"] },
        { name: "monthly_goal", label: "今月のゴール", value: shelf.monthly_goal, rows: 4 },
        { name: "next_action", label: "次の一手", value: shelf.next_action, rows: 3 },
        { name: "memo", label: "メモ", value: shelf.memo, rows: 5 }
      ]
    };
  }

  if (kind === "savepoint") {
    const savepoint = savepointById(state.board, button.dataset.savepointId);
    const shelf = shelfById(state.board, savepoint.shelf_id);
    state.editor = {
      type: "savepoint",
      savepointId: savepoint.id,
      title: `${shelf.name}のSave Point`,
      submitLabel: "セーブブロックに記録",
      fields: [
        { name: "current_location", label: "現在地", value: savepoint.current_location, rows: 3 },
        { name: "completed", label: "できていること", value: savepoint.completed, rows: 3 },
        { name: "resume_next", label: "次に再開するなら", value: savepoint.resume_next, rows: 3 },
        { name: "stop_reason", label: "今止める理由", value: savepoint.stop_reason, rows: 3 },
        { name: "resume_conditions", label: "再開条件", value: savepoint.resume_conditions, rows: 3 },
        { name: "forgettable", label: "触らない間に忘れてよいこと", value: savepoint.forgettable, rows: 3 },
        { name: "notes", label: "補足メモ", value: savepoint.notes || "", rows: 3 }
      ]
    };
  }

  render();
}

function applyEditorChanges(form) {
  const formData = new FormData(form);
  const editor = state.editor;
  if (!editor) return;

  if (editor.type === "home") {
    state.board.theme = String(formData.get("theme") || "").trim();
    state.board.ip_nav.most_important_policy = state.board.theme;
    state.board.guide.home = String(formData.get("guide_home") || "").trim();
  }

  if (editor.type === "monthly-list") {
    state.board[editor.listKey] = linesFromTextarea(formData.get("items"));
  }

  if (editor.type === "weekly-focus") {
    state.board.weekly_focus.items = linesFromTextarea(formData.get("items")).slice(0, 3);
    state.board.ip_nav.weekly_top3 = state.board.weekly_focus.items;
  }

  if (editor.type === "shelf") {
    const shelf = shelfById(state.board, editor.shelfId);
    shelf.icon_asset_id = String(formData.get("icon_asset_id") || shelf.icon_asset_id || "axion_icon_01").trim();
    shelf.status = String(formData.get("status") || "").trim();
    shelf.priority = String(formData.get("priority") || "中").trim();
    shelf.energy = String(formData.get("energy") || "中").trim();
    shelf.monthly_goal = String(formData.get("monthly_goal") || "").trim();
    shelf.next_action = String(formData.get("next_action") || "").trim();
    shelf.memo = String(formData.get("memo") || "").trim();
  }

  if (editor.type === "savepoint") {
    const savepoint = savepointById(state.board, editor.savepointId);
    savepoint.current_location = String(formData.get("current_location") || "").trim();
    savepoint.completed = String(formData.get("completed") || "").trim();
    savepoint.resume_next = String(formData.get("resume_next") || "").trim();
    savepoint.stop_reason = String(formData.get("stop_reason") || "").trim();
    savepoint.resume_conditions = String(formData.get("resume_conditions") || "").trim();
    savepoint.forgettable = String(formData.get("forgettable") || "").trim();
    savepoint.notes = String(formData.get("notes") || "").trim();
  }
}

function persistAfterEdit(message) {
  try {
    const result = saveBoardData(state.board);
    state.board = result.board;
    state.storageMeta = { ...state.storageMeta, last_saved_at: result.savedAt };
    state.editor = null;
    showToast(message);
  } catch (error) {
    showToast(`保存できませんでした: ${error.message}`, "error");
  }
}

function downloadTextFile(fileName, text) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

document.addEventListener("click", async (event) => {
  const sheet = event.target.closest("[data-edit-sheet]");
  const cancelButton = event.target.closest("[data-edit-cancel]");
  if (cancelButton && !sheet) {
    state.editor = null;
    render();
    return;
  }

  if (cancelButton && event.target.closest(".icon-button, .secondary-button")) {
    state.editor = null;
    render();
    return;
  }

  const editButton = event.target.closest("[data-edit]");
  if (editButton) {
    event.preventDefault();
    openEditor(editButton);
    return;
  }

  const navButton = event.target.closest("[data-nav]");
  if (navButton) {
    setView(navButton.dataset.nav);
    return;
  }

  const phaseCard = event.target.closest("[data-phase-card]");
  if (phaseCard) {
    state.issueFilters.phase = phaseCard.dataset.phaseCard;
    state.selectedIssueId = "";
    setView("issues");
    return;
  }

  const issueCard = event.target.closest("[data-issue-card]");
  if (issueCard) {
    state.selectedIssueId = issueCard.dataset.issueCard;
    render();
    return;
  }

  const exportButton = event.target.closest("[data-export-json]");
  if (exportButton) {
    try {
      downloadTextFile(exportFileName(state.board), exportBoardText(state.board));
      showToast("JSONを書き出しました。");
    } catch (error) {
      showToast(`JSONを書き出せませんでした: ${error.message}`, "error");
    }
    return;
  }

  const restoreButton = event.target.closest("[data-restore-last-good]");
  if (restoreButton) {
    const ok = window.confirm("last-goodに退避した直前データへ戻します。現在の表示内容は置き換わります。");
    if (!ok) return;
    try {
      const result = restoreLastGoodData();
      state.board = result.board;
      state.storageMeta = { ...state.storageMeta, last_saved_at: result.savedAt };
      state.selectedShelfId = state.board.today_shelf_ids?.[0] || state.board.shelves[0]?.id || "";
      showToast("last-goodから復元しました。");
    } catch (error) {
      showToast(`復元できませんでした: ${error.message}`, "error");
    }
    return;
  }

  const refreshAppButton = event.target.closest("[data-refresh-app-cache]");
  if (refreshAppButton) {
    try {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) await registration.update();
      }
      showToast("アプリ更新を確認しました。必要なら再読み込みしてください。");
    } catch (error) {
      showToast(`アプリ更新を確認できませんでした: ${error.message}`, "error");
    }
    return;
  }

  const resetButton = event.target.closest("[data-reset-data]");
  if (resetButton) {
    const ok = window.confirm("RevFの保存データを公開用seedの初期状態に戻します。現在の保存データは last-good に退避します。");
    if (!ok) return;
    try {
      const result = await resetBoardData();
      state.board = result.board;
      state.storageMeta = { ...state.storageMeta, last_saved_at: result.savedAt };
      state.selectedShelfId = state.board.today_shelf_ids?.[0] || state.board.shelves[0]?.id || "";
      showToast("公開用seedに戻しました。");
    } catch (error) {
      showToast(`初期化できませんでした: ${error.message}`, "error");
    }
    return;
  }

  const shelfCard = event.target.closest("[data-shelf-card]");
  if (shelfCard) {
    state.selectedShelfId = shelfCard.dataset.shelfCard;
    setView("shelf");
  }
});

document.addEventListener("change", async (event) => {
  const filter = event.target.closest("[data-issue-filter]");
  if (filter) {
    const key = filter.dataset.issueFilter;
    if (key === "needsCheck") {
      state.issueFilters.needsCheck = filter.checked;
    } else {
      state.issueFilters[key] = filter.value;
    }
    state.selectedIssueId = "";
    render();
    return;
  }

  const input = event.target.closest("[data-import-json]");
  if (!input || !input.files?.length) return;

  try {
    const result = await importBoardFile(input.files[0]);
    state.board = result.board;
    state.storageMeta = { ...state.storageMeta, last_saved_at: result.savedAt };
    state.selectedShelfId = state.board.today_shelf_ids?.[0] || state.board.shelves[0]?.id || "";
    state.selectedIssueId = "";
    showToast("JSONを読み込みました。");
  } catch (error) {
    showToast(`JSONを読み込めませんでした: ${error.message}`, "error");
  } finally {
    input.value = "";
  }
});

document.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-edit-form]");
  if (!form) return;
  event.preventDefault();
  applyEditorChanges(form);

  if (state.editor?.type === "savepoint") {
    persistAfterEdit("セーブブロックに記録しました。");
    return;
  }

  persistAfterEdit("ここまで保存しました。");
});

loadBoardData()
  .then(({ board, source, meta }) => {
    state.board = board;
    state.storageMeta = meta || {};
    state.loadSource = source;
    state.activeWeek = board.current_week;
    state.selectedShelfId = board.today_shelf_ids?.[0] || board.shelves[0]?.id || "";
    render();
  })
  .catch((error) => {
    app.innerHTML = `
      <section class="loading-view error-view">
        <p class="eyebrow">Load Error</p>
        <h1>読み込みに失敗しました</h1>
        <p>静的サーバーから開いてください。詳細: ${error.message}</p>
      </section>
    `;
  });
