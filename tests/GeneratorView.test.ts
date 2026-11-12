import { describe, it, expect } from 'vitest';
import { resolveHeroFontSizeClass, resolveHeroTrackingClass } from '../src/ui/GeneratorView';

describe('GeneratorView responsive hero styling', () => {
  describe('resolveHeroFontSizeClass', () => {
    it('returns large display font classes for short values (<= 4 digits)', () => {
      expect(resolveHeroFontSizeClass(1)).toBe('text-6xl');
      expect(resolveHeroFontSizeClass(4)).toBe('text-6xl');
    });

    it('returns medium-large font classes for standard digit counts (5 to 8 digits)', () => {
      expect(resolveHeroFontSizeClass(5)).toBe('text-5xl');
      expect(resolveHeroFontSizeClass(6)).toBe('text-5xl');
      expect(resolveHeroFontSizeClass(8)).toBe('text-5xl');
    });

    it('returns comfortable font classes for 9 to 24 digits', () => {
      expect(resolveHeroFontSizeClass(12)).toBe('text-4xl');
      expect(resolveHeroFontSizeClass(16)).toBe('text-4xl');
      expect(resolveHeroFontSizeClass(24)).toBe('text-3xl');
    });

    it('returns compact font classes for long values (25 to 64 digits, including 53 digits)', () => {
      expect(resolveHeroFontSizeClass(32)).toBe('text-2xl');
      expect(resolveHeroFontSizeClass(53)).toBe('text-xl');
      expect(resolveHeroFontSizeClass(64)).toBe('text-xl');
    });

    it('returns very compact font classes for extreme digit counts (up to 150 digits)', () => {
      expect(resolveHeroFontSizeClass(80)).toBe('text-base');
      expect(resolveHeroFontSizeClass(100)).toBe('text-base');
      expect(resolveHeroFontSizeClass(150)).toBe('text-sm');
    });
  });

  describe('resolveHeroTrackingClass', () => {
    it('uses wider tracking for short numbers (<= 8 digits)', () => {
      expect(resolveHeroTrackingClass(1)).toBe('tracking-wider');
      expect(resolveHeroTrackingClass(8)).toBe('tracking-wider');
    });

    it('uses normal tracking for medium numbers (9 to 24 digits)', () => {
      expect(resolveHeroTrackingClass(9)).toBe('tracking-normal');
      expect(resolveHeroTrackingClass(24)).toBe('tracking-normal');
    });

    it('uses tight tracking for long numbers (> 24 digits)', () => {
      expect(resolveHeroTrackingClass(25)).toBe('tracking-tight');
      expect(resolveHeroTrackingClass(53)).toBe('tracking-tight');
      expect(resolveHeroTrackingClass(150)).toBe('tracking-tight');
    });
  });
});
