const $ = require('jquery');
const TargetPractice = require('./js/TargetPractice.js');

let browserProcess = new (function() {
    this.ipcRenderer = require('electron').ipcRenderer;

    this.start = function() {
        this.targetPractice = new TargetPractice(this);
        $('body').append(this.targetPractice.$element);
    };
})();

$(document).ready(function() {
    browserProcess.start();
});