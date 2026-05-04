/* ============================================================
   RESTAURANT DELPHI – SCRIPT.JS
   ============================================================ */

'use strict';

/* ---- Dynamic copyright year ------------------------------- */
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();


/* ---- Header: transparent → solid on scroll ---------------- */
const header    = document.getElementById('site-header');
const atTopCls  = 'at-top';
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
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });


/* ---- Active nav link on scroll ---------------------------- */
const sections = document.querySelectorAll('main section[id]');

function updateActiveNav() {
  const scrollMid = window.scrollY + window.innerHeight / 2;
  sections.forEach(sec => {
    if (sec.offsetHeight === 0) return;
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
const mobileOv    = document.getElementById('mobile-overlay');
const mobileLinks = document.querySelectorAll('.mobile-nav-link');
let   menuOpen    = false;

function openMenu() {
  menuOpen = true;
  burger.classList.add('open');
  mobileOv.classList.add('open');
  mobileOv.setAttribute('aria-hidden', 'false');
  burger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  menuOpen = false;
  burger.classList.remove('open');
  mobileOv.classList.remove('open');
  mobileOv.setAttribute('aria-hidden', 'true');
  burger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

burger.addEventListener('click', () => menuOpen ? closeMenu() : openMenu());
mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

const mobileCloseBtn = document.getElementById('mobile-close');
if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', closeMenu);


/* ---- Smooth scroll for anchor links ----------------------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const id     = this.getAttribute('href');
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const headerH = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--header-h')) || 80;
    const top = target.getBoundingClientRect().top + window.scrollY - headerH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ---- Menu: Tab switching ---------------------------------- */
const menuTabs   = document.querySelectorAll('.menu-tab');
const menuPanels = document.querySelectorAll('.menu-panel');

menuTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const targetId = 'tab-' + tab.dataset.tab;

    menuTabs.forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');

    menuPanels.forEach(panel => {
      if (panel.id === targetId) {
        panel.removeAttribute('hidden');
        panel.classList.add('active');
      } else {
        panel.setAttribute('hidden', '');
        panel.classList.remove('active');
      }
    });

    tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  });

  // Keyboard: left/right arrows move between tabs
  tab.addEventListener('keydown', e => {
    const tabs = [...menuTabs];
    const idx  = tabs.indexOf(tab);
    if (e.key === 'ArrowRight') { e.preventDefault(); tabs[(idx + 1) % tabs.length].click(); tabs[(idx + 1) % tabs.length].focus(); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); tabs[(idx - 1 + tabs.length) % tabs.length].click(); tabs[(idx - 1 + tabs.length) % tabs.length].focus(); }
  });
});


/* ---- Gallery Lightbox ------------------------------------- */
const galleryItems    = document.querySelectorAll('.gallery-item');
const lightbox        = document.getElementById('lightbox');
const lightboxContent = document.getElementById('lightbox-content');
const lightboxCounter = document.getElementById('lightbox-counter');
const lbClose         = document.getElementById('lightbox-close');
const lbPrev          = document.getElementById('lightbox-prev');
const lbNext          = document.getElementById('lightbox-next');

let currentLbIndex = 0;
let lbOpen         = false;

const galleryData = Array.from(galleryItems).map(item => {
  const img     = item.querySelector('img');
  const caption = item.querySelector('.gallery-caption')?.textContent?.trim() || '';
  return { src: img ? img.src : null, caption };
});

function openLightbox(index) {
  currentLbIndex = index;
  lbOpen = true;
  renderLightbox();
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  lbClose.focus();
}

function closeLightbox() {
  lbOpen = false;
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  galleryItems[currentLbIndex]?.focus();
}

function renderLightbox() {
  const { src, caption } = galleryData[currentLbIndex];
  lightboxCounter.textContent = `${currentLbIndex + 1} / ${galleryData.length}`;

  if (src) {
    lightboxContent.innerHTML = `<img src="${src}" alt="${caption}" />`;
  } else {
    const svg = galleryItems[currentLbIndex].querySelector('.gallery-placeholder')?.innerHTML || '';
    lightboxContent.innerHTML = `
      <div class="lb-placeholder">
        ${svg}
        <span>${caption}</span>
      </div>`;
  }
}

galleryItems.forEach((item, i) => {
  item.setAttribute('tabindex', '0');
  item.setAttribute('role', 'button');
  item.setAttribute('aria-label', `Bild vergrößern: ${galleryData[i]?.caption || ''}`);
  item.addEventListener('click',   () => openLightbox(i));
  item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); } });
});

if (lbClose) {
  lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  lbPrev.addEventListener('click', () => { currentLbIndex = (currentLbIndex - 1 + galleryData.length) % galleryData.length; renderLightbox(); });
  lbNext.addEventListener('click', () => { currentLbIndex = (currentLbIndex + 1) % galleryData.length; renderLightbox(); });
}

/* Touch swipe for lightbox */
let touchStartX = 0;
if (lightbox) {
  lightbox.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
  lightbox.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) { currentLbIndex = (currentLbIndex + 1) % galleryData.length; renderLightbox(); }
    else         { currentLbIndex = (currentLbIndex - 1 + galleryData.length) % galleryData.length; renderLightbox(); }
  }, { passive: true });
}


/* ---- Global keyboard handling (priority: lightbox > menu > default) */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (lbOpen)   { closeLightbox(); return; }
    if (menuOpen) { closeMenu();     return; }
  }
  if (lbOpen) {
    if (e.key === 'ArrowLeft')  { currentLbIndex = (currentLbIndex - 1 + galleryData.length) % galleryData.length; renderLightbox(); }
    if (e.key === 'ArrowRight') { currentLbIndex = (currentLbIndex + 1) % galleryData.length; renderLightbox(); }
  }
});


/* ---- Reservation form ------------------------------------- */
const resForm    = document.getElementById('reservation-form');
const resSuccess = document.getElementById('form-success');
const dateInput  = document.getElementById('res-date');

if (dateInput) {
  dateInput.setAttribute('min', new Date().toISOString().split('T')[0]);
}

if (resForm) {
  resForm.addEventListener('submit', e => {
    e.preventDefault();
    const fields = resForm.querySelectorAll('[required]');
    let valid = true;

    fields.forEach(f => {
      f.classList.remove('field-error');
      if (!f.value.trim()) { f.classList.add('field-error'); valid = false; }
    });

    if (!valid) { resForm.querySelector('.field-error')?.focus(); return; }

    resForm.style.display = 'none';
    resSuccess.removeAttribute('hidden');
  });

  resForm.querySelectorAll('[required]').forEach(f => {
    f.addEventListener('input',  () => f.classList.remove('field-error'));
    f.addEventListener('change', () => f.classList.remove('field-error'));
  });
}


/* ---- Back to Top button ----------------------------------- */
const backToTop = document.getElementById('back-to-top');

if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


/* ---- Subtle hero parallax (only if no reduced-motion pref) */
const heroImg = document.querySelector('.hero-img');
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (heroImg && !prefersReduced) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      heroImg.style.transform = `scale(1) translateY(${y * 0.25}px)`;
    }
  }, { passive: true });
}


/* ---- Scroll-reveal ---------------------------------------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
