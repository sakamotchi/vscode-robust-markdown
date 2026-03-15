import * as vscode from 'vscode';

export function buildHtml(
  bodyHtml: string,
  webview: vscode.Webview,
  _extensionUri: vscode.Uri
): string {
  const cspSource = webview.cspSource;

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'none'; script-src ${cspSource}; style-src 'unsafe-inline';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Preview</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      padding: 0 24px 40px;
      color: var(--vscode-editor-foreground);
      background-color: var(--vscode-editor-background);
      max-width: 900px;
    }
    code {
      font-family: var(--vscode-editor-font-family, monospace);
      background: var(--vscode-textCodeBlock-background, rgba(0,0,0,0.1));
      padding: 0.1em 0.3em;
      border-radius: 3px;
    }
    pre {
      background: var(--vscode-textCodeBlock-background, rgba(0,0,0,0.1));
      padding: 1em;
      border-radius: 4px;
      overflow-x: auto;
    }
    pre code {
      background: none;
      padding: 0;
    }
    .error {
      color: var(--vscode-errorForeground, #f44747);
      border: 1px solid currentColor;
      padding: 0.5em 1em;
      border-radius: 4px;
    }
    img { max-width: 100%; }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    th, td { border: 1px solid var(--vscode-panel-border, #ccc); padding: 6px 12px; }
    th { background: var(--vscode-textCodeBlock-background, rgba(0,0,0,0.05)); }
    blockquote {
      border-left: 4px solid var(--vscode-textBlockQuote-border, #ccc);
      margin: 0;
      padding: 0 1em;
      color: var(--vscode-textBlockQuote-foreground);
    }
    hr { border: none; border-top: 1px solid var(--vscode-panel-border, #ccc); }
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}
