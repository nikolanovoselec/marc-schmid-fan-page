// main.js — Entry point: initializes all modules

import { createParticle, updateParticle, calcParticleCount, getConnectionOpacity } from './particles.js';
import { createRipple, updateRipples, shouldSpawnRipple, drawRipple } from './ripples.js';
import { calcParallaxOffset, LAYER_SPEEDS } from './parallax.js';
import { calcStaggerDelay } from './scroll-reveal.js';
import { easeOutCubic, interpolateCounter } from './stat-counters.js';
import { shouldShowScrolledNav } from './nav.js';

// --- Nav ---
(function initNav() {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('mobileMenu');
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      nav.classList.toggle('scrolled', shouldShowScrolledNav(window.scrollY));
      ticking = false;
    });
  });

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    menu.classList.toggle('open');
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      menu.classList.remove('open');
    });
  });
})();

// --- Scroll Reveal ---
(function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, calcStaggerDelay(i));
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
})();

// --- Stat Counters ---
(function initStatCounters() {
  const DURATION = 2000;

  function animateCounter(el, target) {
    const start = performance.now();
    function update(now) {
      const progress = Math.min((now - start) / DURATION, 1);
      el.textContent = interpolateCounter(target, progress).toLocaleString();
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

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
})();

// --- Parallax ---
(function initParallax() {
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
})();

// --- Particle + Ripple Canvas ---
(function initCanvas() {
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let ripples = [];
  let lastRippleSpawn = 0;
  let w, h;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    particles = Array.from({ length: calcParticleCount(w, h) }, () => createParticle(w, h));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // Update and draw particles
    particles = particles.map((p) => updateParticle(p, w, h));

    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(108, 99, 255, ${p.opacity})`;
      ctx.fill();
    }

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const opacity = getConnectionOpacity(dist);
        if (opacity > 0) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(108, 99, 255, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Update and draw ripples
    const now = performance.now();
    if (shouldSpawnRipple(lastRippleSpawn, now, ripples.length)) {
      ripples = [...ripples, createRipple(Math.random() * w, Math.random() * h)];
      lastRippleSpawn = now;
    }

    ripples = updateRipples(ripples);
    for (const r of ripples) {
      drawRipple(ctx, r);
    }

    requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener('resize', resize);

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
