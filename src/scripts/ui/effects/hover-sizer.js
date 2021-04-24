var HoverSizer = pc.createScript("hoverSizer");

HoverSizer.attributes.add("maxEnlarge", {
    type: "number", 
    title: "Max Enlarge", 
    default: 2.5, 
    description: "Defines the maximum size factor the element can have when hovered over"
});
    
HoverSizer.attributes.add("enlargeSpeed", {
    type: "number", 
    title: "Enlarge Speed", 
    default: 4, 
    description: "Defines the speed at which the element increases in size when hovered over"
});

HoverSizer.attributes.add("includeChild", {
    type: "boolean", 
    title: "Include Child", 
    default: false, 
    description: "Sizes the child element too when enabled"
});

HoverSizer.prototype._hovering = false;
HoverSizer.prototype._child = {};
HoverSizer.prototype._startWidth = 0;
HoverSizer.prototype._startHeight = 0;
HoverSizer.prototype._childStartWidth = false;
HoverSizer.prototype._childStartHeight = false;

HoverSizer.prototype.initialize = function() {
    this.initializeStartValues();

    //We can't hover if we are on a touch device
    if (pc.platform.touch && !pc.platform.desktop)
        this.selfDisable();
    else {
        // mouse events
        this.entity.element.on("mouseenter", this.onEnter, this);
        this.entity.element.on("mouseleave", this.onLeave, this);
    }
};

HoverSizer.prototype.initializeStartValues = function () {
    this._startWidth = this.entity.element.width;
    this._startHeight = this.entity.element.height;

    if (this.includeChild) {
        this._child = this.entity.children[0];
        this._childStartWidth = this._child.element.width;
        this._childStartHeight = this._child.element.height;
    }
};

HoverSizer.prototype.selfDisable = function() {
    this._hovering = true;
    this.entity.element.width = this._startWidth * this.maxEnlarge;
    this.entity.element.height = this._startHeight * this.maxEnlarge;
    if (this.includeChild) {
        this._child.element.width = this._childStartWidth * this.maxEnlarge;
        this._child.element.height = this._childStartHeight * this.maxEnlarge;
    }

    this.entity.script.hoverSizer.enabled = false;
};

HoverSizer.prototype.update = function(dt) {
    //Increase or decrease the size of the button based on whether we are hovering or not
    if (this._hovering) {
        this.scaleElement(this.entity, this._startWidth, this._startHeight, dt, true);
        if (this.includeChild)
            this.scaleElement(this._child, this._childStartWidth, this._childStartHeight, dt * 0.7, true);
    }
    
    else if (this.entity.element.height > this._startWidth) {
        this.scaleElement(this.entity, this._startWidth, this._startHeight, dt, false);
        if (this.includeChild)
            this.scaleElement(this._child, this._childStartWidth, this._childStartHeight, dt * 0.7, false);
    }
};

HoverSizer.prototype.scaleElement = function (entity, startWidth, startHeight, dt, grow) {
    //Decides whether we grow to max size, or shrink to default size
    var scaleFactor = grow ? this.maxEnlarge : 1;
    entity.element.width = pc.math.lerp(entity.element.width, startWidth * scaleFactor, this.enlargeSpeed * dt);
    entity.element.height = pc.math.lerp(entity.element.height, startHeight * scaleFactor, this.enlargeSpeed * dt);
};

//-----------------EVENT FUNCTIONS--------------------------------------

HoverSizer.prototype.onEnter = function (event) {
    this._hovering = true;
};

HoverSizer.prototype.onLeave = function (event) {
    this._hovering = false;
};