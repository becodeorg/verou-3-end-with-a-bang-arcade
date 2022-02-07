// IMPORTS

import gameFieldLayout from "./gameFieldLayout.js";


// GLOBAL VARIABLES

// cell classes
const WALL = "type-1";
const PELLET = "type-0";
const GHOST_LAIR = "type-2";
const POWER_PELLET = "type-3";
const EMPTY = "type-4";


// FUNCTIONS

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


// place pac-man
let pacManLocation = 490; // game field index
gameFieldGrid.children[pacManLocation].classList.add("pac-man")


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
            attemptMove(pacManLocation - 1);
            break;
        case "s": // down
            attemptMove(pacManLocation + gameFieldWidth);
            break;
        case "d": // right
            attemptMove(pacManLocation + 1);
            break;

        default:
            break;
    }

    checkForFood();
}


// create ghosts
// class Ghost {
//     constructor(name, speed, location) {
//         this.name = name;
//         this.speed = speed;
//         this.location = location
//     }
// }

// const ghosts = {

// }

// move ghosts

// EVENT LISTENERS

window.addEventListener("keydown", movePacMan);
