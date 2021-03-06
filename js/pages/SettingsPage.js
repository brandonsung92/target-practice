const $ = require('jquery');
const Menu = require('../ui/Menu.js');
const Form = require('../ui/Form.js');
const FileHandler = require('../tools/FileHandler.js');

const SettingsPage = function(settings, onDone) {
    this.save = function() {
        if (this.form.validate()) {
            let values = this.form.getParsedValues();
            for (let id in values) {
                this.settings[id] = values[id];
            }
            this.onDone();
        }
    }.bind(this);

    this.cancel = function() {
        this.clearFields();
        this.onDone();
    }.bind(this);

    this.loadFromFile = function() {
        this.fileHandler.showOpenDialog();
    }.bind(this);

    this.saveToFile = function() {
        this.fileHandler.showSaveDialog();
    }.bind(this);

    this.clearFields = function() {
        this.form.clearFields();
    };

    this.fillFields = function() {
        this.form.fillFields(this.settings);
    };

    let setupMenu = function() {
        let menuOptions = {
            buttons: [
                {
                    id: 'save',
                    text: 'Save',
                    onClick: this.save
                },
                {
                    id: 'cancel',
                    text: 'Cancel',
                    onClick: this.cancel
                },
                {
                    id: 'loadFromFile',
                    text: 'Load Settings from File',
                    onClick: this.loadFromFile
                },
                {
                    id: 'saveToFile',
                    text: 'Save Settings to File',
                    onClick: this.saveToFile
                }
            ]
        };
        this.menu = new Menu(menuOptions);
    };

    let setupForm = function() {
        let greaterThanOrEqualToZero = function(value) {
            return parseFloat(value) >= 0;
        };
        let greaterThanZero = function(value) {
            return parseFloat(value) > 0;
        };
        let integerGreaterThanOrEqualToZero = function(value) {
            let isInteger = parseInt(value) == Number(value);
            return isInteger && Number(value) >= 0;
        };
        let integerGreaterThanOrEqualToOne = function(value) {
            let isInteger = parseInt(value) == Number(value);
            return isInteger && Number(value) > 0;
        };

        let formOptions = {
            onValidate: function(valid) {
                this.menu.disableButton('save', !valid);
                this.menu.disableButton('saveToFile', !valid);
            }.bind(this),
            groups: ['character', 'crosshair', 'environment', 'targets'],
            fields: [
                {
                    dataId: 'sensitivity',
                    label: 'Sensitivity (CS:GO sensitivity)',
                    validationInfo: 'Greater than 0.',
                    validate: greaterThanZero,
                    parse: parseFloat,
                    group: 'character'
                },
                {
                    dataId: 'movespeed',
                    label: 'Movespeed (cm/s)',
                    validationInfo: 'Greater than or equal to 0.',
                    validate: greaterThanOrEqualToZero,
                    parse: parseFloat,
                    group: 'character'
                },
                {
                    dataId: 'elevation',
                    label: 'Elevation (cm)',
                    validationInfo: 'Greater than or equal to 0.',
                    validate: greaterThanOrEqualToZero,
                    parse: parseFloat,
                    group: 'character'
                },
                {
                    dataId: 'rateOfFire',
                    label: 'Rate of Fire (shots per second)',
                    validationInfo: 'Greater than or equal to 0.',
                    validate: greaterThanOrEqualToZero,
                    parse: parseFloat,
                    group: 'character'
                },
                {
                    dataId: 'hfov',
                    label: 'Horizontal FoV (degrees)',
                    validationInfo: 'Greater than 0. Less than 360.',
                    validate: function(value) {
                        let v = parseFloat(value);
                        return (v > 0) && (v < 360);
                    },
                    parse: parseFloat,
                    group: 'character'
                },
                {
                    dataId: 'crosshairSize',
                    label: 'Size of the lines in the crosshair (px)',
                    validationInfo: 'Greater than or equal to 1. Integer.',
                    validate: integerGreaterThanOrEqualToOne,
                    parse: parseInt,
                    group: 'crosshair'
                },
                {
                    dataId: 'crosshairGap',
                    label: 'Gap between lines in crosshair (px) (hint: use an even number)',
                    validationInfo: 'Greater than or equal to 0. Integer.',
                    validate: integerGreaterThanOrEqualToZero,
                    parse: parseInt,
                    group: 'crosshair'
                },
                {
                    dataId: 'crosshairThickness',
                    label: 'Thickness of lines in crosshair (px) (hint: use an even number)',
                    validationInfo: 'Greater than or equal to 1. Integer.',
                    validate: integerGreaterThanOrEqualToOne,
                    parse: parseInt,
                    group: 'crosshair'
                },
                {
                    dataId: 'crosshairBorderThickness',
                    label: 'Border thickness of lines in crosshair (px)',
                    validationInfo: 'Greater than or equal to 0. Integer',
                    validate: integerGreaterThanOrEqualToZero,
                    parse: parseInt,
                    group: 'crosshair'
                },
                {
                    dataId: 'crosshairOpacity',
                    label: 'Opacity of lines in crosshair',
                    validationInfo: 'Between 0 and 1, inclusive.',
                    validate: function(value) {
                        let v = parseFloat(value);
                        return v >= 0 && v <= 1
                    },
                    parse: parseFloat,
                    group: 'crosshair'
                },
                {
                    dataId: 'targetDistance',
                    label: 'Target Distance (cm)',
                    validationInfo: 'Greater than 0.',
                    validate: greaterThanZero,
                    parse: parseFloat,
                    group: 'environment'
                },
                {
                    dataId: 'targetWallWidth',
                    label: 'Target Wall Width (cm)',
                    validationInfo: 'Greater than 0.',
                    validate: greaterThanZero,
                    parse: parseFloat,
                    group: 'environment'
                },
                {
                    dataId: 'targetWallHeight',
                    label: 'Target Wall Height (cm)',
                    validationInfo: 'Greater than 0.',
                    validate: greaterThanZero,
                    parse: parseFloat,
                    group: 'environment'
                },
                {
                    dataId: 'hitMarkerSize',
                    label: 'Hit Marker Size',
                    validationInfo: 'Greater than or equal to 0.',
                    validate: greaterThanOrEqualToZero,
                    parse: parseFloat,
                    group: 'environment'
                },
                {
                    dataId: 'hitMarkerDuration',
                    label: 'Hit Marker Duration (ms) (0 to turn off)',
                    validationInfo: 'Greater than or equal to 0.',
                    validate: greaterThanOrEqualToZero,
                    parse: parseFloat,
                    group: 'environment'
                },
                {
                    dataId: 'targetSize',
                    label: 'Target Radius (cm)',
                    validationInfo: 'Greater than 0.',
                    validate: greaterThanZero,
                    parse: parseFloat,
                    group: 'targets'
                },
                {
                    dataId: 'targetInterval',
                    label: 'Target Interval (ms)',
                    validationInfo: 'Greater than or equal to 0.',
                    validate: greaterThanOrEqualToZero,
                    parse: parseFloat,
                    group: 'targets'
                },
                {
                    dataId: 'maxTargets',
                    label: 'Max Targets',
                    validationInfo: 'Greater than or equal to 1. Integer.',
                    validate: integerGreaterThanOrEqualToOne,
                    parse: parseInt,
                    group: 'targets'
                },
                {
                    dataId: 'targetSpeed',
                    label: 'Target Speed (cm/s)',
                    validationInfo: 'Greater than or equal to 0.',
                    validate: greaterThanOrEqualToZero,
                    parse: parseFloat,
                    group: 'targets'
                },
                {
                    dataId: 'targetDirectionChangeInterval',
                    label: 'Time between target direction change (0 to turn off)',
                    validationInfo: 'Greater than or equal to 0.',
                    validate: greaterThanOrEqualToZero,
                    parse: parseFloat,
                    group: 'targets'
                },
                {
                    dataId: 'targetHitpoints',
                    label: 'Target Hit Points',
                    validationInfo: 'Greater than or equal to 1. Integer.',
                    validate: integerGreaterThanOrEqualToOne,
                    parse: parseInt,
                    group: 'targets'
                },
                {
                    dataId: 'targetHealInterval',
                    label: 'Target Heal Interval After Hit (ms) (0 to turn off)',
                    validationInfo: 'Greater than or equal to 0.',
                    validate: greaterThanOrEqualToZero,
                    parse: parseFloat,
                    group: 'targets'
                },
                {
                    dataId: 'targetLifespan',
                    label: 'Target Lifespan (ms) (0 for infinite)',
                    validationInfo: 'Greater than or equal to 0.',
                    validate: greaterThanOrEqualToZero,
                    parse: parseFloat,
                    group: 'targets'
                }
            ]
        }

        this.form = new Form(formOptions);
    };

    let setupElements = function() {
        this.$element = $("<div>").attr('id','settings').addClass('page');
        this.$element.append(this.form.$element);
        this.$element.append(this.menu.$element);
    };

    let setupFileHandler = function() {
        this.fileHandler = new FileHandler();
        this.fileHandler.addFilter({name: 'JSON', extensions: ['json']});
        this.fileHandler.setWriteMethods(function() {
            return JSON.stringify(this.form.getParsedValues());           
        }.bind(this));
        this.fileHandler.setReadMethods(function(data) {
            this.form.fillFields(JSON.parse(data));
        }.bind(this));
    };
    
    this.settings = settings;
    this.onDone = onDone;

    setupForm.call(this);
    setupMenu.call(this);
    setupElements.call(this);
    setupFileHandler.call(this);
};

module.exports = SettingsPage;