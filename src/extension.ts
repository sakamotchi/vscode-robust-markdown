import * as vscode from 'vscode';
import { PreviewManager } from './previewManager';

export function activate(context: vscode.ExtensionContext) {
  const previewManager = new PreviewManager(context.extensionUri);
  context.subscriptions.push(previewManager);

  const disposable = vscode.commands.registerCommand('robustMarkdown.openPreview', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor');
      return;
    }
    previewManager.openPreview(editor.document);
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
