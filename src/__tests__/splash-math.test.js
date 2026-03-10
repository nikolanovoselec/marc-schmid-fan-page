// src/__tests__/splash-math.test.js
import { describe, it, expect } from 'vitest';
import {
  hashCode, getResolution, scaleByPixelRatio, wrap,
  HSVtoRGB, correctDeltaX, correctDeltaY, correctRadius,
} from '../../public/js/splash-math.js';

describe('splash-math', () => {
  describe('hashCode', () => {
    it('returns 0 for empty string', () => {
      expect(hashCode('')).toBe(0);
    });

    it('returns consistent hash for same input', () => {
      const h1 = hashCode('SHADING');
      const h2 = hashCode('SHADING');
      expect(h1).toBe(h2);
    });

    it('returns different hashes for different inputs', () => {
      expect(hashCode('foo')).not.toBe(hashCode('bar'));
    });

    it('returns an integer', () => {
      expect(Number.isInteger(hashCode('test'))).toBe(true);
    });
  });

  describe('getResolution', () => {
    it('returns width and height based on aspect ratio', () => {
      const mockGl = { drawingBufferWidth: 1920, drawingBufferHeight: 1080 };
      const res = getResolution(mockGl, 128);
      expect(res.width).toBeGreaterThan(res.height);
      expect(res.height).toBe(128);
    });

    it('handles portrait orientation', () => {
      const mockGl = { drawingBufferWidth: 1080, drawingBufferHeight: 1920 };
      const res = getResolution(mockGl, 128);
      expect(res.height).toBeGreaterThan(res.width);
      expect(res.width).toBe(128);
    });

    it('handles square aspect ratio', () => {
      const mockGl = { drawingBufferWidth: 1000, drawingBufferHeight: 1000 };
      const res = getResolution(mockGl, 128);
      expect(res.width).toBe(128);
      expect(res.height).toBe(128);
    });
  });

  describe('scaleByPixelRatio', () => {
    it('scales input by device pixel ratio', () => {
      // jsdom defaults devicePixelRatio to 1
      expect(scaleByPixelRatio(100)).toBe(100);
    });

    it('returns floored integer', () => {
      expect(Number.isInteger(scaleByPixelRatio(99.7))).toBe(true);
    });
  });

  describe('wrap', () => {
    it('wraps value within range', () => {
      expect(wrap(1.5, 0, 1)).toBeCloseTo(0.5);
    });

    it('returns min when range is 0', () => {
      expect(wrap(5, 3, 3)).toBe(3);
    });

    it('handles negative values', () => {
      const result = wrap(-0.3, 0, 1);
      expect(result).toBeCloseTo(0.7);
    });

    it('returns value unchanged when within range', () => {
      expect(wrap(0.5, 0, 1)).toBeCloseTo(0.5);
    });
  });

  describe('HSVtoRGB', () => {
    it('converts red (h=0)', () => {
      const c = HSVtoRGB(0, 1, 1);
      expect(c.r).toBeCloseTo(1);
      expect(c.g).toBeCloseTo(0);
      expect(c.b).toBeCloseTo(0);
    });

    it('converts green (h=0.333)', () => {
      const c = HSVtoRGB(1 / 3, 1, 1);
      expect(c.g).toBeCloseTo(1);
    });

    it('converts blue (h=0.667)', () => {
      const c = HSVtoRGB(2 / 3, 1, 1);
      expect(c.b).toBeCloseTo(1);
    });

    it('converts white (s=0, v=1)', () => {
      const c = HSVtoRGB(0, 0, 1);
      expect(c.r).toBeCloseTo(1);
      expect(c.g).toBeCloseTo(1);
      expect(c.b).toBeCloseTo(1);
    });

    it('converts black (v=0)', () => {
      const c = HSVtoRGB(0, 1, 0);
      expect(c.r).toBe(0);
      expect(c.g).toBe(0);
      expect(c.b).toBe(0);
    });

    it('handles all 6 hue sectors', () => {
      // Each sector is 1/6 of the hue wheel
      for (let i = 0; i < 6; i++) {
        const c = HSVtoRGB(i / 6, 1, 1);
        expect(c.r).toBeGreaterThanOrEqual(0);
        expect(c.g).toBeGreaterThanOrEqual(0);
        expect(c.b).toBeGreaterThanOrEqual(0);
        expect(c.r).toBeLessThanOrEqual(1);
        expect(c.g).toBeLessThanOrEqual(1);
        expect(c.b).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('correctDeltaX', () => {
    it('returns delta unchanged for landscape canvas', () => {
      const canvas = { width: 1920, height: 1080 };
      expect(correctDeltaX(canvas, 0.5)).toBe(0.5);
    });

    it('scales delta for portrait canvas', () => {
      const canvas = { width: 1080, height: 1920 };
      const result = correctDeltaX(canvas, 1.0);
      expect(result).toBeCloseTo(1080 / 1920);
    });
  });

  describe('correctDeltaY', () => {
    it('scales delta for landscape canvas', () => {
      const canvas = { width: 1920, height: 1080 };
      const result = correctDeltaY(canvas, 1.0);
      expect(result).toBeCloseTo(1080 / 1920);
    });

    it('returns delta unchanged for portrait canvas', () => {
      const canvas = { width: 1080, height: 1920 };
      expect(correctDeltaY(canvas, 0.5)).toBe(0.5);
    });
  });

  describe('correctRadius', () => {
    it('scales radius for landscape canvas', () => {
      const canvas = { width: 1920, height: 1080 };
      const result = correctRadius(canvas, 0.01);
      expect(result).toBeCloseTo(0.01 * (1920 / 1080));
    });

    it('returns radius unchanged for portrait canvas', () => {
      const canvas = { width: 1080, height: 1920 };
      expect(correctRadius(canvas, 0.01)).toBe(0.01);
    });
  });
});
