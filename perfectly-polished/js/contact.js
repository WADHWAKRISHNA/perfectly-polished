/* =========================================================
   Contact page: pre-fill product reference + submit to Sheet
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  const refChip = document.getElementById('ref-chip');
  const refInput = document.getElementById('field-ref');
  const messageEl = document.getElementById('field-message');
  const introEl = document.getElementById('contact-intro');

  if (ref) {
    if (refChip) {
      refChip.style.display = 'inline-flex';
      refChip.querySelector('span').textContent = ref;
    }
    if (refInput) refInput.value = ref;
    if (messageEl && !messageEl.value) {
      messageEl.value = `Hi! I'd love to order the "${ref}" piece I saw in your gallery. Could you tell me more about pricing and availability?`;
    }
    if (introEl) {
      introEl.textContent = `Loved the "${ref}"? Wonderful choice — tell us a little about you and we'll personally get back to you with pricing and shipping details.`;
    }
  }

  // WhatsApp quick-chat button — only shown once a number is set in js/config.js
  const waBtn = document.getElementById('whatsapp-btn');
  if (waBtn && CONFIG.WHATSAPP_NUMBER && CONFIG.WHATSAPP_NUMBER.trim()) {
    const waMessage = ref
      ? `Hi! I'd love to order the "${ref}" piece I saw in your gallery.`
      : `Hi! I'd love to know more about your resin art pieces.`;
    waBtn.href = `https://wa.me/${CONFIG.WHATSAPP_NUMBER.trim()}?text=${encodeURIComponent(waMessage)}`;
    waBtn.style.display = 'inline-flex';
  }

  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('field-name').value.trim();
    const email = document.getElementById('field-email').value.trim();
    const message = messageEl ? messageEl.value.trim() : '';
    const productRef = refInput ? refInput.value.trim() : '';

    if (!name || !email) {
      status.textContent = 'Please fill in your name and email.';
      status.className = 'form-status err';
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    status.textContent = 'Sending…';
    status.className = 'form-status';

    if (!isScriptConfigured()) {
      // No Google Sheet connected yet — let the site owner know, but don't lose the visitor's message
      console.log('Contact form submission (Google Sheet not yet connected):', { name, email, message, productRef });
      status.textContent = "Thanks! (Note to owner: connect your Google Sheet link in js/config.js to start saving these automatically.)";
      status.className = 'form-status ok';
      form.reset();
      submitBtn.disabled = false;
      return;
    }

    try {
      await fetch(CONFIG.SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // avoids CORS preflight with Apps Script
        body: JSON.stringify({ action: 'addContact', name, email, message, productRef }),
      });
      status.textContent = `Thank you, ${name}! We've received your message and will reach out to ${email} soon. 🌸`;
      status.className = 'form-status ok';
      form.reset();
      if (refChip) refChip.style.display = 'none';
    } catch (err) {
      console.error(err);
      status.textContent = 'Something went wrong sending your message. Please try again, or reach us directly.';
      status.className = 'form-status err';
    } finally {
      submitBtn.disabled = false;
    }
  });
});
