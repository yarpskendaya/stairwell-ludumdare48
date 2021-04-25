var KillBox = pc.createScript('killBox');

KillBox.prototype.initialize = function () {
    this.entity.collision.on('triggerenter', this.onTriggerEnter, this);
};

KillBox.prototype.onTriggerEnter = function (entity) {
    console.debug('Weve got a hit!');
    var soul = entity.script.soul;
    if (soul)
        this.app.fire('lose');
};