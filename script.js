// TODO
  // possible to not check EVERY cell on play?
  // grid/cell size options
  // option to reset to seed - so people won't lose what they started with
  // variant select - different rulesets

// ========================== Cell ======================== //

/** Class representing a Cell */
class Cell {
  constructor(coordinates, neighbours = 0, active = false, hover = false) {
    this.coordinates = coordinates;
    this.neighbours = neighbours;
    this.active = active;
    this.hover = hover;
  }

  styles = {
    empty: 'rgb(0, 0, 0)',
    active: 'rgb(255, 255, 255)',
    hover: 'rgba(252, 186, 3, 0.25)',
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

  /** if this cell isn't already hovered, enable its hover state (and disable other cell hover states) */
  enableHover() {
    if (!this.hover) {
      this.hover = true;
      this.draw();
      
      // if another cell is currently hovered - disable its hover
      if (life.previousHover.coordinates) {
        const { y, x } = life.previousHover.coordinates;
        life.board[y][x].disableHover();
      }

      // set this cell as the previously hovered cell
      life.previousHover = this;
    }
  }

  /** disable this cell's hover state */
  disableHover() {
    if (this.hover) {
      this.hover = false;
      this.draw();
    }
  }

  /** draw this cell on the canvas */
  draw() {
    // erase this cell before (re)drawing
    this.erase();

    const ctx = life.ctx;
    const coordX = this.coordinates.x * life.CELL_WIDTH;
    const coordY = this.coordinates.y * life.CELL_HEIGHT;

    if (this.active) {
      ctx.fillRect(coordX, coordY, life.CELL_WIDTH, life.CELL_HEIGHT);
    } else {
      ctx.strokeRect(coordX, coordY, life.CELL_WIDTH, life.CELL_HEIGHT);
    }

    if (this.hover) {
      ctx.fillStyle = this.styles.hover;
      ctx.fillRect(coordX, coordY, life.CELL_WIDTH, life.CELL_HEIGHT);
      ctx.fillStyle = this.styles.empty;
    } 
  }

  /** erase the cell from the canvas */
  erase() {
    const ctx = life.ctx;
    const coordX = this.coordinates.x * life.CELL_WIDTH;
    const coordY = this.coordinates.y * life.CELL_HEIGHT;

    ctx.clearRect(coordX, coordY, life.CELL_WIDTH, life.CELL_HEIGHT);
  }

  /** simulate life for this cell depending on active ruleset */
  simulate() {
    switch (life.ruleVariant) {
      case 'standard':
        if (this.active && (this.neighbours <= 1 || this.neighbours >= 4)) {
          this.active = false;
        } else if (!this.active && this.neighbours === 3) {
          this.active = true;
        }
        break;
      case 'highLife':
        if (this.active && (this.neighbours <= 1 || this.neighbours >= 4)) {
          this.active = false;
        } else if (!this.active && (this.neighbours === 3 || this.neighbours === 6)) {
          this.active = true;
        }
        break;
    }
    this.draw();
  }

  /** Returns the number of neighbours this cell has */
  numNeighbours() {
    const { x: cellX, y: cellY } = this.coordinates;
    let result = 0;

    // loop through surrounding x and y coordinates and count active cells
    for (let y = cellY - 1; y <= cellY + 1; y++) {
      // if inside vertical boundaries
      if (y >= 0 && y < life.NUM_ROWS) {
        for (let x = cellX - 1; x <= cellX + 1; x++) {
          // if inside horizontal boundaries, and not the central cell
          if (x >= 0 && x < life.NUM_COLUMNS && (y !== cellY || x !== cellX)) {
            if (life.board[y][x].active) result++;
          }
        }
      }
    }
    return result;
  }

}




// ==================== Life ==================== //

/** @namespace life */
const life = {};

// constants
life.CELL_WIDTH = 20;
life.CELL_HEIGHT = 20;
life.BOARD_WIDTH = 800;
life.BOARD_HEIGHT = 600;
life.NUM_COLUMNS = life.BOARD_WIDTH / life.CELL_WIDTH;
life.NUM_ROWS = life.BOARD_HEIGHT / life.CELL_HEIGHT;

// html elements
life.canvas = document.getElementById("lifeCanvas");
life.ctx = life.canvas.getContext("2d");

life.clearBtn = document.getElementById("clear");

life.playBtn = document.getElementById("play");
life.playMessage = document.getElementById("playMessage");

life.speedSlider = document.getElementById("speed");
life.speedMessage = document.getElementById("speedMessage");

life.variantSelect = document.getElementById("variant");

/** The 2D array representation of the game board */
life.board = [];

/** The turn timer, in ms */
life.turnTimer = 500;

/** True if simulation is playing, false by default */
life.play = false;

/** The previously hovered cell (so can disable hover) */
life.previousHover = {};

/** What type of cell to toggle on click and drag */
life.dragType = 'active';

/** True if mouse has been dragged */
life.mouseDrag = false;

/** The active ruleset selected by the user ('standard' by default) */
life.ruleVariant = 'standard';


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

/** 
 * Simulate one turn
 * - Two loops - otherwise will be counting updated neighbours mid-loop
 *  - one for counting up neighbours
 *  - two for updating positions
 * */
life.simulate = () => {
  // Count neighbours for all cells
  life.board.forEach(row => {
    row.forEach(cell => {
      cell.neighbours = cell.numNeighbours();
    })
  })
  // update cells based on counted neighbours
  life.board.forEach(row => {
    row.forEach(cell => {
      cell.simulate();
    })
  })
}

/** Set the text for speed message */
life.setSpeed = () => {
  const speed = life.speedSlider.valueAsNumber;
  life.turnTimer = speed;
  life.speedMessage.innerText = `${speed}ms`;
}

/** Start the game timer */
life.startTimer = () => {
  life.interval = setInterval(() => {
    life.simulate();
  }, life.turnTimer);
}

/** Stop the game timer */
life.stopTimer = () => {
  clearInterval(life.interval);
}


// ==================== Event Handlers ====================== //

/** add hover effect when cursor over a cell */
life.mouseMoveHandler = e => {
  // get cell position
  const cellX = Math.floor((e.pageX - life.canvas.offsetLeft) / life.CELL_WIDTH);
  const cellY = Math.floor((e.pageY - life.canvas.offsetTop) / life.CELL_HEIGHT);

  // enable hover only if hovering over a cell
  if (cellY < life.BOARD_HEIGHT / life.CELL_HEIGHT && cellX < life.BOARD_WIDTH / life.CELL_WIDTH)
    life.board[cellY][cellX].enableHover();
}

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
  const prevHoverCoords = life.previousHover.coordinates;
  life.board[prevHoverCoords.y][prevHoverCoords.x].disableHover();

  life.canvas.removeEventListener('mousemove', life.mouseDragHandler);
}

/** clear board and canvas on click */
life.clearBtnClickHandler = () => {
  // loop through board and set all cells to inactive
  life.board.forEach(row => {
    row.forEach(cell => {
      cell.active = false;
    })
  })
  // draw the cleared board
  life.drawBoard();
}

/** Toggle play/pause on simulation */
life.playBtnClickHandler = () => {
  // toggle play/pause
  life.play = !life.play;

  // set button & message text
  life.playBtn.innerHTML = life.play ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
  life.playMessage.innerText = life.play ? 'Playing' : 'Paused';

  // start simulation on play, stop on pause
  if (life.play) life.startTimer();
  else clearInterval(life.interval);
}

/** Set simulation speed and slider text on move */
life.speedSliderMoveHandler = e => {
  life.setSpeed();

  // if game is playing, restart the timer
  if (life.play) {
    life.stopTimer();
    life.startTimer();
  }
}

/** Change the rule variant on select */
life.variantSelectChangeHandler = e => {
  life.ruleVariant = e.target.value;
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

  // button listeners
  life.clearBtn.addEventListener("click", life.clearBtnClickHandler);
  life.playBtn.addEventListener("click", life.playBtnClickHandler);

  // speed slider listeners
  life.speedSlider.addEventListener("mousemove", life.speedSliderMoveHandler);
  life.setSpeed(); // initially set speed in case slider is not in default position

  // variant select listener
  life.variantSelect.addEventListener("change", life.variantSelectChangeHandler);
}


// ==================== Document Ready ==================== //
(() => {
  life.init();
})()