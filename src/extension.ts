import * as vscode from 'vscode';
import { PreviewManager } from './previewManager';

export function activate(context: vscode.ExtensionContext) {
  const previewManager = new PreviewManager(context.extensionUri);
  context.subscriptions.push(previewManager);

  const openPreviewCmd = vscode.commands.registerCommand('robustMarkdown.openPreview', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor');
      return;
    }
    previewManager.openPreview(editor.document);
  });

  const onChangeListener = vscode.workspace.onDidChangeTextDocument((e) => {
    previewManager.updatePreview(e.document);
  });

  const onSaveListener = vscode.workspace.onDidSaveTextDocument((document) => {
    previewManager.updatePreview(document);
  });

  context.subscriptions.push(openPreviewCmd, onChangeListener, onSaveListener);
}

export function deactivate() {}
