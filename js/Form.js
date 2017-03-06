const $ = require('jquery');
const EventHandler = require('./tools/EventHandler.js');

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

    let setupGroups = function(groups) {
        if (!groups) return;
        for (let i = 0; i < groups.length; i++) {
            this.groups[groups[i]] = [];
        }
    };

    let setupFields = function(fieldsOptions) {
        let defaultOptions = {
            label: 'Label Text',
            value: '',
            element_class: '',
            validationInfo: '',
            group: null,
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
                parse: options.parse,
                group: options.group
            };

            if (options.group != null) {
                this.groups[options.group].push(this.fields[options.dataId]);
            }
        }
    };

    let setupElements = function(element_id) {
        this.$element = $("<div>").addClass('form');

        if (element_id) this.$element.attr('id', element_id);

        for (let id in this.fields) {
            if (this.fields[id].group === null) this.$element.append(this.fields[id].$element)
        }

        for (let group in this.groups) {
            let $group = $("<div>").addClass('group');
            let $header = $("<div>").addClass('group_header');
            let $fields = $("<div>").addClass('group_fields');

            $header.text(group.toUpperCase());
            $group.append($header).append($fields);
            for (let i = 0; i < this.groups[group].length; i++) {
                $fields.append(this.groups[group][i].$element);
            }
            this.$element.append($group);
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

    this.groups = {};
    this.fields = {};

    setupGroups.call(this, options.groups);
    setupFields.call(this, options.fields);
    setupElements.call(this, options.element_id);
    setupListeners.call(this);
};

module.exports = Form;