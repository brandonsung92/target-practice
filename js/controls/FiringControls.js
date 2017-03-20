const THREE = require('three');
const EventHandler = require('../tools/EventHandler.js');

const FiringSystem = function(rateOfFire, afterFire) {
    this.addToTimers = function(time) {
        this.prevFireTime += time;
    };

    this.dispose = function() {
        this.eventHandler.removeListeners();
    };

    this.toggle = function(running) {
        this.running = running;
    };

    this.mousedown = function() {
        if (this.running) this.firing = true;
    }.bind(this);

    this.mouseup = function() {
        this.firing = false;
    }.bind(this);

    this.updateFireState = function() {
        if (!this.firing) return;

        let time = performance.now();

        let shotDue = (time - this.prevFireTime) > ((1 / this.rateOfFire) * 1000);
        if (shotDue) {
            this.prevFireTime = time;
            if (this.afterFire) this.afterFire();
        }
    };

    let setupListeners = function() {
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

    this.rateOfFire = rateOfFire;
    this.afterFire = afterFire;

    this.prevFireTime = performance.now();
    this.firing = false;
    this.running = true;

    setupListeners.call(this);
};

module.exports = FiringSystem;