PennController.ResetPrefix(null);

// Keep the debugger visible while developing. Uncomment before real data collection.
// DebugOff();

var showProgressBar = false;
const participantId = GetURLParameter("id") || "NO_ID";

// For counterbalanced collection later, uncomment this line.
// GetTable("items.csv").setGroupColumn("group");

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
    newTimer("init-pause", 1)
        .start()
        .wait()
)
.setOption("countsForProgressBar", false);

newTrial("instructions",
    newText("title", "Referential prediction experiment")
        .addClass("stage-title")
    ,
    newText("instructions-1", "On each trial, you will see two objects and hear the beginning of a description, such as \"Click on the yellow...\"")
        .addClass("stage-paragraph")
    ,
    newText("instructions-2", "Press F to choose the left object or J to choose the right object. Then rate how confident you are in your choice.")
        .addClass("stage-paragraph")
    ,
    newText("instructions-3", "Some displays may be grayscale. In those cases, answer based on which object you think the speaker is more likely to describe.")
        .addClass("stage-paragraph")
    ,
    newButton("start", "Start practice")
        .addClass("primary-btn")
    ,
    newCanvas("instructions-screen", 920, 560)
        .addClass("experiment-canvas")
        .add("center at 50%", 40, getText("title"))
        .add("center at 50%", 132, getText("instructions-1"))
        .add("center at 50%", 218, getText("instructions-2"))
        .add("center at 50%", 304, getText("instructions-3"))
        .add("center at 50%", 428, getButton("start"))
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

Template(
    GetTable("items.csv")
        .filter(row => row.block == "1")
        .filter(row => row.trial_type == "critical" || row.trial_type == "filler"),
    row => choiceTrial("main-block-1", row)
);

Template(
    GetTable("items.csv")
        .filter(row => row.block == "2")
        .filter(row => row.trial_type == "critical" || row.trial_type == "filler"),
    row => choiceTrial("main-block-2", row)
);

newTrial("attention-1",
    newText("title", "Attention check 1")
        .addClass("stage-title")
    ,
    newText("question", "")
        .text(getVar("lastAttentionQuestion"))
        .addClass("stage-question")
    ,
    newText("keys", "Press F for the left option or J for the right option.")
        .addClass("stage-hint")
    ,
    newCanvas("attention-screen", 920, 560)
        .addClass("experiment-canvas")
        .add("center at 50%", 40, getText("title"))
        .add("center at 50%", 208, getText("question"))
        .add("center at 50%", 266, getText("keys"))
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
    newVar("attention_response_key", "")
        .log("final")
    ,
    newVar("attention_correct", "0")
        .log("final")
    ,
    newKey("attention", "FJ")
        .log("first")
        .wait()
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
.log("participant_id", participantId)
.log("trial_type", "attention")
.log("attention_label", "attention-1")
.setOption("countsForProgressBar", false);

newTrial("attention-2",
    newText("title", "Attention check 2")
        .addClass("stage-title")
    ,
    newText("question", "")
        .text(getVar("lastAttentionQuestion"))
        .addClass("stage-question")
    ,
    newText("keys", "Press F for the left option or J for the right option.")
        .addClass("stage-hint")
    ,
    newCanvas("attention-screen", 920, 560)
        .addClass("experiment-canvas")
        .add("center at 50%", 40, getText("title"))
        .add("center at 50%", 208, getText("question"))
        .add("center at 50%", 266, getText("keys"))
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
    newVar("attention_response_key", "")
        .log("final")
    ,
    newVar("attention_correct", "0")
        .log("final")
    ,
    newKey("attention", "FJ")
        .log("first")
        .wait()
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
.log("participant_id", participantId)
.log("trial_type", "attention")
.log("attention_label", "attention-2")
.setOption("countsForProgressBar", false);

newTrial("completion",
    newText("done", "Thank you. Your responses have been recorded.")
        .addClass("stage-title")
    ,
    newText("close", "You may now close this window.")
        .addClass("stage-hint")
    ,
    newCanvas("completion-screen", 920, 560)
        .addClass("experiment-canvas")
        .add("center at 50%", 40, getText("done"))
        .add("center at 50%", 208, getText("close"))
        .print("center at 50vw", "top at 12vh")
    ,
    newTimer("end", 1)
        .wait()
)
.log("participant_id", participantId)
.setOption("countsForProgressBar", false);

function choiceTrial(label, row) {
    const hasCorrectKey = row.correct_key == "F" || row.correct_key == "J";

    return newTrial(label,
        newVar("choice_key", "")
            .log("final")
        ,
        newVar("chosen_role", "")
            .log("final")
        ,
        newVar("choice_correct", hasCorrectKey ? "0" : "NA")
            .log("final")
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
        newText("prompt", "Listen to the description and choose the more likely referent.")
            .addClass("stage-question")
        ,
        newImage("left-image", row.left_image)
            .size(300, 300)
            .addClass("trial-image")
        ,
        newImage("right-image", row.right_image)
            .size(300, 300)
            .addClass("trial-image")
        ,
        newText("left-key", "F")
            .addClass("keycap")
        ,
        newText("right-key", "J")
            .addClass("keycap")
        ,
        newCanvas("trial-screen", 920, 560)
            .addClass("experiment-canvas")
            .add("center at 50%", 40, getText("prompt"))
            .add(80, 142, getImage("left-image"))
            .add(540, 142, getImage("right-image"))
            .add(202, 474, getText("left-key"))
            .add(662, 474, getText("right-key"))
            .print("center at 50vw", "top at 12vh")
            .log()
        ,
        newAudio("cue", row.audio)
            .log()
            .play()
        ,
        newKey("choice", "FJ")
            .log("first")
            .wait()
        ,
        getVar("choice_key")
            .set(getKey("choice"))
        ,
        getKey("choice")
            .test.pressed("F")
            .success(getVar("chosen_role").set(row.left_role))
            .failure(getVar("chosen_role").set(row.right_role))
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
            .addClass("stage-question")
        ,
        newText("confidence-hint", "Click a number or press the matching key.")
            .addClass("stage-hint")
        ,
        newText("confidence-low", "Not confident")
            .addClass("endpoint-label-left")
        ,
        newText("confidence-high", "Very confident")
            .addClass("endpoint-label-right")
        ,
        newVar("confidence_response", "")
            .log("final")
        ,
        newButton("confidence-1", "1")
            .addClass("confidence-btn")
        ,
        newButton("confidence-2", "2")
            .addClass("confidence-btn")
        ,
        newButton("confidence-3", "3")
            .addClass("confidence-btn")
        ,
        newButton("confidence-4", "4")
            .addClass("confidence-btn")
        ,
        newButton("confidence-5", "5")
            .addClass("confidence-btn")
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
            .addClass("experiment-canvas")
            .add("center at 50%", 40, getText("confidence-prompt"))
            .add("center at 50%", 98, getText("confidence-hint"))
            .add(117, 284, getText("confidence-low"))
            .add(267, 262, getButton("confidence-1"))
            .add(349, 262, getButton("confidence-2"))
            .add(431, 262, getButton("confidence-3"))
            .add(513, 262, getButton("confidence-4"))
            .add(595, 262, getButton("confidence-5"))
            .add(673, 284, getText("confidence-high"))
            .print("center at 50vw", "top at 12vh")
        ,
        getSelector("confidence")
            .wait()
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
    .log("participant_id", participantId)
    .log("trial_type", row.trial_type)
    .log("block", row.block)
    .log("item_id", row.item_id)
    .log("condition", row.condition)
    .log("group", row.group)
    .log("typicality", row.typicality)
    .log("visual_availability", row.visual_availability)
    .log("color", row.color)
    .log("left_object", row.left_object)
    .log("right_object", row.right_object)
    .log("left_color", row.left_color)
    .log("right_color", row.right_color)
    .log("audio", row.audio)
    .log("left_image", row.left_image)
    .log("right_image", row.right_image)
    .log("left_role", row.left_role)
    .log("right_role", row.right_role)
    .log("attention_question", row.attention_question)
    .log("attention_key", row.attention_key)
    .log("correct_key", row.correct_key);
}

Sequence(
    "init",
    "instructions",
    randomize("practice"),
    randomize("main-block-1"),
    "attention-1",
    randomize("main-block-2"),
    "attention-2",
    SendResults(),
    "completion"
);
