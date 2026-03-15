import * as vscode from 'vscode';
import { renderMarkdown } from './markdownRenderer';
import { buildHtml } from './webview/template';

export class PreviewManager implements vscode.Disposable {
  private panels: Map<string, vscode.WebviewPanel> = new Map();

  constructor(private readonly extensionUri: vscode.Uri) {}

  openPreview(document: vscode.TextDocument): void {
    const uri = document.uri.toString();
    const existing = this.panels.get(uri);
    if (existing) {
      existing.reveal();
      return;
    }

    const fileName = document.uri.path.split('/').pop() ?? 'Preview';
    const panel = vscode.window.createWebviewPanel(
      'robustMarkdownPreview',
      fileName,
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'dist')],
      }
    );

    panel.onDidDispose(() => {
      this.panels.delete(uri);
    });

    this.panels.set(uri, panel);
    this.renderToPanel(panel, document);
  }

  private renderToPanel(panel: vscode.WebviewPanel, document: vscode.TextDocument): void {
    const bodyHtml = renderMarkdown(document.getText());
    panel.webview.html = buildHtml(bodyHtml, panel.webview, this.extensionUri);
  }

  dispose(): void {
    for (const panel of this.panels.values()) {
      panel.dispose();
    }
    this.panels.clear();
  }
}
