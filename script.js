/** Class representing a Cell */
class Cell {
  constructor(active = false) {
    this.active = active;
  }
}


/** @namespace life */
const life = {};

// constants
life.CELL_WIDTH = 10;
life.CELL_HEIGHT = 10;
life.BOARD_WIDTH = 500;
life.BOARD_HEIGHT = 350;

life.canvas = document.getElementById("lifeCanvas");
life.ctx = life.canvas.getContext("2d");

/** The 2D array representation of the game board */
life.board = [];


/** Create 2D array and draw the board */
life.initializeBoard = () => {
  const numColumns = life.BOARD_WIDTH / life.CELL_WIDTH;
  const numRows = life.BOARD_HEIGHT / life.CELL_HEIGHT;

  for (let y = 0; y < numRows; y++) {
    life.board.push([]);
    for (let x = 0; x < numColumns; x++) {
      life.board[y].push(new Cell);
    }
  }
  console.log(life.board);
}


life.init = () => {
  life.initializeBoard();

  // ctx.fillStyle = "#FF0000";
  // ctx.fillRect(0, 0, 150, 100);

  // ctx.beginPath();
  // ctx.rect(20, 40, 50, 50);
  // ctx.fillStyle = "#0000FF";
  // ctx.fill();
  // ctx.closePath();

  // ctx.beginPath();
  // ctx.arc(240, 160, 20, 0, Math.PI * 2, false);
  // ctx.fillStyle = "green";
  // ctx.fill();
  // ctx.closePath();

  // ctx.beginPath();
  // ctx.rect(160, 10, 100, 40);
  // ctx.strokeStyle = "rgba(0, 0, 255, 0.5)";
  // ctx.stroke();
  // ctx.closePath();

}



/* ==================== Document Ready ==================== */
(() => {
  life.init();
})()