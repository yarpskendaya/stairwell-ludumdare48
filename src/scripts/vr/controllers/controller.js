var Controller = pc.createScript('controller');

Controller.prototype.initialize = function() {
    this.vecA = new pc.Vec3();
    this.vecB = new pc.Vec3();
    this.matA = new pc.Mat4();
    this.quat = new pc.Quat();
    this.color = new pc.Color(1, 1, 1);
    
    this.modelEntity = this.entity.findByName('model');
    this.hoverEntity = null;
    
    this.targetPointerSize = 2;
    this.targetTeleportable = false;
    this.pointer = this.entity.findByName('pointer');
    this.pointer.element.material.depthTest = false;
    this.hoverPoint = new pc.Vec3();
    this.pointerDistance = 3;
};

Controller.prototype.setInputSource = function(inputSource) {
    var self = this;
    
    this.inputSource = inputSource;
    this.inputSource.once('remove', this.onRemove, this);
    
    this.on('hover', this.onHover, this);
    this.on('blur', this.onBlur, this);
    
    this.inputSource.on('select', this.onSelect, this);
};

Controller.prototype.onRemove = function() {
    this.entity.destroy();
};

Controller.prototype.onSelect = function() {
    this.app.fire('object:pick', this);
    
    if (this.hoverEntity) {
        // teleport
        if (this.targetTeleportable) {
            this.app.fire('controller:teleport', this.hoverPoint);
            
        // paint interactible model
        } else if (this.hoverEntity.tags.has('interactive')) {
            var mesh = this.hoverEntity.model.meshInstances[0];
            if (! mesh.pickedColor) mesh.pickedColor = new pc.Color();

            mesh.pickedColor.set(Math.random(), Math.random(), Math.random());
            mesh.setParameter('material_diffuse', mesh.pickedColor.data3);
        }
    }
};

Controller.prototype.onHover = function(entity, point) {
    this.hoverEntity = entity;
    this.hoverPoint.copy(point);
    this.targetPointerSize = 16;
    this.targetTeleportable = this.hoverEntity.tags.has('teleportable');
};

Controller.prototype.onBlur = function() {
    this.hoverEntity = null;
    this.targetPointerSize = 4;
    this.targetTeleportable = false;
};

Controller.prototype.update = function(dt) {
    // pick entities
    this.app.fire('object:pick', this);

    // is can be gripped, enable model and transform it accordingly
    if (this.inputSource.grip) {
        this.modelEntity.enabled = true;
        this.entity.setPosition(this.inputSource.getPosition());
        this.entity.setRotation(this.inputSource.getRotation());
        
        // render ray line
        this.vecA.copy(this.inputSource.getOrigin());
        this.vecB.copy(this.inputSource.getDirection());
        this.vecB.scale(1000).add(this.vecA);
        if (this.inputSource.selecting) {
            this.color.set(0, 1, 0);
        } else {
            this.color.set(1, 1, 1);
        }
        this.app.renderLine(this.vecA, this.vecB, this.color);
    }
    
    // hovered entity pointer distance
    if (this.hoverEntity) {
        var dist = this.vecA.copy(this.hoverPoint).sub(this.inputSource.getOrigin()).length();
        this.pointerDistance += (dist - this.pointerDistance) * 0.3;
    }
    
    // pointer position
    this.vecA.copy(this.inputSource.getDirection()).scale(this.pointerDistance).add(this.inputSource.getOrigin());
    this.pointer.setPosition(this.vecA);
    
    // pointer size
    var pointerSize = this.targetPointerSize * (this.targetTeleportable ? 8 : 1);
    if (this.pointer.element.width !== pointerSize) {
        this.pointer.element.width += (pointerSize - this.pointer.element.width) * 0.3;
        
        if (Math.abs(this.pointer.element.width - pointerSize) <= 1)
            this.pointer.element.width = pointerSize;
        
        this.pointer.element.height = this.pointer.element.width;
    }
    
    // rotate pointer
    if (this.targetTeleportable) {
        // can teleport on the floor
        this.pointer.setEulerAngles(-90, 0, 0);
    } else if (this.app.xr.camera) {
        // towards camera
        this.pointer.lookAt(this.app.xr.camera.getPosition(), pc.Vec3.DOWN);
        this.pointer.rotateLocal(0, 180, 0);
    }
    
    // gamepad input
    var gamepad = this.inputSource.gamepad;
    if (gamepad) {
        // left controller thumbstick for move
        if (this.inputSource.handedness === pc.XRHAND_LEFT && (gamepad.axes[3] || gamepad.axes[2])) {
            this.app.fire('controller:move', gamepad.axes[2], gamepad.axes[3], dt);
            
        // right controller thumbstick for turn
        } else if (this.inputSource.handedness === pc.XRHAND_RIGHT && gamepad.axes[2]) {
            this.app.fire('controller:rotate', -gamepad.axes[2], dt);
        }
    }
};
