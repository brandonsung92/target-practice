const $ = require('jquery');
const Game = require('./Game.js');
const Menu = require('./ui/Menu.js');
const SettingsPage = require('./pages/SettingsPage.js');
const PausePage = require('./pages/PausePage.js');
const EventHandler = require('./tools/EventHandler.js');

const TargetPractice = function(browserProcess, settings) {
    let defaultSettings = {
        gameWidth: window.innerWidth,
        gameHeight: window.innerHeight,
        targetColor: 0xFF0000,
        sensitivity: 1,
        elevation: 600,
        movespeed: 550,
        rateOfFire: 8.8,
        hfov: 103,
        targetDistance: 2500,
        targetWallScreenRatio: 0.3,
        hitMarkerSize: 25,
        hitMarkerDuration: 1000,
        targetSize: 50,
        targetInterval: 500,
        maxTargets: 5,
        targetSpeed: 0,
        targetDirectionChangeInterval: 0,
        targetHitpoints: 1,
        targetHealInterval: 0,
        targetLifespan: 0,
        crosshairColor: {
            r: 0,
            g: 255,
            b: 0
        },
        crosshairSize: 10,
        crosshairGap: 4,
        crosshairThickness: 2,
        crosshairBorderThickness: 1,
        crosshairOpacity: 0.8
    };

    this.setState = function(state) {
        let possibleStates = [
            'running',
            'paused',
            'main_menu',
            'settings'
        ];

        if (state == this.state || !possibleStates.includes(state)) return;
        
        this.$element.removeClass(possibleStates.join(' '));
        this.$element.addClass(state);
        this.state = state;
    };

    this.startGame = function() {
        this.game.start();
        this.setState('running');
    }.bind(this);

    this.pauseGame = function() {
        this.game.pause();
        this.pausePage.updateStats(this.game.getStats());
        this.setState('paused');
    }.bind(this);

    this.resumeGame = function() {
        this.game.resume();
        this.setState('running');
    }.bind(this);

    this.endGame = function() {
        this.game.end();
        this.setState('main_menu');
    }.bind(this);

    let setupMainMenu = function() {
        let mainMenuOptions = {
            element_id: 'main_menu',
            buttons: [
                {
                    id: 'start',
                    text: 'Start',
                    onClick: this.startGame
                },
                {
                    id: 'settings',
                    text: 'Settings',
                    onClick: function() {
                        this.settingsPage.fillFields();
                        this.setState('settings');
                    }.bind(this)
                },
                {
                    id: 'quit',
                    text: 'Quit',
                    onClick: function() {
                        this.browserProcess.ipcRenderer.send('quit');
                    }.bind(this)
                }
            ]
        };
        this.mainMenu = new Menu(mainMenuOptions);
    };

    let setupPausePage = function() {
        this.pausePage = new PausePage(this.resumeGame, this.endGame);
    };

    let setupSettingsPage = function() {
        let onDone = function() {
            this.setState('main_menu');
        }.bind(this);
        this.settingsPage = new SettingsPage(this.settings, onDone);
    };

    let setupGame = function() {
        this.game = new Game(this.settings);
    };

    let setupElements = function() {
        this.$element = $("<div>").attr('id', 'target_practice');
        this.$element.append(this.mainMenu.$element);
        this.$element.append(this.pausePage.$element);
        this.$element.append(this.settingsPage.$element);
        this.$element.append(this.game.$element);
    };

    let setupListeners = function() {
        if (!this.eventHandler) this.eventHandler = new EventHandler();
        this.eventHandler.setListeners([
            {
                type: 'keydown',
                element: document,
                listener: function(e) {
                    if (e.keyCode == 27) { // escape
                        switch (this.state) {
                            case 'running':
                                this.pauseGame();
                                break;
                            case 'paused':
                                this.resumeGame();
                        }
                    }
                }.bind(this)
            }
        ]);
        this.eventHandler.setupListeners();
    };

    // INITIALIZE
    this.browserProcess = browserProcess;
    this.settings = $.extend({}, defaultSettings, settings);

    setupMainMenu.call(this);
    setupGame.call(this);
    setupPausePage.call(this);
    setupSettingsPage.call(this);
    setupElements.call(this);
    setupListeners.call(this);

    this.setState('main_menu');
};

module.exports = TargetPractice;