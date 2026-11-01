/*
 * Copyright (c) Victor Kosenko
 * Classic Generator Web Lite - Keyboard Manager
 */

export interface KeyboardActions {
  onGenerate: () => void;
  onCopy: () => void;
  onToggleOptions: () => void;
  onToggleHistory: () => void;
  onSelectNumeric: () => void;
  onSelectNumericFixed: () => void;
  onEscape: () => void;
  onToggleShortcutsModal: () => void;
}

export class KeyboardManager {
  private actions: KeyboardActions;
  private isListening = false;

  constructor(actions: KeyboardActions) {
    this.actions = actions;
  }

  public start() {
    if (this.isListening) return;
    window.addEventListener('keydown', this.handleKeyDown);
    this.isListening = true;
  }

  public stop() {
    if (!this.isListening) return;
    window.removeEventListener('keydown', this.handleKeyDown);
    this.isListening = false;
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    // Avoid intercepting keystrokes if the user is typing into an input field or textarea
    const activeElement = document.activeElement;
    const isEditingInput =
      activeElement &&
      (activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        (activeElement as HTMLElement).isContentEditable);

    if (e.key === 'Escape') {
      this.actions.onEscape();
      return;
    }

    if (isEditingInput) {
      if (e.key === 'Enter') {
        // Allow enter in inputs to blur or submit
        (activeElement as HTMLElement).blur();
        this.actions.onEscape();
      }
      return;
    }

    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      this.actions.onGenerate();
      return;
    }

    if (e.key === 'c' || e.key === 'C') {
      e.preventDefault();
      this.actions.onCopy();
      return;
    }

    if (e.key === 'o' || e.key === 'O') {
      e.preventDefault();
      this.actions.onToggleOptions();
      return;
    }

    if (e.key === 'h' || e.key === 'H') {
      e.preventDefault();
      this.actions.onToggleHistory();
      return;
    }

    if (e.key === '1') {
      e.preventDefault();
      this.actions.onSelectNumeric();
      return;
    }

    if (e.key === '2') {
      e.preventDefault();
      this.actions.onSelectNumericFixed();
      return;
    }

    if (e.key === '?') {
      e.preventDefault();
      this.actions.onToggleShortcutsModal();
      return;
    }
  };
}
