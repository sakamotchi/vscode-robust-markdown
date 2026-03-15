# リポジトリ構造定義書

**バージョン**: 1.0
**作成日**: 2026年3月15日
**最終更新**: 2026年3月15日

---

## 1. ディレクトリ構造

### 1.1 ルートディレクトリ

```
vscode-robust-markdown/
├── .vscode/                  # VSCode設定
│   ├── extensions.json       # 推奨拡張機能
│   ├── launch.json           # デバッグ設定（Extension Development Host）
│   ├── settings.json         # ワークスペース設定
│   └── tasks.json            # npm スクリプトタスク
├── dist/                     # webpack ビルド成果物（自動生成）
│   ├── extension.js
│   └── mermaid.min.js        # CopyWebpackPlugin でコピー
├── docs/                     # プロジェクトドキュメント
│   ├── steering/             # 永続化ドキュメント（正式仕様）
│   └── *.md                  # その他設計・要件ドキュメント
├── node_modules/             # npm依存関係（自動生成）
├── out/                      # tsc テストコンパイル成果物（自動生成）
├── src/                      # ソースコード
│   ├── webview/
│   └── test/
├── .vscodeignore             # パッケージング除外設定
├── CHANGELOG.md
├── CLAUDE.md                 # Claude Code用ガイド
├── eslint.config.mjs         # ESLint設定
├── package.json
├── tsconfig.json
└── webpack.config.js
```

### 1.2 src/ ディレクトリ

```
src/
  extension.ts          # エントリーポイント（activate / deactivate）
  previewManager.ts     # WebviewPanel の生成・管理・更新ロジック
  markdownRenderer.ts   # Markdown → HTML 変換・Mermaid前処理
  debounce.ts           # デバウンスユーティリティ
  webview/
    template.ts         # Webview に渡す HTML テンプレート生成
  test/
    extension.test.ts   # 統合テスト（vscode-test）
```

### 1.3 docs/ ディレクトリ

```
docs/
  steering/                          # 永続化ドキュメント（正式仕様）
    01_product_requirements.md       # プロダクト要求定義書
    02_functional_design.md          # 機能設計書
    03_architecture_specifications.md # 技術仕様書
    04_repository_structure.md       # リポジトリ構造定義書（本ドキュメント）
    05_development_guidelines.md     # 開発ガイドライン
    06_ubiquitous_language.md        # ユビキタス言語定義書
  working/                           # 開発作業ドキュメント（一時的）
    {YYYYMMDD}_{要件名}/             # 機能開発ごとに作成
      requirements.md                # 作業要件定義書
      design.md                      # 作業設計書
      tasklist.md                    # タスクリスト
      testing.md                     # テスト手順書
      task_{タスクID}.md             # タスク詳細（必要に応じて作成）
  requirements.md                    # 要件定義書（原本）
  design.md                          # 概要設計書
  wbs.md                             # WBS
  setup.md                           # 開発環境セットアップガイド
```

---

## 2. 命名規則

### 2.1 ファイル・ディレクトリ命名

| 種類 | 規則 | 例 |
|------|------|---|
| TypeScript ファイル | camelCase | `previewManager.ts` |
| ディレクトリ | camelCase | `webview/` |
| テストファイル | `*.test.ts` | `extension.test.ts` |

### 2.2 コード命名規則

| 種類 | 規則 | 例 |
|------|------|---|
| 変数・関数 | camelCase | `openPreview()`, `debounceTimer` |
| クラス・型・インターフェース | PascalCase | `PreviewManager` |
| 定数 | UPPER_SNAKE_CASE | `DEBOUNCE_WAIT_MS` |
| VSCode コマンドID | `robustMarkdown.` + camelCase | `robustMarkdown.openPreview` |

---

## 3. バージョン管理方針

### 3.1 ブランチ戦略

```
main（安定版・リリース）
  └── develop（開発統合）
        ├── feature/xxx（機能開発）
        ├── fix/xxx（バグ修正）
        └── docs/xxx（ドキュメント更新）
```

### 3.2 ブランチ命名規則

| プレフィックス | 用途 | 例 |
|--------------|------|---|
| `feature/` | 新機能開発 | `feature/markdown-preview` |
| `fix/` | バグ修正 | `fix/panel-duplicate` |
| `docs/` | ドキュメント更新 | `docs/update-requirements` |

### 3.3 コミットメッセージ規則

```
[type] 概要

詳細説明（任意）
```

| タイプ | 説明 |
|--------|------|
| `[add]` | 新機能追加 |
| `[update]` | 既存機能の更新・改善 |
| `[fix]` | バグ修正 |
| `[refactor]` | リファクタリング |
| `[docs]` | ドキュメント更新 |
| `[test]` | テスト追加・修正 |
| `[chore]` | ビルド・設定変更 |

---

## 4. 設定ファイル一覧

| ファイル | 説明 |
|---------|------|
| `package.json` | npm依存関係・スクリプト・VSCode拡張メタデータ |
| `tsconfig.json` | TypeScript設定（target: ES2022, module: Node16） |
| `webpack.config.js` | バンドル設定（entry: src/extension.ts, output: dist/extension.js） |
| `eslint.config.mjs` | ESLint設定（typescript-eslint） |
| `.vscode-test.mjs` | vscode-test 設定（out/test/**/*.test.js） |
| `.vscodeignore` | パッケージング除外設定 |

---

## 変更履歴

| 日付 | バージョン | 変更内容 | 作成者 |
|------|----------|---------|--------|
| 2026-03-15 | 1.0 | 初版作成 | - |
