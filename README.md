# AI Safe Markdown Preview

A VS Code extension providing a robust Markdown preview designed for high-frequency file updates by AI coding agents (e.g., Claude Code).

## Features

### Markdown Preview

Open a preview from the editor title bar icon or the right-click context menu. Each file opens in its own native VS Code tab, allowing multiple files to be previewed simultaneously.

### Syntax Highlighting

Code blocks are highlighted based on programming language using highlight.js. Highlighting adapts automatically to the current dark/light theme.

### Interactive Checkboxes

Click checkboxes in the preview to toggle `[ ]` / `[x]` directly in the source Markdown file — no need to edit the raw text manually.

### AI Update Resilience

A 1000ms debounce on all update events prevents crashes even when an AI agent rewrites the file at high frequency. The preview auto-updates on both edit and save.

### Mermaid Diagram Support

Renders ` ```mermaid ``` ` blocks as SVG diagrams. Syntax errors are isolated per diagram and do not affect the rest of the preview. mermaid.js is bundled so it works offline.

### Theme Toggle

Switch between dark and light mode using the button at the top of the preview. The initial mode syncs automatically with your VS Code color theme and is preserved across content updates.

## Usage

1. Open a Markdown file in the editor
2. Click the icon at the right end of the editor title bar, or right-click → **Open Robust Markdown Preview**
3. The preview panel opens beside the editor

## Requirements

- VS Code 1.110.0 or later

## Known Limitations

- Debounce duration is fixed at 1000ms (not configurable)
- Theme preference resets when the preview panel is closed
