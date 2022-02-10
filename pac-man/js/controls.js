import { handleMovementInput, gameRunning, runGame } from "./index.js";

// SWIPE CONTROLS
// https://stackoverflow.com/questions/2264072/detect-a-finger-swipe-through-javascript-on-the-iphone-and-android

let xDown = null;
let yDown = null;

export const handleTouchMove = (event) => {
    if (!xDown || !yDown) {
        return;
    }

    if (!gameRunning) {
        runGame();
        // gameRunning = true;
    }
    let xUp = event.touches[0].clientX;
    let yUp = event.touches[0].clientY;

    let xDiff = xDown - xUp;
    let yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) { /*most significant*/
        if (xDiff > 0) {
            handleMovementInput("a")
        } else {
            handleMovementInput("d")
        }
    } else {
        if (yDiff > 0) {
            handleMovementInput("w")
        } else {
            handleMovementInput("s")
        }
    }
    /* reset values */
    xDown = null;
    yDown = null;
};

const getTouches = (event) => {
    return event.touches ||             // browser API
        event.originalEvent.touches; // jQuery
}

export const handleTouchStart = (event) => {
    const firstTouch = getTouches(event)[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
};