const $ = require('jquery');
const EventHandler = require('./EventHandler.js');

// Implement fields types other than text field in future
const Form = function(options) {

    this.getParsedValues = function() {
        let values = {};
        for (let id in this.fields) {
            let {$element, parse} = this.fields[id];
            let val = $element.find('input').val();
            values[id] = parse(val);
        }
        return values;
    };

    this.fillFields = function(data) {
        for (id in this.fields) {
            this.fields[id].$element.find('input').val(data[id]);
        }
        this.validate();
    };

    this.clearFields = function() {
        for (id in this.fields) {
            this.fields[id].$element.find('input').val('');
        }
    };

    this.validate = function() {
        let valid = true;
        for (let id in this.fields) {
            let {$element, validate} = this.fields[id];
            let val = $element.find('input').val();
            if (!validate(val)) {
                valid = false;
                $element.addClass('invalid');
            } else {
                $element.removeClass('invalid');
            }
        }

        this.onValidate(valid);
        return valid;
    }.bind(this);

    let setupFields = function(fieldsOptions) {
        let defaultOptions = {
            label: 'Label Text',
            value: '',
            element_class: '',
            validationInfo: '',
            validate: function(value) { return true },
            parse: function(value) { return value }
        };

        for (let i = 0; i < fieldsOptions.length; i++) {
            let options = $.extend({}, defaultOptions, fieldsOptions[i]);

            let $element = $("<div>").addClass('field');
            let $label = $("<span>").addClass('label').text(options.label);
            let $field = $("<input>").attr('type', 'text');
            let $validationInfo = $("<span>")
                .addClass('validation_info')
                .text(options.validationInfo);

            $element.append($label).append($field).append($validationInfo);

            this.fields[options.dataId] = {
                $element: $element,
                validate: options.validate,
                parse: options.parse
            };
        }
    };

    let setupElements = function(element_id) {
        this.$element = $("<div>").addClass('form');

        if (element_id) this.$element.attr('id', element_id);

        for (let id in this.fields) {
            this.$element.append(this.fields[id].$element)
        }
    };

    let setupListeners = function() {
        this.eventHandler = new EventHandler();
        this.eventHandler.setListeners([
            {
                type: 'input',
                element: this.$element.get(0),
                listener: this.validate
            }
        ]);
        this.eventHandler.setupListeners();
    };

    this.onValidate = options.onValidate;

    this.fields = {};

    setupFields.call(this, options.fields);
    setupElements.call(this, options.element_id);
    setupListeners.call(this);
};

module.exports = Form;