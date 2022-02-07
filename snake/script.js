let snake = [
    //starting coordinates for snake
    { x: 200, y: 200 },
    { x: 190, y: 200 },
    { x: 180, y: 200 },
    { x: 170, y: 200 },
    { x: 160, y: 200 },
];

const snakeBoard = document.getElementById("snakeCanvas");
const snakeBoard_ctx = snakeBoard.getContext("2d");

function drawCanvas() {
    //select the colour to fill the drawing
    snakeBoard_ctx.fillStyle = "white";
    //select the colour for the border of the canvas
    snakeBoard_ctx.strokestyle = "black";
    //draw filled rectangle to cover entire canvas
    snakeBoard_ctx.fillRect(0, 0, snakeBoard.width, snakeBoard.height);
    //draw border around canvas
    snakeBoard_ctx.strokeRect(0, 0, snakeBoard.width, snakeBoard.height);
}

const runGame = () => {
    drawCanvas();
};

runGame();
