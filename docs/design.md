# 概要設計書
## プロジェクト名: AI Safe Markdown Preview (VSCode Extension)

---

## 1. システム構成

```
src/
  extension.ts          # エントリーポイント（activate / deactivate）
  previewManager.ts     # WebviewPanel の生成・管理・更新ロジック
  markdownRenderer.ts   # Markdown → HTML 変換・Mermaid前処理
  debounce.ts           # デバウンスユーティリティ
  webview/
    template.ts         # Webview に渡す HTML テンプレート生成
```

---

## 2. モジュール設計

### 2.1 extension.ts
- `activate()` でコマンドハンドラーとドキュメントイベントリスナーを登録し、`PreviewManager` のインスタンスを生成して `context.subscriptions` に渡す
- `deactivate()` は空実装でよい（VSCode が subscriptions を自動破棄する）

### 2.2 PreviewManager
拡張の中核クラス。WebviewPanel のライフサイクルを管理する。

**状態**
```typescript
// ファイルURIをキーにパネルを保持
private panels: Map<string, vscode.WebviewPanel>
// ファイルURIをキーにデバウンスタイマーを保持
private debounceTimers: Map<string, NodeJS.Timeout>
```

**主要メソッド**
| メソッド | 役割 |
|---|---|
| `openPreview(document)` | 新規パネル生成または既存パネルをフォーカス |
| `updatePreview(document)` | デバウンス経由でレンダリングを再実行 |
| `renderToPanel(panel, document)` | HTML生成 → `panel.webview.html` に反映 |
| `dispose()` | 全パネル・タイマーの破棄 |

**重複防止**
同一ファイルの `openPreview()` 呼び出しでは、`panels` マップに既存パネルがあれば `reveal()` するだけで新規生成しない。

### 2.3 markdownRenderer.ts
`marked` を使って Markdown → HTML に変換する純粋関数モジュール。

```typescript
export function renderMarkdown(source: string): string
```

- ` ```mermaid ``` ` ブロックを `<div class="mermaid">〜</div>` に変換してから `marked` に渡す
- パースエラーは catch してエラーメッセージ入りの HTML を返す（例外を外に投げない）

### 2.4 debounce.ts
汎用デバウンス関数。

```typescript
export function debounce(fn: () => void, wait: number): () => void
```

`PreviewManager` 内でパネルごとに独立したデバウンス関数を生成して使用する。

### 2.5 webview/template.ts
Webview に渡す完全な HTML 文字列を生成する。

```typescript
export function buildHtml(bodyHtml: string, webview: vscode.Webview): string
```

**含まれる要素**
- CSP（Content Security Policy）ヘッダー — `script-src` は `vscode-resource:` のみ許可（外部CDN不使用）
- バンドル済み mermaid.js を `webview.asWebviewUri()` で参照して読み込み
- mermaid の初期化スクリプト
- 基本スタイル（フォント・余白）

---

## 3. イベントフロー

### 3.1 プレビュー起動
```
ユーザー操作（アイコン or 右クリック）
  → robustMarkdown.openPreview コマンド発火
  → PreviewManager.openPreview(activeTextEditor.document)
  → panels マップを確認
      既存あり → panel.reveal()
      なし    → createWebviewPanel() → renderToPanel() → panels に登録
```

### 3.2 自動更新（デバウンス）
```
onDidChangeTextDocument / onDidSaveTextDocument
  → 対応パネルが panels マップに存在するか確認
  → 存在する場合のみ PreviewManager.updatePreview(document)
  → debounce(1000ms) 経由で renderToPanel() を呼び出し
```

### 3.3 パネル破棄
```
ユーザーがタブを閉じる
  → panel.onDidDispose イベント
  → panels マップ・debounceTimers マップから当該エントリを削除
```

---

## 4. エラー処理方針

| エラー種別 | 対処 |
|---|---|
| Markdown パースエラー | catch してエラーメッセージをWebview内に表示。パネルは維持 |
| Mermaid レンダリングエラー | mermaid.js の `securityLevel` と `errorLevel` 設定で隔離。他の図・本文に影響させない |
| パネル生成失敗 | VSCode API 例外を catch し、`vscode.window.showErrorMessage()` で通知 |

---

## 5. package.json 登録項目

```jsonc
"contributes": {
  "commands": [
    {
      "command": "robustMarkdown.openPreview",
      "title": "Open Robust Markdown Preview",
      "icon": "$(preview)"   // エディタータブアイコン
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

## 6. 技術的制約・注意事項

- Webview の `localResourceRoots` は必要最小限に設定する
- mermaid.js は `node_modules/mermaid/dist/mermaid.min.js` を webpack でバンドルせず別ファイルとして `dist/` にコピーし、`webview.asWebviewUri()` で参照する（webpackのバンドル対象外にするため `externals` または `CopyWebpackPlugin` を使用）
- `marked` のバージョン（v17+）はESMのみ提供のため、webpack の設定で CommonJS 互換に変換されることを確認する
