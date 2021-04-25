// A generic UI button that takes care of handling 2d input and converting it to an abstract click call
var UiButton = pc.createScript('uiButton');

UiButton.attributes.add('buttonProxy', {
    type: 'entity',
    title: 'Button Proxy',
    description: 'Optional attribute to have this button act as another button (useful for allowing a button to take you to another node)'
});

UiButton.prototype.initialize = function () {
    this.entity.element.on('click', this.onClick, this);
};

UiButton.prototype.onClick = function (event) {
    if (this.buttonProxy) {
        this.buttonProxy.fire('click', event);
        return;
    }
    
    this.entity.fire('click', event);
};

UiButton.prototype.swap = function (old) {
    this.buttonProxy = old.buttonProxy;
};