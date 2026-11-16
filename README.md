# Trip Planner

A mobile-first, scrapbook-style travel plan with two pages:

- **Plan** (`index.html`) — illustrated cover with countdown, day tabs, route overview, day-by-day timeline, interactive map (bottom sheet on phones, side panel on desktop), must-eat polaroids, tips notebook, packing checklist and budget chart.
- **Edit** (`edit.html`) — edit trip details, days and activities (drag to reorder), find places on the map, add photos, tips and packing list.

## Highlights
- **Today view** — days fold away; on a trip day, that day opens with a "Now / Next" card. Preview with `?now=2026-11-19T12:40`.
- **Weather** — daily forecast, rain chance per stop, and a rain-by-hour chart in the editor ([Open-Meteo](https://open-meteo.com), free, no key; available up to 16 days ahead).
- **Food board** — food options to choose from on the go: open-now and area filters, sort by distance, 🎲 Pick for me, Tried ✓, add to plan, and 🍜 pins on the map.
- **Closed-day warnings**, **Waze** navigation per stop, **night mode**, and **Soft / Standard** map colours.

## Photo art styles
Every photo you add is turned into an illustration — **Watercolor**, **Pencil sketch** or **Anime** — right in the browser (`js/paint.js`). No AI service or API key needed. The edit page shows a before/after slider for the cover.

## Where the data lives
- `data/trip.json` in this repo is the published plan everyone sees.
- Edits save automatically in your browser. Press **Publish to GitHub** on the edit page (needs a fine-grained token with *Contents: read & write* on this repo) to commit them to `data/trip.json`, or download the file and commit it yourself.

## Run locally
```bash
python3 -m http.server 8000
```
Then open http://localhost:8000.

## Host on GitHub Pages
Repo **Settings → Pages → Deploy from branch → `main` / root**.

## Tech
Plain HTML, CSS and JavaScript (ES modules, no build step). Bundled in `vendor/`: [Leaflet](https://leafletjs.com) 1.9.4 for maps, [SortableJS](https://sortablejs.github.io/Sortable/) 1.15.2 for drag-and-drop. Map: [OpenFreeMap](https://openfreemap.org) vector tiles via [MapLibre GL](https://maplibre.org) 4.7.1 (sharp on Retina screens, no API key), falling back to OpenStreetMap tiles. Map data © OpenStreetMap contributors. Place search via OpenStreetMap Nominatim, with Photon as a backup.
