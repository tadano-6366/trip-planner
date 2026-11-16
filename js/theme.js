// Night mode. Follows the device setting until the person taps the toggle,
// then remembers their choice. (A tiny script in each page's <head> applies the
// saved choice before the page paints, so there's no flash.)
const KEY = 'tripPlanner.theme';
const media = matchMedia('(prefers-color-scheme: dark)');

export function currentTheme() {
  return document.documentElement.dataset.theme || (media.matches ? 'dark' : 'light');
}

export function initThemeToggle(btn) {
  const update = () => {
    const dark = currentTheme() === 'dark';
    btn.textContent = dark ? '☀️' : '🌙';
    btn.title = dark ? 'Switch to day mode' : 'Switch to night mode';
    btn.setAttribute('aria-label', btn.title);
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', dark ? '#1d1b18' : '#f5efe3');
  };
  btn.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(KEY, next); } catch {}
    update();
    dispatchEvent(new CustomEvent('themechange'));
  });
  media.addEventListener('change', () => {
    if (document.documentElement.dataset.theme) return;
    update();
    dispatchEvent(new CustomEvent('themechange'));
  });
  update();
}
