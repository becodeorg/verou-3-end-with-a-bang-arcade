const snakeBoard = document.getElementById("snakeCanvas");
const ctx = snakeBoard.getContext("2d");

let speed = 7;

let tileCount = 20; //to get from 1 side of canvas to other side, it takes 20 tiles
let tileSize = snakeBoard.width / tileCount - 2; //if size of canvas or tileCount changes, this will be new tileSize
let snakeHeadX = 10;
let snakeHeadY = 10;

let xVelocity = 0;
let yVelocity = 0;

function clearCanvas() {
    //select the colour to fill the drawing
    ctx.fillStyle = "white";
    //select the colour for the border of the canvas
    ctx.strokestyle = "black";
    //draw filled rectangle to cover entire canvas
    ctx.fillRect(0, 0, snakeBoard.width, snakeBoard.height);
    //draw border around canvas
    ctx.strokeRect(0, 0, snakeBoard.width, snakeBoard.height);
}

const drawSnake = () => {
    ctx.fillStyle = "lightgreen";
    ctx.fillRect(
        snakeHeadX * tileCount,
        snakeHeadY * tileCount,
        tileSize,
        tileSize
    );
};

const snakeDirection = (event) => {
    console.log(event);
    //up
    if (event.key === "w" || event.key === "ArrowUp") {
        yVelocity = -1; //moving on y-axis: you'll move up
        xVelocity = 0; //moving on x-axis will stop cause you'll move on y-axis
    }
};
const body = document.querySelector("body");
body.addEventListener("keydown", snakeDirection);

const changeSnakeDirection = () => {
    snakeHeadX = snakeHeadX + xVelocity;
    snakeHeadY = snakeHeadY + yVelocity;
};

const gameLoop = () => {
    clearCanvas();
    changeSnakeDirection();
    drawSnake();
    setTimeout(gameLoop, 1000 / speed);
};
gameLoop();
