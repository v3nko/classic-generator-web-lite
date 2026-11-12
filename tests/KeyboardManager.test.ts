import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { KeyboardManager, KeyboardActions } from '../src/services/KeyboardManager';

describe('KeyboardManager', () => {
  let actions: KeyboardActions;
  let manager: KeyboardManager;
  let listeners: Record<string, ((e: any) => void)[]> = {};

  beforeEach(() => {
    listeners = {};
    // @ts-expect-error Mocking window for node test env
    globalThis.window = {
      addEventListener: (event: string, fn: any) => {
        listeners[event] = listeners[event] || [];
        listeners[event].push(fn);
      },
      removeEventListener: (event: string, fn: any) => {
        if (listeners[event]) {
          listeners[event] = listeners[event].filter(l => l !== fn);
        }
      },
    };

    // @ts-expect-error Mocking document for node test env
    globalThis.document = {
      activeElement: null,
    };

    actions = {
      onGenerate: vi.fn(),
      onCopy: vi.fn(),
      onToggleOptions: vi.fn(),
      onToggleHistory: vi.fn(),
      onSelectNumeric: vi.fn(),
      onSelectNumericFixed: vi.fn(),
      onEscape: vi.fn(),
      onToggleShortcutsModal: vi.fn(),
    };

    manager = new KeyboardManager(actions);
    manager.start();
  });

  afterEach(() => {
    manager.stop();
  });

  const fireKeyDown = (key: string) => {
    const event = {
      key,
      preventDefault: vi.fn(),
    };
    listeners['keydown']?.forEach(fn => fn(event));
    return event;
  };

  it('triggers onSelectNumeric when 1 is pressed outside input', () => {
    fireKeyDown('1');
    expect(actions.onSelectNumeric).toHaveBeenCalledTimes(1);
    expect(actions.onSelectNumericFixed).not.toHaveBeenCalled();
  });

  it('triggers onSelectNumericFixed when 2 is pressed outside input', () => {
    fireKeyDown('2');
    expect(actions.onSelectNumericFixed).toHaveBeenCalledTimes(1);
    expect(actions.onSelectNumeric).not.toHaveBeenCalled();
  });

  it('does NOT trigger 1 or 2 shortcut when an input is actively focused', () => {
    const inputMock = {
      tagName: 'INPUT',
      blur: vi.fn(),
    };
    // @ts-expect-error Setting activeElement
    globalThis.document.activeElement = inputMock;

    fireKeyDown('1');
    fireKeyDown('2');
    fireKeyDown(' ');

    expect(actions.onSelectNumeric).not.toHaveBeenCalled();
    expect(actions.onSelectNumericFixed).not.toHaveBeenCalled();
    expect(actions.onGenerate).not.toHaveBeenCalled();
  });

  it('blurs active input on Enter or Escape without triggering action callbacks', () => {
    const inputMock = {
      tagName: 'INPUT',
      blur: vi.fn(),
    };
    // @ts-expect-error Setting activeElement
    globalThis.document.activeElement = inputMock;

    fireKeyDown('Enter');
    expect(inputMock.blur).toHaveBeenCalledTimes(1);
    expect(actions.onGenerate).not.toHaveBeenCalled();
    expect(actions.onEscape).not.toHaveBeenCalled();

    fireKeyDown('Escape');
    expect(inputMock.blur).toHaveBeenCalledTimes(2);
    expect(actions.onEscape).not.toHaveBeenCalled();
  });

  it('triggers onEscape when Escape is pressed outside inputs', () => {
    fireKeyDown('Escape');
    expect(actions.onEscape).toHaveBeenCalledTimes(1);
  });
});
