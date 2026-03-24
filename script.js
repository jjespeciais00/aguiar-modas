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
      '<button class="cat-prod-wa" aria-label="Ver ' + p.name + '" onclick="event.stopPropagation(); window.openModal(\'' + p.id + '\')" style="background:var(--red); color:#fff; border:none; display:flex;align-items:center;justify-content:center;">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>' +
      '</button>' +
    '</div>' +
    '<div class="cat-prod-info">' +
      '<div class="cat-prod-tag">' + p.tag + '</div>' +
      '<div class="cat-prod-name">' + p.name + '</div>' +
      '<div class="cat-prod-price-hint">A partir de ' + p.price + '</div>' +
      '<button class="cat-prod-cta" onclick="window.openModal(\'' + p.id + '\')" style="background:none;border:none;cursor:pointer;padding:0;width:100%;text-align:left;">Comprar Agora <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button>' +
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


// ═══════ E-COMMERCE LOGIC ═══════

// --- PWA Service Worker ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .catch(err => console.log('SW Registration failed: ', err));
  });
}

// --- State ---
let cart = JSON.parse(localStorage.getItem('am_cart')) || [];
let activeModalProduct = null;
let activeModalSize = 'G';

function saveCart() {
  localStorage.setItem('am_cart', JSON.stringify(cart));
  updateCartBadge();
  renderCart();
}

// --- Cart Sidebar ---
function toggleCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  const isActive = sidebar.classList.contains('active');
  
  if (isActive) {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  } else {
    sidebar.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderCart();
  }
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  const btn = document.querySelector('.nav-cart-btn');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  badge.textContent = totalItems;
  
  if (totalItems > 0) {
    btn.classList.add('bump');
    setTimeout(() => btn.classList.remove('bump'), 300);
  }
}

// Parse "R$ 49,90" into numeric 49.90
function parsePrice(priceStr) {
  if (!priceStr) return 0;
  return parseFloat(priceStr.replace(/[R$\s]/g, '').replace(',', '.'));
}
function formatPrice(num) {
  return 'R$ ' + num.toFixed(2).replace('.', ',');
}

function renderCart() {
  const container = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        <p>Sua sacola está vazia.</p>
        <button onclick="toggleCart()" style="padding:10px 20px; background:var(--red); color:#fff; border:none; border-radius:100px; cursor:pointer; font-weight:600">Continuar Comprando</button>
      </div>`;
    totalEl.textContent = 'R$ 0,00';
    return;
  }
  
  let total = 0;
  container.innerHTML = cart.map((item, index) => {
    const itemTotal = parsePrice(item.price) * item.quantity;
    total += itemTotal;
    return `
      <div class="cart-item">
        <img src="${item.image}" class="cart-item-img" alt="${item.name}">
        <div class="cart-item-details">
          <div>
            <div class="cart-item-title">${item.name}</div>
            <div class="cart-item-meta">Tamanho: ${item.size}</div>
          </div>
          <div class="cart-item-bottom">
            <div class="cart-item-price">${formatPrice(itemTotal)}</div>
            <div class="qty-controls">
              <button class="qty-btn" onclick="updateQty(${index}, -1)">–</button>
              <div class="qty-val">${item.quantity}</div>
              <button class="qty-btn" onclick="updateQty(${index}, 1)">+</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  totalEl.textContent = formatPrice(total);
}

function updateQty(index, change) {
  cart[index].quantity += change;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }
  saveCart();
}

// --- Quick View Modal ---
window.openModal = function(productId) {
  const p = allProducts.find(item => item.id === productId);
  if (!p) return;
  activeModalProduct = p;
  
  document.getElementById('modalImg').src = p.image;
  document.getElementById('modalTag').textContent = p.tag;
  document.getElementById('modalName').textContent = p.name;
  document.getElementById('modalPrice').textContent = p.price;
  
  // reset sizes
  document.querySelectorAll('.size-btn').forEach(b => {
    b.classList.remove('active');
    if (b.textContent === 'G') {
      b.classList.add('active');
      activeModalSize = 'G';
    }
  });

  document.getElementById('quickModalOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

window.closeModal = function(event) {
  if (event && event.target.id !== 'quickModalOverlay') return;
  document.getElementById('quickModalOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

window.selectSize = function(btn, size) {
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeModalSize = size;
}

window.addToCartFromModal = function() {
  if (!activeModalProduct) return;
  
  const existing = cart.find(i => i.id === activeModalProduct.id && i.size === activeModalSize);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: activeModalProduct.id,
      name: activeModalProduct.name,
      price: activeModalProduct.price,
      image: activeModalProduct.image,
      size: activeModalSize,
      quantity: 1
    });
  }
  
  saveCart();
  closeModal();
  showToast(`${activeModalProduct.name} adicionado à sacola!`);
  
  // Button success animation
  const btn = document.querySelector('.modal-add-btn');
  const oldText = btn.innerHTML;
  btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Adicionado';
  btn.classList.add('success');
  
  setTimeout(() => {
    btn.innerHTML = oldText;
    btn.classList.remove('success');
    closeModal();
  }, 800);
}

// --- Toasts ---
function showToast(msg) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <div class="toast-icon">✓</div>
    <div>${msg}</div>
    <div class="toast-progress"></div>
  `;
  container.appendChild(toast);
  
  // Trigger reflow
  toast.offsetHeight;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}


// --- A11Y: Focus Traps ---
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const isCartOpen = document.getElementById('cartSidebar').classList.contains('active');
    const isModalOpen = document.getElementById('quickModalOverlay').classList.contains('active');
    if (isCartOpen) toggleCart();
    if (isModalOpen) closeModal();
  }
});

// --- WhatsApp Checkout ---
window.checkout = function() {
  if (cart.length === 0) return;
  
  let msg = "Olá! Gostaria de finalizar meu pedido:\n\n";
  let total = 0;
  
  cart.forEach((item, i) => {
    const itemTotal = parsePrice(item.price) * item.quantity;
    total += itemTotal;
    msg += `*${item.quantity}x* ${item.name} (Tamanho: ${item.size}) - ${formatPrice(itemTotal)}\n`;
  });
  
  msg += `\n*TOTAL: ${formatPrice(total)}*\n\nAguardo o envio do link de pagamento.`;
  
  const url = `https://wa.me/5511940379082?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

// Init badge on load
document.addEventListener('DOMContentLoaded', updateCartBadge);
