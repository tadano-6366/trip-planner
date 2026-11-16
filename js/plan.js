import { loadTrip, TYPES, dayColor, dayDate, parseDate, fmtDate, fmtMoney, esc, tilt, packedState, savePackedState, WEEKDAYS } from './store.js';
import { defaultCover } from './art.js';
import { dayForecast, dayLabel, rainAt, describe, OUTDOOR } from './weather.js';
import { initThemeToggle, currentTheme } from './theme.js';
import { mapStyle } from './mapstyle.js';

const $ = (s) => document.querySelector(s);
const { trip, source } = await loadTrip();
const money = (n) => fmtMoney(n, trip.currency);
const isDesktop = () => matchMedia('(min-width: 1000px)').matches;

// "Now" can be faked for previewing trip days: index.html?now=2026-11-19T12:40
const NOW_OVERRIDE = new URLSearchParams(location.search).get('now');
const now = () => (NOW_OVERRIDE ? new Date(NOW_OVERRIDE) : new Date());
const sameDay = (a, b) => a && b && a.toDateString() === b.toDateString();
const todayIdx = () => trip.days.findIndex((_, i) => sameDay(dayDate(trip, i), now()));
const minutes = (hhmm) => { const [h, m] = (hhmm || '').split(':').map(Number); return h * 60 + (m || 0); };
const hasGeo = (a) => a.lat != null && a.lng != null && a.lat !== '';
const closedToday = (a, d) => { const dt = dayDate(trip, d); return dt && (a.closed || []).includes(dt.getDay()); };

document.title = `${trip.title} · Trip Plan`;
initThemeToggle($('#themeToggle'));
renderHero();
renderDaybar();
renderRoute();
renderDays();
renderToday();
renderFood();
renderTips();
renderPacking();
renderBudget();
const mapApi = initMap();
initReveal();
initScrollSpy();
initLightbox();
loadWeather();
setInterval(renderToday, 60e3);

if (source === 'local') {
  $('#banner').innerHTML = `<div class="local-banner">✏️ You're seeing your unpublished edits on this device. <a href="edit.html#publish">Publish</a> so others see them too.</div>`;
}

/* ---------- hero ---------- */
function renderHero() {
  $('#heroArt').innerHTML = trip.cover ? `<img src="${trip.cover}" alt="">` : defaultCover();
  $('#title').textContent = trip.title;
  $('#subtitle').textContent = trip.subtitle;
  $('#stamp').innerHTML = trip.destination
    ? `<div><small>Travel</small><span>🌴</span><strong>${esc(trip.destination)}</strong></div>`
    : `<div><small>Travel</small><span>✈️</span><strong>Bon voyage</strong></div>`;

  const n = trip.days.length;
  const first = dayDate(trip, 0), last = dayDate(trip, Math.max(0, n - 1));
  $('#dates').textContent = first
    ? `📅 ${fmtDate(first, { day: 'numeric', month: 'short' })} – ${fmtDate(last, { day: 'numeric', month: 'short', year: 'numeric' })} · ${n} days`
    : `${n} days`;

  const cd = $('#countdown');
  const start = parseDate(trip.startDate);
  if (!start) { cd.remove(); return; }
  const today = now(); today.setHours(0, 0, 0, 0);
  const diff = Math.round((start - today) / 864e5);
  if (diff > 0) {
    cd.innerHTML = diff === 1 ? '✈️ Tomorrow!' : `✈️ <span><span id="cdNum">0</span> days to go</span>`;
    if (diff > 1) countUp($('#cdNum'), diff);
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
function goToDay(i) {
  openDay(i, true);
  document.getElementById(`day-${i}`).scrollIntoView({ behavior: 'smooth' });
}

function renderDaybar() {
  const t = todayIdx();
  $('#daybar').innerHTML = trip.days.map((d, i) => `
    <button data-day="${i}" style="--c:${dayColor(i)}">
      <span class="tape-chip">Day ${i + 1}</span><small>${i === t ? '⭐ Today' : esc(d.city || '')}</small>
    </button>`).join('');
  $('#daybar').addEventListener('click', (e) => {
    const b = e.target.closest('[data-day]');
    if (b) goToDay(+b.dataset.day);
  });
}

function renderRoute() {
  const parts = [];
  trip.days.forEach((d, i) => {
    if (i) {
      const first = d.activities[0];
      const icon = first && (first.type === 'train' || first.type === 'flight') ? TYPES[first.type].icon : '🚗';
      parts.push(`<div class="route-link" style="--i:${i}"><span>${icon}</span></div>`);
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
    if (b) goToDay(+b.dataset.day);
  });
}

/* ---------- itinerary (days folded; today open) ---------- */
function renderDays() {
  const t = todayIdx();
  const today = now(); today.setHours(0, 0, 0, 0);
  $('#days').innerHTML = trip.days.map((d, i) => {
    const total = d.activities.reduce((s, a) => s + (Number(a.cost) || 0), 0);
    const date = dayDate(trip, i);
    const past = date && date < today;
    const open = i === t;
    const closedCount = d.activities.filter((a) => closedToday(a, i)).length;
    return `
    <section class="day ${open ? '' : 'folded'} ${past ? 'past' : ''} ${i === t ? 'is-today' : ''}" id="day-${i}" data-day="${i}" style="--c:${dayColor(i)}">
      <button class="day-head reveal" data-toggle="${i}" aria-expanded="${open}" aria-controls="tl-${i}">
        <span class="tape-chip">Day ${i + 1}</span>
        <span class="day-titles">
          <span class="day-city">${esc(d.city || 'Day ' + (i + 1))}${i === t ? ' <em class="today-pill">Today</em>' : ''}</span>
          <span class="day-sub">${esc(fmtDate(date))}${d.title ? ' · ' + esc(d.title) : ''}</span>
          <span class="day-meta">
            <span class="wx-day" data-day="${i}"></span>
            ${total ? `<span class="day-total">${money(total)}</span>` : ''}
            ${closedCount ? `<span class="closed-count">⚠️ ${closedCount} closed</span>` : ''}
          </span>
        </span>
        <span class="chev" aria-hidden="true">▾</span>
      </button>
      <p class="day-peek">${d.activities.map((a) => `${(TYPES[a.type] || TYPES.other).icon} ${esc(a.name)}`).join('<span> · </span>') || 'Nothing planned yet.'}</p>
      <ol class="timeline" id="tl-${i}">
        ${d.activities.map((a, j) => actCard(a, i, j)).join('') || '<li class="stop"><p class="hint">Nothing planned yet.</p></li>'}
      </ol>
    </section>`;
  }).join('');

  $('#days').addEventListener('click', (e) => {
    const head = e.target.closest('[data-toggle]');
    if (head) { openDay(+head.dataset.toggle, null); return; }
    const peek = e.target.closest('.day-peek');
    if (peek) { openDay(+peek.closest('.day').dataset.day, true); return; }
    const mapBtn = e.target.closest('.map-btn');
    if (mapBtn) { e.stopPropagation(); mapApi.focus(+mapBtn.dataset.d, +mapBtn.dataset.a); return; }
    if (e.target.closest('.waze-btn')) return; // let the link open Waze without toggling the card
    const pic = e.target.closest('.polaroid');
    if (pic) { e.stopPropagation(); openLightbox(pic.querySelector('img').src, pic.dataset.caption); return; }
    const card = e.target.closest('.act');
    if (card) card.classList.toggle('open');
  });
}

// open: true = open, false = fold, null = toggle
function openDay(i, open) {
  const sec = document.getElementById(`day-${i}`);
  if (!sec) return;
  const willOpen = open == null ? sec.classList.contains('folded') : open;
  sec.classList.toggle('folded', !willOpen);
  sec.querySelector('.day-head').setAttribute('aria-expanded', willOpen);
}

// Opens Waze with directions to this stop: the app on phones, waze.com on computers.
function wazeLink(a) {
  const url = `https://waze.com/ul?ll=${Number(a.lat)},${Number(a.lng)}&navigate=yes`;
  return `<a class="waze-btn" href="${url}" target="_blank" rel="noopener" title="Navigate with Waze" aria-label="Navigate to ${esc(a.name)} with Waze">
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <rect x="11" y="11" width="2.4" height="11" rx="1.2" fill="#6b4f3a"/>
      <circle cx="12.2" cy="8.5" r="6.5" fill="#e0453a"/>
      <path d="M12.2 8.5 m-4 0 a4 4 0 0 1 4-4" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".9"/>
      <path d="M8.6 8.5 a3.6 3.6 0 0 0 6.6 2" fill="none" stroke="#b52f26" stroke-width="1.2" stroke-linecap="round"/>
      <circle cx="10" cy="6.2" r="1.1" fill="#fff" opacity=".85"/>
    </svg></a>`;
}

function closedNote(a, d) {
  if (!closedToday(a, d)) return '';
  return `<p class="closed-warn">⚠️ Usually closed on ${WEEKDAYS[dayDate(trip, d).getDay()]}s — check before going</p>`;
}

function actCard(a, d, j) {
  const t = TYPES[a.type] || TYPES.other;
  return `
  <li class="stop reveal" id="act-${d}-${j}">
    <span class="dot" aria-hidden="true">${t.icon}</span>
    <article class="act ${closedToday(a, d) ? 'is-closed' : ''}" tabindex="0">
      <div class="act-main">
        ${a.time ? `<div class="time">${esc(a.time)}</div>` : ''}
        <h3>${esc(a.name || 'Untitled')}</h3>
        ${a.place ? `<div class="place">📍 ${esc(a.place)}</div>` : ''}
        ${closedNote(a, d)}
        ${a.note ? `<p class="note">${esc(a.note)}</p>` : ''}
        <div class="act-foot">
          <span class="chip">${t.icon} ${t.label}</span>
          ${a.cost ? `<span class="chip cost">${money(a.cost)}</span>` : ''}
          <span class="wx-act" data-d="${d}" data-a="${j}"></span>
          ${hasGeo(a) ? `<button class="chip map-btn" data-d="${d}" data-a="${j}">🗺️ Map</button>${wazeLink(a)}` : ''}
        </div>
      </div>
      ${a.photo ? `<figure class="polaroid" style="--r:${tilt(a.name + j)}" data-caption="${esc(a.name)}"><img src="${a.photo}" alt="${esc(a.name)}" loading="lazy"></figure>` : ''}
    </article>
  </li>`;
}

/* ---------- today: "Next up" card (only on trip days) ---------- */
function renderToday() {
  const box = $('#today');
  const d = todayIdx();
  if (d < 0) { box.hidden = true; return; }
  box.hidden = false;
  const day = trip.days[d];
  const n = now(), nowMin = n.getHours() * 60 + n.getMinutes();
  const timed = day.activities.map((a, j) => ({ a, j })).filter(({ a }) => a.time);
  const next = timed.find(({ a }) => minutes(a.time) > nowMin);
  const current = [...timed].reverse().find(({ a }) => minutes(a.time) <= nowMin && nowMin - minutes(a.time) < 120);

  const until = (a) => {
    const m = minutes(a.time) - nowMin;
    return m < 60 ? `in ${m} min` : `in ${Math.floor(m / 60)}h ${m % 60 ? (m % 60) + 'm' : ''}`.trim();
  };
  const stopRow = ({ a, j }, label, when) => `
    <div class="today-stop">
      <span class="today-label">${label}</span>
      <div class="today-main">
        <b>${esc(a.time)} · ${esc(a.name)}</b>
        <small>${when}${a.place ? ' · 📍 ' + esc(a.place) : ''}</small>
        ${closedNote(a, d)}
      </div>
      ${hasGeo(a) ? `<span class="today-actions"><button class="chip map-btn" data-d="${d}" data-a="${j}">🗺️</button>${wazeLink(a)}</span>` : ''}
    </div>`;

  let body = '';
  if (current && current !== next) body += stopRow(current, 'Now', 'happening now');
  if (next) body += stopRow(next, 'Next', until(next.a));
  if (!next) {
    const tomorrow = trip.days[d + 1];
    body += `<p class="today-done">${tomorrow
      ? `That's everything for today 🌙 Tomorrow: <b>${esc(tomorrow.city || 'Day ' + (d + 2))}</b>${tomorrow.activities[0] ? ', starting ' + esc(tomorrow.activities[0].time || '') + ' with ' + esc(tomorrow.activities[0].name) : ''}.`
      : 'Last stop done — safe travels home! ✈️'}</p>`;
  }
  box.innerHTML = `
    <div class="today-card taped" style="--c:${dayColor(d)}">
      <div class="today-head">
        <span class="tape-chip">Today · Day ${d + 1}</span>
        <button class="btn small ghost" data-goto="${d}">Full day ↓</button>
        <span class="wx-today"></span>
      </div>
      ${body}
    </div>`;
  box.onclick = (e) => {
    const g = e.target.closest('[data-goto]');
    if (g) return goToDay(+g.dataset.goto);
    const m = e.target.closest('.map-btn');
    if (m) mapApi.focus(+m.dataset.d, +m.dataset.a);
  };
  dayForecast(trip, d).then((wx) => { const el = $('.wx-today'); if (el) el.textContent = dayLabel(wx); });
}

/* ---------- weather ---------- */
function loadWeather() {
  trip.days.forEach((d, i) => {
    dayForecast(trip, i).then((wx) => {
      const head = document.querySelector(`.wx-day[data-day="${i}"]`);
      if (head) head.textContent = dayLabel(wx);
      if (!wx || wx.status) return;
      d.activities.forEach((a, j) => {
        const pop = rainAt(wx, a.time);
        if (pop == null) return;
        const el = document.querySelector(`.wx-act[data-d="${i}"][data-a="${j}"]`);
        if (!el) return;
        const [icon] = describe(wx.hours[+a.time.slice(0, 2)].code);
        const wet = pop >= 60 && OUTDOOR.has(a.type);
        el.innerHTML = `<span class="chip wx ${wet ? 'wet' : ''}" title="Chance of rain at ${esc(a.time)}">${icon} ${pop}% rain${wet ? ' · bring umbrella' : ''}</span>`;
      });
    });
  });
}

/* ---------- food / tips / packing ---------- */
function renderFood() {
  if (!trip.foods.length) { $('#food').hidden = true; return; }
  $('#foodRow').innerHTML = trip.foods.map((f, i) => `
    <figure class="polaroid taped" style="--r:${tilt(f.name + i)}" data-caption="${esc(f.name)}">
      ${f.photo ? `<img src="${f.photo}" alt="${esc(f.name)}" loading="lazy">` : `<div class="ph">${['🍜', '🍲', '🍛', '🍧', '🍤', '🥘', '🍢', '🥥'][i % 8]}</div>`}
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
  addTiles(map);

  const groups = [], markers = [];
  trip.days.forEach((d, i) => {
    const c = dayColor(i), g = L.featureGroup(), pts = [];
    markers[i] = [];
    d.activities.forEach((a, j) => {
      if (!hasGeo(a)) return;
      const ll = [Number(a.lat), Number(a.lng)];
      pts.push(ll);
      const m = L.marker(ll, {
        icon: L.divIcon({ className: '', html: `<div class="map-pin" style="--c:${c}"><span>${j + 1}</span></div>`, iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -28] }),
      }).bindPopup(`<b>${esc(a.name)}</b><br><small>Day ${i + 1}${a.time ? ' · ' + esc(a.time) : ''}${a.place ? ' · ' + esc(a.place) : ''}</small>${closedToday(a, i) ? `<br><small class="closed-warn">⚠️ Usually closed on ${WEEKDAYS[dayDate(trip, i).getDay()]}s</small>` : ''}<div class="popup-actions">${wazeLink(a)}</div>`);
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
  const t = todayIdx();
  show(t >= 0 ? t : null);

  return {
    show(day) { if (isDesktop() && day !== current) show(day); },
    focus(d, j) {
      openDay(d, true);
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

// Map background. First choice: OpenFreeMap vector map (free, no API key, drawn with
// WebGL so it stays sharp on Retina/phone screens). Its look follows the edit page's
// "Map colours" setting and night mode. If WebGL or the style can't load, fall back to
// OpenStreetMap picture tiles; if those fail too, show a notice.
function osmAttr() {
  return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
}

async function addTiles(map) {
  if (!window.maplibregl || !L.maplibreGL || !hasWebGL()) return addRasterTiles(map);
  let done = false;
  const vector = L.maplibreGL({
    style: await mapStyle(trip.mapStyle, currentTheme()),
    attribution: `<a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> ${osmAttr()}`,
  }).addTo(map);
  const fallBack = () => {
    if (done) return;
    done = true;
    map.removeLayer(vector);
    addRasterTiles(map);
  };
  // The vector engine is only created once the Leaflet map has a view.
  map.whenReady(() => {
    const gl = vector.getMaplibreMap();
    if (!gl) return fallBack();
    gl.once('load', () => { done = true; });
    gl.on('error', () => { if (!done) fallBack(); });
    setTimeout(() => { if (!done && !gl.isStyleLoaded()) fallBack(); }, 8000);
    addEventListener('themechange', async () => {
      if (map.hasLayer(vector)) gl.setStyle(await mapStyle(trip.mapStyle, currentTheme()));
    });
  });
}

function addRasterTiles(map) {
  let loaded = 0, failed = 0;
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: osmAttr(), maxZoom: 19 })
    .on('tileload', () => { loaded++; })
    .on('tileerror', () => { if (!loaded && ++failed >= 4) showMapNotice(map); })
    .addTo(map);
}

function hasWebGL() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); }
  catch { return false; }
}

function showMapNotice(map) {
  if (document.querySelector('.map-notice')) return;
  const n = document.createElement('div');
  n.className = 'map-notice';
  n.innerHTML = `<b>Map images can't load on this network.</b><br>Pins and routes still work. Try turning off an ad blocker or switching from Wi-Fi to mobile data.`;
  map.getContainer().appendChild(n);
}

function flash(d, j) {
  openDay(d, true);
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
