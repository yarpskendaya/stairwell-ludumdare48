var TimedFader = pc.createScript('timedFader');

TimedFader.prototype.fadeIn = function (fadeDuration) {
    this.entity.element.enabled = true;
    var data = { opacity: 0 };
    this.entity
        .tween(data)
        .to({ opacity: 1 }, 0.5, pc.Linear)
        .on('update', function() {
            this.entity.element.opacity = data.opacity;
        }, this)
        .yoyo(true)
        .repeat(2)
        .start();
};

TimedFader.prototype.fadeOut = function (fadeDuration) {
    var data = { opacity: 1 };
    this.entity
        .tween(data)
        .to({ opacity: 0 }, fadeDuration, pc.Linear)
        .on('update', function() {
            this.entity.element.opacity = data.opacity;
        }, this)
        .start();
    
    this.entity.delayedExecute(fadeDuration, function() {
        this.entity.element.enabled = false;
    }, this)
};

TimedFader.prototype.fadeInAndOut = function (fadeDuration) {
    this.entity.element.enabled = true;
    var data = { opacity: 0 };
    this.entity
        .tween(data)
        .to({ opacity: 1 }, fadeDuration / 2, pc.SineInOut)
        .on('update', function() {
            this.entity.element.opacity = data.opacity;
        }, this)
        .yoyo(true)
        .repeat(2)
        .start();

    this.entity.delayedExecute(fadeDuration, function() {
        this.entity.element.enabled = false;
    }, this)
};