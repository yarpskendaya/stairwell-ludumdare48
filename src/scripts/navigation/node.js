var Node = pc.createScript('node');

Node.prototype.minVertDistance = 6;

Node.prototype.initialize = function () {
    this.entity.on('click', this.onClick, this);
    this.app.on('set-position', this.onPositionChanged, this);
};

Node.prototype.onClick = function (event) {
    var position = this.entity.getPosition();
    this.app.fire('set-position', position);
};

Node.prototype.onPositionChanged = function (position) {
    var y = this.entity.getPosition().y;
    var distance = Math.abs(y - position.y);
    var isInRange = distance < this.minVertDistance;
    var areNotEqual = distance > 0.1;
    this.toggleButtons(isInRange && areNotEqual);
};

Node.prototype.toggleButtons = function (enabled) {
    for (var c in this.entity.children)
        this.entity.children[c].enabled = enabled;
};