PennController.ResetPrefix(null);

// Keep the debugger visible while developing. Uncomment before real data collection.
// DebugOff();

var showProgressBar = false;
const participantId = getParticipantId();
const imageBaseUrl = "https://cdn.jsdelivr.net/gh/ubinici/thesis-experiment@main/github_assets/";
const previewDurationMs = 400;
const experimentVersion = "2026-08-12";

// Select one of the four counterbalanced workbook lists per participant session.
GetTable("items.csv").setGroupColumn("group");

// Increment on entry so concurrent participants rotate across A/B/C/D rather
// than waiting for the preceding participant to finish before the counter moves.
SetCounter("counter", "inc", 1);

newTrial("init",
    newVar("lastAttentionQuestion", "")
        .global()
    ,
    newVar("lastAttentionKey", "")
        .global()
    ,
    newVar("lastItemId", "")
        .global()
    ,
    newVar("lastLeftRole", "")
        .global()
    ,
    newVar("lastRightRole", "")
        .global()
    ,
    newVar("lastGroup", "")
        .global()
    ,
    newVar("lastListId", "")
        .global()
    ,
    newVar("globalTrialSequenceIndex", 0)
        .global()
    ,
    newTimer("init-pause", 1)
        .start()
        .wait()
)
.setOption("countsForProgressBar", false);

newTrial("instructions",
    newText("title", "Referential prediction experiment")
        .css(stageTitleStyle())
    ,
    newText("instructions-1", "On each trial, you will see two objects. The speaker always saw the original full-color scene.")
        .css(stageParagraphStyle())
    ,
    newText("instructions-2", "Your display may show that scene in full color or with its color information removed. You will not be told the original colors of grayscale objects.")
        .css(stageParagraphStyle())
    ,
    newText("instructions-3", "You will hear the beginning of the speaker's description, such as \"Click on the yellow...\" Wait until the phrase has ended, then choose the object you think the speaker is more likely to refer to.")
        .css(stageParagraphStyle())
    ,
    newText("instructions-4", "Press F for the left object or J for the right object. Then rate your confidence from 1 to 5.")
        .css(stageParagraphStyle())
    ,
    newButton("start", "Start practice")
        .css(primaryButtonStyle())
    ,
    newCanvas("instructions-screen", 920, 560)
        .add("center at 50%", 0, getText("title"))
        .add("center at 50%", 78, getText("instructions-1"))
        .add("center at 50%", 150, getText("instructions-2"))
        .add("center at 50%", 242, getText("instructions-3"))
        .add("center at 50%", 344, getText("instructions-4"))
        .add("center at 50%", 448, getButton("start"))
        .print("center at 50vw", "top at 12vh")
    ,
    getButton("start")
        .wait()
)
.log("participant_id", participantId)
.setOption("countsForProgressBar", false);

Template(
    GetTable("items.csv").filter(row => row.trial_type == "practice"),
    row => choiceTrial("practice", row)
);

["1", "2", "3", "4", "5"].forEach(blockNumber =>
    Template(
        GetTable("items.csv")
            .filter(row => row.block == blockNumber)
            .filter(row => row.trial_type == "critical" || row.trial_type == "filler"),
        row => choiceTrial("main-block-" + blockNumber, row)
    )
);

attentionTrial("attention-1");
attentionTrial("attention-2");
attentionTrial("attention-3");
attentionTrial("attention-4");

newTrial("completion",
    newText("done", "Thank you. Your responses have been recorded.")
        .css(stageTitleStyle())
    ,
    newText("close", "You may now close this window.")
        .css(stageHintStyle())
    ,
    newCanvas("completion-screen", 920, 560)
        .add("center at 50%", 0, getText("done"))
        .add("center at 50%", 168, getText("close"))
        .print("center at 50vw", "top at 12vh")
    ,
    newTimer("end", 1)
        .wait()
)
.log("participant_id", participantId)
.setOption("countsForProgressBar", false);

function choiceTrial(label, row) {
    const hasCorrectKey = row.correct_key == "F" || row.correct_key == "J";

    const leftImageVal = githubImageUrl(row.left_image);
    const rightImageVal = githubImageUrl(row.right_image);

    return newTrial(label,
        newVar("choice_key", "")
            .log("final")
        ,
        newVar("choice_side", "")
            .log("final")
        ,
        newVar("chosen_object", "")
            .log("final")
        ,
        newVar("chosen_role", "")
            .log("final")
        ,
        newVar("selected_color_associated", row.trial_type == "critical" ? "" : "NA")
            .log("final")
        ,
        newVar("choice_correct", hasCorrectKey ? "0" : "NA")
            .log("final")
        ,
        newVar("trial_sequence_index", "")
            .log("final")
        ,
        newVar("display_start_time_ms", 0)
        ,
        newVar("audio_start_time_ms", 0)
        ,
        newVar("choice_start_time_ms", 0)
        ,
        newVar("preview_elapsed_ms", "")
            .log("final")
        ,
        newVar("audio_playback_ms", "")
            .log("final")
        ,
        newVar("choice_rt_ms", "")
            .log("final")
        ,
        newVar("display_to_choice_rt_ms", "")
            .log("final")
        ,
        getVar("globalTrialSequenceIndex")
            .set(v => v + 1)
        ,
        getVar("trial_sequence_index")
            .set(getVar("globalTrialSequenceIndex"))
        ,
        getVar("lastAttentionQuestion")
            .set(row.attention_question)
        ,
        getVar("lastAttentionKey")
            .set(row.attention_key)
        ,
        getVar("lastItemId")
            .set(row.item_id)
        ,
        getVar("lastLeftRole")
            .set(row.left_role)
        ,
        getVar("lastRightRole")
            .set(row.right_role)
        ,
        getVar("lastGroup")
            .set(row.group)
        ,
        getVar("lastListId")
            .set(row.list_id)
        ,
        newText("prompt", "Listen to the description and choose the more likely referent.")
            .css(stageQuestionStyle())
        ,
        newImage("left-image", leftImageVal)
            .size(300, 300)
        ,
        newImage("right-image", rightImageVal)
            .size(300, 300)
        ,
        newAudio("cue", row.audio)
            .log()
        ,
        newText("left-key", "F")
            .css({
                "background": "#222",
                "border-radius": "4px",
                "color": "#fff",
                "display": "inline-block",
                "font-size": "22px",
                "font-weight": "700",
                "line-height": "1",
                "padding": "8px 0",
                "text-align": "center",
                "width": "56px"
            })
        ,
        newText("right-key", "J")
            .css({
                "background": "#222",
                "border-radius": "4px",
                "color": "#fff",
                "display": "inline-block",
                "font-size": "22px",
                "font-weight": "700",
                "line-height": "1",
                "padding": "8px 0",
                "text-align": "center",
                "width": "56px"
            })
        ,
        newCanvas("trial-screen", 920, 560)
            .add("center at 50%", 0, getText("prompt"))
            .add(80, 112, getImage("left-image"))
            .add(540, 112, getImage("right-image"))
            .add(202, 444, getText("left-key"))
            .add(662, 444, getText("right-key"))
            .print("center at 50vw", "top at 12vh")
            .log()
        ,
        getVar("display_start_time_ms")
            .set(v => Date.now())
        ,
        newTimer("preview", previewDurationMs)
            .start()
            .wait()
        ,
        getVar("preview_elapsed_ms")
            .set(getVar("display_start_time_ms"))
            .set(v => Date.now() - v)
        ,
        getVar("audio_start_time_ms")
            .set(v => Date.now())
        ,
        getAudio("cue")
            .play()
        ,
        getAudio("cue")
            .wait("first")
        ,
        getVar("audio_playback_ms")
            .set(getVar("audio_start_time_ms"))
            .set(v => Date.now() - v)
        ,
        getVar("choice_start_time_ms")
            .set(v => Date.now())
        ,
        newKey("choice", "FJ")
            .log("first")
            .wait()
        ,
        getVar("choice_rt_ms")
            .set(getVar("choice_start_time_ms"))
            .set(v => Date.now() - v)
        ,
        getVar("display_to_choice_rt_ms")
            .set(getVar("display_start_time_ms"))
            .set(v => Date.now() - v)
        ,
        getVar("choice_key")
            .set(getKey("choice"))
        ,
        getKey("choice")
            .test.pressed("F")
            .success(
                getVar("choice_side").set("left")
                ,
                getVar("chosen_object").set(row.left_object)
                ,
                getVar("chosen_role").set(row.left_role)
                ,
                getVar("selected_color_associated").set(primaryChoiceCode(row.trial_type, row.left_role))
            )
            .failure(
                getVar("choice_side").set("right")
                ,
                getVar("chosen_object").set(row.right_object)
                ,
                getVar("chosen_role").set(row.right_role)
                ,
                getVar("selected_color_associated").set(primaryChoiceCode(row.trial_type, row.right_role))
            )
        ,
        getKey("choice")
            .test.pressed(hasCorrectKey ? row.correct_key : "__NO_CORRECT_KEY__")
            .success(getVar("choice_correct").set("1"))
            .failure(getVar("choice_correct").set(hasCorrectKey ? "0" : "NA"))
        ,
        getAudio("cue")
            .stop()
        ,
        clear()
        ,
        newText("confidence-prompt", "How confident are you in your choice?")
            .css(stageQuestionStyle())
        ,
        newText("confidence-hint", "Click a number or press the matching key.")
            .css(stageHintStyle())
        ,
        newText("confidence-low", "Not confident at all")
            .css(endpointLabelStyle("right"))
        ,
        newText("confidence-high", "Completely confident")
            .css(endpointLabelStyle("left"))
        ,
        newVar("confidence_response", "")
            .log("final")
        ,
        newVar("confidence_start_time_ms", 0)
        ,
        newVar("confidence_rt_ms", "")
            .log("final")
        ,
        newButton("confidence-1", "1")
            .css(confidenceButtonStyle())
        ,
        newButton("confidence-2", "2")
            .css(confidenceButtonStyle())
        ,
        newButton("confidence-3", "3")
            .css(confidenceButtonStyle())
        ,
        newButton("confidence-4", "4")
            .css(confidenceButtonStyle())
        ,
        newButton("confidence-5", "5")
            .css(confidenceButtonStyle())
        ,
        newSelector("confidence")
            .add(
                getButton("confidence-1"),
                getButton("confidence-2"),
                getButton("confidence-3"),
                getButton("confidence-4"),
                getButton("confidence-5")
            )
            .keys("1", "2", "3", "4", "5")
            .log()
        ,
        newCanvas("confidence-screen", 920, 560)
            .add("center at 50%", 0, getText("confidence-prompt"))
            .add("center at 50%", 58, getText("confidence-hint"))
            .add(117, 244, getText("confidence-low"))
            .add(267, 222, getButton("confidence-1"))
            .add(349, 222, getButton("confidence-2"))
            .add(431, 222, getButton("confidence-3"))
            .add(513, 222, getButton("confidence-4"))
            .add(595, 222, getButton("confidence-5"))
            .add(673, 244, getText("confidence-high"))
            .print("center at 50vw", "top at 12vh")
        ,
        getVar("confidence_start_time_ms")
            .set(v => Date.now())
        ,
        getSelector("confidence")
            .wait()
        ,
        getVar("confidence_rt_ms")
            .set(getVar("confidence_start_time_ms"))
            .set(v => Date.now() - v)
        ,
        getSelector("confidence")
            .test.selected(getButton("confidence-1"))
            .success(getVar("confidence_response").set("1"))
        ,
        getSelector("confidence")
            .test.selected(getButton("confidence-2"))
            .success(getVar("confidence_response").set("2"))
        ,
        getSelector("confidence")
            .test.selected(getButton("confidence-3"))
            .success(getVar("confidence_response").set("3"))
        ,
        getSelector("confidence")
            .test.selected(getButton("confidence-4"))
            .success(getVar("confidence_response").set("4"))
        ,
        getSelector("confidence")
            .test.selected(getButton("confidence-5"))
            .success(getVar("confidence_response").set("5"))
    )
    .log("experiment_version", experimentVersion)
    .log("participant_id", participantId)
    .log("trial_type", row.trial_type)
    .log("block", row.block)
    .log("item_id", row.item_id)
    .log("condition", row.condition)
    .log("group", row.group)
    .log("list_id", row.list_id)
    .log("typicality", row.typicality)
    .log("visual_availability", row.visual_availability)
    .log("color", row.color)
    .log("left_object", row.left_object)
    .log("right_object", row.right_object)
    .log("left_color", row.left_color)
    .log("right_color", row.right_color)
    .log("audio", row.audio)
    .log("left_image", leftImageVal)
    .log("right_image", rightImageVal)
    .log("left_role", row.left_role)
    .log("right_role", row.right_role)
    .log("attention_question", row.attention_question)
    .log("attention_key", row.attention_key)
    .log("correct_key", row.correct_key)
    .log("preview_duration_ms", previewDurationMs)
    .log("choice_rt_origin", "audio_offset");
}

function primaryChoiceCode(trialType, role) {
    if (trialType != "critical") {
        return "NA";
    }

    return role == "color_associated" ? "1" : "0";
}

function githubImageUrl(imagePath) {
    if (/^https?:\/\//.test(imagePath)) {
        return imagePath;
    }

    return imageBaseUrl + imagePath.split("/").map(encodeURIComponent).join("/");
}

function getParticipantId() {
    const urlId =
        GetURLParameter("id") ||
        GetURLParameter("PROLIFIC_PID") ||
        GetURLParameter("participant") ||
        GetURLParameter("workerId");

    if (urlId) {
        return urlId;
    }

    const storageKey = "thesis_experiment_participant_id";
    try {
        const existingId = window.sessionStorage.getItem(storageKey);
        if (existingId) {
            return existingId;
        }

        const generatedId = "anon_" + Date.now() + "_" + Math.floor(Math.random() * 1000000);
        window.sessionStorage.setItem(storageKey, generatedId);
        return generatedId;
    }
    catch (error) {
        return "anon_" + Date.now() + "_" + Math.floor(Math.random() * 1000000);
    }
}

function attentionTrial(label) {
    const attentionNumber = label.replace("attention-", "");

    return newTrial(label,
        newText("title", "Attention check " + attentionNumber)
            .css(stageTitleStyle())
        ,
        newText("question", "")
            .text(getVar("lastAttentionQuestion"))
            .css(stageQuestionStyle())
        ,
        newText("keys", "Press F for the left option or J for the right option.")
            .css(stageHintStyle())
        ,
        newCanvas("attention-screen", 920, 560)
            .add("center at 50%", 0, getText("title"))
            .add("center at 50%", 168, getText("question"))
            .add("center at 50%", 226, getText("keys"))
            .print("center at 50vw", "top at 12vh")
        ,
        newVar("attention_expected_key", "")
            .set(getVar("lastAttentionKey"))
            .log("final")
        ,
        newVar("attention_previous_item", "")
            .set(getVar("lastItemId"))
            .log("final")
        ,
        newVar("attention_previous_left_role", "")
            .set(getVar("lastLeftRole"))
            .log("final")
        ,
        newVar("attention_previous_right_role", "")
            .set(getVar("lastRightRole"))
            .log("final")
        ,
        newVar("attention_previous_group", "")
            .set(getVar("lastGroup"))
            .log("final")
        ,
        newVar("attention_previous_list_id", "")
            .set(getVar("lastListId"))
            .log("final")
        ,
        newVar("attention_after_trial_index", "")
            .set(getVar("globalTrialSequenceIndex"))
            .log("final")
        ,
        newVar("attention_response_key", "")
            .log("final")
        ,
        newVar("attention_correct", "0")
            .log("final")
        ,
        newVar("attention_start_time_ms", 0)
        ,
        newVar("attention_rt_ms", "")
            .log("final")
        ,
        getVar("attention_start_time_ms")
            .set(v => Date.now())
        ,
        newKey("attention", "FJ")
            .log("first")
            .wait()
        ,
        getVar("attention_rt_ms")
            .set(getVar("attention_start_time_ms"))
            .set(v => Date.now() - v)
        ,
        getVar("attention_response_key")
            .set(getKey("attention"))
        ,
        getKey("attention")
            .test.pressed(getVar("lastAttentionKey"))
            .success(getVar("attention_correct").set("1"))
            .failure(getVar("attention_correct").set("0"))
        ,
        newTimer("attention-pause", 250)
            .start()
            .wait()
    )
    .log("experiment_version", experimentVersion)
    .log("participant_id", participantId)
    .log("trial_type", "attention")
    .log("attention_label", label)
    .setOption("countsForProgressBar", false);
}

function confidenceButtonStyle() {
    return {
        "background": "#fff",
        "border": "2px solid #222",
        "border-radius": "6px",
        "cursor": "pointer",
        "font-size": "28px",
        "font-weight": "700",
        "height": "58px",
        "padding": "0",
        "text-align": "center",
        "width": "58px"
    };
}

function stageTitleStyle() {
    return {
        "font-size": "30px",
        "font-weight": "700",
        "line-height": "1.2",
        "text-align": "center",
        "width": "920px"
    };
}

// Ensure proper alignment box for titles, prompts, and hints on canvas
function stageQuestionStyle() {
    return {
        "font-size": "24px",
        "font-weight": "700",
        "line-height": "1.25",
        "text-align": "center",
        "width": "920px"
    };
}

function stageParagraphStyle() {
    return {
        "font-size": "19px",
        "line-height": "1.45",
        "text-align": "left",
        "width": "760px"
    };
}

function stageHintStyle() {
    return {
        "font-size": "17px",
        "line-height": "1.4",
        "text-align": "center",
        "width": "920px"
    };
}

function endpointLabelStyle(alignment) {
    return {
        "font-size": "17px",
        "font-weight": "700",
        "line-height": "1.2",
        "text-align": alignment,
        "width": "130px"
    };
}

function primaryButtonStyle() {
    return {
        "background": "#235c68",
        "border": "0",
        "border-radius": "4px",
        "color": "#fff",
        "cursor": "pointer",
        "font-size": "18px",
        "font-weight": "700",
        "padding": "11px 20px"
    };
}

Sequence(
    "counter",
    "init",
    "instructions",
    "practice",
    "main-block-1",
    "attention-1",
    "main-block-2",
    "attention-2",
    "main-block-3",
    "attention-3",
    "main-block-4",
    "attention-4",
    "main-block-5",
    SendResults(),
    "completion"
);
