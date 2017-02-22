const THREE = require('three');
const EventHandler = require('../tools/EventHandler.js');

const FiringSystem = function(clipSize, rateOfFire, reloadDuration, afterFire) {
    this.addToTimers = function(time) {
        this.prevFireTime += time;
        this.reloadTime += time;
    };

    this.dispose = function() {
        this.eventHandler.removeListeners();
    };

    this.toggle = function(running) {
        this.running = running;
    };

    this.mousedown = function() {
        if (!this.running) return;

        let cantFire = !this.infiniteAmmo && this.reloading && this.inClip == 0;
        if (cantFire) return;
        this.reloading = false;
        this.firing = true;
    }.bind(this);

    this.mouseup = function() {
        if (!this.running) return;

        // maybe run an on screen animation to show reloading later
        this.firing = false;
        if (this.infiniteAmmo || this.inClip == this.clipSize) return;
        this.reloadTime = performance.now();
        this.reloading = true;
    }.bind(this);

    this.updateFireState = function() {
        if (!this.firing) return;

        let time = performance.now();

        let shotDue = (time - this.prevFireTime) > ((1 / this.rateOfFire) * 1000);
        if (shotDue) {
            this.prevFireTime = time;

            let noAmmo = !this.infiniteAmmo && this.inClip == 0;
            if (noAmmo) {
                this.clipEmptySound.pause();
                this.clipEmptySound.currentTime = 0;
                this.clipEmptySound.play();
            } else {
                if (!this.infiniteAmmo) this.inClip--;
                if (this.afterFire) this.afterFire();
            }
        }
    };

    this.updateReloadState = function() {
        if (!this.reloading) return;

        let time = performance.now();
        if ((time - this.reloadTime) < this.reloadDuration) return;
        this.inClip = this.clipSize;
        this.reloading = false;
    };

    this.setupListeners = function() {
        if (!this.eventHandler) this.eventHandler = new EventHandler();
        this.eventHandler.setListeners([
            {
                type: 'mousedown',
                element: document,
                listener: this.mousedown
            },
            {
                type: 'mouseup',
                element: document,
                listener: this.mouseup
            }
        ]);
        this.eventHandler.setupListeners(); 
    };

    this.clipSize = clipSize;
    this.rateOfFire = rateOfFire;
    this.reloadDuration = reloadDuration;
    this.afterFire = afterFire;

    this.infiniteAmmo = clipSize == 0;

    this.prevFireTime = performance.now();
    this.inClip = clipSize;
    this.firing = false;
    this.running = true;

    this.clipEmptySound = new Audio('./sfx/clip_empty.wav');

    this.setupListeners();
};

module.exports = FiringSystem;