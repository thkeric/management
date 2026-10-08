/* Tae Hyun Kim, the Owner Edition: small enhancements only.
   Everything is readable without this file. */
(function () {
  var doc = document.documentElement;
  doc.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reveal blocks as they enter the viewport.
  var reveals = [].slice.call(document.querySelectorAll('[data-reveal]'));
  var drops = [].slice.call(document.querySelectorAll('[data-drop]'));
  if (!('IntersectionObserver' in window) || reduce) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
    drops.forEach(function (el) { el.classList.add('play'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add(e.target.hasAttribute('data-drop') ? 'play' : 'is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveals.concat(drops).forEach(function (el) { io.observe(el); });
    // Safety net: never leave anything hidden.
    window.setTimeout(function () { reveals.forEach(function (el) { el.classList.add('is-in'); }); }, 3000);
  }

  // Tilt a case towards the pointer, like turning a product in your hand.
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    [].slice.call(document.querySelectorAll('[data-tilt]')).forEach(function (zone) {
      var c = zone.querySelector('.case');
      if (!c) return;
      var base = getComputedStyle(c);
      var rx0 = parseFloat(base.getPropertyValue('--rx')) || 0;
      var ry0 = parseFloat(base.getPropertyValue('--ry')) || 0;
      zone.addEventListener('pointermove', function (ev) {
        var r = zone.getBoundingClientRect();
        var x = (ev.clientX - r.left) / r.width - 0.5;
        var y = (ev.clientY - r.top) / r.height - 0.5;
        c.style.setProperty('--ry', (ry0 + x * 34).toFixed(1) + 'deg');
        c.style.setProperty('--rx', (rx0 - y * 18).toFixed(1) + 'deg');
        zone.style.setProperty('--sx', (50 + x * 40).toFixed(0) + '%');
      });
      zone.addEventListener('pointerleave', function () {
        c.style.removeProperty('--ry');
        c.style.removeProperty('--rx');
      });
    });
  }
  // Back to top: a floating triangle that appears once you've scrolled.
  var toTop = document.createElement('button');
  toTop.type = 'button';
  toTop.className = 'to-top';
  toTop.setAttribute('aria-label', 'Back to top');
  toTop.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 5.5 20.5 19h-17z" fill="currentColor" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/></svg>';
  document.body.appendChild(toTop);
  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    var main = document.getElementById('content');
    if (main) { main.setAttribute('tabindex', '-1'); main.focus({ preventScroll: true }); }
  });

  // Section dots: one per section, the current one highlighted.
  var sections = [].slice.call(document.querySelectorAll('[data-dot]'));
  var links = [];
  if (sections.length > 1) {
    var nav = document.createElement('nav');
    nav.className = 'dots';
    nav.setAttribute('aria-label', 'Sections on this page');
    sections.forEach(function (sec) {
      var a = document.createElement('a');
      a.href = '#' + sec.id;
      var label = document.createElement('span');
      label.textContent = sec.getAttribute('data-dot');
      a.appendChild(label);
      nav.appendChild(a);
      links.push(a);
    });
    document.body.appendChild(nav);
  }

  var ticking = false;
  function update() {
    ticking = false;
    toTop.classList.toggle('is-shown', window.scrollY > 600);
    if (!links.length) return;
    var line = window.innerHeight * 0.4, idx = 0;
    sections.forEach(function (sec, i) { if (sec.getBoundingClientRect().top <= line) idx = i; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) idx = sections.length - 1;
    links.forEach(function (a, i) {
      if (i === idx) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
