# CLAUDE.md

このファイルは、リポジトリ内でコードを扱う際に Claude Code (claude.ai/code) へ提供するガイダンスです。

## プロジェクトの目的

**AI Safe Markdown Preview** — AIコーディングエージェント（Claude Codeなど）による頻繁なファイル更新に対して堅牢なMarkdownプレビューVSCode拡張。主な特徴：デバウンス処理による更新耐性、エラー隔離（パースエラーでもクラッシュしない）、Mermaid図表サポート、複数ファイルのタブ表示。

## コマンド

```bash
npm run compile        # 開発ビルド (webpack)
npm run watch          # インクリメンタル開発ビルド
npm run package        # プロダクションビルド（minified・ソースマップ非公開）
npm run lint           # src/ に対して ESLint 実行
npm run compile-tests  # テストを out/ へコンパイル
npm test               # フルテスト実行（コンパイル・lint・vscode-test を順に実行）
```

単一テストファイルを実行する場合は、先にテストをコンパイルしてから `vscode-test` でフィルタリングするか、VSCode で F5 を押して Extension Development Host を起動してください。

## アーキテクチャ

- **エントリーポイント**: [src/extension.ts](src/extension.ts) — `activate()` / `deactivate()` ライフサイクル
- **ビルド**: webpack が `src/extension.ts` → `dist/extension.js`（CommonJS・node ターゲット）へバンドル。`vscode` モジュールは external 扱いでバンドルに含まれない
- **テスト**: `tsc` で `out/` へコンパイルし、`@vscode/test-cli` で実行（設定: [.vscode-test.mjs](.vscode-test.mjs)）
- **ランタイム依存**: `marked`（Markdown → HTML）と `mermaid`（図表レンダリング）は `dist/extension.js` にバンドル済み

## 主要な設計上の制約

- AIエージェントの高頻度書き込みに対応するため、すべての更新イベントは必ずデバウンス処理を経由する（待機時間: 1000ms）
- Mermaidのレンダリングエラーは捕捉・隔離し、拡張のクラッシュに波及させない
- Markdownのパースエラーはインライン表示でグレースフルに処理し、プレビューパネルは維持する
- 複数ファイルのプレビューはファイルごとに独立した WebviewPanel（VSCodeネイティブタブ）で表示する
- プレビューの起動はエディタータブ右端のアイコンボタンと右クリックコンテキストメニューの両方から行える
- 自動更新は編集リアルタイム（`onDidChangeTextDocument`）とファイル保存（`onDidSaveTextDocument`）の両方をトリガーとする

## ブランチ戦略

- `main` — 安定版・リリース
- `develop` — 開発中
- `feature/*` — 個別機能

## 推奨実装順序（docs/setup.md より）

1. Markdownプレビュー（WebviewPanel + `marked` の基本実装）
2. ドキュメント変更イベントへのデバウンス適用
3. WebviewでのMermaidレンダリング
4. 複数ファイルのタブインターフェース
