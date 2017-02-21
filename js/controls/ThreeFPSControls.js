const THREE = require('three');
const EventHandler = require('../tools/EventHandler.js');

const ThreeFPSControls = function(gameWidth, gameHeight, camera, sensitivity, movespeed) {

    this.toggle = function(running) {
        this.running = running;
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
            }
        ]);
        this.eventHandler.setupListeners();
    };

    this.dispose = function() {
        this.eventHandler.removeListeners();
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

    // this needs to be called in game's animate method
    this.updatePosition = function(collisionDetection) {
        let time = performance.now();
        let timePassed = (time - this.prevUpdateTime) / 1000;

        let direction = new THREE.Vector3(0, 0, 0);

        let adjustedMoveState = collisionDetection.getAdjustedMoveState(
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

    this.movespeed = movespeed;

    var degreesPerDot = 0.022; // Multiplier used in CSGO

    this.sensMultiplier = (degreesPerDot * sensitivity) * (Math.PI / 180);

    camera.rotation.set(0, 0, 0);

    this.eventListeners = [];

    this.moveState = {
        forward: false,
        left: false,
        back: false,
        right: false
    };

    this.prevUpdateTime = performance.now();

    this.pitchObject = new THREE.Object3D();
    this.yawObject = new THREE.Object3D();

    this.pitchObject.add(camera);
    this.yawObject.add(this.pitchObject);

    this.running = true;

    this.setupListeners();
};

module.exports = ThreeFPSControls;