/** Class representing a Cell */
class Cell {
  constructor(coordinates, active = false, hover = false) {
    this.coordinates = coordinates;
    this.active = active;
    this.hover = hover;
  }

  /** Toggle whether or not this cell is active */
  toggleActive() {
    this.active = !this.active;
    life.drawBoard();
  }

  /** if this cell isn't already hovered, enable its hover state (and disable other cell hover states) */
  enableHover() {
    if (!this.hover) {
      this.hover = true;
      life.drawBoard();
      
      // console.log(life.previousHover);

      // if another cell is currently hovered - disable its hover
      if (life.previousHover.coordinates) {
        // console.log('life.previousHover.length');
        const prevCoords = life.previousHover.coordinates;

        life.board[prevCoords.y][prevCoords.x].disableHover();
      }

      // set this cell as the previously hovered cell
      life.previousHover = this;
    }
  }

  /** disable this cell's hover state */
  disableHover() {
    console.log('disable hover');
    if (this.hover) {
      this.hover = false;
      life.drawBoard();
    }
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

/** The previously hovered cell (so can disable hover) */
life.previousHover = {};

/** Create 2D array and draw the board */
life.initializeBoard = () => {
  for (let y = 0; y < life.NUM_ROWS; y++) {
    life.board.push([]);
    for (let x = 0; x < life.NUM_COLUMNS; x++) {
      const coordinates = {
        y,
        x,
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
      const coordX = cell.coordinates.x * life.CELL_WIDTH;
      const coordY = cell.coordinates.y * life.CELL_HEIGHT;

      if (cell.active) {
        ctx.fillRect(coordX, coordY, life.CELL_WIDTH, life.CELL_HEIGHT);
      } else {
        ctx.strokeRect(coordX, coordY, life.CELL_WIDTH, life.CELL_HEIGHT);
      }

      if (cell.hover) {
        ctx.fillStyle = 'rgba(252, 186, 3, 0.5)';
        ctx.fillRect(coordX, coordY, life.CELL_WIDTH, life.CELL_HEIGHT);
      }
    })
  })
}



/** add hover effect when cursor over a cell */
life.mouseMoveHandler = e => {
  // get cell position
  const cellX = Math.floor((e.clientX - life.canvas.offsetLeft) / life.CELL_WIDTH);
  const cellY = Math.floor((e.clientY - life.canvas.offsetTop) / life.CELL_HEIGHT);

  life.board[cellY][cellX].enableHover();
}

/** toggle whether cell is active on click */
life.mouseDownHandler = e => {
  // get cell position from click
  const cellX = Math.floor((e.clientX - life.canvas.offsetLeft) / life.CELL_WIDTH);
  const cellY = Math.floor((e.clientY - life.canvas.offsetTop) / life.CELL_HEIGHT);

  // toggle cell active
  life.board[cellY][cellX].toggleActive();
}

/** Initialize the game */
life.init = () => {
  // set html canvas dimensions
  life.canvas.setAttribute('width', life.BOARD_WIDTH);
  life.canvas.setAttribute('height', life.BOARD_HEIGHT);

  // initialize and draw the board
  life.initializeBoard();

  // mouse listeners
  life.canvas.addEventListener("mousemove", life.mouseMoveHandler, false);
  life.canvas.addEventListener("mousedown", life.mouseDownHandler, false);

}



/* ==================== Document Ready ==================== */
(() => {
  life.init();
})()