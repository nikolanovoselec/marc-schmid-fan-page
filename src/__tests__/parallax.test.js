// src/__tests__/parallax.test.js
import { describe, it, expect } from 'vitest';
import { calcParallaxOffset, LAYER_SPEEDS } from '../public/js/parallax.js';

describe('parallax', () => {
  describe('calcParallaxOffset', () => {
    it('returns 0 when scrollY is 0', () => {
      expect(calcParallaxOffset(0, 0.1)).toBe(0);
    });

    it('scales with scroll position and speed', () => {
      expect(calcParallaxOffset(100, 0.1)).toBeCloseTo(10);
      expect(calcParallaxOffset(100, 0.2)).toBeCloseTo(20);
    });
  });

  describe('LAYER_SPEEDS', () => {
    it('defines speeds for all hero layers', () => {
      expect(LAYER_SPEEDS.badge).toBeDefined();
      expect(LAYER_SPEEDS.title).toBeDefined();
      expect(LAYER_SPEEDS.subtitle).toBeDefined();
      expect(LAYER_SPEEDS.cta).toBeDefined();
      expect(LAYER_SPEEDS.avatar).toBeDefined();
    });

    it('avatar is fastest', () => {
      expect(LAYER_SPEEDS.avatar).toBeGreaterThan(LAYER_SPEEDS.badge);
    });
  });
});
