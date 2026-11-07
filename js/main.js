/* Trattoria Viavai — Torriglia */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     CONFIGURAZIONE
     ------------------------------------------------------------------ */
  var CONFIG = {
    // SEGNAPOSTO: numero WhatsApp del locale, formato internazionale senza "+" né spazi (es. 393331234567).
    // Il fisso 010 945 1005 NON è su WhatsApp. Finché resta la X, i pulsanti WhatsApp avviano una chiamata.
    whatsapp: '39XXXXXXXXXX',
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

  /* ------------------------------------------------------------------
     Tracciamento conversioni (GA4 / Tag Manager tramite dataLayer)
     SEGNAPOSTO: inserire lo snippet GA4 o GTM nell'<head> per raccogliere i dati.
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
     Ora italiana (anche se il visitatore è all'estero)
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
  function fmt(min) {
    var h = Math.floor(min / 60), m = min % 60;
    return h + (m ? ':' + (m < 10 ? '0' : '') + m : '');
  }
  function isoDate(d) { return d.toISOString().slice(0, 10); }

  /* ------------------------------------------------------------------
     Stato "Aperto ora / Chiuso" nel primo schermo + giorno evidenziato
     ------------------------------------------------------------------ */
  function nextOpening(now) {
    for (var i = 0; i < 8; i++) {
      var day = (now.day + i) % 7;
      var ranges = CONFIG.hours[day];
      for (var r = 0; r < ranges.length; r++) {
        if (i > 0 || ranges[r][0] > now.minutes) return { offset: i, day: day, at: ranges[r][0] };
      }
    }
    return null;
  }

  function renderStatus() {
    var el = document.getElementById('hero-status');
    if (!el) return;
    var now = romeNow();
    var text = el.querySelector('.status-text');
    var open = (CONFIG.hours[now.day] || []).filter(function (r) { return now.minutes >= r[0] && now.minutes < r[1]; })[0];

    el.classList.remove('status--open', 'status--closed');
    if (open) {
      el.classList.add('status--open');
      text.textContent = 'Aperto ora · fino alle ' + fmt(open[1]);
    } else {
      var n = nextOpening(now);
      el.classList.add('status--closed');
      if (!n) return;
      var when = n.offset === 0 ? 'oggi' : n.offset === 1 ? 'domani' : DAYS[n.day];
      var prefix = CONFIG.hours[now.day].length === 0 ? 'Oggi chiuso' : 'Chiuso ora';
      text.textContent = prefix + ' · apre ' + when + ' alle ' + fmt(n.at);
    }

    var row = document.querySelector('#hours tr[data-day="' + now.day + '"]');
    if (row) {
      row.classList.add('is-today');
      row.querySelector('th').insertAdjacentHTML('beforeend', ' <span class="tiny">(oggi)</span>');
    }
  }

  /* ------------------------------------------------------------------
     WhatsApp precompilato
     ------------------------------------------------------------------ */
  function openWhatsApp(message, source) {
    track('whatsapp_click', { source: source || 'generic' });
    if (!waReady) {
      // Fallback finché il numero WhatsApp non è configurato: chiamata al fisso
      window.location.href = 'tel:' + CONFIG.phone;
      return;
    }
    window.location.href = 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(message);
  }

  document.querySelectorAll('[data-wa]').forEach(function (a) {
    if (waReady) {
      a.href = 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(a.getAttribute('data-wa'));
      a.target = '_blank';
      a.rel = 'noopener';
    } else {
      a.href = 'tel:' + CONFIG.phone;
    }
  });
  if (!waReady) {
    var note = document.getElementById('wa-placeholder-note');
    if (note) note.hidden = false;
  }

  /* ------------------------------------------------------------------
     Modulo di prenotazione
     ------------------------------------------------------------------ */
  var form = document.getElementById('booking-form');
  if (form) {
    var dateIn = form.querySelector('#f-date');
    var timeSel = form.querySelector('#f-time');
    var people = form.querySelector('#f-people');
    var nameIn = form.querySelector('#f-name');
    var dateErr = form.querySelector('#f-date-error');
    var nameErr = form.querySelector('#f-name-error');
    var now = romeNow();

    dateIn.min = isoDate(now.date);

    function turno() { return form.querySelector('input[name="turno"]:checked').value; }

    function selectedDay() {
      if (!dateIn.value) return null;
      var d = new Date(dateIn.value + 'T00:00:00Z');
      return isNaN(d) ? null : d;
    }

    function fillSlots() {
      var d = selectedDay();
      var isToday = d && isoDate(d) === isoDate(now.date);
      var prev = timeSel.value;
      timeSel.innerHTML = '';
      CONFIG.slots[turno()].forEach(function (t) {
        var parts = t.split(':');
        var mins = (+parts[0]) * 60 + (+parts[1]);
        if (isToday && mins <= now.minutes + 30) return;
        var o = document.createElement('option');
        o.value = o.textContent = t;
        timeSel.appendChild(o);
      });
      if (!timeSel.options.length) {
        var o = document.createElement('option');
        o.value = '';
        o.textContent = 'Nessun orario oggi';
        timeSel.appendChild(o);
      } else if (prev) {
        timeSel.value = prev;
        if (!timeSel.value) timeSel.selectedIndex = 0;
      }
    }

    function validateDate() {
      var d = selectedDay();
      var msg = '';
      if (!d) msg = 'Scegli il giorno.';
      else if (isoDate(d) < isoDate(now.date)) msg = 'Questa data è già passata.';
      else if (CONFIG.hours[d.getUTCDay()].length === 0) msg = 'Il mercoledì siamo chiusi: scegli un altro giorno.';
      dateErr.textContent = msg;
      dateErr.hidden = !msg;
      dateIn.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }

    // Valori iniziali: prossimo servizio utile
    (function preset() {
      function toMin(t) { var p = t.split(':'); return (+p[0]) * 60 + (+p[1]); }
      function hasSlot(list) { return list.some(function (t) { return toMin(t) > now.minutes + 30; }); }
      var offset = 0, service = 'pranzo';
      if (CONFIG.hours[now.day].length && hasSlot(CONFIG.slots.pranzo)) service = 'pranzo';
      else if (CONFIG.hours[now.day].length && hasSlot(CONFIG.slots.cena)) service = 'cena';
      else {
        offset = 1;
        while (CONFIG.hours[(now.day + offset) % 7].length === 0 && offset < 7) offset++;
      }
      dateIn.value = isoDate(new Date(now.date.getTime() + offset * 864e5));
      form.querySelector('#f-' + service).checked = true;
      fillSlots();
    })();

    dateIn.addEventListener('change', function () { validateDate(); fillSlots(); });
    form.querySelectorAll('input[name="turno"]').forEach(function (r) { r.addEventListener('change', fillSlots); });

    form.querySelectorAll('[data-step]').forEach(function (b) {
      b.addEventListener('click', function () {
        var v = (parseInt(people.value, 10) || 0) + parseInt(b.getAttribute('data-step'), 10);
        people.value = Math.max(1, Math.min(60, v));
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
      var notes = form.querySelector('#f-notes').value.trim();
      var n = Math.max(1, parseInt(people.value, 10) || 1);

      var msg = 'Ciao! Vorrei prenotare un tavolo alla Trattoria Viavai.\n' +
        '📅 ' + dateLabel + ', ' + turno() + ' alle ' + timeSel.value + '\n' +
        '👥 ' + n + (n === 1 ? ' persona' : ' persone') + '\n' +
        '👤 ' + name +
        (notes ? '\n📝 ' + notes : '') +
        '\nGrazie!';

      track('booking_request', { party_size: n, service: turno() });
      openWhatsApp(msg, 'booking_form');
    });
  }

  /* ------------------------------------------------------------------
     Mappa caricata solo su richiesta (niente cookie Google finché non serve)
     ------------------------------------------------------------------ */
  var mapBtn = document.getElementById('map-load');
  if (mapBtn) {
    mapBtn.addEventListener('click', function () {
      track('map_load');
      var f = document.createElement('iframe');
      f.src = 'https://www.google.com/maps?q=Trattoria%20Viavai%2C%20Via%20Provvidenza%2014%2C%2016029%20Torriglia%20GE&output=embed';
      f.title = 'Mappa: Trattoria Viavai, Via Provvidenza 14, Torriglia';
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      document.getElementById('map').appendChild(f);
      mapBtn.remove();
    });
  }

  renderStatus();
  var y = document.getElementById('year');
  if (y) y.textContent = romeNow().date.getUTCFullYear();
})();
