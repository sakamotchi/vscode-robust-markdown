import * as assert from 'assert';
import * as vscode from 'vscode';
import { renderMarkdown } from '../markdownRenderer';

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
});
