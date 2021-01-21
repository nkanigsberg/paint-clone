/** Class representing a Cell */
class Cell {
  constructor(coordinates, active = false) {
    this.coordinates = coordinates;
    this.active = active;
  }
}


/** @namespace life */
const life = {};

// constants
life.CELL_WIDTH = 20;
life.CELL_HEIGHT = 20;
life.BOARD_WIDTH = 500;
life.BOARD_HEIGHT = 360;
life.NUM_COLUMNS = life.BOARD_WIDTH / life.CELL_WIDTH;
life.NUM_ROWS = life.BOARD_HEIGHT / life.CELL_HEIGHT;

life.canvas = document.getElementById("lifeCanvas");
life.ctx = life.canvas.getContext("2d");

/** The 2D array representation of the game board */
life.board = [];

/** Create 2D array and draw the board */
life.initializeBoard = () => {
  for (let y = 0; y < life.NUM_ROWS; y++) {
    life.board.push([]);
    for (let x = 0; x < life.NUM_COLUMNS; x++) {
      const coordinates = {
        y: y * life.CELL_HEIGHT,
        x: x * life.CELL_WIDTH,
      };

      life.board[y].push(new Cell(coordinates));
    }
  }
  console.log(life.board);

  life.drawBoard();
}

/** Draw the board on the canvas */
life.drawBoard = () => {
  const ctx = life.ctx;
  life.board.forEach(row => {
    row.forEach(cell => {
      ctx.strokeRect(cell.coordinates.x, cell.coordinates.y, life.CELL_WIDTH, life.CELL_HEIGHT);
      // ctx.beginPath();
      // ctx.rect(cell.coordinates.x, cell.coordinates.y, life.CELL_WIDTH, life.CELL_HEIGHT);
      // ctx.fillStyle = "#0000FF";
      // ctx.fill();
      // ctx.closePath();
    })
  })
}

/** Initialize the game */
life.init = () => {
  // set html canvas dimensions
  life.canvas.setAttribute('width', life.BOARD_WIDTH);
  life.canvas.setAttribute('height', life.BOARD_HEIGHT);
  
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