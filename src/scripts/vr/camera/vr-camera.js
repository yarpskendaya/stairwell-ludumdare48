var VrCamera = pc.createScript("vrCamera");

VrCamera.attributes.add("eyeHeight", {
    type: "number",
    default: 1.6,
    placeholder: "m",
    title: "Height from Floor"
});

VrCamera.attributes.add("movementSpeed", {
    type: "number",
    default: 1.5,
    placeholder: "m/s",
    title: "Movement Speed"
});

VrCamera.attributes.add("range", {
    type: "number",
    default: 100
});

// VrCamera.attributes.add("rotateSpeed", {
//     type: "number",
//     default: 45,
//     placeholder: "°",
//     title: "Rotation Speed"
// });

// VrCamera.attributes.add("rotateThreshold", {
//     type: "number",
//     default: 0.5,
//     min: 0,
//     max: 1,
//     title: "Rotation thumbstick threshold"
// });

// VrCamera.attributes.add("rotateResetThreshold", {
//     type: "number",
//     default: 0.25,
//     min: 0,
//     max: 1,
//     title: "Rotation thumbstick reset threshold"
// });

VrCamera.prototype._position = new pc.Vec3();
VrCamera.prototype._targetPosition = new pc.Vec3();
VrCamera.prototype.selectables = [];
VrCamera.prototype.cameraEntity = {};
VrCamera.prototype.ray = new pc.Ray();

VrCamera.prototype.initialize = function () {
    this.selectables = this.app.root.findByTag("vr-selectable");
    this.cameraEntity = this.entity.findByPath("Camera");
};

VrCamera.prototype.update = function (dt) {
    this.updatePosition(dt);
    this.aimSelection();
};

VrCamera.prototype.aimSelection = function () {
    this.ray.origin.copy(this.cameraEntity.getPosition());
    this.ray.direction.copy(this.cameraEntity.forward).scale(this.range);

    //Iterate through each interactible entities
    for (var e = 0; e < this.selectables.length; e++) {
        var entity = this.selectables[e];
        if (!entity.enabled)
            continue;

        var bb = entity.script.vrSelectable.getBoundingBox();
        if (bb && bb.intersectsRay(this.ray)) {
            entity.fire("selectorcamera:hover");
            return; //Only fire on one selectable
        }
    }
};

VrCamera.prototype.updatePosition = function (dt) {
    var inertia = Math.min(dt / (1 / this.movementSpeed), 1);

    this._position = new pc.Vec3(
        pc.math.lerp(this._position.x, this._targetPosition.x, inertia),
        pc.math.lerp(this._position.y, this._targetPosition.y, inertia),
        pc.math.lerp(this._position.z, this._targetPosition.z, inertia)
    );

    this.entity.setPosition(this._position);
};

VrCamera.prototype.setView = function (position) {
    var eyeHeightPosition = position.clone().add(new pc.Vec3(0, this.eyeHeight, 0));
    this._targetPosition = eyeHeightPosition;
};

VrCamera.prototype.removeInertia = function () {
    this._position = this._targetPosition;
};

// VrCamera.prototype.initialize = function() {
//     this.vec2A = new pc.Vec2();
//     this.vec2B = new pc.Vec2();
//     this.vec3A = new pc.Vec3();

//     this.lastRotate = 0;
//     this.lastRotateValue = 0;

//     this.app.on("controller:teleport", this.onTeleport, this);
//     this.app.on("controller:move", this.onMove, this);
//     this.app.on("controller:rotate", this.onRotate, this);
// };

// VrCamera.prototype.onTeleport = function(position) {
//     if (this.app.xr.type === pc.XRTYPE_AR)
//         return;

//     this.vec3A.copy(this.camera.getLocalPosition()).scale(-1);
//     this.entity.setPosition(position);
//     this.entity.translate(0, this.height, 0);
//     this.entity.translateLocal(this.vec3A);
// };

// VrCamera.prototype.onMove = function(x, y, dt) {
//     this.vec2A.set(x, y);

//     if (this.vec2A.length()) {
//         this.vec2A.normalize();

//         this.vec2B.x = this.camera.forward.x;
//         this.vec2B.y = this.camera.forward.z;
//         this.vec2B.normalize();

//         var rad = Math.atan2(this.vec2B.x, this.vec2B.y) - (Math.PI / 2);

//         var t =        this.vec2A.x * Math.sin(rad) - this.vec2A.y * Math.cos(rad);
//         this.vec2A.y = this.vec2A.y * Math.sin(rad) + this.vec2A.x * Math.cos(rad);
//         this.vec2A.x = t;

//         this.vec2A.scale(this.movementSpeed);
//         this.entity.translate(this.vec2A.x * dt, 0, this.vec2A.y * dt);
//     }
// };

// VrCamera.prototype.onRotate = function(yaw, dt) {
//     var now = Date.now();

//     if ((now - this.lastRotate) < 200)
//         return;

//     if (this.lastRotateValue !== 0) {
//         if (this.lastRotateValue > 0) {
//             if (yaw < this.rotateResetThreshold) {
//                 this.lastRotateValue = 0;
//             } else {
//                 return;
//             }
//         } else {
//             if (yaw > -this.rotateResetThreshold) {
//                 this.lastRotateValue = 0;
//             } else {
//                 return;
//             }
//         }
//     }

//     if (Math.abs(yaw) > this.rotateThreshold) {
//         this.lastRotateValue = Math.sign(yaw);

//         this.vec3A.copy(this.camera.getLocalPosition());
//         this.entity.translateLocal(this.vec3A);
//         this.entity.rotateLocal(0, Math.sign(yaw) * this.rotateSpeed, 0);
//         this.entity.translateLocal(this.vec3A.scale(-1));
//     }
// };