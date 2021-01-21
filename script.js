/** Class representing a Cell */
class Cell {
  constructor(coordinates, active = false) {
    this.coordinates = coordinates;
    this.active = active;
  }

  toggleActive() {
    this.active = !this.active;
    life.drawBoard();
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

  // clear canvas before each draw
  ctx.clearRect(0, 0, life.canvas.width, life.canvas.height);

  // draw each cell
  life.board.forEach(row => {
    row.forEach(cell => {
      if (cell.active) {
        ctx.fillRect(cell.coordinates.x, cell.coordinates.y, life.CELL_WIDTH, life.CELL_HEIGHT);
      } else {
        ctx.strokeRect(cell.coordinates.x, cell.coordinates.y, life.CELL_WIDTH, life.CELL_HEIGHT);
      }
    })
  })
}

// /** add hover effect when cursor over a cell */
// life.mouseMoveHandler = e => {
//   const relativeX = e.clientX - life.canvas.offsetLeft;
//   if (relativeX > 0 && relativeX < life.canvas.width) {
//     life.ctx.fillRect(relativeX, 25, life.CELL_WIDTH, life.CELL_HEIGHT);
//   }
// }

/** toggle whether cell is active on click */
life.mouseDownHandler = e => {
  // only trigger if clicking on canvas
  if (e.target === life.canvas) {
    // get cell position from click
    const cellX = Math.floor((e.clientX - life.canvas.offsetLeft) / life.CELL_WIDTH);
    const cellY = Math.floor((e.clientY - life.canvas.offsetTop) / life.CELL_HEIGHT);
    console.log('x:', cellX, 'y:', cellY);

    // toggle cell active
    life.board[cellY][cellX].toggleActive();
  }
}

/** Initialize the game */
life.init = () => {
  // set html canvas dimensions
  life.canvas.setAttribute('width', life.BOARD_WIDTH);
  life.canvas.setAttribute('height', life.BOARD_HEIGHT);

  // initialize and draw the board
  life.initializeBoard();

  // mouse listeners
  // document.addEventListener("mousemove", life.mouseMoveHandler, false);
  document.addEventListener("mousedown", life.mouseDownHandler, false);

}



/* ==================== Document Ready ==================== */
(() => {
  life.init();
})()