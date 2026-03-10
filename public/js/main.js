// public/js/main.js

import { initParticleSystem } from './particles.js';
import { createRipple, updateRipples, shouldSpawnRipple, drawRipple } from './ripples.js';
import { initParallax } from './parallax.js';
import { initScrollReveal } from './scroll-reveal.js';
import { initStatCounters } from './stat-counters.js';
import { initNav } from './nav.js';

// Initialize all modules
initNav();
initScrollReveal();
initStatCounters();
initParallax();

// Particle + Ripple canvas system
(function initCanvas() {
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');

  // Initialize particles
  initParticleSystem(canvas);

  // Ripple overlay (shares canvas)
  let ripples = [];
  let lastRippleSpawn = 0;
  let w = canvas.width;
  let h = canvas.height;

  window.addEventListener('resize', () => {
    w = canvas.width;
    h = canvas.height;
  });

  // Random ripple spawning
  function rippleLoop() {
    const now = performance.now();

    if (shouldSpawnRipple(lastRippleSpawn, now, ripples.length)) {
      ripples = [...ripples, createRipple(Math.random() * w, Math.random() * h)];
      lastRippleSpawn = now;
    }

    ripples = updateRipples(ripples);

    for (const r of ripples) {
      drawRipple(ctx, r);
    }

    requestAnimationFrame(rippleLoop);
  }

  rippleLoop();

  // Cursor-reactive ripples
  let lastCursorRipple = 0;
  window.addEventListener('mousemove', (e) => {
    const now = performance.now();
    if (now - lastCursorRipple > 500) {
      ripples = [...ripples, createRipple(e.clientX, e.clientY, { cursor: true })];
      lastCursorRipple = now;
    }
  });

  // Mobile: spawn on scroll
  let lastScrollRipple = 0;
  window.addEventListener('scroll', () => {
    const now = performance.now();
    if (now - lastScrollRipple > 800) {
      ripples = [...ripples, createRipple(
        Math.random() * w,
        window.scrollY % h,
        { cursor: true }
      )];
      lastScrollRipple = now;
    }
  });
})();
