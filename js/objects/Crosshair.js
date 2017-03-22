const $ = require('jquery');

const buildColorString = function(color) {
    let str = 'rgb(';
    str += color.r + ',';
    str += color.g + ',';
    str += color.b + ')';
    return str;
};

const Crosshair = function(settings) {
    let {
        crosshairColor,
        crosshairThickness,
        crosshairSize,
        crosshairGap,
        crosshairBorderThickness
    } = settings;

    this.$element = $("<div>").addClass('crosshair');

    let lines = [
        $("<div>"), // top
        $("<div>"), // right
        $("<div>"), // bottom
        $("<div>") // left
    ];

    // apply color to each line
    let colorStr = buildColorString(crosshairColor);
    for (let i = 0; i < lines.length; i++) {
        let width = i % 2 == 0 ? crosshairThickness : crosshairSize;
        let height = i % 2 == 0 ? crosshairSize : crosshairThickness;

        lines[i]
            .addClass('line')
            .css('background-color', colorStr)
            .css('height', height + 'px')
            .css('width', width + 'px')
            .css('border-width', crosshairBorderThickness + 'px');

        this.$element.append(lines[i]);
    }

    let top = lines[0];
    let right = lines[1];
    let bottom = lines[2];
    let left = lines[3];

    top.css('left', '-' + ((crosshairThickness / 2) + crosshairBorderThickness) + 'px');
    top.css('top', '-' + ((crosshairGap / 2) + (crosshairBorderThickness * 2) + crosshairSize)  + 'px');

    right.css('left', (crosshairGap / 2) + 'px');
    right.css('top', '-' + ((crosshairThickness / 2) + crosshairBorderThickness) + 'px');

    bottom.css('left', '-' + ((crosshairThickness / 2) + crosshairBorderThickness) + 'px');
    bottom.css('top', (crosshairGap / 2) + 'px');

    left.css('left', '-' + ((crosshairGap / 2) + (crosshairBorderThickness * 2) + crosshairSize) + 'px');
    left.css('top', '-' + ((crosshairThickness / 2) + crosshairBorderThickness) + 'px');
};

Crosshair.prototype.dispose = function() {
    this.$element.remove();
};

module.exports = Crosshair;