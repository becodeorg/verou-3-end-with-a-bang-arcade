const TicTacToe = {
    
        init: function() {         //initialize the TicTacToe variables
        this.players = ["X", "O"]; // array (0 , 1)  0 ==x , 1 ==o .. :)
        this.squares = Array.from(document.querySelectorAll(".squares")); // give back an array from which selected
        this.players = document.querySelector(".players");
        this.button = document.querySelector(".newGame");
        this.board = document.querySelector(".board");
        
        this.winning= [      // potential winning 

            
            [0,1,2], [3,4,5], [6,7,8],  // horizontal
            
            [0,3,6], [1,4,7], [2,5,8],  // vertical
            
            [0,4,8], [2,4,6]           // diagonal 
        ];
        
        this.addEventListeners();     // add click to squares and button
        
        this.newGame();             // reset the game
    },

    