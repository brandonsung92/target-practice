const THREE = require('three');
const $ = require('jquery');

const ObjectManager = require('./ObjectManager.js');

const World = require('./World.js');
const CollisionDetection = require('./CollisionDetection.js');
const Crosshair = require('./Crosshair.js');

const FPSControls = require('./controls/FPSControls.js');

const Game = function(settings) {
    this.getStats = function() {
        return this.objectManager.getObject('world').targetSystem.getStats();
    };

    this.setup = function() {
        this.setupCharacterCollision();
        this.setupWorld();
        this.setupRenderer();
        this.setupCamera();
        this.setupControls();
        this.setupCrosshair();
    };

    this.reset = function() {
        this.objectManager.disposeObjects();
        this.disposeObjects();
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
        this.objectManager.adjustTimers(pausedTime);
        this.objectManager.toggleObjects(true);

        this.lockPointer();
        this.running = true;
        this.animate();
    };

    this.pause = function() {
        this.pauseTime = performance.now();
        this.objectManager.toggleObjects(false);

        this.releasePointer();
        this.running = false;
    }

    this.end = function() {
        this.reset();
        this.releasePointer();
        this.running = false;
    };

    this.animate = function() {
        if (!this.running) return;
        requestAnimationFrame(this.animate);

        this.objectManager.updateObjects();

        this.renderer.render(this.objectManager.getObject('world').scene, this.camera);
    }.bind(this);

    this.setupWorld = function() {
        let world = new World(this.settings, this.collisionDetection);
        world.create();

        this.objectManager.registerObject('world', world);
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
        let far = Math.pow(this.objectManager.getObject('world').getSceneLength(), 3);

        this.camera = new THREE.PerspectiveCamera(vfov, aspect, 0.1, far);
    };

    this.setupCrosshair = function() {
        let crosshair = new Crosshair(this.settings);
        this.$element.append(crosshair.$element);
        this.objectManager.registerObject('crosshair', crosshair);
    };

    this.setupControls = function() {
        let controls = new FPSControls(
            this.camera,
            this.collisionDetection,
            this.settings.sensitivity,
            this.settings.movespeed,
            this.settings.rateOfFire,
            function(caster) {
                this.objectManager.getObject('world').targetSystem.hitCheck(caster);
            }.bind(this)
        );
        controls.addTo(this.objectManager.getObject('world').scene);

        // Set starting position
        let {elevation, movespeed} = this.settings;
        let positionZ = (this.objectManager.getObject('world').getSceneLength() - movespeed) / 2;
        controls.setPosition(0, elevation, positionZ);

        this.objectManager.registerObject('controls', controls);
    };

    let setupElements = function() {
        this.$element = $("<div>").attr('id', 'game');
    };

    this.running = false;
    this.settings = settings;
    this.objectManager = new ObjectManager();
    this.disposableObjects = [];

    setupElements.call(this);
};

module.exports = Game;