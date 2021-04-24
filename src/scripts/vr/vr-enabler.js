var VrEnabler = pc.createScript("vrEnabler");

VrEnabler.attributes.add("vrButton", {
    type: "entity",
    title: "VR Button",
    description: "The buttons that allows users to start a VR session"
});

VrEnabler.attributes.add("cameraEntity", {
    type: "entity",
    title: "Camera"
});

VrEnabler.prototype.vrReady = false;

VrEnabler.prototype.initialize = function () {
    this.vrButton.enabled = false;
    this.subscribeToEvents();
    this.checkIfVrReady();
};

VrEnabler.prototype.subscribeToEvents = function () {
    this.app.xr.on("available:" + pc.XRTYPE_VR, this.checkIfVrReady, this);
    this.app.xr.on("start", this.checkIfVrReady, this);
    this.app.xr.on("end", this.checkIfVrReady, this);

    this.vrButton.element.on("click", this.sessionStart, this);

    this.app.keyboard.on("keydown", function (evt) {
        if (evt.key === pc.KEY_ESCAPE && this.app.xr.active)
            this.app.xr.end();
    }, this);

    //Only allow enabling of VR when we are in a bnr
    this.app.on("bnr", function (bnr) {
        if (bnr && bnr != "-1")
            this.vrButton.enabled = this.vrReady;
        else
            this.vrButton.enabled = false;
    }, this);
};

VrEnabler.prototype.checkIfVrReady = function () {
    if (!this.app.xr.supported || this.app.xr.active) {
        this.vrReady = false;
        return;
    }

    if (pc.platform.mobile) {
        this.vrReady = false;
        return;
    }

    // Check if session type is available
    var available = this.app.xr && !this.app.xr.active && this.app.xr.isAvailable(pc.XRTYPE_VR);
    this.vrReady = available;
};

VrEnabler.prototype.sessionStart = function () {
    if (!this.app.xr.supported) {
        // WebXR is not supported
        return;
    }

    if (this.app.xr.active) {
        console.error("XR session is already active");
        // Session already active
        return;
    }

    if (!this.app.xr.isAvailable(pc.XRTYPE_VR)) {
        console.error("XR session is not available");
        // This session type is not available
        return;
    }

    // start XR session of selected type
    this.cameraEntity.camera.startXr(pc.XRTYPE_VR, pc.XRSPACE_LOCAL);

    this.app.fire("view:enterVR");
};