# Marc Schmid Fan Page

A tribute page celebrating Marc Schmid, Lead Architect at Swiss Post. Dark, premium, animated single-page site.

**Live:** [marc.graymatter.ch](https://marc.graymatter.ch)

## What It Does

- Celebrates Marc Schmid's role as the indispensable architect of Swiss Post
- Animated particle network with radial ripple effects
- Cursor-reactive visual feedback
- Parallax depth layers on scroll
- Glassmorphism card surfaces
- Animated stat counters and staggered scroll reveals

## Tech Stack

- Vanilla HTML, CSS, JavaScript (no framework, no bundler)
- ES modules (native browser `type="module"`)
- Cloudflare Workers (static asset hosting)
- Vitest + jsdom for testing (CI only)

## Project Structure

```
public/
  index.html          Single-page shell
  css/                13 modular CSS files
  js/                 7 ES modules
src/__tests__/        Unit tests for all JS modules
```

See [TECHNICAL.md](TECHNICAL.md) for full architecture details.

## Development

This is a static site — no build step required. Open `public/index.html` in a browser or deploy to Cloudflare Workers.

**Tests run in GitHub Actions only** (not locally). Push to `main` or open a PR to trigger the test + deploy pipeline.

## Deployment

Automatic on push to `main`:

1. **Tests** run first (Vitest with 80% coverage threshold)
2. **Deploy** to Cloudflare Workers (only if tests pass)

Requires GitHub secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
