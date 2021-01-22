// ========================== Cell ======================== //

/** Class representing a Cell */
class Cell {
  constructor(coordinates, active = false) {
    this.coordinates = coordinates;
    this.active = active;
  }

  styles = {
    default: '#FFFFFF',
    active: '#000000',
  }

  /** Toggle whether or not this cell is active */
  toggleActive() {
    this.active = !this.active;
    this.draw();
  }

  /** Set this cell to active */
  setActive() {
    this.active = true;
    this.draw();
  }

  /** Set this cell to inactive */
  setInactive() {
    this.active = false;
    this.draw();
  }


  /** draw this cell on the canvas */
  draw() {
    // erase this cell before (re)drawing
    this.erase();

    const ctx = life.ctx;
    const coordX = this.coordinates.x * life.CELL_WIDTH;
    const coordY = this.coordinates.y * life.CELL_HEIGHT;

    if (this.active) {
      ctx.fillStyle = this.styles.active;
      ctx.fillRect(coordX, coordY, life.CELL_WIDTH, life.CELL_HEIGHT);
    } else {
      ctx.fillStyle = this.styles.default;
      ctx.fillRect(coordX, coordY, life.CELL_WIDTH, life.CELL_HEIGHT);
    }
  }

  /** erase the cell from the canvas */
  erase() {
    const ctx = life.ctx;
    const coordX = this.coordinates.x * life.CELL_WIDTH;
    const coordY = this.coordinates.y * life.CELL_HEIGHT;

    ctx.clearRect(coordX, coordY, life.CELL_WIDTH, life.CELL_HEIGHT);
  }
}




// ==================== Life ==================== //

/** @namespace life */
const life = {};

// constants
life.CELL_WIDTH = 2;
life.CELL_HEIGHT = 2;
life.BOARD_WIDTH = 800;
life.BOARD_HEIGHT = 600;
life.NUM_COLUMNS = life.BOARD_WIDTH / life.CELL_WIDTH;
life.NUM_ROWS = life.BOARD_HEIGHT / life.CELL_HEIGHT;

// html elements
life.canvas = document.getElementById("paintCanvas");
life.ctx = life.canvas.getContext("2d");

/** The 2D array representation of the game board */
life.board = [];

/** What type of cell to toggle on click and drag */
life.dragType = 'active';

/** True if mouse has been dragged */
life.mouseDrag = false;


/** Create 2D array and draw the board */
life.initializeBoard = () => {
  for (let y = 0; y < life.NUM_ROWS; y++) {
    life.board.push([]);
    for (let x = 0; x < life.NUM_COLUMNS; x++) {
      life.board[y].push(new Cell({ y, x }));
    }
  }

  life.drawBoard();
}

/** Draw the board on the canvas */
life.drawBoard = () => {
  // clear canvas before each draw
  life.clearBoard();

  // draw each cell
  life.board.forEach(row => {
    row.forEach(cell => {
      cell.draw();
    })
  })
}

/** clear the the board */
life.clearBoard = () => {
  life.ctx.clearRect(0, 0, life.canvas.width, life.canvas.height);
}




// ==================== Event Handlers ====================== //


/** toggle whether cell is active on click */
life.mouseDownHandler = e => {
  // get cell position
  const cellX = Math.floor((e.pageX - life.canvas.offsetLeft) / life.CELL_WIDTH);
  const cellY = Math.floor((e.pageY - life.canvas.offsetTop) / life.CELL_HEIGHT);

  // set type of cell to fill on drag depending on what is initially clicked
  life.dragType = life.board[cellY][cellX].active ? 'inactive' : 'active';

  // event listeners for mouse drag and mouse up
  life.canvas.addEventListener("mousemove", life.mouseDragHandler);
  life.canvas.addEventListener("mouseup", life.mouseUpHandler);
}

/** Toggle cells when clicking and dragging over them */
life.mouseDragHandler = e => {
  life.mouseDrag = true;
  // get cell position
  const cellX = Math.floor((e.pageX - life.canvas.offsetLeft) / life.CELL_WIDTH);
  const cellY = Math.floor((e.pageY - life.canvas.offsetTop) / life.CELL_HEIGHT);

  // toggle cell active (only if clicking on a cell)
  if (cellY < life.BOARD_HEIGHT / life.CELL_HEIGHT && cellX < life.BOARD_WIDTH / life.CELL_WIDTH) {
    if (life.dragType === 'active') life.board[cellY][cellX].setActive();
    else life.board[cellY][cellX].setInactive();
  }
}

/** disable mouse drag event listener on mouse up */
life.mouseUpHandler = e => {
  // remove drag listener
  life.canvas.removeEventListener('mousemove', life.mouseDragHandler);
  
  // if mouse hasn't been dragged (ie. on click), toggle clicked cell
  if (!life.mouseDrag) {
    // get cell position
    const cellX = Math.floor((e.pageX - life.canvas.offsetLeft) / life.CELL_WIDTH);
    const cellY = Math.floor((e.pageY - life.canvas.offsetTop) / life.CELL_HEIGHT);

    // toggle cell active (only if clicking on a cell)
    if (cellY < life.BOARD_HEIGHT / life.CELL_HEIGHT && cellX < life.BOARD_WIDTH / life.CELL_WIDTH)
      life.board[cellY][cellX].toggleActive();
  }

  // set mouse drag back to false
  life.mouseDrag = false;

  // remove this event listner
  life.canvas.removeEventListener('mouseup', life.mouseUpHandler);
}

/** clear hover states when leaving canvas */
life.mouseLeaveHandler = () => {
  life.canvas.removeEventListener('mousemove', life.mouseDragHandler);
}


// ==================== Initialize =================== //
life.init = () => {
  // set html canvas dimensions
  life.canvas.setAttribute('width', life.BOARD_WIDTH);
  life.canvas.setAttribute('height', life.BOARD_HEIGHT);

  // initialize and draw the board
  life.initializeBoard();

  // mouse listeners
  life.canvas.addEventListener("mousemove", life.mouseMoveHandler);
  life.canvas.addEventListener("mousedown", life.mouseDownHandler);
  life.canvas.addEventListener("mouseleave", life.mouseLeaveHandler);
}


// ==================== Document Ready ==================== //
(() => {
  life.init();
})()