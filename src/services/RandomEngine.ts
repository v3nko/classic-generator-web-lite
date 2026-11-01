/*
 * Copyright (c) Victor Kosenko
 * Classic Generator Web Lite - Random Engine
 */

import { GENERATOR_LIMITS } from '../types';

export class RandomEngine {
  /**
   * Generates a random integer between min and max (inclusive).
   */
  public static generateNumeric(min: number, max: number): { value: string; summary: string } {
    if (min >= max) {
      throw new Error(`Minimum (${min}) must be less than maximum (${max})`);
    }

    const range = max - min + 1;
    const randomInt = min + this.getRandomInt(range);
    const summary = min === 0 ? `0 – ${max}` : `${min} – ${max}`;

    return {
      value: randomInt.toString(),
      summary,
    };
  }

  /**
   * Generates a string of exact fixed digits, preserving leading zeroes.
   */
  public static generateNumericFixed(length: number): { value: string; summary: string } {
    if (length < GENERATOR_LIMITS.MIN_DIGIT_LENGTH) {
      throw new Error(`Length must be at least ${GENERATOR_LIMITS.MIN_DIGIT_LENGTH}`);
    }
    if (length > GENERATOR_LIMITS.MAX_DIGIT_LENGTH) {
      throw new Error(`Length cannot exceed ${GENERATOR_LIMITS.MAX_DIGIT_LENGTH}`);
    }

    const digits: number[] = [];
    for (let i = 0; i < length; i++) {
      digits.push(this.getRandomInt(10));
    }

    const value = digits.join('');
    const summary = `${length} ${length === 1 ? 'digit' : 'digits'}`;

    return {
      value,
      summary,
    };
  }

  /**
   * Secure random number helper between 0 (inclusive) and maxExclusive (exclusive).
   */
  private static getRandomInt(maxExclusive: number): number {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      // Calculate rejection boundary to avoid modulo bias
      const maxPossible = 0xffffffff;
      const bucketSize = Math.floor(maxPossible / maxExclusive) * maxExclusive;
      const buffer = new Uint32Array(1);

      let rand: number;
      do {
        window.crypto.getRandomValues(buffer);
        rand = buffer[0];
      } while (rand >= bucketSize);

      return rand % maxExclusive;
    }

    return Math.floor(Math.random() * maxExclusive);
  }

  /**
   * Formats a generated string into readable chunked presentation for UI display.
   * Example: '048192' -> '048 192'
   * Large numbers: '1000000' -> '1 000 000'
   */
  public static formatChunked(value: string, isFixed = false): string[] {
    if (isFixed) {
      // For fixed numeric values, chunk into 3 or 4 character segments
      const chunkSize = value.length >= 8 && value.length % 4 === 0 ? 4 : 3;
      const chunks: string[] = [];
      for (let i = 0; i < value.length; i += chunkSize) {
        chunks.push(value.slice(i, i + chunkSize));
      }
      return chunks;
    }

    // For standard numeric, chunk with spaces every 3 digits from the right
    const negative = value.startsWith('-');
    const digits = negative ? value.slice(1) : value;
    const parts: string[] = [];

    const remainder = digits.length % 3;
    if (remainder > 0) {
      parts.push(digits.slice(0, remainder));
    }
    for (let i = remainder; i < digits.length; i += 3) {
      parts.push(digits.slice(i, i + 3));
    }

    if (negative && parts.length > 0) {
      parts[0] = '-' + parts[0];
    }

    return parts.length > 0 ? parts : [value];
  }
}
