const THREE = require('three');

const TargetGenerator = function(scene, settings, targetWall) {

    this.addToTimers = function(time) {
        this.prevGenerateTime += time;
        this.prevUpdateTime += time;

        for (let i = 0; i < this.targets.length; i++) {
            this.targets[i].lastHitTime += time;
        }
    };

    this.getStats = function() {
        return this.stats;
    };

    this.dispose = function() {
        for (let i = this.targets.length; i > 0; i--) {
            this.removeTarget(this.targets[i-1]);
        }
        this.targets = [];
        this.geometry.dispose();
    };

    this.generateTarget = function() {
        let time = performance.now();

        let {targetInterval, maxTargets, targetHitpoints} = this.settings;

        let notDue = (time - this.prevGenerateTime) < targetInterval;
        let maxReached = this.targets.length >= maxTargets;

        // if max reached, always update prevGenerateTime
        if (maxReached) {
            this.prevGenerateTime = time;
        }

        if (notDue || maxReached) return;
        let {min, max} = this.usablePlaneBBox;
        let {x, y, z} = this.usablePlaneBBox.getCenter();
        let usableWidth = max.x - min.x;
        let usableHeight = max.y - min.y;

        let targetX = x - (usableWidth / 2) + (Math.random() * usableWidth);
        let targetY = y - (usableHeight / 2) + (Math.random() * usableHeight);
        let targetZ = z + 10;

        let material = new THREE.MeshBasicMaterial({
            color: this.settings.targetColor,
            transparent: true
        });
        let object = new THREE.Mesh(this.geometry, material);
        object.position.set(targetX, targetY, targetZ);

        let velocity = new THREE.Vector3(0, 1, 0);
        velocity.applyAxisAngle(
            new THREE.Vector3(0, 0, 1),
            Math.random() * 2 * Math.PI
        );
        velocity.multiplyScalar(this.settings.targetSpeed);

        let target = {
            object: object,
            velocity: velocity,
            hitpoints: targetHitpoints,
            lastHitTime: performance.now()
        };

        this.scene.add(target.object);
        this.targets.push(target);
        this.prevGenerateTime = time;
    };

    this.playHitSound = function() {
        this.hitSound.pause();
        this.hitSound.currentTime = 0;
        this.hitSound.play();
    };

    this.playMissSound = function() {
        this.missSound.pause();
        this.missSound.currentTime = 0;
        this.missSound.play();
    };

    this.hitCheck = function(caster) {
        let hits = caster.intersectObjects(this.getTargetObjects());

        // Increment total number of attempts/shots
        this.stats.attempts++;

        if (hits.length > 0) {
            this.playHitSound();
            let target = this.targets[this.getTargetIndexByObject(hits[0].object)];
            target.hitpoints--;
            target.lastHitTime = performance.now();

            // Increment total number of hits
            this.stats.hits++;
            if (target.hitpoints === 0) {
                this.stats.targetsDestroyed++;
                this.removeTarget(target);
            }
            return true;
        } else {
            this.playMissSound();
        }
        return false;
    };

    this.getTargetIndexByObject = function(target) {
        return this.getTargetObjects().indexOf(target);
    };

    this.getTargetObjects = function() {
        return this.targets.map(function(target) {
            return target.object;
        });
    };

    this.removeTarget = function(target) {
        this.scene.remove(target.object);
        target.object.material.dispose();
        let i = this.targets.indexOf(target);
        if (i !== -1) this.targets.splice(i, 1);
    };

    this.calculateUsablePlaneBBox = function() {
        // Calculate vertices of usable plane
        let {width, height} = this.targetWall.geometry.parameters;
        let {x, y, z} = this.targetWall.position;
        let targetSize = this.settings.targetSize;
        let min = new THREE.Vector3(
            x + targetSize - (width / 2),
            y + targetSize - (height / 2),
            z
        );
        let max = new THREE.Vector3(
            x - targetSize + (width / 2),
            y - targetSize + (height / 2),
            z
        );
        this.usablePlaneBBox = new THREE.Box3(min, max);
    };

    // this needs to be called in game's animate method
    this.updateTargets = function() {
        let time = performance.now();
        let timePassed = (time - this.prevUpdateTime) / 1000;

        for (let i = 0; i < this.targets.length; i++) {
            let {object, velocity, hitpoints, lastHitTime} = this.targets[i];
            if (this.settings.targetSpeed != 0) {
                this.adjustVelocityOnCollision(object, velocity);

                object.translateX(velocity.x * timePassed);
                object.translateY(velocity.y * timePassed);
            }

            let targetHealOn = this.settings.targetHealInterval != 0;
            let healDue = time - lastHitTime > this.settings.targetHealInterval
            if (targetHealOn && healDue) this.targets[i].hitpoints = this.settings.targetHitpoints;

            object.material.opacity = (1 * hitpoints / this.settings.targetHitpoints);
        }

        this.prevUpdateTime = time;
    };

    this.adjustVelocityOnCollision = function(object, velocity) {
        let {min, max} = this.usablePlaneBBox;

        let top = object.position.y > max.y;
        let right = object.position.x > max.x;
        let bottom = object.position.y < min.y;
        let left = object.position.x < min.x;
        
        if (top) velocity.y = -Math.abs(velocity.y);
        if (right) velocity.x = -Math.abs(velocity.x)
        if (bottom) velocity.y = Math.abs(velocity.y);
        if (left) velocity.x = Math.abs(velocity.x);
    };

    this.scene = scene;
    this.settings = settings;
    this.targetWall = targetWall;

    this.geometry = new THREE.CircleGeometry(this.settings.targetSize);

    this.targets = [];
    this.stats = {
        hits: 0,
        attempts: 0,
        targetsDestroyed: 0
    };
    this.prevGenerateTime = performance.now();
    this.prevUpdateTime = performance.now();

    this.hitSound = new Audio('./sfx/hit.wav');
    this.missSound = new Audio('./sfx/miss.wav');

    this.calculateUsablePlaneBBox();
};

module.exports = TargetGenerator;