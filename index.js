const AIController = (function() {
    function getAIMove(gameBoard) {
        // to be implemented
    }

    function getRandomMove(gameBoard) {
        let possibleMoves = [];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (gameBoard[i][j] === null)
                    possibleMoves.push(3 * i + j);
            }
        }
        return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    }

    return {getAIMove, getRandomMove};
})();

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

const roundController = (function() {
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
                if (squareElement.classList.contains('marked') || gameEnd || move === 'O')
                    return;

                handlePlayerMove(e.target, squareElement);
                playRound();
            });
        });
    }

    function handlePlayerMove(target, squareElement) {
        let val = target.value - 1;
        gameBoard[Math.floor(val / 3)][val % 3] = move;
        target.textContent = move;
        move = 'O'; // Switch to AI move
        squareElement.classList.add('marked');
        numberOfMoves++;
    }

    function handleAIMove() {
        const aiMove = AIController.getRandomMove(gameBoard);
        const aiRow = Math.floor(aiMove / 3);
        const aiCol = aiMove % 3;
        gameBoard[aiRow][aiCol] = move;

        const squareElement = document.querySelectorAll('.square')[aiMove];
        squareElement.textContent = move;
        squareElement.classList.add('marked');
        move = 'X'; // Switch back to player
        numberOfMoves++;
    }

    function checkGameState() {
        let winner = winChecker.compute(gameBoard);
        const headerElement = document.querySelector('.header');
        if (winner) {
            headerElement.textContent = 'Winner is: ' + winner;
            gameEnd = true;
        } else if (numberOfMoves === 9) {
            headerElement.textContent = 'Draw!';
            gameEnd = true;
        }
    }

    async function playRound() {
        checkGameState();
        if (!gameEnd) {
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate AI thinking time
            handleAIMove();
            checkGameState();
        }
    }

    async function startGame(playerMove) {
        initBoard();
        addSquareEventListener();
        move = playerMove;
        if (move === 'O') {
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate AI thinking time
            handleAIMove();
        }
    }

    return {startGame}
})();

const UI = (function() {
    let move = 'X';

    function unload() {
        const headerElement = document.querySelector('.header');
        const containerElement = document.querySelector('.container');

        headerElement.replaceChildren();
        containerElement.replaceChildren();
    }

    function initStart() {
        unload();
        const headerElement = document.querySelector('.header');
        const containerElement = document.querySelector('.container');

        headerElement.textContent = 'Choose Your Move!';

        containerElement.classList.add('move');

        const xButton = document.createElement('button');
        xButton.textContent = 'X';
        const yButton = document.createElement('button');
        yButton.textContent = 'O';
        [xButton, yButton].forEach(btn => {
            btn.addEventListener('click', (e) => {
                move = e.target.textContent;
                initRound(move);
            })
            containerElement.appendChild(btn);
        })
    }

    function initRound(playerMove) {
        unload();
        const headerElement = document.querySelector('.header');
        const containerElement = document.querySelector('.container');

        headerElement.textContent = 'Play!';
        for (let i = 1; i <= 9; i++) {
            const buttonElement = document.createElement('button');
            buttonElement.classList.add('square');
            buttonElement.setAttribute('value', i);
            containerElement.appendChild(buttonElement);
        }

        containerElement.classList.replace('move', 'play');

        roundController.startGame(playerMove);
    }

    return {initStart};
})();

const gameController = (function() {
    UI.initStart();
})();
