import { marked } from 'marked';

export function renderMarkdown(source: string): string {
  try {
    const preprocessed = preprocessMermaid(source);
    const result = marked.parse(preprocessed);
    return result as string;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return `<p class="error">Markdown parse error: ${escapeHtml(message)}</p>`;
  }
}

function preprocessMermaid(source: string): string {
  return source.replace(
    /```mermaid\n([\s\S]*?)```/g,
    (_match, code) => `<div class="mermaid">${escapeHtml(code.trim())}</div>`
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
