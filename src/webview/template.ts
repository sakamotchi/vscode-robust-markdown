import * as vscode from 'vscode';

function getNonce(): string {
  let text = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text;
}

export function buildHtml(
  bodyHtml: string,
  webview: vscode.Webview,
  extensionUri: vscode.Uri
): string {
  const nonce = getNonce();
  const cspSource = webview.cspSource;
  const mermaidUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'dist', 'mermaid.min.js')
  );
  const themeKind = vscode.window.activeColorTheme.kind;
  const isDark =
    themeKind === vscode.ColorThemeKind.Dark ||
    themeKind === vscode.ColorThemeKind.HighContrast;
  const initialMode = isDark ? 'dark' : 'light';

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'none'; script-src 'nonce-${nonce}' ${cspSource}; style-src 'unsafe-inline';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Preview</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      padding: 0 24px 40px;
      max-width: 900px;
    }
    body.vr-dark {
      color: #d4d4d4;
      background-color: #1e1e1e;
    }
    body.vr-dark code { background: rgba(255,255,255,0.1); color: #d4d4d4; }
    body.vr-dark pre { background: rgba(255,255,255,0.08); color: #d4d4d4; }
    body.vr-dark th { background: rgba(255,255,255,0.06); }
    body.vr-dark th, body.vr-dark td { border-color: #444; }
    body.vr-dark blockquote { border-left-color: #555; color: #aaa; background: rgba(255,255,255,0.04); }
    body.vr-dark hr { border-top-color: #444; }
    body.vr-light {
      color: #1e1e1e;
      background-color: #ffffff;
    }
    body.vr-light code { background: rgba(0,0,0,0.06); color: #24292e; }
    body.vr-light pre { background: rgba(0,0,0,0.05); color: #24292e; }
    body.vr-light th { background: rgba(0,0,0,0.04); }
    body.vr-light th, body.vr-light td { border-color: #ccc; }
    body.vr-light blockquote { border-left-color: #0969da; color: #57606a; background: #f6f8fa; }
    body.vr-light hr { border-top-color: #ddd; }
    code {
      font-family: 'SFMono-Regular', Consolas, monospace;
      padding: 0.1em 0.3em;
      border-radius: 3px;
    }
    pre { padding: 1em; border-radius: 4px; overflow-x: auto; }
    body.vr-light pre code,
    body.vr-dark pre code { background: none; padding: 0; }
    .error { color: #f44747; border: 1px solid currentColor; padding: 0.5em 1em; border-radius: 4px; }
    img { max-width: 100%; }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    th, td { padding: 6px 12px; border: 1px solid; }
    blockquote { margin: 0.5em 0; padding: 0.5em 1em; border-left: 4px solid; border-radius: 0 4px 4px 0; }
    hr { border: none; border-top: 1px solid; }
    .mermaid { margin: 1em 0; }
    ul li input[type="checkbox"] { margin-right: 4px; vertical-align: middle; }
    #theme-bar {
      position: sticky;
      top: 0;
      z-index: 100;
      display: flex;
      justify-content: flex-end;
      padding: 6px 0;
      margin: 0 -24px 8px;
    }
    body.vr-dark #theme-bar { background: #1e1e1e; border-bottom: 1px solid #333; }
    body.vr-light #theme-bar { background: #ffffff; border-bottom: 1px solid #ddd; }
    #theme-toggle {
      margin-right: 16px;
      padding: 4px 14px;
      font-size: 12px;
      cursor: pointer;
      border-radius: 12px;
      border: 1px solid;
      font-weight: 500;
    }
    body.vr-dark #theme-toggle { background: #2d2d2d; color: #ccc; border-color: #555; }
    body.vr-light #theme-toggle { background: #f5f5f5; color: #333; border-color: #bbb; }
    #theme-toggle:hover { opacity: 0.8; }

    /* highlight.js – dark theme (GitHub Dark) */
    body.vr-dark .hljs { color: #adbac7; }
    body.vr-dark .hljs-doctag,
    body.vr-dark .hljs-keyword,
    body.vr-dark .hljs-template-tag,
    body.vr-dark .hljs-template-variable,
    body.vr-dark .hljs-type,
    body.vr-dark .hljs-variable.language_ { color: #f47067; }
    body.vr-dark .hljs-title,
    body.vr-dark .hljs-title.class_,
    body.vr-dark .hljs-title.class_.inherited__,
    body.vr-dark .hljs-title.function_ { color: #dcbdfb; }
    body.vr-dark .hljs-attr,
    body.vr-dark .hljs-attribute,
    body.vr-dark .hljs-literal,
    body.vr-dark .hljs-meta,
    body.vr-dark .hljs-number,
    body.vr-dark .hljs-operator,
    body.vr-dark .hljs-selector-attr,
    body.vr-dark .hljs-selector-class,
    body.vr-dark .hljs-selector-id,
    body.vr-dark .hljs-variable { color: #6cb6ff; }
    body.vr-dark .hljs-string,
    body.vr-dark .hljs-regexp { color: #96d0ff; }
    body.vr-dark .hljs-built_in,
    body.vr-dark .hljs-symbol { color: #f69d50; }
    body.vr-dark .hljs-comment,
    body.vr-dark .hljs-code,
    body.vr-dark .hljs-formula { color: #768390; }
    body.vr-dark .hljs-name,
    body.vr-dark .hljs-quote,
    body.vr-dark .hljs-selector-pseudo,
    body.vr-dark .hljs-selector-tag { color: #8ddb8c; }
    body.vr-dark .hljs-subst { color: #adbac7; }
    body.vr-dark .hljs-section { color: #316dca; font-weight: bold; }
    body.vr-dark .hljs-bullet { color: #eac55f; }
    body.vr-dark .hljs-emphasis { color: #adbac7; font-style: italic; }
    body.vr-dark .hljs-strong { color: #adbac7; font-weight: bold; }
    body.vr-dark .hljs-addition { color: #b4f1b4; background-color: #1b4721; }
    body.vr-dark .hljs-deletion { color: #ffd8d3; background-color: #78191b; }

    /* highlight.js – light theme (GitHub) */
    body.vr-light .hljs { color: #24292e; }
    body.vr-light .hljs-doctag,
    body.vr-light .hljs-keyword,
    body.vr-light .hljs-template-tag,
    body.vr-light .hljs-template-variable,
    body.vr-light .hljs-type,
    body.vr-light .hljs-variable.language_ { color: #d73a49; }
    body.vr-light .hljs-title,
    body.vr-light .hljs-title.class_,
    body.vr-light .hljs-title.class_.inherited__,
    body.vr-light .hljs-title.function_ { color: #6f42c1; }
    body.vr-light .hljs-attr,
    body.vr-light .hljs-attribute,
    body.vr-light .hljs-literal,
    body.vr-light .hljs-meta,
    body.vr-light .hljs-number,
    body.vr-light .hljs-operator,
    body.vr-light .hljs-selector-attr,
    body.vr-light .hljs-selector-class,
    body.vr-light .hljs-selector-id,
    body.vr-light .hljs-variable { color: #005cc5; }
    body.vr-light .hljs-string,
    body.vr-light .hljs-regexp { color: #032f62; }
    body.vr-light .hljs-built_in,
    body.vr-light .hljs-symbol { color: #e36209; }
    body.vr-light .hljs-comment,
    body.vr-light .hljs-code,
    body.vr-light .hljs-formula { color: #6a737d; }
    body.vr-light .hljs-name,
    body.vr-light .hljs-quote,
    body.vr-light .hljs-selector-pseudo,
    body.vr-light .hljs-selector-tag { color: #22863a; }
    body.vr-light .hljs-subst { color: #24292e; }
    body.vr-light .hljs-section { color: #005cc5; font-weight: bold; }
    body.vr-light .hljs-bullet { color: #735c0f; }
    body.vr-light .hljs-emphasis { color: #24292e; font-style: italic; }
    body.vr-light .hljs-strong { color: #24292e; font-weight: bold; }
    body.vr-light .hljs-addition { color: #22863a; background-color: #f0fff4; }
    body.vr-light .hljs-deletion { color: #b31d28; background-color: #ffeef0; }
  </style>
  <script nonce="${nonce}" src="${mermaidUri}"></script>
</head>
<body class="vr-${initialMode}">
<div id="theme-bar">
  <button id="theme-toggle"></button>
</div>
<div id="content">${bodyHtml}</div>
<script nonce="${nonce}">
  var vscode = acquireVsCodeApi();
  var currentMode = '${initialMode}';

  var mermaidSources = [];

  function saveMermaidSources() {
    mermaidSources = [];
    
    // markedが生成した <pre><code class="language-mermaid"> を <div class="mermaid"> に変換
    document.querySelectorAll('pre code.language-mermaid').forEach(function(codeEl) {
      var pre = codeEl.parentNode;
      var div = document.createElement('div');
      div.className = 'mermaid';
      // textContentを使用することでエスケープされた文字列（&lt;など）を元の文字（<など）として扱う
      div.textContent = codeEl.textContent;
      pre.parentNode.replaceChild(div, pre);
    });

    document.querySelectorAll('.mermaid').forEach(function(el, i) {
      mermaidSources[i] = el.textContent;
    });
  }

  function renderMermaid() {
    var mermaidTheme = currentMode === 'dark' ? 'dark' : 'default';
    document.querySelectorAll('.mermaid').forEach(function(el, i) {
      el.textContent = mermaidSources[i];
      el.removeAttribute('data-processed');
    });
    mermaid.initialize({ startOnLoad: false, theme: mermaidTheme });
    mermaid.run({ querySelector: '.mermaid', suppressErrors: true }).catch(function() {});
  }

  function updateToggleLabel() {
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.textContent = currentMode === 'dark' ? '☀ ライト' : '☾ ダーク';
    }
  }

  // インラインスタイルで暗い背景色が設定された要素のテキストをライトモード時に読みやすくする
  function fixInlineBackgroundContrast() {
    if (currentMode !== 'light') return;
    document.querySelectorAll('#content [style]').forEach(function(el) {
      var inlineStyle = el.getAttribute('style') || '';
      if (!inlineStyle.includes('background')) return;
      var bg = window.getComputedStyle(el).backgroundColor;
      var paren = bg.indexOf('(');
      if (paren === -1) return;
      var parts = bg.slice(paren + 1).split(',');
      if (parts.length < 3) return;
      var r = parseInt(parts[0], 10), g = parseInt(parts[1], 10), b = parseInt(parts[2], 10);
      if (isNaN(r) || isNaN(g) || isNaN(b)) return;
      var luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      if (luminance < 0.4 && !inlineStyle.includes('color')) {
        el.style.color = '#e0e0e0';
      }
    });
  }

  document.getElementById('theme-toggle').addEventListener('click', function() {
    currentMode = currentMode === 'dark' ? 'light' : 'dark';
    document.body.className = 'vr-' + currentMode;
    updateToggleLabel();
    renderMermaid();
    fixInlineBackgroundContrast();
  });

  // 差分更新: テーマを保持したままコンテンツのみ差し替え
  window.addEventListener('message', function(event) {
    if (event.data.type === 'update') {
      document.getElementById('content').innerHTML = event.data.bodyHtml;
      saveMermaidSources();
      renderMermaid();
      fixInlineBackgroundContrast();
    }
  });

  document.getElementById('content').addEventListener('click', function(event) {
    var target = event.target;
    if (target.tagName === 'INPUT' && target.type === 'checkbox') {
      var checkboxes = document.querySelectorAll('#content input[type="checkbox"]');
      var index = Array.from(checkboxes).indexOf(target);
      vscode.postMessage({ type: 'toggleCheckbox', index: index, checked: target.checked });
    }
  });

  saveMermaidSources();
  updateToggleLabel();
  renderMermaid();
  fixInlineBackgroundContrast();
</script>
</body>
</html>`;
}
