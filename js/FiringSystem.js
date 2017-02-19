const THREE = require('three');
const EventHandler = require('./EventHandler.js');

const FiringSystem = function(clipSize, rateOfFire, reloadDuration, afterFire) {

    this.dispose = function() {
        this.eventHandler.removeListeners();
    };

    this.fire = function() {
        let cantFire = !this.infiniteAmmo && this.reloading && this.inClip == 0;
        if (cantFire) return;
        this.reloading = false;
        this.firing = true;
    }.bind(this);

    this.reload = function() {
        if (this.reloading) return;
        // maybe run an on screen animation to show reloading later
        this.firing = false;
        if (this.infiniteAmmo) return;
        this.reloadTime = performance.now();
        this.reloading = true;
    }.bind(this);

    this.updateFireState = function() {
        if (!this.firing) return;

        let time = performance.now();
        if ((1 / this.rateOfFire) * 1000 > (time - this.prevFireTime)) return;

        let noAmmo = !this.infiniteAmmo && this.inClip == 0;
        if (noAmmo) return;

        if (!this.infiniteAmmo) this.inClip--;
        this.prevFireTime = time;

        if (this.afterFire) this.afterFire();
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
                listener: this.fire
            },
            {
                type: 'mouseup',
                element: document,
                listener: this.reload
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

    this.setupListeners();
};

module.exports = FiringSystem;