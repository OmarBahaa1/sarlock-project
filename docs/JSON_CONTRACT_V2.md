# SARlock JSON Contract v2

Version 2 only ADDS fields. No v1 field is renamed or removed.
Every new field is OPTIONAL: render it only when it is present, so a case without it still works.

## 1. Unchanged from v1

`id`, `title`, `location {name, lat, lng}`, `event_type`, `event_date`, `bbox {west, south, east, north}`,
`before {file, date, granule_id}`, `after {file, date, granule_id}`, `change`, `question`, `options`,
`correct_option`, `hints`, `story {summary, stats[], nisar_insight, looking_forward}`,
`decision {scenario, choices[{text, feedback, best_choice}]}`, `credit`, `caveat`.
case-01 also has `magnitude`.

## 2. Changes to existing fields

### options

Do NOT hardcode the 4 options in the frontend. Each case lists exactly 4 labels and `correct_option`
is the index of the right one (it is not always the same index).
Shared vocabulary: Flood, Earthquake, Wildfire, Volcanic eruption, Land subsidence, Glacier retreat, Urban construction.

### event_type

One of: `earthquake`, `flood`, `wildfire`, `volcano`, `subsidence`, `glacier`.
Use it for the globe hotspot icon/color.

### hints

`hints[0]` always tells the player to open the "Radar Difference" view.
When hint 1 is shown, highlight that tab so the hint is interactive.

## 3. New optional fields

### change_caption (string)

Legend shown under the Radar Difference view. It differs per `data_level`, so always read it from the JSON.

### data_level ("browse" | "gcov")

- `browse`: images come from ASF quicklook PNGs.
- `gcov`: images were computed from the real NISAR GCOV product (dB backscatter).
Show a small badge: "Quicklook" or "Processed from GCOV". This keeps the project honest about what the player is seeing.

### radar_explainer (object)

```json
"radar_explainer": {
  "mode_code": "DHDH",
  "channels": ["HH", "HV"],
  "what_radar_sees": "Short physical explanation of why this event changes the radar signal.",
  "polarization_note": "What we do and do not claim about polarization for this case."
}
```

Show it on the story screen as a card titled "How the radar sees it", placed before `nisar_insight`.

### timeline (array, case-04 volcano and any time-series case)

```json
"timeline": [
  { "file": "timeline/frame-01.png", "date": "2025-12-25", "caption": "First NISAR image" }
]
```

`file` is relative to the case folder. Render it as a scrubbable slider or play button under the main views.
Sort by `date` in the frontend; do not assume the order in the file.

### optical_context (object)

```json
"optical_context": {
  "file": "optical.png",
  "source": "Sentinel-2 via Copernicus Browser",
  "date": "2026-07-20",
  "caption": "What the same area looks like to a normal camera.",
  "reveal": "after_answer"
}
```

Show it ONLY after the player has answered (or used all attempts), never beside before/after:
it can give away the answer. Always print `source` and `date` under it. It is not NISAR data.

## 4. The three views

Before | After | Radar Difference (`change`). Same image size for all three, toggle buttons, and the
`change_caption` text under the active view. Keep the before/after comparison slider.

## 5. Text rules (apply to every string)

- No claim the data cannot support. If we do not know which polarization an image shows, we say nothing about it.
- A caveat means "limits of this visual comparison". It never means the event is uncertain.
- Numbers in `story.stats` must come from a named source. Person C verifies them before submission.

## 6. Patch for case-01, case-02, case-03

Paste these keys right after `"change"` in each file. Replace the existing `hints[0]` with the one given.
All six granules used so far have mode code `DHDH` (dual-pol H: HH and HV).

### case-01 (earthquake)

```json
"change_caption": "Red: brighter in the BEFORE image. Cyan: brighter in the AFTER image. Gray/white: little change. Black: no data. This compares image brightness, not measured ground motion.",
"data_level": "browse",
"radar_explainer": {
  "mode_code": "DHDH",
  "channels": ["HH", "HV"],
  "what_radar_sees": "An earthquake can shift the ground, damage buildings and trigger landslides. Each of these changes how the radar signal bounces back, and comparing two dates can show where. Measuring centimeter-scale ground motion needs interferometry (InSAR), which this quicklook comparison does not show.",
  "polarization_note": "The product contains HH and HV channels. The quicklook image does not tell us which channel it displays, so we make no polarization claim for this view."
},
```

`hints[0]`: `"Switch to the Radar Difference view: it highlights where the radar signal changed the most."`

### case-02 (flood)

```json
"change_caption": "Red: brighter in the BEFORE image. Cyan: brighter in the AFTER image. Gray/white: little change. Black: no data. This compares image brightness, not a measured flood extent.",
"data_level": "browse",
"radar_explainer": {
  "mode_code": "DHDH",
  "channels": ["HH", "HV"],
  "what_radar_sees": "Calm open water reflects the radar signal away from the satellite and looks dark, while flooded vegetation or buildings can bounce it back strongly and look bright. Radar also works through clouds and rain, which is why it is useful during storms.",
  "polarization_note": "The product contains HH and HV channels. The quicklook image does not tell us which channel it displays, so we make no polarization claim for this view."
},
```

`hints[0]`: same text as case-01.
Also fix the `caveat`: the gap between the two acquisitions (2026-07-17 to 2026-08-22) is **36 days**, not 33.

### case-03 (wildfire)

```json
"change_caption": "Red: brighter in the BEFORE image. Cyan: brighter in the AFTER image. Gray/white: little change. Black: no data. Large bright patches may be strong reflectors or other surface changes, not necessarily burn.",
"data_level": "browse",
"radar_explainer": {
  "mode_code": "DHDH",
  "channels": ["HH", "HV"],
  "what_radar_sees": "Fire removes leaves and thin branches, which changes how the radar signal scatters inside vegetation. Cross-polarized (HV) signal is generally sensitive to vegetation structure, so burn scars are often expected to show up there.",
  "polarization_note": "The product contains HH and HV channels. The quicklook image does not tell us which channel it displays, so we make no polarization claim for this view."
},
```

`hints[0]`: same text as case-01.

## 7. Template for case-04 (volcano) — all TBD values are filled by Person A

```json
{
  "id": "case-04",
  "title": "Krasheninnikov Volcano, Kamchatka",
  "location": { "name": "Kamchatka Peninsula, Russia", "lat": 54.6, "lng": 160.3 },
  "event_type": "volcano",
  "event_date": "TBD",
  "bbox": { "west": 159.9, "south": 54.3, "east": 160.7, "north": 54.9 },
  "before": { "file": "before.png", "date": "TBD", "granule_id": "TBD" },
  "after":  { "file": "after.png",  "date": "TBD", "granule_id": "TBD" },
  "change": "change.png",
  "change_caption": "TBD",
  "data_level": "gcov",
  "timeline": [],
  "question": "What caused this change on Earth's surface?",
  "options": ["Flood", "Volcanic eruption", "Wildfire", "Urban construction"],
  "correct_option": 1,
  "hints": ["Switch to the Radar Difference view: it highlights where the radar signal changed the most.", "TBD"],
  "radar_explainer": {},
  "story": {},
  "decision": {},
  "optical_context": {},
  "credit": "NISAR (NASA/ISRO), distributed by ASF DAAC",
  "caveat": "TBD"
}
```
