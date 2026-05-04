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
