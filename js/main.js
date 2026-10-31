(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  // Keep real URLs and normal browser navigation for SEO/accessibility.
  // The transition is purely decorative and never hijacks external, modified or new-tab links.
  document.querySelectorAll('a[href]').forEach(link => {
    link.addEventListener('click', event => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || link.target === '_blank' ||
          event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
          link.origin !== location.origin) return;
      document.body.classList.add('page-leaving');
    });
  });
})();
