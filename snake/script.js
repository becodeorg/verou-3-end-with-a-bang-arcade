import { changeSpeed } from "./modules/speed.js";
import { drawApple } from "./modules/apple.js";

const snakeBoard = document.getElementById("snakeCanvas");
export const ctx = snakeBoard.getContext("2d");

class SnakePart {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
export let speed = 7;
//modify function https://stackoverflow.com/questions/53723251/javascript-modifing-an-imported-variable-causes-assignment-to-constant-varia
export const modifySpeed = (value) => {
    speed = value;
};

export let tileCount = 20; //to get from 1 side of canvas to other side, it takes 20 tiles
let tileSize = snakeBoard.width / tileCount - 2; //if size of canvas or tileCount changes, this will be new tileSize
let snakeHeadX = 10;
let snakeHeadY = 10;
const snakeParts = [];
let tailLength = 2;

/*const apple = new Image();
apple.src = "./apple.png";
apple.onload = () => {
    //wait until image is loaded
    drawApple(); //draw apple after image is loaded
};*/

let appleX = Math.floor(Math.random() * tileCount);
let appleY = Math.floor(Math.random() * tileCount);
const gulpSound = new Audio("biteAppleSound.mp3");
const gameOverSound = new Audio("arcadeGameTone.mp3");

let xVelocity = 0;
let yVelocity = 0;

export let playerScore = 0;
let playerHighScore = 0;

const clearCanvas = () => {
    //select the colour to fill the drawing
    ctx.fillStyle = "rgb(17, 5, 44)";
    //select the colour for the border of the canvas
    ctx.strokestyle = "black";
    ctx.lineWidth = 5;
    //draw filled rectangle to cover entire canvas
    ctx.fillRect(0, 0, snakeBoard.width, snakeBoard.height);
    //draw border around canvas
    ctx.strokeRect(0, 0, snakeBoard.width, snakeBoard.height);
};

const drawSnake = () => {
    ctx.fillStyle = "lightgreen"; //this is colour of snake body
    for (let i = 0; i < snakeParts.length; i++) {
        let part = snakeParts[i];
        ctx.fillRect(
            part.x * tileCount,
            part.y * tileCount,
            tileSize,
            tileSize
        );
    }
    snakeParts.push(new SnakePart(snakeHeadX, snakeHeadY)); //each time snake is drawn, we push a part to where the head was
    while (snakeParts.length > tailLength) {
        snakeParts.shift(); //The shift() method removes the 1st element from array + returns that removed element + changes the length of the array
    }

    ctx.fillStyle = "#FF4848"; //this is colour of snake head
    ctx.fillRect(
        snakeHeadX * tileCount,
        snakeHeadY * tileCount,
        tileSize,
        tileSize
    );
};

const snakeDirection = (event) => {
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

/*const drawApple = () => {
    //this will draw an apple (img)
    ctx.drawImage(apple, appleX * tileCount, appleY * tileCount, 20, 20);
};*/

const score = () => {
    const score = document.getElementById("score");
    playerScore++;
    score.innerHTML = playerScore;
};

const checkApplePosition = () => {
    if (appleX === snakeHeadX && appleY === snakeHeadY) {
        // if snakehead and apple collide
        appleX = Math.floor(Math.random() * tileCount); //apple will move to random location inside our canvas
        appleY = Math.floor(Math.random() * tileCount);
        tailLength++; //tail will get longer on collision
        score();
        gulpSound.play();
    }
};

const gameOver = () => {
    let gameOver = false; //initally it's not game over

    if (yVelocity === 0 && xVelocity === 0) {
        //when there's no movement (start game), it's not game over yet
        return (gameOver = false);
    }

    //walls
    if (snakeHeadX < 0 || snakeHeadY < 0) {
        //in case we hit a side of canvas, game over
        gameOver = true;
    } else if (snakeHeadX === tileCount || snakeHeadY === tileCount) {
        gameOver = true;
    }
    //snake body
    for (let i = 0; i < snakeParts.length; i++) {
        let part = snakeParts[i];
        if (part.x === snakeHeadX && part.y === snakeHeadY) {
            gameOver = true;
            break; //stop looping
        }
    }
    if (gameOver) {
        ctx.fillStyle = "rgb(233, 0, 255)";
        ctx.font = "50px monospace";
        ctx.fillText("Game Over!", snakeBoard.width / 5, snakeBoard.height / 2);
        gameOverSound.play();
    }
    return gameOver;
};

const gameLoop = () => {
    changeSnakeDirection();
    let result = gameOver();
    if (result) {
        return;
    }

    clearCanvas();

    checkApplePosition();
    drawApple(appleX, appleY);
    drawSnake();

    changeSpeed();
    setTimeout(gameLoop, 1000 / speed);
};
gameLoop();

const restart = () => {
    location.reload(); //this does the same as refresh page :) finally something simple
};
const restartbtn = document.getElementById("restart");
restartbtn.addEventListener("click", restart);
