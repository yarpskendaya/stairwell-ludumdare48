var Node = pc.createScript('node');

Node.prototype.initialize = function () {
    this.entity.on('click', this.onClick, this);
};

Node.prototype.onClick = function (event) {
    var position = this.entity.getPosition();
    this.app.fire('set-position', position);
};