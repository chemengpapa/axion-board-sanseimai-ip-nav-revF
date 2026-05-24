const NAV_ITEMS = [
  { id: "home", label: "Home" },
  { id: "phase", label: "Phase" },
  { id: "issues", label: "Issues" },
  { id: "shelves", label: "Shelves" },
  { id: "save", label: "Save" },
  { id: "settings", label: "設定" }
];

export function renderBottomNav(activeView) {
  return NAV_ITEMS.map((item) => {
    const isActive = item.id === activeView || (item.id === "shelves" && activeView === "shelf");
    return `
      <button class="nav-item ${isActive ? "is-active" : ""}" type="button" data-nav="${item.id}" aria-current="${isActive ? "page" : "false"}">
        <span class="nav-mark" aria-hidden="true"></span>
        <span>${item.label}</span>
      </button>
    `;
  }).join("");
}
