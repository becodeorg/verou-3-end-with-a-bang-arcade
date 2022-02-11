
const tic_tac_toe = {  /* using object / key= functionName , value = the function itself   */
    
    init: function() {  /* the variabels we need */
        this.symbols = ["X", "O"];
        this.button = document.querySelector(".new_game");
        this.squares = Array.from(document.querySelectorAll(".square")); // get back an array from the selector . 
        this.player = document.querySelector(".player");
        this.board = document.querySelector(".board");
        
        this.win_case = [   // potencial winner  // 8 cases
            
            [0,1,2], [3,4,5], [6,7,8],   // horizontal
            
            [0,3,6], [1,4,7], [2,5,8],  // vertical
            
            [0,4,8], [2,4,6]           // diagonal
        ];

        // add click event listeners to squares and button
        tic_tac_toe.addEventListeners();
        // reset the game
        tic_tac_toe.reset_game();
    },



    // add click event listeners to squares and button
    addEventListeners: function() {
        var here_play = tic_tac_toe;

        this.squares.forEach(function(x) {          // add a click listener to each square 

            x.addEventListener("click",function() {
                here_play.play(this);
            }, false)
        })
        
        this.button.addEventListener("click", function() { // calling reset_game() by clicking
            here_play.reset_game();
        }, false);
    },

    
    reset_game: function() {
       //(X) OR (O) by array content [0,1]
        this.activePlayer = 1;
        // reset the game over variable
        this.gameOver = false;
        // remove all X and O classes from every square
        this.squares.forEach(function (x) {
            x.classList.remove(tic_tac_toe.symbols[0]);
            x.classList.remove(tic_tac_toe.symbols[1]);
        });

        // remove game_over class from board if it exists
        this.board.classList.remove("gameOver");
        // set the turn indicator (X's turn)
        this.set_player();
    },

    // set the turn
    set_player: function() {
        this.player.innerText = this.symbols[this.activePlayer] + "'s turn."
    },

    play: function(el) {
        // make sure that the square is not filled
        if (!this.gameOver && el.classList.length == 1) {
            // set the contents to your player's symbol
            el.classList.add(this.symbols[this.activePlayer]);
            // check if you won
            if (this.checkWin()) {
                // set the game text to display the winner
                this.player.innerText = this.symbols[this.activePlayer] + " wins!";
                // call the game over function
                this.endGame();
            }
            // check if there is no winner .. 
            else if (this.checkDraw()) {
                // set the game text to say it is a draw
                this.player.innerText = "NO Winners";
                // call the game over function
                this.endGame();
            }
            // go to the next player's turn
            else {
                // change the turn (0 to 1 or 1 to 0)
                this.activePlayer = 1 - this.activePlayer ;
                // set the turn indicator text
                this.set_player();
            }
        }
    },

    // check if current player won
    
    checkWin: function() {
        var current_player = this;

       
        return this.win_case.some(function (x) {
            return x.every(function(i) {
                return Array.from(current_player.squares[i].classList).indexOf(current_player.symbols[current_player.activePlayer]) > -1;
            })
        })
    },
    

    // check if players are equal
    checkDraw: function() {
     

        return this.squares.every(function (x) {
            return x.classList.length > 1;
        })
    },

    
    endGame: function() {   // gameover
        this.gameOver = true;
        this.board.classList.add("gameOver");
    }
}


tic_tac_toe.init(); // call thge main (init) which include every thing