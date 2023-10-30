const GAME_WON = 0;
const GAME_TIE = 1;
const GAME_GOING = 2;

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

function GameBoard(dim) {
    const board = [];
    for (let i = 0; i < dim; i++) {
        board[i] = [];
        for (let j = 0; j < dim; j++) {
            board[i].push(Cell());
        }
    }
    
    const isCellEmpty = (x,y) => board[x][y].isEmpty();
    const getMark = (x,y) => board[x][y].getMark();
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
        for (let i = 0; i < dim; i++) {
            if (checkLine(i,0,0,1,dim)) return GAME_WON;
            if (checkLine(0,i,1,0,dim)) return GAME_WON;
        }
        if (checkLine(0,0,1,1,dim)) return GAME_WON;
        if (checkLine(dim-1,0,-1,1,dim)) return GAME_WON;

        for (let i = 0; i < dim; i++) {
            for (let j = 0; j < dim; j++) {
                if (board[i][j].isEmpty()) {
                    return GAME_GOING;
                }
            }
        }
        return GAME_TIE;
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

    return {getMark, setMark, isCellEmpty, checkWin, printBoard};
};


function GameController(dim) {
    let currentPlayer = 1;
    const gameBoard = GameBoard(dim);
    
    const switchTurns = () => {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
    }

    const playRound = (x,y) => {
        if (gameBoard.checkWin() === GAME_GOING) {
            gameBoard.setMark(x,y,currentPlayer);
            if (gameBoard.getMark(x,y) === currentPlayer && gameBoard.checkWin() === GAME_GOING) {
                switchTurns();
            } 
        }
        return;
    }
    const getCurrentPlayer = () => currentPlayer;

    return {playRound, getCurrentPlayer, gameBoard};
}

const ScreenController = (function () {
    let gameController, dim, newDim;

    const innerCard = document.querySelector("div.inner-card");
    const boardDiv = document.querySelector("div.game-board");
    const currPlayerImg = document.querySelector("div.current-player img.current-player");
    const currPlayerName = document.querySelector("div.current-player span.current-player");
    const resetButton = document.querySelector("div.front img.reset.icon");
    const settingsButton = document.querySelector("div.front img.settings.icon");
    const saveSettingsButton = document.querySelector("div.back button#save-settings");
    const player1NameInput = document.querySelector("div.back input#player1-name");
    const player2NameInput = document.querySelector("div.back input#player2-name");
    const lengthMinusButton = document.querySelector("div.back button#grid-minus");
    const lengthPlusButton = document.querySelector("div.back button#grid-plus");
    const lengthOutput = document.querySelector("div.back div#dimensions output");

    let players = {
        1: {
            name: "",
            icon: "./assets/food-drumstick.svg",
        },
        2: {
            name: "",
            icon: "./assets/glass-mug-variant.svg",
        }
    };

    const resetGame = (d) => {
        boardDiv.innerText = "";
        dim = d;
        newDim = d;
        gameController = GameController(dim);
        renderEmptyBoard();
        renderCurrentPlayerName();
        renderInputtedName();
        renderLengthOutput();
    }

    const renderEmptyBoard = () => {
        const root = document.querySelector(":root");
        root.style.setProperty('--dim', dim);

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

    const getGameState = () => gameController.gameBoard.checkWin();

    const renderGameOver = () => {
        const outcome = getGameState();
        
        if (outcome === GAME_TIE) {
            currPlayerImg.classList.add("hidden");
            currPlayerName.innerText = "IT'S A TIE!";
            currPlayerName.classList.add("tie");
        }
        else if (outcome === GAME_WON){
            const ID = gameController.getCurrentPlayer();
            currPlayerName.innerText = `${players[ID].name} WINS!`;
            currPlayerName.classList.add("win");
        }
    }

    const renderCurrentPlayerName = () => {
        const ID = gameController.getCurrentPlayer();
        currPlayerImg.setAttribute("src", players[ID].icon);
        currPlayerImg.classList.remove("hidden");
        currPlayerName.innerText = players[ID].name;
        currPlayerName.classList.remove("win", "tie");
    }

    const makeBoardClickable = () => {
        boardDiv.addEventListener("click", (e) => {
            if (!e.target.classList.contains("cell")) return;
            
            const xClick = e.target.getAttribute('data-row');
            const yClick = e.target.getAttribute('data-column');
            gameController.playRound(xClick, yClick);

            const mark = gameController.gameBoard.getMark(xClick, yClick);
            if (mark) {
                e.target.style.cssText += `background-image: url(${players[mark].icon})`;
            }

            if (getGameState() !== GAME_GOING) renderGameOver();
            else renderCurrentPlayerName();
        })
    }

    const renderInputtedName = () => {
        players["1"].name = player1NameInput.value;
        players["2"].name = player2NameInput.value;
        renderCurrentPlayerName();
    }

    const renderLengthOutput = () => {
        lengthOutput.value = newDim;
    }

    const makeButtonsClickable = () => {
        resetButton.addEventListener("click", () => {
            resetGame(dim);
        })
        settingsButton.addEventListener("click", () => {
            innerCard.classList.add("flip");
        })
        player1NameInput.addEventListener("input", ()=> {
            renderInputtedName();
        })
        player2NameInput.addEventListener("input", ()=> {
            renderInputtedName();
        })
        lengthMinusButton.addEventListener("click", ()=> {
            newDim = Math.max(newDim-1, 2);
            renderLengthOutput();
        })
        lengthPlusButton.addEventListener("click", ()=>{
            newDim = Math.min(newDim+1, 6);
            renderLengthOutput();

        })
        saveSettingsButton.addEventListener("click", ()=>{
            if (dim !== newDim) {
                resetGame(newDim);
            }
            innerCard.classList.remove("flip");
        })
    }

    resetGame(3);
    makeButtonsClickable();
    makeBoardClickable();
})();