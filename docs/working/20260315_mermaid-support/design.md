# 設計書 - Mermaid対応

## アーキテクチャ

### 対象コンポーネント

```
Extension Host (Node.js)
  └── markdownRenderer.ts
        └── ```mermaid``` ブロック → <div class="mermaid">...</div> に変換（新規）

Webview（各プレビューパネル）
  └── HTML
        ├── <script src="mermaid.min.js">  ← webview.asWebviewUri() で参照（新規）
        ├── mermaid.initialize({...})       ← 初期化スクリプト（新規）
        └── mermaid.run({...})              ← エラー隔離付きレンダリング（新規）

webpack ビルド
  └── CopyWebpackPlugin
        └── node_modules/mermaid/dist/mermaid.min.js → dist/mermaid.min.js（新規）
```

### 影響範囲

- **Extension Host**: `markdownRenderer.ts` に前処理を追加
- **Webview**: `template.ts` にスクリプト・初期化コードを追加
- **ビルド**: `webpack.config.js` に CopyWebpackPlugin を追加

---

## 実装方針

### 概要

1. webpack で `mermaid.min.js` を `dist/` にコピーする
2. `markdownRenderer.ts` で ` ```mermaid ``` ` ブロックを `<div class="mermaid">` に変換する
3. `template.ts` で mermaid.js を読み込み、`mermaid.run()` で描画する
4. `mermaid.run()` の `suppressErrors` + `postRenderCallback` でエラー隔離を実装する

### 詳細

**前処理（markdownRenderer.ts）**

` ```mermaid ``` ` ブロックを marked に渡す前に `<div class="mermaid">` に変換する。
こうすることで marked がコードブロックとして処理せず、Webview側の mermaid.js に描画を委ねられる。

**Mermaid初期化（template.ts）**

`mermaid.initialize()` でテーマをVSCodeの配色に合わせ（`theme: 'dark'` or `'default'`）、
`mermaid.run()` で `.mermaid` クラスを持つ全要素を描画する。
エラーが発生した図は `suppressErrors: true` により他に影響させず、`errorRenderer` でエラーメッセージをブロック内に表示する。

---

## 実装詳細

### webpack.config.js への CopyWebpackPlugin 追加

```bash
npm install --save-dev copy-webpack-plugin
```

```javascript
const CopyWebpackPlugin = require('copy-webpack-plugin');

// extensionConfig に追加:
plugins: [
  new CopyWebpackPlugin({
    patterns: [
      {
        from: path.resolve(__dirname, 'node_modules/mermaid/dist/mermaid.min.js'),
        to: path.resolve(__dirname, 'dist/mermaid.min.js'),
      },
    ],
  }),
],
```

### markdownRenderer.ts への前処理追加

```typescript
export function renderMarkdown(source: string): string {
  try {
    const preprocessed = preprocessMermaid(source);
    const result = marked.parse(preprocessed);
    return result as string;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return `<p class="error">Markdown parse error: ${escapeHtml(message)}</p>`;
  }
}

function preprocessMermaid(source: string): string {
  // ```mermaid\n...\n``` を <div class="mermaid">...</div> に変換
  return source.replace(
    /```mermaid\n([\s\S]*?)```/g,
    (_match, code) => `<div class="mermaid">${escapeHtml(code.trim())}</div>`
  );
}
```

> **注意**: `<div class="mermaid">` 内のコードは marked に解釈されないよう `escapeHtml` でエスケープする。mermaid.js はHTMLエンティティをデコードしてから処理する。

### template.ts への mermaid.js 読み込みとエラー隔離

```typescript
export function buildHtml(
  bodyHtml: string,
  webview: vscode.Webview,
  extensionUri: vscode.Uri
): string {
  const cspSource = webview.cspSource;
  const mermaidUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'dist', 'mermaid.min.js')
  );

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  ...
  <script src="${mermaidUri}"></script>
</head>
<body>
${bodyHtml}
<script>
  mermaid.initialize({ startOnLoad: false, theme: 'dark' });
  mermaid.run({
    querySelector: '.mermaid',
    suppressErrors: true,
  }).catch(() => {
    // run() 自体が reject した場合も無視してパネルを維持
  });
</script>
</body>
</html>`;
}
```

**エラー隔離の仕組み**

- `suppressErrors: true` により、個々の図のレンダリングエラーが `mermaid.run()` 全体を止めない
- Mermaid は構文エラーがある図のブロック内にエラーメッセージを自動挿入する
- `.catch()` で `mermaid.run()` 自体の reject も捕捉し、パネルへの影響をゼロにする

---

## VSCode API 設計

### 追加・変更する項目

| 項目 | 変更内容 |
|------|---------|
| `webview.asWebviewUri()` | Phase 1で準備済み。`mermaid.min.js` のURI取得に使用 |
| CSP `script-src` | `${webview.cspSource}` で `dist/mermaid.min.js` を許可（既存設定で対応済み） |

---

## テストコード

### markdownRenderer のユニットテスト追加

```typescript
suite('renderMarkdown - Mermaid前処理', () => {
  test('mermaidブロックがdivに変換される', () => {
    const html = renderMarkdown('```mermaid\ngraph TD\nA-->B\n```');
    assert.ok(html.includes('<div class="mermaid">'), `expected mermaid div in: ${html}`);
    assert.ok(!html.includes('```mermaid'), `raw mermaid block should not remain`);
  });

  test('通常のコードブロックは影響を受けない', () => {
    const html = renderMarkdown('```typescript\nconst x = 1;\n```');
    assert.ok(!html.includes('class="mermaid"'), `ts block should not become mermaid div`);
    assert.ok(html.includes('<code>'), `expected code block`);
  });
});
```

---

## 設計上の決定事項

| 決定事項 | 理由 | 代替案 |
|---------|------|--------|
| mermaid.js を CopyWebpackPlugin でコピー（バンドルしない） | mermaid は大きなライブラリでwebpackのバンドルに向かない。Webview側のブラウザ環境で動かすため分離が自然 | webpack バンドルに含める（ファイルサイズ増大・ESM問題あり） |
| Mermaidブロックを前処理で `<div class="mermaid">` に変換 | marked がコードブロックとして処理する前に変換することで、marked との干渉を避けられる | marked の `renderer.code` をオーバーライドする（複雑になる） |
| `suppressErrors: true` でエラー隔離 | mermaid.js の公式APIで図ごとのエラー隔離が可能 | try-catchで個別ラップ（mermaid内部の非同期処理が複雑） |
| テーマを `'dark'` 固定 | 初期実装として簡潔にする。VSCode配色との完全連動はスコープ外 | VSCodeのカラーテーマを取得して動的に設定（実装コスト大） |

## 未解決事項

- [ ] `mermaid.initialize()` の `theme` はVSCodeのライト/ダークテーマに連動させるべきか（現時点では `'dark'` 固定でスコープ外）
