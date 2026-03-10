// src/__tests__/stat-counters.test.js
import { describe, it, expect } from 'vitest';
import { easeOutCubic, interpolateCounter } from '../public/js/stat-counters.js';

describe('stat-counters', () => {
  describe('easeOutCubic', () => {
    it('returns 0 at start', () => {
      expect(easeOutCubic(0)).toBe(0);
    });

    it('returns 1 at end', () => {
      expect(easeOutCubic(1)).toBe(1);
    });

    it('progresses faster early, slower late', () => {
      const mid = easeOutCubic(0.5);
      expect(mid).toBeGreaterThan(0.5);
    });

    it('clamps to 0-1 range', () => {
      expect(easeOutCubic(-0.5)).toBe(0);
      expect(easeOutCubic(1.5)).toBe(1);
    });
  });

  describe('interpolateCounter', () => {
    it('returns 0 at progress 0', () => {
      expect(interpolateCounter(100, 0)).toBe(0);
    });

    it('returns target at progress 1', () => {
      expect(interpolateCounter(100, 1)).toBe(100);
    });

    it('returns rounded integer', () => {
      const result = interpolateCounter(99, 0.5);
      expect(Number.isInteger(result)).toBe(true);
    });
  });
});
