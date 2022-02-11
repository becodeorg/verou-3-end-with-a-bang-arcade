import { game, cellTypes, checkIfCellIsTypes, ghosts } from "./index.js";



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

export const pathFinding = async (startLocation) => {
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

