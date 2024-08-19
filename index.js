const winChecker = (function() {
    function match(a, b, c) {
        return a !== null && a === b && a === c;
    }
    
    function checkRows(gameBoard) {
        for (let i = 0; i < 3; i++) {
            if (match(gameBoard[i][0], gameBoard[i][1], gameBoard[i][2])) {
                return gameBoard[i][0];
            }
        }
        return null;
    }
    
    function checkCol(gameBoard) {
        for (let i = 0; i < 3; i++) {
            if (match(gameBoard[0][i], gameBoard[1][i], gameBoard[2][i])) {
                return gameBoard[0][i];
            }
        }
        return null;
    }
    
    function checkDiagonals(gameBoard) {
        if (match(gameBoard[0][0], gameBoard[1][1], gameBoard[2][2])) {
            return gameBoard[0][0];
        }
        if (match(gameBoard[0][2], gameBoard[1][1], gameBoard[2][0])) {
            return gameBoard[0][2];
        }
        return null;
    }

    function compute(gameBoard) {
        return checkRows(gameBoard) || checkCol(gameBoard) || checkDiagonals(gameBoard);
    }

    return {compute};
})();

const gameController = (function() {
    const gameBoard = [];
    let gameEnd = false;
    let move = 'X';
    let numberOfMoves = 0;

    function initBoard() {
        for (let i = 0; i < 3; i++) {
            gameBoard.push([null, null, null]);
        }
    }

    function addSquareEventListener() {
        const squareElements = document.querySelectorAll('.square');
        squareElements.forEach(squareElement => {
            squareElement.addEventListener('click', (e) => {
                if (squareElement.classList.contains('marked') || gameEnd)
                    return;

                let val = e.target.value - 1;
                gameBoard[Math.floor(val / 3)][val % 3] = move;
                e.target.textContent = move;
                move = move === 'X' ? 'O' : 'X';
                squareElement.classList.add('marked');
                numberOfMoves++;

                let winner = winChecker.compute(gameBoard);
                if (winner) {
                    console.log('winner is: ' + winner);
                    gameEnd = true;
                } else if (numberOfMoves === 9) {
                    console.log('Draw!');
                    gameEnd = true;
                }
            })
        })
    }
    
    initBoard();
    addSquareEventListener();
})();
