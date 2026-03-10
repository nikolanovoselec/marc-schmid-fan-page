// nav.js — Navbar scroll logic

const SCROLL_THRESHOLD = 50;

export function shouldShowScrolledNav(scrollY) {
  return scrollY > SCROLL_THRESHOLD;
}
