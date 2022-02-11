// IMPORTS

import gameFieldLayout from "./gameFieldLayout.js";
import { handleKeyEvent, handleTouchStart, handleTouchMove } from "./controls.js";
import { pathFinding } from "./pathFinding.js";
import { ghostMovementHandler, moveGhost } from "./ghostMovement.js";


// GLOBAL VARIABLES
document.documentElement.style.setProperty("--view-port-height", window.innerHeight + "px");

export const cellTypes = {
    WALL: "type-1",
    PELLET: "type-0",
    GHOST_LAIR: "type-2",
    POWER_PELLET: "type-3",
    EMPTY: "type-4",
};

export const moveModes = {
    PATHFINDING: "pathfinding",
    DIRECT: "direct",
    STRANGE: "away",
};

const AFRAID = "afraid";
const UNAFRAID = "unafraid";

const WIN = true;
const GAME_OVER = false;

export const game = {
    statusPrevGame: undefined, // undefined: new game, false: game-over, true; win
    numberOfWins: 0,
    GAME_FIELD_WIDTH: 28,
    gameRunning: false,
    powerPelletActive: false,
    score: 0,
    ghostSpeedIncrease: 0,
    startingFoodAmount: gameFieldLayout.filter(x => x == 0).length,
    pathFindingIntervalID: undefined,
};

export const pacMan = {
    speed: 150,
    movementDirection: undefined,
    queuedDirection: undefined,
    location: undefined, // game field index
}

const domElems = {
    defaultMessageDiv: document.querySelector(".default"),
    gameOverMessageDiv: document.querySelector(".game-over"),
    winMessageDiv: document.querySelector(".win"),
    gameOverScoreP: document.querySelector(".game-over .score"),
    winScoreP: document.querySelector(".win .score"),
    gameFieldGrid: document.querySelector(".game-field"),
}
export const cells = domElems.gameFieldGrid.children;

class Ghost {
    constructor(name, speed, location, movementMode) {
        this.name = name;
        this.speed = speed;
        this.startLocation = location;
        this.location = location;
        this.movementMode = movementMode;
    }
    pathFinder;
    afraidStatus = UNAFRAID;
    bravery = 0;
}

export const ghosts = [];




// FUNCTIONS


const createGameField = () => {
    for (let i = 0; i < gameFieldLayout.length; i++) {
        const newCell = document.createElement("div");
        newCell.classList.add("cell", "type-" + gameFieldLayout[i]);
        domElems.gameFieldGrid.append(newCell);
    }
};
createGameField();


const refreshGameField = () => {
    for (let i = 0; i < cells.length; i++) {
        cells[i].className = "cell type-" + gameFieldLayout[i];
    }
};


const endGame = (status) => {
    window.removeEventListener("keydown", handleKeyEvent);
    document.removeEventListener("touchstart", handleTouchStart, false);
    document.removeEventListener("touchmove", handleTouchMove, false);

    if (status === WIN) {
        console.log("YOU WIN!");
        domElems.winMessageDiv.style.display = "block";
        game.statusPrevGame = WIN;
        game.numberOfWins++;
        domElems.winScoreP.textContent = "score: " + game.score + " / win-streak: " + game.numberOfWins;
    } else {
        console.log("GAME OVER!");
        domElems.gameOverMessageDiv.style.display = "block";
        game.statusPrevGame = GAME_OVER;
        domElems.gameOverScoreP.textContent = "score: " + game.score + " / win-streak: " + game.numberOfWins;
    }

    clearInterval(game.pathFindingIntervalID);

    game.gameRunning = false;

    setTimeout(() => { // so game isn't restarted too quickly
        window.addEventListener("keydown", handleKeyEvent);
        document.addEventListener("touchstart", handleTouchStart, false);
        document.addEventListener("touchmove", handleTouchMove, false);
    }, 1000);
}


export const checkIfCellIsTypes = (location, types) => {
    const locationType = cells[location].classList[1];
    return (types.includes(locationType));
}


const sleep = ms => new Promise(r => setTimeout(r, ms));



// ----- PAC-MAN -----


const eatGhost = (ghost) => {
    console.log("ate " + ghost.name);

    moveGhost(ghost, ghost.startLocation);

    game.score += 100;
    game.ghostSpeedIncrease = -150;
}

export const ghostContact = (ghost) => {
    if (game.powerPelletActive) {
        eatGhost(ghost);
    } else {
        endGame(GAME_OVER);
    }
}

const checkGhostContact = () => {
    if (cells[pacMan.location].classList.contains("ghost")) {
        const ghost = ghosts.filter(ghost => {
            return ghost.location === pacMan.location;
        })
        ghostContact(ghost[0]);
    }
}


const powerPelletCountdown = (countdown) => {
    countdown--;
    document.documentElement.style.setProperty("--pac-man-color", "rgb(230, " + (180 - (countdown * 15)) + ", 19)");
    if (countdown === -1) {
        countdown = 7;
        document.documentElement.style.setProperty("--pac-man-color", "rgb(230, 180, 19)");
        return;
    }
    setTimeout(powerPelletCountdown, 1000, countdown);
}

const eatPowerPellet = (location) => {
    console.log("power pellet active!");
    location.classList.remove(cellTypes.POWER_PELLET);
    location.classList.add(cellTypes.EMPTY);
    game.powerPelletActive = true;
    for (const ghost of ghosts) {
        ghost.afraidStatus = AFRAID;
    }
    game.ghostSpeedIncrease = -100;
    pacMan.speed -= 50;
    powerPelletCountdown(7);
    setTimeout(() => {
        console.log("power pellet wore off");
        game.powerPelletActive = false;
        for (const ghost of ghosts) {
            ghost.afraidStatus = UNAFRAID;
            cells[ghost.location].classList.remove(AFRAID);
        }
        game.ghostSpeedIncrease += 100;
        pacMan.speed += 50;
    }, 7000);
}

const eatPellet = (location) => {
    location.classList.remove(cellTypes.PELLET);
    location.classList.add(cellTypes.EMPTY);
    game.score += 10;
    game.foodRemaining--;
    game.ghostSpeedIncrease++;
}

const checkFood = () => {
    const location = cells[pacMan.location];
    if (location.classList.contains(cellTypes.PELLET)) {
        eatPellet(location);
    } else if (location.classList.contains(cellTypes.POWER_PELLET)
        && game.powerPelletActive === false) {
        eatPowerPellet(location);
    }
};


const attemptMove = (requestedLocation) => {
    if (!checkIfCellIsTypes(requestedLocation, [cellTypes.WALL, cellTypes.GHOST_LAIR])) {
        cells[pacMan.location].classList.remove("pac-man", "w", "a", "s", "d");
        cells[requestedLocation].classList.add("pac-man", pacMan.movementDirection);
        pacMan.location = requestedLocation;

        return (true);
    } else {
        return (false);
    }
};


const pacManMovementHandler = () => {
    if (!game.gameRunning) {
        return;
    }

    // check if queued direction has become an option, else continue in current direction
    if (pacMan.queuedDirection) {
        switch (pacMan.queuedDirection) {
            case "w": // up
                if (!checkIfCellIsTypes(pacMan.location - game.GAME_FIELD_WIDTH, [cellTypes.WALL, cellTypes.GHOST_LAIR])) {
                    pacMan.movementDirection = "w";
                    pacMan.queuedDirection = false;
                }
                break;
            case "a": // left
                if (!checkIfCellIsTypes(pacMan.location - 1, [cellTypes.WALL, cellTypes.GHOST_LAIR])) {
                    pacMan.movementDirection = "a";
                    pacMan.queuedDirection = false;
                }
                break;
            case "s": // down
                if (!checkIfCellIsTypes(pacMan.location + game.GAME_FIELD_WIDTH, [cellTypes.WALL, cellTypes.GHOST_LAIR])) {
                    pacMan.movementDirection = "s";
                    pacMan.queuedDirection = false;
                }
                break;
            case "d": // right
                if (!checkIfCellIsTypes(pacMan.location + 1, [cellTypes.WALL, cellTypes.GHOST_LAIR])) {
                    pacMan.movementDirection = "d";
                    pacMan.queuedDirection = false;
                }
                break;

            default:
                break;
        }
    }

    switch (pacMan.movementDirection) {
        case "w": // up
            attemptMove(pacMan.location - game.GAME_FIELD_WIDTH);
            break;
        case "a": // left
            if (pacMan.location === 364) {
                attemptMove(391)
            } else {
                attemptMove(pacMan.location - 1);
            }
            break;
        case "s": // down
            attemptMove(pacMan.location + game.GAME_FIELD_WIDTH);
            break;
        case "d": // right
            if (pacMan.location === 391) {
                attemptMove(364);
            } else {
                attemptMove(pacMan.location + 1);
            }
            break;

        default:
            break;
    }

    checkGhostContact();
    checkFood();
    if (game.foodRemaining === 0) {
        endGame(WIN);
    }

    setTimeout(pacManMovementHandler, pacMan.speed);
};



// ----- MAIN CONTROL -----

const createGhosts = () => {
    if (ghosts.length > 0) {
        while (ghosts.pop());
    }

    ghosts.push(new Ghost("Blinky", 175, 347, moveModes.PATHFINDING));
    ghosts.push(new Ghost("Pinky", 175, 403, moveModes.DIRECT));
    ghosts.push(new Ghost("Inky", 225, 408, moveModes.DIRECT));
    ghosts.push(new Ghost("Clyde", 225, 352, moveModes.STRANGE));

    if (game.numberOfWins >= 2) {
        ghosts.push(new Ghost("BoneGrinder", 150, 405, moveModes.PATHFINDING));
    }
}

export const runGame = () => {
    game.gameRunning = true;

    if (game.statusPrevGame === GAME_OVER) {
        refreshGameField();
        game.ghostSpeedIncrease = 0;
        game.score = 0;
        game.numberOfWins = 0;
    } else if (game.statusPrevGame === WIN) {
        refreshGameField();
        game.ghostSpeedIncrease = 25 * game.numberOfWins;
    }

    game.foodRemaining = game.startingFoodAmount;

    domElems.defaultMessageDiv.style.display = "none";
    domElems.gameOverMessageDiv.style.display = "none";
    domElems.winMessageDiv.style.display = "none";

    // replace pac-man on game field
    pacMan.location = 490;
    cells[pacMan.location].classList.add("pac-man")

    // start pac-man movement
    pacMan.movementDirection = "a";
    pacMan.queuedDirection = "";
    setTimeout(() => {
        pacManMovementHandler();
    }, 100);

    createGhosts();

    // place ghosts on game field
    for (const ghost of ghosts) {
        cells[ghost.location].classList.add("ghost", ghost.name, ghost.afraidStatus);
    }

    // start pathfinding
    game.pathFindingIntervalID = setInterval(() => {
        pathFinding(pacMan.location);
    }, 100);

    // start ghost movement
    setTimeout(() => { // wait a moment for ghost initialization
        for (const ghost of ghosts) {
            ghostMovementHandler(ghost);
        }
    }, 100);
};



// EVENT LISTENERS


window.addEventListener("keydown", handleKeyEvent);

document.addEventListener("touchstart", handleTouchStart);
document.addEventListener("touchmove", handleTouchMove);
