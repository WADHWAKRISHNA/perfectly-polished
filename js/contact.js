/* =========================================================
   Contact page: pre-fill product reference, submit to Sheet,
   then show a Thank-you popup that redirects to WhatsApp.
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

  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('field-name').value.trim();
    const email = document.getElementById('field-email').value.trim();
    const phone = document.getElementById('field-phone').value.trim();
    const message = messageEl ? messageEl.value.trim() : '';
    const productRef = refInput ? refInput.value.trim() : '';
    const subscribed = document.getElementById('field-subscribe').checked;

    if (!name || !email || !phone) {
      status.textContent = 'Please fill in your name, email, and mobile number.';
      status.className = 'form-status err';
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    status.textContent = 'Sending…';
    status.className = 'form-status';

    if (!isScriptConfigured()) {
      // No Google Sheet connected yet — let the site owner know, but don't lose the visitor's message
      console.log('Contact form submission (Google Sheet not yet connected):', { name, email, phone, message, productRef, subscribed });
      status.textContent = "Note to owner: connect your Google Sheet link in js/config.js to start saving these and sending emails automatically.";
      status.className = 'form-status err';
      submitBtn.disabled = false;
      openThankYou(name, ref);
      return;
    }

    try {
      await fetch(CONFIG.SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // avoids CORS preflight with Apps Script
        body: JSON.stringify({ action: 'addContact', name, email, phone, message, productRef, subscribed }),
      });
      status.textContent = '';
      form.reset();
      if (refChip) refChip.style.display = 'none';
      openThankYou(name, ref);
    } catch (err) {
      console.error(err);
      status.textContent = 'Something went wrong sending your message. Please try again, or reach us directly.';
      status.className = 'form-status err';
    } finally {
      submitBtn.disabled = false;
    }
  });
});

function openThankYou(name, ref) {
  const modal = document.getElementById('ty-modal');
  const msg = document.getElementById('ty-message');
  const redirectNote = document.getElementById('ty-redirect-note');
  const waNowBtn = document.getElementById('ty-wa-now');
  const closeBtn = document.getElementById('ty-close');
  if (!modal) return;

  msg.textContent = `Thanks${name ? ', ' + name : ''}! Your message has been received — we'll be in touch soon.`;

  const hasWhatsApp = typeof CONFIG !== 'undefined' && CONFIG.WHATSAPP_NUMBER && CONFIG.WHATSAPP_NUMBER.trim();
  let redirectTimer = null;

  if (hasWhatsApp) {
    const waMessage = ref
      ? `Hi! I'd love to order the "${ref}" piece I saw in your gallery.`
      : `Hi! I just sent a message on your website — following up here on WhatsApp.`;
    const waUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER.trim()}?text=${encodeURIComponent(waMessage)}`;

    redirectNote.style.display = 'block';
    waNowBtn.style.display = 'inline-flex';
    waNowBtn.href = waUrl;

    redirectTimer = setTimeout(() => {
      window.location.href = waUrl;
    }, 2200);
  } else {
    redirectNote.style.display = 'none';
    waNowBtn.style.display = 'none';
  }

  modal.classList.add('open');

  closeBtn.onclick = () => {
    if (redirectTimer) clearTimeout(redirectTimer);
    modal.classList.remove('open');
  };
  modal.onclick = (e) => {
    if (e.target === modal) {
      if (redirectTimer) clearTimeout(redirectTimer);
      modal.classList.remove('open');
    }
  };
}
