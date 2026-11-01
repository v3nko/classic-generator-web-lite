import { describe, it, expect } from 'vitest';
import { RandomEngine } from '../src/services/RandomEngine';
import { GENERATOR_LIMITS } from '../src/types';

describe('RandomEngine', () => {
  describe('generateNumeric', () => {
    it('generates a number within min and max inclusive', () => {
      for (let i = 0; i < 50; i++) {
        const { value } = RandomEngine.generateNumeric(0, 10);
        const num = parseInt(value, 10);
        expect(num).toBeGreaterThanOrEqual(0);
        expect(num).toBeLessThanOrEqual(10);
      }
    });

    it('generates expected value when min and max differ by 1', () => {
      const results = new Set<number>();
      for (let i = 0; i < 100; i++) {
        const { value } = RandomEngine.generateNumeric(5, 6);
        results.add(parseInt(value, 10));
      }
      expect(results.has(5)).toBe(true);
      expect(results.has(6)).toBe(true);
      expect(results.size).toBe(2);
    });

    it('throws error when min is greater than or equal to max', () => {
      expect(() => RandomEngine.generateNumeric(10, 10)).toThrow();
      expect(() => RandomEngine.generateNumeric(20, 10)).toThrow();
    });

    it('handles negative numbers in range', () => {
      const { value } = RandomEngine.generateNumeric(-50, -10);
      const num = parseInt(value, 10);
      expect(num).toBeGreaterThanOrEqual(-50);
      expect(num).toBeLessThanOrEqual(-10);
    });
  });

  describe('generateNumericFixed', () => {
    it('generates an exact number of digits and preserves leading zeroes', () => {
      for (let i = 0; i < 50; i++) {
        const { value, summary } = RandomEngine.generateNumericFixed(6);
        expect(value.length).toBe(6);
        expect(/^\d{6}$/.test(value)).toBe(true);
        expect(summary).toBe('6 digits');
      }
    });

    it('throws error when length is less than minimum or greater than maximum', () => {
      expect(() => RandomEngine.generateNumericFixed(0)).toThrow();
      expect(() => RandomEngine.generateNumericFixed(-1)).toThrow();
      expect(() => RandomEngine.generateNumericFixed(GENERATOR_LIMITS.MAX_DIGIT_LENGTH + 1)).toThrow();
    });
  });

  describe('formatChunked', () => {
    it('chunks fixed length digits nicely', () => {
      expect(RandomEngine.formatChunked('123456', true)).toEqual(['123', '456']);
      expect(RandomEngine.formatChunked('12345678', true)).toEqual(['1234', '5678']);
    });

    it('chunks standard numbers in groups of 3', () => {
      expect(RandomEngine.formatChunked('42', false)).toEqual(['42']);
      expect(RandomEngine.formatChunked('1000', false)).toEqual(['1', '000']);
      expect(RandomEngine.formatChunked('1000000', false)).toEqual(['1', '000', '000']);
      expect(RandomEngine.formatChunked('-50000', false)).toEqual(['-50', '000']);
    });
  });
});
