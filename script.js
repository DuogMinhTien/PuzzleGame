let CANVAS = null;
let CONTEXT = null;
let HELPER_CANVAS = null;
let HELPER_CONTEXT = null;
let SCALER = 0.8;
let SIZE = { x: 0, y: 0, width: 0, height: 0, rows: 3, columns: 3 };
let PIECES = [];

let SELECTED_PIECE = null;

var image = new Image();
image.src = "./img.jpg";

function main() {
  CANVAS = document.querySelector("#myCanvas");
  CONTEXT = CANVAS.getContext("2d");

  HELPER_CANVAS = document.querySelector("#helperCanvas");
  HELPER_CONTEXT = HELPER_CANVAS.getContext("2d");

  addEventListeners();

  (function () {
    handleResize();
    window.addEventListener("resize", handleResize);
    initializePieces(SIZE.rows, SIZE.columns);
    randomizePiece();
    updateCanvas();
  })();

  // let promise = navigator.mediaDevices.getUserMedia ({video: true});
  // promise.then (function (signal) {
  //     VIDEO = document.createElement ("video");
  //     VIDEO.srcObject = signal;
  //     VIDEO.play ();

  //     VIDEO.onloadeddata = function () {
  //         updateCanvas ();
  //     }
  // }).catch (function (err) {
  //     alert ("Camera error: " + err);
  // })
}

function addEventListeners() {
  CANVAS.addEventListener("mousedown", onMouseDown);
  CANVAS.addEventListener("mousemove", onMouseMove);
  CANVAS.addEventListener("mouseup", onMouseUp);

  CANVAS.addEventListener("touchstart", onTouchStart);
  CANVAS.addEventListener("touchmove", onTouchMove);
  CANVAS.addEventListener("touchend", onTouchEnd);
}

function onTouchStart(evt) {
  let loc = { x: evt.touches[0].clientX, y: evt.touches[0].clientY };
  onMouseDown(loc);
}

function onTouchMove(evt) {
  let loc = { x: evt.touches[0].clientX, y: evt.touches[0].clientY };
  onMouseMove(loc);
}

function onTouchEnd() {
  onMouseUp();
}

function onMouseDown(evt) {
  const imgData = HELPER_CONTEXT.getImageData(evt.x, evt.y, 1, 1);
  if (imgData.data[3] == 0) {
    return;
  }
  const clickedColor = `rgb(${imgData.data[0]}, ${imgData.data[1]}, ${imgData.data[2]})`;
  SELECTED_PIECE = getPressedPieceByColor(evt, clickedColor);
  //   SELECTED_PIECE = getPressPiece(evt);
  if (SELECTED_PIECE != null && !SELECTED_PIECE.correct) {
    const index = PIECES.indexOf(SELECTED_PIECE);
    if (index > -1) {
      PIECES.splice(index, 1);
      PIECES.push(SELECTED_PIECE);
    }
    SELECTED_PIECE.offset = {
      x: evt.x - SELECTED_PIECE.x,
      y: evt.y - SELECTED_PIECE.y,
    };
  }
}

function onMouseMove(evt) {
  if (SELECTED_PIECE != null && !SELECTED_PIECE.correct) {
    SELECTED_PIECE.x = evt.x - SELECTED_PIECE.offset.x;
    SELECTED_PIECE.y = evt.y - SELECTED_PIECE.offset.y;
  }
}

function onMouseUp() {
  if (SELECTED_PIECE) {
    if (SELECTED_PIECE.isClose()) {
      SELECTED_PIECE.snap();
    }
  }
  SELECTED_PIECE = null;
}

function getPressPiece(loc) {
  for (let i = PIECES.length - 1; i >= 0; i--) {
    if (
      loc.x > PIECES[i].x &&
      loc.x < PIECES[i].x + PIECES[i].width &&
      loc.y > PIECES[i].y &&
      loc.y < PIECES[i].y + PIECES[i].height
    ) {
      return PIECES[i];
    }
  }
  return null;
}

function getPressedPieceByColor(loc, color) {
  for (let i = PIECES.length - 1; i >= 0; i--) {
    if (PIECES[i].color == color) {
      return PIECES[i];
    }
  }
  return null;
}

function handleResize() {
  CANVAS.width = window.innerWidth;
  CANVAS.height = window.innerHeight;

  HELPER_CANVAS.width = window.innerWidth;
  HELPER_CANVAS.height = window.innerHeight;

  let resizer =
    SCALER *
    Math.min(
      window.innerWidth / image.width,
      window.innerHeight / image.height
    );
  SIZE.width = resizer * image.width;
  SIZE.height = resizer * image.height;
  SIZE.x = window.innerWidth / 2 - SIZE.width / 2;
  SIZE.y = window.innerHeight / 2 - SIZE.height / 2;

  initializePieces(SIZE.rows, SIZE.columns);
  randomizePiece();
}

function updateCanvas() {
  CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height);
  HELPER_CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height);

  CONTEXT.globalAlpha = 0.5;

  CONTEXT.drawImage(image, SIZE.x, SIZE.y, SIZE.width, SIZE.height);

  CONTEXT.globalAlpha = 1;

  for (let i = 0; i < PIECES.length; i++) {
    PIECES[i].draw(CONTEXT);
    PIECES[i].draw(HELPER_CONTEXT, false);
  }
  window.requestAnimationFrame(updateCanvas);
}

function initializePieces(rows, cols) {
  SIZE.rows = rows;
  SIZE.columns = cols;
  PIECES = [];
  const uniqueRandomColors = [];
  for (let i = 0; i < SIZE.rows; i++) {
    for (let j = 0; j < SIZE.columns; j++) {
      const color = getRandomColor();
      while (uniqueRandomColors.includes(color)) {
        color = getRandomColor();
      }
      PIECES.push(new Piece(i, j, color));
    }
  }

  let cnt = 0;
  for (let i = 0; i < SIZE.rows; i++) {
    for (let j = 0; j < SIZE.columns; j++) {
      const piece = PIECES[cnt];
      if (i == SIZE.rows - 1) {
        piece.bottom = null;
      } else {
        const sgn = Math.random() - 0.5 < 0 ? -1 : 1;
        piece.bottom = sgn * (Math.random() * 0.4 + 0.3);
      }

      if (j == SIZE.columns - 1) {
        piece.right = null;
      } else {
        const sgn = Math.random() - 0.5 < 0 ? -1 : 1;
        piece.right = sgn * (Math.random() * 0.4 + 0.3);
      }

      if (j == 0) {
        piece.left = null;
      } else {
        piece.left = -PIECES[cnt - 1].right;
      }

      if (i == 0) {
        piece.top = null;
      } else {
        piece.top = -PIECES[cnt - SIZE.columns].bottom;
      }

      cnt++;
    }
  }
}

function randomizePiece() {
  for (let i = 0; i < PIECES.length; i++) {
    let loc = {
      x: Math.random() * (CANVAS.width - PIECES[i].width),
      y: Math.random() * (CANVAS.height - PIECES[i].height),
    };
    PIECES[i].x = loc.x;
    PIECES[i].y = loc.y;
  }
}

class Piece {
  constructor(rowIndex, colIndex, color) {
    this.rowIndex = rowIndex;
    this.colIndex = colIndex;
    this.x = SIZE.x + (SIZE.width * this.colIndex) / SIZE.columns;
    this.y = SIZE.y + (SIZE.height * this.rowIndex) / SIZE.rows;
    this.width = SIZE.width / SIZE.columns;
    this.height = SIZE.height / SIZE.rows;
    this.xCorrect = this.x;
    this.yCorrect = this.y;
    this.correct = false;
    this.color = color;
  }
  draw(context, useImg = true) {
    context.beginPath();

    const sz = Math.min(this.width, this.height);
    const neck = 0.1 * sz;
    const tabWidth = 0.2 * sz;
    const tabHeight = 0.2 * sz;

    // context.rect(this.x, this.y, this.width, this.height);
    // from top left
    context.moveTo(this.x, this.y);

    // to top right
    if (this.top) {
      context.lineTo(this.x + this.width * Math.abs(this.top) - neck, this.y);
      context.bezierCurveTo(
        this.x + this.width * Math.abs(this.top) - neck,
        this.y - tabHeight * Math.sign(this.top) * 0.2,
        this.x + this.width * Math.abs(this.top) - tabWidth,
        this.y - tabHeight * Math.sign(this.top),

        this.x + this.width * Math.abs(this.top),
        this.y - tabHeight * Math.sign(this.top)
      );

      context.bezierCurveTo(
        this.x + this.width * Math.abs(this.top) + tabWidth,
        this.y - tabHeight * Math.sign(this.top),
        this.x + this.width * Math.abs(this.top) + neck,
        this.y - tabHeight * Math.sign(this.top) * 0.2,
        this.x + this.width * Math.abs(this.top) + neck,
        this.y
      );
    }
    context.lineTo(this.x + this.width, this.y);

    // to bottom right
    if (this.right) {
      context.lineTo(
        this.x + this.width,
        this.y + this.height * Math.abs(this.right) - neck
      );
      context.bezierCurveTo(
        this.x + this.width - tabHeight * Math.sign(this.right) * 0.2,
        this.y + this.height * Math.abs(this.right) - neck,

        this.x + this.width - tabHeight * Math.sign(this.right),
        this.y + this.height * Math.abs(this.right) - tabWidth,

        this.x + this.width - tabHeight * Math.sign(this.right),
        this.y + this.height * Math.abs(this.right)
      );
      context.bezierCurveTo(
        this.x + this.width - tabHeight * Math.sign(this.right),
        this.y + this.height * Math.abs(this.right) + tabWidth,

        this.x + this.width - tabHeight * Math.sign(this.right) * 0.2,
        this.y + this.height * Math.abs(this.right) + neck,

        this.x + this.width,
        this.y + this.height * Math.abs(this.right) + neck
      );
    }
    context.lineTo(this.x + this.width, this.y + this.height);

    // to bottom left
    if (this.bottom) {
      context.lineTo(
        this.x + this.width * Math.abs(this.bottom) + neck,
        this.y + this.height
      );
      context.bezierCurveTo(
        this.x + this.width * Math.abs(this.bottom) + neck,
        this.y + this.height + tabHeight * Math.sign(this.bottom) * 0.2,
        this.x + this.width * Math.abs(this.bottom) + tabWidth,
        this.y + this.height + tabHeight * Math.sign(this.bottom),
        this.x + this.width * Math.abs(this.bottom),
        this.y + this.height + tabHeight * Math.sign(this.bottom)
      );
      context.bezierCurveTo(
        this.x + this.width * Math.abs(this.bottom) - tabWidth,
        this.y + this.height + tabHeight * Math.sign(this.bottom),
        this.x + this.width * Math.abs(this.bottom) - neck,
        this.y + this.height + tabHeight * Math.sign(this.bottom) * 0.2,
        this.x + this.width * Math.abs(this.bottom) - neck,
        this.y + this.height
      );
    }
    context.lineTo(this.x, this.y + this.height);

    // to top left
    if (this.left) {
      context.lineTo(this.x, this.y + this.height * Math.abs(this.left) + neck);
      context.bezierCurveTo(
        this.x + tabHeight * Math.sign(this.left) * 0.2,
        this.y + this.height * Math.abs(this.left) + neck,

        this.x + tabHeight * Math.sign(this.left),
        this.y + this.height * Math.abs(this.left) + tabWidth,

        this.x + tabHeight * Math.sign(this.left),
        this.y + this.height * Math.abs(this.left)
      );
      context.bezierCurveTo(
        this.x + tabHeight * Math.sign(this.left),
        this.y + this.height * Math.abs(this.left) - tabWidth,

        this.x + tabHeight * Math.sign(this.left) * 0.2,
        this.y + this.height * Math.abs(this.left) - neck,

        this.x,
        this.y + this.height * Math.abs(this.left) - neck
      );
    }
    context.lineTo(this.x, this.y);

    context.save();
    context.clip();

    const scaledTabHeight =
      (Math.min(image.width / SIZE.columns, image.height / SIZE.rows) *
        tabHeight) /
      sz;

    if (useImg) {
      context.drawImage(
        image,
        (this.colIndex * image.width) / SIZE.columns - scaledTabHeight,
        (this.rowIndex * image.height) / SIZE.rows - scaledTabHeight,
        image.width / SIZE.columns + scaledTabHeight * 2,
        image.height / SIZE.rows + scaledTabHeight * 2,
        this.x - tabHeight,
        this.y - tabHeight,
        this.width + tabHeight * 2,
        this.height + tabHeight * 2
      );
    } else {
      context.fillStyle = this.color;
      context.fillRect(
        this.x - tabHeight,
        this.y - tabHeight,
        this.width + tabHeight * 2,
        this.height * tabHeight * 2
      );
    }

    context.restore();

    context.stroke();
  }

  isClose() {
    if (
      distance(
        { x: this.x, y: this.y },
        { x: this.xCorrect, y: this.yCorrect }
      ) <
      this.width / 3
    ) {
      return true;
    }
    return false;
  }
  snap() {
    this.x = this.xCorrect;
    this.y = this.yCorrect;

    this.correct = true;

    const index = PIECES.indexOf(SELECTED_PIECE);
    if (index > -1) {
      PIECES.splice(index, 1);
      PIECES.unshift(SELECTED_PIECE);
    }
  }
}

function distance(p1, p2) {
  return Math.sqrt(
    (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y)
  );
}

function getRandomColor() {
  const red = Math.floor(Math.random() * 255);
  const green = Math.floor(Math.random() * 255);
  const blue = Math.floor(Math.random() * 255);
  return `rgb(${red}, ${green}, ${blue})`;
}
