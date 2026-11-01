import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from '../src/services/StorageService';

const storageMap = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => storageMap.get(key) || null,
  setItem: (key: string, val: string) => storageMap.set(key, val),
  removeItem: (key: string) => storageMap.delete(key),
  clear: () => storageMap.clear(),
};
// @ts-expect-error Mocking browser localStorage for node test env
globalThis.localStorage = localStorageMock;

describe('StorageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with default state', () => {
    const storage = StorageService.getInstance();
    const state = storage.getState();
    expect(state.activeGenerator).toBe('num');
    expect(state.options.num.min).toBe(0);
    expect(state.options.num.max).toBe(100);
    expect(state.options.num_fixed.length).toBe(6);
    expect(state.soundEnabled).toBe(true);
  });

  it('updates active generator and options', () => {
    const storage = StorageService.getInstance();
    storage.setActiveGenerator('num_fixed');
    expect(storage.getState().activeGenerator).toBe('num_fixed');

    storage.setNumFixedOptions({ length: 12 });
    expect(storage.getState().options.num_fixed.length).toBe(12);

    storage.setNumOptions({ min: 10, max: 50 });
    expect(storage.getState().options.num.min).toBe(10);
    expect(storage.getState().options.num.max).toBe(50);
  });

  it('records last generated value and adds to history', () => {
    const storage = StorageService.getInstance();
    storage.clearHistory();

    const item1 = {
      id: '1',
      value: '77',
      type: 'num' as const,
      summary: '0 – 100',
      timestamp: Date.now(),
    };

    const item2 = {
      id: '2',
      value: '123456',
      type: 'num_fixed' as const,
      summary: '6 digits',
      timestamp: Date.now() + 100,
    };

    storage.setLastGenerated(item1);
    expect(storage.getState().lastGenerated?.value).toBe('77');
    expect(storage.getState().history.length).toBe(1);

    storage.setLastGenerated(item2);
    expect(storage.getState().lastGenerated?.value).toBe('123456');
    expect(storage.getState().history.length).toBe(2);
    expect(storage.getState().history[0].id).toBe('2');

    // Delete single item
    storage.deleteHistoryItem('2');
    expect(storage.getState().history.length).toBe(1);
    expect(storage.getState().history[0].id).toBe('1');
    expect(storage.getState().lastGenerated?.id).toBe('1');

    // Clear history
    storage.clearHistory();
    expect(storage.getState().history.length).toBe(0);
    expect(storage.getState().lastGenerated).toBeNull();
  });

  it('toggles sound and theme', () => {
    const storage = StorageService.getInstance();
    const initialSound = storage.getState().soundEnabled;
    const toggled = storage.toggleSound();
    expect(toggled).toBe(!initialSound);
    expect(storage.getState().soundEnabled).toBe(!initialSound);

    storage.setTheme('light');
    expect(storage.getState().theme).toBe('light');
  });
});
