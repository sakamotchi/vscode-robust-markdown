import * as vscode from 'vscode';
import { renderMarkdown } from './markdownRenderer';
import { buildHtml } from './webview/template';

const DEBOUNCE_WAIT_MS = 1000;

export class PreviewManager implements vscode.Disposable {
  private panels: Map<string, vscode.WebviewPanel> = new Map();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();

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
      const timer = this.debounceTimers.get(uri);
      if (timer !== undefined) {
        clearTimeout(timer);
        this.debounceTimers.delete(uri);
      }
      this.panels.delete(uri);
    });

    this.panels.set(uri, panel);
    this.renderToPanel(panel, document);
  }

  updatePreview(document: vscode.TextDocument): void {
    const uri = document.uri.toString();
    if (!this.panels.has(uri)) {
      return;
    }

    const existing = this.debounceTimers.get(uri);
    if (existing !== undefined) {
      clearTimeout(existing);
    }

    const timer = setTimeout(() => {
      const panel = this.panels.get(uri);
      if (panel) {
        this.renderToPanel(panel, document);
      }
      this.debounceTimers.delete(uri);
    }, DEBOUNCE_WAIT_MS);

    this.debounceTimers.set(uri, timer);
  }

  private renderToPanel(panel: vscode.WebviewPanel, document: vscode.TextDocument): void {
    const bodyHtml = renderMarkdown(document.getText());
    panel.webview.html = buildHtml(bodyHtml, panel.webview, this.extensionUri);
  }

  dispose(): void {
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();

    for (const panel of this.panels.values()) {
      panel.dispose();
    }
    this.panels.clear();
  }
}
