# 設計書 - 自動更新・AI更新耐性

## アーキテクチャ

### 対象コンポーネント

```
Extension Host (Node.js)
  └── extension.ts（activate）
        ├── onDidChangeTextDocument リスナー → PreviewManager.updatePreview()
        ├── onDidSaveTextDocument リスナー   → PreviewManager.updatePreview()
        └── PreviewManager
              ├── panels: Map<string, WebviewPanel>       （Phase 1 既存）
              ├── debounceTimers: Map<string, NodeJS.Timeout> （新規追加）
              ├── updatePreview(document)                  （新規追加）
              └── debounce.ts（ユーティリティ）            （新規作成）
```

### 影響範囲

- **extension.ts**: イベントリスナー登録の追加（2箇所）
- **previewManager.ts**: `debounceTimers` Map と `updatePreview()` の追加、`dispose()` の更新
- **debounce.ts**: 新規作成

---

## 実装方針

### 概要

イベント → フィルタリング → デバウンス → レンダリングの流れで実装する。デバウンスはパネルごとに独立管理し、`dispose()` 時に全タイマーを解放する。

### 詳細

1. **debounce.ts** を純粋関数として実装する。タイマーIDを `Map` で管理する方式はとらず、クロージャで持つシンプルな実装にする
2. **PreviewManager** に `debounceTimers: Map<string, NodeJS.Timeout>` を追加し、ファイルURIをキーにタイマーを管理する
3. `updatePreview(document)` は `panels` に対応パネルが存在しない場合は即リターンする（不要なデバウンスタイマーを作らない）
4. パネル破棄時（`onDidDispose`）に対応タイマーも `clearTimeout()` してMapから削除する
5. `dispose()` で全タイマーを `clearTimeout()` する

---

## データ構造

### 型定義（TypeScript）

```typescript
// debounce.ts
export function debounce(fn: () => void, wait: number): () => void
// → 呼び出すたびに既存タイマーをクリアして新しいタイマーをセット
```

```typescript
// previewManager.ts への追加
class PreviewManager implements vscode.Disposable {
  private panels: Map<string, vscode.WebviewPanel>;          // 既存
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map(); // 新規

  updatePreview(document: vscode.TextDocument): void  // 新規
  // dispose() を更新してタイマーも解放
}
```

---

## 実装詳細

### debounce.ts

```typescript
export function debounce(fn: () => void, wait: number): () => void {
  let timer: NodeJS.Timeout | undefined;
  return () => {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
    timer = setTimeout(fn, wait);
  };
}
```

### PreviewManager.updatePreview()

```typescript
private readonly DEBOUNCE_WAIT_MS = 1000;

updatePreview(document: vscode.TextDocument): void {
  const uri = document.uri.toString();
  // 対応するパネルが存在しない場合は無視
  if (!this.panels.has(uri)) {
    return;
  }

  // 既存タイマーをクリア
  const existing = this.debounceTimers.get(uri);
  if (existing !== undefined) {
    clearTimeout(existing);
  }

  // 新しいタイマーをセット
  const timer = setTimeout(() => {
    const panel = this.panels.get(uri);
    if (panel) {
      this.renderToPanel(panel, document);
    }
    this.debounceTimers.delete(uri);
  }, this.DEBOUNCE_WAIT_MS);

  this.debounceTimers.set(uri, timer);
}
```

> **注**: `debounce.ts` のユーティリティを使う方法と、`PreviewManager` 内でタイマーを直接管理する方法がある。`document` への参照が必要なため、後者（直接管理）の方がシンプル。`debounce.ts` は純粋関数テスト用に作成し、PreviewManager 内では直接 setTimeout を使う。

### onDidDispose の更新

```typescript
panel.onDidDispose(() => {
  // タイマーのクリアを追加
  const timer = this.debounceTimers.get(uri);
  if (timer !== undefined) {
    clearTimeout(timer);
    this.debounceTimers.delete(uri);
  }
  this.panels.delete(uri);
});
```

### dispose() の更新

```typescript
dispose(): void {
  // タイマーの解放を追加
  for (const timer of this.debounceTimers.values()) {
    clearTimeout(timer);
  }
  this.debounceTimers.clear();

  for (const panel of this.panels.values()) {
    panel.dispose();
  }
  this.panels.clear();
}
```

### extension.ts へのリスナー追加

```typescript
export function activate(context: vscode.ExtensionContext) {
  const previewManager = new PreviewManager(context.extensionUri);
  context.subscriptions.push(previewManager);

  // 既存: openPreview コマンド
  const openPreviewCmd = vscode.commands.registerCommand('robustMarkdown.openPreview', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) { return; }
    previewManager.openPreview(editor.document);
  });

  // 新規: 編集イベント
  const onChangeListener = vscode.workspace.onDidChangeTextDocument((e) => {
    previewManager.updatePreview(e.document);
  });

  // 新規: 保存イベント
  const onSaveListener = vscode.workspace.onDidSaveTextDocument((document) => {
    previewManager.updatePreview(document);
  });

  context.subscriptions.push(openPreviewCmd, onChangeListener, onSaveListener);
}
```

---

## VSCode API 設計

### 使用するAPI（追加分）

| API | 用途 |
|-----|------|
| `vscode.workspace.onDidChangeTextDocument` | リアルタイム編集イベントの検知 |
| `vscode.workspace.onDidSaveTextDocument` | 保存イベントの検知 |
| `clearTimeout` / `setTimeout` | デバウンスタイマー管理（Node.js組み込み） |

---

## テストコード

### debounce.ts のユニットテスト

```typescript
suite('debounce', () => {
  test('指定時間後に関数が1回だけ呼ばれる', (done) => {
    let count = 0;
    const debouncedFn = debounce(() => { count++; }, 50);
    debouncedFn();
    debouncedFn();
    debouncedFn();
    setTimeout(() => {
      assert.strictEqual(count, 1);
      done();
    }, 100);
  });

  test('タイマーがリセットされる', (done) => {
    let count = 0;
    const debouncedFn = debounce(() => { count++; }, 50);
    debouncedFn();
    setTimeout(() => debouncedFn(), 30); // リセット
    setTimeout(() => {
      assert.strictEqual(count, 0); // まだ呼ばれていない
      done();
    }, 60);
  });
});
```

---

## 設計上の決定事項

| 決定事項 | 理由 | 代替案 |
|---------|------|--------|
| debounceTimers を PreviewManager 内で直接管理 | `updatePreview` の setTimeout コールバック内で `document` を参照する必要があるため、クロージャより直接管理が自然 | debounce.ts ユーティリティを使う（document参照の受け渡しが複雑になる） |
| `panels` の存在チェックを `updatePreview` 冒頭で行う | プレビューを開いていないファイルの編集イベントでタイマーを生成しない | フィルタリングなし（不要なタイマーが大量発生するリスク） |
| デバウンス待機時間を定数 `DEBOUNCE_WAIT_MS = 1000` として定義 | マジックナンバーを避け、テスト時に変更しやすくする | 直接 `1000` をハードコード |

## 未解決事項

- なし
