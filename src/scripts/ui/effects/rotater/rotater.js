var Rotater = pc.createScript("rotater");

Rotater.attributes.add("rotateSpeed", {
    type: "number",
    default: 3,
    description: "Rotationspeed in number of laps per second"
});

Rotater.attributes.add("rotateAxis", {
    type: "string",
    enum: [
        { "X": "x" },
        { "Y": "y" },
        { "Z": "z" }
    ],
    default: "z"
});

Rotater.prototype.rotating = false;
Rotater.prototype.speedModifier = 0;
Rotater.prototype.defaultRotation = {};

Rotater.prototype.initialize = function() {
    this.defaultRotation = this.entity.getLocalEulerAngles().clone();
    
    this.on("disable", function() {
        this.rotating = false;
    }, this);
};

Rotater.prototype.update = function(dt) {
    if (this.rotating) {
        this.speedModifier = Math.min(1, this.speedModifier + dt);
        this.entity.rotateLocal(this.getDeltaRotation(dt));
    }
    else {
        // this.speedModifier = math.Max(0, this.speedModifier - dt);
        this.speedModifier = 0;
        this.entity.setLocalEulerAngles(this.defaultRotation);
    }
};

Rotater.prototype.getDeltaRotation = function(dt) {
    var value = dt * this.rotateSpeed * 360 * this.speedModifier;
    switch (this.rotateAxis) {
        case "x":
            return new pc.Vec3(value, 0, 0);
        case "y":
            return new pc.Vec3(0, value, 0);
        case "z":
            return new pc.Vec3(0, 0, value);
    }
};