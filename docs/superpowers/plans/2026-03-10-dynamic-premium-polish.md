# Dynamic Premium Polish — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Full premium polish pass — radial ripples, cursor-reactive effects, glassmorphism, parallax depth, refined typography, smoother motion — with modular codebase, TDD (80%+ coverage via GitHub Actions), and documentation.

**Architecture:** Restructure monolithic HTML/CSS/JS into modular components. CSS split by section/concern. JS split into ES modules (native browser `type="module"`). Each JS module is independently testable. Tests run exclusively in GitHub Actions (CI), never locally.

**Tech Stack:** Vanilla HTML/CSS/JS, ES modules, Vitest + jsdom (CI only), Cloudflare Workers (static assets)

---

## File Structure

```
marc-schmid-fan-page/
├── public/
│   ├── index.html                    # Shell: links CSS, loads JS entry
│   ├── marc.jpg
│   ├── avatar-placeholder.svg
│   ├── css/
│   │   ├── variables.css             # Custom properties, colors, fonts
│   │   ├── reset.css                 # Box-sizing, body, base styles
│   │   ├── nav.css                   # Navigation + mobile menu
│   │   ├── hero.css                  # Hero section + avatar + scroll indicator
│   │   ├── stats.css                 # Stats grid + cards + bars
│   │   ├── about.css                 # About section + status card
│   │   ├── quotes.css                # Quote cards grid
│   │   ├── tribute.css               # Timeline section
│   │   ├── footer.css                # Footer
│   │   ├── buttons.css               # Button styles
│   │   ├── animations.css            # Keyframes + fade-in + transitions
│   │   ├── effects.css               # Noise overlay, glassmorphism, dividers, gradient mesh
│   │   └── responsive.css            # All media queries
│   └── js/
│       ├── main.js                   # Entry: imports + initializes all modules
│       ├── particles.js              # Particle network system
│       ├── ripples.js                # Radial ripple engine (random + cursor)
│       ├── parallax.js               # Hero parallax depth layers
│       ├── scroll-reveal.js          # Intersection Observer fade/scale/blur reveals
│       ├── stat-counters.js          # Number counter + bar animation
│       └── nav.js                    # Navbar scroll effect + mobile toggle
├── src/
│   └── __tests__/
│       ├── ripples.test.js
│       ├── particles.test.js
│       ├── stat-counters.test.js
│       ├── scroll-reveal.test.js
│       ├── parallax.test.js
│       └── nav.test.js
├── vitest.config.js
├── package.json
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Deploy to Cloudflare
│       └── test.yml                  # Run tests on push/PR
├── README.md
├── TECHNICAL.md
├── wrangler.toml
└── .gitignore
```

**Key decisions:**
- CSS split into 13 files (~50-80 lines each) instead of one 700+ line file
- JS split into 7 modules (~30-60 lines each) with clear single responsibilities
- Tests in `src/__tests__/` (not in `public/`) — Vitest resolves modules from `public/js/`
- ES modules with `type="module"` in HTML — no bundler needed
- Each module exports pure functions where possible for testability

---

## Chunk 1: Project Setup + Test Infrastructure

### Task 1: Initialize package.json and test config

**Files:**
- Create: `package.json`
- Create: `vitest.config.js`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "marc-schmid-fan-page",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  },
  "devDependencies": {
    "vitest": "^3.0.0",
    "@vitest/coverage-v8": "^3.0.0",
    "jsdom": "^26.0.0"
  }
}
```

- [ ] **Step 2: Create vitest.config.js**

```js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      include: ['public/js/**/*.js'],
      exclude: ['public/js/main.js'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
```

- [ ] **Step 3: Commit**

```bash
git add package.json vitest.config.js
git commit -m "chore: add vitest test infrastructure"
```

---

### Task 2: Add test GitHub Actions workflow

**Files:**
- Create: `.github/workflows/test.yml`

- [ ] **Step 1: Create test workflow**

```yaml
name: Tests
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:coverage
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/test.yml
git commit -m "ci: add test workflow with coverage enforcement"
```

---

## Chunk 2: Split CSS Into Modules

### Task 3: Extract CSS variables

**Files:**
- Create: `public/css/variables.css`

- [ ] **Step 1: Create variables.css** with all `:root` custom properties from current `styles.css` lines 5-24

- [ ] **Step 2: Add new effect variables**

```css
/* New premium variables */
--bg-card-glass: rgba(18, 18, 26, 0.6);
--transition-luxury: 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
--glow-accent: 0 0 40px rgba(108, 99, 255, 0.3);
```

- [ ] **Step 3: Commit**

```bash
git add public/css/variables.css
git commit -m "refactor: extract CSS variables into dedicated file"
```

---

### Task 4: Extract remaining CSS modules

**Files:**
- Create: `public/css/reset.css` — lines 27-36 (reset + body)
- Create: `public/css/nav.css` — lines 53-144 (nav + mobile menu)
- Create: `public/css/hero.css` — lines 148-309 (hero + avatar + scroll indicator)
- Create: `public/css/buttons.css` — lines 203-232 (button styles)
- Create: `public/css/stats.css` — lines 342-414 (stats grid + cards)
- Create: `public/css/about.css` — lines 418-502 (about + status card)
- Create: `public/css/quotes.css` — lines 507-553 (quote cards)
- Create: `public/css/tribute.css` — lines 558-621 (timeline)
- Create: `public/css/footer.css` — lines 626-655 (footer)
- Create: `public/css/animations.css` — lines 660-669 (fade-in)
- Create: `public/css/responsive.css` — lines 674-701 (media queries)

- [ ] **Step 1: Create each CSS file** by extracting the corresponding section from `styles.css`. Each file should be self-contained with its own section comment header.

- [ ] **Step 2: Commit**

```bash
git add public/css/
git commit -m "refactor: split CSS into modular files by section"
```

---

### Task 5: Create effects.css with new premium styles

**Files:**
- Create: `public/css/effects.css`

- [ ] **Step 1: Create effects.css** with:

```css
/* Noise texture overlay */
body::before {
  content: '';
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  opacity: 0.03;
  pointer-events: none;
  z-index: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 256px 256px;
}

/* Section dividers */
.stats::after,
.about::after,
.quotes::after {
  content: '';
  display: block;
  width: 200px;
  height: 1px;
  margin: 0 auto;
  background: linear-gradient(90deg, transparent, rgba(108, 99, 255, 0.2), transparent);
  margin-top: 2rem;
}

/* Glassmorphism card base */
.stat-card,
.quote-card,
.about-card {
  background: var(--bg-card-glass);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.stat-card:hover,
.quote-card:hover {
  box-shadow: inset 0 0 0 1px rgba(108, 99, 255, 0.1),
              0 8px 32px rgba(0, 0, 0, 0.3);
}

/* Gradient mesh blobs */
.gradient-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.05;
}
.gradient-blob-1 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, #6c63ff, transparent);
  animation: blobDrift1 20s ease-in-out infinite;
}
.gradient-blob-2 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, #a855f7, transparent);
  animation: blobDrift2 25s ease-in-out infinite;
}
.gradient-blob-3 {
  width: 350px; height: 350px;
  background: radial-gradient(circle, #6c63ff, transparent);
  animation: blobDrift3 22s ease-in-out infinite;
}

@keyframes blobDrift1 {
  0%, 100% { transform: translate(0, 0); }
  33% { transform: translate(100px, -50px); }
  66% { transform: translate(-50px, 80px); }
}
@keyframes blobDrift2 {
  0%, 100% { transform: translate(0, 0); }
  33% { transform: translate(-80px, 60px); }
  66% { transform: translate(60px, -40px); }
}
@keyframes blobDrift3 {
  0%, 100% { transform: translate(0, 0); }
  33% { transform: translate(50px, 70px); }
  66% { transform: translate(-70px, -30px); }
}

/* Status card pulsing border */
.about-card {
  animation: cardPulse 4s ease-in-out infinite;
  background: rgba(18, 18, 26, 0.7);
}
@keyframes cardPulse {
  0%, 100% { border-color: var(--border); }
  50% { border-color: rgba(108, 99, 255, 0.15); }
}

/* Stat card top gradient always visible */
.stat-card::before {
  opacity: 0.3;
}
.stat-card:hover::before {
  opacity: 1;
}

/* Section header gradient underline */
.section-header h2::after {
  content: '';
  display: block;
  width: 60px;
  height: 2px;
  background: var(--gradient);
  margin: 0.75rem auto 0;
  border-radius: 1px;
}

/* Quote mark glow */
.quote-mark {
  text-shadow: 0 0 30px rgba(108, 99, 255, 0.2);
}
```

- [ ] **Step 2: Commit**

```bash
git add public/css/effects.css
git commit -m "feat: add premium effects — noise, glassmorphism, gradient mesh, dividers"
```

---

### Task 6: Update animations.css with premium motion

**Files:**
- Modify: `public/css/animations.css`

- [ ] **Step 1: Update fade-in** to include scale and blur:

```css
.fade-in {
  opacity: 0;
  transform: translateY(20px) scale(0.97);
  filter: blur(4px);
  transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.8s cubic-bezier(0.4, 0, 0.2, 1),
              filter 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-in.visible {
  opacity: 1;
  transform: translateY(0) scale(1);
  filter: blur(0);
}
```

- [ ] **Step 2: Update transition timing** in variables.css — change `--transition` to `0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)`

- [ ] **Step 3: Commit**

```bash
git add public/css/animations.css public/css/variables.css
git commit -m "feat: upgrade animations with scale, blur-in, luxury easing"
```

---

### Task 7: Apply typography refinements

**Files:**
- Modify: `public/css/hero.css`
- Modify: `public/css/about.css`

- [ ] **Step 1: Hero title glow** — add to `.hero-first`:
```css
filter: drop-shadow(0 0 40px rgba(108, 99, 255, 0.3));
```

- [ ] **Step 2: Hero last name spacing** — change `.hero-last` letter-spacing to `-0.02em`

- [ ] **Step 3: About body text** — change `.about-text p` line-height to `1.85`

- [ ] **Step 4: Scroll indicator** — replace bouncing line with chevron:
```css
.scroll-chevron {
  width: 20px;
  height: 20px;
  border-right: 2px solid var(--text-dim);
  border-bottom: 2px solid var(--text-dim);
  transform: rotate(45deg);
  animation: chevronPulse 3s ease-in-out infinite;
}
@keyframes chevronPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
```

- [ ] **Step 5: Button hover** — update `.btn-primary:hover`:
```css
.btn-primary:hover {
  transform: translateY(-1px) scale(1.02);
  box-shadow: 0 8px 30px var(--accent-glow);
}
```

- [ ] **Step 6: Commit**

```bash
git add public/css/hero.css public/css/about.css public/css/buttons.css
git commit -m "feat: refine typography, scroll chevron, button hover"
```

---

### Task 8: Update index.html

**Files:**
- Modify: `public/index.html`

- [ ] **Step 1: Replace single CSS link** with modular imports:
```html
<link rel="stylesheet" href="css/variables.css">
<link rel="stylesheet" href="css/reset.css">
<link rel="stylesheet" href="css/nav.css">
<link rel="stylesheet" href="css/buttons.css">
<link rel="stylesheet" href="css/hero.css">
<link rel="stylesheet" href="css/stats.css">
<link rel="stylesheet" href="css/about.css">
<link rel="stylesheet" href="css/quotes.css">
<link rel="stylesheet" href="css/tribute.css">
<link rel="stylesheet" href="css/footer.css">
<link rel="stylesheet" href="css/animations.css">
<link rel="stylesheet" href="css/effects.css">
<link rel="stylesheet" href="css/responsive.css">
```

- [ ] **Step 2: Replace script tag** with module:
```html
<script type="module" src="js/main.js"></script>
```

- [ ] **Step 3: Replace scroll indicator** line div with chevron:
```html
<div class="scroll-indicator fade-in">
  <span>Scroll</span>
  <div class="scroll-chevron"></div>
</div>
```

- [ ] **Step 4: Add gradient mesh blobs** — inside `<body>` before `<canvas>`:
```html
<div class="gradient-blob gradient-blob-1" style="top: 10%; left: 20%"></div>
<div class="gradient-blob gradient-blob-2" style="top: 50%; right: 10%"></div>
<div class="gradient-blob gradient-blob-3" style="top: 80%; left: 40%"></div>
```

- [ ] **Step 5: Remove old styles.css and script.js references**

- [ ] **Step 6: Commit**

```bash
git add public/index.html
git commit -m "refactor: update HTML for modular CSS/JS, add gradient mesh + chevron"
```

---

## Chunk 3: JS Modules with TDD

### Task 9: Ripples module — tests first

**Files:**
- Create: `public/js/ripples.js`
- Create: `src/__tests__/ripples.test.js`

- [ ] **Step 1: Write failing tests**

```js
// src/__tests__/ripples.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';

// We test the pure logic, not the canvas rendering
import { createRipple, updateRipples, shouldSpawnRipple } from '../public/js/ripples.js';

describe('ripples', () => {
  describe('createRipple', () => {
    it('creates a ripple at given coordinates', () => {
      const ripple = createRipple(100, 200);
      expect(ripple.x).toBe(100);
      expect(ripple.y).toBe(200);
      expect(ripple.radius).toBe(0);
      expect(ripple.maxRadius).toBeGreaterThan(0);
      expect(ripple.opacity).toBeGreaterThan(0);
      expect(ripple.speed).toBeGreaterThan(0);
    });

    it('creates cursor ripple with smaller max radius', () => {
      const ripple = createRipple(100, 200, { cursor: true });
      expect(ripple.maxRadius).toBeLessThanOrEqual(150);
      expect(ripple.opacity).toBeLessThanOrEqual(0.08);
    });
  });

  describe('updateRipples', () => {
    it('expands ripple radius by speed', () => {
      const ripple = createRipple(0, 0);
      const initial = ripple.radius;
      const [updated] = updateRipples([ripple]);
      expect(updated.radius).toBeGreaterThan(initial);
    });

    it('reduces opacity as ripple expands', () => {
      const ripple = createRipple(0, 0);
      const initial = ripple.opacity;
      const [updated] = updateRipples([ripple]);
      expect(updated.opacity).toBeLessThan(initial);
    });

    it('removes ripples that exceed max radius', () => {
      const ripple = createRipple(0, 0);
      const expired = { ...ripple, radius: ripple.maxRadius + 1 };
      const result = updateRipples([expired]);
      expect(result).toHaveLength(0);
    });

    it('never mutates input array', () => {
      const ripple = createRipple(0, 0);
      const arr = [ripple];
      const result = updateRipples(arr);
      expect(result).not.toBe(arr);
      expect(arr[0].radius).toBe(ripple.radius);
    });
  });

  describe('shouldSpawnRipple', () => {
    it('returns true when enough time elapsed', () => {
      expect(shouldSpawnRipple(0, 3000)).toBe(true);
    });

    it('returns false when too soon', () => {
      expect(shouldSpawnRipple(0, 500)).toBe(false);
    });

    it('respects max active ripple count', () => {
      expect(shouldSpawnRipple(0, 3000, 5)).toBe(false);
    });
  });
});
```

- [ ] **Step 2: Write ripples.js module**

```js
// public/js/ripples.js

const RANDOM_MAX_RADIUS = 300;
const CURSOR_MAX_RADIUS = 150;
const RANDOM_OPACITY = 0.15;
const CURSOR_OPACITY = 0.08;
const SPEED = 1.5;
const SPAWN_INTERVAL = 2000;
const MAX_ACTIVE = 5;

export function createRipple(x, y, opts = {}) {
  const cursor = opts.cursor || false;
  return {
    x,
    y,
    radius: 0,
    maxRadius: cursor ? CURSOR_MAX_RADIUS : RANDOM_MAX_RADIUS,
    opacity: cursor ? CURSOR_OPACITY : RANDOM_OPACITY,
    speed: cursor ? SPEED * 1.5 : SPEED,
  };
}

export function updateRipples(ripples) {
  return ripples
    .map((r) => ({
      ...r,
      radius: r.radius + r.speed,
      opacity: r.opacity * (1 - r.radius / r.maxRadius),
    }))
    .filter((r) => r.radius <= r.maxRadius);
}

export function shouldSpawnRipple(lastSpawn, now, activeCount = 0) {
  if (activeCount >= MAX_ACTIVE) return false;
  return now - lastSpawn >= SPAWN_INTERVAL;
}

export function drawRipple(ctx, ripple) {
  ctx.beginPath();
  ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(108, 99, 255, ${Math.max(0, ripple.opacity)})`;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}
```

- [ ] **Step 3: Commit**

```bash
git add public/js/ripples.js src/__tests__/ripples.test.js
git commit -m "feat: add ripples module with tests (TDD)"
```

---

### Task 10: Particles module — tests first

**Files:**
- Create: `public/js/particles.js`
- Create: `src/__tests__/particles.test.js`

- [ ] **Step 1: Write failing tests**

```js
// src/__tests__/particles.test.js
import { describe, it, expect } from 'vitest';
import { createParticle, updateParticle, calcParticleCount, getConnectionOpacity } from '../public/js/particles.js';

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
```

- [ ] **Step 2: Write particles.js module**

```js
// public/js/particles.js

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

export function initParticleSystem(canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];
  let w, h;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    particles = Array.from({ length: calcParticleCount(w, h) }, () => createParticle(w, h));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    particles = particles.map((p) => updateParticle(p, w, h));

    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(108, 99, 255, ${p.opacity})`;
      ctx.fill();
    }

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

    requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener('resize', resize);
}
```

- [ ] **Step 3: Commit**

```bash
git add public/js/particles.js src/__tests__/particles.test.js
git commit -m "feat: add particles module with tests (TDD)"
```

---

### Task 11: Stat counters module — tests first

**Files:**
- Create: `public/js/stat-counters.js`
- Create: `src/__tests__/stat-counters.test.js`

- [ ] **Step 1: Write failing tests**

```js
// src/__tests__/stat-counters.test.js
import { describe, it, expect } from 'vitest';
import { easeOutCubic, interpolateCounter } from '../public/js/stat-counters.js';

describe('stat-counters', () => {
  describe('easeOutCubic', () => {
    it('returns 0 at start', () => {
      expect(easeOutCubic(0)).toBe(0);
    });

    it('returns 1 at end', () => {
      expect(easeOutCubic(1)).toBe(1);
    });

    it('progresses faster early, slower late', () => {
      const mid = easeOutCubic(0.5);
      expect(mid).toBeGreaterThan(0.5);
    });

    it('clamps to 0-1 range', () => {
      expect(easeOutCubic(-0.5)).toBe(0);
      expect(easeOutCubic(1.5)).toBe(1);
    });
  });

  describe('interpolateCounter', () => {
    it('returns 0 at progress 0', () => {
      expect(interpolateCounter(100, 0)).toBe(0);
    });

    it('returns target at progress 1', () => {
      expect(interpolateCounter(100, 1)).toBe(100);
    });

    it('returns rounded integer', () => {
      const result = interpolateCounter(99, 0.5);
      expect(Number.isInteger(result)).toBe(true);
    });
  });
});
```

- [ ] **Step 2: Write stat-counters.js module**

```js
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
```

- [ ] **Step 3: Commit**

```bash
git add public/js/stat-counters.js src/__tests__/stat-counters.test.js
git commit -m "feat: add stat-counters module with tests (TDD)"
```

---

### Task 12: Scroll reveal module — tests first

**Files:**
- Create: `public/js/scroll-reveal.js`
- Create: `src/__tests__/scroll-reveal.test.js`

- [ ] **Step 1: Write failing tests**

```js
// src/__tests__/scroll-reveal.test.js
import { describe, it, expect } from 'vitest';
import { calcStaggerDelay } from '../public/js/scroll-reveal.js';

describe('scroll-reveal', () => {
  describe('calcStaggerDelay', () => {
    it('returns 0 for first element', () => {
      expect(calcStaggerDelay(0)).toBe(0);
    });

    it('increases by 120ms per index', () => {
      expect(calcStaggerDelay(1)).toBe(120);
      expect(calcStaggerDelay(3)).toBe(360);
    });
  });
});
```

- [ ] **Step 2: Write scroll-reveal.js module**

```js
// public/js/scroll-reveal.js

const STAGGER_MS = 120;

export function calcStaggerDelay(index) {
  return index * STAGGER_MS;
}

export function initScrollReveal() {
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
}
```

- [ ] **Step 3: Commit**

```bash
git add public/js/scroll-reveal.js src/__tests__/scroll-reveal.test.js
git commit -m "feat: add scroll-reveal module with tests (TDD)"
```

---

### Task 13: Parallax module — tests first

**Files:**
- Create: `public/js/parallax.js`
- Create: `src/__tests__/parallax.test.js`

- [ ] **Step 1: Write failing tests**

```js
// src/__tests__/parallax.test.js
import { describe, it, expect } from 'vitest';
import { calcParallaxOffset, LAYER_SPEEDS } from '../public/js/parallax.js';

describe('parallax', () => {
  describe('calcParallaxOffset', () => {
    it('returns 0 when scrollY is 0', () => {
      expect(calcParallaxOffset(0, 0.1)).toBe(0);
    });

    it('scales with scroll position and speed', () => {
      expect(calcParallaxOffset(100, 0.1)).toBeCloseTo(10);
      expect(calcParallaxOffset(100, 0.2)).toBeCloseTo(20);
    });
  });

  describe('LAYER_SPEEDS', () => {
    it('defines speeds for all hero layers', () => {
      expect(LAYER_SPEEDS.badge).toBeDefined();
      expect(LAYER_SPEEDS.title).toBeDefined();
      expect(LAYER_SPEEDS.subtitle).toBeDefined();
      expect(LAYER_SPEEDS.cta).toBeDefined();
      expect(LAYER_SPEEDS.avatar).toBeDefined();
    });

    it('avatar is fastest', () => {
      expect(LAYER_SPEEDS.avatar).toBeGreaterThan(LAYER_SPEEDS.badge);
    });
  });
});
```

- [ ] **Step 2: Write parallax.js module**

```js
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
```

- [ ] **Step 3: Commit**

```bash
git add public/js/parallax.js src/__tests__/parallax.test.js
git commit -m "feat: add parallax depth module with tests (TDD)"
```

---

### Task 14: Nav module — tests first

**Files:**
- Create: `public/js/nav.js`
- Create: `src/__tests__/nav.test.js`

- [ ] **Step 1: Write failing tests**

```js
// src/__tests__/nav.test.js
import { describe, it, expect } from 'vitest';
import { shouldShowScrolledNav } from '../public/js/nav.js';

describe('nav', () => {
  describe('shouldShowScrolledNav', () => {
    it('returns false when scroll below threshold', () => {
      expect(shouldShowScrolledNav(30)).toBe(false);
    });

    it('returns true when scroll above threshold', () => {
      expect(shouldShowScrolledNav(51)).toBe(true);
    });

    it('returns false at exactly threshold', () => {
      expect(shouldShowScrolledNav(50)).toBe(false);
    });
  });
});
```

- [ ] **Step 2: Write nav.js module**

```js
// public/js/nav.js

const SCROLL_THRESHOLD = 50;

export function shouldShowScrolledNav(scrollY) {
  return scrollY > SCROLL_THRESHOLD;
}

export function initNav() {
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
}
```

- [ ] **Step 3: Commit**

```bash
git add public/js/nav.js src/__tests__/nav.test.js
git commit -m "feat: add nav module with tests (TDD)"
```

---

### Task 15: Main entry point + integrate ripples into canvas

**Files:**
- Create: `public/js/main.js`

- [ ] **Step 1: Write main.js** that imports and initializes all modules:

```js
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
```

- [ ] **Step 2: Delete old files**

```bash
rm public/styles.css public/script.js
```

- [ ] **Step 3: Commit**

```bash
git add public/js/main.js
git rm public/styles.css public/script.js
git commit -m "feat: integrate all modules via main.js, remove monolithic files"
```

---

## Chunk 4: Documentation

### Task 16: Create README.md

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write README.md** covering:
  - Project description (Marc Schmid fan page tribute)
  - Live URL: `marc.graymatter.ch`
  - Tech stack (vanilla HTML/CSS/JS, Cloudflare Workers)
  - Project structure overview
  - Development (note: tests run in CI only)
  - Deployment (auto-deploy on push to main)

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README"
```

---

### Task 17: Create TECHNICAL.md

**Files:**
- Create: `TECHNICAL.md`

- [ ] **Step 1: Write TECHNICAL.md** covering:
  - Architecture: static assets on Cloudflare Workers
  - File structure with descriptions of every directory and file
  - CSS architecture: modular files, variables system, effects system
  - JS architecture: ES modules, pure functions for testability
  - Visual effects: particle system, radial ripples, cursor reactivity, gradient mesh, noise overlay
  - Animation system: fade-in with scale/blur, parallax layers, stagger delays
  - Testing: Vitest + jsdom, CI-only execution, 80% coverage threshold
  - Deployment: GitHub Actions auto-deploy on push to main

- [ ] **Step 2: Commit**

```bash
git add TECHNICAL.md
git commit -m "docs: add TECHNICAL reference"
```

---

## Chunk 5: Final Integration + Push

### Task 18: Update .gitignore

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Add node_modules and coverage** to .gitignore:
```
node_modules/
coverage/
```

- [ ] **Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: update gitignore for node_modules and coverage"
```

---

### Task 19: Push and verify CI

- [ ] **Step 1: Push all commits to main**

```bash
git push origin main
```

- [ ] **Step 2: Monitor CI** — both deploy and test workflows must pass
- [ ] **Step 3: Verify live site** at `marc.graymatter.ch` renders correctly with all new effects
