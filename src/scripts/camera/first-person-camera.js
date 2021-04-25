var FirstPersonCamera = pc.createScript("firstPersonCamera");

FirstPersonCamera.attributes.add('moveSpeed', {
    type: 'number',
    default: 2,
    description: 'Determines how fast the camera moves to its target position'
});

FirstPersonCamera.attributes.add('rotationSensitivity', {
    type: 'number',
    default: 0.2,
    description: 'Determines how sensitive input movement is towards camera rotation'
});

FirstPersonCamera.attributes.add('rotationSpeed', {
    type: 'number',
    default: 3,
    description: 'Determines how fast the camera rotates'
});

FirstPersonCamera.attributes.add('eyeHeight', {
    type: 'number',
    default: 1.75,
    description: 'The eyeheight offset that is applied to any given position'
});

FirstPersonCamera.attributes.add('pitchAngleMax', {
    type: 'number',
    default: 50,
    description: 'How far up the camera can look',
});

FirstPersonCamera.attributes.add('pitchAngleMin', {
    type: 'number',
    default: -30,
    description: 'How far down the camera can look',
});

FirstPersonCamera.attributes.add('yawAngleMax', {
    type: 'number',
    default: 60,
    description: 'How far to the left the camera can look',
});

FirstPersonCamera.attributes.add('yawAngleMin', {
    type: 'number',
    default: -60,
    description: 'How far to the right the camera can look',
});

FirstPersonCamera.attributes.add('is360', {
    type: 'boolean',
    default: true,
    description: 'Ignores the yaw angle constraints when enabled (can make full 360s)',
});

// Property to get and set the target pitch of the camera
Object.defineProperty(FirstPersonCamera.prototype, "pitch", {
    get: function () {
        return this._targetPitch;
    },

    set: function (value) {
        this._targetPitch = this._clampPitchAngle(value);
    }
});

// Property to get and set the target yaw of the camera
Object.defineProperty(FirstPersonCamera.prototype, "yaw", {
    get: function () {
        return this._targetYaw;
    },

    set: function (value) {
        this._targetYaw = (this.is360) ? value : this._clampYawAngle(value);
    }
});

FirstPersonCamera.prototype.initialize = function () {
    this.initializeCamera();
    this.initializeVars();
    this.subscribeToEvents();
};

FirstPersonCamera.prototype.initializeCamera = function() {
    this.cameraEntity = this.entity.findByPath("Camera");
    this.cameraEntity.setLocalPosition(new pc.Vec3(0, this.eyeHeight,0));
};

FirstPersonCamera.prototype.initializeVars = function () {
    this._pitch = 0;
    this._targetPitch = 0;
    this._yaw = 0;
    this._targetYaw = 0;

    this._targetPosition = this.entity.getPosition();
    this._position = this._targetPosition;
};

FirstPersonCamera.prototype.subscribeToEvents = function () {
    this.app.on("input-move", function (move) {
        //TODO: First person controls are inverted now. Maybe this is a setting later on
        this.yaw -= move.x * this.rotationSensitivity;
        this.pitch -= move.y * this.rotationSensitivity;
    }, this);

    this.app.on("set-position", function (position) {
        this._targetPosition = position;
    }, this);
};

FirstPersonCamera.prototype.update = function (dt) {
    this.updateRotation(dt);
    this.updatePosition(dt);
};

FirstPersonCamera.prototype.updateRotation = function (dt) {
    var inertia = Math.min(dt / (1 / this.rotationSpeed), 1);

    this._pitch = pc.math.lerp(this._pitch, this._targetPitch, inertia);
    this._yaw = pc.math.lerp(this._yaw, this._targetYaw, inertia);

    this.cameraEntity.setLocalEulerAngles(this._pitch, this._yaw, 0);
};

FirstPersonCamera.prototype.updatePosition = function (dt) {
    var inertia = Math.min(dt / (1 / this.moveSpeed), 1);

    this._position = new pc.Vec3(
        pc.math.lerp(this._position.x, this._targetPosition.x, inertia),
        pc.math.lerp(this._position.y, this._targetPosition.y, inertia),
        pc.math.lerp(this._position.z, this._targetPosition.z, inertia)
    );

    this.entity.setPosition(this._position);
};

FirstPersonCamera.prototype.setView = function (cameraSettings, targetPosition) {
    if (!targetPosition) {
        console.error('Targetposition not given');
        return;
    }

    this.cameraEntity.setLocalPosition(new pc.Vec3());

    this.is360 = cameraSettings.is360;
    if (!this.is360) {
        this.yawAngleMin = cameraSettings.yawAngleMin;
        this.yawAngleMax = cameraSettings.yawAngleMax;
    }

    if (cameraSettings.startYaw)
        this._targetYaw = cameraSettings.startYaw;
    if (cameraSettings.startPitch)
        this._targetPitch = cameraSettings.startPitch;

    this.pitchAngleMin = cameraSettings.pitchAngleMin ? cameraSettings.pitchAngleMin : -30;
    this.pitchAngleMax = cameraSettings.pitchAngleMax ? cameraSettings.pitchAngleMax : 30;
    
    this.cameraEntity.camera.fov = cameraSettings.fov ? cameraSettings.fov : 60;

    this._targetPosition = targetPosition;
};

//Instantly cut to where the camera was heading to
FirstPersonCamera.prototype.removeInertia = function () {
    this._pitch = this._targetPitch;
    this._yaw = this._targetYaw;
    this._position = this._targetPosition;
};

FirstPersonCamera.quatWithoutYaw = new pc.Quat();
FirstPersonCamera.yawOffset = new pc.Quat();

FirstPersonCamera.prototype._calcPitch = function (quat, yaw) {
    var quatWithoutYaw = FirstPersonCamera.quatWithoutYaw;
    var yawOffset = FirstPersonCamera.yawOffset;

    yawOffset.setFromEulerAngles(0, -yaw, 0);
    quatWithoutYaw.mul2(yawOffset, quat);

    var transformedForward = new pc.Vec3();

    quatWithoutYaw.transformVector(pc.Vec3.FORWARD, transformedForward);

    return Math.atan2(transformedForward.y, -transformedForward.z) * pc.math.RAD_TO_DEG;
};

FirstPersonCamera.prototype._calcYaw = function (quat) {
    var transformedForward = new pc.Vec3();
    quat.transformVector(pc.Vec3.FORWARD, transformedForward);

    return Math.atan2(-transformedForward.x, -transformedForward.z) * pc.math.RAD_TO_DEG;
};

FirstPersonCamera.prototype._clampPitchAngle = function (pitch) {
    return pc.math.clamp(pitch, this.pitchAngleMin, this.pitchAngleMax);
};

FirstPersonCamera.prototype._clampYawAngle = function (yaw) {
    return pc.math.clamp(yaw, this.yawAngleMin, this.yawAngleMax);
};