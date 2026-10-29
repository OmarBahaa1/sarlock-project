# SARlock: Project Handoff

Keep this file at `docs/PROJECT_CONTEXT.md` and update it whenever a milestone is done.

## 1. The challenge

NASA Space Apps 2026, "Dancing with the SARs" (Earth Science): build an interactive application that uses radar data from the NISAR mission (NASA-ISRO) to track and visualize one or more types of surface change at locations around the world.
The challenge also asks us to hypothesize the physical drivers behind what the radar shows, say which polarizations highlight the changes, and suggest future NISAR applications.
Judging criteria (verify on the official page): Impact, Creativity, Validity, Relevance, Presentation.

## 2. Product concept (working name: SARlock)

A static web game (no backend). The player is an "Earth Detective" for a disaster-monitoring agency.

Flow: globe with hotspots, then pick a case, then compare before/after NISAR images, then guess what happened (4 options, 2 progressive hints on wrong answers), then a story screen (summary, stats, "How the radar sees it", NISAR insight, looking forward), then a short "decision" mini-scenario.

Extras:

- Rank system (Junior Detective, Senior Detective, Earth Guardian) with a final "Impact Summary" screen.
- A narrator character shown as text in a speech bubble (no voice). Name undecided.
- Soft background music with a mute button, and small sound effects.
- Team introduction at the start of the pitch video.

Tech: vanilla HTML/CSS/JS, no framework.

## 3. Team

- Person A: data pipeline and case JSON files.
- Person B: frontend (`web/`).
- Person C: story and stats review, pitch video script, Project Summary, visual identity.

## 4. Repo and tooling

- GitHub: `OmarBahaa1/sarlock-project` (public).
- Folders: `data/raw` (git-ignored except `.gitkeep`), `data/processed/case-XX-name/`, `scripts/`, `web/`, `docs/`.
- Per case folder: `before.png`, `after.png`, `change.png`, `case-XX.json`, `granules_metadata.json`.
- Local test: run `python -m http.server 8000` from the REPO ROOT, then open `http://localhost:8000/web/map.html`. (Running the server from inside `web/` breaks the `../data` path.)
- Large pushes can fail on unstable networks. Push in small batches (JSON and scripts first, images separately).

## 5. Data pipeline

1. Find NISAR granules with `asf_search.geo_search(platform=[asf.PLATFORM.NISAR], intersectsWith=<bbox WKT>, start, end, processingLevel=["GCOV"])`.
2. Choose a before and an after granule on the SAME track/frame, as close to the event as possible.
3. `scripts/fetch_nisar_<case>.py` downloads ASF browse (quicklook) PNGs by granule ID and writes `granules_metadata.json`.
4. `scripts/generate_change_map_<case>.py` builds `change.png`: grayscale, percentile stretch on valid pixels, red = before, cyan = after.
5. `scripts/process_gcov.py` (not yet tested on a real file): `download`, `inspect`, `diff` commands for real GCOV processing.

Credentials: only through env vars `EARTHDATA_USERNAME` / `EARTHDATA_PASSWORD`. Never hardcode them in the repo.

## 6. JSON contract

See `docs/JSON_CONTRACT_V2.md` (v2 only adds optional fields; no v1 field is renamed). Options differ per case: the frontend must read them from the JSON.

## 7. Case status

- **case-01** Venezuela earthquake (24 Jun 2026). Before 2026-06-17, after 2026-06-29. JSON v2 pushed.
- **case-02** Ohio floods (19-20 Aug 2026). Before 2026-07-17, after 2026-08-22 (36-day gap). JSON v2 pushed.
- **case-03** Kazakhstan wildfire (from 14 Jul 2026). Before 2026-07-06, after 2026-07-18, frame 150_D_062. JSON v2 pushed. The two images look very similar, and we have not confirmed the reported fires fall inside the scene.
- **case-04** (proposed): Krasheninnikov volcano, Kamchatka. Search for granules pending.
- **case-05:** undecided. Must be a different event type.

## 8. Lessons and pitfalls

1. Always confirm `Platform: NISAR` in search results (case-01 once used Sentinel-1 data by mistake).
2. Never reject an event on the date alone: query `asf_search` for the area and dates. Our searches showed no acquisitions roughly 25 Jul to 11 Aug 2026.
3. NISAR images are radar, never optical. Optical context (Sentinel-2, Worldview, Landsat) may only be added as labelled context (source and date), shown AFTER the player answers.
4. Our cases 01-03 use ASF browse quicklooks. All six granules have mode code DHDH (HH and HV), but we do not know which channel the quicklook shows, so we make NO polarization claims for them.
5. A caveat means "limits of this visual comparison", never "we are unsure the event happened".
6. L-band radar is not blocked by clouds or smoke, so bright patches in `change.png` must not be described as clouds.
7. Images look rotated because of satellite swath geometry. That is normal. Before and after must be on the same grid, otherwise `change.png` shows false change.

## 9. TODO

- Person B: three views (Before, After, Radar Difference), `data_level` badge, options from JSON, timeline and optical context, globe, ranks, narrator, music, decision UI.
- case-04 (volcano) and case-05 (different event type).
- Person C: verify all story numbers against named sources, pitch video script, Project Summary, narrator name.
- Confirm hackathon dates, submission deadline and video length limit.
- README for the repo.

## 10. Facts that must be verified before submission

Every number in `story.stats` and every claim in the case JSON files must be checked against a named source. Open points: case-01 casualty count (589 by 26 Jun is from one bulletin), depth and shock timing; case-02 rainfall and rescue figures; case-03 event details (not independently verified).