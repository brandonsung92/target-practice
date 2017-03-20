const $ = require('jquery');

const Crosshair = function(settings) {
	this.$element = $("<div>").addClass('crosshair');

	let {gameWidth, gameHeight, crosshairType} = settings;

	// use dot for now
	crosshairType = 'dot';

	if (crosshairType == 'dot') {
		this.$element.css('height', '5px');
		this.$element.css('width', '5px');
		this.$element.css('background-color', 'black');
	}
};

Crosshair.prototype.types = [
	'short crosshair',
	'dot'
];

module.exports = Crosshair;