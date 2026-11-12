/*
 * Copyright (c) Victor Kosenko
 * Classic Generator Web Lite - Generator View
 */

import type { AppState, GeneratorType, NumOptions, NumFixedOptions } from '../types';
import { GENERATOR_LIMITS } from '../types';
import { APP_VERSION } from '../version';
import { RandomEngine } from '../services/RandomEngine';
import { Icons } from './icons';

export interface GeneratorViewCallbacks {
  onSelectType: (type: GeneratorType) => void;
  onGenerate: () => void;
  onEditOptions: () => void;
  onOpenHistory: () => void;
  onCopyValue: (value: string) => void;
  onToggleSound: () => void;
  onToggleTheme: () => void;
  onOpenShortcuts: () => void;
  onQuickUpdateNum: (options: NumOptions) => void;
  onQuickUpdateNumFixed: (options: NumFixedOptions) => void;
  onInstallApp?: () => void;
}

export class GeneratorView {
  private container: HTMLElement;
  private callbacks: GeneratorViewCallbacks;
  private copyTimeout: number | null = null;
  private isCopied = false;
  private canInstall = false;
  private resizeObserver: ResizeObserver | null = null;
  private isFitting = false;

  constructor(container: HTMLElement, callbacks: GeneratorViewCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
  }

  public setCanInstall(canInstall: boolean) {
    this.canInstall = canInstall;
    const btn = this.container.querySelector('#btn-install-pwa');
    const sep = this.container.querySelector('#install-separator');
    if (btn) {
      if (canInstall) {
        btn.classList.remove('hidden');
        btn.classList.add('inline-flex');
        sep?.classList.remove('hidden');
        sep?.classList.add('inline');
      } else {
        btn.classList.add('hidden');
        btn.classList.remove('inline-flex');
        sep?.classList.add('hidden');
        sep?.classList.remove('inline');
      }
    }
  }

  public showCopiedFeedback() {
    this.isCopied = true;
    if (this.copyTimeout) {
      window.clearTimeout(this.copyTimeout);
    }
    this.updateStatusBadge();
    this.copyTimeout = window.setTimeout(() => {
      this.isCopied = false;
      this.updateStatusBadge();
    }, 1800);
  }

  private updateStatusBadge() {
    const badgeEl = this.container.querySelector('#status-badge');
    if (!badgeEl) return;

    if (this.isCopied) {
      badgeEl.innerHTML = `
        <span class="inline-flex items-center text-xs gap-1.5 transition-colors text-emerald-500 font-medium">
          <span class="w-3.5 h-3.5 flex items-center justify-center shrink-0 [&>svg]:w-3.5 [&>svg]:h-3.5">
            ${Icons.check}
          </span>
          <span class="status-badge-text leading-none">Copied to clipboard</span>
        </span>
      `;
    } else {
      const summaryText = badgeEl.getAttribute('data-summary') || '';
      badgeEl.innerHTML = `
        <span class="inline-flex items-center text-xs gap-1.5 transition-colors text-content-muted">
          <span class="w-3.5 h-3.5 flex items-center justify-center shrink-0">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          </span>
          <span class="status-badge-text leading-none">${summaryText}</span>
        </span>
      `;
    }
  }

  public render(state: AppState) {
    const isFixed = state.activeGenerator === 'num_fixed';

    let currentSummary = '';
    if (state.activeGenerator === 'num') {
      const { min, max } = state.options.num;
      currentSummary = min === 0 ? `Max: ${max}` : `Range: ${min} – ${max}`;
    } else {
      const len = state.options.num_fixed.length;
      currentSummary = `Fixed: ${len} ${len === 1 ? 'digit' : 'digits'}`;
    }

    const hasValue = Boolean(state.lastGenerated);
    const currentValue = state.lastGenerated?.value || '';
    const fontSizeClass = resolveHeroFontSizeClass(currentValue.length || 1);
    const trackingClass = resolveHeroTrackingClass(currentValue.length || 1);

    let formattedHtml = '';
    if (hasValue) {
      const isRecordFixed = state.lastGenerated?.type === 'num_fixed';
      const chunks = RandomEngine.formatChunked(currentValue, isRecordFixed);
      // Format chunks with alternating contrast like the inspiration card (primary / muted)
      formattedHtml = chunks
        .map((chunk, idx) => {
          const isPrimary = idx % 2 === 0;
          const colorClass = isPrimary ? 'text-content-primary' : 'text-content-muted';
          return `<span class="${colorClass}">${chunk}</span>`;
        })
        .join('<span class="mx-1.5 text-content-subdued font-normal select-none"> </span>');
    } else {
      formattedHtml = '<span class="text-content-subdued select-none font-normal">—</span>';
    }

    const historyCount = state.history.length;

    this.container.innerHTML = `
      <div class="view-container p-6 flex flex-col justify-between h-full min-h-0 gap-5 flex-1 overflow-hidden">
        <!-- Top Header: Generator Selector + Utility Toolbar -->
        <div class="flex items-center justify-between gap-3 shrink-0">
          <!-- Generator Selector Pills (+ Standalone App Icon) -->
          <div class="flex items-center gap-2.5">
            <img src="./favicon.svg" alt="Classic Generator" class="w-7 h-7 drop-shadow-sm select-none hidden standalone-show" />
            <div class="inline-flex items-center p-1 bg-surface-inner border border-surface-innerBorder rounded-xl">
              <button
                id="btn-tab-num"
                type="button"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  state.activeGenerator === 'num'
                    ? 'bg-surface-card text-content-primary shadow-sm border border-surface-cardBorder'
                    : 'text-content-muted hover:text-content-primary'
                }"
              >
                <span class="w-4 h-4 rounded-full ${
                  state.activeGenerator === 'num'
                    ? 'bg-content-primary text-surface-card font-bold'
                    : 'bg-surface-cardMuted text-content-muted border border-surface-innerBorder font-medium'
                } text-[10px] flex items-center justify-center">N</span>
                Numeric
              </button>
              <button
                id="btn-tab-fixed"
                type="button"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  state.activeGenerator === 'num_fixed'
                    ? 'bg-surface-card text-content-primary shadow-sm border border-surface-cardBorder'
                    : 'text-content-muted hover:text-content-primary'
                }"
              >
                <span class="w-4 h-4 rounded-full ${
                  state.activeGenerator === 'num_fixed'
                    ? 'bg-content-primary text-surface-card font-bold'
                    : 'bg-surface-cardMuted text-content-muted border border-surface-innerBorder font-medium'
                } text-[10px] flex items-center justify-center">F</span>
                Numeric fixed
              </button>
            </div>
          </div>

          <!-- Quick Action Toolbar -->
          <div class="flex items-center gap-1.5">
            <button
              id="btn-toggle-sound"
              type="button"
              title="${state.soundEnabled ? 'Mute sound' : 'Enable sound'}"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-content-muted hover:text-content-primary hover:bg-surface-cardMuted transition-colors"
            >
              ${state.soundEnabled ? Icons.soundOn : Icons.soundOff}
            </button>
            <button
              id="btn-toggle-theme"
              type="button"
              title="Toggle theme"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-content-muted hover:text-content-primary hover:bg-surface-cardMuted transition-colors"
            >
              ${state.theme === 'dark' ? Icons.sun : Icons.moon}
            </button>
            <button
              id="btn-open-history"
              type="button"
              title="Open History (H)"
              class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-content-secondary hover:text-content-primary hover:bg-surface-cardMuted transition-colors border border-surface-innerBorder"
            >
              ${Icons.history}
              <span>History</span>
              ${
                historyCount > 0
                  ? `<span class="px-1.5 py-0.2 bg-surface-cardMuted text-[11px] rounded-full text-content-muted border border-surface-innerBorder">${historyCount}</span>`
                  : ''
              }
            </button>
          </div>
        </div>

        <!-- Status & Feedback Badge -->
        <div id="status-badge" data-summary="${currentSummary}" class="shrink-0 h-5 flex items-center select-none">
          <span class="inline-flex items-center text-xs gap-1.5 transition-colors text-content-muted">
            <span class="w-3.5 h-3.5 flex items-center justify-center shrink-0">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </span>
            <span class="status-badge-text leading-none">${currentSummary}</span>
          </span>
        </div>

        <!-- Heroic Generated Value Display (Click to Copy when value is present) -->
        <div
          id="hero-value-container"
          class="group relative py-4 px-4 bg-surface-inner ${
            hasValue
              ? 'hover:bg-surface-pillHover/50 hover:border-surface-cardBorder cursor-pointer'
              : 'cursor-default'
          } border border-surface-innerBorder rounded-2xl transition-all flex flex-col items-center justify-center min-h-[110px] flex-1 overflow-hidden"
          ${hasValue ? 'title="Click to copy (C)"' : ''}
        >
          <div
            id="hero-value-text"
            class="w-full max-h-full font-mono ${fontSizeClass} ${trackingClass} font-bold text-center break-all select-all flex flex-wrap items-center justify-center my-auto overflow-hidden scrollbar-thin transition-none"
          >
            ${formattedHtml}
          </div>
          ${
            hasValue
              ? `
            <div class="pointer-events-none absolute bottom-2 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-[11px] text-content-muted flex items-center gap-1 bg-surface-inner/80 px-1.5 py-0.5 rounded backdrop-blur-xs select-none">
              ${Icons.copy}
              <span>Copy</span>
            </div>
          `
              : ''
          }
        </div>

        <!-- Inner Sub-Card: Interactive Quick Adjuster -->
        <div class="p-3.5 bg-surface-inner border border-surface-innerBorder rounded-2xl flex flex-col gap-2.5 shrink-0">
          <div class="flex items-center justify-between text-xs">
            <span class="text-content-muted font-medium">${isFixed ? 'Digit count' : 'Quick range'}</span>
            <span class="font-mono text-xs font-semibold text-content-primary px-2 py-0.5 rounded bg-surface-card border border-surface-cardBorder shadow-xs">
              ${isFixed ? `${state.options.num_fixed.length} digits` : `${state.options.num.min} – ${state.options.num.max}`}
            </span>
          </div>

          ${
            isFixed
              ? `
            <div class="flex items-center justify-between gap-2">
              <div class="flex flex-wrap gap-1.5">
                ${[2, 4, 6, 8, 12, 16, 24]
                  .map(
                    len => `
                  <button
                    type="button"
                    data-quick-fixed="${len}"
                    class="btn-quick-fixed px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-all ${
                      state.options.num_fixed.length === len
                        ? 'bg-surface-subPillActive text-white border-surface-subPillActive shadow-sm'
                        : 'bg-surface-subPill hover:bg-surface-pillHover text-content-muted hover:text-content-primary border-surface-subPillBorder'
                    }"
                  >
                    ${len}
                  </button>
                `
                  )
                  .join('')}
              </div>

              <!-- Quick Stepper [-] [+] -->
              <div class="flex items-center gap-1 shrink-0 ml-auto">
                <button
                  id="btn-quick-fixed-dec"
                  type="button"
                  title="Decrease digits by 1"
                  class="w-7 h-7 rounded-lg bg-surface-subPill hover:bg-surface-pillHover active:scale-95 text-content-secondary hover:text-content-primary flex items-center justify-center border border-surface-subPillBorder transition-all"
                >
                  ${Icons.minus}
                </button>
                <button
                  id="btn-quick-fixed-inc"
                  type="button"
                  title="Increase digits by 1"
                  class="w-7 h-7 rounded-lg bg-surface-subPill hover:bg-surface-pillHover active:scale-95 text-content-secondary hover:text-content-primary flex items-center justify-center border border-surface-subPillBorder transition-all"
                >
                  ${Icons.plus}
                </button>
              </div>
            </div>
          `
              : `
            <div class="flex items-center justify-between gap-2">
              <div class="flex flex-wrap gap-1.5">
                ${[
                  { min: 0, max: 10, label: '0–10' },
                  { min: 0, max: 50, label: '0–50' },
                  { min: 0, max: 100, label: '0–100' },
                  { min: 1, max: 100, label: '1–100' },
                  { min: 1, max: 1000, label: '1k' },
                ]
                  .map(
                    p => `
                  <button
                    type="button"
                    data-quick-num-min="${p.min}"
                    data-quick-num-max="${p.max}"
                    class="btn-quick-num px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-all ${
                      state.options.num.min === p.min && state.options.num.max === p.max
                        ? 'bg-surface-subPillActive text-white border-surface-subPillActive shadow-sm'
                        : 'bg-surface-subPill hover:bg-surface-pillHover text-content-muted hover:text-content-primary border-surface-subPillBorder'
                    }"
                  >
                    ${p.label}
                  </button>
                `
                  )
                  .join('')}
              </div>

              <!-- Quick Stepper [-] [+] -->
              <div class="flex items-center gap-1 shrink-0 ml-auto">
                <button
                  id="btn-quick-num-dec"
                  type="button"
                  title="Decrease max by 10"
                  class="w-7 h-7 rounded-lg bg-surface-subPill hover:bg-surface-pillHover active:scale-95 text-content-secondary hover:text-content-primary flex items-center justify-center border border-surface-subPillBorder transition-all"
                >
                  ${Icons.minus}
                </button>
                <button
                  id="btn-quick-num-inc"
                  type="button"
                  title="Increase max by 10"
                  class="w-7 h-7 rounded-lg bg-surface-subPill hover:bg-surface-pillHover active:scale-95 text-content-secondary hover:text-content-primary flex items-center justify-center border border-surface-subPillBorder transition-all"
                >
                  ${Icons.plus}
                </button>
              </div>
            </div>
          `
          }
        </div>

        <!-- Bottom Action Pills: Edit Options & Generate -->
        <div class="grid grid-cols-2 gap-3 pt-2 shrink-0">
          <button
            id="btn-edit-options"
            type="button"
            class="flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-surface-cardMuted hover:bg-surface-pillHover text-content-secondary hover:text-content-primary font-medium text-sm border border-surface-innerBorder transition-all active:scale-[0.98]"
          >
            ${Icons.pencil}
            <span>Edit options</span>
          </button>

          <button
            id="btn-generate-value"
            type="button"
            class="flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:opacity-90 font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
          >
            ${Icons.sparkle}
            <span>Generate</span>
          </button>
        </div>

        <!-- Desktop Hint & Install Link -->
        <div class="flex items-center justify-between text-[11px] text-content-subdued pt-1 px-1 shrink-0">
          <button id="btn-shortcuts-hint" type="button" class="hover:text-content-muted transition-colors flex items-center gap-1">
            ${Icons.keyboard}
            <span>Shortcuts: <kbd class="px-1 py-0.5 rounded bg-surface-inner border border-surface-innerBorder text-content-secondary text-[10px]">Space</kbd> Generate · <kbd class="px-1 py-0.5 rounded bg-surface-inner border border-surface-innerBorder text-content-secondary text-[10px]">C</kbd> Copy</span>
          </button>
          <div class="flex items-center gap-1.5">
            <button
              id="btn-install-pwa"
              type="button"
              title="Install as desktop app"
              class="${this.canInstall ? 'inline-flex' : 'hidden'} items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium transition-colors cursor-pointer"
            >
              ${Icons.download}
              <span>Install app</span>
            </button>
            <span id="install-separator" class="${this.canInstall ? 'inline' : 'hidden'} text-content-subdued select-none">·</span>
            <span>${APP_VERSION} Lite</span>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(state, currentValue);
    this.fitHeroText();
    requestAnimationFrame(() => this.fitHeroText());
  }

  public destroy() {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    if (this.copyTimeout) {
      window.clearTimeout(this.copyTimeout);
      this.copyTimeout = null;
    }
  }

  private fitHeroText() {
    if (this.isFitting) return;
    const container = this.container.querySelector<HTMLElement>('#hero-value-container');
    const textEl = this.container.querySelector<HTMLElement>('#hero-value-text');
    if (!container || !textEl) return;

    this.isFitting = true;
    try {
      textEl.style.fontSize = '';
      textEl.style.lineHeight = '';
      textEl.classList.remove('overflow-y-auto');
      textEl.classList.add('overflow-hidden');

      const style = window.getComputedStyle(container);
      const paddingTop = parseFloat(style.paddingTop) || 0;
      const paddingBottom = parseFloat(style.paddingBottom) || 0;

      const maxAvailableHeight = container.clientHeight - paddingTop - paddingBottom;
      if (maxAvailableHeight <= 0) return;

      let currentSize = parseFloat(window.getComputedStyle(textEl).fontSize);
      const minFontSize = 11;

      while (textEl.scrollHeight > maxAvailableHeight && currentSize > minFontSize) {
        currentSize = Math.max(minFontSize, currentSize - 1);
        textEl.style.fontSize = `${currentSize}px`;
        textEl.style.lineHeight = `${Math.round(currentSize * 1.25)}px`;
      }

      if (textEl.scrollHeight > maxAvailableHeight) {
        textEl.classList.remove('overflow-hidden');
        textEl.classList.add('overflow-y-auto');
      }
    } finally {
      this.isFitting = false;
    }
  }

  private bindEvents(state: AppState, currentValue: string) {
    this.resizeObserver?.disconnect();
    const heroContainer = this.container.querySelector<HTMLElement>('#hero-value-container');
    if (heroContainer && typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.fitHeroText();
      });
      this.resizeObserver.observe(heroContainer);
    }
    this.container.querySelector('#btn-tab-num')?.addEventListener('click', () => {
      this.callbacks.onSelectType('num');
    });

    this.container.querySelector('#btn-tab-fixed')?.addEventListener('click', () => {
      this.callbacks.onSelectType('num_fixed');
    });

    this.container.querySelector('#btn-toggle-sound')?.addEventListener('click', () => {
      this.callbacks.onToggleSound();
    });

    this.container.querySelector('#btn-toggle-theme')?.addEventListener('click', () => {
      this.callbacks.onToggleTheme();
    });

    this.container.querySelector('#btn-open-history')?.addEventListener('click', () => {
      this.callbacks.onOpenHistory();
    });

    this.container.querySelector('#btn-install-pwa')?.addEventListener('click', () => {
      this.callbacks.onInstallApp?.();
    });

    if (currentValue) {
      this.container.querySelector('#hero-value-container')?.addEventListener('click', () => {
        this.callbacks.onCopyValue(currentValue);
      });
    }

    this.container.querySelector('#btn-edit-options')?.addEventListener('click', () => {
      this.callbacks.onEditOptions();
    });

    this.container.querySelector('#btn-generate-value')?.addEventListener('click', () => {
      this.callbacks.onGenerate();
    });

    // Quick controls listeners for Numeric fixed
    this.container.querySelectorAll('.btn-quick-fixed').forEach(btn => {
      btn.addEventListener('click', () => {
        const len = parseInt(btn.getAttribute('data-quick-fixed') || '6', 10);
        this.callbacks.onQuickUpdateNumFixed({ length: len });
      });
    });

    this.container.querySelector('#btn-quick-fixed-dec')?.addEventListener('click', () => {
      const currentLen = state.options.num_fixed.length;
      if (currentLen > GENERATOR_LIMITS.MIN_DIGIT_LENGTH) {
        this.callbacks.onQuickUpdateNumFixed({ length: currentLen - 1 });
      }
    });

    this.container.querySelector('#btn-quick-fixed-inc')?.addEventListener('click', () => {
      const currentLen = state.options.num_fixed.length;
      if (currentLen < GENERATOR_LIMITS.MAX_DIGIT_LENGTH) {
        this.callbacks.onQuickUpdateNumFixed({ length: currentLen + 1 });
      }
    });

    // Quick controls listeners for Numeric range
    this.container.querySelectorAll('.btn-quick-num').forEach(btn => {
      btn.addEventListener('click', () => {
        const min = parseInt(btn.getAttribute('data-quick-num-min') || '0', 10);
        const max = parseInt(btn.getAttribute('data-quick-num-max') || '100', 10);
        this.callbacks.onQuickUpdateNum({ min, max });
      });
    });

    this.container.querySelector('#btn-quick-num-dec')?.addEventListener('click', () => {
      const { min, max } = state.options.num;
      const step = max > 100 ? 50 : 10;
      const newMax = Math.max(min + 1, max - step);
      this.callbacks.onQuickUpdateNum({ min, max: newMax });
    });

    this.container.querySelector('#btn-quick-num-inc')?.addEventListener('click', () => {
      const { min, max } = state.options.num;
      const step = max >= 100 ? 50 : 10;
      this.callbacks.onQuickUpdateNum({ min, max: max + step });
    });

    this.container.querySelector('#btn-shortcuts-hint')?.addEventListener('click', () => {
      this.callbacks.onOpenShortcuts();
    });
  }
}

/**
 * Resolves the baseline Tailwind font size classes based on digit length.
 */
export function resolveHeroFontSizeClass(length: number): string {
  if (length <= 4) return 'text-6xl';
  if (length <= 8) return 'text-5xl';
  if (length <= 16) return 'text-4xl';
  if (length <= 24) return 'text-3xl';
  if (length <= 40) return 'text-2xl';
  if (length <= 64) return 'text-xl';
  if (length <= 100) return 'text-base';
  return 'text-sm';
}

/**
 * Resolves the tracking letter spacing based on digit length.
 */
export function resolveHeroTrackingClass(length: number): string {
  if (length <= 8) return 'tracking-wider';
  if (length <= 24) return 'tracking-normal';
  return 'tracking-tight';
}

