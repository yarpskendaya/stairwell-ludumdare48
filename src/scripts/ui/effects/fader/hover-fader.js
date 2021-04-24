var HoverFader = pc.createScript("hoverFader");

HoverFader.attributes.add("subject", {
    type: "entity",
    title: "Subject",
    description: "The entity that is faded by hovering, if nothing is selected the first child is faded"
});

HoverFader.prototype.initialize = function () {
    this.initializeSubject();

    if (pc.platform.touch && !pc.platform.desktop)
        this.selfDisable();
    else {
        // mouse events
        this.entity.element.on("mouseenter", this.onEnter, this);
        this.entity.element.on("mouseleave", this.onLeave, this);
    }
};

HoverFader.prototype.initializeSubject = function () {
    //If nothing is assigned, it is assumed you want to fade the first child
    if (!this.subject)
        this.subject = this.entity.children[0];
    if (!this.subject)
        console.error(this.entity.name + "could not find hover subject");
};

HoverFader.prototype.selfDisable = function () {
    this.subject.script.fader.fadeIn(4, false);
    this.entity.script.hoverFader.enabled = false;
};

HoverFader.prototype.onEnter = function () {
    this.subject.script.fader.fadeIn(4, false);
};

HoverFader.prototype.onLeave = function () {
    this.subject.script.fader.fadingIn = false;
};