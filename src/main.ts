/*
 * Copyright (c) Victor Kosenko
 * Classic Generator Web Lite - Main Entry Point
 */

import './style.css';
import type { ActiveView, GeneratorType, NumOptions, NumFixedOptions } from './types';
import { StorageService } from './services/StorageService';
import { RandomEngine } from './services/RandomEngine';
import { AudioEngine } from './services/AudioEngine';
import { KeyboardManager } from './services/KeyboardManager';
import { GeneratorView } from './ui/GeneratorView';
import { OptionsView } from './ui/OptionsView';
import { HistoryView } from './ui/HistoryView';
import { ShortcutsModal } from './ui/ShortcutsModal';

class App {
  private storage: StorageService;
  private activeView: ActiveView = 'generator';

  private cardContainer: HTMLElement;
  private generatorView: GeneratorView;
  private optionsView: OptionsView;
  private historyView: HistoryView;
  private shortcutsModal: ShortcutsModal;
  private keyboardManager: KeyboardManager;
  private deferredInstallPrompt: any = null;

  constructor() {
    this.storage = StorageService.getInstance();

    // Setup base HTML shell
    const appEl = document.getElementById('app');
    if (!appEl) throw new Error('#app element not found');

    appEl.innerHTML = `
      <main id="main-viewport" class="min-h-full h-full w-full flex items-center justify-center p-4 bg-surface-base transition-colors select-none">
        <div id="card-wrapper" class="relative w-full max-w-[500px]">
          <!-- App Logo positioned on top of the card without shifting the card down from vertical center -->
          <div class="standalone-hidden absolute bottom-full left-1/2 -translate-x-1/2 mb-5 flex items-center justify-center pointer-events-none">
            <img src="./favicon.svg" alt="Classic Generator" class="w-12 h-12 drop-shadow-lg select-none" />
          </div>

          <!-- Floating Central Card (Inspired by reference design) -->
          <div
            id="card-root"
            class="w-full bg-surface-card border border-surface-cardBorder rounded-3xl shadow-card-glow overflow-hidden transition-all duration-200"
          >
            <!-- In-card view container -->
            <div id="view-mount" class="h-full"></div>
          </div>
        </div>
      </main>
    `;

    this.cardContainer = document.getElementById('view-mount') as HTMLElement;
    this.shortcutsModal = new ShortcutsModal();

    // Initialize View instances
    this.generatorView = new GeneratorView(this.cardContainer, {
      onSelectType: (type: GeneratorType) => this.handleSelectType(type),
      onGenerate: () => this.handleGenerate(),
      onEditOptions: () => this.setView('options'),
      onOpenHistory: () => this.setView('history'),
      onCopyValue: (val: string) => this.handleCopyValue(val),
      onToggleSound: () => this.handleToggleSound(),
      onToggleTheme: () => this.handleToggleTheme(),
      onOpenShortcuts: () => this.shortcutsModal.toggle(),
      onQuickUpdateNum: (opts: NumOptions) => {
        this.storage.setNumOptions(opts);
        AudioEngine.playGenerateSound();
      },
      onQuickUpdateNumFixed: (opts: NumFixedOptions) => {
        this.storage.setNumFixedOptions(opts);
        AudioEngine.playGenerateSound();
      },
      onInstallApp: () => this.handleInstallApp(),
    });

    this.optionsView = new OptionsView(this.cardContainer, {
      onBack: () => this.setView('generator'),
      onSaveNumOptions: (opts: NumOptions) => this.storage.setNumOptions(opts),
      onSaveNumFixedOptions: (opts: NumFixedOptions) => this.storage.setNumFixedOptions(opts),
    });

    this.historyView = new HistoryView(this.cardContainer, {
      onBack: () => this.setView('generator'),
      onCopyItem: (val: string) => this.handleCopyValue(val),
      onDeleteItem: (id: string) => this.storage.deleteHistoryItem(id),
      onClearAll: () => this.storage.clearHistory(),
    });

    // Initialize Keyboard Manager
    this.keyboardManager = new KeyboardManager({
      onGenerate: () => {
        if (this.activeView === 'generator') {
          this.handleGenerate();
        }
      },
      onCopy: () => {
        const last = this.storage.getState().lastGenerated;
        if (last) {
          this.handleCopyValue(last.value);
        }
      },
      onToggleOptions: () => {
        this.setView(this.activeView === 'options' ? 'generator' : 'options');
      },
      onToggleHistory: () => {
        this.setView(this.activeView === 'history' ? 'generator' : 'history');
      },
      onSelectNumeric: () => {
        this.handleSelectType('num');
      },
      onSelectNumericFixed: () => {
        this.handleSelectType('num_fixed');
      },
      onEscape: () => {
        if (this.shortcutsModal.isOpen()) {
          this.shortcutsModal.close();
        } else if (this.activeView !== 'generator') {
          this.setView('generator');
        }
      },
      onToggleShortcutsModal: () => {
        this.shortcutsModal.toggle();
      },
    });

    this.init();
  }

  private init() {
    this.setupStandaloneMode();
    this.setupPwaInstall();
    this.registerServiceWorker();
    this.keyboardManager.start();

    // Subscribe to state changes to re-render
    this.storage.subscribe(state => {
      this.syncTheme(state.theme);
      this.renderCurrentView();
    });

    // Initial sync
    const initial = this.storage.getState();
    this.syncTheme(initial.theme);

    // If no values have been generated yet, generate one initial value automatically for an instant lively look
    if (!initial.lastGenerated) {
      this.handleGenerate(false);
    } else {
      this.renderCurrentView();
    }
  }

  private setView(view: ActiveView) {
    this.activeView = view;
    this.renderCurrentView();
  }

  private renderCurrentView() {
    const state = this.storage.getState();
    switch (this.activeView) {
      case 'generator':
        this.generatorView.render(state);
        break;
      case 'options':
        this.optionsView.render(state);
        break;
      case 'history':
        this.historyView.render(state);
        break;
    }
  }

  private handleSelectType(type: GeneratorType) {
    this.storage.setActiveGenerator(type);
    AudioEngine.playGenerateSound();
  }

  private handleGenerate(playSound = true) {
    const state = this.storage.getState();
    const type = state.activeGenerator;

    try {
      let result: { value: string; summary: string };

      if (type === 'num') {
        const { min, max } = state.options.num;
        result = RandomEngine.generateNumeric(min, max);
      } else {
        const { length } = state.options.num_fixed;
        result = RandomEngine.generateNumericFixed(length);
      }

      const item = {
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        value: result.value,
        type,
        summary: result.summary,
        timestamp: Date.now(),
      };

      if (playSound) {
        AudioEngine.playGenerateSound();
      }

      this.storage.setLastGenerated(item);
    } catch (e) {
      console.error('Generation failed:', e);
    }
  }

  private handleCopyValue(value: string) {
    if (!value) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).catch(() => {
        this.fallbackCopy(value);
      });
    } else {
      this.fallbackCopy(value);
    }

    AudioEngine.playCopySound();
    this.generatorView.showCopiedFeedback();
  }

  private fallbackCopy(text: string) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
    } catch {}
    document.body.removeChild(textarea);
  }

  private handleToggleSound() {
    this.storage.toggleSound();
    AudioEngine.playGenerateSound();
  }

  private handleToggleTheme() {
    const current = this.storage.getState().theme;
    this.storage.setTheme(current === 'dark' ? 'light' : 'dark');
  }

  private syncTheme(theme: string) {
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }

  private setupStandaloneMode() {
    // Content comfortably fits in ~440px.
    // Minimum inner viewport dimensions to ensure zero scrolling:
    const MIN_INNER_WIDTH = 440;
    const MIN_INNER_HEIGHT = 520;
    const TARGET_WIDTH = 500;
    const TARGET_HEIGHT = 650;

    const enforceMinDimensions = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: window-controls-overlay)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches ||
        (window.navigator as any).standalone === true;

      if (!isStandalone) return;

      const innerW = window.innerWidth;
      const innerH = window.innerHeight;

      if (innerH < MIN_INNER_HEIGHT || innerW < MIN_INNER_WIDTH) {
        try {
          const safeOuterW = Math.max(window.outerWidth, TARGET_WIDTH);
          const safeOuterH = Math.max(window.outerHeight, TARGET_HEIGHT);
          window.resizeTo(safeOuterW, safeOuterH);
        } catch {
          // May be restricted by some window managers
        }
      }
    };

    const checkAndApply = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: window-controls-overlay)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches ||
        (window.navigator as any).standalone === true;

      if (isStandalone) {
        document.documentElement.classList.add('is-standalone');
        this.generatorView.setCanInstall(false);

        // In installed window, attempt to size to the ideal app dimensions mirroring the design
        try {
          if (
            Math.abs(window.outerWidth - TARGET_WIDTH) > 30 ||
            Math.abs(window.outerHeight - TARGET_HEIGHT) > 30
          ) {
            window.resizeTo(TARGET_WIDTH, TARGET_HEIGHT);
          }
        } catch {
          // Window resizeTo may be restricted by some browser window managers
        }
      } else {
        document.documentElement.classList.remove('is-standalone');
      }
    };

    checkAndApply();

    try {
      const standaloneQuery = window.matchMedia('(display-mode: standalone)');
      standaloneQuery.addEventListener('change', checkAndApply);
    } catch {}

    // Enforce minimal height on resize when in standalone mode
    let resizeTimer: number | null = null;
    window.addEventListener('resize', () => {
      if (resizeTimer !== null) {
        window.clearTimeout(resizeTimer);
      }
      resizeTimer = window.setTimeout(() => {
        enforceMinDimensions();
      }, 120);
    });
  }

  private setupPwaInstall() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredInstallPrompt = e;
      this.generatorView.setCanInstall(true);
    });

    window.addEventListener('appinstalled', () => {
      this.deferredInstallPrompt = null;
      this.generatorView.setCanInstall(false);
    });
  }

  private async handleInstallApp() {
    if (!this.deferredInstallPrompt) return;

    try {
      this.deferredInstallPrompt.prompt();
      const choice = await this.deferredInstallPrompt.userChoice;
      if (choice && choice.outcome === 'accepted') {
        this.generatorView.setCanInstall(false);
      }
    } catch (err) {
      console.warn('[PWA] Install prompt failed:', err);
    } finally {
      this.deferredInstallPrompt = null;
    }
  }

  private registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('./sw.js')
          .then((reg) => {
            console.log('[PWA] Service Worker registered:', reg.scope);
          })
          .catch((err) => {
            console.warn('[PWA] Service Worker registration failed:', err);
          });
      });
    }
  }
}

// Bootstrap application safely whether DOM is loading or already parsed
function bootstrap() {
  new App();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
