# Trip Planner

A mobile-first, scrapbook-style travel plan with two pages:

- **Plan** (`index.html`) — illustrated cover with countdown, day tabs, route overview, day-by-day timeline, interactive map (bottom sheet on phones, side panel on desktop), must-eat polaroids, tips notebook, packing checklist and budget chart.
- **Edit** (`edit.html`) — edit trip details, days and activities (drag to reorder), find places on the map, add photos, tips and packing list.

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
Plain HTML, CSS and JavaScript (ES modules, no build step). Bundled in `vendor/`: [Leaflet](https://leafletjs.com) 1.9.4 for maps, [SortableJS](https://sortablejs.github.io/Sortable/) 1.15.2 for drag-and-drop. Map tiles © OpenStreetMap contributors © CARTO. Place search via OpenStreetMap Nominatim.
