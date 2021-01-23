// TODO
  // connect the dots

// ========================== Cell ======================== //

/** Class representing a Cell */
class Cell {
  constructor(coordinates, active = false) {
    this.coordinates = coordinates;
    this.active = active;
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

    const ctx = paint.ctx;
    const coordX = this.coordinates.x * paint.CELL_WIDTH;
    const coordY = this.coordinates.y * paint.CELL_HEIGHT;

    if (this.active) {
      ctx.fillStyle = paint.color;
      ctx.fillRect(coordX, coordY, paint.CELL_WIDTH, paint.CELL_HEIGHT);
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(coordX, coordY, paint.CELL_WIDTH, paint.CELL_HEIGHT);
    }
  }

  /** erase the cell from the canvas */
  erase() {
    const ctx = paint.ctx;
    const coordX = this.coordinates.x * paint.CELL_WIDTH;
    const coordY = this.coordinates.y * paint.CELL_HEIGHT;

    ctx.clearRect(coordX, coordY, paint.CELL_WIDTH, paint.CELL_HEIGHT);
  }
}




// ==================== Life ==================== //

/** @namespace life */
const paint = {};

// constants
paint.CELL_WIDTH = 1;
paint.CELL_HEIGHT = 1;
paint.BOARD_WIDTH = 800;
paint.BOARD_HEIGHT = 600;
paint.NUM_COLUMNS = paint.BOARD_WIDTH / paint.CELL_WIDTH;
paint.NUM_ROWS = paint.BOARD_HEIGHT / paint.CELL_HEIGHT;

// html elements
paint.canvas = document.getElementById("paintCanvas");
paint.ctx = paint.canvas.getContext("2d");

paint.colorPicker = document.getElementById("colorPicker");

/** The 2D array representation of the game board */
paint.board = [];

/** What type of cell to toggle on click and drag */
paint.dragType = 'active';

/** True if mouse has been dragged */
paint.mouseDrag = false;

/** The last cell activated during click and drag (used to connect the dots at high speed) */
paint.lastDraggedCell = null;

/** The currently active color */
paint.color = '#000000';


/** Create 2D array and draw the board */
paint.initializeBoard = () => {
  for (let y = 0; y < paint.NUM_ROWS; y++) {
    paint.board.push([]);
    for (let x = 0; x < paint.NUM_COLUMNS; x++) {
      paint.board[y].push(new Cell({ y, x }));
    }
  }

  paint.drawBoard();
}

/** Draw the board on the canvas */
paint.drawBoard = () => {
  // clear canvas before each draw
  paint.clearBoard();

  // draw each cell
  paint.board.forEach(row => {
    row.forEach(cell => {
      cell.draw();
    })
  })
}

/** clear the the board */
paint.clearBoard = () => {
  paint.ctx.clearRect(0, 0, paint.canvas.width, paint.canvas.height);
}




// ==================== Event Handlers ====================== //


/** toggle whether cell is active on click */
paint.mouseDownHandler = e => {
  // get cell position
  const cellX = Math.floor((e.pageX - paint.canvas.offsetLeft) / paint.CELL_WIDTH);
  const cellY = Math.floor((e.pageY - paint.canvas.offsetTop) / paint.CELL_HEIGHT);

  // set type of cell to fill on drag depending on what is initially clicked
  paint.dragType = paint.board[cellY][cellX].active ? 'inactive' : 'active';

  // event listeners for mouse drag and mouse up
  paint.canvas.addEventListener("mousemove", paint.mouseDragHandler);
  paint.canvas.addEventListener("mouseup", paint.mouseUpHandler);
}

/** Toggle cells when clicking and dragging over them */
paint.mouseDragHandler = e => {
  paint.mouseDrag = true;

  const posX = e.pageX - paint.canvas.offsetLeft;
  const posY = e.pageY - paint.canvas.offsetTop;

  // get cell position
  const cellX = Math.floor(posX / paint.CELL_WIDTH);
  const cellY = Math.floor(posY / paint.CELL_HEIGHT);

  // toggle cell active (only if clicking on a cell)
  if (cellY < paint.BOARD_HEIGHT / paint.CELL_HEIGHT && cellX < paint.BOARD_WIDTH / paint.CELL_WIDTH) {
    if (paint.dragType === 'active') paint.board[cellY][cellX].setActive();
    else paint.board[cellY][cellX].setInactive();
  
    // if distance between the last painted cell and this cell is greater than 1, fill in the gap
    if (paint.lastDraggedCell && (Math.abs(paint.lastDraggedCell.coordinates.x - cellX) > 1 || Math.abs(paint.lastDraggedCell.coordinates.y - cellY) > 1)) {
      // console.log('fill in the gap');
      const ctx = paint.ctx;
      ctx.beginPath();
      ctx.moveTo(posX + 0.5, posY + 0.5);
      ctx.lineTo(paint.lastDraggedCell.coordinates.x + 0.5, paint.lastDraggedCell.coordinates.y + 0.5);
      ctx.strokeStyle = paint.color;
      ctx.stroke();
    }
    paint.lastDraggedCell = paint.board[cellY][cellX];
  }
}

/** disable mouse drag event listener on mouse up */
paint.mouseUpHandler = e => {
  // remove drag listener
  paint.canvas.removeEventListener('mousemove', paint.mouseDragHandler);
  
  // if mouse hasn't been dragged (ie. on click), toggle clicked cell
  if (!paint.mouseDrag) {
    // get cell position
    const cellX = Math.floor((e.pageX - paint.canvas.offsetLeft) / paint.CELL_WIDTH);
    const cellY = Math.floor((e.pageY - paint.canvas.offsetTop) / paint.CELL_HEIGHT);

    // toggle cell active (only if clicking on a cell)
    if (cellY < paint.BOARD_HEIGHT / paint.CELL_HEIGHT && cellX < paint.BOARD_WIDTH / paint.CELL_WIDTH)
      paint.board[cellY][cellX].toggleActive();
  }

  // set mouse drag back to false
  paint.mouseDrag = false;

  paint.lastDraggedCell = null;

  // remove this event listner
  paint.canvas.removeEventListener('mouseup', paint.mouseUpHandler);
}

/** clear hover states when leaving canvas */
paint.mouseLeaveHandler = () => {
  paint.canvas.removeEventListener('mousemove', paint.mouseDragHandler);
  paint.lastDraggedCell = null;
}

/** Set new color on color picker change */
paint.colorPickerChangeHandler = e => {
  paint.color = e.target.value;
}


// ==================== Initialize =================== //
paint.init = () => {
  // set html canvas dimensions
  paint.canvas.setAttribute('width', paint.BOARD_WIDTH);
  paint.canvas.setAttribute('height', paint.BOARD_HEIGHT);

  // initialize and draw the board
  paint.initializeBoard();

  // mouse listeners
  paint.canvas.addEventListener("mousemove", paint.mouseMoveHandler);
  paint.canvas.addEventListener("mousedown", paint.mouseDownHandler);
  paint.canvas.addEventListener("mouseleave", paint.mouseLeaveHandler);

  // color picker listener
  paint.colorPicker.addEventListener("change", paint.colorPickerChangeHandler);
}


// ==================== Document Ready ==================== //
(() => {
  paint.init();
})()