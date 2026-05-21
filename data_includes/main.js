PennController.ResetPrefix(null);

// Keep the debugger visible while developing. Uncomment before real data collection.
// DebugOff();

var showProgressBar = false;
const participantId = GetURLParameter("id") || "NO_ID";

// For counterbalanced collection later, uncomment this line.
// GetTable("items.csv").setGroupColumn("group");

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
        .css(stageTitleStyle())
    ,
    newText("instructions-1", "On each trial, you will see two objects and hear the beginning of a description, such as \"Click on the yellow...\"")
        .css(stageParagraphStyle())
    ,
    newText("instructions-2", "Press F to choose the left object or J to choose the right object. Then rate how confident you are in your choice.")
        .css(stageParagraphStyle())
    ,
    newText("instructions-3", "Some displays may be grayscale. In those cases, answer based on which object you think the speaker is more likely to describe.")
        .css(stageParagraphStyle())
    ,
    newButton("start", "Start practice")
        .css(primaryButtonStyle())
    ,
    newCanvas("instructions-screen", 920, 460)
        .add("center at 50%", 0, getText("title"))
        .add("center at 50%", 92, getText("instructions-1"))
        .add("center at 50%", 178, getText("instructions-2"))
        .add("center at 50%", 264, getText("instructions-3"))
        .add("center at 50%", 388, getButton("start"))
        .print("center at 50vw", "top at 16vh")
    ,
    getButton("start")
        .wait()
)
.log("participant_id", participantId)
.setOption("countsForProgressBar", false);

Template("items.csv", row => choiceTrial(row));

newTrial("attention-1",
    newText("title", "Attention check 1")
        .css(stageTitleStyle())
    ,
    newText("question", "")
        .text(getVar("lastAttentionQuestion"))
        .css(stageQuestionStyle())
    ,
    newText("keys", "Press F for the left option or J for the right option.")
        .css(stageHintStyle())
    ,
    newCanvas("attention-screen", 920, 260)
        .add("center at 50%", 0, getText("title"))
        .add("center at 50%", 90, getText("question"))
        .add("center at 50%", 150, getText("keys"))
        .print("center at 50vw", "top at 22vh")
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
        .css(stageTitleStyle())
    ,
    newText("question", "")
        .text(getVar("lastAttentionQuestion"))
        .css(stageQuestionStyle())
    ,
    newText("keys", "Press F for the left option or J for the right option.")
        .css(stageHintStyle())
    ,
    newCanvas("attention-screen", 920, 260)
        .add("center at 50%", 0, getText("title"))
        .add("center at 50%", 90, getText("question"))
        .add("center at 50%", 150, getText("keys"))
        .print("center at 50vw", "top at 22vh")
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
        .css(stageTitleStyle())
    ,
    newText("close", "You may now close this window.")
        .css(stageHintStyle())
    ,
    newCanvas("completion-screen", 920, 190)
        .add("center at 50%", 0, getText("done"))
        .add("center at 50%", 90, getText("close"))
        .print("center at 50vw", "top at 24vh")
    ,
    newTimer("end", 1)
        .wait()
)
.log("participant_id", participantId)
.setOption("countsForProgressBar", false);

function choiceTrial(row) {
    const hasCorrectKey = row.correct_key == "F" || row.correct_key == "J";

    return newTrial(row.sequence_label,
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
            .css(stageQuestionStyle())
        ,
        newImage("left-image", row.left_image)
            .size(300, 300)
        ,
        newImage("right-image", row.right_image)
            .size(300, 300)
        ,
        newText("left-key", "F")
            .cssContainer({
                "background": "#222",
                "border-radius": "4px",
                "color": "#fff",
                "font-size": "22px",
                "font-weight": "700",
                "line-height": "1",
                "padding": "8px 14px",
                "text-align": "center"
            })
        ,
        newText("right-key", "J")
            .cssContainer({
                "background": "#222",
                "border-radius": "4px",
                "color": "#fff",
                "font-size": "22px",
                "font-weight": "700",
                "line-height": "1",
                "padding": "8px 14px",
                "text-align": "center"
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
            .css(stageQuestionStyle())
        ,
        newText("confidence-hint", "Click a number or press the matching key.")
            .css(stageHintStyle())
        ,
        newText("confidence-low", "Not confident")
            .css(endpointLabelStyle("right"))
        ,
        newText("confidence-high", "Very confident")
            .css(endpointLabelStyle("left"))
        ,
        newVar("confidence_response", "")
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
        newCanvas("confidence-screen", 920, 320)
            .add("center at 50%", 0, getText("confidence-prompt"))
            .add("center at 50%", 46, getText("confidence-hint"))
            .add(108, 154, getText("confidence-low"))
            .add(286, 136, getButton("confidence-1"))
            .add(372, 136, getButton("confidence-2"))
            .add(458, 136, getButton("confidence-3"))
            .add(544, 136, getButton("confidence-4"))
            .add(630, 136, getButton("confidence-5"))
            .add(730, 154, getText("confidence-high"))
            .print("center at 50vw", "top at 22vh")
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
    .log("sequence_label", row.sequence_label)
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
        "width": "150px"
    };
}
