
var UiManager = pc.createScript("uiManager");

UiManager.attributes.add("positionEntities", {
    type: "entity"
});

UiManager.attributes.add("buttonsEntity", {
    type: "entity",
});

UiManager.attributes.add("fadeScreen", {
    type: "entity"
});

UiManager.attributes.add("viewConfigurationFileName", {
    type: "string",
    default: "views.json"
});

UiManager.attributes.add("buttonMovementConfigurationFileName", {
    type: "string",
    default: "ButtonMovement.json"
});

UiManager.prototype.currentConfiguration = {};
//The optionsets that currently don"t have >1 option available and which buttons therefore should be hidden
UiManager.prototype.unconfigurableOptionSets = [];
//The entity to which 3d UI is positioned relative to
UiManager.prototype.referenceSubject = null;
//The views.json information about all views
UiManager.prototype.viewConfiguration = null;
//The offsets with which buttons are repositioned based on the current configuration
UiManager.prototype.transformOffsets = {};

UiManager.prototype.currentView = "";
UiManager.prototype.buttons = [];

//Whether 3d UI positions should be mirrored
UiManager.prototype.mirror = false;
//The value of the x-axis where mirroring should be originated from
UiManager.prototype.mirrorAxis = 0;

UiManager.prototype.initialize = function () {
    //TODO: not sure if this has to be put here
    this.app.addTweenManager();

    this.viewConfiguration = this.app.assets.find(this.viewConfigurationFileName).resource;
    this.transformOffsets = this.app.assets.find(this.buttonMovementConfigurationFileName).resource.transformOffsets;

    this.buttons = this.buttonsEntity.children;
    this.movingButtons = [];
    this.subscribeToEvents();
};

UiManager.prototype.subscribeToEvents = function () {
    this.app.on("config:configuration", function (configuration) {
        this.currentConfiguration = configuration;
        this.setButtonsForView();
    }, this);

    this.app.on("config:unconfigurable", function (unconfigurableOptionSets) {
        this.unconfigurableOptionSets = unconfigurableOptionSets;
        this.setButtonsForView();
    }, this);

    this.app.on("view", this.setView, this);
    this.app.on("view:subject", this.updateSubject, this);
    this.app.on("view:fade", this.fadeToBlack, this);
    this.app.on("view:mirror", function (isMirrored, mirrorAxis) {
        this.mirror = isMirrored;
        this.mirrorAxis = mirrorAxis;
        this.setButtonsForView();
    }, this);

    this.app.on("ui:zenMode", this.setZenMode, this);
};

UiManager.prototype.postInitialize = function () {
    this.positionEntities.enabled = false;
    //We start the scene by fading in from black
    if (this.fadeScreen)
        this.fadeScreen.script.timedFader.fadeOut(1);
};

UiManager.prototype.updateSubject = function (subject) {
    if (subject)
        this.referenceSubject = subject;
    else
        console.error("Tried to assign subject but no subject was provided");
};

UiManager.prototype.setView = function (viewName) {
    if (!viewName || viewName === "")
        return;

    if (this.viewConfiguration[viewName]) {
        this.currentView = viewName;
        this.setButtonsForView();
    }
    else
        console.error("Could not find view: " + viewName);
};

UiManager.prototype.setButtonsForView = function () {
    if (this.currentView === "")
        return;
        
    var viewData = this.viewConfiguration[this.currentView];
    if (!viewData) {
        console.error("Could not find view: " + this.currentView);
        return;
    }

    for (var b in this.buttons)
        this.buttons[b].enabled = false;

    for (var v in viewData.buttons) {
        var button = this.findButton(viewData.buttons[v]);

        if (!button) {
            console.error("Could not find " + viewData.buttons[v]);
            continue;
        }

        button.enabled = !this.isUnconfigurable(button);

        if (button.enabled) {
            if (button.script.uiPositioner)
                this.setReferencePosition(button);
            button.fire("mirror", this.mirror);
        }
    }
};

UiManager.prototype.isUnconfigurable = function (button) {
    if (button.script.optionSetButton)
        return this.unconfigurableOptionSets.includes(button.script.optionSetButton.optionSetName);
    else
        return false;
};

UiManager.prototype.fadeToBlack = function (fadeDuration, yoyo) {
    if (yoyo)
        this.fadeScreen.script.timedFader.fadeInAndOut(fadeDuration, yoyo);
    else
        this.fadeScreen.script.timedFader.fadeIn(fadeDuration);
};

UiManager.prototype.findButton = function (buttonName) {
    return this.buttons.find(function (b) { return b.name == buttonName; });
};

UiManager.prototype.setZenMode = function (isZen) {
    this.buttonsEntity.enabled = !isZen;
};

//---------UI Positioning----------------------------

//Find the 3d position that this button is supposed to have and assign it
UiManager.prototype.setReferencePosition = function (button) {
    var positionEntityName = button.name;
    var positionEntityPosition = this.getPositionEntityPosition(positionEntityName);
    var position = positionEntityPosition.clone();

    var transformOffsetId = button.script.uiPositioner.transformOffsetId;
    if (transformOffsetId !== "")
        position = position.add(this.getRepositioningVector(transformOffsetId));

    //Take into account whether we should mirror the position or not
    if (this.mirror) {
        position = new pc.Vec3(
            this.mirrorAxis - position.x,
            position.y,
            position.z
        );
    }

    //TODO: Take referenceSubject rotation into account as well
    if (this.referenceSubject)
        position.add(this.referenceSubject.getPosition());

    button.script.uiPositioner.referencePosition = position;
};

UiManager.prototype.getRepositioningVector = function (transformOffsetId) {
    if (this.currentConfiguration) {
        var transformOffset = this.transformOffsets[transformOffsetId];
        if (transformOffset) {
            var position = transformOffset.position;
            var x = this.traverseValueTree(position.x);
            var y = this.traverseValueTree(position.y);
            var z = this.traverseValueTree(position.z);
            return new pc.Vec3(x, y, z);
        }
    }

    return new pc.Vec3();
};

UiManager.prototype.traverseValueTree = function (tree) {
    if (tree === undefined)
        return 0;

    var currentNode = tree;
    while (true) {
        //We found a leaf node
        if (typeof (currentNode) !== "object")
            return currentNode;

        //We found another node, branch into the right choice and look further there
        else {
            var nextNode = this.getNextNode(currentNode);
            if (!nextNode)
                return 0;
            currentNode = nextNode;
        }
    }
};

UiManager.prototype.getNextNode = function (node) {
    var optionSetName = Object.keys(node)[0];
    var selectedOption = this.currentConfiguration[optionSetName];
    var nextNode = node[optionSetName][selectedOption];
    return nextNode;
};

UiManager.prototype.getPositionEntityPosition = function (positionEntityName) {
    var positionEntity;

    //Find the viewgroup, and check if the positionEntity is in there
    var viewGroup = this.positionEntities.findByName(this.currentView);
    if (viewGroup)
        positionEntity = viewGroup.findByName(positionEntityName);

    //If not, there is a generic position for this button that multiple views share
    if (!positionEntity)
        positionEntity = this.positionEntities.findByName(positionEntityName);

    //It"s not even there, so we give up
    if (!positionEntity) {
        console.error("Could not find positionEntity " + positionEntityName);
        return new pc.Vec3();
    }

    return positionEntity.getLocalPosition();
};