var TTTGame = (function() {

  var ANGLE = 26.55;
  var TILE_WIDTH = 68;
  var TILE_HEIGHT = 63;
  var SPEED = 5;
  var TAXI_START_X = 30;
  var JUMP_HEIGHT = 7;

  function TTTGame(phaserGame) {
    this.hasStarted = false;
    this.counter = undefined;
    this.scoreCount = 0;
    this.game = phaserGame;
    this.mouseTouchDown = false;
    this.arrTiles = [];
    this.taxi = undefined;
    this.taxiX = TAXI_START_X;
    this.numberOfIterations = 0;
    this.roadStartPosition = {
      x: GAME_WIDTH + 100,
      y: GAME_HEIGHT/2 - 100
    }
    this.jumpSpeed = JUMP_HEIGHT;
    this.isJumping = false;
    this.currentJumpHeight = 0;

    this.roadCount = 0;
    this.nextObstacleIndex = 0;
    this.arrObstacles = [];
    this.isDead = false;
    this.gameOverGraphic = undefined;
    this.taxiTargetX = 0;

    this.nextQueueIndex = 0;
    this.rightQueue = [];
    this.tapToStart = undefined;

    this.sfx = {

    };
  }

  TTTGame.prototype.calculateNextObstacleIndex = function () {
    var minimumOffset = 3;
    var maximumOffset = 10;
    var num = Math.random() * (maximumOffset - minimumOffset);
    this.nextObstacleIndex = this.roadCount + Math.round(num) + minimumOffset;
  };

  TTTGame.prototype.addTileAtIndex = function (sprite, index) {
    sprite.anchor.setTo(0.5,1.0);
    var middle = 4;
    var offset = index - middle;

    sprite.x = this.roadStartPosition.x;
    sprite.y = this.roadStartPosition.y + offset * TILE_HEIGHT;
    this.arrTiles[index].addChildAt(sprite,0);
  };

  TTTGame.prototype.createTileAtIndex = function (tile, index) {
    var sprite = new Phaser.Sprite(this.game, 0 , 0, 'gameAssets', tile);

    this.addTileAtIndex(sprite, index);

    return sprite;
  };

  TTTGame.prototype.rightQueueorEmpty = function () {
    var retval = 'empty';

    if (this.rightQueue.length !== 0) {
      retval = this.rightQueue[0][0];
      this.rightQueue[0].splice(0,1);
      if (this.rightQueue[0].length === 0) {
        this.rightQueue.splice(0,1);
      };
    };
    return retval;
  };

  TTTGame.prototype.generateRoad = function () {
    this.roadCount++;
    var tile = 'tile_road_1';
    var isObstacle = false;

    if (this.roadCount > this.nextObstacleIndex && this.hasStarted) {
      tile = 'obstacle_1';
      isObstacle = true;
      this.calculateNextObstacleIndex();
    };

    this.addTileAtIndex(new TTTBuilding(this.game, 0, 0), 0);
    this.addTileAtIndex(new TTTBuilding(this.game, 0, 0), 3);
    this.createTileAtIndex('tile_road_1', 1);
    this.createTileAtIndex('empty', 2);
    this.createTileAtIndex('empty', 5);
    this.createTileAtIndex('empty', 7);
    this.createTileAtIndex('water', 8);
    this.createTileAtIndex(this.rightQueueorEmpty(), 6);

    var sprite = this.createTileAtIndex(tile, 4);

    // // var sprite = this.game.add.sprite(0,0, 'tile_road_1');
    // var sprite = new Phaser.Sprite(this.game, 0, 0, tile);
    // //this.game.world.addChildAt(sprite, 0);
    // this.arrTiles[4].addChildAt(sprite, 0);
    // sprite.anchor.setTo(0.5,1.0);
    // sprite.x = this.roadStartPosition.x;
    // sprite.y = this.roadStartPosition.y;
    this.arrTiles.push(sprite);

    if (isObstacle) {
      this.arrObstacles.push(sprite);
    };
  };

  TTTGame.prototype.checkObstacles = function () {
    var i = this.arrObstacles.length - 1;

    while (i >= 0) {
      var sprite = this.arrObstacles[i];

      if (sprite.x < this.taxi.x - 10) {
        this.scoreCount++;
        this.sfx.score.play();
        this.counter.setScore(this.scoreCount, true);
        this.arrObstacles.splice(i,1);
        //sprite.destroy();
      };

      var dx = sprite.x - this.taxi.x;
      dx = Math.pow(dx,2);
      var dy = (sprite.y - sprite.height/2) - this.taxi.y;
      dy = Math.pow(dy,2);
      var distance = Math.sqrt(dx + dy);

      if (distance < 25) {
        console.log(distance);
        if (!this.isDead) {
          this.gameOver();
        };
      };
      i--;
    }
  };

  TTTGame.prototype.calculateTaxiPosition = function () {
    var multipler = 0.025;
    var num = TAXI_START_X + (this.scoreCount * GAME_WIDTH * multipler);

    if (num > GAME_WIDTH * 0.60) {
      num = 0.60 * GAME_WIDTH;
    };

    this.taxiTargetX = num;
    if (this.taxiX < this.taxiTargetX) {
      var easing = 15;
      this.taxiX += (this.taxiTargetX - this.taxiX) / easing;
    }
  };

  TTTGame.prototype.reset = function () {
    this.taxiTargetX = 0;
    this.scoreCount = 0;
    this.counter.setScore(0, false);
    this.isDead = false;
    this.hasStarted = false;

    this.jumpSpeed = JUMP_HEIGHT;
    this.isJumping = false;
    this.currentJumpHeight = 0;

    this.nextObstacleIndex = 0;
    this.arrObstacles = [];
    this.mouseTouchDown = false;

    this.game.tweens.removeFrom(this.taxi);
    this.taxi.rotation = 0;

    this.taxiX = TAXI_START_X;

    this.gameOverGraphic.visible = false;
    this.tapToStart.visible = true;
    this.tapToStart.blinker.startBlinking();
  };


  TTTGame.prototype.gameOver = function () {
    this.sfx.hit.play();
    this.gameOverGraphic.visible = true;
    this.isDead = true;
    this.tapToStart.visible = true;
    this.tapToStart.blinker.startBlinking();
    this.hasStarted = false;
    this.arrObstacles = [];

    var dieSpeed = SPEED / 10;
    var tween_1 = this.game.add.tween(this.taxi);
    tween_1.to({
      x: this.taxi.x + 20,
      y: this.taxi.y - 40
    }, 300 * dieSpeed, Phaser.Easing.Quadratic.Out);
    //
    var tween_2 = this.game.add.tween(this.taxi);
    tween_2.to({
      y: GAME_HEIGHT + 40
    }, 1000 * dieSpeed, Phaser.Easing.Quadratic.In);

    tween_1.chain(tween_2);
    tween_1.start();

    var tween_rotate = this.game.add.tween(this.taxi);
    tween_rotate.to({
      angle: 200
    }, 1300 * dieSpeed, Phaser.Easing.Linear.None);
    tween_rotate.start();
  };

  TTTGame.prototype.moveTilesWithSpeed = function (speed) {
    var i = this.arrTiles.length -1;
    while (i >= 0) {
      var children = this.arrTiles[i].children;
      var j = children.length - 1;
      while (j >= 0) {
        var sprite = children[j];
        sprite.x -= speed * Math.cos (ANGLE * Math.PI / 180);
        sprite.y += speed * Math.sin (ANGLE * Math.PI / 180);

        if (sprite.x < -120) {
          this.arrTiles[i].removeChild(sprite);
          sprite.destroy();
        };
        j--;
      }
      i--;
    };
  };

  TTTGame.prototype.calculatePositionOnRoadWithXPosition = function (xpos) {
    var adjacent = this.roadStartPosition.x - xpos;
    var alpha = ANGLE * Math.PI / 180;
    var hypotenuse = adjacent / Math.cos(alpha);
    var opposite = Math.sin(alpha) * hypotenuse;
    return {
      x: xpos,
      y: opposite + this.roadStartPosition.y - 57
    }
  };

  TTTGame.prototype.init = function () {
    this.game.stage.backgroundColor = '#9bd3e1';
    this.game.add.plugin(Phaser.Plugin.Debug);
  };

  TTTGame.prototype.generateGreenQueue = function () {
    var retval = [];

    retval.push('green_start');
    var middle = Math.round(Math.random() * 3);
    var i =0;
    while (i < middle) {
      retval.push('green_middle_empty');
      i++;
    }

    var numberOfTrees = Math.round(Math.random() * 3);
    i = 0;
    while (i < numberOfTrees) {
      retval.push('green_middle_tree');
      i++;
    }

    i = 0;
    while (i < middle) {
      retval.push('green_middle_empty');
      i++;
    }
    retval.push('green_end');
    return retval;
  };

  TTTGame.prototype.preload = function () {
    this.game.load.audio('hit', 'static/audio/hit.wav');
    this.game.load.audio('jump', 'static/audio/jump.wav');
    this.game.load.audio('score', 'static/audio/score.wav');

    this.game.load.atlasJSONArray('gameAssets','static/img/spritesheets/gameAssets.png','static/img/spritesheets/gameAssets.json');
    this.game.load.atlasJSONArray('playButton','static/img/spritesheets/playButton.png','static/img/spritesheets/playButton.json');
    this.game.load.atlasJSONArray('numbers','static/img/spritesheets/numbers.png','static/img/spritesheets/numbers.json');
  };

  TTTGame.prototype.taxiJump = function () {
    this.currentJumpHeight -= this.jumpSpeed;
    this.jumpSpeed -= 0.5;
    if (this.jumpSpeed < -JUMP_HEIGHT) {
      this.isJumping = false;
      this.jumpSpeed = JUMP_HEIGHT;
    };
  };

  TTTGame.prototype.create = function () {
    this.sfx = {
      hit: this.game.add.audio('hit'),
      jump: this.game.add.audio('jump'),
      score: this.game.add.audio('score')
    };
    var numberOfLayers = 9;
    for (var i = 0; i < numberOfLayers; i++){
        var layer = new Phaser.Sprite(this.game, 0, 0);
        this.game.world.addChild(layer);
        this.arrTiles.push(layer);
    };

    this.generateRoad();

    var x = this.game.world.centerX;
    var y = this.game.world.centerY;
    this.taxi = new Phaser.Sprite(this.game, x, y, 'gameAssets', 'taxi');
    this.taxi.anchor.setTo(0.5, 1.0);
    this.game.add.existing(this.taxi);

    var x = this.game.world.centerX;
    var y = this.game.world.centerY - 50;

    this.gameOverGraphic = new Phaser.Sprite(this.game, x, y, 'gameAssets', 'gameOver');
    this.gameOverGraphic.anchor.setTo(0.5,0.5);

    this.game.add.existing(this.gameOverGraphic);
    this.counter = new TTTCounter(this.game, 0 , 0);
    this.counter.visible = false;
    this.game.add.existing(this.counter);
    this.counter.x = this.game.world.centerX;
    this.counter.y = 40;

    this.tapToStart = this.game.add.sprite(0,0,'gameAssets','tapToStart');
    this.tapToStart.anchor.setTo(0.5,0.5);
    this.tapToStart.x = this.game.world.centerX;
    this.tapToStart.y = this.game.world.height - 60;
    this.tapToStart.blinker = new TTTBlinker(this.game, this.tapToStart);
    this.reset();
  };

  TTTGame.prototype.startGame = function () {
    this.hasStarted = true;
    this.tapToStart.visible = false;
    this.counter.visible = true;
    this.tapToStart.blinker.stopBlinking();
  };

  TTTGame.prototype.touchDown = function () {
    this.mouseTouchDown = true;

    if (!this.hasStarted) {
        this.startGame();
    };

    if (this.isDead) {
      this.reset();
      return;
    };

    if (!this.isJumping) {
      this.isJumping = true;
      this.sfx.jump.play();
    };
  };

  TTTGame.prototype.touchUp = function () {
    this.mouseTouchDown = false;
  };

  TTTGame.prototype.generateRightQueue = function () {
    var minimumOffset = 5;
    var maximumOffset = 10;
    var num = Math.random() * (maximumOffset - minimumOffset);
    this.nextQueueIndex = this.roadCount + Math.round(num) + minimumOffset;
    this.rightQueue.push(this.generateGreenQueue());
  };

  TTTGame.prototype.update = function () {
    this.numberOfIterations++;
    if (this.numberOfIterations > TILE_WIDTH/SPEED) {
      this.numberOfIterations = 0;
      this.generateRoad();
    };

    if (this.game.input.activePointer.isDown) {
      if (!this.mouseTouchDown) {
        this.touchDown();
      };
    } else{
      if (this.mouseTouchDown) {
        this.touchUp();
      };
    };

    if (this.roadCount > this.nextQueueIndex) {
      this.generateRightQueue();
    };

    if (!this.isDead) {
      if (this.isJumping) {
        this.taxiJump();
      };

      this.calculateTaxiPosition();

      var pointOnRoad = this.calculatePositionOnRoadWithXPosition(this.taxiX);

      this.taxi.x = pointOnRoad.x;
      this.taxi.y = pointOnRoad.y + this.currentJumpHeight;

      this.checkObstacles();

    };

    this.moveTilesWithSpeed(SPEED);
  };

  return TTTGame;
}) ();
