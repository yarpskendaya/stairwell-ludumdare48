var VrSelectable = pc.createScript("vrSelectable");

VrSelectable.attributes.add("boundingBoxSize", {
    type: "vec3",
    default: [0.5, 0.5, 0.5],
    description: "The half extents of the bounding box that is selectable for this button"
});

VrSelectable.attributes.add("buttonProxy", {
    type: "entity",
    title: "Button Proxy",
    description: "The button entity to fire click on when selected in VR. Fires on own entity as default"
});

VrSelectable.attributes.add("debug", {
    type: "boolean",
    title: "Show Debug Bounding Box",
    default: false,
    description: "Enable to show the bounding box (for debugging)"
});

VrSelectable.attributes.add("selectionTime", {
    type: "number",
    title: "Selection Time",
    default: 1.5,
    description: "The time in seconds it takes to select"
});

VrSelectable.prototype.clickEntity = {};
VrSelectable.prototype.hovering = false;
VrSelectable.prototype.rotater = {};
VrSelectable.prototype.timeSinceLastHover = 0;
VrSelectable.prototype.timeSinceLastUnHover = 0;

VrSelectable.prototype.initialize = function () {
    this.rotater = this.entity.script.rotater;
    this.isSelectedOnDown = false;

    this.clickEntity = this.buttonProxy ? this.buttonProxy : this.entity;
    
    this.enableInteraction();

    this.on("enable", this.enableInteraction, this);
    this.on("disable", this.disableInteraction, this);
};

VrSelectable.prototype.enableInteraction = function () {
    this.entity.on("selectorcamera:hover", this.onVrHover, this);
};

VrSelectable.prototype.disableInteraction = function () {
    this.entity.off("selectorcamera:hover", this.onVrHover, this);
};

VrSelectable.prototype.getBoundingBox = function () {
    return new pc.BoundingBox(Object.assign({}, this.entity.getPosition()), this.boundingBoxSize);
};

VrSelectable.prototype.onVrHover = function () {
    this.hovering = true;
    this.timeSinceLastHover = 0;
};

VrSelectable.prototype.update = function (dt) {
    if (this.debug)
        this.drawBoundingBox();

    this.timeSinceLastHover += dt;

    if (this.timeSinceLastHover >= 0.1)
        this.hovering = false;

    this.rotater.rotating = this.hovering;

    if (!this.hovering)
        this.timeSinceLastUnHover = 0;
    else
        this.timeSinceLastUnHover += dt;

    if (this.timeSinceLastUnHover >= this.selectionTime) {
        //Hovered long enough to select
        this.clickEntity.script.inSceneUiButton.onClick();
        //Reset afterwards
        this.rotater.rotating = false;
        this.timeSinceLastUnHover = 0;
    }
};

VrSelectable.prototype.drawBoundingBox = function () {
    var color = new pc.Color(1, 0, 0);
    var boundingBox = this.getBoundingBox();
    //Bottom plane is (CCW): A (min), B, C, D
    //Top plane is (CWW): E, F, G (max), H
    var a = boundingBox.getMin();
    var g = boundingBox.getMax();
    var b = new pc.Vec3(g.x, a.y, a.z);
    var c = new pc.Vec3(g.x, a.y, g.z);
    var d = new pc.Vec3(a.x, a.y, g.z);
    var e = new pc.Vec3(a.x, g.y, a.z);
    var f = new pc.Vec3(g.x, g.y, a.z);
    var h = new pc.Vec3(a.x, g.y, g.z);
    this.app.renderLine(a, b, color);
    this.app.renderLine(a, e, color);
    this.app.renderLine(a, d, color);
    this.app.renderLine(g, h, color);
    this.app.renderLine(g, c, color);
    this.app.renderLine(g, f, color);
    this.app.renderLine(e, h, color);
    this.app.renderLine(e, f, color);
    this.app.renderLine(h, d, color);
    this.app.renderLine(c, d, color);
    this.app.renderLine(b, c, color);
    this.app.renderLine(b, f, color);
};