# Technical Reference

## Architecture Overview

Static HTML/CSS/JS served by Cloudflare Workers. No server-side logic, no build step, no bundler. Browser-native ES modules (`type="module"`) for JavaScript. Multiple CSS files loaded via `<link>` tags. WebGL2 Navier-Stokes fluid simulation for interactive cursor effect.

```
Browser Request → Cloudflare Workers → Static Assets (./public)
                                        ├── index.html (entry)
                                        ├── css/ (13 stylesheets)
                                        └── js/ (11 ES modules)
```

**Runtime environment:** Modern browsers with ES module support and WebGL2. The page is a single HTML file that loads all CSS and JS modules. No SSR, no hydration, no client-side routing.

---

## CSS Architecture

### Design System (`variables.css`)

All colors, fonts, spacing, and effects are defined as CSS custom properties in `:root`:

| Variable | Value | Usage |
|----------|-------|-------|
| `--bg` | `#0a0a0f` | Page background (near-black) |
| `--bg-card` | `#12121a` | Card background |
| `--bg-card-hover` | `#1a1a25` | Card hover state |
| `--bg-card-glass` | `rgba(18, 18, 26, 0.6)` | Glassmorphism cards |
| `--border` | `rgba(255, 255, 255, 0.06)` | Subtle borders |
| `--border-hover` | `rgba(255, 255, 255, 0.12)` | Hover borders |
| `--text` | `#e8e8ed` | Primary text |
| `--text-muted` | `#8888a0` | Secondary text |
| `--text-dim` | `#555570` | Tertiary/hint text |
| `--accent` | `#6c63ff` | Brand purple |
| `--accent-glow` | `rgba(108, 99, 255, 0.3)` | Glow effects |
| `--accent-soft` | `rgba(108, 99, 255, 0.08)` | Soft accent backgrounds |
| `--gradient` | `linear-gradient(135deg, #6c63ff, #a855f7)` | Primary gradient (purple → violet) |
| `--font` | `'Inter', system fonts` | Body font |
| `--mono` | `'JetBrains Mono', monospace` | Code/label font |
| `--radius` | `16px` | Card border radius |
| `--radius-sm` | `10px` | Smaller border radius |
| `--transition` | `0.3s cubic-bezier(0.4, 0, 0.2, 1)` | Standard transition |
| `--transition-luxury` | `0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)` | Premium transition |
| `--glow-accent` | `0 0 40px rgba(108, 99, 255, 0.3)` | Box-shadow glow |

### CSS Module Reference

| File | Lines | Responsibility |
|------|-------|----------------|
| `variables.css` | 27 | `:root` custom properties (design tokens) |
| `reset.css` | 24 | Box-sizing reset, body font/color/smoothing, particles canvas positioning, `.accent` utility |
| `nav.css` | 94 | Fixed navbar (transparent → blur on scroll via `.scrolled`), nav links with underline hover, hamburger toggle with X animation, mobile slide-down menu |
| `buttons.css` | 32 | `.btn` base (pill shape), `.btn-primary` (gradient + glow shadow, scale on hover), `.btn-outline` (border + color hover) |
| `hero.css` | 161 | Hero flex layout (text + avatar), `.hero-badge` (monospace pill), `.hero-title` (clamp 3-5.5rem, gradient text), `.hero-first` (gradient clip + dual drop-shadow glow), avatar ring (gradient border + rotation), avatar glow (radial gradient + pulse), section headers, scroll chevron |
| `stats.css` | 75 | Stats grid (auto-fit 240px columns), `.stat-card` (gradient top-bar, lift on hover), `.stat-number` (gradient text), progress bars (CSS `--fill` variable, animated width) |
| `about.css` | 86 | Two-column grid (text + sticky card), `.about-lead` (1.5rem), body text (1.85 line-height), `.tag` pills (monospace), `.about-card` (status list with green dot + blink) |
| `quotes.css` | 49 | Quote grid (auto-fit 320px columns), `.quote-card` (lift on hover), `.quote-mark` (4rem gradient text), `.quote-author` (monospace dim) |
| `tribute.css` | 66 | Timeline: vertical gradient line, circle dots (accent border, filled on highlight), `.timeline-time` (monospace accent), `.timeline-event` (muted text, bold on highlight) |
| `footer.css` | 32 | Centered footer, Swiss Post cross SVG (red), monospace uppercase label |
| `animations.css` | 15 | `.fade-in` → `.visible` transition: opacity 0→1, translateY 20px→0, scale 0.97→1, blur 4px→0, all at 0.8s cubic-bezier |
| `effects.css` | 135 | Noise overlay (`body::before`, SVG turbulence, 6%), section dividers (gradient line), glassmorphism (`backdrop-filter: blur(12px)`), gradient blobs (3x, 500-600px, 15% opacity, drifting keyframes), card pulse animation, stat-card gradient bar, section header underline, quote mark glow, splash cursor container (fixed, pointer-events none) |
| `responsive.css` | 30 | 900px: hero column-reverse, smaller avatar, single-column about, show hamburger. 600px: smaller title, 2-col stats, single-col quotes, full-width buttons. 400px: single-col stats |

### Glassmorphism Pattern

Cards use a layered glassmorphism effect:
```css
background: var(--bg-card-glass);           /* semi-transparent */
backdrop-filter: blur(12px);                 /* blur behind */
-webkit-backdrop-filter: blur(12px);         /* Safari */
border: 1px solid var(--border);             /* subtle edge */
```
On hover, adds triple-layer shadow:
```css
box-shadow: inset 0 0 0 1px rgba(108, 99, 255, 0.2),  /* inner glow */
            0 8px 40px rgba(0, 0, 0, 0.4),              /* depth shadow */
            0 0 20px rgba(108, 99, 255, 0.08);           /* outer glow */
```

---

## JavaScript Module Reference

### Module Dependency Graph

```
main.js (entry point, DOM wiring)
├── particles.js      (pure functions)
├── ripples.js         (pure functions)
├── parallax.js        (pure functions + constants)
├── scroll-reveal.js   (pure function)
├── stat-counters.js   (pure functions)
├── nav.js             (pure function)
└── splash-cursor.js   (WebGL simulation)
    ├── splash-shaders.js  (GLSL sources)
    ├── splash-math.js     (pure functions)
    └── webgl-utils.js     (WebGL plumbing)
```

### `main.js` — Entry Point (248 lines)

**Not a module** — contains only DOM wiring code. Excluded from test coverage. Imports pure functions from all modules and wires them to DOM events.

**Initialization sequence** (all IIFEs, execute on module load):

1. **`initNav()`** — Attaches scroll listener (throttled via `requestAnimationFrame`) to toggle `.scrolled` class. Wires hamburger toggle click and mobile menu link closes.

2. **`initScrollReveal()`** — Creates `IntersectionObserver` (threshold 0.1, -50px bottom margin). On intersection, applies staggered `setTimeout` → adds `.visible` class, then unobserves.

3. **`initStatCounters()`** — Two observers:
   - Counter observer (threshold 0.5): reads `data-target` attribute, animates from 0 → target over 2000ms using `interpolateCounter` with `requestAnimationFrame`.
   - Bar observer (threshold 0.3): adds `.animated` class to trigger CSS `width` transition.

4. **`initParallax()`** — Disabled on `max-width: 900px`. Queries 5 hero elements. Scroll listener (throttled) applies `translateY` transforms at different speeds. Only runs when `scrollY < innerHeight`.

5. **`initCanvas()`** — 2D Canvas animation loop:
   - **Resize:** Sets canvas to viewport size, creates particle array.
   - **Draw loop (60fps):** Clears canvas → updates particle positions (immutable) → draws circles → draws connection lines (O(n^2) distance check) → spawns/updates ripples → draws ripple rings.
   - **Mouse listener (300ms throttle):** Spawns cursor-reactive ripples.
   - **Scroll listener (800ms throttle):** Spawns ripples on mobile scroll.

6. **`initSplashCursor()`** — Creates WebGL canvas simulation with configured parameters. Calls `sim.start()` to begin the render loop.

### `particles.js` — Particle Network (36 lines)

Pure functions for a drifting particle network with connection lines.

| Export | Signature | Description |
|--------|-----------|-------------|
| `createParticle(w, h)` | `→ {x, y, vx, vy, size, opacity}` | Random position within bounds, velocity ±0.15, size 0.5-2.5, opacity 0.1-0.4 |
| `updateParticle(p, w, h)` | `→ {…p, x, y}` | Adds velocity, wraps at edges. **Immutable** — returns new object |
| `calcParticleCount(w, h)` | `→ number` | `floor(area / 15000)`, capped at 80 |
| `getConnectionOpacity(dist)` | `→ number` | Linear falloff from 0.06 at dist=0 to 0 at dist=120 |

**Constants:** `MAX_COUNT=80`, `AREA_DIVISOR=15000`, `CONNECTION_DISTANCE=120`, `MAX_CONNECTION_OPACITY=0.06`

### `ripples.js` — Radial Ripple Engine (47 lines)

Pure functions for expanding ring ripples (random + cursor-reactive).

| Export | Signature | Description |
|--------|-----------|-------------|
| `createRipple(x, y, opts?)` | `→ {x, y, radius, maxRadius, opacity, speed}` | Random: 500px max, 0.4 opacity, speed 2. Cursor: 300px max, 0.25 opacity, speed 3 |
| `updateRipples(ripples)` | `→ ripple[]` | Expands radius, decays opacity (`opacity * (1 - newRadius/maxRadius)`), filters expired. **Immutable** |
| `shouldSpawnRipple(last, now, count?)` | `→ boolean` | True if 1200ms elapsed AND count < 8 |
| `drawRipple(ctx, ripple)` | `→ void` | Draws ring stroke on canvas context |

**Constants:** `RANDOM_MAX_RADIUS=500`, `CURSOR_MAX_RADIUS=300`, `RANDOM_OPACITY=0.4`, `CURSOR_OPACITY=0.25`, `SPEED=2`, `SPAWN_INTERVAL=1200`, `MAX_ACTIVE=8`

### `stat-counters.js` — Counter Animation (10 lines)

| Export | Signature | Description |
|--------|-----------|-------------|
| `easeOutCubic(t)` | `→ number` | `1 - (1-t)^3`, clamped to [0,1]. Fast start, slow finish |
| `interpolateCounter(target, progress)` | `→ integer` | `round(easeOutCubic(progress) * target)` |

### `scroll-reveal.js` — Stagger Delay (7 lines)

| Export | Signature | Description |
|--------|-----------|-------------|
| `calcStaggerDelay(index)` | `→ number` | `index * 120` (ms). Element 0 = 0ms, element 1 = 120ms, etc. |

### `parallax.js` — Parallax Depth (13 lines)

| Export | Signature | Description |
|--------|-----------|-------------|
| `LAYER_SPEEDS` | `object` | `{badge: 0.05, title: 0.10, subtitle: 0.12, cta: 0.15, avatar: 0.20}` |
| `calcParallaxOffset(scrollY, speed)` | `→ number` | `scrollY * speed` |

### `nav.js` — Navbar Logic (7 lines)

| Export | Signature | Description |
|--------|-----------|-------------|
| `shouldShowScrolledNav(scrollY)` | `→ boolean` | `scrollY > 50` |

### `splash-cursor.js` — WebGL Fluid Simulation (377 lines)

Navier-Stokes fluid simulation ported from the Codeflare project. Creates colorful ink splashes that follow mouse movement with realistic fluid dynamics.

| Export | Signature | Description |
|--------|-----------|-------------|
| `createSplashSimulation(canvas, config)` | `→ {start(), destroy()} \| null` | Initializes WebGL context, compiles shaders, creates framebuffers, binds event listeners. Returns null if WebGL unavailable |

**Config parameters (set in main.js):**

| Parameter | Value | Effect |
|-----------|-------|--------|
| `SIM_RESOLUTION` | 128 | Velocity field resolution |
| `DYE_RESOLUTION` | 1440 | Color field resolution (higher = sharper) |
| `DENSITY_DISSIPATION` | 3.5 | How quickly color fades |
| `VELOCITY_DISSIPATION` | 2 | How quickly motion dampens |
| `PRESSURE` | 0.1 | Pressure solver intensity |
| `PRESSURE_ITERATIONS` | 20 | Jacobi iteration count (accuracy) |
| `CURL` | 3 | Vorticity confinement strength |
| `SPLAT_RADIUS` | 0.2 | Size of ink splats |
| `SPLAT_FORCE` | 6000 | Velocity impulse from mouse |
| `SHADING` | true | Normal-based lighting |
| `COLOR_UPDATE_SPEED` | 10 | How often colors cycle |
| `TRANSPARENT` | true | Transparent background (overlay) |
| `BACK_COLOR` | `{r:0.035, g:0.035, b:0.043}` | Background color |

**Physics pipeline (per frame):**
1. Compute curl (vorticity field)
2. Apply vorticity confinement forces
3. Compute velocity divergence
4. Clear pressure field
5. Solve pressure via Jacobi iteration (20 passes)
6. Subtract pressure gradient from velocity
7. Advect velocity field
8. Advect dye (color) field
9. Render dye texture to screen with optional shading

**Event handling:**
- `mousedown`: Large splat at click position
- `mousemove`: Continuous splat trail following cursor
- `touchstart/touchmove/touchend`: Mobile touch support
- Colors cycle via HSV with random hue

### `splash-shaders.js` — GLSL Shader Sources (263 lines)

11 exported string constants containing GLSL shader code:

| Shader | Type | Purpose |
|--------|------|---------|
| `baseVertexShaderSource` | Vertex | Computes UV coordinates and neighbor offsets for texel sampling |
| `copyShaderSource` | Fragment | Simple texture copy |
| `clearShaderSource` | Fragment | Multiply texture by scalar (pressure decay) |
| `displayShaderSource` | Fragment | Final display with optional normal-based shading (`#ifdef SHADING`) |
| `splatShaderSource` | Fragment | Gaussian splat: `exp(-dot(p,p)/radius) * color` |
| `advectionShaderSource` | Fragment | Semi-Lagrangian advection with optional manual bilinear filtering |
| `divergenceShaderSource` | Fragment | Computes velocity field divergence |
| `curlShaderSource` | Fragment | Computes vorticity (curl of velocity) |
| `vorticityShaderSource` | Fragment | Applies vorticity confinement forces |
| `pressureShaderSource` | Fragment | Jacobi pressure solver iteration |
| `gradientSubtractShaderSource` | Fragment | Subtracts pressure gradient from velocity (makes divergence-free) |

### `splash-math.js` — Math Utilities (67 lines)

Pure math functions used by the fluid simulation.

| Export | Signature | Description |
|--------|-----------|-------------|
| `hashCode(s)` | `→ integer` | Java-style string hash for shader program caching |
| `getResolution(gl, resolution)` | `→ {width, height}` | Aspect-ratio-aware resolution for framebuffers |
| `scaleByPixelRatio(input)` | `→ integer` | Multiplies by `devicePixelRatio`, floors |
| `wrap(value, min, max)` | `→ number` | Modulo wrap within range |
| `HSVtoRGB(h, s, v)` | `→ {r, g, b}` | HSV to RGB color conversion (all 6 hue sectors) |
| `correctDeltaX(canvas, delta)` | `→ number` | Aspect ratio correction for X delta |
| `correctDeltaY(canvas, delta)` | `→ number` | Aspect ratio correction for Y delta |
| `correctRadius(canvas, radius)` | `→ number` | Aspect ratio correction for splat radius |

### `webgl-utils.js` — WebGL Infrastructure (243 lines)

WebGL context management, shader compilation, and framebuffer objects.

| Export | Description |
|--------|-------------|
| `getWebGLContext(canvas)` | Creates WebGL2 context (WebGL1 fallback). Probes half-float texture support, RGBA/RG/R formats. Returns `{gl, ext}` or null |
| `compileShader(gl, type, source, keywords?)` | Compiles GLSL with optional `#define` keywords |
| `Material` class | Shader program with dynamic keyword switching (caches compiled variants by hash) |
| `Program` class | Static shader program with uniform location lookup |
| `createFBO(gl, w, h, ...)` | Creates framebuffer object with texture attachment. Returns `{texture, fbo, width, height, texelSize, attach(id)}` |
| `createDoubleFBO(gl, w, h, ...)` | Ping-pong framebuffer pair with `read`/`write`/`swap()` for iterative solvers |
| `resizeDoubleFBO(gl, target, ...)` | Resizes DoubleFBO preserving content via copy shader |
| `initBlit(gl)` | Creates fullscreen quad (2 triangles). Returns `blit(target, clear?)` function for rendering to FBO or screen |

---

## HTML Structure

```html
<body>
  <!-- Layer 0: WebGL fluid simulation (fixed, full viewport) -->
  <div class="splash-cursor-container">
    <canvas id="splashCanvas"></canvas>
  </div>

  <!-- Layer 0: CSS gradient blobs (absolute, drifting) -->
  <div class="gradient-blob gradient-blob-1"></div>
  <div class="gradient-blob gradient-blob-2"></div>
  <div class="gradient-blob gradient-blob-3"></div>

  <!-- Layer 0: 2D Canvas particles + ripples (fixed, full viewport) -->
  <canvas id="particles"></canvas>

  <!-- Layer 100: Fixed navbar -->
  <nav class="nav" id="nav">...</nav>
  <div class="mobile-menu" id="mobileMenu">...</div>

  <!-- Layer 1: Content sections (all z-index: 1) -->
  <section class="hero" id="hero">...</section>
  <section class="stats" id="stats">...</section>
  <section class="about" id="about">...</section>
  <section class="quotes" id="quotes">...</section>
  <section class="tribute" id="tribute">...</section>
  <footer class="footer">...</footer>

  <!-- ES Module entry point -->
  <script type="module" src="js/main.js"></script>
</body>
```

**Z-index layers:**
- `z-index: 0` — Background effects (splash canvas, particle canvas, gradient blobs, noise overlay)
- `z-index: 1` — Content sections (hero, stats, about, quotes, tribute, footer)
- `z-index: 99` — Mobile menu
- `z-index: 100` — Navbar

**Pseudo-elements:**
- `body::before` — Noise texture overlay (SVG turbulence, 6% opacity, fixed, `pointer-events: none`)
- `.stat-card::before` — Gradient top bar (hidden → visible on hover)
- `.timeline::before` — Vertical gradient line
- `.timeline-item::before` — Circle dot markers
- `.section-header h2::after` — Gradient underline
- `.stats::after`, `.about::after`, `.quotes::after` — Section dividers

---

## Testing

### Framework and Configuration

```js
// vitest.config.js
{
  test: {
    environment: 'jsdom',      // Browser API simulation
    globals: true,              // No explicit imports needed
    coverage: {
      provider: 'v8',           // Native V8 coverage
      include: ['public/js/**/*.js'],
      exclude: [
        'public/js/main.js',           // DOM wiring only
        'public/js/splash-cursor.js',   // WebGL (no jsdom support)
        'public/js/splash-shaders.js',  // GLSL strings
        'public/js/webgl-utils.js',     // WebGL context
      ],
      thresholds: {
        lines: 80, functions: 80,
        branches: 80, statements: 80,
      },
    },
  },
}
```

### Test Coverage Report

| File | Statements | Branches | Functions | Lines |
|------|-----------|----------|-----------|-------|
| **All files** | **94.06%** | **93.18%** | **95.65%** | **94.04%** |
| nav.js | 100% | 100% | 100% | 100% |
| parallax.js | 100% | 100% | 100% | 100% |
| particles.js | 100% | 100% | 100% | 100% |
| ripples.js | 100% | 100% | 100% | 100% |
| scroll-reveal.js | 100% | 100% | 100% | 100% |
| splash-math.js | ~87% | ~86% | ~88% | ~87% |
| stat-counters.js | 100% | 100% | 100% | 100% |

### Test Inventory (59 total)

#### `splash-math.test.js` (25 tests)

**hashCode:**
- Returns 0 for empty string
- Returns consistent hash for same input
- Returns different hashes for different inputs
- Returns an integer

**getResolution:**
- Returns width > height for landscape aspect ratio (1920x1080)
- Returns height > width for portrait (1080x1920)
- Returns equal dimensions for square (1000x1000)

**scaleByPixelRatio:**
- Scales input by device pixel ratio (1x in jsdom)
- Returns floored integer

**wrap:**
- Wraps value exceeding range (1.5 in [0,1] → 0.5)
- Returns min when range is 0
- Handles negative values (JS modulo preserves sign)
- Returns value unchanged when within range

**HSVtoRGB:**
- Converts red (h=0, s=1, v=1) → {r:1, g:0, b:0}
- Converts green (h=1/3) → g=1
- Converts blue (h=2/3) → b=1
- Converts white (s=0, v=1) → {r:1, g:1, b:1}
- Converts black (v=0) → {r:0, g:0, b:0}
- Handles all 6 hue sectors with valid RGB output

**correctDeltaX:**
- Returns delta unchanged for landscape canvas
- Scales delta by aspect ratio for portrait canvas

**correctDeltaY:**
- Scales delta by inverse aspect ratio for landscape canvas
- Returns delta unchanged for portrait canvas

**correctRadius:**
- Scales radius by aspect ratio for landscape canvas
- Returns radius unchanged for portrait canvas

#### `ripples.test.js` (9 tests)

**createRipple:**
- Creates ripple at given coordinates (x, y, radius=0)
- Creates cursor ripple with smaller maxRadius (<=300) and opacity (<=0.25)

**updateRipples:**
- Expands ripple radius by speed amount
- Reduces opacity as ripple expands (decay formula)
- Removes ripples that exceed maxRadius
- Never mutates input array (returns new array, original unchanged)

**shouldSpawnRipple:**
- Returns true when enough time elapsed (>= 1200ms)
- Returns false when too soon (< 1200ms)
- Returns false when max active ripple count reached (>= 8)

#### `particles.test.js` (9 tests)

**createParticle:**
- Creates particle with x,y within bounds, positive size and opacity

**updateParticle:**
- Moves particle by velocity (x+vx, y+vy)
- Wraps particle at edges (x>w → 0, y<0 → h)
- Never mutates original object (returns new)

**calcParticleCount:**
- Caps at 80 regardless of viewport size
- Scales with viewport area (larger → more particles)

**getConnectionOpacity:**
- Returns 0 for distance >= 120 (CONNECTION_DISTANCE)
- Returns positive value for close particles
- Returns higher opacity for closer particles (linear falloff)

#### `stat-counters.test.js` (7 tests)

**easeOutCubic:**
- Returns 0 at t=0
- Returns 1 at t=1
- Progresses faster early (0.5 → >0.5 due to ease-out curve)
- Clamps negative input to 0, >1 input to 1

**interpolateCounter:**
- Returns 0 at progress=0
- Returns target at progress=1
- Returns rounded integer at any progress

#### `parallax.test.js` (4 tests)

- Offset is 0 when scrollY=0
- Scales linearly: offset(100, 0.1) = 10, offset(100, 0.2) = 20
- LAYER_SPEEDS defines all 5 hero layers (badge, title, subtitle, cta, avatar)
- Avatar speed is greatest (deepest parallax)

#### `nav.test.js` (3 tests)

- Returns false when scrollY < 50
- Returns true when scrollY > 50
- Returns false at exactly 50 (threshold is exclusive)

#### `scroll-reveal.test.js` (2 tests)

- Returns 0ms delay for index 0
- Increments by 120ms per index (1 → 120, 3 → 360)

---

## Visual Effects Pipeline

### Render Order (back to front)

1. **`body::before`** — Fixed noise texture (SVG turbulence, 6% opacity)
2. **Splash cursor** — Fixed WebGL canvas (fluid simulation, transparent background)
3. **Gradient blobs** — Absolute positioned CSS blobs (blur(100px), 15% opacity, drifting)
4. **Particle canvas** — Fixed 2D canvas (particles + ripples + connection lines)
5. **Content sections** — Normal flow HTML content (z-index: 1)
6. **Navbar** — Fixed position (z-index: 100, blur backdrop on scroll)

### Animation Inventory

| Animation | Type | Duration | Trigger |
|-----------|------|----------|---------|
| Particle drift | Canvas rAF | Continuous | Page load |
| Ripple expand | Canvas rAF | ~2-3s per ripple | Timer (1.2s) + mouse + scroll |
| Fluid splash | WebGL rAF | Continuous | Mouse/touch interaction |
| Fade-in reveal | CSS transition | 0.8s | IntersectionObserver |
| Counter animate | JS rAF | 2s | IntersectionObserver |
| Bar fill | CSS transition | 1.5s | IntersectionObserver |
| Avatar ring rotate | CSS keyframe | 8s loop | Continuous |
| Avatar glow pulse | CSS keyframe | 4s loop | Continuous |
| Status dot blink | CSS keyframe | 2s loop | Continuous |
| Blob drift (x3) | CSS keyframe | 20-25s loop | Continuous |
| Card pulse border | CSS keyframe | 4s loop | Continuous |
| Scroll chevron | CSS keyframe | 3s loop | Continuous |
| Parallax depth | JS scroll | Per frame | Scroll event |
| Nav blur | CSS transition | 0.3s | Scroll > 50px |

---

## Deployment

### CI/CD Pipeline (`.github/workflows/ci.yml`)

```
Push to main → Test Job (Node 24) → Deploy Job (Cloudflare Workers)
                  │                        │
                  ├─ npm ci                ├─ actions/checkout
                  └─ npm run test:coverage └─ wrangler-action@v3
```

- **Test job:** Runs on every push and PR. Uses Node 24 with `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true`. Executes `vitest run --coverage` which enforces 80% thresholds.
- **Deploy job:** Only on `main` branch, only after test job passes. Uses `cloudflare/wrangler-action@v3` with `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets.

### Cloudflare Workers Configuration (`wrangler.toml`)

```toml
name = "marc-schmid-fan-page"
compatibility_date = "2026-03-01"
routes = [{ pattern = "marc.graymatter.ch", custom_domain = true }]

[assets]
directory = "./public"
```

All files in `./public` are served as static assets. No Workers script — purely static hosting with Cloudflare's edge network.

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `vitest` | 4.0.18 | Test runner with ESM support |
| `@vitest/coverage-v8` | 4.0.18 | Native V8 code coverage |
| `jsdom` | 28.1.0 | DOM/browser API simulation for tests |

**Zero production dependencies.** All code runs natively in the browser. No bundler, no transpiler, no polyfills.

---

## Statistics

| Metric | Value |
|--------|-------|
| Total files | 32 |
| Total lines of code | ~2,550 |
| CSS files | 13 (826 LOC) |
| JS modules | 11 (1,318 LOC) |
| Test files | 7 (407 LOC) |
| Total tests | 59 |
| Test coverage | 94% statements, 93% branches, 96% functions, 94% lines |
| Largest JS file | `splash-cursor.js` (377 LOC) |
| Largest CSS file | `hero.css` (161 LOC) |
| WebGL shaders | 11 |
| CSS animations | 14 |
| Dependencies | 3 (dev only) |
