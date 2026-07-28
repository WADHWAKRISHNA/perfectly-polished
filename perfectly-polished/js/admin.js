/* =========================================================
   Admin page: password gate + add product form
   (No files are stored on the site itself — everything the
   admin adds is sent straight to the Google Sheet, so there's
   nothing to "save" locally and nothing else can touch it.)
   ========================================================= */

const SESSION_KEY = 'pp_admin_ok';

document.addEventListener('DOMContentLoaded', () => {
  const gate = document.getElementById('admin-gate');
  const panel = document.getElementById('admin-panel');
  const gateForm = document.getElementById('gate-form');
  const gateError = document.getElementById('gate-error');

  function unlock() {
    gate.style.display = 'none';
    panel.style.display = 'block';
    refreshProductList();
  }

  if (sessionStorage.getItem(SESSION_KEY) === '1') unlock();

  gateForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const pw = document.getElementById('gate-password').value;
    if (pw === CONFIG.ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1');
      gateError.textContent = '';
      unlock();
    } else {
      gateError.textContent = 'Incorrect password. Try again.';
    }
  });

  const logoutBtn = document.getElementById('admin-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem(SESSION_KEY);
      panel.style.display = 'none';
      gate.style.display = 'block';
    });
  }

  const addForm = document.getElementById('add-product-form');
  const addStatus = document.getElementById('add-status');

  addForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const imageUrl = document.getElementById('p-image').value.trim();
    const title = document.getElementById('p-title').value.trim();
    const description = document.getElementById('p-description').value.trim();
    const price = document.getElementById('p-price').value.trim();

    if (!imageUrl || !title || !description) {
      addStatus.textContent = 'Please add an image link, a title, and a description.';
      addStatus.className = 'form-status err';
      return;
    }

    if (!isScriptConfigured()) {
      addStatus.textContent = 'Connect your Google Sheet link in js/config.js first (see README.md) — nothing is saved yet.';
      addStatus.className = 'form-status err';
      return;
    }

    const btn = addForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    addStatus.textContent = 'Adding to your gallery…';
    addStatus.className = 'form-status';

    try {
      await fetch(CONFIG.SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'addProduct', imageUrl, title, description, price }),
      });
      addStatus.textContent = `"${title}" added! It'll appear on the site within a few seconds.`;
      addStatus.className = 'form-status ok';
      addForm.reset();
      setTimeout(refreshProductList, 1200);
    } catch (err) {
      console.error(err);
      addStatus.textContent = 'Could not add the product. Please check your connection and try again.';
      addStatus.className = 'form-status err';
    } finally {
      btn.disabled = false;
    }
  });
});

async function refreshProductList() {
  const list = document.getElementById('current-products');
  if (!list) return;
  list.innerHTML = `<div class="skeleton" style="height:64px;"></div>`;
  const products = isScriptConfigured() ? await loadProducts() : DEMO_PRODUCTS;
  if (!products.length) {
    list.innerHTML = `<p style="font-size:.85rem;">No products yet — add your first one above.</p>`;
    return;
  }
  list.innerHTML = products.map(p => `
    <div class="admin-list-item">
      <img src="${escapeHtml(p.imageUrl)}" alt="${escapeHtml(p.title)}">
      <div class="meta">
        <h4>${escapeHtml(p.title)}${p.price ? ' — ' + escapeHtml(p.price) : ''}</h4>
        <p>${escapeHtml(p.description)}</p>
      </div>
    </div>
  `).join('');
}
