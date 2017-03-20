const THREE = require('three');
const $ = require('jquery');

const World = require('./World.js');
const CollisionDetection = require('./CollisionDetection.js');
const Crosshair = require('./Crosshair.js');

const FiringControls = require('./controls/FiringControls.js');
const FPSControls = require('./controls/ThreeFPSControls.js');

const Game = function(settings) {
    this.getStats = function() {
        return this.world.targetSystem.getStats();
    };

    this.setup = function() {
        this.setupCharacterCollision();
        this.setupWorld();
        this.setupScene();
        this.setupRenderer();
        this.setupCamera();
        this.setupControls();
        this.setupFiringControls();
        this.setupPosition();
    };

    this.reset = function() {
        this.world.dispose();
        this.disposeObjects();

        this.firingControls = null;
        this.controls = null;
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
        this.setup();
        this.lockPointer();
        this.running = true;
        this.animate();
    };

    this.resume = function() {
        let pausedTime = performance.now() - this.pauseTime;
        this.adjustTimers(pausedTime);

        this.lockPointer();
        this.toggleControls(true);
        this.running = true;
        this.animate();
    };

    this.pause = function() {
        this.pauseTime = performance.now();

        this.releasePointer();
        this.toggleControls(false);
        this.running = false;
    }

    this.end = function() {
        this.reset();
        this.releasePointer();
        this.running = false;
    };

    this.adjustTimers = function(pausedTime) {
        this.controls.addToTimers(pausedTime);
        this.firingControls.addToTimers(pausedTime);

        this.world.targetSystem.addToTimers(pausedTime);
    };

    this.toggleControls = function(running) {
        this.controls.toggle(running);
        this.firingControls.toggle(running);
    };

    this.animate = function() {
        if (!this.running) return;
        requestAnimationFrame(this.animate);

        this.controls.updatePosition(this.collisionDetection);

        this.world.update();

        this.firingControls.updateFireState();

        this.renderer.render(this.world.scene, this.camera);
    }.bind(this);

    this.setupWorld = function() {
        this.world = new World(this.settings, this.collisionDetection);
        this.world.create();
    };

    this.setupFiringControls = function() {
        let afterFire = function() {
            let position = this.controls.getPosition();
            let direction = this.controls.getDirection();

            let caster = new THREE.Raycaster();
            caster.set(position, direction);
            this.world.targetSystem.hitCheck(caster);
        }.bind(this);

        this.firingControls = new FiringControls(
            this.settings.rateOfFire,
            afterFire
        );
        this.disposableObjects.push(this.firingControls);
    };

    this.setupPosition = function() {
        let {elevation, movespeed} = this.settings;
        let positionZ = (this.world.getSceneLength() - movespeed) / 2;
        this.controls.setPosition(0, elevation, positionZ);
    };

    this.setupCharacterCollision = function() {
        this.collisionDetection = new CollisionDetection();
    };

    this.setupRenderer = function() {
        if (this.renderer) return;
        let {gameWidth, gameHeight} = this.settings;

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setClearColor(0xffffff);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(gameWidth, gameHeight);

        this.$element.append(this.renderer.domElement);
    };

    this.setupCamera = function() {
        let {gameWidth, gameHeight, hfov} = this.settings;
        let aspect = gameWidth / gameHeight;
        let vfov = hfov / aspect;
        let far = Math.pow(this.world.getSceneLength(), 3);

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

    this.setupCrosshair = function() {
        this.crosshair = new Crosshair(this.settings);
        this.$element.append(this.crosshair.$element);
    };

    this.setupControls = function() {
        this.controls = new FPSControls(
            this.camera,
            this.settings.sensitivity,
            this.settings.movespeed
        );
        this.controls.addTo(this.world.scene);
        this.disposableObjects.push(this.controls);
    };

    this.setupScene = function() {};

    let setupElements = function() {
        this.$element = $("<div>").attr('id', 'game');
    };

    this.running = false;
    this.settings = settings;
    this.disposableObjects = [];

    setupElements.call(this);
};

module.exports = Game;