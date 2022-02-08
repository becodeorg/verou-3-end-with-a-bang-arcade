// IMPORTS

import gameFieldLayout from "./gameFieldLayout.js";


// GLOBAL VARIABLES

// cell classes
const WALL = "type-1";
const PELLET = "type-0";
const GHOST_LAIR = "type-2";
const POWER_PELLET = "type-3";
const EMPTY = "type-4";

const PATHFINDING = "pathfinding";
const DIRECT = "direct";
const AWAY = "away"

let pacManLocation = 490; // game field index

class Ghost {
    constructor(name, speed, location, movementMode) {
        this.name = name;
        this.speed = speed;
        this.location = location;
        this.movementMode = movementMode;
    }
    pathFinder;
}

const ghosts = [
    new Ghost("Blinky", 150, 347, PATHFINDING),
    new Ghost("Pinky", 150, 403, DIRECT),
    new Ghost("Inky", 200, 408, DIRECT),
    new Ghost("Clyde", 200, 352, AWAY),
]

const intervalIDs = {
    ghostMovementHandlerIntervalID: {},
    pathFindingIntervalID: undefined,
};


// FUNCTIONS

// SET UP

// fill grid with cells
const gameFieldGrid = document.querySelector(".game-field");
const createGameField = () => {

    for (let i = 0; i < gameFieldLayout.length; i++) {
        const newCell = document.createElement("div");
        newCell.classList.add("cell", "type-" + gameFieldLayout[i]);
        gameFieldGrid.append(newCell);
    }
};
createGameField();

// place pac-man on game field
gameFieldGrid.children[pacManLocation].classList.add("pac-man")

// place ghosts on game field
for (const ghost of ghosts) {
    gameFieldGrid.children[ghost.location].classList.add(ghost.name);
}


// PAC-MAN

const checkForFood = () => {
    const location = gameFieldGrid.children[pacManLocation];
    if (location.classList.contains(PELLET)) {
        location.classList.remove(PELLET);
        location.classList.add(EMPTY);
    }
};

const attemptMove = (requestedLocation) => {
    const requestedLocationType = gameFieldGrid.children[requestedLocation].classList[1];

    if (requestedLocationType != WALL
        && requestedLocationType != GHOST_LAIR) {

        gameFieldGrid.children[pacManLocation].classList.remove("pac-man");
        gameFieldGrid.children[requestedLocation].classList.add("pac-man");
        pacManLocation = requestedLocation;
    }
};

const gameFieldWidth = 28;
const movePacMan = (event) => {
    const pressedKey = event.key;

    switch (pressedKey) {
        case "w": // up
            attemptMove(pacManLocation - gameFieldWidth);
            break;
        case "a": // left
            if (pacManLocation === 364) {
                attemptMove(391)
            } else {
                attemptMove(pacManLocation - 1);
            }
            break;
        case "s": // down
            attemptMove(pacManLocation + gameFieldWidth);
            break;
        case "d": // right
            if (pacManLocation === 391) {
                attemptMove(364);
            } else {
                attemptMove(pacManLocation + 1);
            }
            break;

        default:
            break;
    }

    // console.log(pacManLocation);
    checkForFood();
}


// GHOSTS

const sleep = ms => new Promise(r => setTimeout(r, ms));

const moveGhost = (ghost, direction) => {
    gameFieldGrid.children[ghost.location].classList.remove(ghost.name);
    ghost.location = direction;
    gameFieldGrid.children[ghost.location].classList.add(ghost.name);
};

const checkIfCellIsWall = (location) => {
    if (gameFieldGrid.children[location].classList.contains(WALL)) {
        return (true);
    } else {
        return (false);
    }
}

const getNeighbors = (location) => {
    const neighbors = [];
    const rightNeighbor = location + 1;
    const leftNeighbor = location - 1;
    const upNeighbor = location + gameFieldWidth;
    const downNeighbor = location - gameFieldWidth;

    if (checkIfCellIsWall(rightNeighbor) === false) {
        neighbors.push(rightNeighbor);
    }
    if (checkIfCellIsWall(leftNeighbor) === false) {
        neighbors.push(leftNeighbor);
    }
    if (checkIfCellIsWall(upNeighbor) === false) {
        neighbors.push(upNeighbor);
    }
    if (checkIfCellIsWall(downNeighbor) === false) {
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

                // gameFieldGrid.children[neighborCell].classList.add("pathfinding");

                if (neighborCell === ghosts[0].location) {
                    ghosts[0].pathFinder = currentCell;
                    ghostsMoved++;
                } else if (neighborCell === ghosts[1].location) {
                    ghosts[1].pathFinder = currentCell;
                    ghostsMoved++;
                } else if (neighborCell === ghosts[2].location) {
                    ghosts[2].pathFinder = currentCell;
                    ghostsMoved++;
                } else if (neighborCell === ghosts[3].location) {
                    ghosts[3].pathFinder = currentCell;
                    ghostsMoved++;
                }

                if (ghostsMoved === 4) {
                    return;
                }

                // await sleep(10);
            }
        }
    }
}


const attemptToMoveInDirection = (ghost, requestedLocation) => {
    const requestedLocationType = gameFieldGrid.children[requestedLocation].classList[1];

    if (requestedLocationType != WALL) {
        gameFieldGrid.children[ghost.location].classList.remove(ghost.name);
        gameFieldGrid.children[requestedLocation].classList.add(ghost.name);
        ghost.location = requestedLocation;
        return (true);
    } else {
        return (false);
    }
}

const getCoords = (location) => {
    const coords = [];

    coords.x = location % gameFieldWidth;
    coords.y = Math.floor(location / gameFieldWidth);

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
    const pacManCoords = getCoords(pacManLocation);
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

    if (!checkIfCellIsWall(up)) {
        directionPossibilities.push(up);
    }
    if (!checkIfCellIsWall(down)) {
        directionPossibilities.push(down);
    }
    if (!checkIfCellIsWall(left)) {
        directionPossibilities.push(left);
    }
    if (!checkIfCellIsWall(right)) {
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
    } else {
        movementDirection = directionPossibilities[0];
    }

    gameFieldGrid.children[ghost.location].classList.remove(ghost.name);
    gameFieldGrid.children[movementDirection].classList.add(ghost.name);
    ghost.location = movementDirection;
};


intervalIDs.pathFindingIntervalID = setInterval(() => {
    pathFinding(pacManLocation);
}, 100);


const gameOver = () => {
    for (const [key, value] of Object.entries(intervalIDs.ghostMovementHandlerIntervalID)) {
        clearInterval(value);
    }
    clearInterval(intervalIDs.pathFindingIntervalID);
}

let counter = 0;
let brave = false;

const ghostMovementHandler = (ghost) => {
    intervalIDs.ghostMovementHandlerIntervalID[ghost.name] = setInterval(() => {
        if (ghost.movementMode === PATHFINDING) {
            moveGhost(ghost, ghost.pathFinder);
        } else if (ghost.movementMode === DIRECT) {
            if (moveGhostInDirectionOfPacMan(ghost) === false) {
                ghost.movementMode = PATHFINDING;
                setTimeout(() => {
                    ghost.movementMode = DIRECT;
                }, 5000);
            }
        } else {
            if (counter === 10) {
                counter = 1;
                brave = !brave;
            } else {
                counter++;
            }

            const locationType = gameFieldGrid.children[ghost.location].classList[1];
            if (brave || locationType === GHOST_LAIR) {
                moveGhost(ghost, ghost.pathFinder);
            } else {
                moveGhostAwayFromPacMan(ghost);
            }
        }
        if (ghost.location === pacManLocation) {
            console.log("game over");
            gameOver();
        }
    }, ghost.speed);
}
ghostMovementHandler(ghosts[0]);
ghostMovementHandler(ghosts[1]);
ghostMovementHandler(ghosts[2]);
ghostMovementHandler(ghosts[3]);


// EVENT LISTENERS

window.addEventListener("keydown", movePacMan);
