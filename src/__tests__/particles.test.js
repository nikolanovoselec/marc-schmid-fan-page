// src/__tests__/particles.test.js
import { describe, it, expect } from 'vitest';
import { createParticle, updateParticle, calcParticleCount, getConnectionOpacity } from '../../public/js/particles.js';

describe('particles', () => {
  describe('createParticle', () => {
    it('creates particle within bounds', () => {
      const p = createParticle(800, 600);
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(800);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(600);
      expect(p.size).toBeGreaterThan(0);
      expect(p.opacity).toBeGreaterThan(0);
    });
  });

  describe('updateParticle', () => {
    it('moves particle by velocity', () => {
      const p = { x: 100, y: 100, vx: 1, vy: -1, size: 1, opacity: 0.2 };
      const updated = updateParticle(p, 800, 600);
      expect(updated.x).toBe(101);
      expect(updated.y).toBe(99);
    });

    it('wraps particle around edges', () => {
      const p = { x: 801, y: -1, vx: 0, vy: 0, size: 1, opacity: 0.2 };
      const updated = updateParticle(p, 800, 600);
      expect(updated.x).toBe(0);
      expect(updated.y).toBe(600);
    });

    it('never mutates original', () => {
      const p = { x: 100, y: 100, vx: 1, vy: 1, size: 1, opacity: 0.2 };
      const updated = updateParticle(p, 800, 600);
      expect(updated).not.toBe(p);
      expect(p.x).toBe(100);
    });
  });

  describe('calcParticleCount', () => {
    it('caps at 80', () => {
      expect(calcParticleCount(5000, 5000)).toBe(80);
    });

    it('scales with area', () => {
      const small = calcParticleCount(400, 300);
      const large = calcParticleCount(1920, 1080);
      expect(large).toBeGreaterThan(small);
    });
  });

  describe('getConnectionOpacity', () => {
    it('returns 0 for particles too far apart', () => {
      expect(getConnectionOpacity(200)).toBe(0);
    });

    it('returns positive value for close particles', () => {
      expect(getConnectionOpacity(50)).toBeGreaterThan(0);
    });

    it('returns higher opacity for closer particles', () => {
      expect(getConnectionOpacity(20)).toBeGreaterThan(getConnectionOpacity(100));
    });
  });
});
