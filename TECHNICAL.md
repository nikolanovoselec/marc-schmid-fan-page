# Technical Reference

## Architecture

Static assets served by Cloudflare Workers. No server-side logic, no build step, no bundler. Browser-native ES modules for JavaScript. Multiple CSS files loaded via `<link>` tags. WebGL2 fluid simulation for interactive cursor effect.

## File Structure

### CSS (`public/css/`)

| File | Purpose | Lines |
|------|---------|-------|
| `variables.css` | Custom properties: colors, fonts, spacing, effects | 27 |
| `reset.css` | Box-sizing reset, body styles, canvas, `.accent` class | 24 |
| `nav.css` | Fixed navbar, scroll state, mobile hamburger, mobile menu | 94 |
| `buttons.css` | `.btn-primary` (gradient), `.btn-outline` hover states | 32 |
| `hero.css` | Hero layout, avatar ring, title gradient glow, scroll chevron, section headers | 161 |
| `stats.css` | Stats grid, stat cards, animated progress bars | 75 |
| `about.css` | About section, skills tags, sticky status card | 86 |
| `quotes.css` | Quote card grid, quotation mark styling | 49 |
| `tribute.css` | Timeline layout, vertical line, highlight state | 66 |
| `footer.css` | Footer, Swiss Post cross | 32 |
| `animations.css` | `.fade-in` with scale + blur, `.visible` transition | 15 |
| `effects.css` | Noise overlay, glassmorphism, gradient mesh, dividers, card pulse, splash cursor CSS | 135 |
| `responsive.css` | Media queries at 900px, 600px, 400px breakpoints | 30 |

### JavaScript (`public/js/`)

All modules use ES module syntax (`export`/`import`). Pure modules export only testable functions. DOM wiring lives in `main.js`.

| Module | Exports | Lines | Purpose |
|--------|---------|-------|---------|
| `main.js` | — | 248 | Entry point. Imports all modules, initializes DOM wiring, splash cursor |
| `particles.js` | `createParticle`, `updateParticle`, `calcParticleCount`, `getConnectionOpacity` | 36 | Particle network: drifting circles with connection lines |
| `ripples.js` | `createRipple`, `updateRipples`, `shouldSpawnRipple`, `drawRipple` | 47 | Radial ripple engine: random pings + cursor pulses |
| `stat-counters.js` | `easeOutCubic`, `interpolateCounter` | 10 | Counter animation easing |
| `scroll-reveal.js` | `calcStaggerDelay` | 7 | Staggered reveal delay calculation |
| `parallax.js` | `calcParallaxOffset`, `LAYER_SPEEDS` | 13 | Hero parallax depth layers |
| `nav.js` | `shouldShowScrolledNav` | 7 | Navbar scroll threshold |
| `splash-cursor.js` | `createSplashSimulation` | 377 | WebGL Navier-Stokes fluid simulation |
| `splash-shaders.js` | 11 GLSL shader sources | 263 | Vertex, fragment shaders for fluid sim |
| `splash-math.js` | `hashCode`, `getResolution`, `scaleByPixelRatio`, `wrap`, `HSVtoRGB`, `correctDeltaX/Y`, `correctRadius` | 67 | Pure math utilities for fluid sim |
| `webgl-utils.js` | `getWebGLContext`, `compileShader`, `Material`, `Program`, `createFBO`, etc. | 243 | WebGL context, FBO management, shader compilation |

### Tests (`src/__tests__/`)

**59 tests** across 7 test files. Tests cover all exported pure functions.

| Test File | Tests | Covers |
|-----------|-------|--------|
| `splash-math.test.js` | 25 | hashCode, getResolution, scaleByPixelRatio, wrap, HSVtoRGB (all 6 hue sectors), correctDeltaX/Y, correctRadius |
| `ripples.test.js` | 9 | Ripple creation, update (expansion, opacity decay, expiry, immutability), spawn timing |
| `particles.test.js` | 9 | Particle creation bounds, velocity, edge wrapping, immutability, count cap, connection opacity |
| `stat-counters.test.js` | 7 | Easing function (boundaries, curve, clamping), counter interpolation |
| `parallax.test.js` | 4 | Offset calculation, layer speed definitions, ordering |
| `nav.test.js` | 3 | Scroll below/above/at threshold |
| `scroll-reveal.test.js` | 2 | Stagger delay at index 0, increment per index |

### Lines of Code

| Category | Files | Lines |
|----------|-------|-------|
| HTML | 1 | 271 |
| CSS | 13 | 826 |
| JavaScript | 11 | 1,318 |
| Tests | 7 | 407 |
| **Total** | **32** | **~2,550** |

## Visual Effects

### WebGL Splash Cursor (Primary Effect)
Full-page WebGL2 Navier-Stokes fluid simulation. Mouse movement creates colorful ink splashes with realistic fluid dynamics — velocity, pressure, curl/vorticity, advection, and dissipation. Ported from the Codeflare project. Transparent canvas overlay with `pointer-events: none`. Click produces larger splats. Touch-enabled for mobile. Respects `prefers-reduced-motion`.

### Particle Network
Canvas-based. Up to 80 particles drift across the viewport. Connection lines drawn between particles within 120px at very low opacity (0.06 max). Recreated on resize.

### Radial Ripples
Layered on the particle canvas. Random ripples spawn every 1.2s (max 8 active). Each expands from 0 to 500px radius while fading from 0.4 opacity. Cursor movement spawns smaller, faster ripples (300px max, 0.25 opacity). Mobile spawns on scroll.

### Gradient Mesh
Three large blurred CSS blobs (`filter: blur(100px)`) at 15% opacity, drifting on 20-25s keyframe loops.

### Noise Overlay
`body::before` pseudo-element with SVG `feTurbulence` noise at 6% opacity.

### Glassmorphism
Cards use `backdrop-filter: blur(12px)` with semi-transparent backgrounds. On hover: inset glow + triple-layer shadow.

### Parallax
Hero elements scroll at 0.05x to 0.20x speed. Disabled below 900px.

### Scroll Reveals
`.fade-in` elements: `opacity: 0`, `translateY(20px)`, `scale(0.97)`, `blur(4px)` → full visibility on intersection. Staggered at 120ms per element.

## Testing

- **Framework:** Vitest 4.0.18 with jsdom 28.1.0
- **Total tests:** 59 across 7 test files
- **Coverage:** v8 provider, 94% lines / 93% branches / 96% functions / 94% statements
- **Thresholds:** 80% minimum for lines, functions, branches, statements
- **Scope:** `public/js/**/*.js` excluding `main.js`, `splash-cursor.js`, `splash-shaders.js`, `webgl-utils.js`
- **Execution:** GitHub Actions only (1 vCPU container constraint)
- **Architecture:** Pure functions in modules (testable), DOM wiring in `main.js` (excluded)

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| vitest | 4.0.18 | Test runner |
| @vitest/coverage-v8 | 4.0.18 | v8 coverage provider |
| jsdom | 28.1.0 | Browser environment for tests |

## Deployment

GitHub Actions workflow (`.github/workflows/ci.yml`):

1. On push to `main`: run tests with coverage (Node 24)
2. If tests pass: deploy via `wrangler-action@v3` to Cloudflare Workers
3. Custom domain: `marc.graymatter.ch`

Pull requests run tests only (no deploy).
