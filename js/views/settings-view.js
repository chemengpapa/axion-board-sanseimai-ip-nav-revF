import { LAST_GOOD_KEY, META_KEY, STORAGE_KEY } from "../storage.js";
import { escapeHtml } from "../utils/html.js";

function formatDateTime(value) {
  if (!value) return "まだ保存されていません";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export function renderSettingsView(board, storageInfo = {}) {
  const lastSavedAt = board.settings?.last_saved_at || storageInfo.last_saved_at || "";
  const privateItems = [
    "実データ入りJSON",
    "03_extracted_issue_candidates.csv",
    "ip_nav.issues / evidence / decision_log の実データ",
    "ローカルWindowsパス",
    "note販売数・反応メモ",
    "未公開制作メモ",
    "本業情報・会社情報・機密情報"
  ];

  return `
    <section class="page-title">
      <p class="eyebrow">Settings</p>
      <h1>設定</h1>
      <p>RevFは三姉妹IP社会実装ナビの公開用アプリです。GitHub Pagesには空フォーマットだけを置きます。</p>
    </section>

    <section class="page-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Public / Private</p>
          <h2>公開しないもの</h2>
        </div>
      </div>
      <div class="settings-list">
        ${privateItems.map((item) => `
          <article class="settings-item">
            <span>${escapeHtml(item)}</span>
            <small>公開フォルダへ置かない</small>
          </article>
        `).join("")}
      </div>
    </section>

    <section class="page-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">PWA</p>
          <h2>ホーム画面に追加</h2>
        </div>
      </div>
      <div class="settings-list">
        <article class="settings-panel">
          <h3>アプリのように起動できます</h3>
          <p>AndroidはChromeのメニューから「ホーム画面に追加」を選ぶと、アプリのように起動できます。iPhoneはSafariの共有メニューから「ホーム画面に追加」を選びます。</p>
        </article>
        <article class="settings-panel">
          <h3>データ保存の注意</h3>
          <p>編集データとインポートした個人JSONは、このブラウザのlocalStorageに保存されます。端末やブラウザを変えると共有されないため、定期的にJSONを書き出してください。</p>
        </article>
        <article class="settings-panel">
          <h3>オフライン利用</h3>
          <p>一度オンラインで開いた後は、最低限の画面と主要アセットをキャッシュして表示できます。更新が反映されない場合は、再読み込みやアプリ更新確認を試してください。</p>
          <button class="secondary-button" type="button" data-refresh-app-cache>アプリ更新を確認</button>
        </article>
      </div>
    </section>

    <section class="page-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Backup</p>
          <h2>JSONバックアップ</h2>
        </div>
      </div>
      <div class="settings-list">
        <article class="settings-panel">
          <h3>JSONエクスポート</h3>
          <p>現在のRevFデータをJSONとして保存します。実データ入りJSONはGitHubへ置かず、ローカルまたは非公開の保管場所で管理してください。</p>
          <button class="primary-button" type="button" data-export-json>JSONを書き出す</button>
        </article>
        <article class="settings-panel">
          <h3>JSONインポート</h3>
          <p>ローカルで管理しているRevF個人JSONを読み込みます。読み込み前の状態は last-good に退避します。</p>
          <label class="file-import-button">
            <span>JSONを読み込む</span>
            <input type="file" accept="application/json,.json" data-import-json />
          </label>
        </article>
        <article class="settings-panel">
          <h3>last-goodから復元</h3>
          <p>直前退避データへ戻します。インポートや保存の前の状態に戻したいときだけ使います。</p>
          <button class="secondary-button" type="button" data-restore-last-good>last-goodから復元</button>
        </article>
      </div>
    </section>

    <section class="page-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Storage</p>
          <h2>保存状態</h2>
        </div>
      </div>
      <div class="settings-list">
        <article class="settings-item">
          <span>現在のデータ保存方式</span>
          <small>localStorage + JSONバックアップ</small>
        </article>
        <article class="settings-item">
          <span>保存キー</span>
          <small>${escapeHtml(STORAGE_KEY)}</small>
        </article>
        <article class="settings-item">
          <span>最終保存日時</span>
          <small>${escapeHtml(formatDateTime(lastSavedAt))}</small>
        </article>
        <article class="settings-item subtle-item">
          <span>補助キー</span>
          <small>${escapeHtml(META_KEY)} / ${escapeHtml(LAST_GOOD_KEY)}</small>
        </article>
      </div>
    </section>

    <section class="detail-field danger-zone">
      <h2>データ初期化</h2>
      <p>このブラウザ内の保存データを、公開用seedの初期状態に戻します。実行前に last-good へ退避します。</p>
      <button class="secondary-button danger-button" type="button" data-reset-data>公開用seedに戻す</button>
    </section>
  `;
}
