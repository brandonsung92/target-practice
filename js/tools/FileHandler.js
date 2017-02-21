const {dialog} = require('electron').remote;
const fs = require('fs');

const FileHandler = function() {
    this.filters = [];
    this.getWriteContent = null;
    this.onWriteError = null;
    this.readCallback = null;
    this.onReadError = null;
};

FileHandler.prototype.addFilter = function(filter) {
    this.filters.push(filter);
};

FileHandler.prototype.setReadMethods = function(callback, onError) {
    this.readCallback = callback;
    this.onReadError = onError;
};

FileHandler.prototype.setWriteMethods = function(getWriteContent, onError) {
    this.getWriteContent = getWriteContent;
    this.onWriteError = onError;
};

FileHandler.prototype.showOpenDialog = function() {
    dialog.showOpenDialog({
        filters: this.filters
    }, this.readFn.bind(this));
};

FileHandler.prototype.showSaveDialog = function() {
    dialog.showSaveDialog({
        filters: this.filters
    }, this.writeFn.bind(this));
};

FileHandler.prototype.readFn = function(filepath) {
    if (!filepath) return; // no file specified

    fs.readFile(filepath[0], 'utf-8', function(err, data) {
        if (err) {
            if (this.onReadError) this.onReadError(err);
            dialog.showMessageBox({
                type: 'error',
                message: 'Failed to read file!'
            });
            return;
        }
        this.readCallback(data);
    }.bind(this));
};

FileHandler.prototype.writeFn = function(filepath) {
    if (!filepath) return; // no file specified

    fs.writeFile(filepath, this.getWriteContent(), function(err) {
        if (err) {
            if (this.onWriteError) this.onWriteError(err);
            dialog.showMessageBox({
                type: 'error',
                message: 'Failed to write to file!'
            });
            return;
        }
        this.writeSuccess();
    }.bind(this));
};

FileHandler.prototype.writeSuccess = function() {
    dialog.showMessageBox({
        message: 'Successfully saved file!'
    });
};

module.exports = FileHandler;