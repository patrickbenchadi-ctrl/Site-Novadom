/* NOVADOM — interactions globales (menu, header, apparition) */
(function () {
  document.documentElement.classList.add('js');
  function ready(fn){ if(document.readyState!=='loading'){fn();} else {document.addEventListener('DOMContentLoaded',fn);} }
  ready(function () {
    var nav = document.querySelector('.nav');
    var toggle = document.querySelector('.nav__toggle');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        var open = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      nav.querySelectorAll('.nav__links a').forEach(function (a) {
        a.addEventListener('click', function () { nav.classList.remove('is-open'); });
      });
    }
    var header = document.querySelector('.site-header');
    if (header) {
      var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
      onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    }
    var reveals = document.querySelectorAll('.reveal');
    if (reveals.length && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
      reveals.forEach(function (el) { io.observe(el); });
      setTimeout(function () { reveals.forEach(function (el) { el.classList.add('in'); }); }, 2500);
    } else {
      reveals.forEach(function (el) { el.classList.add('in'); });
    }
    document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  });
})();
