// TODO
  // clear
  // erase
  // remove setActive and just set colors

  // save
    // cloud?
    // download
  // potentially some pixel color issues around edges (esp. after paint bucket?) - maybe need to offset pixel values with canvas
  // mouse 2 for second color
  // option to resize canvas
  // zoom?
    // utilize cell size change
  // Clean up UI
    // Fontawesome icons

// ========================== Cell ======================== //

/** Class representing a Cell */
class Cell {
  constructor(coordinates, color) {
    this.coordinates = coordinates;
    this.color = color;
  }

  /** draw this cell on the canvas */
  draw(color = null) {
    // erase this cell before (re)drawing
    this.erase();

    this.color = color ? color : paint.color;

    const ctx = paint.ctx;
    const coordX = this.coordinates.x * paint.CELL_WIDTH;
    const coordY = this.coordinates.y * paint.CELL_HEIGHT;

    ctx.fillStyle = this.color;
    ctx.fillRect(coordX, coordY, paint.CELL_WIDTH, paint.CELL_HEIGHT);
  }

  /** erase the cell from the canvas */
  erase() {
    const ctx = paint.ctx;
    const coordX = this.coordinates.x * paint.CELL_WIDTH;
    const coordY = this.coordinates.y * paint.CELL_HEIGHT;

    ctx.clearRect(coordX, coordY, paint.CELL_WIDTH, paint.CELL_HEIGHT);
  }

  // /** fill this cell's neighbours that have the specified color */
  // fillNeighbours(colorToFill) {
  //   const { x, y } = this.coordinates;

  //   // this cell's neighbour coordinates
  //   const neighbours = {
  //     up: { x, y: y + 1 },
  //     right: { x: x + 1, y },
  //     down: { x, y: y - 1 },
  //     left: { x: x - 1, y }
  //   }

  //   // loop through neighbours and fill if appropriate
  //   for (let i in neighbours) {
  //     const coords = neighbours[i];
  //     // only if within canvas boundaries
  //     if (coords.x >= 0 && coords.x < paint.NUM_COLUMNS && coords.y >= 0 && coords.y < paint.NUM_ROWS) {
  //       // if this cell has provided color & provided color isn't the same as new color
  //       if (paint.board[coords.y][coords.x].color === colorToFill && colorToFill !== paint.color) {
  //         // set this cell to new color
  //         paint.board[coords.y][coords.x].color = paint.color;
  //         // redraw this cell
  //         paint.board[coords.y][coords.x].setActive();

  //         // fill this cell's neighbours
  //         // paint.board[coords.y][coords.x].fillNeighbours(colorToFill);

  //         // TODO timeout for debug purposes - looks cool, maybe implement as feature?
  //         setTimeout(()=> {
  //           paint.board[coords.y][coords.x].fillNeighbours(colorToFill);
  //           console.log('filling');
  //         }, 10);
  //       }
  //     }
  //   }
  // }
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
paint.DEFAULT_COLOR = '#ffffff';

// html elements
paint.canvas = document.getElementById("paintCanvas");
paint.ctx = paint.canvas.getContext("2d");

paint.colorPicker = document.getElementById("colorPicker");
paint.brushSizeSlider = document.getElementById("brushSize");
paint.brushTypes = document.getElementById("brushTypes");
paint.clearBtn = document.getElementById("clear");

/** The 2D array representation of the game board */
paint.board = [];

/** True if mouse has been dragged */
paint.mouseDrag = false;

/** The last cell activated during click and drag (used to connect the dots at high speed) */
paint.lastDraggedCell = null;

/** The currently active color */
paint.color = '#000000';

/** The brush size to draw with, default is 1px */
paint.brushSize = 1;

/** 
 * The currently active brush type, default is 'pencil'
 * Allowed types (so far): 'pencil', 'fill'
 */
paint.brushType = 'pencil';

/** Create 2D array and draw the board */
paint.initializeBoard = () => {
  for (let y = 0; y < paint.NUM_ROWS; y++) {
    paint.board.push([]);
    for (let x = 0; x < paint.NUM_COLUMNS; x++) {
      paint.board[y].push(new Cell({ y, x }, paint.DEFAULT_COLOR));
    }
  }

  paint.drawBoard(paint.DEFAULT_COLOR);
}

/** 
 * Draw the board on the canvas 
 * @param {string} color - the color to draw the board
 * */
paint.drawBoard = (color) => {
  paint.ctx.fillStyle = color;
  paint.ctx.fillRect(0, 0, paint.BOARD_WIDTH, paint.BOARD_HEIGHT);

  // reset color info for each cell
  paint.board.forEach(row => {
    row.forEach(cell => {
      cell.color = color;
    })
  })
}

/** draw at specified coordinates */
paint.draw = (x, y) => {
  // if brush size is larger than 1px, draw a circle
  if (paint.brushSize > 1) {
    paint.drawCircle(x, y, paint.brushSize)
  } else{
    paint.board[y][x].draw();
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

  // Actual pixel coordinates
  let pixelX, pixelY;

  // Draw a square of size N*N
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      // Start from the left most corner point 
      x = i - r;
      y = j - r;
      pixelX = x0 + x;
      pixelY = y0 + y;

      // if pixel color isn't the new paint color (to avoid recoloring - huge performance gain), and if pixel is inside canvas
      if (paint.isInsideCanvas(pixelX, pixelY) && paint.board[pixelY][pixelX].color !== paint.color) {
        // If cell is inside the circle, draw it
        if (x * x + y * y <= r * r + 1) {
          paint.board[pixelY][pixelX].draw();
        }
      }
    }
  }
}

// /** Fill all connected cells matching color from specified coordinates */
// paint.fill = (x, y) => {
//   const colorToFill = paint.board[y][x].color;
//   paint.board[y][x].fillNeighbours(colorToFill);
// }

/** 
 * Fill all connected cells matching color from specified coordinates
 * - Non-recursive solution adapted from here: https://www.freecodecamp.org/news/flood-fill-algorithm-explained/
 *  - This example specifically: https://ben.akrin.com/canvas_fill/fill_04.html
 * - Recursive solutions are very slow and can hit browser recursion limits
 *  */
paint.fill = (x, y) => {
  const originalColor = paint.board[y][x].color;
  const color = paint.color;
  
  // only fill if color is different than clicked pixel
  if (originalColor === color) return;

  const pixelStack = [{ x: x, y: y }];

  while (pixelStack.length > 0) {
    const newPixel = pixelStack.shift();
    x = newPixel.x;
    y = newPixel.y;

    // move y up until no longer the right color (or edge of canvas)
    while (y-- > 0 && paint.board[y][x].color == originalColor);

    let reached_left = false;
    let reached_right = false;
    while (y++ < paint.NUM_ROWS-1 && paint.board[y][x].color == originalColor) {
      paint.board[y][x].color = color;
      paint.board[y][x].draw();

      if (x > 0) {
        if (paint.board[y][x - 1].color == originalColor) {
          if (!reached_left) {
            pixelStack.push({ x: x - 1, y: y });
            reached_left = true;
          }
        } else if (reached_left) {
          reached_left = false;
        }
      }

      if (x < paint.NUM_COLUMNS - 1) {
        if (paint.board[y][x + 1].color == originalColor) {
          if (!reached_right) {
            pixelStack.push({ x: x + 1, y: y });
            reached_right = true;
          }
        } else if (reached_right) {
          reached_right = false;
        }
      }
    }
  }
}

/** Returns true if specified coordinates are inside the canvas, false otherwise */
paint.isInsideCanvas = (x, y) => {
  if (y < paint.NUM_ROWS && y >= 0 && x < paint.NUM_COLUMNS && x >= 0)
    return true;
  else return false;
}

// ==================== Event Handlers ====================== //


/** Perform action depending on selected brush type */
paint.mouseDownHandler = e => {
  // Get cell coordinates
  const cellX = Math.floor((e.pageX - paint.canvas.offsetLeft) / paint.CELL_WIDTH);
  const cellY = Math.floor((e.pageY - paint.canvas.offsetTop) / paint.CELL_HEIGHT);

  // perform action depending on brush type
  if (paint.brushType === 'pencil') {
    // event listeners for mouse drag and mouse up
    paint.canvas.addEventListener("mousemove", paint.mouseDragHandler);
    paint.canvas.addEventListener("mouseup", paint.mouseUpHandler);

  } else if (paint.brushType === 'fill') {
    paint.fill(cellX, cellY);
    console.log(paint.board);
  } else if (paint.brushType === 'dropper') {
    const color = paint.board[cellY][cellX].color;
    paint.color = color;
    paint.colorPicker.value = color;
  }
}

/** Toggle cells when clicking and dragging over them */
paint.mouseDragHandler = e => {
  paint.mouseDrag = true;

  // get cell position
  const cellX = Math.floor((e.pageX - paint.canvas.offsetLeft) / paint.CELL_WIDTH);
  const cellY = Math.floor((e.pageY - paint.canvas.offsetTop) / paint.CELL_HEIGHT);

  // draw cell (only if clicking on canvas)
  if (paint.isInsideCanvas(cellX, cellY)) {
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

    // draw cell (only if clicking on canvas)
    if (paint.isInsideCanvas(cellX, cellY))
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

/** Change current brush type to selected */
paint.brushTypeChangeHandler = e => {
  paint.brushType = e.target.value;
}

/** Clear the canvas on click of clear button */
paint.clearBtnClickHandler = () => {
  paint.drawBoard(paint.DEFAULT_COLOR);
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

  // paint bucket listener
  paint.brushTypes.addEventListener("change", paint.brushTypeChangeHandler);

  // clear button listener
  paint.clearBtn.addEventListener("click", paint.clearBtnClickHandler);

}


// ==================== Document Ready ==================== //
(() => {
  paint.init();
})()