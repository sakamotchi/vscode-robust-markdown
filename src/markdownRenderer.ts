import { marked } from 'marked';

export function renderMarkdown(source: string): string {
  try {
    const result = marked.parse(source);
    return result as string;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return `<p class="error">Markdown parse error: ${escapeHtml(message)}</p>`;
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
