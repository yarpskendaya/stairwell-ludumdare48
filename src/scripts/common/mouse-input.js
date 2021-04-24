var MouseInput = pc.createScript('mouseInput');

MouseInput.prototype.lookButtonDown = false;
MouseInput.prototype.moveSensitivity = 1;
MouseInput.prototype.zoomSensitivity = 1;

MouseInput.prototype.initialize = function () {
    this.subscribeToEvents();

    //Clean up when this entity gets destroyed
    this.on('destroy', function () {
        this.unsubscribeToEvents();
    });

    //Disabling the context menu stops the browser displaying a menu when you right-click the page
    this.app.mouse.disableContextMenu();
};

MouseInput.prototype.subscribeToEvents = function () {
    var self = this;

    //We need to specifically attach to the window to know when the mouse leaves PlayCanvas
    var onMouseOut = function (event) {
        self.onMouseOut(event);
    };
    window.addEventListener('mouseout', onMouseOut, false);

    //If we want to be able to disable scrolling in the parent on all browsers (looking at you Chrome)
    //We have to use addEventListener so we can specifically state we are not a passive listener.
    //Passive listeners promise to not call preventDefault, something we might maybe always do
    var onMouseWheelForChrome = function (event) {
        self.onMouseWheelForChrome(event);
    };
    window.addEventListener('mousewheel', onMouseWheelForChrome, { passive: false });

    this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
    this.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this);
    this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
    this.app.mouse.on(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this);
};

MouseInput.prototype.unsubscribeToEvents = function () {
    this.app.mouse.off(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
    this.app.mouse.off(pc.EVENT_MOUSEUP, this.onMouseUp, this);
    this.app.mouse.off(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
    this.app.mouse.off(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this);

    window.removeEventListener('mouseout', onMouseOut, false);
};

MouseInput.prototype.onMouseDown = function (event) {
    if (event.button == pc.MOUSEBUTTON_LEFT)
        this.lookButtonDown = true;
};

MouseInput.prototype.onMouseUp = function (event) {
    if (event.button == pc.MOUSEBUTTON_LEFT)
        this.lookButtonDown = false;
};

MouseInput.prototype.onMouseMove = function (event) {
    if (this.lookButtonDown) {
        var move = {};
        move.x = -event.dx * this.moveSensitivity;
        move.y = -event.dy * this.moveSensitivity;

        this.app.fire("input-move", move);
    }
};

MouseInput.prototype.onMouseWheel = function (event) {
    if (event.wheel) {
        this.app.fire("input-zoom", -event.wheel * this.zoomSensitivity);
        //Prevent the browser from scrolling when using the scroll wheel
        this.preventScrollDefault(event);
    }
};

MouseInput.prototype.onMouseWheelForChrome = function (event) {
    if (event.wheelDeltaY)
        this.app.fire("input-zoom", -event.wheelDeltaY * 0.001 * this.zoomSensitivity);
    else
        console.error('Could not read scroll value from scroll event');
    //Prevent the browser from scrolling when using the scroll wheel
    this.preventScrollDefault(event);
};

MouseInput.prototype.preventScrollDefault = function (event) {
    if (typeof event.preventDefault === 'function')
        event.preventDefault();
    else if (event.event && typeof event.event.preventDefault === 'function')
        event.event.preventDefault();
};

MouseInput.prototype.onMouseOut = function (event) {
    this.lookButtonDown = false;
};