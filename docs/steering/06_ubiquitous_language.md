# ユビキタス言語定義書

**バージョン**: 1.0
**作成日**: 2026年3月15日
**最終更新**: 2026年3月15日

---

## 1. 概要

このドキュメントは、AI Safe Markdown Previewプロジェクトで使用する共通用語を定義します。ドキュメント・コード・会話で一貫した用語を使用することで、認識のずれを防ぎます。

---

## 2. コアドメイン用語

### 2.1 プレビュー（Preview）

| 用語 | 英語表記 | 定義 | コード上の表現 |
|------|---------|------|---------------|
| プレビュー | Preview | MarkdownファイルのHTMLレンダリングを表示するVSCodeタブ | `WebviewPanel` |
| プレビューパネル | Preview Panel | プレビューを表示するVSCodeのWebviewPanel | `panel: vscode.WebviewPanel` |
| プレビューマネージャー | Preview Manager | パネルのライフサイクルと更新を管理するクラス | `PreviewManager` |
| プレビュー起動 | Open Preview | プレビューパネルを生成または前面表示する操作 | `openPreview()` |
| 重複防止 | Panel Deduplication | 同一ファイルのパネルを2つ以上生成しない制御 | `panels: Map<string, WebviewPanel>` |

### 2.2 更新・デバウンス（Update / Debounce）

| 用語 | 英語表記 | 定義 | コード上の表現 |
|------|---------|------|---------------|
| 自動更新 | Auto Update | ドキュメント変更・保存イベントをトリガーにプレビューを更新する機能 | `updatePreview()` |
| デバウンス | Debounce | 短時間に連続する更新イベントをまとめて1回だけ処理する制御 | `debounce()` |
| デバウンス待機時間 | Debounce Wait | デバウンスの遅延時間（1000ms） | `DEBOUNCE_WAIT_MS` |
| リアルタイム更新 | Realtime Update | ファイル編集中（未保存）の変更でプレビューを更新すること | `onDidChangeTextDocument` |
| 保存時更新 | Save Update | ファイル保存時にプレビューを更新すること | `onDidSaveTextDocument` |
| AI更新耐性 | AI Update Resilience | AIエージェントの高頻度書き込みでもクラッシュしない堅牢性 | - |

### 2.3 レンダリング（Rendering）

| 用語 | 英語表記 | 定義 | コード上の表現 |
|------|---------|------|---------------|
| Markdownレンダラー | Markdown Renderer | Markdownテキストを HTMLに変換するモジュール | `markdownRenderer` |
| HTMLテンプレート | HTML Template | Webviewに渡す完全なHTML文字列を生成する関数 | `buildHtml()` |
| Webviewコンテンツ | Webview Content | パネルに表示するHTML文字列 | `panel.webview.html` |
| レンダリングエラー | Render Error | Markdown/Mermaidのパース・描画に失敗した状態 | - |
| エラー耐性 | Error Resilience | パースエラーが発生してもパネルを維持し続ける特性 | - |

### 2.4 Mermaid

| 用語 | 英語表記 | 定義 | コード上の表現 |
|------|---------|------|---------------|
| Mermaidブロック | Mermaid Block | ` ```mermaid ``` ` で囲まれた図表定義のコードブロック | `<div class="mermaid">` |
| Mermaidレンダリング | Mermaid Rendering | Mermaidブロックをブラウザ側でSVG図表に変換する処理 | `mermaid.run()` |
| Mermaidエラー隔離 | Mermaid Error Isolation | 特定の図のエラーが他の図・本文に影響しない設計 | - |
| バンドル済みMermaid | Bundled Mermaid | CDNではなく`dist/`に同梱されたmermaid.js | `dist/mermaid.min.js` |

### 2.5 VSCode拡張機能（Extension）

| 用語 | 英語表記 | 定義 | コード上の表現 |
|------|---------|------|---------------|
| アクティベーション | Activation | 拡張機能が初めて使用されたときに実行される初期化処理 | `activate()` |
| コマンド | Command | コマンドパレット・メニューから呼び出せる処理単位 | `vscode.commands.registerCommand()` |
| コントリビューション | Contribution | `package.json` でVSCodeに登録する拡張ポイント（メニュー・コマンドなど） | `contributes` |
| CSP | Content Security Policy | Webviewで許可するリソースを制限するセキュリティポリシー | `<meta http-equiv="Content-Security-Policy">` |
| ローカルリソース | Local Resource | Webviewからアクセス可能な拡張機能内ファイル | `localResourceRoots` |
| サブスクリプション | Subscription | 拡張機能非アクティブ時に自動解放されるリソース登録 | `context.subscriptions` |

---

## 3. 略語集

| 略語 | 正式名称 | 説明 |
|------|---------|------|
| CSP | Content Security Policy | Webviewのセキュリティポリシー |
| URI | Uniform Resource Identifier | ファイルやリソースの識別子 |
| PR | Pull Request | プルリクエスト |
| WBS | Work Breakdown Structure | 作業分解構造 |

---

## 変更履歴

| 日付 | バージョン | 変更内容 | 作成者 |
|------|----------|---------|--------|
| 2026-03-15 | 1.0 | 初版作成 | - |
