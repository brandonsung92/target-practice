const Crosshair = function(settings) {
	this.$element = $("<div>").addClass('crosshair');
};

Crosshair.prototype.types = [
	'short crosshair',
	'dot'
];

module.exports = Crosshair;