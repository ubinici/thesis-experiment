# Thesis Experiment PCIbex Template

This repository is a PCIbex-ready scaffold for the referential prediction experiment.

## Structure

- `data_includes/main.js`: main PennController/PCIbex experiment script.
- `chunk_includes/items.csv`: practice, critical, and filler rows.
- `chunk_includes/`: table and audio resources loaded by PCIbex.
- `github_assets/`: image stimuli hosted through jsDelivr/GitHub URLs.
- `css_includes/PennController.css`: basic experiment styling.

PCIbex GitHub sync maps these root folders into the Farm project folders:

- `data_includes` -> Scripts
- `chunk_includes` -> Resources
- `js_includes` -> Controllers, if added later
- `css_includes` -> Aesthetics

## Current Trial Design

The default run is counterbalanced across the four workbook lists in `Thesis Experiment Set .xlsx`:

- 1 practice trial
- 16 critical trials
- 4 filler trials
- 4 attention checks, inserted at the workbook list positions

The `group` column maps workbook lists to PCIbex groups:

- `A`: List 1
- `B`: List 2
- `C`: List 3
- `D`: List 4

Main trials show two objects, play an English truncated audio cue such as "Click on the yellow...", collect an `F`/`J` choice, and then collect a 1-5 confidence rating.

Critical trials instantiate the four core conditions:

- typical color, visible display
- typical color, grayscale display
- atypical color, visible display
- atypical color, grayscale display

For critical trials, both objects share the named color in visible displays, and both objects are gray in grayscale displays. Fillers use different object colors.

Attention checks are text-only. They ask a row-specific question about the immediately preceding trial, such as "Which one was a living object?", and score the answer against `attention_key`.

The results include explicit reaction-time columns in milliseconds:

- `choice_rt_ms`: time from the object display/audio cue onset to the `F`/`J` choice.
- `confidence_rt_ms`: time from the confidence screen appearing to the confidence response.
- `attention_rt_ms`: time from the attention-check screen appearing to the `F`/`J` response.

The development template does not run a full-block `CheckPreloaded` gate, because that can make testing painfully slow and can mask missing-resource errors as a long loading wait. PCIbex will still load resources as trials run. Add a preload check back only once final assets are small, uploaded, and stable.

## Editing Stimuli

The workbook image paths are wired through `chunk_includes/items.csv`. Image filenames stay as relative paths such as `objects/full_color/blue_cup.jpg`, and `data_includes/main.js` expands them to jsDelivr URLs under `github_assets/` using `imageBaseUrl`. The important columns are:

- `audio`: cue audio filename in `chunk_includes`
- `left_object`, `right_object`: object names shown on each side
- `left_color`, `right_color`: visible object colors, with `gray` for grayscale displays
- `left_image`, `right_image`: image filenames under `github_assets`
- `left_role`, `right_role`: labels used in the results file
- `attention_question`: text-only attention check question to use if this is the trial immediately before a check
- `attention_key`: correct `F`/`J` answer for that attention check

The current table includes groups `A` through `D`. PCIbex rotates participants across those groups using its internal counter when this line is active:

```javascript
GetTable("items.csv").setGroupColumn("group");
```

Participant IDs are read from the URL parameters `id`, `PROLIFIC_PID`, `participant`, or `workerId`. If none is present, the script generates and logs an anonymous browser-local ID.

For PCIbex, images do not need to be uploaded as PCIbex resources when they are loaded from jsDelivr/GitHub. Keep image files outside PCIbex include folders, as in `github_assets/objects/`, or host them in a separate GitHub repository/branch and update `imageBaseUrl` in `data_includes/main.js`. The file `github_assets/missing_assets_for_all_lists.csv` lists image paths that are referenced by the four-list table but not currently present locally.

## Compressing Images

Run this from the repository root after adding or replacing image stimuli:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\compress-images.ps1
```

The script converts PNG/JPG stimuli under `github_assets/objects/` to high-quality JPG, resizes them to a maximum of 600 x 600 pixels, and keeps them under 1 MB. The filenames in `items.csv` should use `.jpg`.

## PCIbex Sync

1. Push this repository to GitHub.
2. Create a new PCIbex Farm project.
3. Use the Git Sync button.
4. Enter the public GitHub repository URL and select the branch.
5. Run the experiment from the PCIbex test link.

Keep `DebugOff()` commented while testing. Uncomment it only before real data collection.
