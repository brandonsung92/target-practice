const ObjectManager = function() {
	this.objects = {};
};

ObjectManager.prototype.getObject = function(name) {
	return this.objects[name];
};

ObjectManager.prototype.registerObject = function(name, object) {
	if (!this.objects[name]) this.objects[name] = object;
};

ObjectManager.prototype.disposeObjects = function() {
	for (let name in this.objects) {
		if (this.objects[name].dispose) this.objects[name].dispose();
	}
	this.objects = {};
};

ObjectManager.prototype.updateObjects = function() {
	for (let name in this.objects) {
		if (this.objects[name].update) this.objects[name].update();
	}
};

ObjectManager.prototype.toggleObjects = function(toggle) {
	for (let name in this.objects) {
		if (this.objects[name].toggle) this.objects[name].toggle(toggle);
	}
};

ObjectManager.prototype.adjustTimers = function(time) {
	for (let name in this.objects) {
		if (this.objects[name].adjustTimers) this.objects[name].adjustTimers(time);
	}
};

module.exports = ObjectManager;