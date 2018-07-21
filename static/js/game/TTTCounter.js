var TTTCounter = (function(){

  function TTTCounter(phaserGame, x , y) {
    Phaser.Sprite.call(this, phaserGame, x, y);

    this.tween = undefined;
    this.score = '';
  }

  TTTCounter.prototype= Object.create(Phaser.Sprite.prototype);
  TTTCounter.prototype.constructor = TTTCounter;


  TTTCounter.prototype.setScore = function (score, animated) {
    this.score = score + '';
    this.render();

    if (animated) {
      this.shake();
    };
  };

  TTTCounter.prototype.render = function () {
    if (this.children.length !== 0) {
      this.removeChildren();
    }

    var xpos = 0;
    var totalWidth = 0;

    for (var i = 0; i < this.score.length; i++) {
      var myChar = this.score.charAt(i);
      var sprite = new Phaser.Sprite(this.game, 0,0, 'numbers', myChar);
      sprite.x = xpos;
      xpos += sprite.width + 2;
      totalWidth += sprite.width + 2;
      this.addChild(sprite);
    };

    totalWidth -= 2;
    for (i = 0; i < this.children.length; i++) {
      var child = this.children[i]
      child.x -= totalWidth /2 ;
    };
  };

  TTTCounter.prototype.shake = function () {
    this.tween = this.game.add.tween(this);
    this.tween.to({
      y: [this.y +5, this.y ]
    }, 200, Phaser.Easing.Quadratic.Out);
    this.tween.start();
  };

  return TTTCounter;
})();
