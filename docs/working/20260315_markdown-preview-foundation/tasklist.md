# タスクリスト - Markdownプレビュー基盤

## 進捗サマリー

| 状態 | 件数 |
|------|------|
| 完了 | 11 |
| 進行中 | 0 |
| 未着手 | 0 |

## タスク一覧

### T-1: package.json コマンド・メニュー登録

- [x] `robustMarkdown.openPreview` コマンドを `commands` に定義（icon: `$(preview)`）
- [x] `editor/title` メニューに登録（`when: editorLangId == markdown`、group: navigation）
- [x] `editor/context` メニューに登録（`when: editorLangId == markdown`）
- [x] 動作確認（Extension Development Host でアイコン・右クリックメニューが表示される）

### T-2: markdownRenderer.ts の実装

- [x] `renderMarkdown(source: string): string` の実装
- [x] `marked.parse()` を try-catch で包む
- [x] エラー時に `<p class="error">...</p>` HTMLを返す（例外を投げない）
- [x] ユニットテスト作成（正常変換・エラー耐性）

### T-3: webview/template.ts の実装

- [x] `buildHtml(bodyHtml, webview, extensionUri): string` の実装
- [x] CSP設定の組み込み（`default-src 'none'; script-src ${webview.cspSource}; style-src 'unsafe-inline';`）
- [x] `webview.asWebviewUri()` の準備（Phase 3でmermaid.jsに使用するため構造を先に作る）
- [x] 基本スタイル（フォント・余白）の組み込み

### T-4: PreviewManager の実装

- [x] `panels: Map<string, vscode.WebviewPanel>` の状態管理
- [x] `openPreview(document)` の実装（重複チェック → `reveal()` or 新規生成）
- [x] `panel.onDidDispose()` でのリソース解放（panelsマップから削除）
- [x] `renderToPanel(panel, document)` の実装
- [x] `dispose()` の実装（全パネルの破棄）

### T-5: extension.ts の実装

- [x] `activate()` で `PreviewManager` を生成
- [x] `robustMarkdown.openPreview` コマンドハンドラーの登録
- [x] `PreviewManager` を `context.subscriptions` に登録
- [x] 動作確認（Extension Development Host でコマンド実行 → パネルが開く）

### T-6: テスト・仕上げ

- [x] `npm run compile` でビルドエラーなし
- [x] `npm run lint` でエラーなし
- [x] `npm test` でテストパス（3 passing）
- [x] 手動テスト（testing.md 全5ケース OK）
- [x] 永続化ドキュメント更新（`01_product_requirements.md` F001〜F004 を「完了」に変更）

## 完了条件

- [x] 全タスクが完了
- [x] `npm test` がパス
- [x] `npm run lint` がエラーなし
- [x] Markdownファイルでアイコン・右クリックの両方からプレビューが起動できる
- [x] 同一ファイルで重複パネルが生成されない
- [x] 永続化ドキュメントが更新済み

## 備考

### 実装時の技術的決定

| 決定事項 | 内容 |
|---------|------|
| tsconfig `module` | `Node16` → `CommonJS` に変更（marked ESM + webpack の組み合わせ対応） |
| tsconfig `skipLibCheck` | `true` を追加（mermaid/d3 の型定義がDOM型を要求するため） |
| webpack ts-loader | `transpileOnly: true` を追加（テストファイルを型チェック対象外に） |
