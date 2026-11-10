// Shared data helpers for the plan and edit pages.
// The published trip lives in data/trip.json (in the GitHub repo).
// Edits made in the browser are kept in localStorage until published.

const KEY = 'tripPlanner.trip.v1';
const PACK_KEY = 'tripPlanner.packed.v1';

export const TYPES = {
  flight: { icon: '✈️', label: 'Flight', color: '#3d5a8a' },
  train:  { icon: '🚄', label: 'Transport', color: '#5a7fa8' },
  hotel:  { icon: '🏨', label: 'Stay', color: '#7a5a9a' },
  food:   { icon: '🍜', label: 'Food', color: '#c4553b' },
  sight:  { icon: '📸', label: 'Sightseeing', color: '#2f5d46' },
  nature: { icon: '🌿', label: 'Nature', color: '#6f9a4f' },
  shop:   { icon: '🛍️', label: 'Shopping', color: '#b8862f' },
  other:  { icon: '📍', label: 'Other', color: '#8a8273' },
};

export const DAY_COLORS = ['#c4553b', '#3d5a8a', '#2f6d55', '#b8862f', '#7a5a9a', '#2f8a83', '#a3476f', '#5d6f2f'];
export const dayColor = (i) => DAY_COLORS[i % DAY_COLORS.length];

export async function loadPublished() {
  const res = await fetch('data/trip.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error('Could not load data/trip.json');
  return normalize(await res.json());
}

export async function loadTrip() {
  const local = readLocal();
  if (local) return { trip: normalize(local), source: 'local' };
  return { trip: await loadPublished(), source: 'published' };
}

function readLocal() {
  try { const s = localStorage.getItem(KEY); return s ? JSON.parse(s) : null; } catch { return null; }
}
export function saveLocal(trip) { localStorage.setItem(KEY, JSON.stringify(trip)); }
export function clearLocal() { try { localStorage.removeItem(KEY); } catch {} }
export const hasLocal = () => !!readLocal();

export function normalize(t) {
  t.title ??= 'My Trip';
  t.subtitle ??= '';
  t.destination ??= '';
  t.currency ??= 'USD';
  t.artStyle ??= 'watercolor';
  t.days ??= [];
  t.days.forEach((d) => { d.activities ??= []; });
  t.foods ??= [];
  t.tips ??= [];
  t.packing ??= [];
  return t;
}

export function packedState() {
  try { return JSON.parse(localStorage.getItem(PACK_KEY)) || {}; } catch { return {}; }
}
export function savePackedState(s) { try { localStorage.setItem(PACK_KEY, JSON.stringify(s)); } catch {} }

export function parseDate(s) {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
export function dayDate(trip, i) {
  const start = parseDate(trip.startDate);
  if (!start) return null;
  const d = new Date(start); d.setDate(d.getDate() + i); return d;
}
export const fmtDate = (d, opts = { weekday: 'short', day: 'numeric', month: 'short' }) =>
  d ? d.toLocaleDateString('en-GB', opts) : '';

export function fmtMoney(n, cur) {
  if (n == null || n === '' || isNaN(n)) return '';
  try { return new Intl.NumberFormat('en', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(n); }
  catch { return `${cur} ${Math.round(n)}`; }
}

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Stable little tilt for polaroids, so they look hand-placed but don't jump on re-render.
export function tilt(seed) {
  let h = 0; for (const c of String(seed)) h = (h * 31 + c.charCodeAt(0)) | 0;
  return ((Math.abs(h) % 70) / 10 - 3.5).toFixed(1);
}
