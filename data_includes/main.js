PennController.ResetPrefix(null);

// Keep the debugger visible while developing. Uncomment before real data collection.
// DebugOff();

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
        .cssContainer({ "font-size": "28px", "font-weight": "700", "text-align": "center", "width": "760px" })
    ,
    newText("instructions-1", "On each trial, you will see two objects and hear the beginning of a description, such as \"Click on the yellow...\"")
        .cssContainer({ "font-size": "18px", "line-height": "1.45", "width": "720px" })
    ,
    newText("instructions-2", "Press F to choose the left object or J to choose the right object. Then rate how confident you are in your choice.")
        .cssContainer({ "font-size": "18px", "line-height": "1.45", "width": "720px" })
    ,
    newText("instructions-3", "Some displays may be grayscale. In those cases, answer based on which object you think the speaker is more likely to describe.")
        .cssContainer({ "font-size": "18px", "line-height": "1.45", "width": "720px" })
    ,
    newButton("start", "Start practice")
    ,
    newCanvas("instructions-screen", 760, 420)
        .add("center at 50%", 0, getText("title"))
        .add(20, 90, getText("instructions-1"))
        .add(20, 170, getText("instructions-2"))
        .add(20, 250, getText("instructions-3"))
        .add("center at 50%", 360, getButton("start"))
        .print("center at 50vw", "top at 18vh")
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

attentionTrial("attention-1", "Attention check 1");
attentionTrial("attention-2", "Attention check 2");

newTrial("completion",
    newText("done", "Thank you. Your responses have been recorded.")
        .cssContainer({ "font-size": "28px", "font-weight": "700", "text-align": "center", "width": "760px" })
    ,
    newText("close", "You may now close this window.")
        .cssContainer({ "font-size": "18px", "line-height": "1.45", "text-align": "center", "width": "720px" })
    ,
    newCanvas("completion-screen", 760, 180)
        .add("center at 50%", 0, getText("done"))
        .add("center at 50%", 90, getText("close"))
        .print("center at 50vw", "top at 24vh")
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
            .cssContainer({ "font-size": "20px", "font-weight": "600", "text-align": "center", "width": "760px" })
        ,
        newImage("left-image", row.left_image)
            .size(240, 240)
        ,
        newImage("right-image", row.right_image)
            .size(240, 240)
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
        newCanvas("trial-screen", 760, 430)
            .add("center at 50%", 0, getText("prompt"))
            .add(100, 82, getImage("left-image"))
            .add(420, 82, getImage("right-image"))
            .add(198, 350, getText("left-key"))
            .add(518, 350, getText("right-key"))
            .print("center at 50vw", "top at 18vh")
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
            .cssContainer({ "font-size": "20px", "font-weight": "600", "text-align": "center", "width": "760px" })
        ,
        newText("confidence-hint", "Click a number or press the matching key.")
            .cssContainer({ "font-size": "16px", "text-align": "center", "width": "760px" })
        ,
        newText("confidence-low", "Not confident")
            .cssContainer({ "font-size": "17px", "font-weight": "600", "text-align": "right", "width": "140px" })
        ,
        newText("confidence-high", "Very confident")
            .cssContainer({ "font-size": "17px", "font-weight": "600", "text-align": "left", "width": "140px" })
        ,
        newScale("confidence", "1", "2", "3", "4", "5")
            .button()
            .keys("1", "2", "3", "4", "5")
            .cssContainer({ "font-size": "24px", "text-align": "center" })
            .log()
        ,
        newCanvas("confidence-screen", 900, 260)
            .add("center at 50%", 0, getText("confidence-prompt"))
            .add("center at 50%", 44, getText("confidence-hint"))
            .add(70, 126, getText("confidence-low"))
            .add("center at 50%", 110, getScale("confidence"))
            .add(690, 126, getText("confidence-high"))
            .print("center at 50vw", "top at 26vh")
        ,
        getScale("confidence")
            .wait()
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

function attentionTrial(label, title) {
    return newTrial(label,
        newText("title", title)
            .cssContainer({ "font-size": "28px", "font-weight": "700", "text-align": "center", "width": "760px" })
        ,
        newText("question", "")
            .text(getVar("lastAttentionQuestion"))
            .cssContainer({ "font-size": "20px", "font-weight": "600", "text-align": "center", "width": "760px" })
        ,
        newText("keys", "Press F for the left option or J for the right option.")
            .cssContainer({ "font-size": "18px", "line-height": "1.45", "text-align": "center", "width": "720px" })
        ,
        newCanvas("attention-screen", 760, 220)
            .add("center at 50%", 0, getText("title"))
            .add("center at 50%", 90, getText("question"))
            .add("center at 50%", 145, getText("keys"))
            .print("center at 50vw", "top at 24vh")
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
    .log("attention_label", label)
    .setOption("countsForProgressBar", false);
}
