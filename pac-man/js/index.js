// IMPORTS

import gameFieldLayout from "./gameFieldLayout.js";
import { handleKeyEvent, handleTouchStart, handleTouchMove } from "./controls.js";


// GLOBAL VARIABLES
document.documentElement.style.setProperty("--view-port-height", window.innerHeight + "px");

// cell classes
export const cellTypes = {
    WALL: "type-1",
    PELLET: "type-0",
    GHOST_LAIR: "type-2",
    POWER_PELLET: "type-3",
    EMPTY: "type-4",
};

const moveModes = {
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
const cells = domElems.gameFieldGrid.children;

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

const ghosts = [];

const intervalIDs = {
    ghostMovementHandlerIntervalID: {},
    pathFindingIntervalID: undefined,
};



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

    for (const [key, value] of Object.entries(intervalIDs.ghostMovementHandlerIntervalID)) {
        clearInterval(value);
    }
    clearInterval(intervalIDs.pathFindingIntervalID);
    clearInterval(intervalIDs.startPacManMovingID);

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



// ----- GHOSTS -----


const getNeighbors = (location) => {
    const neighbors = [];
    const rightNeighbor = location + 1;
    const leftNeighbor = location - 1;
    const upNeighbor = location + game.GAME_FIELD_WIDTH;
    const downNeighbor = location - game.GAME_FIELD_WIDTH;

    if (!checkIfCellIsTypes(rightNeighbor, [cellTypes.WALL])) {
        neighbors.push(rightNeighbor);
    }
    if (!checkIfCellIsTypes(leftNeighbor, [cellTypes.WALL])) {
        neighbors.push(leftNeighbor);
    }
    if (!checkIfCellIsTypes(upNeighbor, [cellTypes.WALL])) {
        neighbors.push(upNeighbor);
    }
    if (!checkIfCellIsTypes(downNeighbor, [cellTypes.WALL])) {
        neighbors.push(downNeighbor);
    }

    return (neighbors);
};

const pathFinding = async (startLocation) => {
    const floodFrontier = [];
    const trailTrace = {};
    let ghostsMoved = 0;

    floodFrontier.push(startLocation);

    while (floodFrontier.length > 0) {
        const currentCell = floodFrontier.shift();
        const neighborsOfCurrentCell = getNeighbors(currentCell);

        for (const neighborCell of neighborsOfCurrentCell) {
            if (!(neighborCell in trailTrace)) {
                floodFrontier.push(neighborCell);
                trailTrace[neighborCell] = currentCell;

                // cells[neighborCell].classList.add("pathfinding");

                for (const ghost of ghosts) {
                    if (neighborCell === ghost.location) {
                        ghost.pathFinder = currentCell;
                        ghostsMoved++;
                    }
                }

                if (ghostsMoved === ghosts.length) {
                    return;
                }

                // await sleep(10);
            }
        }
    }
}


const moveGhost = (ghost, direction) => {
    // if there is another ghost in the cell, only remove ghost.name
    let otherGhostPresent = false;

    for (const otherGhost of ghosts) {
        if (otherGhost.location === ghost.location
            && otherGhost.name !== ghost.name) {
            otherGhostPresent = true;
        }
    }
    if (otherGhostPresent) {
        cells[ghost.location].classList.remove(ghost.name);
    } else {
        cells[ghost.location].classList.remove("ghost", ghost.name, ghost.afraidStatus);
    }

    ghost.location = direction;
    cells[ghost.location].classList.add("ghost", ghost.name, ghost.afraidStatus);
};

const attemptToMoveInDirection = (ghost, requestedLocation) => {
    if (!checkIfCellIsTypes(requestedLocation, [cellTypes.WALL])) {
        moveGhost(ghost, requestedLocation);
        return (true);
    } else {
        return (false);
    }
}

const getCoords = (location) => {
    const coords = [];

    coords.x = location % game.GAME_FIELD_WIDTH;
    coords.y = Math.floor(location / game.GAME_FIELD_WIDTH);

    return (coords);
};

const attemptXAxisMove = (ghost, xDelta) => {
    if (xDelta > 0) {
        return (attemptToMoveInDirection(ghost, ghost.location - 1)); // left
    } else {
        return (attemptToMoveInDirection(ghost, ghost.location + 1)); // right
    }
}

const attemptYAxisMove = (ghost, yDelta) => {
    if (yDelta > 0) {
        return (attemptToMoveInDirection(ghost, ghost.location - 28)); // up
    } else {
        return (attemptToMoveInDirection(ghost, ghost.location + 28)); // down
    }
}

const moveGhostInDirectionOfPacMan = (ghost) => {
    const ghostCoords = getCoords(ghost.location);
    const pacManCoords = getCoords(pacMan.location);
    const xDelta = ghostCoords.x - pacManCoords.x;
    const yDelta = ghostCoords.y - pacManCoords.y;

    if (Math.abs(xDelta) > Math.abs(yDelta)) {
        if (attemptXAxisMove(ghost, xDelta) === false) {
            if (yDelta === 0) { // facing a wall
                return (false);
            } else {
                return (attemptYAxisMove(ghost, yDelta));
            }
        }
    } else {
        if (attemptYAxisMove(ghost, yDelta) === false) {
            if (xDelta === 0) { // facing a wall
                return (false);
            } else {
                return (attemptXAxisMove(ghost, xDelta));
            }
        }
    }

    return (true);
};


const moveGhostAwayFromPacMan = (ghost) => {
    const directionPossibilities = [];
    const left = ghost.location - 1;
    const right = ghost.location + 1;
    const up = ghost.location - 28;
    const down = ghost.location + 28;

    if (!checkIfCellIsTypes(up, [cellTypes.WALL])) {
        directionPossibilities.push(up);
    }
    if (!checkIfCellIsTypes(down, [cellTypes.WALL])) {
        directionPossibilities.push(down);
    }
    if (!checkIfCellIsTypes(left, [cellTypes.WALL])) {
        directionPossibilities.push(left);
    }
    if (!checkIfCellIsTypes(right, [cellTypes.WALL])) {
        directionPossibilities.push(right);
    }

    if (directionPossibilities.includes(ghost.pathFinder)) {
        const index = directionPossibilities.indexOf(ghost.pathFinder);
        directionPossibilities.splice(index, 1);
    }

    let movementDirection;
    if (directionPossibilities.length > 1) {
        const randNum = Math.floor(Math.random() * directionPossibilities.length);
        movementDirection = directionPossibilities[randNum];
    } else if (directionPossibilities.length === 1) {
        movementDirection = directionPossibilities[0];
    } else {
        return;
    }

    moveGhost(ghost, movementDirection);
};


// let bravery = 0;

const ghostMovementHandler = (ghost) => {
    if (!game.gameRunning) {
        return;
    }

    if (game.powerPelletActive) {
        moveGhostAwayFromPacMan(ghost);
    } else if (ghost.movementMode === moveModes.PATHFINDING) {
        moveGhost(ghost, ghost.pathFinder);
    } else if (ghost.movementMode === moveModes.DIRECT) {
        if (moveGhostInDirectionOfPacMan(ghost) === false) {
            ghost.movementMode = moveModes.PATHFINDING;
            setTimeout(() => {
                ghost.movementMode = moveModes.DIRECT;
            }, 5000);
        }
    } else {
        if (ghost.bravery === 20) {
            ghost.bravery = 0;
        } else {
            ghost.bravery++;
        }

        const locationType = cells[ghost.location].classList[1];
        if (ghost.bravery >= 10 || locationType === cellTypes.GHOST_LAIR) {
            moveGhost(ghost, ghost.pathFinder);
        } else {
            moveGhostAwayFromPacMan(ghost);
        }
    }

    if (ghost.location === pacMan.location) {
        ghostContact(ghost);
    }
    setTimeout(ghostMovementHandler, ghost.speed - game.ghostSpeedIncrease, ghost);
}



// ----- PAC-MAN -----


const eatGhost = (ghost) => {
    console.log("ate " + ghost.name);

    moveGhost(ghost, ghost.startLocation);

    game.score += 100;
    game.ghostSpeedIncrease = -150;
}

const ghostContact = (ghost) => {
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
    console.log("run game");

    game.gameRunning = true;

    if (game.statusPrevGame !== undefined) {
        refreshGameField();
        console.log("not a new game");
    }
    if (game.statusPrevGame === GAME_OVER) {
        console.log("game after game-over");
        game.ghostSpeedIncrease = 0;
        game.score = 0;
        game.numberOfWins = 0;
    } else if (game.statusPrevGame === WIN) {
        console.log("game after " + game.numberOfWins + " wins");
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
    intervalIDs.pathFindingIntervalID = setInterval(() => {
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
