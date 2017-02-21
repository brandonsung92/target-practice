const $ = require('jquery');
const Menu = require('./Menu.js');
const Form = require('./Form.js');
const FileHandler = require('./tools/FileHandler.js');

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
            fields: [
                {
                    dataId: 'sensitivity',
                    label: 'Sensitivity',
                    validationInfo: 'Greater than 0',
                    validate: greaterThanZero,
                    parse: parseFloat
                },
                {
                    dataId: 'elevation',
                    label: 'Elevation (cm)',
                    validationInfo: 'Greater than or equal to 0',
                    validate: greaterThanOrEqualToZero,
                    parse: parseFloat
                },
                {
                    dataId: 'movespeed',
                    label: 'Movespeed (cm/s)',
                    validationInfo: 'Greater than or equal to 0',
                    validate: greaterThanOrEqualToZero,
                    parse: parseFloat
                },
                {
                    dataId: 'hfov',
                    label: 'Horizontal FoV (degrees)',
                    validationInfo: 'Greater than 0. Less than 360',
                    validate: function(value) {
                        let v = parseFloat(value);
                        return (v > 0) && (v < 360);
                    },
                    parse: parseFloat
                },
                {
                    dataId: 'targetDistance',
                    label: 'Target Distance (cm)',
                    validationInfo: 'Greater than 0',
                    validate: greaterThanZero,
                    parse: parseFloat
                },
                {
                    dataId: 'targetWallScreenRatio',
                    label: 'Target Wall Screen Ratio',
                    validationInfo: 'Greater than 0',
                    validate: greaterThanZero,
                    parse: parseFloat
                },
                {
                    dataId: 'targetSize',
                    label: 'Target Radius (cm)',
                    validationInfo: 'Greater than 0',
                    validate: greaterThanZero,
                    parse: parseFloat
                },
                {
                    dataId: 'targetInterval',
                    label: 'Target Interval (ms)',
                    validationInfo: 'Greater than or equal to 0',
                    validate: greaterThanOrEqualToZero,
                    parse: parseFloat
                },
                {
                    dataId: 'maxTargets',
                    label: 'Max Targets',
                    validationInfo: 'Greater than or equal to 1. Integer',
                    validate: integerGreaterThanOrEqualToOne,
                    parse: parseInt
                },
                {
                    dataId: 'targetSpeed',
                    label: 'Target Speed (cm/s)',
                    validationInfo: 'Greater than or equal to 0',
                    validate: greaterThanOrEqualToZero,
                    parse: parseFloat
                },
                {
                    dataId: 'clipSize',
                    label: 'Clip Size (0 for unlimited)',
                    validationInfo: 'Greater than or equal to 0. Integer',
                    validate: integerGreaterThanOrEqualToZero,
                    parse: parseInt
                },
                {
                    dataId: 'rateOfFire',
                    label: 'Rate of Fire (shots per second)',
                    validationInfo: 'Greater than or equal to 0',
                    validate: greaterThanOrEqualToZero,
                    parse: parseFloat
                },
                {
                    dataId: 'targetHitpoints',
                    label: 'Target Hit Points',
                    validationInfo: 'Greater than or equal to 1. Integer',
                    validate: integerGreaterThanOrEqualToOne,
                    parse: parseInt
                },
                {
                    dataId: 'targetHealInterval',
                    label: 'Target Heal Interval After Hit (ms) (0 to turn off)',
                    validationInfo: 'Greater than or equal to 0',
                    validate: greaterThanOrEqualToZero,
                    parse: parseFloat
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