// public/js/parallax.js

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

export function initParallax() {
  if (window.matchMedia('(max-width: 900px)').matches) return;

  const layers = {
    badge: document.querySelector('.hero-badge'),
    title: document.querySelector('.hero-title'),
    subtitle: document.querySelector('.hero-subtitle'),
    cta: document.querySelector('.hero-cta'),
    avatar: document.querySelector('.hero-avatar'),
  };

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        for (const [key, el] of Object.entries(layers)) {
          if (el) {
            const offset = calcParallaxOffset(scrolled, LAYER_SPEEDS[key]);
            el.style.transform = `translateY(${offset}px)`;
          }
        }
      }
      ticking = false;
    });
  });
}
