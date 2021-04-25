var FadeScreen = pc.createScript('fadeScreen');

FadeScreen.attributes.add('duration', {
    type: 'number',
    default: 2,
    description: 'The time it takes for the screen to fade'
});

FadeScreen.prototype.timedFader = {};

FadeScreen.prototype.initialize = function () {
    this.app.on('fade', this.onFade, this);
    this.timedFader = this.entity.script.timedFader;
};

FadeScreen.prototype.onFade = function(fade) {
    if (fade) {
        console.debug('Fading in');
        this.timedFader.fadeIn(this.duration);
    }
    else {
        console.debug('Fading out');
        this.timedFader.fadeOut(this.duration);
    }
};