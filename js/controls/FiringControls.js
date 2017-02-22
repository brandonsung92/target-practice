const THREE = require('three');
const EventHandler = require('../tools/EventHandler.js');

const FiringSystem = function(clipSize, rateOfFire, reloadDuration, $ammoInfo, afterFire) {
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

        let cantFire = !this.infiniteAmmo && (this.reloading || (this.inClip == 0));
        if (cantFire) return;
        this.firing = true;
    }.bind(this);

    this.mouseup = function() {
        this.firing = false;
        if (!this.running) return;

        if (!this.reloading && this.inClip == 0) {
            this.reload();
        }
    }.bind(this);

    this.reload = function() {
        if (this.infiniteAmmo || this.reloading) return;
        this.reloadTime = performance.now();
        this.reloading = true;
        this.updateAmmoInfoText();
    }

    this.updateFireState = function() {
        if (!this.firing || this.reloading) return;

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
                this.updateAmmoInfoText();
            }
        }
    };

    this.updateReloadState = function() {
        if (!this.reloading) return;

        let time = performance.now();
        if ((time - this.reloadTime) < this.reloadDuration) return;
        this.inClip = this.clipSize;
        this.reloading = false;
        this.updateAmmoInfoText();
    };

    this.updateAmmoInfoText = function() {
        if (!this.$ammoInfo) return;

        let info = '';

        if (!this.infiniteAmmo) {
            if (this.reloading) {
                info += 'Reloading...';
            } else {
                info += ' ' + this.inClip + ' / ' + this.clipSize;
            }
        }

        this.$ammoInfo.text(info);
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
            },
            {
                type: 'keydown',
                element: document,
                listener: function(e) {
                    if (e.keyCode == 82) { // 'r'
                        this.reload();
                    }
                }.bind(this)
            }
        ]);
        this.eventHandler.setupListeners(); 
    };

    this.clipSize = clipSize;
    this.rateOfFire = rateOfFire;
    this.reloadDuration = reloadDuration;
    this.$ammoInfo = $ammoInfo;
    this.afterFire = afterFire;

    this.infiniteAmmo = clipSize == 0;

    this.prevFireTime = performance.now();
    this.inClip = clipSize;
    this.firing = false;
    this.running = true;

    this.clipEmptySound = new Audio('./sfx/clip_empty.wav');

    this.updateAmmoInfoText();

    setupListeners.call(this);
};

module.exports = FiringSystem;