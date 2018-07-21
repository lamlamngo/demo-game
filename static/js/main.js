var GAME_WIDTH= window.innerWidth * window.devicePixelRatio;
var GAME_HEIGHT= window.innerHeight * window.devicePixelRatio;

var state = {
  init: init,
  preload: preload,
  update: update,
  create: create
}

var phaserGame = new Phaser.Game(
  GAME_WIDTH,
  GAME_HEIGHT,
  Phaser.AUTO,
  'container',
  state
);

var taxiGame = new TTTGame(phaserGame);

function init() {
  taxiGame.init();
}

function create() {
  taxiGame.create();
}

function preload() {
  taxiGame.preload();
}

function update() {
  taxiGame.update();
}
