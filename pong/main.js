const paddleOne = document.getElementById("paddleOne");
const paddleTwo = document.getElementById("paddleTwo");
const theField = document.getElementById("theField");
let gameStatus = "startingScreen";
const baball = document.getElementById("ball");
const ballStarting = document.getElementById("ball");
const score1 = document.getElementById("the-score");
const score2 = document.getElementById("the-score2");
const info = document.getElementById("info");
let paddleOneCoor = paddleOne.getBoundingClientRect();
let paddleTwoCoor = paddleTwo.getBoundingClientRect();
let fieldCoor = theField.getBoundingClientRect();
const ballStartingCoor = ballStarting.getBoundingClientRect();
const baballCoor = ballStartingCoor;
// need a paddle class to organise the gen position of them
const paddleSCommon = document
  .querySelector(".paddles")
  .getBoundingClientRect();

let directionX = Math.floor(Math.random() * 4) + 3;
let directionY = Math.floor(Math.random() * 4) + 3;
let directionXd = Math.floor(Math.random() * 2);
let directionYd = Math.floor(Math.random() * 2);

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    gameStatus = gameStatus == "startingScreen" ? "play" : "startingScreen";
    /* the line above is a ternary operator, if gameStatus is = starts it'll become play and opposite by pressing enter*/
  }
  if (gameStatus == "play") {
    info.textContent = "Game Started";
    requestAnimationFrame(() => {
      directionX = Math.floor(Math.random() * 4) + 3;
      directionY = Math.floor(Math.random() * 4) + 3;
      directionXd = Math.floor(Math.random() * 4) + 3;
      directionYd = Math.floor(Math.random() * 4) + 3;
      //   letsMoveIt(directionX, directionY, directionXd, directionYd);
    });
  }
  if (gameStatus == "play") {
    if (event.key == "q") {
      paddleOne.style.top =
        Math.max(
          theField.getBoundingClientRect().top,
          paddleOne.getBoundingClientRect().top - 23.9
        ) + "px";
    }
    if (event.key == "w") {
      paddleOne.style.top =
        Math.min(
          fieldCoor.bottom - paddleSCommon.height,
          paddleOneCoor.top + window.innerHeight * 
          0.0002
        ) + "px";
      paddleOneCoor = paddleOne.getBoundingClientRect();
    }
  }
});

// document.addEventListener("keydown", (event) => {
//   if (event.key === "ArrowUp") {
//     console.log("heyUp");
//     paddleTwo.style.top =
//       Math.max(paddleTwo.getBoundingClientRect().top - 23.9) + "px";
//     // paddleOne.getBoundingClientRect() = paddleOne.getBoundingClientRect()
//   }

//   if (event.key === "ArrowDown") {
//     console.log("heyDown");
//     paddleOne.style.top =
//       Math.max(
//         theField.getBoundingClientRect().top,
//         paddleOne.getBoundingClientRect().top + 23.9
//       ) + "px";
//   }
// }

// );
