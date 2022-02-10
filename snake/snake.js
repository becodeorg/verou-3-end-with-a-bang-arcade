class SnakePart {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

let snakeHeadX = 10;
let snakeHeadY = 10;
const snakeParts = [];

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
