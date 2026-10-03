const { Plugin, PluginSettingTab, Setting, Notice, MarkdownView, FileSystemAdapter } = require('obsidian');
const { execFile } = require('child_process');
const path = require('path');

const DEFAULT_SETTINGS = {
  gitExecutable: 'git',
  compareRef: 'HEAD',
  stripeWidth: 9,
  refreshDelay: 350,
  showAdded: true,
  showModified: true,
  showDeleted: true,
  debug: false,
};

class GitOverviewStripesPlugin extends Plugin {
  async onload() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.refreshTimer = null;
    this.renderGeneration = 0;
    this.lastError = '';
    this.lastActivePath = null;

    this.addSettingTab(new GitOverviewStripesSettingTab(this.app, this));

    this.addCommand({
      id: 'refresh-git-overview-stripes',
      name: 'Refresh Git overview stripes',
      callback: () => this.scheduleRefresh(0),
    });

    this.registerEvent(this.app.workspace.on('file-open', () => this.scheduleRefresh(40)));
    this.registerEvent(this.app.workspace.on('active-leaf-change', () => this.scheduleRefresh(40)));
    this.registerEvent(this.app.workspace.on('layout-change', () => this.scheduleRefresh(80)));
    this.registerEvent(this.app.workspace.on('editor-change', () => this.scheduleRefresh(this.settings.refreshDelay)));

    // Refresh when Obsidian actually writes the active note to disk. This is more
    // reliable for Git diff than rebuilding the stripe on a polling timer.
    this.registerEvent(this.app.vault.on('modify', (file) => {
      const active = this.app.workspace.getActiveFile();
      if (active && file && active.path === file.path) this.scheduleRefresh(60);
    }));
    this.registerEvent(this.app.vault.on('rename', () => this.scheduleRefresh(60)));
    this.registerEvent(this.app.vault.on('delete', () => this.scheduleRefresh(60)));

    // External Git operations are commonly followed by returning focus to Obsidian.
    // Refresh then, without touching the DOM unless the diff actually changed.
    this.registerDomEvent(window, 'focus', () => this.scheduleRefresh(50));
    this.registerDomEvent(document, 'visibilitychange', () => {
      if (!document.hidden) this.scheduleRefresh(50);
    });

    this.app.workspace.onLayoutReady(() => this.scheduleRefresh(100));
  }

  onunload() {
    if (this.refreshTimer) window.clearTimeout(this.refreshTimer);
    this.removeAllStripes();
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.scheduleRefresh(0);
  }

  log(...args) {
    if (this.settings.debug) console.log('[Git Overview Stripes]', ...args);
  }

  scheduleRefresh(delay = 0) {
    if (this.refreshTimer) window.clearTimeout(this.refreshTimer);
    this.refreshTimer = window.setTimeout(() => {
      this.refreshTimer = null;
      this.refresh().catch((err) => this.handleError(err));
    }, Math.max(0, delay));
  }

  handleError(err) {
    const message = err && err.message ? err.message : String(err);
    this.log('refresh error:', err);
    if (this.settings.debug && message !== this.lastError) {
      this.lastError = message;
      new Notice(`Git Overview Stripes: ${message}`, 5000);
    }
  }

  removeAllStripes() {
    document.querySelectorAll('.git-overview-stripe').forEach((el) => el.remove());
    this.lastActivePath = null;
  }

  removeStripeFromRoot(editorRoot) {
    if (!editorRoot) return;
    const stripe = editorRoot.querySelector('.git-overview-stripe');
    if (stripe) stripe.remove();
  }

  removeStripesOutside(editorRoot) {
    document.querySelectorAll('.git-overview-stripe').forEach((el) => {
      if (!editorRoot.contains(el)) el.remove();
    });
  }

  getActiveContext() {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view || !view.file || !view.editor) return null;

    const adapter = this.app.vault.adapter;
    if (!(adapter instanceof FileSystemAdapter) || typeof adapter.getBasePath !== 'function') return null;

    const vaultBase = adapter.getBasePath();
    const fileAbs = path.join(vaultBase, view.file.path);
    const editorRoot = view.containerEl.querySelector('.cm-editor');
    if (!editorRoot) return null;

    return { view, editor: view.editor, editorRoot, vaultBase, fileAbs, vaultPath: view.file.path };
  }

  execGit(args, cwd) {
    return new Promise((resolve, reject) => {
      execFile(this.settings.gitExecutable || 'git', args, {
        cwd,
        windowsHide: true,
        maxBuffer: 8 * 1024 * 1024,
        encoding: 'utf8',
      }, (error, stdout, stderr) => {
        if (error) {
          error.stderr = stderr;
          reject(error);
          return;
        }
        resolve(stdout || '');
      });
    });
  }

  async findRepoRoot(fileAbs, vaultBase) {
    const candidates = [path.dirname(fileAbs), vaultBase];
    let lastErr = null;
    for (const cwd of candidates) {
      try {
        const out = await this.execGit(['rev-parse', '--show-toplevel'], cwd);
        const root = out.trim();
        if (root) return root;
      } catch (e) {
        lastErr = e;
      }
    }
    if (lastErr) throw new Error('No Git repository found for the current note.');
    return null;
  }

  async isTracked(repoRoot, relPath) {
    try {
      await this.execGit(['ls-files', '--error-unmatch', '--', relPath], repoRoot);
      return true;
    } catch (_) {
      return false;
    }
  }

  async getDiff(repoRoot, relPath) {
    const ref = (this.settings.compareRef || 'HEAD').trim() || 'HEAD';
    return await this.execGit([
      'diff', ref,
      '--no-ext-diff', '--no-color', '--unified=0',
      '--', relPath,
    ], repoRoot);
  }

  parseDiff(diffText) {
    const markers = [];
    const re = /^@@\s+-(\d+)(?:,(\d+))?\s+\+(\d+)(?:,(\d+))?\s+@@/gm;
    let match;
    while ((match = re.exec(diffText)) !== null) {
      const oldStart = Number(match[1]);
      const oldCount = match[2] === undefined ? 1 : Number(match[2]);
      const newStart = Number(match[3]);
      const newCount = match[4] === undefined ? 1 : Number(match[4]);

      if (oldCount === 0 && newCount > 0) {
        markers.push({ type: 'added', line: Math.max(1, newStart), count: Math.max(1, newCount) });
      } else if (newCount === 0 && oldCount > 0) {
        markers.push({ type: 'deleted', line: Math.max(1, newStart), count: 1, deletedCount: oldCount });
      } else if (oldCount > 0 && newCount > 0) {
        markers.push({ type: 'modified', line: Math.max(1, newStart), count: Math.max(1, newCount) });
      }
    }
    return markers;
  }

  async refresh() {
    const generation = ++this.renderGeneration;
    const ctx = this.getActiveContext();
    if (!ctx) {
      this.removeAllStripes();
      return;
    }

    // Do not tear down the current stripe before Git finishes. Recreating DOM here
    // made Chromium's overlay scrollbar reappear every polling cycle in v1.0.0.
    // Old stripes in inactive editor roots are cleaned up only when the active view
    // actually changes.
    if (this.lastActivePath !== ctx.vaultPath) {
      this.removeStripesOutside(ctx.editorRoot);
      this.lastActivePath = ctx.vaultPath;
    }

    let repoRoot;
    try {
      repoRoot = await this.findRepoRoot(ctx.fileAbs, ctx.vaultBase);
    } catch (e) {
      this.log(e.message);
      this.removeStripeFromRoot(ctx.editorRoot);
      return;
    }
    if (generation !== this.renderGeneration) return;

    const relPath = path.relative(repoRoot, ctx.fileAbs).split(path.sep).join('/');
    if (relPath.startsWith('../')) {
      this.removeStripeFromRoot(ctx.editorRoot);
      return;
    }

    let markers = [];
    const tracked = await this.isTracked(repoRoot, relPath);
    if (generation !== this.renderGeneration) return;

    if (!tracked) {
      const total = Math.max(1, ctx.editor.lineCount());
      markers = [{ type: 'added', line: 1, count: total }];
    } else {
      let diffText = '';
      try {
        diffText = await this.getDiff(repoRoot, relPath);
      } catch (e) {
        // HEAD can be absent in a brand-new repository. In that case treat the note as added.
        const stderr = String(e.stderr || '');
        if (/unknown revision|bad revision|ambiguous argument|does not have any commits/i.test(stderr + ' ' + e.message)) {
          const total = Math.max(1, ctx.editor.lineCount());
          markers = [{ type: 'added', line: 1, count: total }];
        } else {
          throw e;
        }
      }
      if (!markers.length && diffText) markers = this.parseDiff(diffText);
    }

    if (generation !== this.renderGeneration) return;
    this.renderStripe(ctx, markers);
  }

  renderStripe(ctx, markers) {
    const totalLines = Math.max(1, ctx.editor.lineCount());
    const visibleMarkers = markers.filter((marker) => {
      if (marker.type === 'added') return this.settings.showAdded;
      if (marker.type === 'modified') return this.settings.showModified;
      if (marker.type === 'deleted') return this.settings.showDeleted;
      return false;
    });

    // A clean file needs no overlay at all. This keeps the native scrollbar fully
    // untouched when there are no Git markers to show.
    if (visibleMarkers.length === 0) {
      this.removeStripeFromRoot(ctx.editorRoot);
      return;
    }

    // Critical anti-flicker rule: if the visual state is identical, do not mutate
    // the editor DOM at all. This also keeps Chromium from flashing the scrollbar.
    const renderKey = JSON.stringify({
      path: ctx.vaultPath,
      totalLines,
      width: Math.max(4, Math.min(24, Number(this.settings.stripeWidth) || 9)),
      markers: visibleMarkers.map((m) => [m.type, m.line, m.count || 1, m.deletedCount || 0]),
    });
    const existing = ctx.editorRoot.querySelector('.git-overview-stripe');
    if (existing && existing.dataset.renderKey === renderKey) return;
    if (existing) existing.remove();

    const stripe = document.createElement('div');
    stripe.className = 'git-overview-stripe';
    stripe.style.setProperty('--gos-width', `${Math.max(4, Math.min(24, Number(this.settings.stripeWidth) || 9))}px`);
    stripe.setAttribute('aria-label', 'Git overview stripe');
    stripe.dataset.renderKey = renderKey;

    for (const marker of visibleMarkers) {

      const el = document.createElement('div');
      el.className = `git-overview-marker git-overview-marker-${marker.type}`;
      const lineIndex = Math.max(0, Math.min(totalLines - 1, marker.line - 1));
      const topPct = totalLines <= 1 ? 0 : (lineIndex / (totalLines - 1)) * 100;
      const extent = marker.type === 'deleted' ? 1 : Math.max(1, marker.count || 1);
      const heightPct = Math.max(0.35, (extent / totalLines) * 100);

      el.style.top = `${Math.min(99.5, topPct)}%`;
      el.style.height = `max(3px, ${Math.min(100, heightPct)}%)`;
      el.title = `${marker.type === 'added' ? 'Added' : marker.type === 'deleted' ? 'Deleted' : 'Modified'} - line ${marker.line}`;
      el.dataset.line = String(marker.line);

      el.addEventListener('mousedown', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        const line = Math.max(0, Math.min(ctx.editor.lineCount() - 1, marker.line - 1));
        const pos = { line, ch: 0 };
        ctx.editor.setCursor(pos);
        ctx.editor.scrollIntoView({ from: pos, to: pos }, true);
        ctx.editor.focus();
      });

      stripe.appendChild(el);
    }

    ctx.editorRoot.appendChild(stripe);
  }
}

class GitOverviewStripesSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl('h2', { text: 'Git Overview Stripes' });
    containerEl.createEl('p', {
      text: 'Shows Git changes beside the editor scrollbar. It compares the current note with the selected Git reference (HEAD by default).',
    });

    new Setting(containerEl)
      .setName('Git executable')
      .setDesc('Usually "git". If Obsidian cannot find Git, enter the full path to git.exe / git.')
      .addText((text) => text
        .setPlaceholder('git')
        .setValue(this.plugin.settings.gitExecutable)
        .onChange(async (value) => {
          this.plugin.settings.gitExecutable = value.trim() || 'git';
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Compare with')
      .setDesc('Git reference used as the baseline. HEAD gives JetBrains-like local change markers.')
      .addText((text) => text
        .setPlaceholder('HEAD')
        .setValue(this.plugin.settings.compareRef)
        .onChange(async (value) => {
          this.plugin.settings.compareRef = value.trim() || 'HEAD';
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Stripe width')
      .setDesc('Width in pixels of the overview stripe.')
      .addSlider((slider) => slider
        .setLimits(4, 20, 1)
        .setValue(this.plugin.settings.stripeWidth)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.stripeWidth = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Show added lines')
      .addToggle((toggle) => toggle
        .setValue(this.plugin.settings.showAdded)
        .onChange(async (value) => {
          this.plugin.settings.showAdded = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Show modified lines')
      .addToggle((toggle) => toggle
        .setValue(this.plugin.settings.showModified)
        .onChange(async (value) => {
          this.plugin.settings.showModified = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Show deleted lines')
      .addToggle((toggle) => toggle
        .setValue(this.plugin.settings.showDeleted)
        .onChange(async (value) => {
          this.plugin.settings.showDeleted = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Debug notices')
      .setDesc('Show Git errors as notices and log details to the developer console.')
      .addToggle((toggle) => toggle
        .setValue(this.plugin.settings.debug)
        .onChange(async (value) => {
          this.plugin.settings.debug = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Refresh now')
      .setDesc('Re-read Git diff for the active note.')
      .addButton((button) => button
        .setButtonText('Refresh')
        .onClick(() => this.plugin.scheduleRefresh(0)));
  }
}

module.exports = GitOverviewStripesPlugin;
