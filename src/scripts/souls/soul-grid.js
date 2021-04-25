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
    this.subscribeToEvents();
};

SoulGrid.prototype.subscribeToEvents = function () {
    this.app.on('push-souls', this.onSoulPush, this);
};

SoulGrid.prototype.initializeGridPositions = function () {
    var axisValues = [-2, 0, 2];

    for (let y = 0; y < 3; y++) {
        var row = [];
        for (let x = 0; x < 3; x++) {
            var position = new pc.Vec3(axisValues[x], 0, axisValues[y]);
            row[x] = position;
        }

        this.gridPositions[y] = row;
    }
};

SoulGrid.prototype.onSoulPush = function (tile, height, direction) {
    if (!this.tileIsWithinBounds(tile))
        console.error('Tile was not within bounds ' + tile);
        
    var soul = this.getSoulOnTile(tile, height);
    if (!soul) return;

    this.pushSoul(soul, tile, height, direction);
};

SoulGrid.prototype.pushSoul = function (soul, tile, height, direction) {
    var newTile = this.getPushedToTile(tile, height, direction);
    if (!newTile) {
        console.debug('Did not find a tile to move to');
        return;
    }
    
    var newTilePos = this.gridPositions[newTile.x][newTile.y];
    var newPos = new pc.Vec3(newTilePos.x, soul.getPosition().y, newTilePos.z);
  
    this.setSoulPosition(soul, newPos);
};

SoulGrid.prototype.getPushedToTile = function (tile, height, direction) {
    var eligibleTile;
    for (var i = 1; i <= 3; i++) {
        var newX = tile.x + direction.x * i;
        var newY = tile.y + direction.y * i;
        var candidateTile = new pc.Vec2(newX, newY);

        if (!this.tileIsWithinBounds(candidateTile))
            return eligibleTile;

        if (this.getSoulOnTile(candidateTile, height)) {
            return eligibleTile;
        }
        
        eligibleTile = candidateTile;
    }
};

SoulGrid.prototype.getSoulOnTile = function (tile, height) {
    for (var s in this.souls) {
        var soulPos = this.souls[s].getPosition();
        
        var isAtThisHeight = this.isWithinRange(height, soulPos.y, this.verticalRange);
        var isOnThisTile = this.isAtTile(tile, soulPos);

        if (isAtThisHeight && isOnThisTile)
            return this.souls[s];
    }
};

SoulGrid.prototype.setSoulPosition = function (soul, position) {
    soul.script.soul.setTargetPosition(position);
};

SoulGrid.prototype.isAtTile = function (tile, position) {
    var tilePos = this.gridPositions[tile.x][tile.y];
    var isCloseEnoughOnX = this.isWithinRange(tilePos.x, position.x, this.horizontalRange);
    var isCloseEnoughOnZ = this.isWithinRange(tilePos.z, position.z, this.horizontalRange);

    return isCloseEnoughOnX && isCloseEnoughOnZ;
};

SoulGrid.prototype.isWithinRange = function (a, b, maxDistance) {
    var distance = Math.abs(a - b);
    return distance < maxDistance;
};

SoulGrid.prototype.tileIsWithinBounds = function (tile) {
    return  tile.x >= 0 && tile.x < 3 &&
            tile.y >= 0 && tile.y < 3;
};