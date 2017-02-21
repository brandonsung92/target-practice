const $ = require('jquery');
const Game = require('./Game.js');
const Menu = require('./Menu.js');
const SettingsPage = require('./SettingsPage.js');
const EventHandler = require('./tools/EventHandler.js');

const TargetPractice = function(browserProcess, settings) {
    let defaultSettings = {
        gameWidth: window.innerWidth,
        gameHeight: window.innerHeight,
        sensitivity: 1,
        elevation: 185,
        movespeed: 550,
        hfov: 103,
        targetDistance: 3000,
        targetWallScreenRatio: 0.4,
        targetColor: 0xFF0000,
        targetSize: 50,
        targetInterval: 500,
        maxTargets: 5,
        targetSpeed: 0,
        clipSize: 0,
        rateOfFire: 8.8,
        reloadDuration: 500,
        targetHitpoints: 5,
        targetHealInterval: 500
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
        this.game.setup();
        this.game.start();
        this.setState('running');
    };

    let setupMainMenu = function() {
        let mainMenuOptions = {
            element_id: 'main_menu',
            buttons: [
                {
                    id: 'start',
                    text: 'Start',
                    onClick: function() {
                        this.startGame();
                    }.bind(this)
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

    let setupGame = function() {
        this.game = new Game(this.settings);
    };

    let setupSettingsPage = function() {
        this.settingsPage = new SettingsPage(this.settings, function() {
            this.setState('main_menu');
        }.bind(this));
    };

    let setupElements = function() {
        this.$element = $("<div>").attr('id', 'target_practice');
        this.$element.append(this.mainMenu.$element);
        this.$element.append(this.game.$element);
        this.$element.append(this.settingsPage.$element);
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
                                this.game.pause();
                                this.setState('paused');
                                break;
                            case 'paused':
                                this.game.resume();
                                this.setState('running');
                            // do nothing for rest of states
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
    setupSettingsPage.call(this);
    setupElements.call(this);
    setupListeners.call(this);

    this.setState('main_menu');
};

module.exports = TargetPractice;