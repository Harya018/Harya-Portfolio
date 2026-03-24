/**
 * animations.js — All page-level animations and UI interactions
 * Typewriter, stat counters, scroll reveal, skill bars,
 * scroll progress bar, back-to-top button, custom cursor,
 * navbar scroll effect, hamburger menu, project filters, lightbox
 */

// ── Custom Cursor ─────────────────────────────────────────────────
(function initCursor() {
  const cursor = document.getElementById('cursor-glow');
  if (!cursor) return;
  let cx = -100, cy = -100;
  let tx = -100, ty = -100;

  window.addEventListener('mousemove', (e) => {
    tx = e.clientX;
    ty = e.clientY;
  });

  // Smooth follow
  function tickCursor() {
    cx += (tx - cx) * 0.15;
    cy += (ty - cy) * 0.15;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
    requestAnimationFrame(tickCursor);
  }
  tickCursor();

  // Grow on hoverable elements
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, [data-page], .btn, .filter-btn, .project-card, .design-card, .social-icon-btn')) {
      cursor.style.width  = '60px';
      cursor.style.height = '60px';
      cursor.style.opacity = '0.8';
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('a, button, [data-page], .btn, .filter-btn, .project-card, .design-card, .social-icon-btn')) {
      cursor.style.width  = '40px';
      cursor.style.height = '40px';
      cursor.style.opacity = '1';
    }
  });
})();

// ── Scroll Progress Bar ───────────────────────────────────────────
(function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    bar.style.width = Math.min(pct, 100) + '%';
  }, { passive: true });
})();

// ── Back to Top ───────────────────────────────────────────────────
(function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// ── Navbar Scroll Effect ─────────────────────────────────────────
(function initNavbar() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
})();

// ── Hamburger Menu ────────────────────────────────────────────────
(function initHamburger() {
  const btn  = document.getElementById('hamburger-btn');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const open = btn.classList.toggle('open');
    menu.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
  });

  window.closeMobileMenu = () => {
    btn.classList.remove('open');
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  };
})();

// ── Typewriter Effect ─────────────────────────────────────────────
function initTypewriter(el, roles, delay = 90) {
  if (!el) return;
  let roleIdx = 0, charIdx = 0, deleting = false;

  function tick() {
    const role = roles[roleIdx];
    if (!deleting) {
      charIdx++;
      el.textContent = role.slice(0, charIdx);
      if (charIdx === role.length) {
        deleting = true;
        setTimeout(tick, 1600);
        return;
      }
    } else {
      charIdx--;
      el.textContent = role.slice(0, charIdx);
      if (charIdx === 0) {
        deleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
        setTimeout(tick, 300);
        return;
      }
    }
    setTimeout(tick, deleting ? delay / 2 : delay);
  }
  tick();
}

// ── Counter Animation ────────────────────────────────────────────
function animateCounter(el, target, suffix = '', duration = 1500) {
  const start = performance.now();
  const from = 0;

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
    const val = Math.round(from + (target - from) * ease);
    el.textContent = val + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ── Intersection Observer — Scroll Reveal ─────────────────────────
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  items.forEach((el) => io.observe(el));
}

// ── Skill Cloud Animation ─────────────────────────────────────────
function initSkillCloud() {
  const chips = document.querySelectorAll('.skill-chip');
  if (!chips.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('chip-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  chips.forEach((chip) => io.observe(chip));
}

// ── Stat Counters (home page) ────────────────────────────────────
function initStatCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        animateCounter(el, target, suffix);
        io.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach((el) => io.observe(el));
}

// ── Project Filter Bar ────────────────────────────────────────────
function initProjectFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards      = document.querySelectorAll('.project-card[data-tags]');
  if (!filterBtns.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      cards.forEach((card) => {
        const tags = card.dataset.tags || '';
        if (filter === 'all' || tags.toLowerCase().includes(filter.toLowerCase())) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

// ── Design Filter Bar ────────────────────────────────────────────
function initDesignFilter() {
  const filterBtns = document.querySelectorAll('.design-filter-btn');
  const cards      = document.querySelectorAll('.design-card[data-category]');
  if (!filterBtns.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      cards.forEach((card) => {
        const cat = card.dataset.category || '';
        if (filter === 'all' || cat.toLowerCase().includes(filter.toLowerCase())) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// ── Expand Panel (project detail) ────────────────────────────────
function initExpandPanel() {
  const btns = document.querySelectorAll('.btn-expand');
  if (!btns.length) return;

  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const card  = btn.closest('.project-card');
      const panel = card && card.querySelector('.expand-panel');
      if (!panel) return;
      const open = panel.classList.toggle('open');
      btn.textContent = open ? 'Hide Details ▲' : 'View Details ▼';
    });
  });
}

// ── Lightbox ──────────────────────────────────────────────────────
function initLightbox() {
  const overlay   = document.getElementById('lightbox');
  const imgEl     = document.getElementById('lightbox-img');
  const titleEl   = document.getElementById('lightbox-title');
  const descEl    = document.getElementById('lightbox-desc');
  const closeBtn  = document.getElementById('lightbox-close');
  const prevBtn   = document.getElementById('lightbox-prev');
  const nextBtn   = document.getElementById('lightbox-next');
  const cards     = Array.from(document.querySelectorAll('.design-card'));

  if (!overlay || !cards.length) return;

  let current = 0;

  function openLightbox(idx) {
    current = idx;
    const card = cards[idx];
    const img  = card.querySelector('img');
    const h4   = card.querySelector('h4');
    const meta = card.querySelector('.design-meta');

    imgEl.src          = img ? img.src : '';
    imgEl.alt          = img ? img.alt : '';
    titleEl.textContent = h4 ? h4.textContent : '';
    descEl.textContent  = meta ? meta.textContent : '';

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function showNext() { openLightbox((current + 1) % cards.length); }
  function showPrev() { openLightbox((current - 1 + cards.length) % cards.length); }

  cards.forEach((card, idx) => {
    card.addEventListener('click', () => openLightbox(idx));
  });

  closeBtn && closeBtn.addEventListener('click', closeLightbox);
  prevBtn  && prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });
  nextBtn  && nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft')  showPrev();
  });
}

// ── Contact Form Validation ───────────────────────────────────────
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  function showError(input, msg) {
    input.classList.add('error');
    const err = document.getElementById(`${input.id}-error`);
    if (err) { err.textContent = msg; err.classList.add('visible'); }
  }

  function clearError(input) {
    input.classList.remove('error');
    const err = document.getElementById(`${input.id}-error`);
    if (err) err.classList.remove('visible');
  }

  function validateEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    ['name', 'email', 'subject', 'message'].forEach((id) => {
      const el = document.getElementById(`cf-${id}`);
      if (!el) return;
      clearError(el);
      if (!el.value.trim()) {
        showError(el, 'This field is required.');
        valid = false;
      } else if (id === 'email' && !validateEmail(el.value.trim())) {
        showError(el, 'Please enter a valid email address.');
        valid = false;
      }
    });

    if (valid) {
      form.style.display = 'none';
      const ok = document.getElementById('form-success');
      if (ok) ok.classList.add('visible');
    }
  });

  // Live clear errors on input
  form.querySelectorAll('input, textarea').forEach((el) => {
    el.addEventListener('input', () => clearError(el));
  });
}

// ── Master Init — called after each page load ────────────────────
window.initAnimations = function () {
  initScrollReveal();
  initSkillCloud();
  initStatCounters();
  initProjectFilter();
  initDesignFilter();
  initExpandPanel();
  initLightbox();
  initContactForm();
};

// ── Page-specific init ────────────────────────────────────────────
window.initPage = function (page) {
  if (page === 'home') {
    const tw = document.getElementById('typewriter-text');
    if (tw) {
      initTypewriter(tw, [
        'AI And ML Engineer And Graphic designer',
        'LLM Applications Developer',
        'Problem Solver'
      ]);
    }
  }
};

// ── Global UI init (non-page-specific) ───────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  // These run once and persist across page changes
});
