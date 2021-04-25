var SoulPusher = pc.createScript('soulPusher');

SoulPusher.attributes.add('tile', {
    type: 'vec2',
    description: 'The tile this pusher affects'
});

SoulPusher.prototype.direction = new pc.Vec2();
SoulPusher.prototype.affectedTile = new pc.Vec2();

SoulPusher.prototype.initialize = function () {
    this.entity.on('click', this.onClick, this);
    this.direction = this.getDirection();
    console.debug('Direction is ' + this.direction);
    this.affectedTile = this.getAffectedTile();
    console.debug('Affected tile is' + this.affectedTile);
};

SoulPusher.prototype.getDirection = function () {
    var rotation = this.entity.getEulerAngles().y % 360;
    if (this.isAlmostEqual(rotation, 0, 360))
        return new pc.Vec2(1, 0);
    if (this.isAlmostEqual(rotation, 90, -270))
        return new pc.Vec2(0, 1);
    if (this.isAlmostEqual(rotation, 180, -180))
        return new pc.Vec2(-1, 0);
    if (this.isAlmostEqual(rotation, 270, -90))
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
    if (this.isAlmostEqual(z, -5))
        return 0;
    if (this.isAlmostEqual(z, 0))
        return 1;
    if (this.isAlmostEqual(z, 5))
        return 2;
};

SoulPusher.prototype.getAffectedTileY = function (x) {
    if (this.isAlmostEqual(x, -5))
        return 0;
    if (this.isAlmostEqual(x, 0))
        return 1;
    if (this.isAlmostEqual(x, 5))
        return 2;
};

SoulPusher.prototype.onClick = function () {
    var y = this.entity.getPosition().y;
    console.debug('Pushing at height ' + y);
    this.app.fire('push-souls', this.tile, y, this.direction);
};

SoulPusher.prototype.isAlmostEqual = function(x, a, b) {
    var e = 1;
    return Math.abs(x - a) < e || Math.abs(x - b) < e;
};