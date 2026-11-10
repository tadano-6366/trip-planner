# Next steps

Live site: https://tadano-6366.github.io/trip-planner/
Edit page: https://tadano-6366.github.io/trip-planner/edit.html

## Done
- [x] Repo created and code pushed
- [x] Repo made public, GitHub Pages turned on (deploys from `main` / root)
- [x] Plan page + edit page built, sample trip switched to Penang
- [x] Photo art styles: Watercolor, Pencil sketch, Anime

## To do

### 1. Create the GitHub token (to save edits from the app)
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
- [ ] Edit page: add a photo, try Watercolor / Pencil sketch / Anime
- [ ] Publish works and the change appears on the live site

### 4. Put in the real trip
- [ ] Real start date and number of days (sample uses 19–21 Dec 2026)
- [ ] Replace sample activities with your own plan (use **🔍 Find** to put places on the map)
- [ ] Add a cover photo and food photos
- [ ] Update tips and packing list
- [ ] Keep private details (booking numbers, passport info) out — the repo is public

### 5. Ideas for later (discuss with Claude)
- [ ] Style tweaks: colours, fonts, sections to add or remove
- [ ] True AI anime/illustration photos (needs an AI image service + API key; has a cost)
- [ ] Weather forecast per day
- [ ] Install to phone home screen / work offline
- [ ] Share link for travel companions; multiple trips

## Continuing with Claude on another device
Start a new Claude Code session with the `tadano-6366/trip-planner` repo selected,
and ask it to read `NEXT-STEPS.md`.
