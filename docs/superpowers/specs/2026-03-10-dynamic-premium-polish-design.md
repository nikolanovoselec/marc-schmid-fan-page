# Dynamic Premium Polish — Design Spec

**Date:** 2026-03-10
**Live URL:** https://marc.graymatter.ch
**Goal:** Premium dark-theme fan page for Marc Schmid (Swiss Post Lead Architect) with interactive visual effects, modular codebase, 80%+ test coverage, and Cloudflare Workers deployment.

**Architecture:** Static HTML/CSS/JS deployed to Cloudflare Workers. No bundler — browser-native ES modules. CSS split by section/concern (13 files). JS split into pure-function modules (testable) + DOM wiring in main.js (excluded from coverage). WebGL2 Navier-Stokes fluid simulation for interactive cursor effect.

**Tech Stack:** Vanilla HTML/CSS/JS, ES modules, WebGL2, Vitest 4.x + jsdom 28.x (CI only), Cloudflare Workers, GitHub Actions CI/CD

---

## 1. Visual Effects Layers (back to front)

### Noise Texture Overlay (CSS)
- `body::before` with SVG turbulence noise at 6% opacity
- Fixed position, covers viewport, `pointer-events: none`

### WebGL Fluid Simulation (Canvas)
- Navier-Stokes fluid dynamics ported from Codeflare project
- Fixed full-viewport canvas, transparent background, `pointer-events: none`
- Colorful ink splashes follow mouse/touch with realistic fluid behavior
- Physics: curl → vorticity → divergence → pressure (20 Jacobi iterations) → gradient subtract → advect velocity → advect dye
- Config: SIM_RESOLUTION=128, DYE_RESOLUTION=1440, SPLAT_FORCE=6000, CURL=3
- Graceful fallback: returns null if WebGL unavailable

### Animated Gradient Mesh (CSS)
- 3 large blurred blobs (500-600px), `filter: blur(100px)`, 15% opacity
- Colors: accent purple, drifting via CSS keyframes (20-25s loops)
- Positioned behind hero, stats, quotes sections

### 2D Canvas Particle Network
- Drifting particles (max 80, scaled by viewport area) with connection lines
- O(n^2) distance check, lines drawn when distance < 120px, linear opacity falloff
- Expanding ring ripples: random (every 1.2s, 500px max, 0.4 opacity) + cursor-reactive (300px max, 0.25 opacity, 300ms throttle)
- Mobile: scroll-triggered ripples (800ms throttle)

## 2. Card & Surface Design

### Glassmorphism
- `backdrop-filter: blur(12px)`, `background: rgba(18, 18, 26, 0.6)`
- Hover: triple-layer shadow (inner glow + depth shadow + outer glow), 2px lift
- Stat cards: gradient top bar visible on hover

### Status Card
- Pulsing border glow (4s cycle) synced with status dot blink (2s cycle)
- Slightly brighter background than other cards

### Quote Cards
- Quote mark: 4rem gradient text with faint glow
- Lift on hover with glassmorphism treatment

## 3. Typography & Visual Hierarchy

### Hero Title
- "Marc": gradient text with dual-layer drop-shadow glow (`text-shadow: 0 0 40px rgba(108, 99, 255, 0.3)`)
- Responsive sizing via `clamp(3rem, 5vw, 5.5rem)`

### Section Headers
- Gradient underline: centered gradient bar below h2
- Section tags: monospace pills with accent styling

### Body Text
- Line-height 1.85, Inter font family
- Monospace elements (badges, timestamps, tags): JetBrains Mono, 0.12em letter-spacing

## 4. Motion & Animation

### Parallax Depth Layers
- 5 hero elements at different scroll multipliers: badge 0.05, title 0.10, subtitle 0.12, CTA 0.15, avatar 0.20
- Disabled on mobile (<900px), only active in first viewport height

### Staggered Card Reveals
- Entrance: `translateY(20px) scale(0.97) blur(4px)` → `translateY(0) scale(1) blur(0)`
- 0.8s duration, 120ms stagger per card, IntersectionObserver triggered

### Transitions
- Standard: 0.3s `cubic-bezier(0.4, 0, 0.2, 1)`
- Luxury: 0.4s `cubic-bezier(0.25, 0.46, 0.45, 0.94)`

### Section Dividers
- `::after` pseudo-elements: centered gradient line (transparent → accent 20% → transparent)

### Scroll Indicator
- CSS chevron arrow with opacity fade animation (3s cycle)

### Continuous Animations
- Avatar ring: gradient border rotation (8s loop)
- Avatar glow: radial gradient pulse (4s loop)
- Blob drift: 3 blobs on independent 20-25s loops

## 5. Design System

### Color Palette (`:root` custom properties)
- Background: `#0a0a0f` (page), `#12121a` (cards), `rgba(18,18,26,0.6)` (glass)
- Text: `#e8e8ed` (primary), `#8888a0` (muted), `#555570` (dim)
- Accent: `#6c63ff` (purple), gradient to `#a855f7` (violet)
- Borders: `rgba(255,255,255,0.06)` → `0.12` on hover

### Responsive Breakpoints
- 900px: single-column hero, smaller avatar, hamburger menu
- 600px: smaller title, 2-col stats, single-col quotes
- 400px: single-col stats

### Accessibility
- `prefers-reduced-motion: reduce` hides splash cursor
- Splash canvas: `aria-hidden="true"`
- Semantic HTML sections with proper heading hierarchy

## 6. Testing Strategy

- **Framework:** Vitest 4.0.18 + jsdom 28.1.0 (CI only — 1 vCPU container)
- **Coverage:** v8 provider, 80% thresholds (lines, functions, branches, statements)
- **Tested:** All pure-function modules (nav, parallax, particles, ripples, scroll-reveal, stat-counters, splash-math)
- **Excluded:** DOM wiring (main.js), WebGL modules (splash-cursor, splash-shaders, webgl-utils) — no WebGL context in jsdom
- **Result:** 59 tests, 94% statement coverage

## 7. File Architecture

```
public/
├── index.html            # Shell: 13 CSS links, module JS entry
├── marc.jpg              # Avatar
├── css/ (13 files)       # Split by section/concern, 826 LOC total
└── js/ (11 modules)      # Pure functions + DOM wiring + WebGL, 1,318 LOC total
src/__tests/ (7 files)    # 59 tests, 407 LOC total
```

Total: ~2,550 LOC across 32 files | 3 dev dependencies, zero production dependencies
