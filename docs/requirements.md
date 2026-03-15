
# 要件定義書
## プロジェクト名
AI Safe Markdown Preview (VSCode Extension)

## 背景
AIコーディングエージェント（Claude Codeなど）がMarkdownファイルを頻繁に更新する環境では、既存のMarkdownプレビュー拡張がクラッシュすることがある。
そのため、AIによる更新に強いMarkdownプレビュー拡張を開発する。

## 目的
以下の機能を持つVSCode拡張を開発する。

- AIエージェントによる頻繁な更新でもクラッシュしないMarkdownプレビュー
- 複数Markdownファイルのタブ表示
- Mermaid対応
- 軽量で高速なプレビュー

## 機能要件

### Markdownプレビュー
- MarkdownファイルをHTMLに変換し表示
- 自動更新対応

### AI更新耐性
- 更新イベントをデバウンス処理
- Markdown解析エラーでもクラッシュしない
- Mermaidエラーを隔離

### タブ機能
- 複数Markdownファイルを1つの画面でタブ表示
- タブ切替可能

### Mermaid対応
- ```mermaid``` ブロックを図として表示

## 非機能要件
- VSCode 1.80以上
- Node.js 18以上
- メモリ使用量を抑える

## 想定ユーザー
- AIエージェントを利用する開発者
- Markdown仕様駆動開発を行う開発者
