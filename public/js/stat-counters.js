// public/js/stat-counters.js

const DURATION = 2000;

export function easeOutCubic(t) {
  const clamped = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - clamped, 3);
}

export function interpolateCounter(target, progress) {
  return Math.round(easeOutCubic(progress) * target);
}

function animateCounter(el, target) {
  const start = performance.now();
  function update(now) {
    const progress = Math.min((now - start) / DURATION, 1);
    el.textContent = interpolateCounter(target, progress).toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

export function initStatCounters() {
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          animateCounter(el, parseInt(el.dataset.target, 10));
          counterObserver.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  const barObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          barObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  document.querySelectorAll('.stat-number').forEach((el) => counterObserver.observe(el));
  document.querySelectorAll('.stat-bar-fill').forEach((el) => barObserver.observe(el));
}
