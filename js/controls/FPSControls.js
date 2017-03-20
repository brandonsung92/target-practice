const THREE = require('three');
const EventHandler = require('../tools/EventHandler.js');

const ThreeFPSControls = function(camera, collisionDetection, sensitivity, movespeed, rateOfFire, afterFire) {

    // Used by ObjectManager
    this.adjustTimers = function(time) {
        this.prevUpdateTime += time;
        this.prevFireTime += time;
    };

    // Used by ObjectManager
    this.toggle = function(running) {
        this.running = running;
    };

    // Used by ObjectManager
    this.dispose = function() {
        this.eventHandler.removeListeners();
    };

    // Used by ObjectManager
    this.update = function() {
        this.updatePosition();
        this.updateFireState();
    };

    this.setupListeners = function() {
        if (!this.eventHandler) this.eventHandler = new EventHandler();
        this.eventHandler.setListeners([
            {
                type: 'mousemove',
                element: document,
                listener: function(event) {
                    if (!this.running) return;
                    let movementX = event.movementX || 0;
                    let movementY = event.movementY || 0;
                    
                    let pitchRotate = movementY * this.sensMultiplier;
                    let yawRotate = movementX * this.sensMultiplier;

                    this.pitchObject.rotation.x -= pitchRotate;
                    this.yawObject.rotation.y -= yawRotate;

                    this.pitchObject.rotation.x = 
                        Math.max(-Math.PI / 2, 
                            Math.min(Math.PI / 2, this.pitchObject.rotation.x));
                }.bind(this)
            },
            {
                type: 'keydown',
                element: document,
                listener: function(event) {
                    switch (event.keyCode) {
                        case 87: // w
                            this.moveState.forward = true;
                            break;
                        case 65: // a
                            this.moveState.left = true;
                            break;
                        case 83: // s
                            this.moveState.back = true;
                            break;
                        case 68: // d
                            this.moveState.right = true;
                    }
                }.bind(this)
            },
            {
                type: 'keyup',
                element: document,
                listener: function(event) {
                    switch (event.keyCode) {
                        case 87: // w
                            this.moveState.forward = false;
                            break;
                        case 65: // a
                            this.moveState.left = false;
                            break;
                        case 83: // s
                            this.moveState.back = false;
                            break;
                        case 68: // d
                            this.moveState.right = false;
                    }
                }.bind(this)
            },
            {
                type: 'mousedown',
                element: document,
                listener: function() {
                    if (this.running) this.firing = true;
                }.bind(this)
            },
            {
                type: 'mouseup',
                element: document,
                listener: function() {
                    this.firing = false;
                }.bind(this)
            }
        ]);
        this.eventHandler.setupListeners();
    };

    this.addTo = function(scene) {
        scene.add(this.yawObject);
    };

    this.getMoveState = function() {
        return this.moveState;
    };

    this.getYawRotation = function() {
        return this.yawObject.rotation;
    };

    this.getPitchRotation = function() {
        return this.pitchObject.rotation;
    };

    this.getDirection = function() {
        let pitchRotation = this.getPitchRotation();
        let yawRotation = this.getYawRotation();

        let direction = new THREE.Vector3(0, 0, -1);
        direction.applyEuler(pitchRotation).applyEuler(yawRotation);

        return direction;
    };

    this.getPosition = function() {
        return this.yawObject.position;
    };

    this.setPosition = function(x, y ,z) {
        this.yawObject.position.set(x, y, z);
    };

    this.getRaycaster = function() {
        let caster = new THREE.Raycaster();
        caster.set(this.getPosition(), this.getDirection());
        return caster;
    };

    // this needs to be called in game's animate method
    this.updatePosition = function(collisionDetection) {
        let time = performance.now();
        let timePassed = (time - this.prevUpdateTime) / 1000;

        let direction = new THREE.Vector3(0, 0, 0);

        let adjustedMoveState = this.collisionDetection.getAdjustedMoveState(
            this.moveState,
            this.getPosition(),
            this.getYawRotation()
        );

        let {forward, left, back, right} = adjustedMoveState;
        if (forward) direction.add(new THREE.Vector3(0, 0, -1));
        if (left) direction.add(new THREE.Vector3(-1, 0, 0));
        if (back) direction.add(new THREE.Vector3(0, 0, 1));
        if (right) direction.add(new THREE.Vector3(1, 0, 0));

        if (direction.length() != 0) {
            direction.normalize();
            this.yawObject.translateOnAxis(direction, this.movespeed * timePassed);
        }

        this.prevUpdateTime = time;
    }

    this.updateFireState = function() {
        if (!this.firing) return;

        let time = performance.now();

        let shotDue = (time - this.prevFireTime) > ((1 / this.rateOfFire) * 1000);
        if (shotDue) {
            this.prevFireTime = time;
            if (this.afterFire) {
                this.afterFire(this.getRaycaster());
            }
        }
    };

    this.movespeed = movespeed;

    let degreesPerDot = 0.022; // Multiplier used in CSGO

    this.sensMultiplier = (degreesPerDot * sensitivity) * (Math.PI / 180);

    this.collisionDetection = collisionDetection;
    this.moveState = {
        forward: false,
        left: false,
        back: false,
        right: false
    };

    this.prevUpdateTime = performance.now();

    this.pitchObject = new THREE.Object3D();
    this.yawObject = new THREE.Object3D();

    camera.rotation.set(0, 0, 0);
    this.pitchObject.add(camera);
    this.yawObject.add(this.pitchObject);

    this.rateOfFire = rateOfFire;
    this.afterFire = afterFire;

    this.prevFireTime = performance.now();
    this.firing = false;

    this.running = true;

    this.setupListeners();
};

module.exports = ThreeFPSControls;