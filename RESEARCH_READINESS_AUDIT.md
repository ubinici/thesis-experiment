# Research readiness audit

Audit date: 2026-07-28

## Recording deliverable

The experiment needs seven unique English cue recordings:

1. `cue_blue.wav` — “Click on the blue…”
2. `cue_green.wav` — “Click on the green…”
3. `cue_orange.wav` — “Click on the orange…”
4. `cue_pink.wav` — “Click on the pink…”
5. `cue_purple.wav` — “Click on the purple…”
6. `cue_red.wav` — “Click on the red…”
7. `cue_yellow.wav` — “Click on the yellow…”

The machine-readable list is in `cue-recording-list.csv`. Its use counts cover all four counterbalancing lists, not a single participant’s list.

This script follows the current English PCIbex instructions and README. The thesis proposal still describes German, isolated color words. That discrepancy must be resolved before final recording. If the intended stimulus is the isolated adjective, record only “blue,” “green,” and so on, and update the instructions and README accordingly.

## Recording protocol

- Use one speaker, microphone, room, gain setting, and recording session.
- Record at least three takes of every line. Select one final take per color and reuse it on every applicable trial.
- Use neutral, continuation-style intonation. Stop after the color adjective; do not add a noun.
- Keep the carrier phrase pace and the adjective onset as consistent as possible across files.
- Keep leading silence, background noise, and loudness consistent. Avoid clipping.
- Retain a 48 kHz/24-bit master if possible; export mono PCM WAV files for the experiment with the exact lowercase filenames above.
- Listen to every exported file on headphones and speakers before upload.

Seven WAV files with the required names already exist in `chunk_includes`. They are technically consistent draft files: mono, 16-bit PCM, 22.05 kHz, 1.874–2.024 seconds, with no missing or corrupt reference. Replace them only when the final recordings have passed the listening check.

## What currently passes

- `items.csv` has 84 rows: 4 practice, 64 critical, and 16 filler rows across four lists.
- Every participant list has 1 practice, 16 critical, and 4 filler trials.
- Each list has four critical trials in each cell of the 2 × 2 design.
- The color-associated object appears eight times on the left and eight times on the right in every list.
- All seven audio references resolve to local WAV files.
- The table’s condition labels, typicality values, visibility values, displayed colors, and object roles are internally consistent.
- `main.js` passes JavaScript syntax validation.

## Blocking issues before data collection

### 1. The four-list image set is incomplete

`items.csv` references 136 unique images. Only 40 are present locally:

- practice: 2/2 present;
- fillers: 8/8 present;
- critical stimuli: 32/128 present.

The missing set is 96 critical images: 48 full-color and 48 grayscale. List 1 currently has both images for all 21 rows. Lists 2–4 each have both images for only 5/21 rows, so enabling counterbalancing now will produce missing-image trials for most participants.

Do not launch groups B–D until `github_assets/missing_assets_for_all_lists.csv` is empty and every remote image URL has been tested.

### 2. Full-color and grayscale images must be matched

For every critical object/color combination, make the grayscale stimulus by transforming the exact full-color master. Do not use independently generated exemplars across visibility conditions. Preserve crop, pose, size, background, and object identity, then check luminance and contrast so grayscale does not leave a systematic brightness cue.

Several current assets exist only as grayscale sources. Locate their original color masters or replace both versions from a shared master before completing the corresponding counterbalanced conditions.

### 3. Audio wording and RT origin are not yet aligned

The proposal defines reaction time from adjective onset. The current code measures from immediately before the audio playback command. With “Click on the…” recordings, this is carrier-phrase onset rather than adjective onset.

Choose one of these approaches before the pilot:

- use isolated color words, making audio onset approximately adjective onset; or
- keep the natural carrier phrase, measure the adjective onset in every final file, store that offset, and derive adjective-locked RT during analysis.

Keep the raw audio-start RT regardless. Do not compare adjective-locked RTs until the onset offsets have been verified.

### 4. Display preview timing needs a fixed specification

The proposal says participants first see the two-object display and then hear the adjective. The current script displays the images and starts the audio with no defined preview interval. Set and document a fixed preview duration before the pilot, then use it for every condition.

### 5. Local changes and assets are not yet deployed

The local experiment contains uncommitted changes and a local `github_assets` tree, while the public `main` branch currently shows the older scaffold. Because `main.js` loads images from the public repository through jsDelivr, local presence alone is insufficient. Push the finalized assets and code, allow the CDN to update, and run every group from the actual PCIbex test URL.

## Research decisions to preregister

- final stimulus language and exact auditory form;
- fixed visual preview duration and RT definition;
- sample-size/power justification for the typicality × visibility interaction;
- mixed-effects analysis for binary choice, plus the planned RT trimming and confidence model;
- the exact attention-check exclusion threshold;
- treatment of repeat participants and missing/failed resource loads;
- image and object-color norming criteria, especially whether each “atypical” color is plausible and each “color-variable” object is genuinely variable.

A full pilot should exercise groups A–D, all seven cues, every attention check, keyboard and mouse confidence responses, results upload, and the final exclusion/analysis pipeline.
