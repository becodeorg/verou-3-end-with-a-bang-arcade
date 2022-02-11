import { game, pacMan, cellTypes, checkIfCellIsTypes, runGame } from "./index.js";


// ----- KEYBOARD CONTROLS -----

const handleMovementInput = (pressedKey) => {
    switch (pressedKey) {
        case "ArrowUp":
        case "w": // up
            if (!checkIfCellIsTypes(pacMan.location - game.GAME_FIELD_WIDTH, [cellTypes.WALL, cellTypes.GHOST_LAIR])) {
                pacMan.movementDirection = "w";
            } else {
                pacMan.queuedDirection = "w";
            }
            break;

        case "ArrowLeft":
        case "a": // left
            if (!checkIfCellIsTypes(pacMan.location - 1, [cellTypes.WALL, cellTypes.GHOST_LAIR])) {
                pacMan.movementDirection = "a";
            } else {
                pacMan.queuedDirection = "a";
            }
            break;

        case "ArrowDown":
        case "s": // down
            if (!checkIfCellIsTypes(pacMan.location + game.GAME_FIELD_WIDTH, [cellTypes.WALL, cellTypes.GHOST_LAIR])) {
                pacMan.movementDirection = "s";
            } else {
                pacMan.queuedDirection = "s";
            }
            break;

        case "ArrowRight":
        case "d": // right
            if (!checkIfCellIsTypes(pacMan.location + 1, [cellTypes.WALL, cellTypes.GHOST_LAIR])) {
                pacMan.movementDirection = "d";
            } else {
                pacMan.queuedDirection = "d";
            }
            break;

        default:
            break;
    }
};

export const handleKeyEvent = (event) => {
    const pressedKey = event.key;
    if (!game.gameRunning) {
        if (pressedKey === "ArrowUp"
            || pressedKey === "w"
            || pressedKey === "ArrowLeft"
            || pressedKey === "a"
            || pressedKey === "ArrowDown"
            || pressedKey === "s"
            || pressedKey === "ArrowRight"
            || pressedKey === "d") {
            runGame();
        }
    } else {
        handleMovementInput(pressedKey);
    }
}


// ----- KEYBOARD CONTROLS -----
// https://stackoverflow.com/questions/2264072/detect-a-finger-swipe-through-javascript-on-the-iphone-and-android

let xDown = null;
let yDown = null;

export const handleTouchMove = (event) => {
    if (!xDown || !yDown) {
        return;
    }

    if (!game.gameRunning) {
        runGame();
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