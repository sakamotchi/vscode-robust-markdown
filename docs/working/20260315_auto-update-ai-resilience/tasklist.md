# タスクリスト - 自動更新・AI更新耐性

## 進捗サマリー

| 状態 | 件数 |
|------|------|
| 完了 | 13 |
| 進行中 | 0 |
| 未着手 | 0 |

## タスク一覧

### T-1: debounce.ts の実装

- [x] `debounce(fn, wait): () => void` の実装
- [x] ユニットテスト作成（1回のみ呼ばれること、タイマーリセットの確認）

### T-2: PreviewManager の更新

- [x] `debounceTimers: Map<string, NodeJS.Timeout>` フィールドの追加
- [x] `updatePreview(document)` の実装（panelsの存在チェック → タイマー管理）
- [x] `panel.onDidDispose()` にタイマークリアを追加
- [x] `dispose()` にタイマー全解放を追加

### T-3: extension.ts の更新

- [x] `onDidChangeTextDocument` リスナーの登録
- [x] `onDidSaveTextDocument` リスナーの登録
- [x] 両リスナーを `context.subscriptions` に追加

### T-4: 動作確認（Extension Development Host）

- [x] 編集後1000msでプレビューが更新されることを確認（ケース1）
- [x] 保存時にプレビューが更新されることを確認（ケース2）
- [x] 高頻度編集でクラッシュしないことを確認（ケース3）
- [x] パースエラー時にパネルが維持されることを確認（ケース4）

### T-5: テスト・仕上げ

- [x] `npm test` がパス（5 passing）
- [x] `npm run lint` がエラーなし
- [x] 永続化ドキュメント更新（`01_product_requirements.md` F101〜F104を「完了」に変更）

## 完了条件

- [x] 全タスクが完了
- [x] `npm test` がパス
- [x] `npm run lint` がエラーなし
- [x] 編集・保存の両方でプレビューが自動更新される
- [x] 高頻度更新でもクラッシュしない
- [x] 永続化ドキュメントが更新済み

## 備考

### 実装時の知見

| 項目 | 内容 |
|------|------|
| パースエラー耐性 | `marked` は `<><><>` などの不正な入力も例外を投げずテキストとしてレンダリングする。try-catch は真の例外（メモリ不足等）への保険 |
| デバウンスタイマー管理 | `debounce.ts` ユーティリティは純粋関数テスト用。`PreviewManager` 内では `document` 参照が必要なため直接 setTimeout を使用 |
