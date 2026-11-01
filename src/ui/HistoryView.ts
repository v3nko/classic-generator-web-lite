/*
 * Copyright (c) Victor Kosenko
 * Classic Generator Web Lite - History View
 */

import type { AppState, GeneratedItem } from '../types';
import { GENERATOR_CONFIGS } from '../types';
import { Icons } from './icons';

export interface HistoryViewCallbacks {
  onBack: () => void;
  onCopyItem: (value: string) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

export class HistoryView {
  private container: HTMLElement;
  private callbacks: HistoryViewCallbacks;
  private searchQuery = '';
  private copiedId: string | null = null;
  private copyTimeout: number | null = null;

  constructor(container: HTMLElement, callbacks: HistoryViewCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
  }

  public render(state: AppState) {
    const filteredHistory = state.history.filter(item => {
      if (!this.searchQuery) return true;
      const q = this.searchQuery.toLowerCase();
      return (
        item.value.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        GENERATOR_CONFIGS[item.type].name.toLowerCase().includes(q)
      );
    });

    const totalCount = state.history.length;

    this.container.innerHTML = `
      <div class="view-container p-5 md:p-6 flex flex-col justify-between h-full min-h-0 gap-4 flex-1 overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
            <button
              id="btn-history-back"
              type="button"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-content-muted hover:text-content-primary hover:bg-surface-cardMuted transition-colors"
              title="Back (Esc)"
            >
              ${Icons.arrowLeft}
            </button>
            <h2 class="text-base font-semibold text-content-primary">Generation history</h2>
          </div>
          <span class="text-xs text-content-muted px-2.5 py-0.5 rounded-full bg-surface-inner border border-surface-innerBorder font-mono">
            ${totalCount} ${totalCount === 1 ? 'item' : 'items'}
          </span>
        </div>

        <!-- Search Bar (if history has items) -->
        ${
          totalCount > 4
            ? `
          <div class="relative shrink-0">
            <input
              id="input-history-search"
              type="text"
              placeholder="Search history..."
              value="${this.searchQuery}"
              class="w-full px-3.5 py-2 rounded-xl bg-surface-inner border border-surface-innerBorder focus:border-content-muted text-xs text-content-primary placeholder-content-subdued outline-none transition-colors"
            />
            ${
              this.searchQuery
                ? `
              <button id="btn-clear-search" type="button" class="absolute right-3 top-2.5 text-content-muted hover:text-content-primary">
                ${Icons.close}
              </button>
            `
                : ''
            }
          </div>
        `
            : ''
        }

        <!-- History Items Scrollable List -->
        <div class="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto pr-1 select-text scrollbar-thin">
          ${
            filteredHistory.length > 0
              ? filteredHistory.map(item => this.renderHistoryItem(item)).join('')
              : this.renderEmptyState()
          }
        </div>

        <!-- Bottom Action Pills -->
        <div class="grid grid-cols-2 gap-3 pt-2 mt-auto shrink-0">
          <button
            id="btn-back-to-generator"
            type="button"
            class="flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-surface-cardMuted hover:bg-surface-pillHover text-content-secondary hover:text-content-primary font-medium text-sm border border-surface-innerBorder transition-all"
          >
            <span>Back</span>
          </button>

          <button
            id="btn-clear-history"
            type="button"
            ${totalCount === 0 ? 'disabled' : ''}
            class="flex items-center justify-center gap-2 py-3 px-4 rounded-full ${
              totalCount === 0
                ? 'opacity-40 cursor-not-allowed bg-surface-cardMuted text-content-subdued border border-surface-innerBorder'
                : 'bg-surface-cardMuted hover:bg-red-500/10 text-red-500 hover:text-red-600 border border-red-500/20 hover:border-red-500/40'
            } font-medium text-sm transition-all"
          >
            ${Icons.trash}
            <span>Clear history</span>
          </button>
        </div>
      </div>
    `;

    this.bindEvents(state);
  }

  private renderHistoryItem(item: GeneratedItem): string {
    const config = GENERATOR_CONFIGS[item.type];
    const isCopied = this.copiedId === item.id;

    return `
      <div class="p-3 bg-surface-inner hover:bg-surface-pillHover border border-surface-innerBorder rounded-xl flex items-center justify-between gap-3 transition-colors group">
        <div class="flex items-center gap-3 min-w-0">
          <span class="w-6 h-6 rounded-lg bg-surface-cardMuted text-content-muted border border-surface-innerBorder flex items-center justify-center text-xs font-bold shrink-0">
            ${config.prefix}
          </span>
          <div class="min-w-0">
            <div class="font-mono text-sm font-semibold text-content-primary truncate hover:text-brand-highlight cursor-pointer" data-item-value="${item.value}">
              ${item.value}
            </div>
            <div class="text-[11px] text-content-subdued flex items-center gap-2">
              <span>${item.summary}</span>
              <span>·</span>
              <span>${this.formatTime(item.timestamp)}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-1 shrink-0">
          <button
            type="button"
            data-copy-id="${item.id}"
            data-copy-val="${item.value}"
            title="Copy value"
            class="w-7 h-7 rounded-lg flex items-center justify-center text-content-muted hover:text-content-primary hover:bg-surface-cardMuted transition-colors ${
              isCopied ? 'text-emerald-500' : ''
            }"
          >
            ${isCopied ? Icons.check : Icons.copy}
          </button>
          <button
            type="button"
            data-delete-id="${item.id}"
            title="Delete item"
            class="w-7 h-7 rounded-lg flex items-center justify-center text-content-subdued hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
          >
            ${Icons.trash}
          </button>
        </div>
      </div>
    `;
  }

  private renderEmptyState(): string {
    return `
      <div class="py-12 flex flex-col items-center justify-center text-center gap-2">
        <div class="w-12 h-12 rounded-2xl bg-surface-inner border border-surface-innerBorder flex items-center justify-center text-content-subdued mb-1">
          ${Icons.history}
        </div>
        <p class="text-sm font-medium text-content-muted">No results yet</p>
        <p class="text-xs text-content-subdued max-w-[240px]">
          Generated values will automatically appear here with timestamps and quick copy.
        </p>
      </div>
    `;
  }

  private bindEvents(state: AppState) {
    this.container.querySelector('#btn-history-back')?.addEventListener('click', () => {
      this.callbacks.onBack();
    });

    this.container.querySelector('#btn-back-to-generator')?.addEventListener('click', () => {
      this.callbacks.onBack();
    });

    const searchInput = this.container.querySelector('#input-history-search') as HTMLInputElement;
    searchInput?.addEventListener('input', () => {
      this.searchQuery = searchInput.value;
      this.render(state);
    });

    this.container.querySelector('#btn-clear-search')?.addEventListener('click', () => {
      this.searchQuery = '';
      this.render(state);
    });

    this.container.querySelector('#btn-clear-history')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all history?')) {
        this.callbacks.onClearAll();
      }
    });

    // Copy and Delete handlers on list
    this.container.querySelectorAll('[data-copy-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-copy-id') || '';
        const val = btn.getAttribute('data-copy-val') || '';
        this.copiedId = id;
        this.callbacks.onCopyItem(val);
        this.render(state);

        if (this.copyTimeout) window.clearTimeout(this.copyTimeout);
        this.copyTimeout = window.setTimeout(() => {
          this.copiedId = null;
          this.render(state);
        }, 1500);
      });
    });

    this.container.querySelectorAll('[data-delete-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-id') || '';
        this.callbacks.onDeleteItem(id);
      });
    });

    this.container.querySelectorAll('[data-item-value]').forEach(el => {
      el.addEventListener('click', () => {
        const val = el.getAttribute('data-item-value') || '';
        this.callbacks.onCopyItem(val);
      });
    });
  }

  private formatTime(timestamp: number): string {
    const elapsed = Math.floor((Date.now() - timestamp) / 1000);
    if (elapsed < 60) return `${elapsed}s ago`;
    const minutes = Math.floor(elapsed / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}
