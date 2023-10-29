function GameBoard(dim) {
    const createBoard = (dim) => {
        const board = [];
        for (let i = 0; i < dim; i++) {
            board[i] = [];
            for (let j = 0; j < dim; j++) {
                board[i].push(Cell());
            }
        }
        return board;
    }
   
    const board = createBoard(dim);
    
    const getDim = () => dim;
    const getBoard = () => board;
    const isCellEmpty = (x,y) => board[x][y].isEmpty();
    const setMark = (x, y, player) => {
        if (isCellEmpty(x,y)) {
            board[x][y].setMark(player);
        }
    }
    const checkLine = (posX, posY, dirX = 1, dirY = 1, length = dim) => {
        dirX = dirX > 0 ? 1 : (dirX < 0 ? -1 : 0);
        dirY = dirY > 0 ? 1 : (dirY < 0 ? -1 : 0);
        if (isOverflowing()) return false;
        // check if position is overflowing ---- !!

        let firstMark = board[posX][posY].getMark();
        if (!firstMark) return false; // false if it's null or undefined

        let x = posX+dirX, y = posY+dirY;
        for (let i = 0; i < length-1; i++) {
            if (board[x][y].getMark() !== firstMark) return false;
            x += dirX;
            y += dirY;
        }
        return true;
        
        function isOverflowing() {
            let xOverflow = dirX && (posX + dirX*length > dim || posX + dirX*length < -1);
            let yOverflow = dirY && (posY + dirY*length > dim || posY + dirY*length < -1);
            return xOverflow | yOverflow;
        }
    }
    const checkWin = () => {
        let cellsFilled = 0;
        for (let i = 0; i < dim; i++) {
            for (let j = 0; j < dim; j++) {
                if (board[i][j].isEmpty()) {
                    continue;
                }
                else {cellsFilled++}
            }
        }
        if (cellsFilled === dim * dim) {return "tie"};

        for (let i = 0; i < dim; i++) {
            if (checkLine(i,0,0,1,dim)) return "win";
            if (checkLine(0,i,1,0,dim)) return "win";
        }
        if (checkLine(0,0,1,1,dim)) return "win";
        if (checkLine(dim-1,dim-1,-1,-1,dim)) return "win";
        return false;
    }
    const printBoard = () => {
        let print = "";
        for (let i = 0; i < dim; i++) {
            let line = "|";
            for (let j = 0; j < dim; j++) {
                line += `${board[i][j].getMark()}|`;
            }
            print += line + "\n";
            if (i !== dim-1) {
                let horizontalSep = (new Array(line.length)).fill("-");
                horizontalSep.push("\n")
                print += horizontalSep.join('');
            }
        }
        console.log(print);
    }
    return {getBoard, isCellEmpty, setMark, printBoard, checkWin, getDim};
};

function Cell() {
    let value = 0;
    const isEmpty = () => {
        return value === 0;
    }
    const setMark = (mark) => {
        value = mark;
    }
    const getMark = () => {
        return value;
    }
    return {isEmpty, setMark, getMark};
}

function GameController(player1Name = "Player One", player2Name = "Player Two", dim) {
    let players = [
        {
            name: player1Name,
            mark: 'X'
        },
        {
            name: player2Name,
            mark: 'O'
        }
    ];
    let currentPlayer = players[0];
    let gameBoard = GameBoard(dim);
    
    const switchTurns = () => {
        currentPlayer = currentPlayer === players[0] ? players[1] : players[0];
    }

    const playRound = (x,y) => {
        if (!gameBoard.isCellEmpty(x,y)) {
            console.log('This cell is taken. Try a different one.');
            return;
        }
        gameBoard.setMark(x,y,currentPlayer.mark);
        gameBoard.printBoard();

        let gameState = gameBoard.checkWin();
        if (gameState === "win") {
            console.log(`${currentPlayer.name} wins the game!`);
        }
        else if (gameState === "tie") {
            console.log(`The game is tied!`);
        }

        switchTurns();
    }

    const getCurrentPlayer = () => currentPlayer.name;

    gameBoard.printBoard();
    return {playRound, 
        getCurrentPlayer,
        getBoard: gameBoard.getBoard
    };
}

function ScreenController() {
    const dim = 4;
    const game = GameController(undefined, undefined, dim);
    const boardDiv = document.querySelector("div.game-board");

    const updateScreen = () => {
        // Update root variable
        const root = document.querySelector(":root");
        root.style.setProperty('--dim', dim);

        // Add buttons
        for (let i = 0; i < dim; i++) {
            for (let j = 0; j < dim; j++) {
                const button = document.createElement("button");
                button.classList.add("cell");
                button.dataset.row = i;
                button.dataset.column = j;
                button.textContent = " ";
                boardDiv.appendChild(button);
            }
        }

        // Add seperator divs
        for (let i = 0; i < dim-1; i++) {
            const borderHoriz = document.createElement("div");
            borderHoriz.classList.add("border", "horizontal");
            borderHoriz.style.cssText += `grid-row: ${i*2+2} / ${i*2+3}`;

            const borderVert = document.createElement("div");
            borderVert.classList.add("border", "vertical");
            borderVert.style.cssText += `grid-column: ${i*2+2} / ${i*2+3}`;

            boardDiv.appendChild(borderHoriz);
            boardDiv.appendChild(borderVert);
        }
    }

    const makeClickable = () => {
        boardDiv.addEventListener("click", (e) => {
            if (!e.target.classList.contains("cell")) return;
            
            const xClick = e.target.getAttribute('data-row');
            const yClick = e.target.getAttribute('data-column');
            game.playRound(xClick, yClick);

            const cell = (game.getBoard())[xClick][yClick];
            e.target.textContent = cell.getMark();
        })
    }

    makeClickable();
    updateScreen();
}

ScreenController();