var playerBoardDiv = document.getElementById("player-board-div");
var puterBoardDiv = document.getElementById("puter-board-div");
var randomBtn = document.getElementById("random-btn");
var startBtn = document.getElementById("start-btn");
var resetBtn = document.getElementById("reset-btn");

function Square(row, col, occupied = false, isHit = false) {
    this.isHit = isHit;
    this.occupied = occupied;
    this.row = row;
    this.col = col;
    this.coordinates = `${row},${col}`;
}

function Ship(name, length, coordinates, hits = 0) {
    this.name = name;
    this.length = length;
    this.coordinates = coordinates;
    this.hits = hits;
    this.isSunk = function() {
        return this.hits === this.length;
      };    
}

function generateBoard(boardDiv){
    var board = [];
    for (var i = 0; i < 10; i++) {
        for(var j = 0; j < 10; j++) {
            var squareObj = new Square(i , j, false, false);
            var square = document.createElement("div");
            square.style.width = "40px";
            square.style.height = "40px";
            square.style.border = "1px solid black";
            square.dataset.row = i;
            square.dataset.col = j;
            boardDiv.appendChild(square);
            boardDiv.style.border = "1px solid black";
            board.push(squareObj);
        }
    }
    return board;
};

function generateCoords(board, length) {
    // Limit attempts to avoid infinite recursion
    const maxAttempts = 100;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      attempts++;
      
      var row = Math.floor(Math.random() * 10);
      var col = Math.floor(Math.random() * 10);
      var orientation = Math.floor(Math.random() * 2); // 0 = horizontal, 1 = vertical
      
      if ((orientation === 0 && col + length > 10) || 
          (orientation === 1 && row + length > 10)) {
        continue; // Ship would go off the board, try again
      }
      
      // Check if any of the squares are already occupied
      const coordinates = [];
      let valid = true;
      
      for (let i = 0; i < length; i++) {
        const newRow = orientation === 0 ? row : row + i;
        const newCol = orientation === 0 ? col + i : col;
        
        // Find the square in playerBoard that matches these coordinates
        const square = board.find(sq => 
          sq.row === newRow && sq.col === newCol
        );
        
        // If square not found or already occupied, this position is invalid
        if (!square || square.occupied) {
          valid = false;
          break;
        }
        
        coordinates.push(square);
      }
      
      if (valid) {
        // Mark squares as occupied
        for (const square of coordinates) {
          square.occupied = true;
        }
        return coordinates;
      }
    }
    
    console.error("Could not place ship after", maxAttempts, "attempts");
    return null; // Could not place the ship
  }

function hit(squareObj) {
    return function() {
        if (squareObj.isHit) {
            alert("Already hit!");
            return;
        }
        squareObj.isHit = true;
        if (squareObj.occupied) {
            this.style.backgroundColor = "red";
        } else {
            this.style.backgroundColor = "grey";
        }
    }
}

function game() {
    let playerBoard = generateBoard(playerBoardDiv);
    let puterBoard = generateBoard(puterBoardDiv);
    let playerShips = [];
    let puterShips = [];
    let playerTurn = true;
    let gameOver = false;
    
    // Status display
    const statusDisplay = document.createElement("div");
    statusDisplay.id = "status-display";
    statusDisplay.style.margin = "10px 0";
    statusDisplay.textContent = "Click 'Random' to place ships, then 'Start' to begin the game.";
    document.getElementById("status-tab").appendChild(statusDisplay);

    // Add click handlers to computer board for player's turn

    randomBtn.addEventListener("click", function() {
        // Clear previous ships
        playerBoard.forEach(square => {
            square.occupied = false;
            square.isHit = false;
        });
        puterBoard.forEach(square => {
            square.occupied = false;
            square.isHit = false;
        });
        
        Array.from(playerBoardDiv.children).forEach(element => {
            element.style.backgroundColor = "";
        });
        Array.from(puterBoardDiv.children).forEach(element => {
            element.style.backgroundColor = "";
        });
        
        playerShips = [];
        puterShips = [];
        gameOver = false;
        playerTurn = true;
        
        const shipConfigs = [
            { name: "Carrier", length: 5 },
            { name: "Battleship", length: 4 },
            { name: "Destroyer", length: 3 },
            { name: "Submarine", length: 3 },
            { name: "Patrol Boat", length: 2 }
        ];
            
        // Place player ships
        for (const config of shipConfigs) {
            const playerCoordinates = generateCoords(playerBoard, config.length);
            if (playerCoordinates) {
                const ship = new Ship(config.name, config.length, 0);
                ship.coordinates = playerCoordinates;
                playerShips.push(ship);
                
                // Update UI to show ship placement
                playerCoordinates.forEach(coord => {
                    const cellElement = document.querySelector(
                        `#player-board-div [data-row="${coord.row}"][data-col="${coord.col}"]`
                    );
                    if (cellElement) {
                        cellElement.style.backgroundColor = "blue";
                    }
                });
            } else {
                console.error(`Failed to place player's ${config.name}`);
                break;
            }
        }
        
        // Place computer ships (hidden from player)
        for (const config of shipConfigs) {
            const puterCoordinates = generateCoords(puterBoard, config.length);
            if (puterCoordinates) {
                const ship = new Ship(config.name, config.length, 0);
                ship.coordinates = puterCoordinates;
                puterShips.push(ship);
                
                // In a real game, you wouldn't show the computer's ships
                // This is just for debugging
                /*
                puterCoordinates.forEach(coord => {
                    const cellElement = document.querySelector(
                        `#puter-board-div [data-row="${coord.row}"][data-col="${coord.col}"]`
                    );
                    if (cellElement) {
                        cellElement.style.backgroundColor = "blue";
                    }
                });
                */
            } else {
                console.error(`Failed to place computer's ${config.name}`);
                break;
            }
        }
        
        statusDisplay.textContent = "Ships placed! Click 'Start' to begin the game.";
    });

    startBtn.addEventListener("click", function() {
        if (playerShips.length === 0 || puterShips.length === 0) {
            statusDisplay.textContent = "Please place ships first using the 'Random' button.";
            return;
        }
        
        randomBtn.style.display = "none";
        startBtn.style.display = "none";
        resetBtn.style.display = "block";
        
        gameOver = false;
        playerTurn = true;
        statusDisplay.textContent = "Game started! Your turn - click on the computer's board to fire.";
        puterBoard.forEach(function(squareObj, index) {
            const element = puterBoardDiv.children[index];
            element.addEventListener("click", function() {
                if (gameOver || !playerTurn || squareObj.isHit) return;
                
                // Player's move
                squareObj.isHit = true;
                element.style.backgroundColor = squareObj.occupied ? "red" : "grey";
                
                if (squareObj.occupied) {
                    const ship = puterShips.find(ship => 
                        ship.coordinates.some(coord => 
                            coord.row === squareObj.row && coord.col === squareObj.col
                        )
                    );
                    
                    if (ship) {
                        ship.hits++;
                        statusDisplay.textContent = `You hit the computer's ${ship.name}!`;
                        
                        if (ship.hits === ship.length) {
                            statusDisplay.textContent = `You sunk the computer's ${ship.name}!`;
                        }
                        
                        // Check if all computer ships are sunk
                        if (puterShips.every(ship => ship.hits === ship.length)) {
                            gameOver = true;
                            statusDisplay.textContent = "Game Over! You Win!";
                            return;
                        }
                    }
                } else {
                    statusDisplay.textContent = "You missed!";
                }
                
                // Switch to computer's turn
                playerTurn = false;
                setTimeout(computerTurn, 1000);
            });
        });
        
        // Computer's turn logic
        function computerTurn() {
            if (gameOver) return;
            
            // Find a random square that hasn't been hit yet
            const unHitSquares = playerBoard.filter(square => !square.isHit);
            
            if (unHitSquares.length === 0) {
                gameOver = true;
                statusDisplay.textContent = "Game Over! It's a draw!";
                return;
            }
            
            const randomIndex = Math.floor(Math.random() * unHitSquares.length);
            const targetSquare = unHitSquares[randomIndex];
            targetSquare.isHit = true;
            
            // Update UI
            const targetElement = document.querySelector(
                `#player-board-div [data-row="${targetSquare.row}"][data-col="${targetSquare.col}"]`
            );
            
            if (targetElement) {
                targetElement.style.backgroundColor = targetSquare.occupied ? "red" : "grey";
                
                if (targetSquare.occupied) {
                    const ship = playerShips.find(ship => 
                        ship.coordinates.some(coord => 
                            coord.row === targetSquare.row && coord.col === targetSquare.col
                        )
                    );
                    
                    if (ship) {
                        ship.hits++;
                        statusDisplay.textContent = `Computer hit your ${ship.name}!`;
                        
                        if (ship.hits === ship.length) {
                            statusDisplay.textContent = `Computer sunk your ${ship.name}!`;
                        }
                        
                        // Check if all player ships are sunk
                        if (playerShips.every(ship => ship.hits === ship.length)) {
                            gameOver = true;
                            statusDisplay.textContent = "Game Over! Computer Wins!";
                            return;
                        }
                    }
                } else {
                    statusDisplay.textContent = "Computer missed!";
                }
            }
            
            // Switch back to player's turn
            playerTurn = true;
        }
    });

    resetBtn.addEventListener("click", function() {
        window.location.reload();
    });
}

game();