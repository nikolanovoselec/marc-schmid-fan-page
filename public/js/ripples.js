// ripples.js — Radial ripple engine

const RANDOM_MAX_RADIUS = 500;
const CURSOR_MAX_RADIUS = 300;
const RANDOM_OPACITY = 0.4;
const CURSOR_OPACITY = 0.25;
const SPEED = 2;
const SPAWN_INTERVAL = 1200;
const MAX_ACTIVE = 8;

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
    .map((r) => {
      const newRadius = r.radius + r.speed;
      return {
        ...r,
        radius: newRadius,
        opacity: r.opacity * (1 - newRadius / r.maxRadius),
      };
    })
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
  ctx.lineWidth = 2;
  ctx.stroke();
}
