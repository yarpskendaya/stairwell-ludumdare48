var UiPositioner = pc.createScript("uiPositioner");

UiPositioner.attributes.add("transformOffsetId", {
    type: "string",
    title: "Transform-Offset Id",
    description: "The name of the transform-offset property that causes this button to move/rotate"
});

UiPositioner.attributes.add("positionEntity", {
    type: "entity",
    description: "It is optional to supply this positioner a static entity to reference"
});

UiPositioner.attributes.add("inertiaFactor", {
    type: "number",
    title: "Inertia Factor",
    default: 9
});

UiPositioner.prototype.referencePosition = new pc.Vec3();
UiPositioner.prototype.screenPosition = new pc.Vec3();
UiPositioner.prototype.targetScreenPosition = new pc.Vec3();

UiPositioner.prototype.initialize = function() {
    this.cameraEntity = this.app.root.findByName("Camera");
    this.device = this.app.graphicsDevice;
    
    //If a positionEntity was not supplied, this positioner relies on outsiders to update it's referenceposition
    if (this.positionEntity)
        this.referencePosition = this.positionEntity.getLocalPosition();
};

UiPositioner.prototype.postUpdate = function(dt) {
    this.updatePosition(dt * this.inertiaFactor);
};

UiPositioner.prototype.updatePosition = function(perFrameInertia) {
    this.cameraEntity.camera.worldToScreen(this.referencePosition, this.targetScreenPosition);
    //The ui is mapped onto the screen whether it's in front or behind us.
    //Hide it when its behind us to avoid seeing a mirrored version.
    if (this.targetScreenPosition.z < 0)
        this.entity.setLocalPosition(-10000, -10000, 0);
    else {
        var currentPosition = this.entity.getLocalPosition();
        var scale = this.entity.element.screen.screen.scale;
        var resolution = this.entity.element.screen.screen.resolution;
        var deviceRatio = window.devicePixelRatio;
        
        //Browsers on pc can mess up the position when their zoom is above 100 (mobile phones don't so we specifically don't apply it when it's a mobile device)
        // if (deviceRatio > 1 && !this.app.touch)
        //     deviceRatio = 1;
        
        this.entity.setLocalPosition(
            pc.math.lerp(
                currentPosition.x, 
                this.targetScreenPosition.x * deviceRatio / scale, 
                perFrameInertia), 
            pc.math.lerp(
                currentPosition.y, 
                (resolution.y - this.targetScreenPosition.y * deviceRatio) / scale, 
                perFrameInertia),
            0);
    }
};