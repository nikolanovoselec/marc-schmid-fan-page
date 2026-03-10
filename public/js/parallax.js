// parallax.js — Parallax offset calculation

export const LAYER_SPEEDS = {
  badge: 0.05,
  title: 0.10,
  subtitle: 0.12,
  cta: 0.15,
  avatar: 0.20,
};

export function calcParallaxOffset(scrollY, speed) {
  return scrollY * speed;
}
