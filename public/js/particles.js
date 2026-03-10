// particles.js — Particle network logic

const MAX_COUNT = 80;
const AREA_DIVISOR = 15000;
const CONNECTION_DISTANCE = 120;
const MAX_CONNECTION_OPACITY = 0.06;

export function createParticle(w, h) {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    size: Math.random() * 2 + 0.5,
    opacity: Math.random() * 0.3 + 0.1,
  };
}

export function updateParticle(p, w, h) {
  let x = p.x + p.vx;
  let y = p.y + p.vy;
  if (x < 0) x = w;
  if (x > w) x = 0;
  if (y < 0) y = h;
  if (y > h) y = 0;
  return { ...p, x, y };
}

export function calcParticleCount(w, h) {
  return Math.min(Math.floor((w * h) / AREA_DIVISOR), MAX_COUNT);
}

export function getConnectionOpacity(distance) {
  if (distance >= CONNECTION_DISTANCE) return 0;
  return MAX_CONNECTION_OPACITY * (1 - distance / CONNECTION_DISTANCE);
}
