const paddleOne = document.getElementById("paddleOne");
const paddleTwo = document.getElementById("paddleTwo");
const thetwoos = document.querySelector(".paddles");
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
const ballStartingCoor = ballStarting.getBoundingClientRect(); // Keep the ball coor when in the middle of field
let baballCoor = ballStartingCoor;
let a = 0;
let b = 0;
// need a paddle class to organise the gen position of them
// const paddleSCommon = document
//   .querySelector(".paddles")
//   .getBoundingClientRect();

let directionX = Math.floor(Math.random() * 4) + 3;
let directionY = Math.floor(Math.random() * 4) + 3;
let directionXd = Math.floor(Math.random() * 2);
let directionYd = Math.floor(Math.random() * 2);
document.addEventListener("keydown", (event) => {
  if (event.key === "f") {
    document.getElementById('hello').href="style.css"
  }
})
document.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    gameStatus = gameStatus == "startingScreen" ? "play" : "startingScreen";
    /* the line above is a ternary operator, if gameStatus is = startingScreen it'll become play and opposite by pressing enter*/
  }

  if (gameStatus === "play" && event.key === "Enter") {
    info.style.left = 40 + "vw";
    info.style.top = 9 + "%";
    info.textContent = "Game Started";
    requestAnimationFrame(() => {
      directionX = Math.floor(Math.random() * 6) + 3;
      directionY = Math.floor(Math.random() * 6) + 3;
      directionXd = Math.floor(Math.random() * 6) + 3;
      directionYd = Math.floor(Math.random() * 6) + 3;
      letsMoveIt(directionX, directionY, directionXd, directionYd);
    });
  }
  if (gameStatus === "play") {
    if (event.key === "q") {
      paddleOne.style.top =
        Math.max(fieldCoor.top, paddleOneCoor.top - window.innerHeight * 0.1) +
        "px";
      paddleOneCoor = paddleOne.getBoundingClientRect();
    }
    if (event.key === "w") {
      paddleOne.style.top =
        Math.min(
          fieldCoor.bottom - paddleOne.getBoundingClientRect().height,
          paddleOneCoor.top + window.innerHeight * 0.1
        ) + "px";
      paddleOneCoor = paddleOne.getBoundingClientRect();
    }

    if (event.key == "ArrowUp") {
      paddleTwo.style.top =
        Math.max(fieldCoor.top, paddleTwoCoor.top - window.innerHeight * 0.1) +
        "px";
      paddleTwoCoor = paddleTwo.getBoundingClientRect();
    }

    if (event.key == "ArrowDown") {
      paddleTwo.style.top =
        Math.min(
          fieldCoor.bottom - paddleTwo.getBoundingClientRect().height,
          paddleTwoCoor.top + window.innerHeight * 0.1
        ) + "px";
      paddleTwoCoor = paddleTwo.getBoundingClientRect();
    }
  }
});

const letsMoveIt = (directionX, directionY, directionXd, directionYd) => {
  if (baballCoor.top <= fieldCoor.top) {
    // if the ball is going outside of top field
    directionYd = 1;
  }
  if (baballCoor.bottom >= fieldCoor.bottom) {
    // if the ball is goint outside of bottom field
    directionYd = 0;
  }

  if (
    baballCoor.left <= paddleOneCoor.right && // if ball is further left than the paddle  + top & bottom conditions
    baballCoor.top >= paddleOneCoor.top &&
    baballCoor.bottom <= paddleOneCoor.bottom
  ) {
    directionXd = 1;
    directionX = Math.floor(Math.random() * 6) + 3;
    directionY = Math.floor(Math.random() * 6) + 3; // if those two are uncommented, the speed and direction change after touching a wall ^^
  }

  if (
    baballCoor.right >= paddleTwoCoor.left && // same for paddle right
    baballCoor.top >= paddleTwoCoor.top &&
    baballCoor.bottom <= paddleTwoCoor.bottom
  ) {
    directionXd = 0;
    directionX = Math.floor(Math.random() * 6) + 3;
    directionY = Math.floor(Math.random() * 6) + 3;
  }

  // score implement + restart
  if (
    baballCoor.left <= fieldCoor.left || // fieldcoor.left previously but changed to paddleoneCoor.left
    baballCoor.right >= fieldCoor.right
  ) {
    if (baballCoor.left <= fieldCoor.left) {
      b = b + 1;
      score2.textContent = b;
    } else {
      a = a + 1;
      score1.textContent = a;
    }
    gameStatus = "startingScreen'";
    baballCoor = ballStartingCoor;
    info.style.left = 34 + "%";
    info.style.top = 8 + "%";
    info.textContent = " To play again press Enter twice ";

    //TODO: Need to add a thetwoos position to bring them back to starting point
    return;
  }
  //Let's make it move for fsk
  baball.style.top =
    baballCoor.top + directionY * (directionYd == 0 ? -1 : 1) + "px"; // ternary conditions for direction
  baball.style.left =
    baballCoor.left + directionX * (directionXd == 0 ? -1 : 1) + "px";

  baballCoor = baball.getBoundingClientRect();
  requestAnimationFrame(() => {
    letsMoveIt(directionX, directionY, directionXd, directionYd);
  });
};

// {
//   paddleOne.style.top =
//     Math.min(
//       fieldCoor.bottom - paddleSCommon.height,
//       paddleOneCoor.top + window.innerHeight *
//       0.0002
//     ) + "px";
//   paddleOneCoor = paddleOne.getBoundingClientRect();
// }
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
