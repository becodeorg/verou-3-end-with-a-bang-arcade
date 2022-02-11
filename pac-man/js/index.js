// IMPORTS


import gameFieldLayout from "./gameFieldLayout.js";
import { handleKeyEvent, handleTouchStart, handleTouchMove } from "./controls.js";
import { pathFinding } from "./pathFinding.js";
import { ghostMovementHandler, moveGhost } from "./ghostMovement.js";
import { Ghost } from "./Ghost.js";
import { pacManMovementHandler } from "./pacManMovement.js";



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

export const AFRAID = "afraid";
export const UNAFRAID = "unafraid";

export const WIN = true;
export const GAME_OVER = false;

export const game = {
    statusPrevGame: undefined, // undefined: new game, false: game-over, true; win
    numberOfWins: 0,
    GAME_FIELD_WIDTH: 28,
    gameRunning: false,
    powerPelletActive: false,
    score: 0,
    startingFoodAmount: gameFieldLayout.filter(x => x == 0).length,
    pathFindingIntervalID: undefined,
    foodRemaining: undefined,
};
game.firstSpeedIncrease = Math.floor(game.startingFoodAmount * .75);
game.secondSpeedIncrease = Math.floor(game.startingFoodAmount * .5);
game.thirdSpeedIncrease = Math.floor(game.startingFoodAmount * .25);

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

export const ghosts = [];

const audios = {
    ascend: new Audio("./audio/ascend.mp3"),
    descend: new Audio("./audio/descend.mp3"),
    positive: new Audio("./audio/positive.mp3"),
    win: new Audio("./audio/win.mp3"),
    gameOver: new Audio("./audio/game_over.mp3"),
    blip: new Audio("./audio/blip.mp3"),
}
for (const [key, value] of Object.entries(audios)) {
    value.volume = 0.2;
}
audios.blip.volume = 0.1;



// ----- FUNCTIONS -----


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


export const endGame = (status) => {
    window.removeEventListener("keydown", handleKeyEvent);
    document.removeEventListener("touchstart", handleTouchStart, false);
    document.removeEventListener("touchmove", handleTouchMove, false);

    if (status === WIN) {
        audios.win.play();
        domElems.winMessageDiv.style.display = "block";
        game.statusPrevGame = WIN;
        game.numberOfWins++;
        domElems.winScoreP.textContent = "score: " + game.score + " / win-streak: " + game.numberOfWins;
    } else {
        audios.gameOver.play();
        domElems.gameOverMessageDiv.style.display = "block";
        game.statusPrevGame = GAME_OVER;
        domElems.gameOverScoreP.textContent = "score: " + game.score + " / win-streak: " + game.numberOfWins;
        cells[pacMan.location].className = "skull";
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
    audios.positive.currentTime = 0;
    audios.positive.play();

    moveGhost(ghost, ghost.startLocation);

    game.score += 100;
    ghost.decreaseSpeed(25);
}

export const ghostContact = (ghost) => {
    if (game.powerPelletActive) {
        eatGhost(ghost);
    } else {
        endGame(GAME_OVER);
    }
}

export const checkGhostContact = () => {
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
    if (countdown === 0) {
        audios.descend.play();
    }
    if (countdown === -1) {
        countdown = 7;
        document.documentElement.style.setProperty("--pac-man-color", "rgb(230, 180, 19)");
        return;
    }
    setTimeout(powerPelletCountdown, 1000, countdown);
}

const eatPowerPellet = (location) => {
    game.powerPelletActive = true;
    audios.ascend.play();
    location.classList.remove(cellTypes.POWER_PELLET);
    location.classList.add(cellTypes.EMPTY);
    for (const ghost of ghosts) {
        ghost.afraidStatus = AFRAID;
    }
    pacMan.speed -= 50;
    powerPelletCountdown(7);
    setTimeout(() => {
        game.powerPelletActive = false;
        for (const ghost of ghosts) {
            ghost.afraidStatus = UNAFRAID;
            cells[ghost.location].classList.remove(AFRAID);
        }
        pacMan.speed += 50;
    }, 7000);
}


const increaseAllGhostsSpeed = () => {
    for (const ghost of ghosts) {
        ghost.increaseSpeed(25);
    }
}

const eatPellet = (location) => {
    location.classList.remove(cellTypes.PELLET);
    location.classList.add(cellTypes.EMPTY);

    game.score += 10;
    game.foodRemaining--;
    audios.blip.currentTime = 0;
    audios.blip.play();

    if (game.foodRemaining === game.firstSpeedIncrease
        || game.foodRemaining === game.secondSpeedIncrease
        || game.foodRemaining === game.thirdSpeedIncrease) {

        increaseAllGhostsSpeed();
    }
}

export const checkFood = () => {
    const location = cells[pacMan.location];
    if (location.classList.contains(cellTypes.PELLET)) {
        eatPellet(location);
    } else if (location.classList.contains(cellTypes.POWER_PELLET)
        && game.powerPelletActive === false) {
        eatPowerPellet(location);
    }
};



// ----- MAIN CONTROL -----


const createGhosts = () => {
    if (ghosts.length > 0) {
        while (ghosts.pop());
    }

    ghosts.push(new Ghost("Blinky", (175 - (25 * game.numberOfWins)), 347, moveModes.PATHFINDING));
    ghosts.push(new Ghost("Pinky", (175 - (25 * game.numberOfWins)), 403, moveModes.DIRECT));
    ghosts.push(new Ghost("Inky", (225 - (25 * game.numberOfWins)), 408, moveModes.DIRECT));
    ghosts.push(new Ghost("Clyde", (225 - (25 * game.numberOfWins)), 352, moveModes.STRANGE));

    if (game.numberOfWins >= 2) {
        ghosts.push(new Ghost("BoneGrinder", 150, 405, moveModes.PATHFINDING));
    }
}

export const runGame = () => {
    game.gameRunning = true;

    if (game.statusPrevGame === undefined
        || game.statusPrevGame === GAME_OVER) {
        audios.win.play();
    }

    if (game.statusPrevGame === GAME_OVER) {
        refreshGameField();
        game.score = 0;
        game.numberOfWins = 0;
    } else if (game.statusPrevGame === WIN) {
        refreshGameField();
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



// ----- EVENT LISTENERS -----


window.addEventListener("keydown", handleKeyEvent);

document.addEventListener("touchstart", handleTouchStart);
document.addEventListener("touchmove", handleTouchMove);
