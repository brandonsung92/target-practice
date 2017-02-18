const EventHandler = function() {
    this.listeners = [];
    this.activeListeners = [];
};

EventHandler.prototype.setListeners = function(listeners) {
    this.listeners = listeners;
};

EventHandler.prototype.setupListeners = function() {
    for (let i = 0; i < this.listeners.length; i++) {
        let {type, element, listener} = this.listeners[i];
        element.addEventListener(type, listener, false);
        this.activeListeners.push(this.listeners[i]);
    }
};

EventHandler.prototype.removeListeners = function() {
    for (let i = 0; i < this.activeListeners.length; i++) {
        let {type, element, listener} = this.activeListeners[i];
        element.removeEventListener(type, listener);
    };
    this.activeListeners = [];
};

module.exports = EventHandler;