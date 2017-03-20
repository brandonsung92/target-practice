const $ = require('jquery');

const Crosshair = function(settings) {
	this.$element = $("<div>").addClass('crosshair');

	// use dot for now
	this.crosshairBuilders.dot(this.$element, settings);
};

Crosshair.prototype.getTypes = function() {
	let types = [];
	for (let type in Crosshair.prototype.crosshairBuilders) {
		types.push(type);
	}
	return types;
};

Crosshair.prototype.crosshairBuilders = {
	'short crosshair': function($element, settings) {
		
	},
	'dot': function($element, settings) {
		$element.css('height', settings.crosshairRadius);
		$element.css('width', settings.crosshairRadius);
		$element.css('border-radius', settings.crosshairRadius);
		$element.css('background-color', 'rgb(0,255,255)');

		if (settings.crosshairBorder) {
			// use black for border color for now
			$element.css('border', 'solid 1px');
			$element.css('border-color', 'black')
		}
	}
};

module.exports = Crosshair;