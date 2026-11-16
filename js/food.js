// Food board helpers shared by the plan and edit pages.
// A food option: { name, note, photo, area, place, lat, lng, price (1-3), open, close ("HH:MM"), closed: [weekday] }

const mins = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + (m || 0); };

// { state: 'open' | 'closed' | 'later' | 'unknown', text }
export function openStatus(f, now) {
  if ((f.closed || []).includes(now.getDay())) return { state: 'closed', text: 'Closed today' };
  if (!f.open || !f.close) return { state: 'unknown', text: '' };
  const m = now.getHours() * 60 + now.getMinutes(), o = mins(f.open), c = mins(f.close);
  const isOpen = c > o ? m >= o && m < c : m >= o || m < c; // handles late-night stalls (e.g. 18:00–02:00)
  if (isOpen) {
    const left = (c - m + 1440) % 1440;
    return { state: 'open', text: left <= 60 ? `Open · closes ${f.close}` : `Open · till ${f.close}`, soon: left <= 60 };
  }
  return { state: 'later', text: `Opens ${f.open}` };
}

export const hasGeo = (x) => x && x.lat != null && x.lat !== '' && x.lng != null && x.lng !== '';

// Distance in km between two {lat, lng} points.
export function km(a, b) {
  const r = (d) => (d * Math.PI) / 180;
  const dLat = r(b.lat - a.lat), dLng = r(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

export const priceLabel = (p) => (p ? '$'.repeat(p) : '');

const TRIED_KEY = 'tripPlanner.tried.v1';
export function triedState() { try { return JSON.parse(localStorage.getItem(TRIED_KEY)) || {}; } catch { return {}; } }
export function saveTried(s) { try { localStorage.setItem(TRIED_KEY, JSON.stringify(s)); } catch {} }
