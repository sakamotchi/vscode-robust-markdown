# 開発ガイドライン

**バージョン**: 1.0
**作成日**: 2026年3月15日
**最終更新**: 2026年3月15日

---

## 1. 開発環境セットアップ

### 1.1 必要なツール

| ツール | バージョン | 用途 |
|--------|-----------|------|
| Node.js | 18以上 | 実行環境 |
| npm | - | パッケージ管理 |
| VSCode | 1.110.0以上 | 開発・デバッグ |

### 1.2 開発コマンド

```bash
npm run compile        # 開発ビルド（webpack）
npm run watch          # インクリメンタルビルド（開発中はこちら）
npm run package        # プロダクションビルド
npm run lint           # ESLint 実行
npm run compile-tests  # テストを out/ へコンパイル
npm test               # フルテスト実行
```

### 1.3 デバッグ実行

F5 を押すと `.vscode/launch.json` の設定に基づき Extension Development Host が起動する。プレビュー機能の動作確認はこの方法で行う。

---

## 2. コーディング規約

### 2.1 基本ルール

```typescript
// ✅ Good: 明示的な型定義
function renderMarkdown(source: string): string {
  // ...
}

// ❌ Bad: any型の使用
const result: any = panel.webview.html
```

### 2.2 エラーハンドリング

VSCode拡張では例外がExtension Hostをクラッシュさせる可能性があるため、ユーザー向け処理のエラーは必ず catch する。

```typescript
// ✅ Good: パースエラーを catch してフォールバック
export function renderMarkdown(source: string): string {
  try {
    return marked.parse(source)
  } catch (error) {
    return `<p class="error">Markdown parse error: ${String(error)}</p>`
  }
}

// ✅ Good: Webview操作のエラーをユーザーに通知
async function openPreview(document: vscode.TextDocument) {
  try {
    // ...
  } catch (error) {
    vscode.window.showErrorMessage(`Preview error: ${String(error)}`)
  }
}
```

### 2.3 VSCode API の使い方

```typescript
// ✅ Good: subscriptions に登録してリソースリークを防ぐ
context.subscriptions.push(
  vscode.commands.registerCommand('robustMarkdown.openPreview', handler),
  vscode.workspace.onDidChangeTextDocument(handler),
)

// ✅ Good: panel破棄時にマップから削除する
panel.onDidDispose(() => {
  this.panels.delete(uri)
  this.clearDebounceTimer(uri)
}, null, context.subscriptions)
```

### 2.4 Webview CSP

Webviewの `localResourceRoots` と CSP は必要最小限に設定する。

```typescript
// ✅ Good: localResourceRoots を dist/ に限定
const panel = vscode.window.createWebviewPanel(
  'robustMarkdownPreview',
  title,
  vscode.ViewColumn.Beside,
  {
    enableScripts: true,
    localResourceRoots: [
      vscode.Uri.joinPath(context.extensionUri, 'dist')
    ],
  }
)
```

```html
<!-- ✅ Good: script-src は vscode-resource: のみ -->
<meta http-equiv="Content-Security-Policy"
  content="default-src 'none';
           script-src ${webview.cspSource};
           style-src 'unsafe-inline';">
```

---

## 3. テスト戦略

### 3.1 テスト種類

| 種類 | ツール | 対象 |
|------|--------|------|
| ユニットテスト | Mocha（vscode-test経由） | `debounce.ts`, `markdownRenderer.ts` |
| 統合テスト | Mocha（vscode-test経由） | コマンド実行・パネル生成・更新 |

### 3.2 テスト命名規則

```typescript
describe('PreviewManager', () => {
  describe('openPreview', () => {
    it('Markdownファイルでパネルが生成される', async () => { /* ... */ })
    it('同一ファイルの重複パネルが生成されない', async () => { /* ... */ })
  })
})

describe('renderMarkdown', () => {
  it('正常なMarkdownがHTMLに変換される', () => { /* ... */ })
  it('パースエラー時にエラーHTMLを返す', () => { /* ... */ })
})
```

---

## 4. ドキュメント管理

### 4.1 ドキュメント種類

| 種類 | 場所 | 更新タイミング |
|------|------|--------------|
| プロダクト要件 | `docs/steering/01_product_requirements.md` | 要件変更時 |
| 機能設計 | `docs/steering/02_functional_design.md` | 機能追加・変更時 |
| 技術仕様 | `docs/steering/03_architecture_specifications.md` | アーキテクチャ変更時 |
| CLAUDE.md | ルート | プロジェクト構成変更時 |
| 開発作業ドキュメント | `docs/working/{YYYYMMDD}_{要件名}/` | 機能開発の開始時に生成、完了後にアーカイブ |

### 4.2 開発作業ドキュメントのワークフロー

機能開発は `generate-working-docs` スキルを使って開始します。

```
1. スキルを呼び出す
   → 「開発作業ドキュメント作成」「ドキュメント生成」などで起動

2. docs/working/{YYYYMMDD}_{要件名}/ が生成される
   ├── requirements.md  # 作業要件定義書
   ├── design.md        # 作業設計書
   ├── tasklist.md      # タスクリスト（チェックボックスで進捗管理）
   └── testing.md       # テスト手順書（Extension Development Host での確認手順）

3. 開発を進める
   → tasklist.md のチェックボックスを更新しながら実装

4. 開発完了後
   → docs/steering/ の関連ドキュメントを更新
   → docs/working/{ディレクトリ} を削除またはアーカイブ
```

### 4.3 ステアリングドキュメントの更新ルール

- 実装と仕様が乖離した場合はドキュメントを優先して更新する
- `docs/steering/` 配下のドキュメントは実装の前後に確認・更新する
- 開発作業ドキュメントで決定した重要な設計判断は、完了後に永続化ドキュメントへ反映する

---

## 変更履歴

| 日付 | バージョン | 変更内容 | 作成者 |
|------|----------|---------|--------|
| 2026-03-15 | 1.0 | 初版作成 | - |
