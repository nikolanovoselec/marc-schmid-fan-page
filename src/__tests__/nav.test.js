// src/__tests__/nav.test.js
import { describe, it, expect } from 'vitest';
import { shouldShowScrolledNav } from '../public/js/nav.js';

describe('nav', () => {
  describe('shouldShowScrolledNav', () => {
    it('returns false when scroll below threshold', () => {
      expect(shouldShowScrolledNav(30)).toBe(false);
    });

    it('returns true when scroll above threshold', () => {
      expect(shouldShowScrolledNav(51)).toBe(true);
    });

    it('returns false at exactly threshold', () => {
      expect(shouldShowScrolledNav(50)).toBe(false);
    });
  });
});
