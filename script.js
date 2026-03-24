// NAV SCROLL
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 60));

// PAGE ROUTER
function showPage(id) {
  closeMobileMenu();
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  const el = document.getElementById('page-' + id);
  if (el) el.style.display = 'block';
  window.scrollTo({top: 0, behavior: 'smooth'});
  // re-trigger reveals on catalog pages
  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.on)').forEach(el => obs.observe(el));
  }, 100);
}

function scrollToSection(id) {
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({behavior: 'smooth'});
  }, 50);
}

// SMOOTH SCROLL (home page anchors)
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({behavior: 'smooth'}); }
  });
});

// SCROLL REVEAL
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); obs.unobserve(e.target); } });
}, {threshold: 0.08});
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

// MOBILE MENU
function toggleMobileMenu() {
  const nav = document.getElementById('mobile-nav');
  const btn = document.getElementById('hamburger-btn');
  nav.classList.toggle('mobile-open');
  btn.classList.toggle('open');
  document.body.style.overflow = nav.classList.contains('mobile-open') ? 'hidden' : '';
}
function closeMobileMenu() {
  const nav = document.getElementById('mobile-nav');
  const btn = document.getElementById('hamburger-btn');
  if (nav && nav.classList.contains('mobile-open')) {
    nav.classList.remove('mobile-open');
    btn.classList.remove('open');
    document.body.style.overflow = '';
  }
}
// Close mobile menu on nav clicks
document.querySelectorAll('#mobile-nav a, #mobile-nav button').forEach(el => {
  el.addEventListener('click', () => setTimeout(closeMobileMenu, 100));
});

// CATALOG FILTERS (smooth hide/show)
function filterCat(btn, gridId, sub) {
  const grid = document.getElementById('grid-' + gridId);
  if (!grid) return;
  btn.closest('.catalog-page-filters').querySelectorAll('.catalog-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const cards = grid.querySelectorAll('.cat-prod-card');
  cards.forEach(c => {
    if (!sub || c.dataset.sub === sub) {
      c.classList.remove('filtered-out');
      c.style.display = '';
    } else {
      c.classList.add('filtered-out');
      setTimeout(() => { if (c.classList.contains('filtered-out')) c.style.display = 'none'; }, 400);
    }
  });
}

// BACK TO TOP
const backToTopBtn = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  backToTopBtn.classList.toggle('visible', window.scrollY > 400);
});


// ═══════ PRODUCT DATA SYSTEM ═══════
let allProducts = [];

// Card HTML renderer
function renderProductCard(p, delay) {
  const delayClass = delay > 0 ? ' d' + Math.min(delay, 4) : '';
  const badgeHTML = p.badge ? '<span class="cat-prod-badge ' + p.badge + '">' + 
    (p.badge === 'novo' ? 'Novo' : p.badge === 'promo' ? 'Promoção' : 'Destaque') + '</span>' : '';
  const waMsg = encodeURIComponent('Olá! Gostaria de saber o preço do ' + p.name + '. Vi no site e me interessei!');
  
  return '<div class="cat-prod-card reveal on' + delayClass + '" data-sub="' + p.subcategory + '" data-name="' + p.name.toLowerCase() + '">' +
    '<div class="cat-prod-img-wrap">' +
      '<img class="cat-prod-img" src="' + p.image + '" alt="' + p.name + '" loading="lazy"/>' +
      (p.hoverImage ? '<img class="cat-prod-img-hover" src="' + p.hoverImage + '" alt="' + p.name + ' - alternativa" loading="lazy"/>' : '') +
      badgeHTML +
      '<a href="https://wa.me/5511940379082?text=' + waMsg + '" target="_blank" class="cat-prod-wa" aria-label="WhatsApp - ' + p.name + '">' +
        '<svg width="17" height="17" fill="#25D366"><use href="#wa-icon"/></svg>' +
      '</a>' +
    '</div>' +
    '<div class="cat-prod-info">' +
      '<div class="cat-prod-tag">' + p.tag + '</div>' +
      '<div class="cat-prod-name">' + p.name + '</div>' +
      '<div class="cat-prod-price-hint">A partir de ' + p.price + '</div>' +
      '<div class="cat-prod-cta">Consultar preço <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></div>' +
    '</div>' +
  '</div>';
}

// Render products into a grid
function renderGrid(gridId, category) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  const products = allProducts.filter(p => p.category === category);
  grid.innerHTML = products.map((p, i) => renderProductCard(p, i % 4)).join('');
  // Re-trigger reveal
  grid.querySelectorAll('.reveal:not(.on)').forEach(el => obs.observe(el));
}

// Fetch and initialize products
fetch('produtos.json')
  .then(r => r.json())
  .then(data => {
    allProducts = data;
    renderGrid('grid-fem', 'feminino');
    renderGrid('grid-masc', 'masculino');
    renderGrid('grid-inf', 'infantil');
    renderGrid('grid-calc', 'calcados');
  })
  .catch(err => console.warn('Could not load produtos.json:', err));

// ═══════ SEARCH SYSTEM ═══════
let searchTimeout = null;

function toggleSearch() {
  const searchBox = document.getElementById('navSearch');
  const input = document.getElementById('searchInput');
  searchBox.classList.toggle('active');
  if (searchBox.classList.contains('active')) {
    input.focus();
  } else {
    input.value = '';
    closeSearch();
  }
}

function closeSearch() {
  const overlay = document.getElementById('searchOverlay');
  overlay.classList.remove('active');
  document.getElementById('searchInput').value = '';
  document.getElementById('navSearch').classList.remove('active');
  document.body.style.overflow = '';
}

document.getElementById('searchInput').addEventListener('input', function(e) {
  clearTimeout(searchTimeout);
  const query = e.target.value.trim().toLowerCase();
  
  if (query.length < 2) {
    document.getElementById('searchOverlay').classList.remove('active');
    document.body.style.overflow = '';
    return;
  }

  searchTimeout = setTimeout(() => {
    const results = allProducts.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.tag.toLowerCase().includes(query) ||
      p.category.includes(query) ||
      p.subcategory.includes(query)
    );

    const overlay = document.getElementById('searchOverlay');
    const grid = document.getElementById('searchResultsGrid');
    const noResults = document.getElementById('searchNoResults');
    const countEl = document.getElementById('searchCount');

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (results.length > 0) {
      grid.innerHTML = results.map((p, i) => renderProductCard(p, i % 4)).join('');
      grid.style.display = '';
      noResults.style.display = 'none';
      countEl.textContent = results.length + ' produto' + (results.length !== 1 ? 's' : '') + ' encontrado' + (results.length !== 1 ? 's' : '');
    } else {
      grid.style.display = 'none';
      noResults.style.display = '';
      countEl.textContent = 'Nenhum resultado';
    }
  }, 250);
});

// Close search on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeSearch();
});


// DARK MODE TOGGLE
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  const newTheme = isDark ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeUI(newTheme);
}

function updateThemeUI(theme) {
  const toggle = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');
  const label = document.getElementById('themeLabel');
  const isDark = theme === 'dark';
  
  toggle.setAttribute('aria-checked', isDark ? 'true' : 'false');
  label.textContent = isDark ? 'Claro' : 'Escuro';
  icon.innerHTML = isDark
    ? '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'
    : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
}

// Apply saved theme on load
(function() {
  const saved = localStorage.getItem('theme') || 'light';
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    updateThemeUI('dark');
  }
})();

// ═══════ LGPD / COOKIE CONSENT ═══════
(function() {
  const consent = localStorage.getItem('lgpd-consent');
  const banner = document.getElementById('lgpdBanner');
  if (!banner) return;
  if (!consent) {
    setTimeout(() => banner.classList.add('visible'), 1500);
  } else {
    banner.classList.add('hidden');
  }
})();

function acceptCookies() {
  localStorage.setItem('lgpd-consent', 'accepted');
  const banner = document.getElementById('lgpdBanner');
  banner.classList.remove('visible');
  setTimeout(() => banner.classList.add('hidden'), 500);
}

function rejectCookies() {
  localStorage.setItem('lgpd-consent', 'rejected');
  const banner = document.getElementById('lgpdBanner');
  banner.classList.remove('visible');
  setTimeout(() => banner.classList.add('hidden'), 500);
}
