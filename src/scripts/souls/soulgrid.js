var SoulGrid = pc.createScript('soulGrid');

SoulGrid.attributes.add('verticalRange', {
    type: 'number',
    default: 1,
    description: 'The maximum height difference at which a soul is still affected by pushes'
});

SoulGrid.attributes.add('horizontalRange', {
    type: 'number',
    default: 0.5,
    description: 'The maximum horizontal distance at which a moving soul is still affected by pushes'
});

SoulGrid.prototype.gridPositions = [];
SoulGrid.prototype.souls = [];

SoulGrid.prototype.initialize = function () {
    this.souls = this.entity.children;
    this.initializeGridPositions();

    this.onSoulPush({ x: 0, z: 1 }, 14.5, { x: 0, z: 1 });
};

SoulGrid.prototype.subscribeToEvents = function () {
    this.app.on('push-souls', this.onSoulPush, this);
};

SoulGrid.prototype.initializeGridPositions = function () {
    var axisValues = [-2, 0, 2]

    for (let z = 0; z < 3; z++) {
        var row = []
        for (let x = 0; x < 3; x++) {
            var position = new pc.Vec3(axisValues[x], 0, axisValues[z]);
            row[x] = position;
        }

        this.gridPositions[z] = row;
    }
};

SoulGrid.prototype.onSoulPush = function (tile, height, direction) {
    var soul = this.getSoulOnTile(tile, height);
    if (!soul) return;

    this.pushSoul(soul, tile, direction);
};

SoulGrid.prototype.pushSoul = function (soul, tile, direction) {
    var newTileX = tile.x + direction.x;
    var newTileZ = tile.z + direction.z;
    var newTilePos = this.gridPositions[newTileX][newTileZ];
    var newPos = new pc.Vec3(newTilePos.x, soul.getPosition().y, newTilePos.z);
    
    soul.setPosition(newPos);
};

SoulGrid.prototype.getSoulOnTile = function (tile, height) {
    var tilePos = this.gridPositions[tile.x][tile.z];
    for (var s in this.souls) {
        var soulPos = this.souls[s].getPosition();
        
        var isAtThisHeight = this.isWithinRange(height, soulPos.y, this.verticalRange);
        var isCloseEnoughOnX = this.isWithinRange(tilePos.x, soulPos.x, this.horizontalRange);
        var isCloseEnoughOnZ = this.isWithinRange(tilePos.z, soulPos.z, this.horizontalRange);
        var isOnThisTile = isCloseEnoughOnX && isCloseEnoughOnZ;

        if (isAtThisHeight && isOnThisTile)
            return this.souls[s];
    }
};

SoulGrid.prototype.isWithinRange = function (a, b, maxDistance) {
    var distance = Math.abs(a - b);
    return distance < maxDistance;
};