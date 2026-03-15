# 開発環境セットアップ手順

## プロジェクト情報

- **リポジトリ名**: `vscode-robust-markdown`
- **概要**: AI更新に強いMarkdownプレビューVSCode拡張（Mermaid対応）

---

## 前提条件

以下のバージョンを確認する。

```bash
node --version   # v18以上
npm --version
git --version
code --version   # VSCode CLI
```

---

## 1. GitHubリポジトリの作成

1. [github.com/new](https://github.com/new) でリポジトリを作成
   - **Repository name**: `vscode-robust-markdown`
   - **Description**: `AI-safe Markdown preview VSCode extension with Mermaid support`
   - **Visibility**: Public or Private
   - **.gitignore**: `Node`
   - **README**: チェックオン
   - **License**: MIT（任意）

2. ローカルにクローン:
   ```bash
   git clone https://github.com/<your-username>/vscode-robust-markdown.git
   cd vscode-robust-markdown
   ```

---

## 2. VSCode拡張の雛形生成

```bash
npm install -g yo generator-code
yo code
```

ジェネレーターの選択肢:

| 質問 | 回答 |
|------|------|
| What type of extension? | `New Extension (TypeScript)` |
| What's the name? | `Robust Markdown` |
| What's the identifier? | `vscode-robust-markdown` |
| What's the description? | `AI-safe Markdown preview with Mermaid support` |
| Initialize git? | `No`（既存リポジトリがあるため） |
| Which bundler to use? | `webpack` |
| Package manager? | `npm` |

生成されたファイルはリポジトリルートに直接生成される。残った空のサブディレクトリは削除する:

```bash
rm -rf vscode-robust-markdown
```

---

## 3. 依存パッケージの追加

```bash
# Markdown + Mermaid
npm install marked mermaid

# 型定義
npm install --save-dev @types/node @types/vscode
```

---

## 4. `docs/` フォルダの配置

`requirements.md`（要件定義書）と本ファイル（`setup.md`）を `docs/` に配置する。

```
docs/
  requirements.md   # 要件定義書
  setup.md          # 本ファイル
```

---

## 5. `.gitignore` の確認

以下が含まれていることを確認:

```
node_modules/
out/
dist/
*.vsix
.vscode-test/
```

---

## 6. 初回コミット & プッシュ

```bash
git add .
git commit -m "chore: initialize VSCode extension scaffold"
git push origin main
```

---

## 7. 動作確認

VSCodeで拡張機能を起動:

```bash
code .
# F5 キー → Extension Development Host が起動
```

コマンドパレット（`Cmd+Shift+P`）で `Hello World` コマンドが実行できれば雛形の動作確認完了。

---

## ブランチ戦略

```
main          ← 安定版
develop       ← 開発ブランチ
feature/xxx   ← 機能単位のブランチ
```

---

## 実装順序（推奨）

1. Markdownプレビュー基本実装（`marked` でHTML変換 + WebviewPanel表示）
2. デバウンス処理（`onDidChangeTextDocument` イベント制御）
3. Mermaid統合（WebView内でレンダリング、エラー隔離）
4. タブ管理機能（複数ファイルのタブ切替）
