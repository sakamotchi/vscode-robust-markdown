# Change Log

All notable changes to the "vscode-robust-markdown" extension will be documented in this file.

## [0.1.0] - 2026-03-15

### Added

- Markdownプレビュー基盤（WebviewPanel・`marked` によるHTMLレンダリング）
- エディタータブ右端アイコンからのプレビュー起動
- 右クリックコンテキストメニューからのプレビュー起動
- 同一ファイルの重複パネル防止
- 編集・保存イベントによるプレビュー自動更新（1000msデバウンス）
- AIエージェントの高頻度更新に対するクラッシュ耐性
- Markdownパースエラー時のインライン表示・パネル維持
- Mermaid図表レンダリング（バンドル済み・オフライン対応）
- Mermaid構文エラーの図ごと隔離
- ライト/ダークテーマ切り替えボタン（VSCodeテーマ自動連動）
