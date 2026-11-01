/*
 * Copyright (c) Victor Kosenko
 * Classic Generator Web Lite - Shortcuts Modal
 */

import { Icons } from './icons';

export class ShortcutsModal {
  private overlay: HTMLElement;

  constructor() {
    this.overlay = document.createElement('div');
    this.overlay.className =
      'fixed inset-0 z-50 bg-[var(--modal-overlay)] backdrop-blur-sm flex items-center justify-center p-4 transition-opacity hidden opacity-0';
    this.render();
    document.body.appendChild(this.overlay);

    this.overlay.addEventListener('click', e => {
      if (e.target === this.overlay) {
        this.close();
      }
    });

    this.overlay.querySelector('#btn-close-modal')?.addEventListener('click', () => {
      this.close();
    });
  }

  public open() {
    this.overlay.classList.remove('hidden');
    requestAnimationFrame(() => {
      this.overlay.classList.remove('opacity-0');
    });
  }

  public close() {
    this.overlay.classList.add('opacity-0');
    setTimeout(() => {
      this.overlay.classList.add('hidden');
    }, 200);
  }

  public toggle() {
    if (this.overlay.classList.contains('hidden')) {
      this.open();
    } else {
      this.close();
    }
  }

  public isOpen(): boolean {
    return !this.overlay.classList.contains('hidden');
  }

  private render() {
    const shortcuts = [
      { key: 'Space / Enter', desc: 'Generate new random value' },
      { key: 'C', desc: 'Copy currently displayed value' },
      { key: '1', desc: 'Switch to Numeric generator' },
      { key: '2', desc: 'Switch to Numeric fixed generator' },
      { key: 'O', desc: 'Toggle Options editor' },
      { key: 'H', desc: 'Toggle History view' },
      { key: 'Esc', desc: 'Return to generator workbench / close modal' },
      { key: '?', desc: 'Show this keyboard shortcuts guide' },
    ];

    this.overlay.innerHTML = `
      <div class="w-full max-w-md bg-surface-card border border-surface-cardBorder rounded-2xl shadow-card-glow p-6 flex flex-col gap-4 text-content-primary">
        <div class="flex items-center justify-between pb-2 border-b border-surface-innerBorder">
          <div class="flex items-center gap-2">
            <span class="text-content-muted">${Icons.keyboard}</span>
            <h3 class="font-semibold text-sm">Keyboard Shortcuts</h3>
          </div>
          <button id="btn-close-modal" type="button" class="w-7 h-7 rounded-lg flex items-center justify-center text-content-muted hover:text-content-primary hover:bg-surface-cardMuted transition-colors">
            ${Icons.close}
          </button>
        </div>

        <div class="flex flex-col gap-2.5 py-1">
          ${shortcuts
            .map(
              s => `
            <div class="flex items-center justify-between text-xs py-1">
              <span class="text-content-secondary">${s.desc}</span>
              <kbd class="px-2 py-1 rounded bg-surface-inner border border-surface-innerBorder text-[11px] font-mono text-content-primary font-semibold shadow-inner">
                ${s.key}
              </kbd>
            </div>
          `
            )
            .join('')}
        </div>

        <div class="pt-2 text-center text-[11px] text-content-subdued border-t border-surface-innerBorder">
          Press <kbd class="px-1 py-0.5 rounded bg-surface-inner border border-surface-innerBorder text-content-secondary text-[10px]">Esc</kbd> to close
        </div>
      </div>
    `;
  }
}
