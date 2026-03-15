# 使用例

このドキュメントでは、開発作業ドキュメント生成スキルの使用例を記載します。

---

## 例1: Markdownプレビュー基盤の開発

### ユーザーの依頼

```
新規開発のドキュメント作ってください
```

### Claudeの応答

```
要件名を教えてください。
英語のケバブケース（例：markdown-preview, mermaid-support）を推奨します。
```

### ユーザーの回答

```
markdown-preview
```

### 生成結果

```
docs/working/20260315_markdown-preview/
├── requirements.md   # プレビュー基盤の要件一覧
├── design.md         # PreviewManager・レンダラーの設計
├── tasklist.md       # 実装タスク一覧
└── testing.md        # Extension Development Host での確認手順
```

---

## 例2: Mermaid対応の開発

### ユーザーの依頼

```
開発作業ドキュメント生成して。要件名はmermaid-supportで。
```

### 生成結果

```
docs/working/20260315_mermaid-support/
├── requirements.md
├── design.md
├── tasklist.md
└── testing.md
```

---

## 例3: 要件名を日本語で指定した場合

### ユーザーの依頼

```
ドキュメント作って。デバウンス処理の実装。
```

### Claudeの対応

要件名を英語のケバブケースに変換して確認：

```
「デバウンス処理の実装」を英語のケバブケースに変換すると「debounce-update」になりますが、
この名前でよろしいですか？
```

### 生成結果

```
docs/working/20260315_debounce-update/
├── requirements.md
├── design.md
├── tasklist.md
└── testing.md
```

---

## ドキュメント完成後のワークフロー

### 1. 各ファイルを確認・編集

生成されたテンプレートをもとに、具体的な内容を記載します。

### 2. タスクを進行

`tasklist.md` のチェックボックスを更新しながら開発を進めます。

### 3. テストを実施

`testing.md` の手順に従い、F5 で Extension Development Host を起動して手動確認します。

### 4. 開発完了後

1. **永続化ドキュメントを更新**
   - `docs/steering/` 配下の該当ドキュメントを更新
   - 設計上の重要な決定事項は `03_architecture_specifications.md` に反映

2. **開発作業ドキュメントをアーカイブ**
   - 完了後は `docs/archive/` に移動、または削除

3. **CLAUDE.md を確認**
   - 実装方針や制約事項に変更があれば `CLAUDE.md` を更新
