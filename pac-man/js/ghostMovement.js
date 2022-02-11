import { game, pacMan, ghosts, moveModes, cellTypes, cells, checkIfCellIsTypes, ghostContact } from "./index.js";



export const moveGhost = (ghost, direction) => {
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



export const ghostMovementHandler = (ghost) => {
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
    setTimeout(ghostMovementHandler, ghost.speed, ghost);
}
