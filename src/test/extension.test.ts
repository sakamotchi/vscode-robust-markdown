import * as assert from 'assert';
import * as vscode from 'vscode';
import { renderMarkdown } from '../markdownRenderer';
import { debounce } from '../debounce';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  suite('renderMarkdown', () => {
    test('見出しがHTMLに変換される', () => {
      const html = renderMarkdown('# Hello');
      assert.ok(html.includes('<h1>'), `expected <h1> in: ${html}`);
    });

    test('コードブロックがHTMLに変換される', () => {
      const html = renderMarkdown('```\nconst x = 1;\n```');
      assert.ok(html.includes('<code>'), `expected <code> in: ${html}`);
    });

    test('空文字でエラーを投げない', () => {
      assert.doesNotThrow(() => renderMarkdown(''));
    });
  });

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

    test('待機中に再呼び出しするとタイマーがリセットされる', (done) => {
      let count = 0;
      const debouncedFn = debounce(() => { count++; }, 80);
      debouncedFn();
      setTimeout(() => debouncedFn(), 40); // 40ms後にリセット
      setTimeout(() => {
        // 最初の呼び出しから80ms経過しているが、2回目から80msはまだ
        assert.strictEqual(count, 0);
        done();
      }, 90);
    });
  });
});
