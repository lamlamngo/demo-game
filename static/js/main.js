var GAME_WIDTH=480;
var GAME_HEIGHT=640;

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
