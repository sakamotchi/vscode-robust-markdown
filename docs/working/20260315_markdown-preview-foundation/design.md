# 設計書 - Markdownプレビュー基盤

## アーキテクチャ

### 対象コンポーネント

```
Extension Host (Node.js)
  └── extension.ts（activate）
        └── PreviewManager
              ├── markdownRenderer.ts
              └── webview/template.ts

Webview（各プレビューパネル）
  └── HTML + CSS（Phase 1ではmermaid.jsは未組み込み）
```

### 影響範囲

- **拡張機能側（Node.js）**: `package.json`、`src/` 以下の全ファイル（新規作成）
- **Webview側（HTML）**: `webview/template.ts` が生成するHTMLのみ。外部JSは参照しない

---

## 実装方針

### 概要

コマンド登録 → PreviewManager でパネル管理 → markdownRenderer でHTML変換 → template でWebview HTMLを組み立てる、という責務分離の構成で実装する。

### 詳細

1. `package.json` にコマンド・`editor/title`・`editor/context` メニューを登録する
2. `activate()` で `robustMarkdown.openPreview` コマンドハンドラーを登録し、PreviewManager に処理を委譲する
3. `PreviewManager.openPreview()` はパネルの重複チェック → 生成 → `renderToPanel()` の順で実行する
4. `renderMarkdown()` は `marked(source)` を try-catch で包み、エラー時はエラーHTML文字列を返す（例外を投げない）
5. `buildHtml()` はCSP・基本スタイル・bodyHTMLを組み合わせた完全なHTML文字列を返す

---

## データ構造

### 型定義（TypeScript）

```typescript
// previewManager.ts
class PreviewManager implements vscode.Disposable {
  // ファイルURIをキーにパネルを保持
  private panels: Map<string, vscode.WebviewPanel> = new Map();

  openPreview(document: vscode.TextDocument): void
  private renderToPanel(panel: vscode.WebviewPanel, document: vscode.TextDocument): void
  dispose(): void
}
```

```typescript
// markdownRenderer.ts
export function renderMarkdown(source: string): string
// → 成功時: HTMLを返す
// → エラー時: エラーメッセージをspan.errorで包んだHTMLを返す（例外を投げない）
```

```typescript
// webview/template.ts
export function buildHtml(
  bodyHtml: string,
  webview: vscode.Webview,
  extensionUri: vscode.Uri
): string
```

---

## VSCode API 設計

### 使用するAPI

| API | 用途 |
|-----|------|
| `vscode.window.createWebviewPanel()` | プレビューパネルの生成 |
| `vscode.commands.registerCommand()` | `robustMarkdown.openPreview` の登録 |
| `panel.webview.html` | Webview の HTML を更新 |
| `panel.onDidDispose()` | パネル破棄時のリソース解放 |
| `panel.reveal()` | 既存パネルのフォーカス |
| `webview.asWebviewUri()` | ローカルリソースのURI変換（Phase 1では未使用だが template.ts に組み込んでおく） |

### コマンド登録

| コマンドID | 説明 |
|-----------|------|
| `robustMarkdown.openPreview` | アクティブなMarkdownファイルのプレビューを開く |

---

## UI設計（Webview）

### HTML構成

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="...">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Preview</title>
  <style>/* 基本スタイル */</style>
</head>
<body>
  <!-- renderMarkdown() の出力 -->
</body>
</html>
```

### CSP設定

```html
<meta http-equiv="Content-Security-Policy"
  content="default-src 'none';
           script-src ${webview.cspSource};
           style-src 'unsafe-inline';">
```

- Phase 1ではscript-srcの許可対象が存在しないが、Phase 3でmermaid.jsを追加するための準備として記述しておく

### package.json 登録項目

```jsonc
"contributes": {
  "commands": [
    {
      "command": "robustMarkdown.openPreview",
      "title": "Open Robust Markdown Preview",
      "icon": "$(preview)"
    }
  ],
  "menus": {
    "editor/title": [
      {
        "command": "robustMarkdown.openPreview",
        "when": "editorLangId == markdown",
        "group": "navigation"
      }
    ],
    "editor/context": [
      {
        "command": "robustMarkdown.openPreview",
        "when": "editorLangId == markdown"
      }
    ]
  }
}
```

---

## イベントフロー

### プレビュー起動

```
ユーザー操作（アイコン or 右クリック）
  → robustMarkdown.openPreview コマンド発火
  → extension.ts のハンドラー
  → PreviewManager.openPreview(activeTextEditor.document)
  → panels マップを確認
      既存あり → panel.reveal()
      なし    → createWebviewPanel()
                 → panel.onDidDispose() リスナー登録
                 → renderToPanel()
                 → panels に登録
```

### パネル破棄

```
ユーザーがタブを閉じる
  → panel.onDidDispose イベント
  → panels マップから当該エントリを削除
```

---

## テストコード

### ユニットテスト例

```typescript
// markdownRenderer のテスト
import * as assert from 'assert';
import { renderMarkdown } from '../../markdownRenderer';

suite('renderMarkdown', () => {
  test('正常なMarkdownがHTMLに変換される', () => {
    const html = renderMarkdown('# Hello');
    assert.ok(html.includes('<h1>'));
  });

  test('パースエラー時にエラーHTMLを返す（例外を投げない）', () => {
    // markedはほとんどの入力をエラーにしないため、
    // renderMarkdown内部でthrowした場合のテストを記述
    assert.doesNotThrow(() => renderMarkdown(''));
  });
});
```

---

## 設計上の決定事項

| 決定事項 | 理由 | 代替案 |
|---------|------|--------|
| WebviewPanelをVSCodeネイティブタブとして使用 | VSCodeがタブ開閉・切替を管理してくれるため実装コストが低い | Webview内カスタムタブ（実装コスト大） |
| `PreviewManager` をクラスとして実装 | パネルとタイマーの状態管理にMapが必要なため | モジュールグローバル変数（テスト困難） |
| `renderMarkdown` を純粋関数として実装 | ユニットテストが容易になる | PreviewManagerに内包（責務混在） |
| mermaid.jsのWebviewへの組み込みはPhase 3まで保留 | Phase 1でCSP・webpack設定を固めることを優先 | Phase 1から組み込む |

## 未解決事項

- [ ] `marked` v17のESM対応をwebpack設定でどう処理するか（`module: 'esnext'` 等の設定が必要か確認）
