# Change Log

All notable changes to the "vscode-robust-markdown" extension will be documented in this file.

## [0.3.8] - 2026-04-09

### Fixed

- Checkbox toggle now auto-saves the file immediately, preventing conflicts when AI agents edit the file concurrently

## [0.3.7] - 2026-04-05

### Fixed

- Improved blockquote styling in light mode: added light gray background (`#f6f8fa`), blue left border (`#0969da`), and softer text color for better readability

## [0.3.6] - 2026-04-02

### Changed

- Removed Mermaid preprocessing step — marked now handles Mermaid code blocks directly, eliminating regex-based preprocessing issues (e.g., `\r\n` line ending mismatch)
- Webview now converts `<pre><code class="language-mermaid">` to `<div class="mermaid">` at render time, using `textContent` to correctly decode HTML entities before passing source to Mermaid

## [0.3.5] - 2026-03-29

### Fixed

- Improved readability of text in elements with dark inline background colors in light mode
- Fixed a SyntaxError in the webview script caused by regex containing `\(` inside a template literal (which also caused the dark/light toggle button to disappear)

## [0.3.4] - 2026-03-26

### Added

- Preview tab now shows the extension icon

## [0.3.3] - 2026-03-20

### Fixed

- Table borders now visible (dark/light theme aware)

## [0.3.2] - 2026-03-20

### Fixed

- Code block text color invisible in light mode when VS Code is using a dark theme
- Inconsistent background color between code text area and padding inside code blocks

## [0.3.0] - 2026-03-20

### Added

- Syntax highlighting for code blocks based on programming language (highlight.js, dark/light theme aware)
- Interactive checkbox editing — click checkboxes in the preview to toggle `[ ]` / `[x]` directly in the source file

### Fixed

- Theme (dark/light) reset to default when switching back to the preview tab
- Checkboxes rendered as plain `[]` text instead of actual checkbox inputs

## [0.1.0] - 2026-03-15

### Added

- Markdown preview panel (WebviewPanel + `marked` HTML rendering)
- Open preview from editor title bar icon
- Open preview from right-click context menu
- Prevent duplicate panels for the same file
- Auto-update preview on edit and save with 1000ms debounce
- Crash resilience against high-frequency writes by AI coding agents
- Graceful inline display of Markdown parse errors without closing the panel
- Mermaid diagram rendering (bundled, works offline)
- Per-diagram error isolation for Mermaid syntax errors
- Dark/light theme toggle button with automatic sync to VS Code theme
