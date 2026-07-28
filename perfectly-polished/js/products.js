/* =========================================================
   Product loading, shuffling, card rendering, lightbox
   ========================================================= */

// Demo products shown until the admin adds real ones (or if the
// Google Sheet link hasn't been configured yet in js/config.js)
const DEMO_PRODUCTS = [
  { id: 'demo-1', title: 'Ocean Wave Coaster Set', description: 'Hand-poured resin coasters layered in teal and gold to mimic breaking waves. Set of 4.', price: '₹1,299', imageUrl: 'https://picsum.photos/seed/resin-ocean/700/700' },
  { id: 'demo-2', title: 'Blush Geode Wall Art', description: 'A statement geode-style wall piece in blush pink and rose gold leaf, framed in walnut.', price: '₹3,499', imageUrl: 'https://picsum.photos/seed/resin-geode/700/700' },
  { id: 'demo-3', title: 'Amber Flow Serving Tray', description: 'Warm amber resin tray with real dried florals suspended inside. Food-safe finish.', price: '₹2,199', imageUrl: 'https://picsum.photos/seed/resin-tray/700/700' },
  { id: 'demo-4', title: 'Rose Gold Keychain Duo', description: 'Petite resin keychains flecked with genuine rose gold foil. Sold as a pair.', price: '₹499', imageUrl: 'https://picsum.photos/seed/resin-keychain/700/700' },
  { id: 'demo-5', title: 'Marble Edge Clock', description: 'Wall clock with a hand-marbled resin face in ivory and terracotta swirls.', price: '₹2,799', imageUrl: 'https://picsum.photos/seed/resin-clock/700/700' },
  { id: 'demo-6', title: 'Dried Bloom Pendant', description: 'A single pressed bloom sealed in a teardrop resin pendant on a gold-plated chain.', price: '₹899', imageUrl: 'https://picsum.photos/seed/resin-pendant/700/700' },
];

function isScriptConfigured() {
  return CONFIG.SCRIPT_URL && !CONFIG.SCRIPT_URL.includes('PASTE_YOUR_DEPLOYMENT_ID_HERE');
}

async function loadProducts() {
  if (!isScriptConfigured()) return DEMO_PRODUCTS;
  try {
    const res = await fetch(`${CONFIG.SCRIPT_URL}?action=getProducts`);
    const data = await res.json();
    if (Array.isArray(data) && data.length) return data;
    return DEMO_PRODUCTS;
  } catch (e) {
    console.warn('Could not load products from Google Sheet, showing demo items.', e);
    return DEMO_PRODUCTS;
  }
}

function productCardHtml(p) {
  const price = p.price ? `<span class="price-tag">${escapeHtml(p.price)}</span>` : '<span></span>';
  return `
    <article class="card" data-id="${escapeHtml(p.id)}">
      <div class="card-img" role="button" tabindex="0" aria-label="Enlarge ${escapeHtml(p.title)}">
        <img src="${escapeHtml(p.imageUrl)}" alt="${escapeHtml(p.title)}" loading="lazy">
        <span class="zoom-hint">⤢</span>
      </div>
      <div class="card-body">
        <h3>${escapeHtml(p.title)}</h3>
        <p>${escapeHtml(p.description)}</p>
        <div class="card-foot">
          ${price}
          <a class="btn btn-outline btn-sm" href="contact.html?ref=${encodeURIComponent(p.title)}">Order this</a>
        </div>
      </div>
    </article>`;
}

function renderGrid(containerId, products) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!products.length) {
    el.innerHTML = `<div class="empty-state">No creations added yet — check back soon! ✨</div>`;
    return;
  }
  el.innerHTML = products.map(productCardHtml).join('');
  wireCardClicks(el, products);
}

function wireCardClicks(container, products) {
  container.querySelectorAll('.card-img').forEach(imgWrap => {
    const openIt = () => {
      const id = imgWrap.closest('.card').dataset.id;
      const product = products.find(p => String(p.id) === String(id));
      if (product) openLightbox(product);
    };
    imgWrap.addEventListener('click', openIt);
    imgWrap.addEventListener('keypress', e => { if (e.key === 'Enter') openIt(); });
  });
}

function openLightbox(p) {
  let lb = document.getElementById('lightbox');
  if (!lb) {
    lb = document.createElement('div');
    lb.id = 'lightbox';
    lb.className = 'lightbox';
    document.body.appendChild(lb);
  }
  const price = p.price ? `<span class="price-tag">${escapeHtml(p.price)}</span>` : '';
  lb.innerHTML = `
    <button class="lightbox-close" aria-label="Close">✕</button>
    <div class="lightbox-inner">
      <img src="${escapeHtml(p.imageUrl)}" alt="${escapeHtml(p.title)}">
      <div class="lightbox-text">
        <span class="eyebrow">Handmade Resin Art</span>
        <h3>${escapeHtml(p.title)}</h3>
        ${price}
        <p style="margin-top:14px;">${escapeHtml(p.description)}</p>
        <a class="btn btn-primary" style="margin-top:auto;" href="contact.html?ref=${encodeURIComponent(p.title)}">Order this piece →</a>
      </div>
    </div>`;
  lb.classList.add('open');
  lb.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
  document.addEventListener('keydown', escCloseOnce);
}
function escCloseOnce(e) { if (e.key === 'Escape') closeLightbox(); }
function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (lb) lb.classList.remove('open');
  document.removeEventListener('keydown', escCloseOnce);
}

/* ---- Page-level init hooks ---- */

async function initGalleryPage() {
  const products = shuffleArray(await loadProducts());
  renderGrid('gallery-grid', products);
}

async function initHomePage() {
  const all = shuffleArray(await loadProducts());
  renderGrid('home-grid', all.slice(0, 6));
}
