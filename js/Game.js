const THREE = require('three');
const $ = require('jquery');

const CollisionDetection = require('./CollisionDetection.js');
const TargetSystem = require('./TargetSystem.js');

const FiringControls = require('./controls/FiringControls.js');
const FPSControls = require('./controls/ThreeFPSControls.js');

const Game = function(settings) {
    this.getSettings = function() {
        return this.settings;
    };

    this.setup = function() {
        // Needs resets:
        this.setupCharacterCollision();
        this.setupScene();
        this.setupRenderer();
        this.setupCamera();
        this.setupControls();
        this.setupFiringControls();
        this.setupTargetSystem();

        // Doesn't need resets:
        this.setupPosition();
    };

    this.reset = function() {
        // keep reusing renderer

        this.clearScene();
        this.disposeObjects();

        this.scene = null;
        this.targetSystem = null;
        this.firingControls = null;
        this.controls = null;
    };

    this.clearScene = function() {
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
    };

    this.disposeObjects = function() {
        for (let i = 0; i < this.disposableObjects.length; i++) {
            this.disposableObjects[i].dispose();
        }
        this.disposableObjects = [];
    };

    this.lockPointer = function() {
        this.$element.get(0).requestPointerLock();
    };

    this.releasePointer = function() {
        document.exitPointerLock();
    };

    this.start = function() {
        this.$element.append(this.renderer.domElement);
        this.lockPointer();
        this.running = true;
        this.animate();
    };

    this.resume = function() {
        this.lockPointer();
        this.toggleControls(true);
        this.running = true;
        this.animate();
    };

    this.pause = function() {
        this.releasePointer();
        this.toggleControls(false);
        this.running = false;
    }

    this.stop = function() {
        this.reset();
        this.releasePointer();
        this.running = false;
    };

    this.toggleControls = function(running) {
        this.controls.toggle(running);
        this.firingControls.toggle(running);
    };

    this.animate = function() {
        if (!this.running) return;
        requestAnimationFrame(this.animate);

        this.controls.updatePosition(this.collisionDetection);

        this.targetSystem.generateTarget();
        this.targetSystem.updateTargets();

        this.firingControls.updateFireState();
        this.firingControls.updateReloadState();

        this.renderer.render(this.scene, this.camera);
    }.bind(this);

    this.setupFiringControls = function() {
        let afterFire = function() {
            let position = this.controls.getPosition();
            let direction = this.controls.getDirection();

            let caster = new THREE.Raycaster();
            caster.set(position, direction);
            this.targetSystem.hitCheck(caster);
        }.bind(this);

        this.firingControls = new FiringControls(
            this.settings.clipSize,
            this.settings.rateOfFire,
            this.settings.reloadDuration,
            afterFire
        );
        this.disposableObjects.push(this.firingControls);
    };

    this.setupTargetSystem = function() {
        this.targetSystem = new TargetSystem(
            this.scene,
            this.settings,
            this.targetWall
        );
        this.disposableObjects.push(this.targetSystem);
    };

    this.setupPosition = function() {
        let {elevation, movespeed} = this.getSettings();
        let positionZ = (this.getSceneLength() - movespeed) / 2;
        this.controls.setPosition(0, elevation, positionZ);
    };

    this.setupCharacterCollision = function() {
        this.collisionDetection = new CollisionDetection();
    };

    this.setupRenderer = function() {
        if (this.renderer) return;
        let {gameWidth, gameHeight} = this.getSettings();

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setClearColor(0xffffff);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(gameWidth, gameHeight);

        this.$element.append(this.renderer.domElement);
    };

    this.setupCamera = function() {
        let {gameWidth, gameHeight, hfov} = this.getSettings();
        let aspect = gameWidth / gameHeight;
        let vfov = hfov / aspect;
        let far = Math.pow(this.getSceneLength(), 3);

        this.camera = new THREE.PerspectiveCamera(vfov, aspect, 0.1, far);

        // add a crosshair
        // crosshair options future feature?
        // use rectangles instead of lines later
        let vertGeo = new THREE.Geometry();
        let horGeo = new THREE.Geometry();
        let material = new THREE.LineBasicMaterial({color: 0x333333});

        vertGeo.vertices.push(
            new THREE.Vector3(0, 0.1, -5),
            new THREE.Vector3(0, -0.1, -5)
        );
        let vert = new THREE.Line(vertGeo, material);

        horGeo.vertices.push(
            new THREE.Vector3(0.1, 0, -5),
            new THREE.Vector3(-0.1, 0, -5)
        );
        let hor = new THREE.Line(horGeo, material);
        this.camera.add(vert); 
        this.camera.add(hor);

        this.disposableObjects.push(vertGeo, horGeo, material);
    };

    this.setupControls = function() {
        this.controls = new FPSControls(
            this.settings.gameWidth,
            this.settings.gameHeight,
            this.camera,
            this.settings.sensitivity,
            this.getSettings().movespeed
        );
        this.controls.addTo(this.scene);
        this.disposableObjects.push(this.controls);
    };

    this.getSceneLength = function() {
        let {targetDistance, movespeed} = this.getSettings();
        return targetDistance + (movespeed / 2);
    };

    this.getSceneWidth = function() {
        let {hfov, targetWallScreenRatio, targetDistance} = this.getSettings();

        let halfFovRad = hfov * Math.PI / 360;
        return Math.abs(Math.tan(halfFovRad) * targetDistance * 2 * targetWallScreenRatio);
    };

    this.getSceneHeight = function(sceneWidth) {
        let {gameHeight, gameWidth} = this.getSettings();
        sceneWidth = sceneWidth || this.getSceneWidth();
        return Math.abs(sceneWidth * (gameHeight / gameWidth));
    };

    this.setupScene = function() {
        let mesh, geometry, material;

        this.scene = new THREE.Scene();

        let sceneLength = this.getSceneLength();
        let sceneWidth = this.getSceneWidth();
        let sceneHeight = this.getSceneHeight(sceneWidth);

        let {movespeed, elevation} = this.getSettings();

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

    this.running = false;
    this.settings = settings;
    this.disposableObjects = [];
    this.$element = $("<div>").attr('id', 'game');
};

module.exports = Game;