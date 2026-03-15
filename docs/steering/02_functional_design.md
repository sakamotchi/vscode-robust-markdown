# 機能設計書

**バージョン**: 1.0
**作成日**: 2026年3月15日
**最終更新**: 2026年3月15日

---

## 1. 機能一覧

| カテゴリ | 説明 | 詳細ドキュメント |
|---------|------|-----------------|
| プレビュー起動 | エディタアイコン・右クリックからの起動 | 本ドキュメント §2 |
| Markdownレンダリング | `marked` によるHTML変換・WebviewPanel表示 | 本ドキュメント §3 |
| 自動更新 | 編集・保存イベントによるデバウンス更新 | 本ドキュメント §4 |
| Mermaid対応 | 図表のレンダリングとエラー隔離 | 本ドキュメント §5 |

---

## 2. プレビュー起動

### 2.1 起動方法

| 起動方法 | contribution | 表示条件 |
|---------|-------------|---------|
| エディタータブ右端アイコン | `editor/title` メニュー | `editorLangId == markdown` |
| 右クリックコンテキストメニュー | `editor/context` メニュー | `editorLangId == markdown` |

### 2.2 動作フロー

```
ユーザー操作（アイコン or 右クリック）
  → robustMarkdown.openPreview コマンド発火
  → アクティブエディターの document を取得
  → PreviewManager.openPreview(document)
      ├── panels マップに既存パネルあり → panel.reveal() で前面表示
      └── なし → createWebviewPanel() → renderToPanel() → panels に登録
```

### 2.3 ユーザーストーリー

```gherkin
Feature: プレビュー起動

  Scenario: アイコンボタンからプレビューを開く
    Given Markdownファイルをエディターで開いている
    When エディタータブ右端のプレビューアイコンをクリックする
    Then 新しいVSCodeタブにMarkdownのプレビューが表示される

  Scenario: 右クリックからプレビューを開く
    Given Markdownファイルをエディターで開いている
    When エディター上で右クリックしてコンテキストメニューを開く
    And「Open Robust Markdown Preview」を選択する
    Then 新しいVSCodeタブにMarkdownのプレビューが表示される

  Scenario: 同一ファイルのプレビューを重複起動しない
    Given Markdownファイルのプレビューが既に開いている
    When 再びプレビューアイコンをクリックする
    Then 新しいパネルは生成されず、既存パネルが前面に表示される
```

---

## 3. Markdownレンダリング

### 3.1 レンダリングフロー

```
document.getText() でMarkdownテキスト取得
  → markdownRenderer.renderMarkdown(source)
      ├── ```mermaid``` ブロックを <div class="mermaid"> に変換
      ├── marked でMarkdown → HTML 変換
      └── エラー時: エラーメッセージHTMLを返す（例外を投げない）
  → webview/template.buildHtml(bodyHtml, webview)
      → CSP + mermaid.js + スタイル を含む完全なHTMLを生成
  → panel.webview.html に設定
```

### 3.2 エラー表示

Markdownパースエラーが発生した場合：
- パネルは閉じない・クラッシュしない
- エラー内容をWebview内にインライン表示する
- 次の更新で正常なMarkdownが来れば通常表示に戻る

### 3.3 ユーザーストーリー

```gherkin
Feature: Markdownレンダリング

  Scenario: Markdownが正しくHTMLに変換される
    Given Markdownファイルをプレビュー表示している
    When プレビューパネルを確認する
    Then MarkdownがHTMLに変換されて表示される

  Scenario: パースエラーでもパネルが維持される
    Given プレビューを表示中のMarkdownファイルに不正な構文を入力する
    When プレビューが更新される
    Then パネルは閉じず、エラーメッセージがインラインで表示される
```

---

## 4. 自動更新

### 4.1 更新トリガー

| トリガー | イベント | 条件 |
|---------|---------|------|
| リアルタイム編集 | `onDidChangeTextDocument` | 対応するプレビューパネルが開いている |
| ファイル保存 | `onDidSaveTextDocument` | 対応するプレビューパネルが開いている |

### 4.2 デバウンス処理

- 待機時間: **1000ms**
- パネルごとに独立したタイマーを管理
- 待機中に新しいイベントが来た場合、タイマーをリセット

### 4.3 ユーザーストーリー

```gherkin
Feature: 自動更新

  Scenario: 編集中にプレビューが自動更新される
    Given Markdownファイルのプレビューを表示している
    When ファイルを編集する
    And 1000ms 経過する
    Then プレビューが最新の内容に更新される

  Scenario: AIエージェントの高頻度更新でもクラッシュしない
    Given Markdownファイルのプレビューを表示している
    When AIエージェントが1秒間に複数回ファイルを更新する
    Then プレビューはクラッシュせず、最後の更新から1000ms後に表示が更新される
```

---

## 5. Mermaid対応

### 5.1 レンダリング方式

- mermaid.js は `node_modules/mermaid/dist/mermaid.min.js` を `dist/` にコピーしてバンドル
- `webview.asWebviewUri()` でローカルリソースとして参照（CDN不使用）
- Webview読み込み後に `mermaid.initialize()` + `mermaid.run()` を実行

### 5.2 エラー隔離

- 図ごとに独立してエラーをキャッチ
- 1つの図のエラーが他の図や本文のレンダリングに影響しない
- エラーのある図は該当ブロック内にエラーメッセージを表示

### 5.3 ユーザーストーリー

```gherkin
Feature: Mermaid対応

  Scenario: Mermaid図が表示される
    Given ```mermaid ブロックを含むMarkdownファイルをプレビュー表示している
    When プレビューパネルを確認する
    Then Mermaidの図が正しく描画されている

  Scenario: エラーのある図が他に影響しない
    Given 複数の ```mermaid ブロックを含むMarkdownファイルをプレビュー表示している
    And 1つのブロックに構文エラーがある
    When プレビューパネルを確認する
    Then エラーのあるブロックにはエラーメッセージが表示される
    And 他の正常なブロックは正しく描画されている
```

---

## 6. テーマ切り替え

### 6.1 概要

プレビュー上部の sticky バーにテーマ切り替えボタンを表示する。ボタンクリックでプレビュー全体（背景・文字・コードブロック・Mermaid図）のライト/ダークを切り替える。

### 6.2 動作仕様

- **初期モード**: VSCode のカラーテーマ種別（`vscode.window.activeColorTheme.kind`）に連動
  - Dark / High Contrast → ダークモード
  - Light / High Contrast Light → ライトモード
- **ボタンラベル**: 切り替え先を表示（ダーク時は `☀ ライト`、ライト時は `☾ ダーク`）
- **状態の保持**: 編集・保存による自動更新は `postMessage` でコンテンツのみ差し替えるため、テーマ切り替え状態が維持される

### 6.3 ユーザーストーリー

```gherkin
Feature: テーマ切り替え

  Scenario: プレビューをライトモードに切り替える
    Given ダークモードでプレビューを表示している
    When 上部の「☀ ライト」ボタンをクリックする
    Then プレビュー全体がライトモードに切り替わる

  Scenario: 編集後もテーマが維持される
    Given ライトモードに切り替えてプレビューを表示している
    When Markdownファイルを編集・保存する
    Then プレビューが更新されてもライトモードが維持される
```

---

## 変更履歴

| 日付 | バージョン | 変更内容 | 作成者 |
|------|----------|---------|--------|
| 2026-03-15 | 1.0 | 初版作成 | - |
| 2026-03-15 | 1.1 | テーマ切り替え機能（§6）を追加 | - |
