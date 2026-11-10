import { loadTrip, TYPES, dayColor, dayDate, parseDate, fmtDate, fmtMoney, esc, tilt, packedState, savePackedState } from './store.js';
import { defaultCover } from './art.js';

const $ = (s) => document.querySelector(s);
const { trip, source } = await loadTrip();
const money = (n) => fmtMoney(n, trip.currency);
const isDesktop = () => matchMedia('(min-width: 1000px)').matches;

document.title = `${trip.title} · Trip Plan`;
renderHero();
renderDaybar();
renderRoute();
renderDays();
renderFood();
renderTips();
renderPacking();
renderBudget();
const mapApi = initMap();
initReveal();
initScrollSpy();
initLightbox();

if (source === 'local') {
  $('#banner').innerHTML = `<div class="local-banner">✏️ You're seeing your unpublished edits on this device. <a href="edit.html#publish">Publish</a> so others see them too.</div>`;
}

/* ---------- hero ---------- */
function renderHero() {
  $('#heroArt').innerHTML = trip.cover ? `<img src="${trip.cover}" alt="">` : defaultCover();
  $('#title').textContent = trip.title;
  $('#subtitle').textContent = trip.subtitle;
  $('#stamp').innerHTML = `<div><small>Travel</small><span>🗾</span><strong>${esc(trip.destination || trip.title)}</strong></div>`;
  if (!trip.destination) $('#stamp').innerHTML = `<div><small>Travel</small><span>✈️</span><strong>Bon voyage</strong></div>`;

  const n = trip.days.length;
  const first = dayDate(trip, 0), last = dayDate(trip, Math.max(0, n - 1));
  $('#dates').textContent = first
    ? `📅 ${fmtDate(first, { day: 'numeric', month: 'short' })} – ${fmtDate(last, { day: 'numeric', month: 'short', year: 'numeric' })} · ${n} days`
    : `${n} days`;

  const cd = $('#countdown');
  const start = parseDate(trip.startDate);
  if (!start) { cd.remove(); return; }
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff = Math.round((start - today) / 864e5);
  if (diff > 0) {
    cd.innerHTML = `✈️ <span><span id="cdNum">0</span> days to go</span>`;
    countUp($('#cdNum'), diff);
  } else if (-diff < n) cd.textContent = `🌸 Day ${-diff + 1} of ${n} — enjoy!`;
  else cd.textContent = '📔 Trip memories';
}

function countUp(el, to) {
  const t0 = performance.now(), dur = 1200;
  const step = (t) => {
    const p = Math.min(1, (t - t0) / dur);
    el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ---------- day bar + route ---------- */
function renderDaybar() {
  $('#daybar').innerHTML = trip.days.map((d, i) => `
    <button data-day="${i}" style="--c:${dayColor(i)}">
      <span class="tape-chip">Day ${i + 1}</span><small>${esc(d.city || '')}</small>
    </button>`).join('');
  $('#daybar').addEventListener('click', (e) => {
    const b = e.target.closest('[data-day]');
    if (b) document.getElementById(`day-${b.dataset.day}`).scrollIntoView({ behavior: 'smooth' });
  });
}

function renderRoute() {
  const parts = [];
  trip.days.forEach((d, i) => {
    if (i) {
      const move = d.activities.find((a) => a.type === 'train' || a.type === 'flight');
      parts.push(`<div class="route-link" style="--i:${i}"><span>${move ? TYPES[move.type].icon : '🚶'}</span></div>`);
    }
    parts.push(`
      <button class="route-stop" data-day="${i}" style="--c:${dayColor(i)}">
        <div class="pin"><span>D${i + 1}</span></div>
        <b>${esc(d.city || '—')}</b><small>${esc(fmtDate(dayDate(trip, i)))}</small>
      </button>`);
  });
  $('#routeStrip').innerHTML = parts.join('');
  $('#routeStrip').addEventListener('click', (e) => {
    const b = e.target.closest('[data-day]');
    if (b) document.getElementById(`day-${b.dataset.day}`).scrollIntoView({ behavior: 'smooth' });
  });
}

/* ---------- itinerary ---------- */
function renderDays() {
  $('#days').innerHTML = trip.days.map((d, i) => {
    const total = d.activities.reduce((s, a) => s + (Number(a.cost) || 0), 0);
    return `
    <section class="day" id="day-${i}" data-day="${i}" style="--c:${dayColor(i)}">
      <header class="day-head reveal">
        <span class="tape-chip">Day ${i + 1}</span>
        <div><h2>${esc(d.city || 'Day ' + (i + 1))}</h2><p>${esc(fmtDate(dayDate(trip, i)))}${d.title ? ' · ' + esc(d.title) : ''}</p></div>
        ${total ? `<span class="day-total">${money(total)}</span>` : ''}
      </header>
      <ol class="timeline">
        ${d.activities.map((a, j) => actCard(a, i, j)).join('') || '<li class="stop"><p class="hint">Nothing planned yet.</p></li>'}
      </ol>
    </section>`;
  }).join('');

  $('#days').addEventListener('click', (e) => {
    const mapBtn = e.target.closest('.map-btn');
    if (mapBtn) { e.stopPropagation(); mapApi.focus(+mapBtn.dataset.d, +mapBtn.dataset.a); return; }
    const pic = e.target.closest('.polaroid');
    if (pic) { e.stopPropagation(); openLightbox(pic.querySelector('img').src, pic.dataset.caption); return; }
    const card = e.target.closest('.act');
    if (card) card.classList.toggle('open');
  });
}

function actCard(a, d, j) {
  const t = TYPES[a.type] || TYPES.other;
  const hasGeo = a.lat != null && a.lng != null && a.lat !== '';
  return `
  <li class="stop reveal" id="act-${d}-${j}">
    <span class="dot" aria-hidden="true">${t.icon}</span>
    <article class="act" tabindex="0">
      <div class="act-main">
        ${a.time ? `<div class="time">${esc(a.time)}</div>` : ''}
        <h3>${esc(a.name || 'Untitled')}</h3>
        ${a.place ? `<div class="place">📍 ${esc(a.place)}</div>` : ''}
        ${a.note ? `<p class="note">${esc(a.note)}</p>` : ''}
        <div class="act-foot">
          <span class="chip">${t.icon} ${t.label}</span>
          ${a.cost ? `<span class="chip cost">${money(a.cost)}</span>` : ''}
          ${hasGeo ? `<button class="chip map-btn" data-d="${d}" data-a="${j}">🗺️ Map</button>` : ''}
        </div>
      </div>
      ${a.photo ? `<figure class="polaroid" style="--r:${tilt(a.name + j)}" data-caption="${esc(a.name)}"><img src="${a.photo}" alt="${esc(a.name)}" loading="lazy"></figure>` : ''}
    </article>
  </li>`;
}

/* ---------- food / tips / packing ---------- */
function renderFood() {
  if (!trip.foods.length) { $('#food').hidden = true; return; }
  $('#foodRow').innerHTML = trip.foods.map((f, i) => `
    <figure class="polaroid taped" style="--r:${tilt(f.name + i)}" data-caption="${esc(f.name)}">
      ${f.photo ? `<img src="${f.photo}" alt="${esc(f.name)}" loading="lazy">` : `<div class="ph">${['🍜', '🍲', '🍵', '🍙', '🍣', '🍡', '🥟', '🍢'][i % 8]}</div>`}
      <figcaption>${esc(f.name)}</figcaption>
      ${f.note ? `<p>${esc(f.note)}</p>` : ''}
    </figure>`).join('');
  $('#foodRow').addEventListener('click', (e) => {
    const pic = e.target.closest('.polaroid');
    const img = pic?.querySelector('img');
    if (img) openLightbox(img.src, pic.dataset.caption);
  });
}

function renderTips() {
  if (!trip.tips.length) { $('#tips').hidden = true; return; }
  $('#tipList').innerHTML = trip.tips.map((t) => `<li>${esc(t)}</li>`).join('');
}

function renderPacking() {
  if (!trip.packing.length) { $('#packing').hidden = true; return; }
  const state = packedState();
  $('#packList').innerHTML = trip.packing.map((item) => `
    <li><label><input type="checkbox" value="${esc(item)}" ${state[item] ? 'checked' : ''}><span>${esc(item)}</span></label></li>`).join('');
  const update = () => {
    const boxes = [...document.querySelectorAll('#packList input')];
    const done = boxes.filter((b) => b.checked).length;
    $('#packBar').style.width = `${(done / boxes.length) * 100}%`;
    $('#packCount').textContent = done === boxes.length ? 'All packed! 🎉' : `${done}/${boxes.length}`;
  };
  $('#packList').addEventListener('change', (e) => {
    const s = packedState(); s[e.target.value] = e.target.checked; savePackedState(s); update();
  });
  update();
}

/* ---------- budget ---------- */
function renderBudget() {
  const byType = {};
  let total = 0;
  trip.days.forEach((d) => d.activities.forEach((a) => {
    const c = Number(a.cost) || 0; if (!c) return;
    const k = TYPES[a.type] ? a.type : 'other';
    byType[k] = (byType[k] || 0) + c; total += c;
  }));
  if (!total) { $('#budget').hidden = true; return; }
  const entries = Object.entries(byType).sort((a, b) => b[1] - a[1]);
  let acc = 0;
  const stops = entries.map(([k, v]) => {
    const from = (acc / total) * 100; acc += v;
    return `${TYPES[k].color} ${from}% ${(acc / total) * 100}%`;
  }).join(',');
  const dayTotals = trip.days.map((d) => d.activities.reduce((s, a) => s + (Number(a.cost) || 0), 0));
  const maxDay = Math.max(...dayTotals, 1);
  $('#budgetBox').innerHTML = `
    <div class="donut-wrap">
      <div class="donut" style="background:conic-gradient(${stops})"></div>
      <div class="donut-center"><small>Total</small><b>${money(total)}</b><small>${trip.currency}</small></div>
    </div>
    <ul class="legend">${entries.map(([k, v]) => `
      <li><i style="background:${TYPES[k].color}"></i><span>${TYPES[k].icon} ${TYPES[k].label}</span><span>${money(v)}</span></li>`).join('')}
    </ul>
    <div class="daybars">${dayTotals.map((v, i) => `
      <div style="--c:${dayColor(i)}"><span>Day ${i + 1}</span><span class="bar"><i data-w="${(v / maxDay) * 100}"></i></span><span>${money(v)}</span></div>`).join('')}
    </div>`;
}

/* ---------- map ---------- */
function initMap() {
  const wrap = $('#mapWrap'), backdrop = $('#backdrop');
  if (!window.L) { $('#fabMap').hidden = true; wrap.hidden = true; return { focus() {}, show() {} }; }

  const map = L.map('map', { zoomControl: false, scrollWheelZoom: true });
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd', maxZoom: 19,
  }).addTo(map);

  const groups = [], markers = [];
  trip.days.forEach((d, i) => {
    const c = dayColor(i), g = L.featureGroup(), pts = [];
    markers[i] = [];
    d.activities.forEach((a, j) => {
      if (a.lat == null || a.lng == null || a.lat === '') return;
      const ll = [Number(a.lat), Number(a.lng)];
      pts.push(ll);
      const m = L.marker(ll, {
        icon: L.divIcon({ className: '', html: `<div class="map-pin" style="--c:${c}"><span>${j + 1}</span></div>`, iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -28] }),
      }).bindPopup(`<b>${esc(a.name)}</b><br><small>Day ${i + 1}${a.time ? ' · ' + esc(a.time) : ''}${a.place ? ' · ' + esc(a.place) : ''}</small>`);
      m.on('click', () => flash(i, j));
      m.addTo(g);
      markers[i][j] = m;
    });
    if (pts.length > 1) L.polyline(pts, { color: c, weight: 3, dashArray: '6 8', opacity: .85 }).addTo(g);
    groups.push(g);
  });

  let current = null;
  function show(day) {
    current = day;
    groups.forEach((g, i) => (day == null || day === i ? g.addTo(map) : g.remove()));
    const shown = day == null ? groups : [groups[day]];
    const b = L.latLngBounds([]);
    shown.forEach((g) => { const gb = g.getBounds(); if (gb.isValid()) b.extend(gb); });
    if (b.isValid()) map.flyToBounds(b, { padding: [40, 40], maxZoom: 14, duration: .8 });
    document.querySelectorAll('#mapFilter button').forEach((btn) => btn.classList.toggle('active', btn.dataset.day === String(day ?? 'all')));
  }

  $('#mapFilter').innerHTML = `<button data-day="all">All days</button>` +
    trip.days.map((d, i) => `<button data-day="${i}" style="--c:${dayColor(i)}">D${i + 1} ${esc(d.city || '')}</button>`).join('');
  $('#mapFilter').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    show(b.dataset.day === 'all' ? null : +b.dataset.day);
  });

  const open = () => { wrap.classList.add('open'); backdrop.classList.add('show'); setTimeout(() => map.invalidateSize(), 460); };
  const close = () => { wrap.classList.remove('open'); backdrop.classList.remove('show'); };
  $('#fabMap').addEventListener('click', () => { open(); setTimeout(() => show(current), 470); });
  $('#mapClose').addEventListener('click', close);
  backdrop.addEventListener('click', close);

  map.setView([0, 0], 2);
  show(null);

  return {
    show(day) { if (isDesktop() && day !== current) show(day); },
    focus(d, j) {
      const go = () => {
        if (current !== null && current !== d) show(d);
        else groups[d].addTo(map);
        const m = markers[d][j];
        map.flyTo(m.getLatLng(), 15, { duration: .8 });
        setTimeout(() => m.openPopup(), 850);
      };
      if (isDesktop()) go(); else { open(); setTimeout(go, 470); }
    },
  };
}

function flash(d, j) {
  const el = document.querySelector(`#act-${d}-${j} .act`);
  if (!el) return;
  if (isDesktop()) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.add('flash', 'open');
  setTimeout(() => el.classList.remove('flash'), 1800);
}

/* ---------- motion ---------- */
function initReveal() {
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    e.target.querySelectorAll('.daybars i').forEach((i) => (i.style.width = i.dataset.w + '%'));
    io.unobserve(e.target);
  }), { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
}

function initScrollSpy() {
  const chips = [...document.querySelectorAll('#daybar button')];
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const d = +e.target.dataset.day;
    chips.forEach((c, i) => c.classList.toggle('active', i === d));
    chips[d]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    mapApi.show(d);
  }), { rootMargin: '-35% 0px -60% 0px' });
  document.querySelectorAll('.day').forEach((s) => io.observe(s));
}

function initLightbox() {
  $('#lightbox').addEventListener('click', () => $('#lightbox').classList.remove('show'));
  addEventListener('keydown', (e) => e.key === 'Escape' && $('#lightbox').classList.remove('show'));
}
function openLightbox(src, caption) {
  const lb = $('#lightbox');
  lb.querySelector('img').src = src;
  lb.querySelector('figcaption').textContent = caption || '';
  lb.classList.add('show');
}
