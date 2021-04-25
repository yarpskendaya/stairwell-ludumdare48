var SoulPusher = pc.createScript('soulPusher');

SoulPusher.attributes.add('tile', {
    type: 'vec2',
    description: 'The tile this pusher affects'
});

SoulPusher.attributes.add('direction', {
    type: 'vec2',
    description: 'The direction a soul is pushed in'
});

// initialize code called once per entity
SoulPusher.prototype.initialize = function() {
};

// update code called every frame
SoulPusher.prototype.update = function(dt) {
};

SoulPusher.prototype.postInitialize = function () {
    this.app.fire('push-souls', this.tile, 14.5, this.direction);
};

// swap method called for script hot-reloading
// inherit your script state here
// SoulPusher.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/