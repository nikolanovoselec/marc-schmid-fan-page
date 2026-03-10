// src/__tests__/ripples.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';

// We test the pure logic, not the canvas rendering
import { createRipple, updateRipples, shouldSpawnRipple } from '../public/js/ripples.js';

describe('ripples', () => {
  describe('createRipple', () => {
    it('creates a ripple at given coordinates', () => {
      const ripple = createRipple(100, 200);
      expect(ripple.x).toBe(100);
      expect(ripple.y).toBe(200);
      expect(ripple.radius).toBe(0);
      expect(ripple.maxRadius).toBeGreaterThan(0);
      expect(ripple.opacity).toBeGreaterThan(0);
      expect(ripple.speed).toBeGreaterThan(0);
    });

    it('creates cursor ripple with smaller max radius', () => {
      const ripple = createRipple(100, 200, { cursor: true });
      expect(ripple.maxRadius).toBeLessThanOrEqual(150);
      expect(ripple.opacity).toBeLessThanOrEqual(0.08);
    });
  });

  describe('updateRipples', () => {
    it('expands ripple radius by speed', () => {
      const ripple = createRipple(0, 0);
      const initial = ripple.radius;
      const [updated] = updateRipples([ripple]);
      expect(updated.radius).toBeGreaterThan(initial);
    });

    it('reduces opacity as ripple expands', () => {
      const ripple = createRipple(0, 0);
      const initial = ripple.opacity;
      const [updated] = updateRipples([ripple]);
      expect(updated.opacity).toBeLessThan(initial);
    });

    it('removes ripples that exceed max radius', () => {
      const ripple = createRipple(0, 0);
      const expired = { ...ripple, radius: ripple.maxRadius + 1 };
      const result = updateRipples([expired]);
      expect(result).toHaveLength(0);
    });

    it('never mutates input array', () => {
      const ripple = createRipple(0, 0);
      const arr = [ripple];
      const result = updateRipples(arr);
      expect(result).not.toBe(arr);
      expect(arr[0].radius).toBe(ripple.radius);
    });
  });

  describe('shouldSpawnRipple', () => {
    it('returns true when enough time elapsed', () => {
      expect(shouldSpawnRipple(0, 3000)).toBe(true);
    });

    it('returns false when too soon', () => {
      expect(shouldSpawnRipple(0, 500)).toBe(false);
    });

    it('respects max active ripple count', () => {
      expect(shouldSpawnRipple(0, 3000, 5)).toBe(false);
    });
  });
});
