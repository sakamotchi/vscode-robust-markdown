# タスクリスト - Mermaid対応

## 進捗サマリー

| 状態 | 件数 |
|------|------|
| 完了 | 12 |
| 進行中 | 0 |
| 未着手 | 0 |

## タスク一覧

### T-1: copy-webpack-plugin のインストールと webpack.config.js 設定

- [x] `npm install --save-dev copy-webpack-plugin` を実行
- [x] `webpack.config.js` に CopyWebpackPlugin を追加（`mermaid.min.js` → `dist/mermaid.min.js`）
- [x] `npm run compile` でビルドが通ることを確認
- [x] `dist/mermaid.min.js` が生成されることを確認

### T-2: markdownRenderer.ts の Mermaidブロック前処理追加

- [x] `preprocessMermaid()` 関数の実装（` ```mermaid ``` ` → `<div class="mermaid">`）
- [x] `renderMarkdown()` の前処理呼び出し追加
- [x] ユニットテスト追加（mermaidブロック変換・通常コードブロックへの非影響）

### T-3: webview/template.ts の mermaid.js 読み込みと初期化

- [x] `mermaidUri` を `webview.asWebviewUri()` で取得
- [x] `<script src="${mermaidUri}">` を HTML に追加
- [x] `mermaid.initialize()` + `mermaid.run({ suppressErrors: true })` スクリプトの追加
- [x] `.catch()` でパネルへの影響をゼロにする処理の追加

### T-4: 動作確認（Extension Development Host）

- [x] flowchart が正しく描画されることを確認（ケース1）
- [x] sequenceDiagram が正しく描画されることを確認（ケース2）
- [x] 構文エラーのある図が他に影響しないことを確認（ケース3）

### T-5: テスト・仕上げ

- [x] `npm test` がパス（7 passing）
- [x] `npm run lint` がエラーなし
- [x] 永続化ドキュメント更新（`01_product_requirements.md` F201・F202を「完了」に変更）

## 完了条件

- [x] 全タスクが完了
- [x] `npm test` がパス
- [x] `npm run lint` がエラーなし
- [x] Mermaid図が正しく描画される
- [x] エラーのある図が他に影響しない
- [x] 永続化ドキュメントが更新済み

## 備考

### 実装時の知見

| 項目 | 内容 |
|------|------|
| コードブロックアサーション | `marked` は言語指定ありのコードブロックを `<code class="language-xxx">` と出力するため、テストは `<code>` ではなく `<code` で検索する必要がある |
| mermaid.js サイズ | 2.83 MiB。CopyWebpackPlugin でコピーするだけでバンドル対象外にすることが重要 |
