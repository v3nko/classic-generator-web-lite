/*
 * Copyright (c) Victor Kosenko
 * Classic Generator Web Lite - Storage Service
 */

import type { AppState, GeneratedItem, GeneratorType, NumOptions, NumFixedOptions, ThemeMode } from '../types';

const STORAGE_KEY = 'cg_web_lite_state_v1';

const DEFAULT_STATE: AppState = {
  activeGenerator: 'num',
  theme: 'dark',
  soundEnabled: true,
  options: {
    num: {
      min: 0,
      max: 100,
    },
    num_fixed: {
      length: 6,
    },
  },
  lastGenerated: null,
  history: [],
};

export class StorageService {
  private static instance: StorageService;
  private state: AppState;
  private listeners: Set<(state: AppState) => void> = new Set();

  private constructor() {
    this.state = this.loadInitialState();
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  public getState(): AppState {
    return { ...this.state };
  }

  public subscribe(listener: (state: AppState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.persist();
    for (const listener of this.listeners) {
      listener(this.getState());
    }
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  private loadInitialState(): AppState {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (!serialized) {
        return DEFAULT_STATE;
      }
      const parsed = JSON.parse(serialized);
      return {
        ...DEFAULT_STATE,
        ...parsed,
        options: {
          num: { ...DEFAULT_STATE.options.num, ...(parsed.options?.num || {}) },
          num_fixed: { ...DEFAULT_STATE.options.num_fixed, ...(parsed.options?.num_fixed || {}) },
        },
      };
    } catch (e) {
      console.warn('Failed to parse state from localStorage, falling back to defaults:', e);
      return DEFAULT_STATE;
    }
  }

  public setActiveGenerator(type: GeneratorType) {
    this.state.activeGenerator = type;
    this.notify();
  }

  public setNumOptions(options: NumOptions) {
    this.state.options.num = { ...options };
    this.notify();
  }

  public setNumFixedOptions(options: NumFixedOptions) {
    this.state.options.num_fixed = { ...options };
    this.notify();
  }

  public setLastGenerated(item: GeneratedItem) {
    this.state.lastGenerated = item;
    // Add to history (limit to most recent 200 items)
    this.state.history = [item, ...this.state.history.filter(h => h.id !== item.id)].slice(0, 200);
    this.notify();
  }

  public deleteHistoryItem(id: string) {
    this.state.history = this.state.history.filter(item => item.id !== id);
    if (this.state.lastGenerated?.id === id) {
      this.state.lastGenerated = this.state.history[0] || null;
    }
    this.notify();
  }

  public clearHistory() {
    this.state.history = [];
    this.state.lastGenerated = null;
    this.notify();
  }

  public setTheme(theme: ThemeMode) {
    this.state.theme = theme;
    this.notify();
  }

  public toggleSound(): boolean {
    this.state.soundEnabled = !this.state.soundEnabled;
    this.notify();
    return this.state.soundEnabled;
  }
}
