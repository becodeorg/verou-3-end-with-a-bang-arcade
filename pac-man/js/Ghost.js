import { AFRAID, UNAFRAID } from "./index.js";

export class Ghost {
    constructor(name, speedPar, location, movementMode) {
        this.name = name;
        this._speed = speedPar;
        this.startLocation = location;
        this.location = location;
        this.movementMode = movementMode;
    }

    pathFinder;
    afraidStatus = UNAFRAID;
    bravery = 0;

    get speed() {
        return (this.calcSpeed());
    }

    set speed(value) {
        this._speed = value;
    }

    calcSpeed() {
        if (this.afraidStatus === AFRAID) {
            return (this._speed + 100);
        } else {
            return (this._speed);
        }
    }

    increaseSpeed(amount) {
        this._speed -= amount;
    }

    decreaseSpeed(amount) {
        this._speed += amount;
    }
}