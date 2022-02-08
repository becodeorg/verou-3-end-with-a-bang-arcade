const snakeBoard = document.getElementById("snakeCanvas");
const ctx = snakeBoard.getContext("2d");

let speed = 7;

let tileCount = 20; //to get from 1 side of canvas to other side, it takes 20 tiles
let tileSize = snakeBoard.width / tileCount - 2; //if size of canvas or tileCount changes, this will be new tileSize
let snakeHeadX = 10;
let snakeHeadY = 10;

let appleX = 5;
let appleY = 5;

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
    ctx.fillStyle = "red";
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
        if (yVelocity == 1) {
            //in case you want to move up while going down, you'll crash in own body so this is not allowed
            return; //this will stop the function, can't move up when going down
        }
        yVelocity = -1; //moving on y-axis: you'll move up
        xVelocity = 0; //moving on x-axis will stop cause you'll move on y-axis
    }
    //down
    if (event.key === "s" || event.key === "ArrowDown") {
        if (yVelocity == -1) {
            //in case moving up, we can't move down
            return;
        }
        yVelocity = 1;
        xVelocity = 0;
    }
    //left
    if (event.key === "a" || event.key === "ArrowLeft") {
        if (xVelocity == 1) {
            //in case moving right, can't move left
            return;
        }
        yVelocity = 0;
        xVelocity = -1;
    }
    //right
    if (event.key === "d" || event.key === "ArrowRight") {
        if (xVelocity == -1) {
            //in case moving left, can't move right
            return;
        }
        yVelocity = 0;
        xVelocity = 1;
    }
};
document.body.addEventListener("keydown", snakeDirection);

const changeSnakeDirection = () => {
    snakeHeadX = snakeHeadX + xVelocity;
    snakeHeadY = snakeHeadY + yVelocity;
};

const drawApple = () => {
    ctx.fillStyle = "green";
    ctx.fillRect(appleX * tileCount, appleY * tileCount, tileSize, tileSize);
};

const checkApplePosition = () => {
    if (appleX === snakeHeadX && appleY === snakeHeadY) {
        // if snakehead and apple collide
        appleX = Math.floor(Math.random() * tileCount); //apple will move to random location inside our canvas
        appleY = Math.floor(Math.random() * tileCount);
    }
};

const gameLoop = () => {
    clearCanvas();
    changeSnakeDirection();
    checkApplePosition();
    drawApple();
    drawSnake();
    setTimeout(gameLoop, 1000 / speed);
};
gameLoop();
