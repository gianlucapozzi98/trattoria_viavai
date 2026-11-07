/* Trattoria ViaVai — Torriglia */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     CONFIGURAZIONE
     ------------------------------------------------------------------ */
  var CONFIG = {
    // Cellulare indicato dal locale "per info e prenotazioni" sulle locandine Instagram (351 393 6541).
    // Attivo su WhatsApp (confermato dal cliente). Se si svuota, i pulsanti WhatsApp avviano una chiamata.
    whatsapp: '393513936541',
    phone: '+390109451005',
    timeZone: 'Europe/Rome',
    // Orari (fonte: scheda Google, rilevati il 07/11/2026). Minuti dalla mezzanotte. 0 = domenica.
    hours: {
      0: [[720, 840], [1140, 1260]],
      1: [[720, 840], [1140, 1260]],
      2: [[720, 840], [1140, 1260]],
      3: [],
      4: [[720, 840], [1140, 1260]],
      5: [[720, 840], [1140, 1260]],
      6: [[720, 840], [1140, 1260]]
    },
    slots: {
      pranzo: ['12:00', '12:30', '13:00', '13:30'],
      cena: ['19:00', '19:30', '20:00', '20:30']
    }
  };

  var DAYS = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  var waReady = /^\d{10,15}$/.test(CONFIG.whatsapp);
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ------------------------------------------------------------------
     Tracciamento conversioni (GA4 / GTM tramite dataLayer)
     ------------------------------------------------------------------ */
  window.dataLayer = window.dataLayer || [];
  function track(name, extra) {
    var ev = { event: name };
    if (extra) for (var k in extra) ev[k] = extra[k];
    window.dataLayer.push(ev);
  }
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-track]');
    if (el && el.tagName !== 'BUTTON') track(el.getAttribute('data-track'));
  });

  /* ------------------------------------------------------------------
     Sipario d'apertura: solo alla prima visita della sessione
     ------------------------------------------------------------------ */
  var curtain = $('.curtain');
  var seen = false;
  try { seen = sessionStorage.getItem('vv-intro') === '1'; sessionStorage.setItem('vv-intro', '1'); } catch (e) {}
  function loaded() { root.classList.add('is-loaded'); }
  if (!curtain || seen || reduceMotion) {
    if (curtain) curtain.remove();
    setTimeout(loaded, 30);
  } else {
    setTimeout(loaded, 900);
    setTimeout(function () { curtain.remove(); }, 2300);
  }

  /* ------------------------------------------------------------------
     Titolo hero diviso in parole
     ------------------------------------------------------------------ */
  $$('[data-split]').forEach(function (el) {
    var i = 0;
    function wrap(text, parent) {
      text.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { parent.appendChild(document.createTextNode(' ')); return; }
        var w = document.createElement('span'); w.className = 'w';
        var inner = document.createElement('span'); inner.style.setProperty('--i', i++); inner.textContent = part;
        w.appendChild(inner); parent.appendChild(w);
      });
    }
    var nodes = Array.prototype.slice.call(el.childNodes);
    el.textContent = '';
    nodes.forEach(function (n) {
      if (n.nodeType === 3) wrap(n.textContent, el);
      else { var c = n.cloneNode(false); wrap(n.textContent, c); el.appendChild(c); }
    });
  });

  /* ------------------------------------------------------------------
     Slideshow hero (Ken Burns)
     ------------------------------------------------------------------ */
  (function () {
    var slides = $$('.hero .slide');
    var dots = $$('.hero__dots button');
    if (slides.length < 2) return;
    var cur = 0, timer;
    function hydrate(s) {
      var img = $('img', s);
      if (img && img.dataset.src) { img.srcset = img.dataset.srcset || ''; img.src = img.dataset.src; delete img.dataset.src; }
    }
    var tag = $('.hero__tag');
    var tagN = tag && $('.hero__tag-n', tag);
    var tagText = tag && $('.hero__tag-text', tag);
    var pad = function (v) { return (v < 10 ? '0' : '') + v; };
    function go(n) {
      n = (n + slides.length) % slides.length;
      if (n === cur) return;
      // il piatto precedente resta sotto, il nuovo "si apre" sopra
      slides.forEach(function (s) { s.classList.remove('is-prev'); });
      slides[cur].classList.remove('is-active');
      slides[cur].classList.add('is-prev');
      dots[cur] && dots[cur].classList.remove('is-active');
      cur = n;
      hydrate(slides[cur]); hydrate(slides[(cur + 1) % slides.length]);
      void slides[cur].offsetWidth;
      slides[cur].classList.add('is-active');
      if (dots[cur]) { dots[cur].classList.remove('is-active'); void dots[cur].offsetWidth; dots[cur].classList.add('is-active'); }
      if (tag) {
        tag.classList.remove('is-swapping'); void tag.offsetWidth; tag.classList.add('is-swapping');
        setTimeout(function () {
          tagText.textContent = slides[cur].dataset.label || '';
          tagN.innerHTML = pad(cur + 1) + '<i>/' + pad(slides.length) + '</i>';
        }, 360);
      }
    }
    function start() { clearInterval(timer); if (!reduceMotion) timer = setInterval(function () { go(cur + 1); }, 6000); }
    window.addEventListener('load', function () { hydrate(slides[1]); start(); });
    dots.forEach(function (d, i) { d.addEventListener('click', function () { go(i); start(); }); });
    document.addEventListener('visibilitychange', function () { if (document.hidden) clearInterval(timer); else start(); });
  })();

  /* ------------------------------------------------------------------
     Reveal allo scroll + contatori
     ------------------------------------------------------------------ */
  function countUp(el) {
    var target = parseFloat(el.dataset.count);
    var dec = parseInt(el.dataset.decimals || '0', 10);
    var fmt = function (v) { return v.toFixed(dec).replace('.', ','); };
    if (reduceMotion) { el.textContent = fmt(target); return; }
    var t0 = null, dur = 1600;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      el.textContent = fmt(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        $$('[data-count]', en.target).concat(en.target.dataset.count ? [en.target] : []).forEach(function (c) {
          if (!c.dataset.counted) { c.dataset.counted = '1'; countUp(c); }
        });
        io.unobserve(en.target);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
    $$('[data-reveal], .anniv, .score').forEach(function (el) { io.observe(el); });
    // contatori nell'hero partono subito
    $$('.chips [data-count]').forEach(function (c) { c.dataset.counted = '1'; setTimeout(function () { countUp(c); }, 900); });
  } else {
    $$('[data-reveal]').forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ------------------------------------------------------------------
     Header: trasparente sull'hero, pieno dopo; si nasconde scendendo
     ------------------------------------------------------------------ */
  var nav = $('#nav');
  var lastY = window.scrollY;

  /* ------------------------------------------------------------------
     Parallasse leggera + galleria orizzontale agganciata (desktop)
     ------------------------------------------------------------------ */
  var parallaxEls = reduceMotion ? [] : $$('[data-parallax]');
  var hs = $('#hscroll');
  var hsTrack = hs && $('.hscroll__track', hs);
  var pinMQ = window.matchMedia('(min-width: 980px)');
  var hsDistance = 0;

  function setupPin() {
    if (!hs) return;
    if (pinMQ.matches && !reduceMotion) {
      hs.classList.add('is-pinned');
      hsDistance = Math.max(0, hsTrack.scrollWidth - window.innerWidth);
      hs.style.height = (window.innerHeight + hsDistance) + 'px';
    } else {
      hs.classList.remove('is-pinned');
      hs.style.height = '';
      hsTrack.style.transform = '';
    }
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var y = window.scrollY;
      var vh = window.innerHeight;

      if (nav) {
        nav.classList.toggle('is-scrolled', y > 40);
        var menuOpen = root.classList.contains('menu-open');
        nav.classList.toggle('is-hidden', !menuOpen && y > lastY && y > vh * 0.8);
      }
      lastY = y;

      parallaxEls.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        var speed = parseFloat(el.dataset.parallax) || 0;
        el.style.transform = 'translate3d(0,' + ((r.top + r.height / 2 - vh / 2) * speed).toFixed(1) + 'px,0)';
      });

      if (hs && hs.classList.contains('is-pinned')) {
        var top = hs.getBoundingClientRect().top;
        var p = Math.min(1, Math.max(0, -top / (hsDistance || 1)));
        hsTrack.style.transform = 'translate3d(' + (-p * hsDistance).toFixed(1) + 'px,0,0)';
      }
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { setupPin(); onScroll(); });
  window.addEventListener('load', function () { setupPin(); onScroll(); });
  setupPin(); onScroll();

  /* ------------------------------------------------------------------
     Menu mobile
     ------------------------------------------------------------------ */
  var burger = $('.nav__burger');
  var overlay = $('#menu-overlay');
  function setMenu(open) {
    root.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    if (open) overlay.hidden = false;
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (burger && overlay) {
    burger.addEventListener('click', function () { setMenu(!root.classList.contains('menu-open')); });
    $$('a', overlay).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  /* ------------------------------------------------------------------
     Lucine della sezione serate
     ------------------------------------------------------------------ */
  (function () {
    var wire = $('#lights-wire');
    var g = $('.lights__bulbs');
    if (!wire || !g || !wire.getTotalLength) return;
    var len = wire.getTotalLength();
    var n = 22;
    for (var i = 1; i < n; i++) {
      var pt = wire.getPointAtLength(len * i / n);
      var c = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      c.setAttribute('cx', pt.x); c.setAttribute('cy', pt.y + 7);
      c.setAttribute('rx', 5); c.setAttribute('ry', 7);
      c.setAttribute('class', 'bulb');
      c.style.animationDelay = (Math.random() * 2.6).toFixed(2) + 's';
      if (i % 3 === 0) c.style.fill = '#ff9f6b';
      g.appendChild(c);
    }
  })();

  /* ------------------------------------------------------------------
     Ora italiana + stato aperto/chiuso
     ------------------------------------------------------------------ */
  function romeNow() {
    var parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: CONFIG.timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(new Date());
    var p = {};
    parts.forEach(function (x) { p[x.type] = x.value; });
    var date = new Date(Date.UTC(+p.year, +p.month - 1, +p.day));
    return { date: date, day: date.getUTCDay(), minutes: (+p.hour) * 60 + (+p.minute) };
  }
  function fmt(min) { var h = Math.floor(min / 60), m = min % 60; return h + (m ? ':' + (m < 10 ? '0' : '') + m : ''); }
  function isoDate(d) { return d.toISOString().slice(0, 10); }
  function nextOpening(now) {
    for (var i = 0; i < 8; i++) {
      var day = (now.day + i) % 7, ranges = CONFIG.hours[day];
      for (var r = 0; r < ranges.length; r++) {
        if (i > 0 || ranges[r][0] > now.minutes) return { offset: i, day: day, at: ranges[r][0] };
      }
    }
    return null;
  }
  (function renderStatus() {
    var el = $('#hero-status');
    if (!el) return;
    var now = romeNow();
    var text = $('.status-text', el);
    var open = (CONFIG.hours[now.day] || []).filter(function (r) { return now.minutes >= r[0] && now.minutes < r[1]; })[0];
    if (open) {
      el.classList.add('status--open');
      text.textContent = 'Aperto ora · fino alle ' + fmt(open[1]);
    } else {
      var n = nextOpening(now);
      el.classList.add('status--closed');
      if (n) {
        var when = n.offset === 0 ? 'oggi' : n.offset === 1 ? 'domani' : DAYS[n.day];
        text.textContent = (CONFIG.hours[now.day].length ? 'Chiuso ora' : 'Oggi chiuso') + ' · apre ' + when + ' alle ' + fmt(n.at);
      }
    }
    var row = $('#hours tr[data-day="' + now.day + '"]');
    if (row) { row.classList.add('is-today'); $('th', row).insertAdjacentHTML('beforeend', ' <span class="tiny">(oggi)</span>'); }
  })();

  /* ------------------------------------------------------------------
     WhatsApp precompilato
     ------------------------------------------------------------------ */
  function openWhatsApp(message, source) {
    track('whatsapp_click', { source: source || 'generic' });
    if (!waReady) { window.location.href = 'tel:' + CONFIG.phone; return; }
    window.location.href = 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(message);
  }
  $$('[data-wa]').forEach(function (a) {
    if (waReady) {
      a.href = 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(a.getAttribute('data-wa'));
      a.target = '_blank'; a.rel = 'noopener';
    } else {
      a.href = 'tel:' + CONFIG.phone;
    }
  });

  /* ------------------------------------------------------------------
     Modulo di prenotazione
     ------------------------------------------------------------------ */
  var form = $('#booking-form');
  if (form) {
    var dateIn = $('#f-date', form), timeSel = $('#f-time', form), people = $('#f-people', form);
    var nameIn = $('#f-name', form), dateErr = $('#f-date-error', form), nameErr = $('#f-name-error', form);
    var now = romeNow();
    dateIn.min = isoDate(now.date);

    var turno = function () { return $('input[name="turno"]:checked', form).value; };
    var toMin = function (t) { var p = t.split(':'); return (+p[0]) * 60 + (+p[1]); };
    function selectedDay() { if (!dateIn.value) return null; var d = new Date(dateIn.value + 'T00:00:00Z'); return isNaN(d) ? null : d; }

    function fillSlots() {
      var d = selectedDay();
      var isToday = d && isoDate(d) === isoDate(now.date);
      var prev = timeSel.value;
      timeSel.innerHTML = '';
      CONFIG.slots[turno()].forEach(function (t) {
        if (isToday && toMin(t) <= now.minutes + 30) return;
        var o = document.createElement('option'); o.value = o.textContent = t; timeSel.appendChild(o);
      });
      if (!timeSel.options.length) {
        var o = document.createElement('option'); o.value = ''; o.textContent = 'Nessun orario oggi'; timeSel.appendChild(o);
      } else if (prev) { timeSel.value = prev; if (!timeSel.value) timeSel.selectedIndex = 0; }
    }

    function validateDate() {
      var d = selectedDay(), msg = '';
      if (!d) msg = 'Scegli il giorno.';
      else if (isoDate(d) < isoDate(now.date)) msg = 'Questa data è già passata.';
      else if (CONFIG.hours[d.getUTCDay()].length === 0) msg = 'Il mercoledì siamo chiusi: scegli un altro giorno.';
      dateErr.textContent = msg; dateErr.hidden = !msg;
      dateIn.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }

    (function preset() {
      function hasSlot(list) { return list.some(function (t) { return toMin(t) > now.minutes + 30; }); }
      var offset = 0, service = 'pranzo';
      if (CONFIG.hours[now.day].length && hasSlot(CONFIG.slots.pranzo)) service = 'pranzo';
      else if (CONFIG.hours[now.day].length && hasSlot(CONFIG.slots.cena)) service = 'cena';
      else { offset = 1; while (CONFIG.hours[(now.day + offset) % 7].length === 0 && offset < 7) offset++; }
      dateIn.value = isoDate(new Date(now.date.getTime() + offset * 864e5));
      $('#f-' + service, form).checked = true;
      fillSlots();
    })();

    dateIn.addEventListener('change', function () { validateDate(); fillSlots(); });
    $$('input[name="turno"]', form).forEach(function (r) { r.addEventListener('change', fillSlots); });
    $$('[data-step]', form).forEach(function (b) {
      b.addEventListener('click', function () {
        var v = (parseInt(people.value, 10) || 0) + parseInt(b.getAttribute('data-step'), 10);
        people.value = Math.max(1, Math.min(60, v));
        people.classList.remove('bump'); void people.offsetWidth; people.classList.add('bump');
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = validateDate();
      var name = nameIn.value.trim();
      nameErr.textContent = name ? '' : 'Scrivi il nome per la prenotazione.';
      nameErr.hidden = !!name;
      if (!ok) { dateIn.focus(); return; }
      if (!timeSel.value) { timeSel.focus(); return; }
      if (!name) { nameIn.focus(); return; }

      var d = selectedDay();
      var dateLabel = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(d);
      var notes = $('#f-notes', form).value.trim();
      var n = Math.max(1, parseInt(people.value, 10) || 1);
      var msg = 'Ciao! Vorrei prenotare un tavolo alla Trattoria ViaVai.\n' +
        '📅 ' + dateLabel + ', ' + turno() + ' alle ' + timeSel.value + '\n' +
        '👥 ' + n + (n === 1 ? ' persona' : ' persone') + '\n' +
        '👤 ' + name + (notes ? '\n📝 ' + notes : '') + '\nGrazie!';

      track('booking_request', { party_size: n, service: turno() });
      openWhatsApp(msg, 'booking_form');
    });
  }

  /* ------------------------------------------------------------------
     Mappa caricata solo su richiesta
     ------------------------------------------------------------------ */
  var mapBtn = $('#map-load');
  if (mapBtn) {
    mapBtn.addEventListener('click', function () {
      track('map_load');
      var f = document.createElement('iframe');
      f.src = 'https://www.google.com/maps?q=Trattoria%20Viavai%2C%20Via%20Provvidenza%2014%2C%2016029%20Torriglia%20GE&output=embed';
      f.title = 'Mappa: Trattoria ViaVai, Via Provvidenza 14, Torriglia';
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      $('#map').appendChild(f);
      mapBtn.remove();
    });
  }

  var y = $('#year');
  if (y) y.textContent = romeNow().date.getUTCFullYear();
})();
