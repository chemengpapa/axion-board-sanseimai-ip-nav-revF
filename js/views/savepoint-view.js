import { savepointsWithShelves } from "../data-model.js";
import { renderAxionGuide } from "../components/axion-guide.js";
import { renderSavepointCard } from "../components/savepoint-card.js";

export function renderSavepointView(board) {
  const savepoints = savepointsWithShelves(board);
  return `
    <section class="save-hero">
      <div>
        <p class="eyebrow">Save Point</p>
        <h1>安心して止める記録</h1>
        <p>進めるためではなく、抱えたままにしないためのセーブブロックです。</p>
      </div>
      <img src="assets/ui/save_aura_purple_transparent.png" alt="" aria-hidden="true" />
    </section>

    ${renderAxionGuide(board, board.guide?.save || "止める理由を書けたら、それは中断ではなく保存です。", "calm")}

    <section class="page-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Blocks</p>
          <h2>棚別セーブブロック</h2>
        </div>
      </div>
      <div class="savepoint-list">
        ${savepoints.map((savepoint) => renderSavepointCard(savepoint)).join("")}
      </div>
    </section>
  `;
}
