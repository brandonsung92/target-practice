const THREE = require('three');

const TargetSystem = function(scene, settings, targetWall) {
    let calculateUsablePlaneBBox = function() {
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

    this.scene = scene;
    this.settings = settings;
    this.targetWall = targetWall;

    this.targetGeometry = new THREE.CircleGeometry(this.settings.targetSize);
    this.hitMarkerGeometry = new THREE.BoxGeometry(
        this.settings.hitMarkerSize,
        this.settings.hitMarkerSize,
        this.settings.hitMarkerSize
    );
    this.hitMarkerMaterial = new THREE.MeshBasicMaterial({
        color: 0x0000FF,
        transparent: true,
        opacity: 0.5
    });

    this.targets = [];
    this.hitMarkers = [];
    this.stats = {
        hits: 0,
        attempts: 0,
        targetsDestroyed: 0,
        targetsGenerated: 0,
        currentHitStreak: 0
    };
    this.prevGenerateTime = performance.now();
    this.prevUpdateTime = performance.now();

    this.hitSound = new Audio('./sfx/hit.wav');
    this.missSound = new Audio('./sfx/miss.wav');

    calculateUsablePlaneBBox.call(this);
};

TargetSystem.prototype.adjustTimers = function(time) {
    this.prevGenerateTime += time;
    this.prevUpdateTime += time;

    for (let i = 0; i < this.targets.length; i++) {
        this.targets[i].lastHitTime += time;
        this.targets[i].generateTime += time;
        this.targets[i].lastDirectionChangeTime += time;
    }

    for (let i = 0; i < this.hitMarkers.length; i++) {
        this.hitMarkers[i].generateTime += time;
    }
};

TargetSystem.prototype.getStats = function() {
    return this.stats;
};

TargetSystem.prototype.dispose = function() {
    for (let i = this.targets.length; i > 0; i--) {
        this.removeTarget(this.targets[i-1]);
    }
    for (let i = this.hitMarkers.length; i > 0; i--) {
        this.removeHitMarker(this.hitMarkers[i-1]);
    }
    this.targets = [];
    this.targetGeometry.dispose();
    this.hitMarkerGeometry.dispose();
    this.hitMarkerMaterial.dispose();
};

TargetSystem.prototype.generateTarget = function() {
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
    let object = new THREE.Mesh(this.targetGeometry, material);
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
        lastHitTime: time,
        generateTime: time,
        lastDirectionChangeTime: time
    };

    this.scene.add(target.object);
    this.targets.push(target);
    this.prevGenerateTime = time;

    this.stats.targetsGenerated++;
};

TargetSystem.prototype.playHitSound = function() {
    this.hitSound.pause();
    this.hitSound.currentTime = 0;
    this.hitSound.play();
};

TargetSystem.prototype.playMissSound = function() {
    this.missSound.pause();
    this.missSound.currentTime = 0;
    this.missSound.play();
};

TargetSystem.prototype.hitCheck = function(caster) {
    let targetObjs = this.getTargetObjects();

    let intersectObjects = targetObjs.slice();
    intersectObjects.push(this.targetWall);

    let intersected = caster.intersectObjects(intersectObjects);
    let targetIndex = -1;

    if (this.settings.hitMarkerDuration != 0) {
        if (intersected.length > 0) this.generateHitMarker(intersected[0].point);
    }

    for (let i = 0; i < intersected.length; i++) {
        targetIndex = targetObjs.indexOf(intersected[i].object);
        if (targetIndex != -1) break;
    }

    // Increment total number of attempts/shots
    this.stats.attempts++;

    if (targetIndex != -1) {
        this.playHitSound();
        let target = this.targets[targetIndex];
        target.hitpoints--;
        target.lastHitTime = performance.now();

        // Increment total number of hits
        this.stats.hits++;
        this.stats.currentHitStreak++;

        if (target.hitpoints == 0) {
            this.stats.targetsDestroyed++;
            this.removeTarget(target);
        }
        return true;
    } else {
        this.playMissSound();
        this.stats.currentHitStreak = 0;
        return false;
    }
};

TargetSystem.prototype.removeTarget = function(target) {
    this.scene.remove(target.object);
    target.object.material.dispose();
    let i = this.targets.indexOf(target);
    if (i != -1) this.targets.splice(i, 1);
};

TargetSystem.prototype.getTargetObjects = function() {
    return this.targets.map(function(target) {
        return target.object;
    });
};

TargetSystem.prototype.generateHitMarker = function(markerPos) {
    let object = new THREE.Mesh(this.hitMarkerGeometry, this.hitMarkerMaterial);
    object.position.set(markerPos.x, markerPos.y, markerPos.z);
    this.scene.add(object);
    this.hitMarkers.push({
        generateTime: performance.now(),
        object: object
    });
};

TargetSystem.prototype.removeHitMarker = function(hitMarker) {
    this.scene.remove(hitMarker.object);
    let i = this.hitMarkers.indexOf(hitMarker);
    if (i != -1) this.hitMarkers.splice(i, 1);
};

TargetSystem.prototype.getHitMarkerObjects = function() {
    return this.hitMarkers.map(function(hitMarker) {
        return hitMarker.object;
    });
};

TargetSystem.prototype.updateTargets = function() {
    let time = performance.now();
    let timePassed = (time - this.prevUpdateTime) / 1000;

    for (let i = 0; i < this.targets.length; i++) {
        let {object,
            velocity,
            hitpoints,
            lastHitTime,
            generateTime,
            lastDirectionChangeTime
        } = this.targets[i];
        if (this.settings.targetLifespan != 0) {
            if (time - generateTime > this.settings.targetLifespan) {
                this.removeTarget(this.targets[i]);
                continue;
            }
        }

        if (this.settings.targetSpeed != 0) {
            this.adjustVelocityOnCollision(object, velocity);

            if (this.settings.targetDirectionChangeInterval != 0) {
                if (this.settings.targetDirectionChangeInterval < time - lastDirectionChangeTime) {
                    velocity.applyAxisAngle(
                        new THREE.Vector3(0, 0, 1),
                        Math.random() * 2 * Math.PI
                    );
                    this.targets[i].lastDirectionChangeTime = time;
                }
            }

            object.translateX(velocity.x * timePassed);
            object.translateY(velocity.y * timePassed);
        }

        let targetHealOn = this.settings.targetHealInterval != 0;
        let healDue = time - lastHitTime > this.settings.targetHealInterval
        if (targetHealOn && healDue) this.targets[i].hitpoints = this.settings.targetHitpoints;

        object.material.opacity = 0.2 + (0.8 * hitpoints / this.settings.targetHitpoints);
    }

    this.prevUpdateTime = time;
};

TargetSystem.prototype.updateHitMarkers = function() {
    if (this.settings.hitMarkerDuration == 0) return;
    let time = performance.now();

    while (this.hitMarkers.length > 0) {
        if ((time - this.hitMarkers[0].generateTime) > this.settings.hitMarkerDuration) {
            this.removeHitMarker(this.hitMarkers[0]);
        } else {
            // this.hitMarkers sorted by generateTime (smallest first)
            break;
        }
    }
};

TargetSystem.prototype.adjustVelocityOnCollision = function(object, velocity) {
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

module.exports = TargetSystem;