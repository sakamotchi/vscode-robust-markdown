# WBS（作業分解構成図）
## プロジェクト名: AI Safe Markdown Preview (VSCode Extension)

---

## 1. Markdownプレビュー基盤

### 1.1 コマンド登録
- 1.1.1 `robustMarkdown.openPreview` コマンドを `package.json` に定義
- 1.1.2 エディタータブ右端アイコンボタンの登録（`editor/title` contribution）
- 1.1.3 右クリックコンテキストメニューへの登録（`editor/context` contribution）
- 1.1.4 `extension.ts` でコマンドハンドラーを実装

### 1.2 WebviewPanel の生成
- 1.2.1 `vscode.window.createWebviewPanel()` でパネルを生成
- 1.2.2 パネルタイトルをファイル名に設定
- 1.2.3 同一ファイルの重複パネル生成を防ぐ管理マップの実装
- 1.2.4 パネル破棄時のリソース解放処理

### 1.3 Markdown → HTML レンダリング
- 1.3.1 `marked` を使った Markdown パース処理の実装
- 1.3.2 Webview に渡す HTML テンプレートの作成（CSP設定含む）
- 1.3.3 初回表示時のレンダリング呼び出し

---

## 2. 自動更新・AI更新耐性

### 2.1 ドキュメント変更の検知
- 2.1.1 `onDidChangeTextDocument` イベントリスナーの登録
- 2.1.2 `onDidSaveTextDocument` イベントリスナーの登録
- 2.1.3 対応するWebviewPanelへのイベントルーティング

### 2.2 デバウンス処理
- 2.2.1 デバウンス関数の実装（待機時間: 1000ms）
- 2.2.2 各パネルごとに独立したデバウンスタイマーの管理

### 2.3 エラーハンドリング
- 2.3.1 Markdown パースエラーの try-catch とインライン表示
- 2.3.2 パースエラー時もWebviewPanelを維持する処理
- 2.3.3 エラー表示用HTMLの作成

---

## 3. Mermaid対応

### 3.1 Mermaid レンダリング
- 3.1.1 Webview の HTML テンプレートへ mermaid.js を組み込み
- 3.1.2 ` ```mermaid ``` ` ブロックを `<div class="mermaid">` に変換する前処理
- 3.1.3 Webview 側での `mermaid.initialize()` / `mermaid.run()` 呼び出し

### 3.2 Mermaid エラー隔離
- 3.2.1 図ごとのエラーキャッチ処理（他の図・本文に影響させない）
- 3.2.2 エラー時のフォールバック表示（エラーメッセージをブロック内に表示）

---

## 4. テスト

### 4.1 ユニットテスト
- 4.1.1 デバウンス関数のテスト
- 4.1.2 Markdown → HTML 変換のテスト
- 4.1.3 エラーハンドリングのテスト（不正なMarkdown入力）

### 4.2 統合テスト
- 4.2.1 コマンド実行でWebviewPanelが開くことの確認
- 4.2.2 ドキュメント変更でプレビューが更新されることの確認
- 4.2.3 同一ファイルで重複パネルが生成されないことの確認

---

## 5. パッケージング・リリース準備

### 5.1 ドキュメント整備
- 5.1.1 README.md の更新（機能説明・使い方）
- 5.1.2 CHANGELOG.md の更新

### 5.2 ビルド確認
- 5.2.1 `npm run package` でプロダクションビルドの確認
- 5.2.2 `.vscodeignore` の内容確認
