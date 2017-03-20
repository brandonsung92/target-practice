const THREE = require('three');
const $ = require('jquery');

const ObjectManager = require('./tools/ObjectManager.js');

const World = require('./objects/World.js');
const CollisionDetection = require('./objects/CollisionDetection.js');
const Crosshair = require('./objects/Crosshair.js');

const FPSControls = require('./controls/FPSControls.js');

const Game = function(settings) {
    this.getStats = function() {
        return this.objectManager.getObject('world').targetSystem.getStats();
    };

    this.setup = function() {
        this.setupObjects();
        this.setupRenderer();
    };

    this.setupObjects = function() {
        // collisionDetection
        let collisionDetection = new CollisionDetection();

        // world
        let world = new World(this.settings, collisionDetection);
        world.create();

        // camera
        let {gameWidth, gameHeight, hfov, elevation, movespeed} = this.settings;
        let aspect = gameWidth / gameHeight;
        let vfov = hfov / aspect;
        let far = Math.pow(world.getSceneLength(), 3);
        let camera = new THREE.PerspectiveCamera(vfov, aspect, 0.1, far)

        // controls
        let controls = new FPSControls(
            camera,
            collisionDetection,
            this.settings.sensitivity,
            this.settings.movespeed,
            this.settings.rateOfFire,
            world.targetSystem.hitCheck.bind(world.targetSystem)
        );
        controls.addTo(world.scene);
        let positionZ = (world.getSceneLength() - movespeed) / 2;
        controls.setPosition(0, elevation, positionZ); // set initial position
        
        // crosshair
        let crosshair = new Crosshair(this.settings);
        this.$element.append(crosshair.$element);

        this.objectManager.registerObject('collisionDetection', collisionDetection);
        this.objectManager.registerObject('world', world);
        this.objectManager.registerObject('camera', camera);
        this.objectManager.registerObject('controls', controls);
        this.objectManager.registerObject('crosshair', crosshair);
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

        this.lockPointer();

        this.objectManager.toggleObjects(true);
        this.running = true;
        this.animate();
    };

    this.pause = function() {
        this.pauseTime = performance.now();

        this.releasePointer();

        this.objectManager.toggleObjects(false);
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

        this.renderer.render(
            this.objectManager.getObject('world').scene,
            this.objectManager.getObject('camera')
        );
    }.bind(this);

    this.setupRenderer = function() {
        if (this.renderer) return;
        let {gameWidth, gameHeight} = this.settings;

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setClearColor(0xffffff);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(gameWidth, gameHeight);

        this.$element.append(this.renderer.domElement);
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