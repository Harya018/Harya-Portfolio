/**
 * background.js — Animated canvas background
 * Features: dot grid, floating tech icons, mouse parallax, rare laser lines
 * Uses requestAnimationFrame only — never setInterval
 * Canvas lives in index.html outside #page-content so it NEVER resets on page nav.
 */

(function () {
  // Guard: only initialise once — prevents duplicate loops if script is ever re-executed
  if (window.__bgCanvasRunning) return;
  window.__bgCanvasRunning = true;

  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // ── Resize ──────────────────────────────────────────────────
  let W = window.innerWidth;
  let H = window.innerHeight;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // ── Mouse ────────────────────────────────────────────────────
  let mouse = { x: W / 2, y: H / 2, moved: false };
  let speedBoost = 1;

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.moved = true;
    speedBoost = 1.8;
    clearTimeout(mouse._t);
    mouse._t = setTimeout(() => { speedBoost = 1; }, 600);
  });

  // ── Tech Icon Glyphs (specified set) ─────────────────────────
  const GLYPHS = ['Python', 'C++', 'Java', 'PyTorch', 'SQL', 'Git', 'AI', 'ML', 'LLM', '{ }', '</>', '[ ]'];
  
  // Neon Palette
  const COLORS = ['#0066ff', '#00e5ff', '#bd00ff', '#ff007f', '#00ff88'];

  // ── Particles ────────────────────────────────────────────────
  const PARTICLE_COUNT = 38;

  function randBetween(a, b) {
    return a + Math.random() * (b - a);
  }

  function createParticle() {
    return {
      x: randBetween(0, W),
      y: randBetween(0, H),
      vx: randBetween(-0.2, 0.2), // slow drift
      vy: randBetween(-0.2, 0.2),
      angle: randBetween(0, Math.PI * 2),
      angularV: randBetween(-0.005, 0.005),
      glyph: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: randBetween(12, 18),
      opacity: randBetween(0.08, 0.3),
      opacityDir: Math.random() < 0.5 ? 1 : -1,
      parallaxFactor: randBetween(0.005, 0.02),
    };
  }

  const particles = Array.from({ length: PARTICLE_COUNT }, createParticle);

  // ── Dot Grid ─────────────────────────────────────────────────
  const DOT_SPACING = 40;
  const DOT_OPACITY = 0.08;
  const DOT_RADIUS  = 1;

  function drawDotGrid() {
    ctx.save();
    ctx.fillStyle = `rgba(0, 102, 255, ${DOT_OPACITY})`;
    for (let x = (W % DOT_SPACING) / 2; x < W; x += DOT_SPACING) {
      for (let y = (H % DOT_SPACING) / 2; y < H; y += DOT_SPACING) {
        ctx.beginPath();
        ctx.arc(x, y, DOT_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // ── Icon Particles ───────────────────────────────────────────
  function drawIcons() {
    const cx = W / 2;
    const cy = H / 2;
    const dx = (mouse.x - cx);
    const dy = (mouse.y - cy);

    particles.forEach((p) => {
      // Breathe opacity strictly bounded between 0.08 and 0.3
      p.opacity += 0.001 * p.opacityDir;
      if (p.opacity >= 0.3) { p.opacity = 0.3; p.opacityDir = -1; }
      if (p.opacity <= 0.08) { p.opacity = 0.08; p.opacityDir = 1; }

      // Move (speedBoost applied on mouse movement)
      p.x += p.vx * speedBoost;
      p.y += p.vy * speedBoost;

      // Parallax nudge
      p.x += dx * p.parallaxFactor * 0.01;
      p.y += dy * p.parallaxFactor * 0.01;

      // Wrap around edges cleanly
      if (p.x < -50) p.x = W + 50;
      if (p.x > W + 50) p.x = -50;
      if (p.y < -50) p.y = H + 50;
      if (p.y > H + 50) p.y = -50;

      // Rotate gently
      p.angle += p.angularV;

      // Draw text glyph
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.font = `500 ${p.size}px var(--font-mono), monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.glyph, 0, 0);
      ctx.restore();
    });
  }

  // ── Laser Lines ─────────────────────────────────────────────
  const MAX_LASERS = 2;
  const lasers = [];
  let laserCooldown = 0;

  function spawnLaser() {
    if (lasers.length >= MAX_LASERS || laserCooldown > 0) return;
    laserCooldown = 420 + Math.random() * 480; 

    const vertical = Math.random() < 0.3;
    let x1, y1, x2, y2;
    if (vertical) {
      x1 = x2 = randBetween(0, W);
      y1 = -10; y2 = H + 10;
    } else {
      y1 = y2 = randBetween(0, H);
      x1 = -10; x2 = W + 10;
    }
    
    lasers.push({
      x1, y1, x2, y2,
      opacity: 0,
      phase: 'in', 
      holdFrames: 60,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    });
  }

  function drawLasers() {
    if (laserCooldown > 0) laserCooldown--;
    spawnLaser();

    for (let i = lasers.length - 1; i >= 0; i--) {
      const l = lasers[i];

      if (l.phase === 'in') {
        l.opacity += 0.02;
        if (l.opacity >= 0.4) { l.opacity = 0.4; l.phase = 'hold'; }
      } else if (l.phase === 'hold') {
        l.holdFrames--;
        if (l.holdFrames <= 0) l.phase = 'out';
      } else {
        l.opacity -= 0.015;
        if (l.opacity <= 0) { lasers.splice(i, 1); continue; }
      }

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(l.x1, l.y1);
      ctx.lineTo(l.x2, l.y2);
      ctx.globalAlpha = l.opacity;
      ctx.strokeStyle = l.color;
      ctx.lineWidth = 1;
      ctx.shadowColor = l.color;
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.restore();
    }
  }

  // ── Animation Loop ───────────────────────────────────────────
  function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, W, H);
    drawDotGrid();
    drawIcons();
    drawLasers();
  }

  animate();
})();
