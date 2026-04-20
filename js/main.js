(() => {
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  const header = document.querySelector('[data-header]');
  const navToggle = document.querySelector('[data-nav-toggle]');
  const navMenu = document.querySelector('[data-nav-menu]');
  const toTop = document.querySelector('[data-to-top]');

  const setHeaderHeightVar = () => {
    if (!header) return;
    const h = Math.max(56, Math.round(header.getBoundingClientRect().height));
    document.documentElement.style.setProperty('--header-h', `${h}px`);
  };

  const openMenu = () => {
    if (!navMenu || !navToggle) return;
    navMenu.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
  };

  const closeMenu = () => {
    if (!navMenu || !navToggle) return;
    navMenu.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  };

  const toggleMenu = () => {
    if (!navMenu) return;
    const isOpen = navMenu.classList.contains('is-open');
    if (isOpen) closeMenu();
    else openMenu();
  };

  const getHeaderOffset = () => {
    const h = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h'));
    return Number.isFinite(h) ? h : 72;
  };

  const scrollToHash = (hash) => {
    if (!hash || !hash.startsWith('#')) return;
    const el = document.querySelector(hash);
    if (!el) return;

    const top = el.getBoundingClientRect().top + window.pageYOffset - getHeaderOffset() - 12;
    window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };

  const initNavLinks = () => {
    const links = Array.from(document.querySelectorAll('a[href^="#"]'));

    for (const a of links) {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href') || '';
        if (href === '#' || !href.startsWith('#')) return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        history.pushState(null, '', href);
        scrollToHash(href);
        closeMenu();
      });
    }
  };

  const initScrollSpy = () => {
    const navLinks = Array.from(document.querySelectorAll('.nav-link[href^="#"]'));
    const sections = navLinks
      .map((a) => document.querySelector(a.getAttribute('href')))
      .filter(Boolean);

    if (!navLinks.length || !sections.length || !('IntersectionObserver' in window)) return;

    const byId = new Map(
      navLinks.map((a) => [a.getAttribute('href')?.slice(1), a])
    );

    const clearActive = () => {
      for (const a of navLinks) a.classList.remove('is-active');
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0));

        if (!visible.length) return;
        const id = visible[0].target?.id;
        if (!id) return;

        clearActive();
        const link = byId.get(id);
        if (link) link.classList.add('is-active');
      },
      {
        root: null,
        threshold: [0.2, 0.35, 0.5],
        rootMargin: `-${Math.round(getHeaderOffset())}px 0px -55% 0px`,
      }
    );

    for (const s of sections) observer.observe(s);

    const onResize = () => {
      setHeaderHeightVar();
      observer.disconnect();
      for (const s of sections) observer.observe(s);
    };

    window.addEventListener('resize', onResize, { passive: true });
  };

  const initToTop = () => {
    if (!toTop) return;

    const update = () => {
      if (window.scrollY > 600) toTop.classList.add('is-visible');
      else toTop.classList.remove('is-visible');
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    toTop.addEventListener('click', () => scrollToHash('#home'));
  };

  const initFooterYear = () => {
    const el = document.querySelector('[data-year]');
    if (el) el.textContent = String(new Date().getFullYear());
  };

  const initPplCycles = () => {
    const grid = document.querySelector('[data-cycle-grid]');
    if (!grid) return;

    const cycles = [
      {
        label: 'Siklus 1',
        perangkat: 90,
        mengajar: 90,
        catatan: 'Siklus 1 menunjukkan kesiapan awal yang baik. Fokus berikutnya: penguatan asesmen formatif dan pengelolaan waktu.',
      },
      {
        label: 'Siklus 2',
        perangkat: 90,
        mengajar: 90,
        catatan: 'Siklus 2 mengalami peningkatan pada pelaksanaan pembelajaran dan keterlibatan siswa.',
      },
      {
        label: 'Siklus 3',
        perangkat: 90,
        mengajar: 90,
        catatan: 'Siklus 3 menunjukkan perkembangan positif dalam refleksi, penyesuaian strategi, dan komunikasi pembelajaran.',
      },
    ];

    grid.innerHTML = cycles
      .map(
        (c) => `
          <article class="cycle">
            <div class="cycle-head">
              <h3 class="cycle-title">Data Evaluasi</h3>
              <span class="cycle-pill">${c.label}</span>
            </div>

            <div class="cycle-kv" aria-label="Nilai">
              <div class="kvbox">
                <div class="kvlabel">Nilai Perangkat</div>
                <div class="kvvalue">${c.perangkat}</div>
              </div>
              <div class="kvbox">
                <div class="kvlabel">Praktik Mengajar</div>
                <div class="kvvalue">${c.mengajar}</div>
              </div>
            </div>

            <div class="cycle-note">
              <div class="cycle-note-title">Catatan Guru Pamong</div>
              <p class="cycle-note-text">${c.catatan}</p>
            </div>
          </article>
        `
      )
      .join('');
  };

  const initDocLinks = () => {
    const links = Array.from(document.querySelectorAll('[data-doc-link]'));
    for (const a of links) {
      const href = a.getAttribute('href');
      if (!href || href === '#') {
        a.addEventListener('click', (e) => {
          e.preventDefault();
          alert('Ganti href tombol ini dengan link dokumenmu (Drive/PDF).');
        });
      }
    }
  };

  const init = () => {
    setHeaderHeightVar();
    initNavLinks();
    initScrollSpy();
    initToTop();
    initFooterYear();
    initPplCycles();
    initDocLinks();

    navToggle?.addEventListener('click', toggleMenu);

    document.addEventListener('click', (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (!navMenu?.classList.contains('is-open')) return;
      if (target.closest('[data-nav-menu]') || target.closest('[data-nav-toggle]')) return;
      closeMenu();
    });

    window.addEventListener('resize', setHeaderHeightVar, { passive: true });

    if (location.hash) {
      setTimeout(() => scrollToHash(location.hash), 0);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
