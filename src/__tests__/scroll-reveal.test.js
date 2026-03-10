// src/__tests__/scroll-reveal.test.js
import { describe, it, expect } from 'vitest';
import { calcStaggerDelay } from '../public/js/scroll-reveal.js';

describe('scroll-reveal', () => {
  describe('calcStaggerDelay', () => {
    it('returns 0 for first element', () => {
      expect(calcStaggerDelay(0)).toBe(0);
    });

    it('increases by 120ms per index', () => {
      expect(calcStaggerDelay(1)).toBe(120);
      expect(calcStaggerDelay(3)).toBe(360);
    });
  });
});
