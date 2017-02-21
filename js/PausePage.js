const $ = require('jquery');
const Menu = require('./Menu.js');

const PausePage = function(onResume, onEnd) {
    this.updateStats = function(rawStats) {
        let {hits, attempts} = rawStats;
        this.$statElements.hits.text('Hits: ' + hits);
        this.$statElements.attempts.text('Total Shots: ' + attempts);

        let accuracy = attempts == 0 ? 0 : Math.floor(hits / attempts * 100);
        this.$statElements.accuracy.text('Accuracy: ' + accuracy + '%');
    };

    let setupMenu = function(onResume, onEnd) {
        let menuOptions = {
            buttons: [
                {
                    id: 'resume',
                    text: 'Resume',
                    onClick: onResume
                },
                {
                    id: 'end',
                    text: 'End Game',
                    onClick: onEnd
                }
            ]
        };
        this.menu = new Menu(menuOptions);
    };

    let setupElements = function() {
        this.$element = $("<div>").attr('id', 'pause');

        let $transparentLayer = $("<div>").addClass('transparent_layer');

        let $content = $("<div>").addClass('content');
        this.$statElements.hits = $("<div>").addClass('stat');
        this.$statElements.attempts = $("<div>").addClass('stat');
        this.$statElements.accuracy = $("<div>").addClass('stat');

        $content.append(this.$statElements.hits);
        $content.append(this.$statElements.attempts);
        $content.append(this.$statElements.accuracy);
        $content.append(this.menu.$element);

        this.$element.append($content);
        this.$element.append($transparentLayer);
    };

    this.$statElements = {};

    setupMenu.call(this, onResume, onEnd);
    setupElements.call(this);
};

module.exports = PausePage;