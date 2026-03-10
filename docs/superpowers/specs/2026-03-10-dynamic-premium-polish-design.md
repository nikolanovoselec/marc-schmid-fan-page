# Dynamic Premium Polish — Design Spec

**Date:** 2026-03-10
**Goal:** Full polish pass on the Marc Schmid fan page with a premium/luxury feel. Adds radial ripples, cursor-reactive effects, glassmorphism, parallax depth, refined typography, and smoother motion throughout.

## 1. Background System

### Radial Ripples (Canvas)
- Random spawn: one every 2-4 seconds at random (x, y)
- Expanding circle: 0 → ~300px radius, opacity 0.15 → 0, duration 3s
- Color: `rgba(108, 99, 255, ...)`
- Max 5 active ripples at once

### Cursor-Reactive Ripples (Canvas)
- On mouse move (throttled to 500ms): spawn ripple at cursor
- Max radius ~150px, 1.5s fade, opacity 0.08
- Mobile: spawn on scroll position changes instead

### Noise Texture Overlay (CSS)
- `body::before` with repeating SVG noise pattern at ~3% opacity
- Fixed position, covers viewport, `pointer-events: none`

### Animated Gradient Mesh (CSS)
- 2-3 large blurred blobs (200-400px) drifting slowly
- Colors: accent purple + warm pink
- `filter: blur(100px)`, opacity 0.04-0.06
- Positioned behind hero, stats, quotes sections

## 2. Card & Surface Upgrades

### Glassmorphism
- Cards: `backdrop-filter: blur(12px)`, `background: rgba(18, 18, 26, 0.6)`
- Hover: 1px inset box-shadow with accent at ~10% opacity
- Hover lift: 2px (reduced from 4px), compensated with glow
- Stat card gradient top line: always visible at ~30% opacity

### Quote Cards
- Subtle gradient border effect at low opacity
- Quote mark: faint text-shadow glow

### Status Card
- Faint pulsing border glow synced with status dots
- Slightly brighter background than other cards

## 3. Typography & Visual Hierarchy

### Hero Title
- "Marc" gradient text: `text-shadow: 0 0 40px rgba(108, 99, 255, 0.3)`
- "Schmid": letter-spacing -0.02em (from -0.03em)

### Section Headers
- Gradient underline: centered 60px wide, 2px tall gradient bar below h2
- Section tags: subtle scale-up (1.0 → 1.02) on reveal

### Body Text
- About section: line-height 1.85 (from 1.8)
- Slightly increased paragraph spacing

### Monospace Elements
- Normalize letter-spacing to 0.12em across badge, timestamps, tags

## 4. Motion & Animation

### Parallax Depth Layers
- Hero elements at different scroll multipliers: badge 0.05, title 0.10, subtitle 0.12, CTA 0.15
- Avatar: increase from 0.15 to 0.20
- Disabled on mobile (<900px)

### Staggered Card Reveals
- Entrance: `translateY(20px) scale(0.97) blur(4px)` → `translateY(0) scale(1) blur(0)`
- Stagger: 120ms per card (from 100ms)

### Hover Transitions
- Duration: 0.4s (from 0.3s)
- Easing: `cubic-bezier(0.25, 0.46, 0.45, 0.94)`
- Primary button: `translateY(-1px) scale(1.02)` on hover

### Section Dividers
- `::after` on each section: centered, 200px wide, 1px tall
- Gradient: transparent → accent at 20% → transparent

### Scroll Indicator
- Replace line with CSS chevron arrow
- Gentle opacity fade (1 → 0.3 → 1) over 3s

## Files Modified

- `public/styles.css` — All CSS changes (noise, glassmorphism, typography, dividers, motion)
- `public/script.js` — Ripples, cursor reactivity, parallax depth, stagger logic
- `public/index.html` — Gradient mesh markup, scroll indicator chevron, section divider hooks
