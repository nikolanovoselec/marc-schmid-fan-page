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
