var DisableButton = pc.createScript("disableButton");

DisableButton.attributes.add("disableParent", {
    type: "boolean",
    title: "Disable Parent",
    default: false,
    description: "Indicates whether this button should disable its parent instead of itself"
});

DisableButton.prototype.initialize = function() {
    // mouse events
    this.entity.element.on("mouseup", this.onPress, this);

    // touch events
    if (this.app.touch)
        this.entity.element.on("touchend", this.onPress, this);
};

DisableButton.prototype.onPress = function () {
    if (this.disableParent)
        this.entity.parent.enabled = false;
    else
        this.entity.enabled = false;
};
