# Axion Board - 三姉妹実装ナビ - RevF

RevFは、Axion Board Mobile / Lunier RevEをベースにした専用派生版です。三姉妹IPを社会に出すまでのPhase、棚、課題、根拠、判断ログを、スマホで見られる個人用ナビとして扱います。

RevE本体は変更していません。RevFは専用フォルダとして独立しています。

## 目的

これは単なるToDo管理ではありません。三姉妹IPを「社会に出すまでの開発ナビ」として扱い、いま動かす棚と、安心して置く棚を選ぶためのボードです。

現在地:

```text
Phase 2｜体験Vertical Slice
プロローグ〜第1章ブラウザRPG体験版を、人に見せられる短編体験として磨く段階
```

最重要方針:

```text
作品を薄めず、読者が迷わない入口を整える
```

## RevEから引き継いだ機能

- スマホ向け表示
- 下部固定ナビ
- 棚詳細
- Save Point
- localStorage保存
- JSONインポート
- JSONエクスポート
- last-good復元
- 棚アイコン変更
- PWA
- manifest
- service worker
- ホーム画面追加

## RevFで追加したもの

- 三姉妹IP社会実装ナビ用Home
- Phase 0〜7表示
- 現在地Phase 2の強調
- Issues一覧
- Issue詳細パネル
- Evidence表示
- Decision Log表示
- 専用Shelves画面
- `ip_nav` データ構造
- 公開用seed `data/seed/sanseimai_ip_nav_empty_seed.json`
- 公開/非公開データポリシー

## 起動方法

ローカル確認では静的サーバーを使います。

```powershell
cd axion-board-sanseimai-ip-nav-revF
python -m http.server 8014
```

ブラウザで開きます。

```text
http://localhost:8014/
```

PWA登録は `file://` では動きません。`http://localhost` またはGitHub PagesのHTTPS URLで確認してください。

## JSONインポート方法

1. 設定画面を開く
2. 「JSONを読み込む」を押す
3. ローカルで管理しているRevF個人JSONを選ぶ
4. 読み込み前の状態は `last-good` に退避される
5. 読み込み後はブラウザ内localStorageに保存される

読み込んだJSONはGitHubへ送信されません。スマホまたはPCのブラウザ内で処理されます。

## PWA確認方法

1. GitHub Pagesまたは `http://localhost` で一度開く
2. 設定画面でPWA説明が表示されることを確認する
3. AndroidはChromeメニューから「ホーム画面に追加」
4. iPhoneはSafari共有メニューから「ホーム画面に追加」
5. 追加後にホーム画面から起動する

アプリが古い表示のままなら、設定画面の「アプリ更新を確認」を押してから再読み込みしてください。

## GitHub Pagesに置いてよいもの

- アプリ本体
- 空フォーマット
- ダミーseed
- 公開済みリンク
- 公開してよい汎用アイコン

## GitHub Pagesに置いてはいけないもの

- 実データ入りJSON
- `03_extracted_issue_candidates.csv`
- `ip_nav.issues` の実データ
- `ip_nav.evidence` の実データ
- `decision_log` の実データ
- ローカルパス
- note販売数・反応メモ
- 未公開制作メモ
- 本業情報・会社情報・機密情報

## 公開前チェックリスト

- `data/seed/` に公開用seedだけが入っている
- 実データ入りJSONを置いていない
- 課題CSVを置いていない
- ローカルWindowsパスを置いていない
- 未公開制作メモを置いていない
- note販売数や反応メモを置いていない
- docsに公開してよい説明だけが入っている
- assetsに公開してよい画像だけが入っている
- JSONバックアップをローカルに保存した

## データ保存の注意

- 編集データはlocalStorageに保存されます。
- 端末やブラウザを変えると共有されません。
- ブラウザのサイトデータ削除で消える可能性があります。
- 定期的にJSONエクスポートしてください。
- エクスポートした実データ入りJSONはGitHubへ置かないでください。

## 既知の制限

- 課題編集機能は未実装です。
- note API連携はありません。
- GitHub自動デプロイはありません。
- RPG本体との直接連携はありません。
- 青PDP全文検索はありません。
- Excel自動生成はありません。
- 実データ入りJSONの公開は想定していません。

## 次回改善案

- Issuesの編集機能
- Evidence独立画面
- Decision Log独立画面
- 個人JSONのバリデーション
- 公開前チェックの自動警告
- Phase別ダッシュボードの強化
