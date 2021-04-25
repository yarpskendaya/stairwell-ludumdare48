var Soul = pc.createScript('soul');

Soul.attributes.add('ascensionSpeed', {
    type: 'number',
    default: 2,
    description: 'How fast the soul ascends when no weights are added'
});

Soul.attributes.add('weightSpeed', {
    type: 'number',
    default: 0.2,
    description: 'How fast a single weight makes the soul descend'
});

Soul.attributes.add('weights', {
    type: 'number',
    default: 11,
    description: 'The amount of weights this soul currently has'
});

Soul.prototype.currentSpeed = 0;
Soul.prototype.inertia = 0.01;
Soul.prototype.targetPosition = new pc.Vec3();

Soul.prototype.initialize = function () {
    this.targetPosition = this.entity.getPosition();
    this.updateCurrentSpeed();
};

Soul.prototype.update = function (dt) {
    this.updatePosition(dt);
};

Soul.prototype.setTargetPosition = function (targetPosition) {
    this.targetPosition = targetPosition;
};

Soul.prototype.updatePosition = function (dt) {
    var pos = this.entity.getPosition();
    
    var x = pc.math.lerp(pos.x, this.targetPosition.x, this.inertia);
    var y = pos.y + this.currentSpeed * dt;
    var z = pc.math.lerp(pos.z, this.targetPosition.z, this.inertia);
    var newPos = new pc.Vec3(x, y, z);

    this.entity.setPosition(newPos);
};

Soul.prototype.updateCurrentSpeed = function () {
    var speed = this.ascensionSpeed;
    speed -= this.weights * this.weightSpeed;

    this.currentSpeed = speed;
};