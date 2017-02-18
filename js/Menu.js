const $ = require('jquery');

const Menu = function(options) {

    // MenuButton Class
    const MenuButton = function(options) {
        const defaultOptions = {
            text: 'Button Text',
            disabled: false,
            onClick: function() {}
        };

        this.options = $.extend({}, defaultOptions, options);
        this.disabled = this.options.disabled;

        this.onClick = function() {
            if (!this.disabled) {
                this.options.onClick();
            }
        }.bind(this);

        this.$element = $("<div>")
            .addClass('button')
            .text(this.options.text)
            .click(this.onClick);

        this.setDisabled(this.options.disabled);
    };

    MenuButton.prototype.setDisabled = function(disabled) {
        this.$element.toggleClass('disabled', disabled);
        this.disabled = disabled;
    };

    let setupButtons = function(buttonsOptions) {
        for (let i = 0; i < buttonsOptions.length; i++) {
            let button = new MenuButton(buttonsOptions[i]);
            this.buttons[buttonsOptions[i].id] = button;
        }
    };

    let setupElements = function(element_id, element_class) {
        this.$element = $("<div>").addClass('menu');
        if (element_id) this.$element.attr('id', element_id);
        if (element_class) this.$element.attr(element_class);

        for (let id in this.buttons) {
            this.$element.append(this.buttons[id].$element);
        }
    };

    this.buttons = {};

    // Append buttons to main menu
    setupButtons.call(this, options.buttons);
    setupElements.call(this, options.element_id, options.element_class);
};

Menu.prototype.active = false
Menu.prototype.activate = function(active) {
    this.$element.toggleClass('active', active);
    this.active = active;
};
Menu.prototype.disableButton = function(id, disabled) {
    let button = this.buttons[id];
    if (typeof disabled === 'undefined') disabled = true;
    if (button) {
        button.setDisabled(disabled);
    }
};

module.exports = Menu;