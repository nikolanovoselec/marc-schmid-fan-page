# Technical Reference

## Architecture

Static assets served by Cloudflare Workers. No server-side logic, no build step, no bundler. Browser-native ES modules for JavaScript. Multiple CSS files loaded via `<link>` tags.

## File Structure

### CSS (`public/css/`)

| File | Purpose | Lines |
|------|---------|-------|
| `variables.css` | Custom properties: colors, fonts, spacing, effects | ~30 |
| `reset.css` | Box-sizing reset, body styles, canvas, `.accent` class | ~20 |
| `nav.css` | Fixed navbar, scroll state, mobile hamburger, mobile menu | ~90 |
| `buttons.css` | `.btn-primary` (gradient), `.btn-outline` hover states | ~30 |
| `hero.css` | Hero layout, avatar ring, title gradient, scroll chevron, section headers | ~80 |
| `stats.css` | Stats grid, stat cards, animated progress bars | ~70 |
| `about.css` | About section, skills tags, sticky status card | ~80 |
| `quotes.css` | Quote card grid, quotation mark styling | ~50 |
| `tribute.css` | Timeline layout, vertical line, highlight state | ~60 |
| `footer.css` | Footer, Swiss Post cross | ~30 |
| `animations.css` | `.fade-in` with scale + blur, `.visible` transition | ~15 |
| `effects.css` | Noise overlay, glassmorphism, gradient mesh, dividers, card pulse | ~90 |
| `responsive.css` | Media queries at 900px, 600px, 400px breakpoints | ~30 |

### JavaScript (`public/js/`)

All modules use ES module syntax (`export`/`import`). Each exports pure functions for testability plus an `init*` function for DOM setup.

| Module | Exports | Purpose |
|--------|---------|---------|
| `main.js` | — | Entry point. Imports all modules, initializes them, integrates ripples into canvas |
| `particles.js` | `createParticle`, `updateParticle`, `calcParticleCount`, `getConnectionOpacity`, `initParticleSystem` | Particle network: small circles drifting with connection lines |
| `ripples.js` | `createRipple`, `updateRipples`, `shouldSpawnRipple`, `drawRipple` | Radial ripple engine: random sonar pings + cursor-reactive pulses |
| `stat-counters.js` | `easeOutCubic`, `interpolateCounter`, `initStatCounters` | Counter animation on scroll intersection |
| `scroll-reveal.js` | `calcStaggerDelay`, `initScrollReveal` | Intersection Observer for `.fade-in` elements with stagger |
| `parallax.js` | `calcParallaxOffset`, `LAYER_SPEEDS`, `initParallax` | Hero elements move at different scroll speeds |
| `nav.js` | `shouldShowScrolledNav`, `initNav` | Navbar blur on scroll, mobile menu toggle |

### Tests (`src/__tests__/`)

**34 tests** across 6 test files. One test file per JS module. Tests cover all exported pure functions. DOM-dependent `init*` functions are excluded from coverage (they wire up event listeners).

| Test File | Tests | Covers |
|-----------|-------|--------|
| `ripples.test.js` | 9 | Ripple creation (coordinates, cursor mode), update (expansion, opacity decay, expiry, immutability), spawn timing, max active limit |
| `particles.test.js` | 9 | Particle creation bounds, velocity movement, edge wrapping, immutability, count cap/scaling, connection opacity (distance, falloff) |
| `stat-counters.test.js` | 7 | Easing function (boundaries, curve shape, clamping), counter interpolation (start, end, rounding) |
| `scroll-reveal.test.js` | 2 | Stagger delay at index 0, increment per index |
| `parallax.test.js` | 4 | Offset at zero, scaling with speed, layer speed completeness, avatar speed ordering |
| `nav.test.js` | 3 | Scroll below/above/at threshold |

### Lines of Code

| Category | Files | Lines |
|----------|-------|-------|
| HTML | 1 | 267 |
| CSS | 13 | 809 |
| JavaScript | 7 | 365 |
| Tests | 6 | 241 |
| **Total** | **27** | **1,682** |

Largest files: `hero.css` (161), `effects.css` (118), `nav.css` (94), `particles.js` (84), `main.js` (78). No file exceeds 200 lines.

## Visual Effects

### Particle Network
Canvas-based. Up to 80 particles drift across the viewport. Connection lines drawn between particles within 120px at very low opacity (0.06 max). Recreated on resize.

### Radial Ripples
Layered on the same canvas. Random ripples spawn every 2-4 seconds (max 5 active). Each expands from 0 to 300px radius while fading out over ~3 seconds. Cursor movement spawns smaller, faster ripples (150px max, 0.08 opacity).

### Gradient Mesh
Three large blurred CSS blobs (`filter: blur(100px)`) positioned absolutely behind content. Each drifts on a slow keyframe loop (20-25s). Opacity capped at 5%.

### Noise Overlay
`body::before` pseudo-element with an inline SVG `feTurbulence` noise pattern at 3% opacity. Adds organic texture to the dark background.

### Glassmorphism
Cards use `backdrop-filter: blur(12px)` with semi-transparent backgrounds. On hover: inset glow border + deeper shadow.

### Parallax
Hero elements (badge, title, subtitle, CTA, avatar) each scroll at different speeds (0.05x to 0.20x). Creates layered depth. Disabled below 900px viewport width.

### Scroll Reveals
Elements with `.fade-in` start at `opacity: 0`, `translateY(20px)`, `scale(0.97)`, `blur(4px)`. On intersection, transition to full visibility. Staggered at 120ms per element.

## Testing

- **Framework:** Vitest with jsdom environment
- **Total tests:** 34 across 6 test files
- **Coverage:** v8 provider, `public/js/**/*.js` (excludes `main.js` which is DOM glue)
- **Execution:** GitHub Actions only. Never run locally (1 vCPU container constraint)
- **Architecture:** Pure functions in modules (testable), DOM wiring in `main.js` (excluded from coverage)

## Deployment

GitHub Actions workflow (`.github/workflows/ci.yml`):

1. On push to `main`: run tests with coverage
2. If tests pass: deploy via `wrangler-action@v3` to Cloudflare Workers
3. Custom domain: `marc.graymatter.ch`

Pull requests run tests only (no deploy).
