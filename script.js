let VIDEO = null;
let CANVAS = null;
let CONTEXT = null;
let SCALER = 0.8;
let SIZE = {x: 0, y: 0, width: 0, height: 0, rows: 3, columns: 3};
let PIECES = [];

let SELECTED_PIECE = null;

var image = new Image();
image.src = './img.jpg';

function main () {
    CANVAS = document.querySelector ("#myCanvas");
    CONTEXT = CANVAS.getContext ("2d"); 

    addEventListeners ();


    (function () {
        handleResize ();
        // window.addEventListener ('resize', handleResize);
        initializePieces (SIZE.rows, SIZE.columns);
        updateCanvas ();
    })()

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

function addEventListeners () {
    CANVAS.addEventListener ("mousedown", onMouseDown);
    CANVAS.addEventListener ("mousemove", onMouseMove);
    CANVAS.addEventListener ("mouseup", onMouseUp);

    CANVAS.addEventListener ("touchstart", onTouchStart);
    CANVAS.addEventListener ("touchmove", onTouchMove);
    CANVAS.addEventListener ("touchend", onTouchEnd);
}

function onTouchStart (evt) {
    let loc={x: evt.touches[0].clientX, y: evt.touches[0].clientY};
    onMouseDown (loc);
}

function onTouchMove (evt) {
    let loc={x: evt.touches[0].clientX, y: evt.touches[0].clientY};
    onMouseMove (loc);
}

function onTouchEnd () {
    onMouseUp ();
}

function onMouseDown (evt) {
    SELECTED_PIECE = getPressPiece (evt);
    if (SELECTED_PIECE != null) {
        const index = PIECES.indexOf (SELECTED_PIECE);
        if (index > -1) {
            PIECES.splice (index, 1);
            PIECES.push (SELECTED_PIECE);
        }
        SELECTED_PIECE.offset = {
            x: evt.x - SELECTED_PIECE.x,
            y: evt.y - SELECTED_PIECE.y,
        }
    }
}

function onMouseMove (evt) {
    if (SELECTED_PIECE != null) {
        SELECTED_PIECE.x = evt.x - SELECTED_PIECE.offset.x;
        SELECTED_PIECE.y = evt.y - SELECTED_PIECE.offset.y;
    }
}

function onMouseUp () {
    if (SELECTED_PIECE) {
        if (SELECTED_PIECE.isClose ()) {
            SELECTED_PIECE.snap ();
        }
    }
    SELECTED_PIECE = null;
}

function getPressPiece (loc) {
    for (let i=PIECES.length - 1; i>=0; i--) {
        if (loc.x > PIECES[i].x && loc.x < PIECES[i].x + PIECES[i].width &&
            loc.y > PIECES[i].y && loc.y < PIECES[i].y + PIECES[i].height
            ) {
                return PIECES [i];
            }
    }
    return null;
}

function handleResize () {

    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;

    let resizer = SCALER * Math.min (window.innerWidth / image.width, window.innerHeight / image.height);
    SIZE.width = resizer*image.width;
    SIZE.height = resizer * image.height;
    SIZE.x = window.innerWidth / 2 - SIZE.width / 2;
    SIZE.y = window.innerHeight / 2 - SIZE.height / 2;
}

function updateCanvas () {
    CONTEXT.clearRect (0,0, CANVAS.width, CANVAS.height);

    CONTEXT.globalAlpha = 0.5;

    CONTEXT.drawImage (image, SIZE.x, SIZE.y, SIZE.width, SIZE.height);

    CONTEXT.globalAlpha = 1;

    for (let i=0; i<PIECES.length; i++) {
        PIECES[i].draw (CONTEXT);
    }
    window.requestAnimationFrame (updateCanvas);
}

function initializePieces (rows, cols) {
    SIZE.rows = rows;
    SIZE.columns = cols;
    PIECES = [];
    for (let i=0; i<SIZE.rows; i++) {
        for (let j=0; j<SIZE.columns; j++) {
            PIECES.push (new Piece (i,j));
        }
    }
}

function randomizePiece () {
    for (let i=0; i<PIECES.length; i++) {
        let loc = {
            x: Math.random () * (CANVAS.width - PIECES[i].width),
            y: Math.random () * (CANVAS.height - PIECES[i].height),
        }
        PIECES[i].x = loc.x;
        PIECES[i].y = loc.y;
    }
}

class Piece {
    constructor (rowIndex, colIndex) {
        this.rowIndex = rowIndex;
        this.colIndex = colIndex;
        this.x= SIZE.x + SIZE.width * this.colIndex / SIZE.columns;
        this.y = SIZE.y + SIZE.height * this.rowIndex / SIZE.rows;
        this.width = SIZE.width / SIZE.columns;
        this.height = SIZE.height / SIZE.rows;
        this.xCorrect = this.x;
        this.yCorrect = this.y;
    }
    draw (context) {
        context.beginPath ();

        context.drawImage (image, 
                this.colIndex * image.width / SIZE.columns,
                this.rowIndex * image.height / SIZE.rows,
                image.width / SIZE.columns,
                image.height / SIZE.rows,
                this.x,
                this.y,
                this.width,
                this.height,
            );

        context.rect (this.x, this.y, this.width, this.height);
        context.stroke ();
    }

    isClose () {
        if (distance ({x: this.x, y: this.y},
                {x: this.xCorrect, y:this.yCorrect}) < this.width / 3) {
                    return true;
        }
        return false;
    }
    snap () {
        this.x = this.xCorrect;
        this.y = this.yCorrect;
    }
}

function distance (p1, p2) {
    return Math.sqrt (
        (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y)
    )
}