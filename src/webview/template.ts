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
    body.vr-dark code { background: rgba(255,255,255,0.1); }
    body.vr-dark pre { background: rgba(255,255,255,0.08); }
    body.vr-dark th { background: rgba(255,255,255,0.06); }
    body.vr-dark th, body.vr-dark td { border-color: #444; }
    body.vr-dark blockquote { border-left-color: #555; color: #aaa; }
    body.vr-dark hr { border-top-color: #444; }
    body.vr-light {
      color: #1e1e1e;
      background-color: #ffffff;
    }
    body.vr-light code { background: rgba(0,0,0,0.06); }
    body.vr-light pre { background: rgba(0,0,0,0.05); }
    body.vr-light th { background: rgba(0,0,0,0.04); }
    body.vr-light th, body.vr-light td { border-color: #ccc; }
    body.vr-light blockquote { border-left-color: #ccc; color: #555; }
    body.vr-light hr { border-top-color: #ddd; }
    code {
      font-family: 'SFMono-Regular', Consolas, monospace;
      padding: 0.1em 0.3em;
      border-radius: 3px;
    }
    pre { padding: 1em; border-radius: 4px; overflow-x: auto; }
    pre code { background: none; padding: 0; }
    .error { color: #f44747; border: 1px solid currentColor; padding: 0.5em 1em; border-radius: 4px; }
    img { max-width: 100%; }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    th, td { padding: 6px 12px; }
    blockquote { margin: 0; padding: 0 1em; }
    hr { border: none; border-top: 1px solid; }
    .mermaid { margin: 1em 0; }
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
  </style>
  <script nonce="${nonce}" src="${mermaidUri}"></script>
</head>
<body class="vr-${initialMode}">
<div id="theme-bar">
  <button id="theme-toggle"></button>
</div>
<div id="content">${bodyHtml}</div>
<script nonce="${nonce}">
  var currentMode = '${initialMode}';

  var mermaidSources = [];

  function saveMermaidSources() {
    mermaidSources = [];
    document.querySelectorAll('.mermaid').forEach(function(el, i) {
      mermaidSources[i] = el.innerHTML;
    });
  }

  function renderMermaid() {
    var mermaidTheme = currentMode === 'dark' ? 'dark' : 'default';
    document.querySelectorAll('.mermaid').forEach(function(el, i) {
      el.innerHTML = mermaidSources[i];
      el.removeAttribute('data-processed');
    });
    mermaid.initialize({ startOnLoad: false, theme: mermaidTheme });
    mermaid.run({ querySelector: '.mermaid', suppressErrors: true }).catch(function() {});
  }

  function updateToggleLabel() {
    document.getElementById('theme-toggle').textContent =
      currentMode === 'dark' ? '☀ ライト' : '☾ ダーク';
  }

  document.getElementById('theme-toggle').addEventListener('click', function() {
    currentMode = currentMode === 'dark' ? 'light' : 'dark';
    document.body.className = 'vr-' + currentMode;
    updateToggleLabel();
    renderMermaid();
  });

  // 差分更新: テーマを保持したままコンテンツのみ差し替え
  window.addEventListener('message', function(event) {
    if (event.data.type === 'update') {
      document.getElementById('content').innerHTML = event.data.bodyHtml;
      saveMermaidSources();
      renderMermaid();
    }
  });

  saveMermaidSources();
  updateToggleLabel();
  renderMermaid();
</script>
</body>
</html>`;
}
