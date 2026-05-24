import { loadSeedData, normalizeBoard } from "./data-model.js";

export const SCHEMA_VERSION = "axion-board-sanseimai-ip-nav.revF";
export const STORAGE_KEY = "axion-board-sanseimai-ip-nav:revF";
export const META_KEY = "axion-board-sanseimai-ip-nav:revF:meta";
export const LAST_GOOD_KEY = "axion-board-sanseimai-ip-nav:revF:last-good";

function cloneBoard(board) {
  return JSON.parse(JSON.stringify(board));
}

function readJson(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  return JSON.parse(raw);
}

function currentTimestamp() {
  return new Date().toISOString();
}

function normalizeForStorage(board, now = currentTimestamp()) {
  const nextBoard = normalizeBoard(cloneBoard(board));
  nextBoard.schema_version = SCHEMA_VERSION;
  nextBoard.updated_at = now;
  nextBoard.settings = {
    ...nextBoard.settings,
    last_saved_at: now
  };
  return nextBoard;
}

function writeBoard(board, now = currentTimestamp(), source = "localStorage") {
  const nextBoard = normalizeForStorage(board, now);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextBoard));
  localStorage.setItem(META_KEY, JSON.stringify({
    schema_version: nextBoard.schema_version,
    last_saved_at: now,
    storage_key: STORAGE_KEY,
    source
  }));

  return {
    board: nextBoard,
    savedAt: now
  };
}

function backupCurrentToLastGood() {
  const previous = localStorage.getItem(STORAGE_KEY);
  if (previous) {
    localStorage.setItem(LAST_GOOD_KEY, previous);
  }
}

export function getStorageMeta() {
  try {
    return readJson(META_KEY) || {};
  } catch {
    return {};
  }
}

export function hasLastGoodData() {
  return Boolean(localStorage.getItem(LAST_GOOD_KEY));
}

export async function loadBoardData() {
  try {
    const stored = readJson(STORAGE_KEY);
    if (stored) {
      return {
        board: normalizeBoard(stored),
        source: "localStorage",
        meta: getStorageMeta()
      };
    }
  } catch (error) {
    console.warn("Stored RevF data could not be read.", error);
  }

  const board = await loadSeedData();
  return {
    board,
    source: "seed",
    meta: getStorageMeta()
  };
}

export function saveBoardData(board) {
  backupCurrentToLastGood();
  return writeBoard(board);
}

export async function resetBoardData() {
  backupCurrentToLastGood();
  const seedBoard = await loadSeedData();
  return writeBoard(seedBoard, currentTimestamp(), "seed-reset");
}

export function restoreLastGoodData() {
  const raw = localStorage.getItem(LAST_GOOD_KEY);
  if (!raw) {
    throw new Error("last-good に復元できるデータがありません。");
  }
  const board = normalizeBoard(JSON.parse(raw));
  return writeBoard(board, currentTimestamp(), "last-good-restore");
}

export function exportBoardText(board) {
  const exportBoard = normalizeForStorage(board, board.updated_at || currentTimestamp());
  exportBoard.exported_at = currentTimestamp();
  return JSON.stringify(exportBoard, null, 2);
}

export function exportFileName(board) {
  const month = String(board?.month || "axion-board").replace(/[^\dA-Za-z_-]/g, "-");
  const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "");
  return `axion-board-sanseimai-ip-nav-revF-${month}-${stamp}.json`;
}

export async function importBoardFile(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  backupCurrentToLastGood();
  const importedBoard = prepareImportedBoard(parsed, file.name || "imported.json");
  return writeBoard(importedBoard, currentTimestamp(), importedBoard.import_source || "json-import");
}

export function prepareImportedBoard(source, fileName = "") {
  if (!source || typeof source !== "object") {
    throw new Error("JSONの形式を確認できませんでした。");
  }

  if (isRev2MonthlyPlan(source)) {
    return convertRev2MonthlyPlan(source, fileName);
  }

  if (source.schema_version?.includes("axion-board-sanseimai-ip-nav") || source.schema_version?.includes("axion-board-mobile-lunier")) {
    return normalizeBoard({
      ...source,
      schema_version: SCHEMA_VERSION,
      import_source: source.schema_version
    });
  }

  if (Array.isArray(source.shelves) && source.month && source.theme) {
    return normalizeBoard({
      ...source,
      schema_version: SCHEMA_VERSION,
      import_source: "compatible-json"
    });
  }

  throw new Error("対応していないJSON形式です。RevF/RevE/RevD/RevC形式、またはRev2 monthly_planを読み込んでください。");
}

function isRev2MonthlyPlan(source) {
  return Boolean(
    source.month &&
    source.month_label &&
    Array.isArray(source.shelves) &&
    Array.isArray(source.weeks) &&
    !source.schema_version
  );
}

function convertRev2MonthlyPlan(source, fileName) {
  const shelves = (source.shelves || []).map((shelf) => ({
    ...shelf,
    icon_asset_id: iconForShelfId(shelf.id, shelf.name),
    memo: [shelf.week_memo, shelf.progress_note, shelf.memo].filter(Boolean).join("\n\n")
  }));

  const parkingLot = normalizeRev2ParkingLot(source.parking_lot || [], shelves);
  const missingParkingShelves = parkingLot
    .filter((item) => !shelves.some((shelf) => shelf.id === item.shelf_id))
    .map((item) => ({
      id: item.shelf_id,
      name: item.name,
      category: "保留棚",
      status: "保留",
      priority: "低",
      energy: "軽い",
      start_week: source.current_week || 1,
      end_week: source.current_week || 1,
      monthly_goal: "今月は安心して置く。",
      next_action: "再開する月に、最初の一手だけ決める。",
      memo: item.reason,
      links: [],
      icon_asset_id: iconForShelfId(item.shelf_id, item.name)
    }));

  const allShelves = [...shelves, ...missingParkingShelves];

  return normalizeBoard({
    schema_version: SCHEMA_VERSION,
    month: source.month,
    month_label: source.month_label,
    theme: source.theme || "",
    status: source.status || "imported",
    current_week: source.current_week || 1,
    today_shelf_ids: allShelves.slice(0, 2).map((shelf) => shelf.id),
    guide: {
      home: "読み込んだ月間データから、今日触る棚だけを軽く選びましょう。",
      save: "Rev2のJSONを、安心して止めるための記録に変換しました。"
    },
    roles: Array.isArray(source.roles) ? source.roles : [],
    priorities: source.priorities || [],
    not_to_do: source.not_to_do || [],
    success_conditions: source.success_conditions || [],
    weeks: source.weeks || [],
    weekly_focus: normalizeRev2WeeklyFocus(source.weekly_focus, source.current_week),
    shelves: allShelves,
    parking_lot: parkingLot,
    savepoints: buildSavepointsFromRev2(source, allShelves, parkingLot),
    monthly_review: source.monthly_review || {},
    settings: {
      current_board_id: source.month,
      theme: "lunier",
      guide_character_asset_id: "axion_icon_01",
      last_saved_at: ""
    },
    import_source: `rev2:${fileName || source.month}`
  });
}

function normalizeRev2WeeklyFocus(weeklyFocus, fallbackWeek) {
  if (weeklyFocus && Array.isArray(weeklyFocus.items)) {
    return {
      week: Number.parseInt(weeklyFocus.week, 10) || fallbackWeek || 1,
      items: weeklyFocus.items
    };
  }
  return {
    week: fallbackWeek || 1,
    items: []
  };
}

function normalizeRev2ParkingLot(items, shelves) {
  return items.map((item, index) => {
    const shelf = shelves.find((candidate) => candidate.id === item.shelf_id || candidate.name === item.name);
    const id = shelf?.id || slugify(item.name || `parking-${index + 1}`);
    return {
      shelf_id: id,
      name: item.name || shelf?.name || id,
      reason: item.reason || "今月は触らない棚として置く。"
    };
  });
}

function buildSavepointsFromRev2(source, shelves, parkingLot) {
  const parkedIds = new Set(parkingLot.map((item) => item.shelf_id));
  const selected = shelves.filter((shelf) => parkedIds.has(shelf.id));
  const fallback = selected.length ? selected : shelves.slice(0, 3);
  const date = source.month ? `${source.month}-01` : "";

  return fallback.map((shelf) => {
    const parked = parkingLot.find((item) => item.shelf_id === shelf.id);
    return {
      id: `save-${shelf.id}`,
      shelf_id: shelf.id,
      saved_at: date,
      current_location: shelf.monthly_goal || shelf.status || "Rev2から読み込んだ棚です。",
      completed: [shelf.week_memo, shelf.progress_note].filter(Boolean).join("\n") || "Rev2の月間データとして棚に入っています。",
      resume_next: shelf.next_action || "再開するなら、最初の一手だけ決める。",
      stop_reason: parked?.reason || "今月の触る棚から外すため、安心して置く。",
      resume_conditions: "この棚を来月以降に触る棚として選んだとき。",
      forgettable: "細かな作業手順や未整理メモは、再開時に読み直せばよい。",
      notes: shelf.memo || "",
      icon_asset_id: iconForShelfId(shelf.id, shelf.name)
    };
  });
}

function iconForShelfId(id = "", name = "") {
  const key = `${id} ${name}`.toLowerCase();
  if (key.includes("toies") || key.includes("とい")) return "amaryllis_icon_01";
  if (key.includes("rpg") || key.includes("blue") || key.includes("青pdp") || key.includes("三姉妹")) return "ordina_icon_01";
  if (key.includes("library") || key.includes("書斎") || key.includes("技術") || key.includes("tech")) return "logos_icon_01";
  return "axion_icon_01";
}

function slugify(value) {
  const ascii = String(value || "")
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
  return ascii || `parking-${Date.now()}`;
}
