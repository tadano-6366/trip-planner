import { loadTrip, loadPublished, saveLocal, clearLocal, normalize, TYPES, dayColor, dayDate, fmtDate, esc } from './store.js';
import { STYLES, fileToImage, stylize } from './paint.js';
import { defaultCover } from './art.js';

const $ = (s, el = document) => el.querySelector(s);
const app = $('#app');
let { trip } = await loadTrip();
const openDays = new Set([0]);
let coverOriginal = null;     // kept in memory so the cover can be re-styled without re-uploading
let coverOriginalUrl = null;

const CURRENCIES = ['JPY', 'CNY', 'USD', 'EUR', 'GBP', 'MYR', 'SGD', 'HKD', 'TWD', 'KRW', 'THB', 'AUD', 'CAD', 'NZD', 'IDR', 'VND', 'PHP', 'INR'];
const STYLE_ICONS = { original: '📷', watercolor: '🎨', sketch: '✏️', anime: '🌸' };
const STYLE_HINTS = { original: 'Keep photos as they are', watercolor: 'Soft painted postcard', sketch: 'Pencil & paper', anime: 'Bright cel-shaded look' };

render();

/* ---------- rendering ---------- */
function render() {
  app.innerHTML = tripPanel() + daysPanel() + foodPanel() + listsPanel() + dataPanel();
  initSortables();
}

function tripPanel() {
  return `
  <section class="panel">
    <h2 class="label"><b>1</b>Trip</h2>
    <div class="card">
      <label class="field"><span>Trip name</span><input type="text" class="big" data-bind="title" value="${esc(trip.title)}"></label>
      <label class="field"><span>Tagline</span><input type="text" data-bind="subtitle" value="${esc(trip.subtitle)}"></label>
      <div class="grid3">
        <label class="field"><span>Destination</span><input type="text" data-bind="destination" value="${esc(trip.destination)}"></label>
        <label class="field"><span>Start date</span><input type="date" data-bind="startDate" value="${esc(trip.startDate || '')}"></label>
        <label class="field"><span>Currency</span><select data-bind="currency">
          ${[...new Set([trip.currency, ...CURRENCIES])].map((c) => `<option ${c === trip.currency ? 'selected' : ''}>${c}</option>`).join('')}
        </select></label>
      </div>

      <div class="field"><span>Art style for your photos</span>
        <div class="style-picker">${Object.entries(STYLES).map(([k, s]) => `
          <button class="style-opt ${trip.artStyle === k ? 'active' : ''}" data-act="style" data-style="${k}">
            <i>${STYLE_ICONS[k]}</i><b>${s.label}</b><small>${STYLE_HINTS[k]}</small>
          </button>`).join('')}
        </div>
      </div>
      <p class="hint">Every photo you add (cover, activities, food) is turned into this style automatically — right on your device.</p>

      <div class="field"><span>Cover picture</span>${photoCtl('cover', trip.cover)}</div>
      ${coverOriginalUrl && trip.cover ? `
        <div class="compare" style="--x:50%">
          <img src="${coverOriginalUrl}" alt="Original"><img class="after" src="${trip.cover}" alt="Styled">
          <span class="tag" style="left:8px">Original</span><span class="tag" style="right:8px">${STYLES[trip.artStyle].label}</span>
          <div class="divider"></div><input type="range" min="0" max="100" value="50" aria-label="Compare" data-act="compare">
        </div>` : `<div class="cover-preview">${trip.cover ? `<img src="${trip.cover}" alt="">` : defaultCover()}</div>`}
    </div>
  </section>`;
}

function daysPanel() {
  return `
  <section class="panel">
    <div class="panel-head"><h2 class="label"><b>2</b>Days</h2><button class="btn small" data-act="add-day">＋ Add day</button></div>
    <p class="hint">Drag ⋮⋮ to reorder days or move activities between days.</p>
    <div id="dayList">${trip.days.map(dayEditor).join('')}</div>
    <button class="btn primary" data-act="add-day">＋ Add day</button>
  </section>`;
}

function dayEditor(day, d) {
  const date = fmtDate(dayDate(trip, d));
  return `
  <div class="day-ed ${openDays.has(d) ? 'open' : ''}" data-d="${d}" style="--c:${dayColor(d)}">
    <div class="day-ed-head">
      <span class="grip day-grip" title="Drag to reorder">⋮⋮</span>
      <button class="day-toggle" data-act="toggle-day" data-d="${d}">
        <span class="tape-chip">Day ${d + 1}</span>
        <span class="day-info"><span class="day-sum">${esc(day.city || 'Untitled')}</span>
        <small>${date ? date + ' · ' : ''}${day.activities.length} stops</small></span>
        <span class="chev">▾</span>
      </button>
      <button class="icon-btn" data-act="del-day" data-d="${d}" title="Delete day">🗑️</button>
    </div>
    <div class="day-ed-body">
      <div class="grid2">
        <label class="field"><span>City</span><input type="text" data-bind="days.${d}.city" value="${esc(day.city)}"></label>
        <label class="field"><span>Theme of the day</span><input type="text" data-bind="days.${d}.title" value="${esc(day.title)}"></label>
      </div>
      <ul class="act-list" data-d="${d}">${day.activities.map((a, j) => actEditor(a, d, j)).join('')}</ul>
      <div class="btn-row">
        <button class="btn small primary" data-act="add-act" data-d="${d}">＋ Add activity</button>
        <button class="btn small ghost" data-act="sort-time" data-d="${d}">🕒 Sort by time</button>
      </div>
    </div>
  </div>`;
}

function actEditor(a, d, j) {
  const p = `days.${d}.activities.${j}`;
  const hasGeo = a.lat != null && a.lat !== '';
  return `
  <li class="act-ed" data-d="${d}" data-a="${j}">
    <div class="act-ed-top">
      <span class="grip act-grip" title="Drag">⋮⋮</span>
      <input type="time" data-bind="${p}.time" value="${esc(a.time || '')}">
      <select data-bind="${p}.type">${Object.entries(TYPES).map(([k, t]) => `<option value="${k}" ${a.type === k ? 'selected' : ''}>${t.icon} ${t.label}</option>`).join('')}</select>
      <button class="icon-btn" data-act="del-act" data-d="${d}" data-a="${j}" title="Delete">✕</button>
    </div>
    <input type="text" class="big" placeholder="What's the plan?" data-bind="${p}.name" value="${esc(a.name)}">
    <div class="place-row">
      <input type="text" placeholder="Place or address" data-bind="${p}.place" value="${esc(a.place)}">
      <button class="btn small" data-act="geo" data-d="${d}" data-a="${j}">🔍 Find</button>
    </div>
    <div class="coords ${hasGeo ? 'ok' : ''}">${hasGeo ? `📍 On the map (${(+a.lat).toFixed(4)}, ${(+a.lng).toFixed(4)})` : 'Not on the map yet — tap Find'}</div>
    <div class="geo-results"></div>
    <textarea placeholder="Notes, tips, booking info…" data-bind="${p}.note">${esc(a.note)}</textarea>
    <div class="bottom-row">
      <label class="field"><span>Cost (${esc(trip.currency)})</span><input type="number" inputmode="decimal" min="0" data-bind="${p}.cost" data-type="num" value="${a.cost ?? ''}"></label>
      ${photoCtl(`${p}.photo`, a.photo)}
    </div>
  </li>`;
}

function photoCtl(path, val) {
  return `
  <div class="photo-ctl">
    ${val ? `<img src="${val}" alt="">` : '<span class="ph-mini">🖼️</span>'}
    <label class="btn small">${val ? 'Change' : 'Add photo'}<input type="file" accept="image/*" data-photo="${path}" hidden></label>
    ${val ? `<button class="btn small ghost" data-act="rm-photo" data-path="${path}">Remove</button>` : ''}
  </div>`;
}

function foodPanel() {
  return `
  <section class="panel">
    <div class="panel-head"><h2 class="label"><b>3</b>Must-eat</h2><button class="btn small" data-act="add-food">＋ Add food</button></div>
    <ul class="list-ed" id="foodList">${trip.foods.map((f, i) => `
      <li data-i="${i}">
        <div class="row"><span class="grip food-grip">⋮⋮</span><input type="text" class="big" placeholder="Dish" data-bind="foods.${i}.name" value="${esc(f.name)}">
          <button class="icon-btn" data-act="del-food" data-i="${i}" title="Delete">✕</button></div>
        <input type="text" placeholder="Where / why" data-bind="foods.${i}.note" value="${esc(f.note)}">
        ${photoCtl(`foods.${i}.photo`, f.photo)}
      </li>`).join('')}
    </ul>
  </section>`;
}

function listsPanel() {
  return `
  <section class="panel">
    <h2 class="label"><b>4</b>Tips & packing</h2>
    <div class="card">
      <label class="field"><span>Good to know (one per line)</span><textarea rows="5" data-bind="tips" data-type="lines">${esc(trip.tips.join('\n'))}</textarea></label>
      <label class="field"><span>Packing list (one per line)</span><textarea rows="6" data-bind="packing" data-type="lines">${esc(trip.packing.join('\n'))}</textarea></label>
    </div>
  </section>`;
}

function dataPanel() {
  const gh = ghSettings();
  return `
  <section class="panel" id="publish">
    <h2 class="label"><b>5</b>Save & share</h2>
    <div class="card">
      <p class="hint">Your edits save automatically on this device. To show them to everyone, publish to GitHub (or download the file and commit it as <code>data/trip.json</code>).</p>
      <div class="btn-row">
        <button class="btn primary" data-act="publish">☁️ Publish to GitHub</button>
        <button class="btn" data-act="export">⬇️ Download trip.json</button>
        <label class="btn">⬆️ Import<input type="file" accept="application/json,.json" data-act="import" hidden></label>
        <button class="btn danger" data-act="reset">↺ Discard my edits</button>
      </div>
      <details class="gh" ${gh.token ? '' : 'open'}>
        <summary>GitHub settings</summary>
        <p class="hint">Needs a <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">fine-grained token</a> with <b>Contents: Read and write</b> on this repo only. It's stored only in this browser.</p>
        <div class="grid3">
          <label class="field"><span>Owner</span><input type="text" data-gh="owner" value="${esc(gh.owner)}" placeholder="your-username"></label>
          <label class="field"><span>Repo</span><input type="text" data-gh="repo" value="${esc(gh.repo)}" placeholder="trip-planner"></label>
          <label class="field"><span>Branch</span><input type="text" data-gh="branch" value="${esc(gh.branch)}" placeholder="main"></label>
        </div>
        <label class="field"><span>Token</span><input type="password" data-gh="token" value="${esc(gh.token)}" autocomplete="off"></label>
      </details>
    </div>
  </section>`;
}

/* ---------- saving ---------- */
let saveTimer;
function save(now = false) {
  $('#saveState').textContent = 'Saving…';
  $('#saveState').className = 'save-state';
  clearTimeout(saveTimer);
  const run = () => {
    try {
      saveLocal(trip);
      $('#saveState').textContent = 'Saved ✓';
      $('#saveState').className = 'save-state saved';
    } catch (e) {
      $('#saveState').textContent = 'Not saved';
      toast('Storage is full — remove some photos or use smaller ones.');
    }
  };
  now ? run() : (saveTimer = setTimeout(run, 350));
}

function setPath(path, val) {
  const ks = path.split('.');
  let o = trip;
  for (let i = 0; i < ks.length - 1; i++) o = o[ks[i]];
  o[ks.at(-1)] = val;
}

/* ---------- events ---------- */
app.addEventListener('input', (e) => {
  const el = e.target;
  if (el.dataset.act === 'compare') { el.closest('.compare').style.setProperty('--x', el.value + '%'); return; }
  if (el.dataset.gh) { const gh = ghSettings(); gh[el.dataset.gh] = el.value.trim(); localStorage.setItem('tripPlanner.gh', JSON.stringify(gh)); return; }
  if (!el.dataset.bind) return;
  let v = el.value;
  if (el.dataset.type === 'num') v = v === '' ? null : Number(v);
  if (el.dataset.type === 'lines') v = v.split('\n').map((s) => s.trim()).filter(Boolean);
  setPath(el.dataset.bind, v);
  // live-update the collapsed day header
  const m = el.dataset.bind.match(/^days\.(\d+)\.city$/);
  if (m) $(`.day-ed[data-d="${m[1]}"] .day-sum`).textContent = v || 'Untitled';
  save();
});

app.addEventListener('change', async (e) => {
  const el = e.target;
  if (el.dataset.bind === 'startDate' || el.dataset.bind === 'currency') render();
  if (el.dataset.photo && el.files[0]) await addPhoto(el.dataset.photo, el.files[0]);
  if (el.dataset.act === 'import' && el.files[0]) {
    try {
      trip = normalize(JSON.parse(await el.files[0].text()));
      save(true); render(); toast('Trip imported ✓');
    } catch { toast('That file is not a valid trip.json'); }
  }
});

app.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-act]');
  if (!b || b.tagName === 'INPUT') return;
  const d = +b.dataset.d, j = +b.dataset.a, i = +b.dataset.i;
  switch (b.dataset.act) {
    case 'toggle-day':
      openDays.has(d) ? openDays.delete(d) : openDays.add(d);
      b.closest('.day-ed').classList.toggle('open');
      return;
    case 'add-day':
      trip.days.push({ city: '', title: '', activities: [] });
      openDays.add(trip.days.length - 1);
      break;
    case 'del-day':
      if (!confirm(`Delete Day ${d + 1} and its ${trip.days[d].activities.length} activities?`)) return;
      trip.days.splice(d, 1);
      break;
    case 'add-act':
      trip.days[d].activities.push({ time: '', type: 'sight', name: '', place: '', note: '', cost: null });
      break;
    case 'del-act':
      if (trip.days[d].activities[j].name && !confirm(`Delete "${trip.days[d].activities[j].name}"?`)) return;
      trip.days[d].activities.splice(j, 1);
      break;
    case 'sort-time':
      trip.days[d].activities.sort((x, y) => (x.time || '99').localeCompare(y.time || '99'));
      break;
    case 'add-food': trip.foods.push({ name: '', note: '', photo: '' }); break;
    case 'del-food': trip.foods.splice(i, 1); break;
    case 'rm-photo':
      setPath(b.dataset.path, '');
      if (b.dataset.path === 'cover') { coverOriginal = null; coverOriginalUrl = null; }
      break;
    case 'style': await setStyle(b.dataset.style); return;
    case 'geo': await geoSearch(b, d, j); return;
    case 'geo-pick': {
      const a = trip.days[d].activities[j];
      a.lat = +b.dataset.lat; a.lng = +b.dataset.lng;
      if (!a.place) a.place = b.dataset.name.split(',')[0];
      break;
    }
    case 'export': download(); return;
    case 'reset':
      if (!confirm('Discard all edits on this device and reload the published plan?')) return;
      clearLocal(); trip = await loadPublished(); render(); toast('Back to the published plan');
      $('#saveState').textContent = '';
      return;
    case 'publish': await publish(b); return;
    default: return;
  }
  save(); render();
});

/* ---------- photos ---------- */
async function addPhoto(path, file) {
  busy(true);
  await new Promise((r) => setTimeout(r, 30)); // let the overlay paint first
  try {
    const img = await fileToImage(file);
    const isCover = path === 'cover';
    setPath(path, stylize(img, trip.artStyle, isCover ? 1400 : 900));
    if (isCover) {
      coverOriginal = img;
      if (coverOriginalUrl) URL.revokeObjectURL(coverOriginalUrl);
      coverOriginalUrl = URL.createObjectURL(file);
    }
    save(true); render();
  } catch (err) {
    console.error(err); toast('Could not read that image');
  } finally { busy(false); }
}

async function setStyle(style) {
  trip.artStyle = style;
  if (coverOriginal) {
    busy(true);
    await new Promise((r) => setTimeout(r, 30));
    trip.cover = stylize(coverOriginal, style, 1400);
    busy(false);
  } else if (trip.cover) {
    toast(`New photos will use ${STYLES[style].label}. Re-upload the cover to restyle it.`);
  }
  save(true); render();
}

function busy(on) { $('#busy').classList.toggle('show', on); }

/* ---------- place search (OpenStreetMap Nominatim) ---------- */
async function geoSearch(btn, d, j) {
  const a = trip.days[d].activities[j];
  const q = [a.place || a.name, trip.days[d].city, trip.destination].filter(Boolean).join(', ');
  const box = btn.closest('.act-ed').querySelector('.geo-results');
  if (!a.place && !a.name) { toast('Type a place name first'); return; }
  box.innerHTML = '<button disabled>Searching…</button>';
  try {
    let res = await nominatim(q);
    if (!res.length) res = await nominatim(a.place || a.name);
    box.innerHTML = res.length
      ? res.map((r) => `<button data-act="geo-pick" data-d="${d}" data-a="${j}" data-lat="${r.lat}" data-lng="${r.lon}" data-name="${esc(r.display_name)}">📍 ${esc(r.display_name)}</button>`).join('')
      : '<button disabled>No match — try a simpler name</button>';
  } catch { box.innerHTML = '<button disabled>Search failed — check your connection</button>'; }
}
async function nominatim(q) {
  const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(q)}`, { headers: { 'Accept-Language': 'en' } });
  return r.json();
}

/* ---------- drag & drop ---------- */
function initSortables() {
  if (!window.Sortable) return;
  new Sortable($('#dayList'), {
    handle: '.day-grip', animation: 200,
    onEnd: ({ oldIndex, newIndex }) => {
      if (oldIndex === newIndex) return;
      const [m] = trip.days.splice(oldIndex, 1); trip.days.splice(newIndex, 0, m);
      openDays.clear(); openDays.add(newIndex);
      save(); render();
    },
  });
  document.querySelectorAll('.act-list').forEach((list) => new Sortable(list, {
    group: 'acts', handle: '.act-grip', animation: 200,
    onEnd: ({ from, to, oldIndex, newIndex }) => {
      const a = +from.dataset.d, b = +to.dataset.d;
      if (a === b && oldIndex === newIndex) return;
      const [m] = trip.days[a].activities.splice(oldIndex, 1);
      trip.days[b].activities.splice(newIndex, 0, m);
      openDays.add(b);
      save(); render();
    },
  }));
  new Sortable($('#foodList'), {
    handle: '.food-grip', animation: 200,
    onEnd: ({ oldIndex, newIndex }) => {
      const [m] = trip.foods.splice(oldIndex, 1); trip.foods.splice(newIndex, 0, m);
      save(); render();
    },
  });
}

/* ---------- export / publish ---------- */
const tripJson = () => JSON.stringify(trip, null, 2);

function download() {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([tripJson()], { type: 'application/json' }));
  a.download = 'trip.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function ghSettings() {
  try { return { owner: '', repo: '', branch: 'main', token: '', ...JSON.parse(localStorage.getItem('tripPlanner.gh')) }; }
  catch { return { owner: '', repo: '', branch: 'main', token: '' }; }
}

async function publish(btn) {
  const { owner, repo, branch, token } = ghSettings();
  if (!owner || !repo || !token) { toast('Fill in the GitHub settings below first'); $('details.gh').open = true; return; }
  btn.disabled = true; btn.textContent = 'Publishing…';
  const api = `https://api.github.com/repos/${owner}/${repo}/contents/data/trip.json`;
  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' };
  try {
    const cur = await fetch(`${api}?ref=${encodeURIComponent(branch || 'main')}`, { headers });
    const sha = cur.ok ? (await cur.json()).sha : undefined;
    const bytes = new TextEncoder().encode(tripJson());
    let bin = '';
    for (let k = 0; k < bytes.length; k += 0x8000) bin += String.fromCharCode(...bytes.subarray(k, k + 0x8000));
    const res = await fetch(api, {
      method: 'PUT', headers,
      body: JSON.stringify({ message: `Update trip: ${trip.title}`, content: btoa(bin), sha, branch: branch || 'main' }),
    });
    if (!res.ok) throw new Error((await res.json()).message || res.status);
    toast('Published! The live site updates in about a minute ✨');
  } catch (err) {
    toast(`Publish failed: ${err.message}`);
  } finally {
    btn.disabled = false; btn.textContent = '☁️ Publish to GitHub';
  }
}

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}
