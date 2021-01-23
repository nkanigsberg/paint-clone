// TODO
  // brush size
  // paint bucket
  // clear
  // erase
  // save
    // cloud?
    // download

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
paint.brushSizeSlider = document.getElementById("brushSize");

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

/** The brush size to draw with, default is 1px */
paint.brushSize = 1;


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

/** draw at specified coordinates */
paint.draw = (x, y) => {
  // if brush size is larger than 1px, draw a circle
  if (paint.brushSize > 1) {
    paint.drawCircle(x, y, paint.brushSize)
  } else{
    paint.board[y][x].setActive();
  }
}


/** 
 * Draw a line between specified coordinates
 * - Uses Bresenham’s Algorithm
 * - From tutorial: https://jstutorial.medium.com/how-to-code-your-first-algorithm-draw-a-line-ca121f9a1395
 */
paint.drawLine = ( start, end ) => {
  const { x: x1, y: y1 } = start;
  const { x: x2, y: y2 } = end;

  // Iterators, counters required by algorithm
  let x, y, dx, dy, dx1, dy1, px, py, xe, ye, i;

  // Calculate deltas of line (difference between two points)
  dx = x2 - x1;
  dy = y2 - y1;

  // Create a positive copy of deltas (makes iterating easier)
  dx1 = Math.abs(dx);
  dy1 = Math.abs(dy);

  // Calculate error intervals for both axis
  px = 2 * dy1 - dx1;
  py = 2 * dx1 - dy1;

  // The line is X-axis dominant
  if (dy1 <= dx1) {
    // Line is drawn left to right
    if (dx >= 0) {
      x = x1; y = y1; xe = x2;
    } else { // Line is drawn right to left (swap ends)
      x = x2; y = y2; xe = x1;
    } 
    paint.draw(x, y); // Draw first pixel
    // Rasterize the line
    for (i = 0; x < xe; i++) {
      x = x + 1;
      // Deal with octants...
      if (px < 0) {
        px = px + 2 * dy1;
      } else {
        if ((dx < 0 && dy < 0) || (dx > 0 && dy > 0)) {
          y = y + 1;
        } else {
          y = y - 1;
        }
        px = px + 2 * (dy1 - dx1);
      }
      // Draw pixel from line span at currently rasterized position
      paint.draw(x, y);
    }
  } else { // The line is Y-axis dominant
    // Line is drawn bottom to top
    if (dy >= 0) {
      x = x1; y = y1; ye = y2;
    } else { // Line is drawn top to bottom
      x = x2; y = y2; ye = y1;
    } paint.draw(x, y); // Draw first pixel
    // Rasterize the line
    for (i = 0; y < ye; i++) {
      y = y + 1;
      // Deal with octants...
      if (py <= 0) {
        py = py + 2 * dx1;
      } else {
        if ((dx < 0 && dy < 0) || (dx > 0 && dy > 0)) {
          x = x + 1;
        } else {
          x = x - 1;
        }
        py = py + 2 * (dx1 - dy1);
      }
      // Draw pixel from line span at currently rasterized position
      paint.draw(x, y);
    }
  }
}

/** 
 * Draw a circle at specified coordinates
 * - Uses algorithm found here: https://www.geeksforgeeks.org/draw-circle-without-floating-point-arithmetic/
 *  */
paint.drawCircle = (x0, y0, r) => {
  // Consider a rectangle of size N*N 
  const N = 2 * r + 1;

  // Coordinates inside the rectangle 
  let x, y;

  // Draw a square of size N*N
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      // Start from the left most corner point 
      x = i - r;
      y = j - r; 

      // If cell is inside the circle, set active
      if (x * x + y * y <= r * r + 1) {
        paint.board[y0 + y][x0 + x].setActive();
      }
    }
  }
}



// ==================== Event Handlers ====================== //


/** toggle whether cell is active on click */
paint.mouseDownHandler = () => {
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
    paint.draw(cellX, cellY)
  
    // if distance between the last painted cell and this cell is greater than 1, fill in the gap
    if (paint.lastDraggedCell && (Math.abs(paint.lastDraggedCell.coordinates.x - cellX) > 1 || Math.abs(paint.lastDraggedCell.coordinates.y - cellY) > 1)) {
      paint.drawLine({ x: cellX, y: cellY }, { x: paint.lastDraggedCell.coordinates.x, y: paint.lastDraggedCell.coordinates.y });
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
      paint.draw(cellX, cellY);
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

/** Change the brush size on slider change */
paint.brushSizeChangeHandler = e => {
  paint.brushSize = e.target.value;
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
  // set default color
  paint.color = paint.colorPicker.value;

  // brush size listener
  paint.brushSizeSlider.addEventListener("change", paint.brushSizeChangeHandler);


}


// ==================== Document Ready ==================== //
(() => {
  paint.init();
})()