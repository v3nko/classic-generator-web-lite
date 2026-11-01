/*
 * Copyright (c) Victor Kosenko
 * Classic Generator Web Lite - Options View
 */

import type { AppState, GeneratorType, NumOptions, NumFixedOptions } from '../types';
import { GENERATOR_LIMITS } from '../types';
import { Icons } from './icons';

export interface OptionsViewCallbacks {
  onBack: () => void;
  onSaveNumOptions: (options: NumOptions) => void;
  onSaveNumFixedOptions: (options: NumFixedOptions) => void;
}

export class OptionsView {
  private container: HTMLElement;
  private callbacks: OptionsViewCallbacks;
  private currentType: GeneratorType = 'num';

  // Draft values
  private numMin = 0;
  private numMax = 100;
  private fixedLength = 6;
  private errorMessage = '';

  constructor(container: HTMLElement, callbacks: OptionsViewCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
  }

  public render(state: AppState) {
    this.currentType = state.activeGenerator;
    this.numMin = state.options.num.min;
    this.numMax = state.options.num.max;
    this.fixedLength = state.options.num_fixed.length;
    this.errorMessage = '';

    this.renderForm();
  }

  private renderForm() {
    const isNum = this.currentType === 'num';
    const title = isNum ? 'Numeric options' : 'Numeric fixed options';

    this.container.innerHTML = `
      <div class="p-6 md:p-8 flex flex-col gap-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button
              id="btn-options-back"
              type="button"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-content-muted hover:text-content-primary hover:bg-surface-cardMuted transition-colors"
              title="Back (Esc)"
            >
              ${Icons.arrowLeft}
            </button>
            <h2 class="text-base font-semibold text-content-primary">${title}</h2>
          </div>
          <span class="text-xs text-content-muted font-mono px-2 py-0.5 rounded bg-surface-cardMuted border border-surface-innerBorder">
            ${isNum ? 'NUM' : 'FIXED'}
          </span>
        </div>

        <!-- Options Form Body -->
        <div class="flex flex-col gap-5">
          ${isNum ? this.renderNumOptions() : this.renderNumFixedOptions()}

          <!-- Error Alert (if any) -->
          <div id="options-error" class="${this.errorMessage ? 'block' : 'hidden'} p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-500">
            ${this.errorMessage}
          </div>
        </div>

        <!-- Bottom Action Pills -->
        <div class="grid grid-cols-2 gap-3 pt-2">
          <button
            id="btn-cancel-options"
            type="button"
            class="flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-surface-cardMuted hover:bg-surface-pillHover text-content-secondary hover:text-content-primary font-medium text-sm border border-surface-innerBorder transition-all"
          >
            <span>Cancel</span>
          </button>

          <button
            id="btn-save-options"
            type="button"
            class="flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:opacity-90 font-semibold text-sm shadow-md hover:shadow-lg transition-all"
          >
            <span>Apply options</span>
          </button>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  private renderNumOptions(): string {
    return `
      <!-- Range Inputs (Min & Max) -->
      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-content-muted">Minimum</label>
          <input
            id="input-num-min"
            type="number"
            value="${this.numMin}"
            class="w-full px-3 py-2.5 rounded-xl bg-surface-inner border border-surface-innerBorder focus:border-content-muted text-content-primary font-mono text-sm outline-none transition-colors"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-content-muted">Maximum</label>
          <input
            id="input-num-max"
            type="number"
            value="${this.numMax}"
            class="w-full px-3 py-2.5 rounded-xl bg-surface-inner border border-surface-innerBorder focus:border-content-muted text-content-primary font-mono text-sm outline-none transition-colors"
          />
        </div>
      </div>

      <!-- Quick Presets -->
      <div class="flex flex-col gap-1.5">
        <span class="text-xs text-content-subdued">Quick presets</span>
        <div class="flex flex-wrap gap-2">
          ${[
            { min: 0, max: 10, label: '0 – 10' },
            { min: 0, max: 50, label: '0 – 50' },
            { min: 0, max: 100, label: '0 – 100' },
            { min: 1, max: 100, label: '1 – 100' },
            { min: 1, max: 1000, label: '1 – 1,000' },
          ]
            .map(
              p => `
            <button
              type="button"
              data-preset-min="${p.min}"
              data-preset-max="${p.max}"
              class="btn-num-preset px-2.5 py-1 rounded-lg text-xs font-mono bg-surface-subPill hover:bg-surface-pillHover text-content-muted hover:text-content-primary border border-surface-subPillBorder transition-colors"
            >
              ${p.label}
            </button>
          `
            )
            .join('')}
        </div>
      </div>

      <!-- Helper Hint -->
      <p class="text-xs text-content-subdued leading-relaxed">
        Generates random integer values from minimum up to maximum. Minimum must stay lower than maximum.
      </p>
    `;
  }

  private renderNumFixedOptions(): string {
    return `
      <!-- Fixed Length Input and Slider -->
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <label class="text-xs font-medium text-content-muted">Length (Digits)</label>
          <span id="display-fixed-len" class="font-mono text-sm font-semibold text-content-primary px-2 py-0.5 rounded bg-surface-cardMuted border border-surface-innerBorder">
            ${this.fixedLength}
          </span>
        </div>

        <input
          id="slider-fixed-len"
          type="range"
          min="${GENERATOR_LIMITS.MIN_DIGIT_LENGTH}"
          max="32"
          value="${Math.min(this.fixedLength, 32)}"
          class="w-full accent-[var(--btn-primary-bg)] h-1.5 bg-surface-cardMuted rounded-lg cursor-pointer"
        />

        <div class="flex items-center gap-2">
          <input
            id="input-fixed-len"
            type="number"
            min="${GENERATOR_LIMITS.MIN_DIGIT_LENGTH}"
            max="${GENERATOR_LIMITS.MAX_DIGIT_LENGTH}"
            value="${this.fixedLength}"
            class="w-full px-3 py-2 rounded-xl bg-surface-inner border border-surface-innerBorder focus:border-content-muted text-content-primary font-mono text-sm outline-none transition-colors"
            placeholder="Manual entry (1 - 150)"
          />
        </div>
      </div>

      <!-- Quick Presets -->
      <div class="flex flex-col gap-1.5">
        <span class="text-xs text-content-subdued">Quick digit lengths</span>
        <div class="flex flex-wrap gap-2">
          ${[2, 4, 6, 8, 12, 16, 24]
            .map(
              len => `
            <button
              type="button"
              data-preset-len="${len}"
              class="btn-fixed-preset px-3 py-1 rounded-lg text-xs font-mono transition-colors border ${
                this.fixedLength === len
                  ? 'bg-surface-subPillActive text-white border-surface-subPillActive shadow-sm'
                  : 'bg-surface-subPill hover:bg-surface-pillHover text-content-muted hover:text-content-primary border-surface-subPillBorder'
              }"
            >
              ${len} digits
            </button>
          `
            )
            .join('')}
        </div>
      </div>

      <!-- Helper Hint -->
      <p class="text-xs text-content-subdued leading-relaxed">
        Generates fixed numbers with exact digit counts, preserving leading zeroes.
      </p>
    `;
  }

  private bindEvents() {
    this.container.querySelector('#btn-options-back')?.addEventListener('click', () => {
      this.callbacks.onBack();
    });

    this.container.querySelector('#btn-cancel-options')?.addEventListener('click', () => {
      this.callbacks.onBack();
    });

    if (this.currentType === 'num') {
      const minInput = this.container.querySelector('#input-num-min') as HTMLInputElement;
      const maxInput = this.container.querySelector('#input-num-max') as HTMLInputElement;

      minInput?.addEventListener('input', () => {
        this.numMin = parseInt(minInput.value, 10) || 0;
        this.validateNum();
      });

      maxInput?.addEventListener('input', () => {
        this.numMax = parseInt(maxInput.value, 10) || 0;
        this.validateNum();
      });

      this.container.querySelectorAll('.btn-num-preset').forEach(btn => {
        btn.addEventListener('click', () => {
          const min = parseInt(btn.getAttribute('data-preset-min') || '0', 10);
          const max = parseInt(btn.getAttribute('data-preset-max') || '100', 10);
          this.numMin = min;
          this.numMax = max;
          if (minInput) minInput.value = min.toString();
          if (maxInput) maxInput.value = max.toString();
          this.validateNum();
        });
      });
    } else {
      const slider = this.container.querySelector('#slider-fixed-len') as HTMLInputElement;
      const input = this.container.querySelector('#input-fixed-len') as HTMLInputElement;
      const display = this.container.querySelector('#display-fixed-len') as HTMLElement;

      const updateLength = (val: number) => {
        this.fixedLength = val;
        if (slider) slider.value = Math.min(val, 32).toString();
        if (input) input.value = val.toString();
        if (display) display.textContent = val.toString();
        this.validateFixed();
      };

      slider?.addEventListener('input', () => {
        updateLength(parseInt(slider.value, 10) || 1);
      });

      input?.addEventListener('input', () => {
        updateLength(parseInt(input.value, 10) || 1);
      });

      this.container.querySelectorAll('.btn-fixed-preset').forEach(btn => {
        btn.addEventListener('click', () => {
          const len = parseInt(btn.getAttribute('data-preset-len') || '6', 10);
          updateLength(len);
        });
      });
    }

    this.container.querySelector('#btn-save-options')?.addEventListener('click', () => {
      if (this.currentType === 'num') {
        if (!this.validateNum()) return;
        this.callbacks.onSaveNumOptions({ min: this.numMin, max: this.numMax });
      } else {
        if (!this.validateFixed()) return;
        this.callbacks.onSaveNumFixedOptions({ length: this.fixedLength });
      }
      this.callbacks.onBack();
    });
  }

  private validateNum(): boolean {
    const errorEl = this.container.querySelector('#options-error');
    if (this.numMin >= this.numMax) {
      this.errorMessage = 'Minimum argument value should be less than Maximum';
      if (errorEl) {
        errorEl.textContent = this.errorMessage;
        errorEl.classList.remove('hidden');
      }
      return false;
    }
    this.errorMessage = '';
    if (errorEl) {
      errorEl.classList.add('hidden');
    }
    return true;
  }

  private validateFixed(): boolean {
    const errorEl = this.container.querySelector('#options-error');
    if (this.fixedLength < GENERATOR_LIMITS.MIN_DIGIT_LENGTH) {
      this.errorMessage = `Length must be at least ${GENERATOR_LIMITS.MIN_DIGIT_LENGTH}`;
      if (errorEl) {
        errorEl.textContent = this.errorMessage;
        errorEl.classList.remove('hidden');
      }
      return false;
    }
    if (this.fixedLength > GENERATOR_LIMITS.MAX_DIGIT_LENGTH) {
      this.errorMessage = `Length value is too big (max: ${GENERATOR_LIMITS.MAX_DIGIT_LENGTH})`;
      if (errorEl) {
        errorEl.textContent = this.errorMessage;
        errorEl.classList.remove('hidden');
      }
      return false;
    }
    this.errorMessage = '';
    if (errorEl) {
      errorEl.classList.add('hidden');
    }
    return true;
  }
}
