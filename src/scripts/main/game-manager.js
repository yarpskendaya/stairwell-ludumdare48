var GameManager = pc.createScript('gameManager');

GameManager.attributes.add('gameOverScreen', {
    type: 'entity',
    description: 'The screen that should start when the game is lost'
});

GameManager.prototype.initialize = function () {
    this.app.on('lose', this.onLose, this);
};

GameManager.prototype.postInitialize = function () {
    this.app.fire('fade', false);
};

GameManager.prototype.onLose = function () {
    this.app.fire('fade', true);
    this.gameOverScreen.enabled = true;
};