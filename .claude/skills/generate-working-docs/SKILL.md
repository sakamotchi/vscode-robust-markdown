---
name: generate-working-docs
description: 新規機能開発の作業ドキュメントを自動生成します。YYYYMMDD_要件名の形式でディレクトリを作成し、requirements.md、design.md、tasklist.md、testing.mdを生成します。「開発作業ドキュメント作成」「新規開発のドキュメント作って」「ドキュメント生成」などで呼び出されます。
---

# 開発作業ドキュメント生成スキル

## 概要

このスキルは、新規機能開発のドキュメント群を `docs/working/{YYYYMMDD}_{要件名}/` 配下に自動生成します。

## 使用シーン

- 新規開発作業の開始時
- 要件定義から実装までを体系的に進めたいとき
- ドキュメント構成を統一したいとき

## 生成ファイル

| ファイル | 内容 |
|---------|------|
| `requirements.md` | 要件定義書。この開発作業で実現したいことを記載 |
| `design.md` | 設計書。実装方針、型定義、コード例を記載 |
| `tasklist.md` | タスクリスト。作業項目と進捗状況を管理 |
| `testing.md` | テスト手順書。Extension Development Host での手動確認手順を記載 |

## 実行手順

### 1. 要件名の確認

ユーザーに要件名を確認します。要件名は英語のケバブケース（例：`markdown-preview`, `mermaid-support`）を推奨します。

### 2. ディレクトリ作成

本日の日付（YYYYMMDD形式）と要件名を組み合わせてディレクトリを作成します：

```bash
mkdir -p docs/working/{YYYYMMDD}_{要件名}
```

### 3. ドキュメントの生成

以下の4ファイルをすべて生成します。各テンプレートは [templates.md](templates.md) を参照してください。

**重要**: テンプレートの穴埋めではなく、ユーザーが提供した要件や `docs/steering/` の永続化ドキュメントを参照しながら実際の内容を記載してください。

#### requirements.md の生成

[templates.md](templates.md) の「requirements.md テンプレート」を使用して生成します。

参照すべき永続化ドキュメント：
- `docs/steering/01_product_requirements.md` - プロダクト全体の要件・機能を確認
- `docs/steering/02_functional_design.md` - 既存の機能設計・ユーザーストーリーを参照
- `docs/steering/06_ubiquitous_language.md` - プロジェクト用語の正しい使用

#### design.md の生成

[templates.md](templates.md) の「design.md テンプレート」を使用して生成します。

参照すべき永続化ドキュメント：
- `docs/steering/03_architecture_specifications.md` - モジュール設計・イベントフローを確認
- `docs/steering/04_repository_structure.md` - ディレクトリ構造・命名規則を確認
- `docs/steering/05_development_guidelines.md` - コーディング規約を確認
- `docs/steering/06_ubiquitous_language.md` - 型定義・変数名の用語確認

#### tasklist.md の生成

[templates.md](templates.md) の「tasklist.md テンプレート」を使用して生成します。

参照すべき永続化ドキュメント：
- `docs/steering/04_repository_structure.md` - 命名規則を確認
- `docs/wbs.md` - WBS の対応フェーズを参照

#### testing.md の生成

[templates.md](templates.md) の「testing.md テンプレート」を使用して生成します。

参照すべき永続化ドキュメント：
- `docs/steering/01_product_requirements.md` - 機能要件の受け入れ条件を確認
- `docs/steering/02_functional_design.md` - ユーザーストーリーの期待動作を確認

**重要**: VSCode拡張機能のため、手動テストは F5 で起動した Extension Development Host 上での操作確認が基本です。操作で確認できない項目のみ自動テストを記載します。

`task_{タスクID}.md` は初期生成せず、開発中に必要に応じて作成します。

### 4. 完了報告

生成したディレクトリとファイル一覧をユーザーに報告します。

## 使用例

詳細は [examples.md](examples.md) を参照してください。

## 関連ドキュメント

- `CLAUDE.md` - プロジェクト全体のガイド
- `docs/steering/` - 永続化ドキュメント群
- `docs/wbs.md` - WBS
