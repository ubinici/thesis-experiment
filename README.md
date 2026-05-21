# Thesis Experiment PCIbex Template

This repository is a PCIbex-ready scaffold for the referential prediction experiment.

## Structure

- `data_includes/main.js`: main PennController/PCIbex experiment script.
- `chunk_includes/items.csv`: practice, critical, and filler rows.
- `chunk_includes/`: placeholder image and audio resources.
- `css_includes/PennController.css`: basic experiment styling.

PCIbex GitHub sync maps these root folders into the Farm project folders:

- `data_includes` -> Scripts
- `chunk_includes` -> Resources
- `js_includes` -> Controllers, if added later
- `css_includes` -> Aesthetics

## Current Trial Design

The default run contains:

- 1 practice trial
- 16 critical trials: 4 item sets x 4 conditions
- 4 filler trials
- 2 attention checks, inserted after 10 and 20 main trials

Main trials show two objects, play an English truncated audio cue such as "Click on the yellow...", collect an `F`/`J` choice, and then collect a 1-5 confidence rating.

Critical trials instantiate the four core conditions:

- typical color, visible display
- typical color, grayscale display
- atypical color, visible display
- atypical color, grayscale display

For critical trials, both objects share the named color in visible displays, and both objects are gray in grayscale displays. Fillers use different object colors.

Attention checks are text-only. They ask a row-specific question about the immediately preceding trial, such as "Which option was the banana?", and score the answer against `attention_key`.

The development template does not run a full-block `CheckPreloaded` gate, because that can make testing painfully slow and can mask missing-resource errors as a long loading wait. PCIbex will still load resources as trials run. Add a preload check back only once final assets are small, uploaded, and stable.

## Editing Stimuli

Replace placeholder filenames in `chunk_includes/items.csv` as final stimuli become available. The important columns are:

- `audio`: cue audio filename in `chunk_includes`
- `left_object`, `right_object`: object names shown on each side
- `left_color`, `right_color`: visible object colors, with `gray` for grayscale displays
- `left_image`, `right_image`: image filenames in `chunk_includes`
- `left_role`, `right_role`: labels used in the results file
- `attention_question`: text-only attention check question to use if this is the trial immediately before a check
- `attention_key`: correct `F`/`J` answer for that attention check

The `group` column is present for later counterbalancing. By default, the experiment runs all rows for testing. To enable PCIbex group/list filtering later, uncomment this line in `data_includes/main.js`:

```javascript
GetTable("items.csv").setGroupColumn("group");
```

## PCIbex Sync

1. Push this repository to GitHub.
2. Create a new PCIbex Farm project.
3. Use the Git Sync button.
4. Enter the public GitHub repository URL and select the branch.
5. Run the experiment from the PCIbex test link.

Keep `DebugOff()` commented while testing. Uncomment it only before real data collection.
