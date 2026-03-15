# 要件定義書 - Mermaid対応

## 概要

Markdownプレビュー内の ` ```mermaid ``` ` ブロックをSVG図表としてレンダリングする機能を実装する。
mermaid.js はCDNを使わずバンドル済みファイル（`dist/mermaid.min.js`）を参照し、オフライン環境でも動作する。
図ごとのエラー隔離により、1つの図の構文エラーが他の図・本文のレンダリングに影響しない設計とする。

## 背景・目的

仕様駆動開発やAIエージェントを使った開発では、Markdownドキュメントにシーケンス図・フロー図を埋め込む機会が多い。
既存の拡張機能はMermaidエラーでパネル全体がクラッシュするケースがあるため、エラー隔離が重要な要件となっている。

## 要件一覧

### 機能要件

#### F-201: Mermaid図表表示

- **説明**: ` ```mermaid ``` ` ブロックをSVG図表としてレンダリングする
- **受け入れ条件**:
  - [ ] flowchart（graph）が正しく描画される
  - [ ] sequenceDiagram が正しく描画される
  - [ ] 他のコードブロック（` ```typescript ``` ` など）は影響を受けない
  - [ ] オフライン環境でも動作する（CDN不使用）

#### F-202: Mermaidエラー隔離

- **説明**: 特定の図の構文エラーを他の図・本文に波及させない
- **受け入れ条件**:
  - [ ] 構文エラーのある図のブロック内にエラーメッセージが表示される
  - [ ] エラーのある図の前後の本文テキストは正常に表示される
  - [ ] エラーのある図と正常な図が混在する場合、正常な図は描画される

### 非機能要件

- **オフライン動作**: mermaid.js を `dist/` にバンドルし、CDN不使用
- **CSP準拠**: `script-src ${webview.cspSource}` のみでmermaid.jsを読み込む
- **エラー耐性**: Mermaidエラーでプレビューパネルがクラッシュしない

## スコープ

### 対象

- `webpack.config.js` — CopyWebpackPlugin で `mermaid.min.js` を `dist/` にコピーする設定追加
- `src/markdownRenderer.ts` — ` ```mermaid ``` ` ブロックを `<div class="mermaid">` に変換する前処理追加
- `src/webview/template.ts` — mermaid.js の読み込み、初期化・エラー隔離スクリプトの追加

### 対象外

- Mermaidのテーマ設定・カスタマイズ
- Mermaid以外の図表ライブラリ（PlantUMLなど）

## 実装対象ファイル（予定）

- `webpack.config.js` — `copy-webpack-plugin` の追加とCopyWebpackPlugin設定
- `src/markdownRenderer.ts` — Mermaidブロック前処理の追加
- `src/webview/template.ts` — mermaid.js `<script>` タグとエラー隔離スクリプトの追加

## 依存関係

- `mermaid` v11.x（`dependencies` に既存）
- `copy-webpack-plugin`（`devDependencies` への追加が必要）
- Phase 1で実装した `webview/template.ts` の `buildHtml()` および `webview.asWebviewUri()`

## 既知の制約

- mermaid.js は webpack のバンドル対象外（`CopyWebpackPlugin` でコピーするだけ）
- Webview の `localResourceRoots` は `dist/` に限定済み（Phase 1で設定済み）
- `mermaid.run()` は非同期だが、エラーハンドリングは `suppressErrors` オプションで対応

## 参考資料

- `docs/steering/02_functional_design.md` — §5 Mermaid対応のユーザーストーリー
- `docs/steering/03_architecture_specifications.md` — §3.6 webview/template.ts、§7 技術的制約
- `docs/steering/06_ubiquitous_language.md` — §2.4 Mermaid用語
