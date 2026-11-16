// Daily + hourly forecast from Open-Meteo (free, no API key).
// Forecasts exist from about 2 months back to 16 days ahead.
import { dayDate } from './store.js';

const CODES = {
  0: ['☀️', 'Sunny'], 1: ['🌤️', 'Mostly sunny'], 2: ['⛅', 'Partly cloudy'], 3: ['☁️', 'Cloudy'],
  45: ['🌫️', 'Fog'], 48: ['🌫️', 'Fog'],
  51: ['🌦️', 'Light drizzle'], 53: ['🌦️', 'Drizzle'], 55: ['🌦️', 'Drizzle'], 56: ['🌦️', 'Drizzle'], 57: ['🌦️', 'Drizzle'],
  61: ['🌧️', 'Light rain'], 63: ['🌧️', 'Rain'], 65: ['🌧️', 'Heavy rain'], 66: ['🌧️', 'Rain'], 67: ['🌧️', 'Heavy rain'],
  71: ['❄️', 'Snow'], 73: ['❄️', 'Snow'], 75: ['❄️', 'Snow'], 77: ['❄️', 'Snow'],
  80: ['🌦️', 'Showers'], 81: ['🌧️', 'Showers'], 82: ['⛈️', 'Heavy showers'],
  85: ['❄️', 'Snow showers'], 86: ['❄️', 'Snow showers'],
  95: ['⛈️', 'Thunderstorms'], 96: ['⛈️', 'Thunderstorms'], 99: ['⛈️', 'Thunderstorms'],
};
export const describe = (code) => CODES[code] || ['🌡️', 'Weather'];

// Outdoor stops get a rain warning.
export const OUTDOOR = new Set(['sight', 'nature']);

export function toISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Average position of the day's stops; falls back to the whole trip.
export function dayLocation(trip, i) {
  const pts = (list) => list.filter((a) => a.lat != null && a.lat !== '' && a.lng != null);
  let p = pts(trip.days[i]?.activities || []);
  if (!p.length) p = pts(trip.days.flatMap((d) => d.activities));
  if (!p.length) return null;
  return { lat: p.reduce((s, a) => s + +a.lat, 0) / p.length, lng: p.reduce((s, a) => s + +a.lng, 0) / p.length };
}

const memo = new Map();

// Resolves to { date, code, tmax, tmin, pop, hours: { 0..23: { pop, code } } },
// or { status: 'too-far' | 'unavailable' }.
export function dayForecast(trip, i) {
  const date = dayDate(trip, i), loc = dayLocation(trip, i);
  if (!date || !loc) return Promise.resolve({ status: 'unavailable' });
  const iso = toISO(date);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const daysAhead = Math.round((date - today) / 864e5);
  if (daysAhead > 15) return Promise.resolve({ status: 'too-far', daysAhead });
  if (daysAhead < -60) return Promise.resolve({ status: 'unavailable' });

  const key = `wx:${loc.lat.toFixed(2)},${loc.lng.toFixed(2)},${iso}`;
  if (memo.has(key)) return memo.get(key);
  const p = (async () => {
    try {
      const c = JSON.parse(sessionStorage.getItem(key));
      if (c && Date.now() - c.t < 3600e3) return c.v;
    } catch {}
    const url = 'https://api.open-meteo.com/v1/forecast?timezone=auto' +
      `&latitude=${loc.lat.toFixed(3)}&longitude=${loc.lng.toFixed(3)}&start_date=${iso}&end_date=${iso}` +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max' +
      '&hourly=precipitation_probability,weather_code';
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(r.status);
      const j = await r.json();
      const hours = {};
      j.hourly.time.forEach((t, k) => {
        hours[+t.slice(11, 13)] = { pop: j.hourly.precipitation_probability[k], code: j.hourly.weather_code[k] };
      });
      const v = {
        date: iso, code: j.daily.weather_code[0], pop: j.daily.precipitation_probability_max[0],
        tmax: Math.round(j.daily.temperature_2m_max[0]), tmin: Math.round(j.daily.temperature_2m_min[0]), hours,
      };
      try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), v })); } catch {}
      return v;
    } catch {
      memo.delete(key);
      return { status: 'unavailable' };
    }
  })();
  memo.set(key, p);
  return p;
}

// Rain chance at a "HH:MM" time.
export function rainAt(wx, time) {
  if (!wx?.hours || !time) return null;
  const h = wx.hours[+time.slice(0, 2)];
  return h ? h.pop : null;
}

// Short "☀️ 31° / 25° · 40% rain" label.
export function dayLabel(wx) {
  if (!wx) return '';
  if (wx.status === 'too-far') return `🌤️ Forecast in ${wx.daysAhead - 15} days`;
  if (wx.status) return '';
  const [icon] = describe(wx.code);
  return `${icon} ${wx.tmax}°/${wx.tmin}°${wx.pop != null ? ` · ${wx.pop}% rain` : ''}`;
}
