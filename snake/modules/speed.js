import { speed, modifySpeed, playerScore } from "../script.js";
export const changeSpeed = () => {
    if (playerScore >= 5) {
        modifySpeed(9);
    }
    if (playerScore >= 10) {
        modifySpeed(11);
    }
    if (playerScore >= 15) {
        modifySpeed(13);
    }
    if (playerScore >= 20) {
        modifySpeed(15);
    }
    if (playerScore >= 25) {
        modifySpeed(18);
    }
    if (playerScore >= 30) {
        modifySpeed(21);
    }
};
