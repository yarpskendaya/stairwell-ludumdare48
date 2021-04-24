var HoverRotater = pc.createScript('hoverRotater');

HoverRotater.attributes.add('subject', {
    type: 'entity', 
    title: 'Subject', 
    description: 'The entity that is faded by hovering, if nothing is selected the first child is faded'
});

HoverRotater.prototype.initialize = function() {
    //If nothing is assigned, it is assumed you want to fade the first child
    if (!this.subject)
        this.subject = this.entity.children[0];
    if (!this.subject)
        console.error(this.entity.name + 'could not find hover subject');

    // mouse events
    this.entity.element.on('mouseenter', this.onEnter, this);
    this.entity.element.on('mouseleave', this.onLeave, this);
};

HoverRotater.prototype.postInitialize = function() {
    //If we are on a touch device, we always see the icon
    if (this.app.touch)
        this.subject.script.rotater.rotating = true;
};

HoverRotater.prototype.onEnter = function() {
    this.subject.script.rotater.rotating = true;
};

HoverRotater.prototype.onLeave = function() {
    this.subject.script.rotater.rotating = false;
};