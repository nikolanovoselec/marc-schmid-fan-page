// scroll-reveal.js — Stagger delay calculation

const STAGGER_MS = 120;

export function calcStaggerDelay(index) {
  return index * STAGGER_MS;
}
