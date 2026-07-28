/* =========================================================
   Shared behaviour: mobile nav toggle, shuffle helper, drips
   ========================================================= */

// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
    links.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => links.classList.remove('open'))
    );
  }

  // Sprinkle a few animated resin drips on any .pour-divider found on the page
  document.querySelectorAll('.pour-divider').forEach(div => {
    const count = 5;
    for (let i = 0; i < count; i++) {
      const d = document.createElement('div');
      d.className = 'drip';
      d.style.left = (8 + Math.random() * 84) + '%';
      d.style.animationDelay = (Math.random() * 6) + 's';
      d.style.opacity = String(0.4 + Math.random() * 0.4);
      div.appendChild(d);
    }
  });
});

// Fisher-Yates shuffle — used to reshuffle gallery/home cards on every load
function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Small helper to escape text before inserting into HTML
function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}
