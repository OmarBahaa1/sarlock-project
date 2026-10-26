# SARlock: Project Handoff

Paste this file into a new chat, or keep it at `docs/PROJECT_CONTEXT.md` in the repo and update it whenever a milestone is done.

## 0. How to work with me
- I'm Omar (Person A, data). Reply in Egyptian Arabic, keeping technical terms in English.
- Be beginner-friendly: one step at a time, exact commands, and ask me to paste terminal output or screenshots.
- Windows laptop, PowerShell and Git Bash, Cursor IDE, Python venv at `.\venv` (activate with `.\venv\Scripts\activate`).
- Be honest about uncertainty. Verify facts before stating them, and never invent data.

## 1. The challenge
NASA Space Apps 2026, "Dancing with the SARs" (Earth Science, Intermediate/Advanced): build an interactive application that uses radar data from the NISAR mission (NASA-ISRO) to track and visualize one or more types of surface change at locations around the world.
Judging criteria (verify on the official page): Impact, Creativity, Validity, Relevance, Presentation.
Goal: Global Nominee, then Finalist/Winner.

## 2. Product concept (working name: SARlock)
A static web game (no backend). The player is an "Earth Detective" for a disaster-monitoring agency.

Flow: globe with hotspots, then pick a case, then compare before/after NISAR images, then guess what happened (4 options, 2 progressive hints on wrong answers), then a story screen (summary, stats, NISAR insight, "looking forward"), then a short "decision" mini-scenario.

Extras decided after studying the Global Winner team Zumorroda:
- Rank system (Junior Detective, Senior Detective, Earth Guardian) with a final "Impact Summary" screen.
- A narrator character shown as text in a speech bubble (no voice). Name undecided (ideas: ECHO, WATSON).
- Soft background music with a mute button, and optional small sound effects.
- Team introduction at the start of the pitch video.
- Do NOT copy their farming mechanic or their humor style.

## 3. Team
- Person A (Omar): data pipeline and case JSON files.
- Person B: frontend (`web/`). Has the UI prompt and is building it. Planned structure: `web/index.html`, `style.css`, `js/globe.js`, `slider.js`, `quiz.js`, `story.js`, `assets/`.
- Person C: story and question review, "How NISAR helps" lines, pitch video script, Project Summary, visual identity.

## 4. Repo and tooling
- GitHub: `OmarBahaa1/sarlock-project` (public). Remote uses SSH (HTTPS timed out with HTTP 408 on an unstable hotspot).
- Folders: `data/raw` (git-ignored except `.gitkeep`), `data/processed/case-XX-name/`, `scripts/`, `web/`, `docs/`.
- Per case folder: `before.png`, `after.png`, `change.png`, `case-XX.json`, `granules_metadata.json`.
- Local test: run `python -m http.server 8000` from the REPO ROOT, then open `http://localhost:8000/web/test.html`. (`file://` fails with CORS; running the server from inside `web/` breaks the `../data` path.)
- `web/test.html` is an early all-in-one prototype. It does not yet show the decision stage, `looking_forward`, or `change.png`.

## 5. Data pipeline
1. Pick an event, then find NISAR granules with `asf_search.geo_search(platform=[asf.PLATFORM.NISAR], intersectsWith=<bbox WKT>, start, end, processingLevel=["GCOV","GSLC"])`.
2. Choose a before and an after granule on the SAME track/frame, as close to the event as possible.
3. `scripts/fetch_nisar_<case>.py` downloads ASF browse (quicklook) PNGs by granule ID and writes `granules_metadata.json`.
4. `scripts/generate_change_map_<case>.py` builds `change.png`: percentile stretch on valid pixels, then red = before, cyan = after.

Credentials: only through env vars `EARTHDATA_USERNAME` / `EARTHDATA_PASSWORD`. Never hardcode them in the repo.

## 6. JSON contract (same structure for ALL cases; never rename fields)
Top level: `id`, `title`, `location {name, lat, lng}`, `event_type`, `event_date`, `bbox {west, south, east, north}`, `before {file, date, granule_id}`, `after {file, date, granule_id}`, `change`, `question`, `options` (array of 4: Flood, Earthquake, Wildfire, Urban Construction), `correct_option` (index into options), `hints` (2 strings), `story {summary, stats [{label, value}], nisar_insight, looking_forward}`, `decision {scenario, choices [3 x {text, feedback, best_choice}]}`, `credit`, `caveat`. case-01 also has `magnitude`.

Decision choices are not right/wrong: each has educational feedback, and `best_choice` is only a UI flag.

## 7. Case status
- **case-01** Venezuela earthquake (24 Jun 2026, M7.5). Before 2026-06-17, after 2026-06-29, track 054 D 083. Complete and pushed.
- **case-02** Ohio floods (19-20 Aug 2026). Before 2026-07-17, after 2026-08-22, frame 127_D_068. The 33-day gap is stated in the caveat. Complete and pushed.
- **case-03** Kazakhstan wildfire, Akmola/Abai (from 14 Jul 2026). Before 2026-07-06, after 2026-07-18, frame 150_D_062. Images downloaded and `change.png` generated (folder `case-03-wildfire`). MD5s differ, but before and after look very similar and are cloudy. Still to do: save `case-03.json` in the folder, update the caveat to mention cloud-cover differences and regional drought, then commit and push.
- **case-04 and case-05:** not started (see TODO).

## 8. Lessons and pitfalls
1. Always confirm `Platform: NISAR` in search results. case-01 once used Sentinel-1/OPERA data by mistake ("S1A" in the file ID was the giveaway) and had to be redone.
2. Do not assume NISAR data only exists after 17 Jun 2026. ASF returned NISAR provisional granules from at least 1 May 2026. Check an event by actually querying `asf_search` for the AOI and dates before accepting or rejecting it. Also, our searches showed no acquisitions roughly 25 Jul to 11 Aug 2026 (NASA lists a data gap around then). Verify the exact dates.
3. NISAR is a radar satellite: its images can never be optical. Optical images (Sentinel-2, NASA Worldview, Landsat) can only be added as extra context, clearly labelled with source and date, and shown AFTER the player's guess so they don't give away the answer.
4. We use browse quicklooks, not validated scientific products. Keep honest caveats on every case. A caveat means "limits of the visual comparison", not "we are unsure the event happened".
5. Visual differences can be subtle, so `change.png` is essential.
6. Images look rotated because of satellite swath geometry. That is normal. North-up reprojection (GDAL) is optional polish. Before and after must also be properly co-registered, otherwise `change.png` shows false change.
7. Git: large pushes failed on a flaky network. Push in small batches. `.gitignore` uses `data/raw/*` plus `!data/raw/.gitkeep`.
8. Cursor opens on a Chat panel by default. Use "Browse Files" to see the file tree. The free plan has usage limits.

## 9. TODO
- Finish case-03 JSON and push. Make sure all case folders are pushed.
- Change hint #1 in every case to point the player to the "Radar Difference" (`change.png`) view.
- Frontend: add a three-way view (Before, After, Radar Difference), globe entry, rank system, narrator, music, and decision-stage UI.
- case-04 and case-05: choose DIFFERENT event types (candidates: glacier, land subsidence, volcano, another flood or earthquake). Candidate events from the NASA Disasters list: Colombia earthquake (Aug 2026), Sri Lanka flood (Aug 2026), Texas flooding (Jul 2026). Verify NISAR granules exist first.
- Optional: add an optical context image per case (see lesson 3).
- Person C: review all story text and write the pitch video script and Project Summary. Check the official video length limit.
- Change the Earthdata password if it was ever shown in a screenshot.

## 10. Facts that must be verified before submission
Story stats and claims in the case JSON files were drafted quickly and need checking against sources: case-01 depth, foreshock timing and casualty count; case-02 county count and rescues; case-03 personnel, evacuees, water dropped and the "near 50°C" heatwave hint.
