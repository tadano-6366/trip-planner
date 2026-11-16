# Next steps

Live site: https://tadano-6366.github.io/trip-planner/
Edit page: https://tadano-6366.github.io/trip-planner/edit.html

## Done
- [x] Repo created and code pushed
- [x] Repo made public, GitHub Pages turned on (deploys from `main` / root)
- [x] Plan page + edit page built, sample trip switched to Penang
- [x] Photo art styles: Watercolor, Pencil sketch, Anime
- [x] GitHub token created and **Publish to GitHub** tested — works (first publish: "Penang Trip", starts 18 Nov 2026)

## To do

### 1. GitHub token (done on the first device — keep for reference)
Go to https://github.com/settings/personal-access-tokens/new

| Setting | Value |
|---|---|
| Token name | `trip-planner-edit` (any name) |
| Expiration | a date after the trip |
| Resource owner | `tadano-6366` |
| Repository access | **Only select repositories** → `trip-planner` |
| Repository permissions → **Contents** | **Read and write** |
| Repository permissions → Metadata | Read-only (added automatically) |
| Everything else | No access |

Click **Generate token** and copy it right away (GitHub shows it once).
Never paste the token into a chat, a file or this repo.

### 2. Connect the app to GitHub (on each device you edit from)
Edit page → **5 · Save & share → GitHub settings**:
- Owner: `tadano-6366`
- Repo: `trip-planner`
- Branch: `main`
- Token: paste the token

Then press **☁️ Publish to GitHub**. The live site updates in about 1–2 minutes.
The token is saved only in that browser, so repeat this step on each new device.

### 3. Test on your phone
- [ ] Cover shows the Penang sunset and the countdown
- [ ] Day tabs follow as you scroll; tapping a card expands it
- [ ] **Map** button opens a real map with numbered pins
  (Fixed 16 Nov: the old map service, CARTO, started requiring an API key. The app now uses OpenStreetMap — free, no key.)
- [ ] Edit page: add a photo, try Watercolor / Pencil sketch / Anime
- [ ] Publish works and the change appears on the live site

### 4. Put in the real trip
- [x] Real start date set (18 Nov 2026) — check the number of days is right
- [ ] Replace sample activities with your own plan (use **🔍 Find** to put places on the map)
- [ ] Add a cover photo and food photos
- [ ] Update tips and packing list
- [ ] Keep private details (booking numbers, passport info) out — the repo is public

### 5. Added 16 Nov
- [x] **Today view**: days are folded; on a trip day that day opens and a "Now / Next" card shows at the top
  (preview any moment with `index.html?now=2026-11-19T12:40`)
- [x] **Weather** (Open-Meteo, free): per day on the plan, rain chance per stop, and a rain-by-hour chart in the editor
- [x] **Closed-day warnings**: set "Closed on" days per stop in the editor
- [x] **Night mode** toggle (🌙/☀️) on both pages
- [x] **Map colours**: Soft or Standard — switch in the editor under Trip → Map colours
- [x] Waze button (red lollipop) on each stop
- [x] **Food board** (replaces Must-eat): options to pick from — filters (open now, area, hide tried),
      sort by distance to a day's stops or your location, 🎲 Pick for me, Tried ✓, ＋ Plan, 🍜 pins on the map
- [ ] Fill in food options — easiest in bulk: fill `templates/food-board.md` (and `templates/day-plan.md` for the schedule), then ask Claude to apply it

### 6. Ideas for later (discuss with Claude)
- [ ] Works offline / add to home screen
- [ ] Tick off stops as you go; spending tracker; Grab button
- [ ] Store photos as separate files so the page loads faster
- [ ] Style tweaks: colours, fonts, sections to add or remove
- [ ] True AI anime/illustration photos (needs an AI image service + API key; has a cost)
- [ ] Share link for travel companions; multiple trips

## Continuing with Claude on another device
Start a new Claude Code session with the `tadano-6366/trip-planner` repo selected,
and ask it to read `NEXT-STEPS.md`.
