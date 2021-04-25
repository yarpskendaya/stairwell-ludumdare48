var SoulPusher = pc.createScript('soulPusher');

SoulPusher.prototype.direction = new pc.Vec2();
SoulPusher.prototype.affectedTile = new pc.Vec2();

SoulPusher.prototype.initialize = function () {
    this.entity.on('click', this.onClick, this);
    this.direction = this.getDirection();
    this.affectedTile = this.getAffectedTile();
};

SoulPusher.prototype.getDirection = function () {
    var rotation = this.entity.getEulerAngles();
    if (this.isNotRotated(rotation))
        return new pc.Vec2(1, 0);
    if (this.isQuarterRotated(rotation))
        return new pc.Vec2(0, 1);
    if (this.isHalfRotated(rotation))
        return new pc.Vec2(-1, 0);
    if (this.isThreeQuartersRotated(rotation))
        return new pc.Vec2(0, -1);

    console.error('Could not get direction from soulpusher orientation');
};

SoulPusher.prototype.getAffectedTile = function () {
    var pos = this.entity.getPosition();
    var x = this.getAffectedTileX(pos.z);
    var y = this.getAffectedTileY(pos.x);

    return new pc.Vec2(x, y);
};

SoulPusher.prototype.getAffectedTileX = function (z) {
    if (this.isAlmostEqual(z, -2, -5))
        return 0;
    if (this.isAlmostEqual(z, 0))
        return 1;
    if (this.isAlmostEqual(z, 2, 5))
        return 2;
};

SoulPusher.prototype.getAffectedTileY = function (x) {
    if (this.isAlmostEqual(x, -2, -5))
        return 0;
    if (this.isAlmostEqual(x, 0))
        return 1;
    if (this.isAlmostEqual(x, 2, 5))
        return 2;
};

SoulPusher.prototype.onClick = function () {
    var y = this.entity.getPosition().y;
    this.app.fire('push-souls', this.affectedTile, y, this.direction);
};

SoulPusher.prototype.isNotRotated = function (rotation) {
    var y = rotation.y % 360;
    return this.isAlmostEqual(y, 0) &&
        this.isAlmostEqual(rotation.x, 0) &&
        this.isAlmostEqual(rotation.z, 0)
};

SoulPusher.prototype.isQuarterRotated = function (rotation) {
    var y = rotation.y % 360;


    return this.isAlmostEqual(y, 90, -270);
};

SoulPusher.prototype.isHalfRotated = function (rotation) {
    var y = rotation.y % 360;
    if (this.isAlmostEqual(y, 0))
        return this.isAlmostEqual(rotation.x, 180) &&
            this.isAlmostEqual(rotation.z, 180);

    return this.isAlmostEqual(y, 180, -180);
};

SoulPusher.prototype.isThreeQuartersRotated = function (rotation) {
    var y = rotation.y % 360;
    // if (this.isAlmostEqual(y, 0))
    //     return this.isAlmostEqual(rotation.x, 180) &&
    //             this.isAlmostEqual(rotation.z, 180);

    return this.isAlmostEqual(y, 270, -90);
};

SoulPusher.prototype.isAlmostEqual = function (x, a, b) {
    var e = 1;
    return Math.abs(x - a) < e || Math.abs(x - b) < e;
};