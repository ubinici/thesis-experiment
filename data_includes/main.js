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
        .cssContainer({ "font-size": "28px", "font-weight": "700", "margin": "0 auto 24px", "text-align": "center" })
        .center()
        .print()
    ,
    newText("instructions-1", "On each trial, you will see two objects and hear the beginning of a description, such as \"Click on the yellow...\"")
        .cssContainer({ "font-size": "18px", "line-height": "1.45", "margin": "14px auto", "max-width": "720px" })
        .center()
        .print()
    ,
    newText("instructions-2", "Press F to choose the left object or J to choose the right object. Then rate how confident you are in your choice.")
        .cssContainer({ "font-size": "18px", "line-height": "1.45", "margin": "14px auto", "max-width": "720px" })
        .center()
        .print()
    ,
    newText("instructions-3", "Some displays may be grayscale. In those cases, answer based on which object you think the speaker is more likely to describe.")
        .cssContainer({ "font-size": "18px", "line-height": "1.45", "margin": "14px auto", "max-width": "720px" })
        .center()
        .print()
    ,
    newButton("start", "Start practice")
        .cssContainer({ "margin": "24px auto 0", "text-align": "center" })
        .center()
        .print()
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
        .cssContainer({ "font-size": "28px", "font-weight": "700", "margin": "0 auto 24px", "text-align": "center" })
        .center()
        .print()
    ,
    newText("close", "You may now close this window.")
        .cssContainer({ "font-size": "18px", "line-height": "1.45", "margin": "14px auto", "max-width": "720px" })
        .center()
        .print()
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
            .cssContainer({ "font-size": "20px", "font-weight": "600", "margin": "0 auto 22px", "text-align": "center" })
            .center()
            .print()
        ,
        newImage("left-image", row.left_image)
            .size(240, 240)
        ,
        newImage("right-image", row.right_image)
            .size(240, 240)
        ,
        newText("left-key", "F")
            .cssContainer({ "font-size": "22px", "font-weight": "700", "text-align": "center" })
        ,
        newText("right-key", "J")
            .cssContainer({ "font-size": "22px", "font-weight": "700", "text-align": "center" })
        ,
        newCanvas("display", 680, 310)
            .add(40, 0, getImage("left-image"))
            .add(480, 0, getImage("right-image"))
            .add(145, 260, getText("left-key"))
            .add(585, 260, getText("right-key"))
            .cssContainer({ "margin": "0 auto 24px", "display": "block" })
            .center()
            .print()
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
            .cssContainer({ "font-size": "20px", "font-weight": "600", "margin": "0 auto 22px", "text-align": "center" })
            .center()
            .print()
        ,
        newScale("confidence", "1", "2", "3", "4", "5")
            .labelsPosition("top")
            .before(newText("confidence-low", "Not confident"))
            .after(newText("confidence-high", "Very confident"))
            .cssContainer({ "font-size": "18px", "margin": "28px auto", "text-align": "center" })
            .center()
            .log()
            .print()
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
            .cssContainer({ "font-size": "28px", "font-weight": "700", "margin": "0 auto 24px", "text-align": "center" })
            .center()
            .print()
        ,
        newText("question", "")
            .text(getVar("lastAttentionQuestion"))
            .cssContainer({ "font-size": "20px", "font-weight": "600", "margin": "0 auto 22px", "text-align": "center" })
            .center()
            .print()
        ,
        newText("keys", "Press F for the left option or J for the right option.")
            .cssContainer({ "font-size": "18px", "line-height": "1.45", "margin": "14px auto", "max-width": "720px", "text-align": "center" })
            .center()
            .print()
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
