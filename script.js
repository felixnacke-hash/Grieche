/* ============================================================
   RESTAURANT DELPHI – SCRIPT.JS
   ============================================================ */

'use strict';

/* ---- Header: transparent → solid on scroll ---------------- */
const header   = document.getElementById('site-header');
const atTopCls = 'at-top';
const scrollCls = 'scrolled';

function updateHeader() {
  if (window.scrollY < 40) {
    header.classList.add(atTopCls);
    header.classList.remove(scrollCls);
  } else {
    header.classList.remove(atTopCls);
    header.classList.add(scrollCls);
  }
}
updateHeader(); // run on load
window.addEventListener('scroll', updateHeader, { passive: true });


/* ---- Active nav link on scroll ---------------------------- */
const sections  = document.querySelectorAll('main section[id]');
const navLinks  = document.querySelectorAll('.nav-link');

function updateActiveNav() {
  const scrollMid = window.scrollY + window.innerHeight / 2;
  sections.forEach(sec => {
    if (sec.offsetHeight === 0) return; // skip empty placeholder sections
    const top    = sec.offsetTop;
    const bottom = top + sec.offsetHeight;
    const link   = document.querySelector(`.nav-link[href="#${sec.id}"]`);
    if (!link) return;
    link.classList.toggle('active', scrollMid >= top && scrollMid < bottom);
  });
}
window.addEventListener('scroll', updateActiveNav, { passive: true });


/* ---- Mobile burger menu ----------------------------------- */
const burger      = document.getElementById('burger');
const overlay     = document.getElementById('mobile-overlay');
const mobileLinks = document.querySelectorAll('.mobile-nav-link');

function openMenu() {
  burger.classList.add('open');
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  burger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  burger.classList.remove('open');
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  burger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

burger.addEventListener('click', () => {
  burger.classList.contains('open') ? closeMenu() : openMenu();
});

mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

// Close on ESC
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMenu();
});


/* ---- Smooth scroll for anchor links ----------------------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 80;
    const top    = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ---- Menu: Tab switching ---------------------------------- */
const menuTabs   = document.querySelectorAll('.menu-tab');
const menuPanels = document.querySelectorAll('.menu-panel');

menuTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const targetId = 'tab-' + tab.dataset.tab;

    // Update tabs
    menuTabs.forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');

    // Update panels
    menuPanels.forEach(panel => {
      if (panel.id === targetId) {
        panel.removeAttribute('hidden');
        panel.classList.add('active');
      } else {
        panel.setAttribute('hidden', '');
        panel.classList.remove('active');
      }
    });

    // Scroll active tab into view on mobile
    tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  });
});


/* ---- Gallery Lightbox ------------------------------------- */
const galleryItems   = document.querySelectorAll('.gallery-item');
const lightbox       = document.getElementById('lightbox');
const lightboxContent = document.getElementById('lightbox-content');
const lightboxCounter = document.getElementById('lightbox-counter');
const lbClose        = document.getElementById('lightbox-close');
const lbPrev         = document.getElementById('lightbox-prev');
const lbNext         = document.getElementById('lightbox-next');

let currentLbIndex = 0;

const galleryData = Array.from(galleryItems).map(item => {
  const img     = item.querySelector('img');
  const caption = item.querySelector('.gallery-caption')?.textContent || '';
  return { src: img ? img.src : null, caption };
});

function openLightbox(index) {
  currentLbIndex = index;
  renderLightbox();
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  lbClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function renderLightbox() {
  const item = galleryData[currentLbIndex];
  lightboxCounter.textContent = `${currentLbIndex + 1} / ${galleryData.length}`;

  if (item.src) {
    lightboxContent.innerHTML = `<img src="${item.src}" alt="${item.caption}" />`;
  } else {
    // Show placeholder artwork from the gallery card
    const placeholderSvg = galleryItems[currentLbIndex].querySelector('.gallery-placeholder')?.innerHTML || '';
    lightboxContent.innerHTML = `
      <div class="lb-placeholder">
        ${placeholderSvg}
        <span>${item.caption}</span>
      </div>`;
  }
}

galleryItems.forEach((item, i) => {
  item.addEventListener('click', () => openLightbox(i));
  item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openLightbox(i); });
  item.setAttribute('tabindex', '0');
  item.setAttribute('role', 'button');
});

lbClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

lbPrev.addEventListener('click', () => {
  currentLbIndex = (currentLbIndex - 1 + galleryData.length) % galleryData.length;
  renderLightbox();
});
lbNext.addEventListener('click', () => {
  currentLbIndex = (currentLbIndex + 1) % galleryData.length;
  renderLightbox();
});

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   { currentLbIndex = (currentLbIndex - 1 + galleryData.length) % galleryData.length; renderLightbox(); }
  if (e.key === 'ArrowRight')  { currentLbIndex = (currentLbIndex + 1) % galleryData.length; renderLightbox(); }
});


/* ---- Reservation form ------------------------------------- */
const resForm    = document.getElementById('reservation-form');
const resSuccess = document.getElementById('form-success');

// Set min date to today
const dateInput = document.getElementById('res-date');
if (dateInput) {
  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);
}

if (resForm) {
  resForm.addEventListener('submit', e => {
    e.preventDefault();

    // Simple validation
    const required = resForm.querySelectorAll('[required]');
    let valid = true;
    required.forEach(field => {
      field.classList.remove('field-error');
      if (!field.value.trim()) {
        field.classList.add('field-error');
        valid = false;
      }
    });

    if (!valid) {
      resForm.querySelector('.field-error')?.focus();
      return;
    }

    // Show success (in a real project, POST to backend or email service here)
    resForm.style.display = 'none';
    resSuccess.removeAttribute('hidden');
  });

  // Remove error state on input
  resForm.querySelectorAll('[required]').forEach(field => {
    field.addEventListener('input', () => field.classList.remove('field-error'));
  });
}


/* ---- Scroll-reveal (will be used in later steps) ---------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
