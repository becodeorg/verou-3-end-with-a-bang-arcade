import { game, cells, pacMan, cellTypes, WIN, checkIfCellIsTypes, checkGhostContact, checkFood, endGame } from "./index.js";



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


export const pacManMovementHandler = () => {
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