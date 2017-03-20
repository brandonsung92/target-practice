const THREE = new require('three');

const CollisionDetection = function() {
    this.caster = new THREE.Raycaster();
    this.collisionObjects = [];
};

CollisionDetection.prototype.addCollisionObject = function(collisionObject) {
    this.collisionObjects.push(collisionObject);
};

CollisionDetection.prototype.getAdjustedMoveState = function(moveState, position, yawRotation) {
    let collisionDistance = 50;
    let {forward, left, back, right} = moveState;
    let adjustedMoveState = {
        forward: forward,
        left: left,
        back: back,
        right: right
    };

    // use a different motion of collision checking for more accuracy, but this will work for now
    let collisionRays = {
        forward: (new THREE.Vector3(0, 0, -1)).applyEuler(yawRotation),
        back: (new THREE.Vector3(0, 0, 1)).applyEuler(yawRotation),
        left: (new THREE.Vector3(-1, 0, 0)).applyEuler(yawRotation),
        right: (new THREE.Vector3(1, 0, 0)).applyEuler(yawRotation)
    }
    for (let direction in collisionRays) {
        this.caster.set(position, collisionRays[direction]);
        let collisions = this.caster.intersectObjects(this.collisionObjects);
        if (collisions.length > 0 && collisions[0].distance <= collisionDistance) {
            adjustedMoveState[direction] = false;
        }
    }

    return adjustedMoveState;
};

module.exports = CollisionDetection;