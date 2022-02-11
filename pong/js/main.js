const thetwoos = document.querySelector(".paddles");
const theField = document.getElementById("theField");
let gameStatus = "startingScreen";
const ballStarting = document.getElementById("ball");
const paddleTwo = document.getElementById("paddleTwo");
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

let directionX = Math.floor(Math.random() * 4) + 5;
let directionY = Math.floor(Math.random() * 4) + 5;
let directionXd = Math.floor(Math.random() * 2);
let directionYd = Math.floor(Math.random() * 2);


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
      directionX = Math.floor(Math.random() * 5) + 3;
      directionY = Math.floor(Math.random() * 5) + 3;
      directionXd = Math.floor(Math.random() * 5) + 3;
      directionYd = Math.floor(Math.random() * 5) + 3;
      letsMoveIt(directionX, directionY, directionXd, directionYd);
    });
  }
  if (gameStatus === "play") {
    const paddleOne = document.getElementById("paddleOne");
    const paddleTwo = document.getElementById("paddleTwo");
    if (event.key === "q") {
      paddleOne.style.top =
        Math.max(fieldCoor.top, paddleOneCoor.top - window.innerHeight * 0.11) +
        "px";
      paddleOneCoor = paddleOne.getBoundingClientRect();
    }
    if (event.key === "w") {
      paddleOne.style.top =
        Math.min(
          fieldCoor.bottom - paddleOne.getBoundingClientRect().height,
          paddleOneCoor.top + window.innerHeight * 0.11
        ) + "px";
      paddleOneCoor = paddleOne.getBoundingClientRect();
    }

    if (event.key == "ArrowUp") {
      paddleTwo.style.top =
        Math.max(fieldCoor.top, paddleTwoCoor.top - window.innerHeight * 0.11) +
        "px";
      paddleTwoCoor = paddleTwo.getBoundingClientRect();
    }

    if (event.key == "ArrowDown") {
      paddleTwo.style.top =
        Math.min(
          fieldCoor.bottom - paddleTwo.getBoundingClientRect().height,
          paddleTwoCoor.top + window.innerHeight * 0.11
        ) + "px";
      paddleTwoCoor = paddleTwo.getBoundingClientRect();
    }
  }
});

const letsMoveIt = (directionX, directionY, directionXd, directionYd) => {
  if(directionXd != 0){  // here is the condition for AI to trigger some movement
    let x = ( paddleTwoCoor.top -  baballCoor.top )
    
    
    const padd2 = (paddleTwo.getBoundingClientRect().top );
    console.log(padd2);
    console.log(paddleTwo.getBoundingClientRect().bottom)
          paddleTwo.style.top = baballCoor.top - 50 + "px"
          // -x + window.innerHeight /2 -50   + "px";
          
          
          console.log(baballCoor.top + " " + baballCoor.bottom + "balle");
              console.log(paddleTwoCoor.top+ " " + paddleTwoCoor.bottom + "paddle");
              console.log(x + "x");
    console.log((baballCoor.top -50));
    
  
      // setInterval(function(){
      //   let x = ( paddleTwoCoor.top -  baballCoor.top )
      //     paddleTwo.style.top = (-x + window.innerHeight *0.1) * 0.5   + "px";
      //     console.log(baballCoor.top + "balle");
      //     console.log(paddleTwo.style.top + "paddle");
      // },100)
    }
    
  
  if (baballCoor.top <= fieldCoor.top) {
    // if the ball is going at the edge of top field
    directionYd = 1;
  }
  if (baballCoor.bottom >= fieldCoor.bottom) {
    // if the ball is going at the edge of bottom field
    directionYd = 0;
  }

  if (
    baballCoor.left <= paddleOneCoor.right && // if ball is further left than the paddle  + top & bottom conditions
    baballCoor.top  >= paddleOneCoor.top &&
    baballCoor.bottom <= paddleOneCoor.bottom
  ) {
    directionXd = 1;
    directionX = Math.floor(Math.random() * 6) + 3;
    directionY = Math.floor(Math.random() * 6) + 3; // if those two are uncommented, the speed and direction change after touching a wall ^^
    
  }

  if (
    baballCoor.right >= paddleTwoCoor.left && // same for paddle right
    baballCoor.top + 80  >= paddleTwoCoor.top -80 &&
    baballCoor.bottom - 80  <= paddleTwoCoor.bottom + 80
  ) {
    directionXd = 0;
    directionX = Math.floor(Math.random() * 6) + 3;
    directionY = Math.floor(Math.random() * 6) + 3;
    
  }

  // score implement + restart
  if (
    baballCoor.left <= fieldCoor.left || 
    baballCoor.right >= fieldCoor.right
  ) {
    if (baballCoor.left <= fieldCoor.left) {
      b = b + 1;
      document.getElementById("the-score2").textContent = b;
    } else {
      a = a + 1;
      document.getElementById("the-score").textContent = a;
    }
    gameStatus = "startingScreen'";
    baballCoor = ballStartingCoor;
    info.style.left = 34 + "%";
    info.style.top = 8 + "%";
    info.textContent = " To play again press Enter twice ";

    //TODO: Need to add a thetwoos position to bring them back to starting point
    return;
  }
  const baball = document.getElementById("ball");
  baball.style.top =
    baballCoor.top + directionY * (directionYd == 0 ? -1 : 1) + "px"; // ternary conditions for direction
  baball.style.left =
    baballCoor.left + directionX * (directionXd == 0 ? -1 : 1) + "px";

  baballCoor = baball.getBoundingClientRect();
  requestAnimationFrame(() => {
    letsMoveIt(directionX, directionY, directionXd, directionYd);
  });
};
