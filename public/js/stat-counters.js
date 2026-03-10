// stat-counters.js — Easing and counter interpolation

export function easeOutCubic(t) {
  const clamped = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - clamped, 3);
}

export function interpolateCounter(target, progress) {
  return Math.round(easeOutCubic(progress) * target);
}
