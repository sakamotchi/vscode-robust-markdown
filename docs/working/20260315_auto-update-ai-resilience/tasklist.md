# タスクリスト - 自動更新・AI更新耐性

## 進捗サマリー

| 状態 | 件数 |
|------|------|
| 完了 | 0 |
| 進行中 | 0 |
| 未着手 | 13 |

## タスク一覧

### T-1: debounce.ts の実装

- [ ] `debounce(fn, wait): () => void` の実装
- [ ] ユニットテスト作成（1回のみ呼ばれること、タイマーリセットの確認）

### T-2: PreviewManager の更新

- [ ] `debounceTimers: Map<string, NodeJS.Timeout>` フィールドの追加
- [ ] `updatePreview(document)` の実装（panelsの存在チェック → タイマー管理）
- [ ] `panel.onDidDispose()` にタイマークリアを追加
- [ ] `dispose()` にタイマー全解放を追加

### T-3: extension.ts の更新

- [ ] `onDidChangeTextDocument` リスナーの登録
- [ ] `onDidSaveTextDocument` リスナーの登録
- [ ] 両リスナーを `context.subscriptions` に追加

### T-4: 動作確認（Extension Development Host）

- [ ] 編集後1000msでプレビューが更新されることを確認（ケース1）
- [ ] 保存時にプレビューが更新されることを確認（ケース2）
- [ ] 高頻度編集でクラッシュしないことを確認（ケース3）
- [ ] パースエラー時にパネルが維持されることを確認（ケース4）

### T-5: テスト・仕上げ

- [ ] `npm test` がパス
- [ ] `npm run lint` がエラーなし
- [ ] 永続化ドキュメント更新（`01_product_requirements.md` F101〜F104を「完了」に変更）

## 完了条件

- [ ] 全タスクが完了
- [ ] `npm test` がパス
- [ ] `npm run lint` がエラーなし
- [ ] 編集・保存の両方でプレビューが自動更新される
- [ ] 高頻度更新でもクラッシュしない
- [ ] 永続化ドキュメントが更新済み
