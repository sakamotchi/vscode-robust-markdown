import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';

marked.use(markedHighlight({
  langPrefix: 'hljs language-',
  highlight(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  }
}));

export function renderMarkdown(source: string): string {
  try {
    const html = marked.parse(source) as string;
    return html
      .replace(/<input disabled="" type="checkbox">/g, '<input type="checkbox">')
      .replace(/<input checked="" disabled="" type="checkbox">/g, '<input checked="" type="checkbox">');
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
