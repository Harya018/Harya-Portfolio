/**
 * router.js — Lightweight SPA Router (no framework)
 * Intercepts nav link clicks, fetches page HTML, injects into #page-content
 * Handles pushState, popstate, active link updates, and fade transitions
 */

(function () {
  const content = document.getElementById('page-content');
  const navLinks = document.querySelectorAll('[data-page]');

  // ── Page map ─────────────────────────────────────────────────
  const PAGE_MAP = {
    'home':            'pages/home.html',
    'education':       'pages/education.html',
    'tech-projects':   'pages/tech-projects.html',
    'design-projects': 'pages/design-projects.html',
    'about':           'pages/about.html',
    'contact':         'pages/contact.html',
  };

  // ── Cache ──────────────────────────────────────────────────
  const cache = {};

  // ── Transition ────────────────────────────────────────────────
  function transitionOut() {
    return new Promise((resolve) => {
      content.style.transition = 'opacity 0.18s ease, transform 0.18s ease';
      content.style.opacity = '0';
      content.style.transform = 'translateY(10px)';
      setTimeout(resolve, 180);
    });
  }

  function transitionIn() {
    content.style.opacity = '0';
    content.style.transform = 'translateY(10px)';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        content.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        content.style.opacity = '1';
        content.style.transform = 'translateY(0)';
      });
    });
  }

  // ── Update Active Nav ─────────────────────────────────────────
  function setActive(page) {
    document.querySelectorAll('[data-page]').forEach((a) => {
      a.classList.toggle('active', a.dataset.page === page);
    });
  }

  // ── Load Page ─────────────────────────────────────────────────
  async function loadPage(page, pushState = true) {
    const path = PAGE_MAP[page];
    if (!path) return;

    setActive(page);

    if (pushState) {
      history.pushState({ page }, '', `#${page}`);
    }

    await transitionOut();

    try {
      let html;
      if (cache[page]) {
        html = cache[page];
      } else {
        const res = await fetch(path);
        if (!res.ok) throw new Error(`Failed to load ${path}`);
        html = await res.text();
        cache[page] = html;
      }

      content.innerHTML = html;
      window.scrollTo({ top: 0 });
      transitionIn();

      // Re-run page-specific init hooks
      if (window.initPage) window.initPage(page);
      // Re-init animations for new content
      if (window.initAnimations) window.initAnimations();
      // Close mobile menu if open
      if (window.closeMobileMenu) window.closeMobileMenu();

    } catch (err) {
      console.error(err);
      content.innerHTML = `
        <div class="container section text-center">
          <h2>Page not found</h2>
          <p style="margin-top:1rem">Could not load <code>${path}</code></p>
        </div>`;
      transitionIn();
    }
  }

  // ── Intercept nav clicks ───────────────────────────────────────
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-page]');
    if (!el) return;
    e.preventDefault();
    const page = el.dataset.page;
    if (page) loadPage(page);
  });

  // ── Browser back/forward ──────────────────────────────────────
  window.addEventListener('popstate', (e) => {
    const page = (e.state && e.state.page) || 'home';
    loadPage(page, false);
  });

  // ── Initial load ──────────────────────────────────────────────
  function getInitialPage() {
    const hash = window.location.hash.replace('#', '');
    return PAGE_MAP[hash] ? hash : 'home';
  }

  // Expose for external use
  window.navigateTo = (page) => loadPage(page);

  // Boot
  const startPage = getInitialPage();
  setActive(startPage);
  loadPage(startPage, false);
})();
