var playerBoardDiv = document.getElementById("player-board-div");
var puterBoardDiv = document.getElementById("puter-board-div");
var randomBtn = document.getElementById("random-btn");

game();

function generateCoords(length) {
    var randomNum1 = Math.floor(Math.random() * 9);
    var randomNum2 = Math.floor(Math.random() * 9);
    var randomNum = randomNum1 + "," + randomNum2;
    var squareObj = board[randomNum];
    if (randomNum % 10 + length < 10) { 
        for (var i = 0; i < length; i++) {
            var square = playerBoard.children[randomNum + i];
            square.style.backgroundColor = "blue";
            squareObj.occupied = true;
        }
    }
    return randomNum;
}

function Square(coordinate, occupied, isHit) {
    this.isHit = isHit;
    this.occupied = occupied;
    this.coordinate = coordinate;
}

function Ship(name, length, isSunk, startCoordinate, endCoordinate, hits) {
    this.name = name;
    this.length = length;
    this.isSunk = isSunk;
    this.startCoordinate = startCoordinate;
    this.endCoordinate = endCoordinate;
    this.hits = hits;
    if (this.hits === this.length) {
        this.isSunk = true;
    }
}

function generateBoard(boardDiv){
    var board = [];
    for (var i = 0; i < 10; i++) {
        for(var j = 0; j < 10; j++) {
            var squareObj = new Square(i + "," + j, false, false);
            var square = document.createElement("div");
            square.style.width = "40px";
            square.style.height = "40px";
            square.style.border = "1px solid black";
            boardDiv.appendChild(square);
            boardDiv.style.border = "1px solid black";
            board.push(squareObj);
        }
    }
    return board;
};

function hit(squareObj) {
    return function() {
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

    playerBoard.forEach(function(squareObj, index) {
        playerBoardDiv.children[index].addEventListener("click", hit(squareObj));
    });

    puterBoard.forEach(function(squareObj, index) {
        puterBoardDiv.children[index].addEventListener("click", hit(squareObj));
    }
    );

    randomBtn.addEventListener("click", function() {
        var cruiser = new Ship("cruiser", 5, false, generateCoords(5), generateCoords(5), 0);
        var destroyer = new Ship("battleship", 4, false, []);
        var frigate = new Ship("destroyer", 3, false, []);
        var submarine1 = new Ship("submarine", 2, false, []);
        var submarine2 = new Ship("submarine", 2, false, []);

        var randomNum = Math.floor(Math.random() * 100);
        var randomSquare = playerBoard.children[randomNum];
        randomSquare.style.backgroundColor = "blue";
        var squareObj = board[randomNum];
        squareObj.occupied = true;
    });

}

