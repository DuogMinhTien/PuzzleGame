let VIDEO = null;
let CANVAS = null;
let CONTEXT = null;
let SCALER = 0.8;
let SIZE = {x: 0, y: 0, width: 0, height: 0, rows: 3, columns: 3};
let PIECES = [];

var image = new Image();
image.src = './img.jpg';

function main () {
    CANVAS = document.querySelector ("#myCanvas");
    CONTEXT = CANVAS.getContext ("2d"); 




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
}