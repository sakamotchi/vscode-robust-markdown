# 要件定義書 - Markdownプレビュー基盤

## 概要

VSCode拡張機能としてMarkdownプレビューを起動・表示する基盤を実装する。
エディタータブ右端のアイコンまたは右クリックメニューから `robustMarkdown.openPreview` コマンドを呼び出すと、VSCodeネイティブタブ（WebviewPanel）でMarkdownのHTMLレンダリング結果が表示される。

## 背景・目的

Phase 1はプロジェクト全体の土台となる。WebviewPanel・CSP・webpackビルドが絡む最もリスクの高いフェーズであり、ここを固めることでPhase 2以降（自動更新・Mermaid対応）がスムーズになる。

## 要件一覧

### 機能要件

#### F-001: Markdownレンダリング

- **説明**: `marked` を使って Markdown → HTML に変換し WebviewPanel で表示する
- **受け入れ条件**:
  - [ ] 見出し（#〜######）が正しくレンダリングされる
  - [ ] リスト・コードブロック・テーブルが正しくレンダリングされる
  - [ ] 不正なMarkdownでもパネルがクラッシュしない

#### F-002: プレビュー起動（アイコンボタン）

- **説明**: エディタータブ右端のアイコンボタンからプレビューを起動できる
- **受け入れ条件**:
  - [ ] Markdownファイルを開いているときのみアイコンが表示される（`editorLangId == markdown`）
  - [ ] アイコンをクリックするとWebviewPanelが開く

#### F-003: プレビュー起動（右クリックメニュー）

- **説明**: エディター上での右クリックメニューからプレビューを起動できる
- **受け入れ条件**:
  - [ ] Markdownファイルを右クリックしたときメニューに「Open Robust Markdown Preview」が表示される
  - [ ] メニューを選択するとWebviewPanelが開く

#### F-004: 重複パネル防止

- **説明**: 同一ファイルのプレビューパネルを重複生成しない
- **受け入れ条件**:
  - [ ] 既にプレビューパネルが開いている状態でコマンドを再実行すると、既存パネルにフォーカスが移る
  - [ ] 新しいパネルは生成されない

### 非機能要件

- **CSP準拠**: `script-src` は `vscode-resource:` のみ許可。外部URL不可
- **オフライン動作**: 外部リソースを参照しない（Phase 1ではmermaid.jsは未使用）
- **保守性**: PreviewManager・markdownRenderer・template の責務を分離する

## スコープ

### 対象

- `package.json` へのコマンド・メニュー登録
- `extension.ts` のコマンドハンドラー実装
- `PreviewManager` クラスの実装（パネル生成・管理のみ、自動更新はPhase 2）
- `markdownRenderer.ts` の基本実装（`marked` によるHTML変換、エラーハンドリング）
- `webview/template.ts` の実装（HTMLテンプレート生成、CSP設定）

### 対象外

- 自動更新（`onDidChangeTextDocument` / `onDidSaveTextDocument`）→ Phase 2
- デバウンス処理 → Phase 2
- Mermaid対応 → Phase 3

## 実装対象ファイル（予定）

- `package.json` — コマンド・メニュー定義の追加
- `src/extension.ts` — activate() でコマンド登録
- `src/previewManager.ts` — 新規作成
- `src/markdownRenderer.ts` — 新規作成
- `src/webview/template.ts` — 新規作成

## 依存関係

- `marked` v17.x — Markdown → HTML 変換（バンドル済み）
- `vscode` API — WebviewPanel、コマンド登録

## 既知の制約

- `marked` v17+ は ESM のみのため、webpackのCommonJS互換変換が必要
- Webviewの `localResourceRoots` は `dist/` のみに限定する
- Phase 1時点ではmermaid.jsのCopyWebpackPluginコピーは設定するが、HTMLには未組み込みでよい

## 参考資料

- `docs/steering/01_product_requirements.md` — F001〜F004の定義
- `docs/steering/03_architecture_specifications.md` — モジュール設計・イベントフロー・package.json登録項目
