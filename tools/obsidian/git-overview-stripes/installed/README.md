# Git Overview Stripes for Obsidian

A small desktop-only Obsidian plugin that adds JetBrains-style Git change markers beside the editor scrollbar.

## What it shows

- Green: added lines/hunks
- Blue: modified lines/hunks
- Red: deleted lines/hunks
- Click a marker to jump to that change
- Uses `git diff HEAD -- <current-file>` by default, so staged and unstaged local changes are both represented
- Untracked notes are shown as fully added

It is designed to complement **Obsidian Git -> Signs**. Obsidian Git can provide the left gutter signs; this plugin provides the right-side overview stripe.

## Manual installation

1. Close Obsidian, or leave it open and reload it after installation.
2. Open your vault folder.
3. Open `.obsidian/plugins/`.
4. Create a folder named `git-overview-stripes`.
5. Copy these three files into it:
   - `manifest.json`
   - `main.js`
   - `styles.css`
6. Start/reload Obsidian.
7. Go to **Settings -> Community plugins**.
8. Enable **Git Overview Stripes**.

Expected folder layout:

```text
<Vault>/.obsidian/plugins/git-overview-stripes/
  manifest.json
  main.js
  styles.css
```

## Requirements

- Desktop Obsidian
- Git installed and callable as `git`
- The active note must be inside a Git repository

If Git is not found, open **Settings -> Git Overview Stripes** and set **Git executable** to the full path, for example on Windows:

```text
C:\\Program Files\\Git\\cmd\\git.exe
```

## Settings

- Git executable
- Compare with (`HEAD` by default)
- Stripe width
- Show/hide added, modified, deleted markers
- Debug notices
- Manual refresh

## Notes / limitations in 1.0.0

- Desktop only.
- The plugin intentionally does not depend on Obsidian Git internals.
- With `--unified=0`, a Git hunk containing replacements is represented as a blue modified marker. Pure additions are green and pure deletions are red.
- The stripe is refreshed after edits (debounced), file switches, layout changes, and periodically. This avoids relying on private Obsidian APIs.
- Very unusual themes that heavily restructure CodeMirror's DOM may require a small CSS adjustment.


## 1.0.1

- Removed the 2.5-second DOM rebuild/polling loop that could make Chromium/Obsidian overlay scrollbars flash.
- The stripe is now refreshed by editor/vault/workspace events and when Obsidian regains focus.
- Added render-state caching: if Git markers are unchanged, the editor DOM is not modified at all.
