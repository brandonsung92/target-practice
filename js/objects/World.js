const THREE = require('three');
const CollisionDetection = require('./CollisionDetection.js')
const TargetSystem = require('./TargetSystem.js');

const World = function(settings, collisionDetection) {
	this.settings = settings;
	this.collisionDetection = collisionDetection;
	this.disposableObjects = [];

	this.targetWall = null;
	this.targetSystem = null;
}

World.prototype.adjustTimers = function(time) {
    this.targetSystem.adjustTimers(time);
};

World.prototype.create = function() {
	this.createScene();
	this.createTargetSystem();
};

World.prototype.createScene = function() {
	let mesh, geometry, material;

    this.scene = new THREE.Scene();

    let sceneLength = this.getSceneLength();
    let sceneWidth = this.getSceneWidth();
    let sceneHeight = this.getSceneHeight(sceneWidth);

    let {movespeed, elevation} = this.settings;

    let floorColor = 0xCCCCCC;
    let wallColor = 0xEEEEEE;
    let targetWallColor = 0xFFFFCC;

    // setup floor and roof
    material = new THREE.MeshBasicMaterial({ color: floorColor });

    geometry = new THREE.PlaneGeometry(sceneWidth, sceneLength);
    geometry.rotateX(-Math.PI / 2);
    mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);
    this.disposableObjects.push(material, geometry);

    geometry = new THREE.PlaneGeometry(sceneWidth, sceneLength);
    geometry.rotateX(Math.PI / 2);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, sceneHeight, 0)
    this.scene.add(mesh);
    this.disposableObjects.push(geometry);

    // setup walls
    // target wall
    material = new THREE.MeshBasicMaterial({ color: targetWallColor });
    geometry = new THREE.PlaneGeometry(sceneWidth, sceneHeight);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, sceneHeight / 2, -sceneLength / 2);
    this.collisionDetection.addCollisionObject(mesh);
    this.scene.add(mesh);
    this.targetWall = mesh;
    this.disposableObjects.push(material, geometry);

    material = new THREE.MeshBasicMaterial({ color: wallColor });
    geometry = new THREE.PlaneGeometry(sceneWidth, sceneHeight);
    mesh = new THREE.Mesh(geometry, material);
    geometry.rotateX(Math.PI);
    mesh.position.set(0, sceneHeight / 2, sceneLength / 2);
    this.collisionDetection.addCollisionObject(mesh);
    this.scene.add(mesh);
    this.disposableObjects.push(material, geometry);

    geometry = new THREE.PlaneGeometry(sceneLength, sceneHeight);
    geometry.rotateY(Math.PI / 2);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(-sceneWidth / 2, sceneHeight / 2, 0);
    this.collisionDetection.addCollisionObject(mesh);
    this.scene.add(mesh);
    this.disposableObjects.push(geometry);

    geometry = new THREE.PlaneGeometry(sceneLength, sceneHeight);
    geometry.rotateY(-Math.PI / 2);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(sceneWidth / 2, sceneHeight / 2, 0);
    this.collisionDetection.addCollisionObject(mesh);
    this.scene.add(mesh);
    this.disposableObjects.push(geometry);

    // to indicate invisible wall
    geometry = new THREE.PlaneGeometry(sceneWidth, elevation / 2);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, elevation / 4, (sceneLength / 2) - movespeed);
    this.scene.add(mesh);
    this.disposableObjects.push(geometry);

    // setup invisible wall
    material = new THREE.MeshBasicMaterial();
    material.visible = false;
    geometry = new THREE.PlaneGeometry(sceneWidth, sceneHeight);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, sceneHeight / 2, (sceneLength / 2) - movespeed);
    this.collisionDetection.addCollisionObject(mesh);
    this.scene.add(mesh);
    this.disposableObjects.push(material, geometry);
};

World.prototype.createTargetSystem = function() {
    this.targetSystem = new TargetSystem(
        this.scene,
        this.settings,
        this.targetWall
    );
    this.disposableObjects.push(this.targetSystem);
};

World.prototype.dispose = function() {
	// Clear all children of scene
    if (this.scene) {
        let clear = function(obj) {
            let i = obj.children.length;
            while (i > 0) {
                i--;
                let child = obj.children[i];
                if (child.children.length) clear(child);
                obj.remove(obj.children[i]);
            }
        };
        clear(this.scene);
    }

    // Dispose objects
    for (let i = 0; i < this.disposableObjects.length; i++) {
        this.disposableObjects[i].dispose();
    }
    this.disposableObjects = [];
};

World.prototype.update = function() {
    this.targetSystem.generateTarget();
    this.targetSystem.updateTargets();
    this.targetSystem.updateHitMarkers();
};

World.prototype.getSceneLength = function() {
    let {targetDistance, movespeed} = this.settings;
    return targetDistance + (movespeed / 2);
};

World.prototype.getSceneWidth = function() {
    let {hfov, targetWallScreenRatio, targetDistance} = this.settings;

    let halfFovRad = hfov * Math.PI / 360;
    return Math.abs(Math.tan(halfFovRad) * targetDistance * 2 * targetWallScreenRatio);
};

World.prototype.getSceneHeight = function(sceneWidth) {
    let {gameHeight, gameWidth} = this.settings;
    sceneWidth = sceneWidth || this.getSceneWidth();
    return Math.abs(sceneWidth * (gameHeight / gameWidth));
};

module.exports = World;