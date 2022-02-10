import { tileCount, ctx } from "../script.js";

const apple = new Image();
apple.src = "./apple.png";

const drawApple = (appleX, appleY) => {
    //this will draw an apple (img)
    ctx.drawImage(apple, appleX * tileCount, appleY * tileCount, 20, 20);
};
apple.onload = () => {
    //wait until image is loaded
    drawApple(); //draw apple after image is loaded
};

export { drawApple };
