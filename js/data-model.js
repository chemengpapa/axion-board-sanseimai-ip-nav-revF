import { ICON_ASSETS, ICON_MAP } from "./icon-assets.js";

export { ICON_ASSETS, ICON_MAP };

export const AVATAR_MAP = {
  axion: ICON_MAP.axion_icon_01,
  amaryllis: ICON_MAP.amaryllis_icon_01,
  ordina: ICON_MAP.ordina_icon_01,
  logos: ICON_MAP.logos_icon_01
};

const SHELF_ICON_DEFAULTS = {
  general: "axion_icon_01",
  note: "amaryllis_icon_01",
  novel: "ordina_icon_01",
  "blue-pdp": "logos_icon_01",
  "world-archive": "lumiana_icon_01",
  rpg: "ordina_icon_01",
  "design-docs": "axion_icon_01",
  "axion-board": "axion_icon_01",
  "personal-note": "axion_icon_01",
  "electronic-library": "logos_icon_01",
  "sanshimai-rpg": "ordina_icon_01",
  "toies-letter": "amaryllis_icon_01",
  "technical-shelf": "logos_icon_01"
};

const SAVEPOINT_ICON_DEFAULTS = {
  "save-rpg": "ordina_icon_01",
  "save-design-docs": "axion_icon_01",
  "save-axion-board": "axion_icon_01",
  "save-sanshimai-rpg": "ordina_icon_01",
  "save-technical-shelf": "logos_icon_01"
};

export async function loadSeedData() {
  const response = await fetch("data/seed/sanseimai_ip_nav_empty_seed.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return normalizeBoard(await response.json());
}

export function normalizeBoard(source) {
  const shelves = Array.isArray(source.shelves) ? source.shelves : [];
  const savepoints = Array.isArray(source.savepoints) ? source.savepoints : [];
  const month = source.month || "2026-05";

  return {
    ...source,
    schema_version: source.schema_version || "axion-board-sanseimai-ip-nav.revF",
    updated_at: source.updated_at || "",
    month,
    month_label: source.month_label || "2026年5月",
    theme: source.theme || "",
    status: source.status || "prototype",
    current_week: Number.parseInt(source.current_week, 10) || 1,
    today_shelf_ids: Array.isArray(source.today_shelf_ids) ? source.today_shelf_ids : [],
    guide: {
      home: source.guide?.home || "",
      save: source.guide?.save || ""
    },
    priorities: normalizeStringArray(source.priorities),
    not_to_do: normalizeStringArray(source.not_to_do),
    success_conditions: normalizeStringArray(source.success_conditions),
    weeks: Array.isArray(source.weeks) ? source.weeks : [],
    weekly_focus: normalizeWeeklyFocus(source.weekly_focus),
    shelves: shelves.map((shelf, index) => ({
      id: shelf.id || `shelf-${index + 1}`,
      name: shelf.name || "未設定の棚",
      category: shelf.category || "未分類",
      status: shelf.status || "種まき",
      priority: shelf.priority || "中",
      energy: shelf.energy || "中",
      start_week: Number.parseInt(shelf.start_week, 10) || 1,
      end_week: Number.parseInt(shelf.end_week, 10) || 1,
      monthly_goal: shelf.monthly_goal || "",
      next_action: shelf.next_action || "",
      memo: shelf.memo || "",
      links: Array.isArray(shelf.links) ? shelf.links : [],
      avatar: shelf.avatar || "axion",
      icon_asset_id: shelf.icon_asset_id || SHELF_ICON_DEFAULTS[shelf.id] || iconIdFromAvatar(shelf.avatar)
    })),
    parking_lot: Array.isArray(source.parking_lot) ? source.parking_lot : [],
    savepoints: savepoints.map((savepoint, index) => ({
      id: savepoint.id || `savepoint-${index + 1}`,
      shelf_id: savepoint.shelf_id || "",
      saved_at: savepoint.saved_at || "",
      current_location: savepoint.current_location || "",
      completed: savepoint.completed || "",
      resume_next: savepoint.resume_next || "",
      stop_reason: savepoint.stop_reason || "",
      resume_conditions: savepoint.resume_conditions || "",
      forgettable: savepoint.forgettable || "",
      notes: savepoint.notes || "",
      icon_asset_id: savepoint.icon_asset_id || SAVEPOINT_ICON_DEFAULTS[savepoint.id] || "amaryllis_icon_01"
    })),
    assets: normalizeAssets(source.assets),
    settings: {
      current_board_id: source.settings?.current_board_id || month,
      theme: source.settings?.theme || "lunier",
      guide_character_asset_id: source.settings?.guide_character_asset_id || "axion_icon_01",
      last_saved_at: source.settings?.last_saved_at || source.updated_at || ""
    },
    settings_preview: normalizeStringArray(source.settings_preview),
    ip_nav: normalizeIpNav(source.ip_nav)
  };
}

function normalizeIpNav(value = {}) {
  const phases = Array.isArray(value.phases) ? value.phases : [];
  const issues = Array.isArray(value.issues) ? value.issues : [];
  const evidence = Array.isArray(value.evidence) ? value.evidence : [];
  const decisionLog = Array.isArray(value.decision_log) ? value.decision_log : [];

  return {
    schema_version: value.schema_version || "sanseimai-ip-nav.revF",
    current_phase: value.current_phase || phases[0]?.id || "",
    current_location: {
      label: value.current_location?.label || "",
      description: value.current_location?.description || ""
    },
    most_important_policy: value.most_important_policy || "",
    monthly_focus: normalizeStringArray(value.monthly_focus),
    weekly_top3: normalizeStringArray(value.weekly_top3).slice(0, 3),
    phases: phases.map((phase, index) => ({
      id: phase.id || `phase-${index}`,
      label: phase.label || `Phase ${index}`,
      purpose: phase.purpose || "",
      related_shelves: normalizeStringArray(phase.related_shelves),
      status: phase.status || "",
      completion_conditions: normalizeStringArray(phase.completion_conditions)
    })),
    milestones: Array.isArray(value.milestones) ? value.milestones : [],
    issues: issues.map((issue, index) => ({
      issue_id: issue.issue_id || `SAN-TEMPLATE-${String(index + 1).padStart(3, "0")}`,
      shelf: issue.shelf || "",
      shelf_id: issue.shelf_id || "",
      phase: issue.phase || "",
      issue_type: issue.issue_type || "",
      title: issue.title || "未設定の課題",
      description: issue.description || "",
      background: issue.background || "",
      next_action_candidate: issue.next_action_candidate || "",
      priority_temp: issue.priority_temp || "",
      status: issue.status || "",
      confidence: issue.confidence || "",
      due_temp: issue.due_temp || "",
      source_file: issue.source_file || "",
      source_folder: issue.source_folder || "",
      notes: issue.notes || "",
      related_evidence: normalizeStringArray(issue.related_evidence),
      related_decision: normalizeStringArray(issue.related_decision)
    })),
    evidence: evidence.map((item, index) => ({
      evidence_id: item.evidence_id || `EVD-${String(index + 1).padStart(3, "0")}`,
      source_file: item.source_file || "",
      source_folder: item.source_folder || "",
      evidence_type: item.evidence_type || "",
      shelf: item.shelf || "",
      summary: item.summary || "",
      last_checked_at: item.last_checked_at || "",
      trust_level: item.trust_level || "",
      notes: item.notes || ""
    })),
    decision_log: decisionLog.map((item, index) => ({
      decision_id: item.decision_id || `DEC-${String(index + 1).padStart(3, "0")}`,
      decision_date: item.decision_date || "",
      decision: item.decision || "",
      reason: item.reason || "",
      related_issue_id: item.related_issue_id || "",
      next_review: item.next_review || "",
      source_file: item.source_file || "",
      notes: item.notes || ""
    })),
    public_links: Array.isArray(value.public_links) ? value.public_links : []
  };
}

function normalizeWeeklyFocus(value) {
  return {
    week: Number.parseInt(value?.week, 10) || 1,
    items: normalizeStringArray(value?.items)
  };
}

function normalizeAssets(value) {
  const existing = Array.isArray(value) ? value : [];
  const nonIconAssets = existing.filter((asset) => asset?.type && asset.type !== "icon");
  return [
    ...nonIconAssets,
    ...ICON_ASSETS.map((asset) => ({ ...asset, type: "icon" }))
  ];
}

export function normalizeStringArray(value) {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

function iconIdFromAvatar(avatar) {
  if (avatar === "ordina") return "ordina_icon_01";
  if (avatar === "logos") return "logos_icon_01";
  if (avatar === "amaryllis") return "amaryllis_icon_01";
  return "axion_icon_01";
}

export function iconPath(iconAssetId, fallback = "axion_icon_01") {
  return ICON_MAP[iconAssetId] || ICON_MAP[fallback] || ICON_MAP.axion_icon_01;
}

export function iconForShelf(shelf) {
  return iconPath(shelf?.icon_asset_id || iconIdFromAvatar(shelf?.avatar));
}

export function iconForSavepoint(savepoint) {
  return iconPath(savepoint?.icon_asset_id || "amaryllis_icon_01");
}

export function iconForGuide(board) {
  return iconPath(board?.settings?.guide_character_asset_id || "axion_icon_01");
}

export function shelfById(board, shelfId) {
  return board.shelves.find((shelf) => shelf.id === shelfId) || board.shelves[0];
}

export function savepointById(board, savepointId) {
  return board.savepoints.find((savepoint) => savepoint.id === savepointId) || board.savepoints[0];
}

export function shelvesForWeek(board, weekId) {
  return board.shelves.filter((shelf) => weekId >= shelf.start_week && weekId <= shelf.end_week);
}

export function todayShelves(board) {
  const ids = Array.isArray(board.today_shelf_ids) ? board.today_shelf_ids : [];
  const shelves = ids.map((id) => shelfById(board, id)).filter(Boolean);
  return shelves.length ? shelves : board.shelves.slice(0, 2);
}

export function parkedShelves(board) {
  return board.parking_lot.map((item) => ({
    ...item,
    shelf: shelfById(board, item.shelf_id)
  })).filter((item) => item.shelf);
}

export function savepointsWithShelves(board) {
  return board.savepoints.map((savepoint) => ({
    ...savepoint,
    shelf: shelfById(board, savepoint.shelf_id)
  })).filter((savepoint) => savepoint.shelf);
}

export function currentWeeklyFocus(board) {
  return board.weekly_focus?.items || [];
}

export function currentPhase(board) {
  const nav = board.ip_nav || {};
  return nav.phases?.find((phase) => phase.id === nav.current_phase) || nav.phases?.[0];
}

export function phaseById(board, phaseId) {
  return board.ip_nav?.phases?.find((phase) => phase.id === phaseId) || currentPhase(board);
}

export function issuesForPhase(board, phaseId) {
  return (board.ip_nav?.issues || []).filter((issue) => !phaseId || issue.phase === phaseId);
}

export function issuesForShelf(board, shelf) {
  const shelfName = typeof shelf === "string" ? shelf : shelf?.name;
  const shelfId = typeof shelf === "string" ? shelf : shelf?.id;
  return (board.ip_nav?.issues || []).filter((issue) => issue.shelf_id === shelfId || issue.shelf === shelfName);
}

export function evidenceById(board, evidenceId) {
  return board.ip_nav?.evidence?.find((item) => item.evidence_id === evidenceId);
}

export function decisionById(board, decisionId) {
  return board.ip_nav?.decision_log?.find((item) => item.decision_id === decisionId);
}

export function shelfIssueStats(board, shelf) {
  const issues = issuesForShelf(board, shelf);
  const verifyCount = issues.filter((issue) => issue.status?.includes("要確認") || issue.issue_type?.includes("確認")).length;
  return {
    issueCount: issues.length,
    verifyCount
  };
}

export function priorityTone(priority) {
  if (priority === "高") return "high";
  if (priority === "低") return "low";
  return "medium";
}

export function energyTone(energy) {
  if (energy === "重い") return "heavy";
  if (energy === "軽い") return "light";
  return "normal";
}
