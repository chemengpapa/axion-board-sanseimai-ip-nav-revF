# Axion Board - 三姉妹実装ナビ - RevF Notes

## 作成方針

RevFはRevEをコピーして作成した専用派生版です。RevE本体は変更していません。

三姉妹IPを社会に出すまでの開発ナビとして、Phase、棚、課題、根拠、判断ログを表示する構成にしました。課題編集機能は今回入れていません。

## 参照した資料

- `sanseimai_ip_nav_plan`
- `02_issue_sheet_design.md`
- `08_revD_to_sanseimai_nav_implementation_plan.md`
- `09_public_private_data_policy.md`

参照資料は方針確認に使い、実データやローカルパスは公開フォルダへコピーしていません。

## 追加したファイル

- `data/seed/sanseimai_ip_nav_empty_seed.json`
- `js/views/phase-view.js`
- `js/views/issues-view.js`
- `js/views/shelves-view.js`
- `docs/revF_notes.md`

## 更新したファイル

- `index.html`
- `manifest.json`
- `service-worker.js`
- `README.md`
- `css/layout-mobile.css`
- `js/main.js`
- `js/storage.js`
- `js/data-model.js`
- `js/components/bottom-nav.js`
- `js/components/savepoint-card.js`
- `js/views/home-view.js`
- `js/views/savepoint-view.js`
- `js/views/settings-view.js`
- `js/views/shelf-detail-view.js`

## 削除したRevFコピー内の公開不要ファイル

- RevB/RevC/RevD/RevEの古い検証スクリーンショット
- RevB/RevD/RevEの古いnotes
- RevEコピー元の `data/seed/axion_board_seed_2026_05.json`

RevE本体側のファイルは削除していません。

## データ構造

RevEまでの基本構造を維持し、以下を追加しました。

```text
ip_nav:
  schema_version
  current_phase
  current_location
  most_important_policy
  monthly_focus
  weekly_top3
  phases
  milestones
  issues
  evidence
  decision_log
  public_links
```

## 公開用seed

ファイル:

- `data/seed/sanseimai_ip_nav_empty_seed.json`

内容:

- Phase 0〜7
- 8棚
- ダミー課題2件
- ダミーEvidence 1件
- ダミーDecision 1件
- Save Point 2件

公開seedには、実データ、ローカルパス、課題CSV、販売数、反応メモ、未公開制作メモを入れていません。

## PWA設定

manifest:

- name: `Axion Board - 三姉妹実装ナビ`
- short_name: `三姉妹ナビ`
- start_url: `./`
- scope: `./`
- display: `standalone`

service worker:

- cache name: `axion-board-sanseimai-ip-nav-revF-v1`
- seedは `data/seed/sanseimai_ip_nav_empty_seed.json` をキャッシュ
- Phase/Issues/Shelvesの新規viewもキャッシュ対象に追加
- localStorageのユーザーデータはキャッシュしない

## 追加画面

- Home: 現在地、今月の重点、今週動かす3本、棚概要、保留、最重要方針
- Phase: Phase 0〜7、現在地Phase 2強調、関連課題への導線
- Issues: 読み取り専用一覧、棚/Phase/優先度/状態/要確認フィルター
- Issue詳細: description、background、next_action_candidate、source_file/source_folder、notes、Evidence、Decision Log
- Shelves: 8棚の現在地、今月のゴール、次の一手、課題数、要確認数、関連Phase、source_file/source_folder、Save Point導線

## 維持した機能

- JSONインポート
- JSONエクスポート
- localStorage保存
- last-good復元
- PWA
- manifest
- service worker
- アイコン表示
- 棚アイコン変更
- Save Point
- Settings

## 公開前チェック

- 実データ入りJSONを置かない
- 課題CSVを置かない
- ローカルWindowsパスを置かない
- note販売数や反応メモを置かない
- 未公開制作メモを置かない
- 本業情報・会社情報・機密情報を置かない
- 公開してよい画像だけをassetsに残す
- 個人JSONはローカルでインポートして使う

## まだ残っている課題

- 課題編集機能
- Evidence独立画面
- Decision Log独立画面
- 個人JSONの入力バリデーション強化
- 公開前チェックの自動警告
- GitHub自動デプロイ
- note API連携
- RPG本体との直接連携

## 動作確認結果

- 通常ブラウザ表示: OK
- manifest読み込み: OK
- manifest name: `Axion Board - 三姉妹実装ナビ`
- service worker登録: OK
- cache name: `axion-board-sanseimai-ip-nav-revF-v1`
- HomeでPhase 2現在地表示: OK
- Phase 0〜7表示: OK
- 現在地Phase 2強調: OK
- Issues表示: OK
- Issue詳細でsource_file/source_folder表示: OK
- Shelves 8棚表示: OK
- Save Point表示: OK
- localStorage保存: OK
- 再読み込み後の保持: OK
- JSONエクスポート: OK
- JSONインポート: OK
- オフライン最低限表示: OK
- 公開フォルダ内のローカルWindowsパス混入: なし
- 旧RevB〜RevE検証画像の残存: なし
- 確認スクリーンショット: `docs/revF_home_test.png`
