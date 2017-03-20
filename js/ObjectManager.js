const ObjectManager = function() {
	this.objects = {};
};

ObjectManager.prototype.registerObject = function(name, object) {
	if (!this.objects[name]) this.objects[name] = object;
};

ObjectManager.prototype.clearObjects = function() {
	this.objects = {};
};

ObjectManager.prototype.disposeObjects = function() {
	for (let name in this.objects) {
		if (this.objects[name].dispose) this.objects[name].dispose();
	}
};

module.exports = ObjectManager;