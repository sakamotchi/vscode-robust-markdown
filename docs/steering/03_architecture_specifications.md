# 技術仕様書

**バージョン**: 1.0
**作成日**: 2026年3月15日
**最終更新**: 2026年3月15日

---

## 1. 技術スタック

| レイヤー | 技術 | バージョン |
|---------|------|-----------|
| 実行環境 | VSCode Extension Host (Node.js) | - |
| 言語 | TypeScript | 5.9.x |
| ビルドツール | webpack | 5.x |
| Markdownパーサー | marked | 17.x |
| 図表レンダリング | mermaid | 11.x |
| リンター | ESLint (typescript-eslint) | 9.x |
| テストフレームワーク | @vscode/test-cli + Mocha | - |

---

## 2. システム構成

### 2.1 全体構成図

```
VSCode
  └── Extension Host (Node.js)
        └── src/extension.ts      ← activate() / deactivate()
              └── PreviewManager  ← パネル管理・更新制御
                    ├── markdownRenderer.ts  ← Markdown → HTML 変換
                    ├── debounce.ts          ← デバウンスユーティリティ
                    └── webview/template.ts  ← HTML テンプレート生成

Webview（各プレビューパネル）
  └── HTML + CSS + mermaid.js（バンドル済み）
```

### 2.2 ビルド構成

```
webpack
  ├── エントリー: src/extension.ts
  ├── 出力: dist/extension.js（CommonJS・node ターゲット）
  ├── 外部化: vscode（Extension Host が提供するため）
  ├── ts-loader: TypeScript → JavaScript
  └── CopyWebpackPlugin:
        node_modules/mermaid/dist/mermaid.min.js
          → dist/mermaid.min.js（Webviewから参照）
```

---

## 3. モジュール設計

### 3.1 モジュール一覧

```
src/
  extension.ts          # エントリーポイント（activate / deactivate）
  previewManager.ts     # WebviewPanel の生成・管理・更新ロジック
  markdownRenderer.ts   # Markdown → HTML 変換・Mermaid前処理
  debounce.ts           # デバウンスユーティリティ
  webview/
    template.ts         # Webview に渡す HTML テンプレート生成
  test/
    extension.test.ts   # 統合テスト
```

### 3.2 extension.ts

- `activate()` でコマンドハンドラーとドキュメントイベントリスナーを登録
- `PreviewManager` のインスタンスを生成し `context.subscriptions` に登録
- `deactivate()` は空実装（VSCode が subscriptions を自動破棄する）

### 3.3 PreviewManager

拡張機能の中核クラス。WebviewPanelのライフサイクルを管理する。

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

### 3.4 markdownRenderer.ts

`marked` を使って Markdown → HTML に変換する純粋関数モジュール。

```typescript
export function renderMarkdown(source: string): string
```

- ` ```mermaid ``` ` ブロックを `<div class="mermaid">〜</div>` に変換してから `marked` に渡す
- パースエラーは catch してエラーメッセージ入りの HTML を返す（例外を外に投げない）

### 3.5 debounce.ts

汎用デバウンス関数。

```typescript
export function debounce(fn: () => void, wait: number): () => void
```

`PreviewManager` 内でパネルごとに独立したデバウンス関数を生成して使用する。

### 3.6 webview/template.ts

Webview に渡す完全な HTML 文字列を生成する。

```typescript
export function buildHtml(bodyHtml: string, webview: vscode.Webview, extensionUri: vscode.Uri): string
```

**含まれる要素**

- CSP — nonce ベース（`script-src 'nonce-{random}' ${webview.cspSource}`）
- `dist/mermaid.min.js` を `webview.asWebviewUri()` で参照
- Mermaid の初期化スクリプト（`mermaid.initialize()` + `mermaid.run({ suppressErrors: true })`）
- ライト/ダーク テーマ切り替えボタン（sticky バー）
- VSCode のカラーテーマ種別（Dark/Light）に基づく初期モード設定
- 基本スタイル（`body.vr-dark` / `body.vr-light` クラス切り替え方式）

---

## 4. イベントフロー

### 4.1 プレビュー起動

```
ユーザー操作（アイコン or 右クリック）
  → robustMarkdown.openPreview コマンド発火
  → PreviewManager.openPreview(activeTextEditor.document)
  → panels マップを確認
      既存あり → panel.reveal()
      なし    → createWebviewPanel() → renderToPanel() → panels に登録
```

### 4.2 自動更新（デバウンス）

```
onDidChangeTextDocument / onDidSaveTextDocument
  → 対応パネルが panels マップに存在するか確認
  → 存在する場合のみ PreviewManager.updatePreview(document)
  → debounce(1000ms) 経由で panel.webview.postMessage({ type: 'update', bodyHtml }) を送信
  → Webview 側の message リスナーが #content の innerHTML のみ差し替え・Mermaid再描画
  ※ webview.html を差し替えないためユーザーのテーマ切り替え状態が維持される
```

### 4.3 パネル破棄

```
ユーザーがタブを閉じる
  → panel.onDidDispose イベント
  → panels マップ・debounceTimers マップから当該エントリを削除
```

---

## 5. エラー処理方針

| エラー種別 | 対処 |
|---|---|
| Markdownパースエラー | catch してエラーメッセージをWebview内に表示。パネルは維持 |
| Mermaidレンダリングエラー | 図ごとにキャッチ。他の図・本文に影響させない |
| パネル生成失敗 | VSCode API 例外を catch し `vscode.window.showErrorMessage()` で通知 |

---

## 6. package.json 登録項目

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

## 7. 技術的制約・注意事項

- mermaid.js は `CopyWebpackPlugin` で `dist/mermaid.min.js` にコピーし、`webview.asWebviewUri()` で参照する（webpackのバンドル対象外）
- `marked` v17+ は ESM のみ提供のため、webpack 設定で CommonJS 互換に変換されることを確認する
- Webview の `localResourceRoots` は `dist/` のみに限定する

---

## 変更履歴

| 日付 | バージョン | 変更内容 | 作成者 |
|------|----------|---------|--------|
| 2026-03-15 | 1.0 | 初版作成 | - |
