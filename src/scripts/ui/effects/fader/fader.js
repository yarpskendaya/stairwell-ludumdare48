var Fader = pc.createScript('fader');

Fader.attributes.add('minTransparency', {
    type: 'number',
    title: 'Minimal Transparency', 
    description: 'The minimal transparency the fading element can have. If 0, fade out goes to 100% invisibility'
});

Fader.prototype.fadingIn = false;
Fader.prototype.fadeSpeed = 4;
Fader.prototype.yoyo = true;

Fader.prototype.initialize = function() {
    this.entity.element.enabled = true;
    this.entity.element.opacity = 1;
};

Fader.prototype.update = function(dt) {
    if (this.fadingIn && this.entity.element.enabled) {
        //If we are still busy fading in, continue to do so
        if (this.entity.element.opacity < 1) {
            this.entity.element.opacity = pc.math.lerp(this.entity.element.opacity, 1, this.fadeSpeed * dt);
            if (this.entity.element.opacity > 0.99) this.entity.element.opacity = 1; //Lerping needs a nudge to get to a round 1 value
        }

        //If we are done fading out (opacity == 1), the yoyo option should reverse the fade
        else if (this.yoyo) 
            this.fadingIn = false;
    }
    //If we are still busy fading out, continue to do so
    else if (this.entity.element.opacity > this.minTransparency) {
        this.entity.element.opacity = pc.math.lerp(this.entity.element.opacity, this.minTransparency, this.fadeSpeed * dt);

        //Lerping needs a nudge to get to a round 0 value
        if (this.entity.element.opacity < this.minTransparency + 0.01) 
            this.entity.element.opacity = this.minTransparency;
    }               
    //Disable the element if it's done fading out completely (only when it goes to 0)
    else if (this.entity.element.opacity <= 0 && this.entity.element.enabled)
        this.entity.element.enabled = false;
};

Fader.prototype.fadeIn = function(fadeSpeed, yoyo) {
    this.entity.element.enabled = true;
    this.fadingIn = true;
    this.fadeSpeed = fadeSpeed;
    this.yoyo = yoyo;
};

Fader.prototype.fadeOut = function(fadeSpeed) {
    this.entity.element.enabled = true;
    this.fadingIn = false;
    this.fadeSpeed = fadeSpeed;
    this.entity.element.opacity = 1;
};