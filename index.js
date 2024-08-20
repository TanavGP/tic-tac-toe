const AIController = (function() {
    function getAIMove(gameBoard, accuracy, MyMove) {
        let rand = Math.floor(Math.random() * 100);
        if (rand <= accuracy) {
            return getBestMove(gameBoard, MyMove);
        } else {
            return getRandomMove(gameBoard);
        }
    }

    function minimax(gameBoard, depth, isMaximizing, MyMove) {
        let otherMove = MyMove === 'X' ? 'O' : 'X';
        const scores = {
            [MyMove]: 10,                        // I win 
            [otherMove]: -10,                    // Other Player wins
            draw: 0                              // Draw
        };
    
        let winner = winChecker.compute(gameBoard);
        if (winner !== null) {
            return scores[winner];
        }
    
        if (isMaximizing) {
            let maxEval = -Infinity;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (gameBoard[i][j] === null) {  // Empty spot
                        gameBoard[i][j] = MyMove;
                        let eval = minimax(gameBoard, depth + 1, false, MyMove);
                        gameBoard[i][j] = null;      // Undo the move
                        maxEval = Math.max(maxEval, eval);
                    }
                }
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (gameBoard[i][j] === null) {  // Empty spot
                        gameBoard[i][j] = otherMove;
                        let eval = minimax(gameBoard, depth + 1, true, MyMove);
                        gameBoard[i][j] = null;  // Undo the move
                        minEval = Math.min(minEval, eval);
                    }
                }
            }
            return minEval;
        }
    }
    
    function getBestMove(gameBoard, MyMove) {
        let bestScore = -Infinity;
        let bestMove = null;
    
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (gameBoard[i][j] === null) {  // Empty spot
                    gameBoard[i][j] = MyMove;
                    let moveScore = minimax(gameBoard, 0, false, MyMove);
                    gameBoard[i][j] = null;  // Undo the move
    
                    if (moveScore > bestScore) {
                        bestScore = moveScore;
                        bestMove = { i, j };
                    }
                }
            }
        }
        return bestMove;
    }

    function getRandomMove(gameBoard) {
        let possibleMoves = [];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (gameBoard[i][j] === null)
                    possibleMoves.push({i, j});
            }
        }
        return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    }

    return {getAIMove};
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
        let numberOfMoves = 0;
        gameBoard.forEach(gv => {
            gv.forEach(g => {
                if (g !== null)
                    numberOfMoves++;
            })
        })

        let ans = checkRows(gameBoard) || checkCol(gameBoard) || checkDiagonals(gameBoard);
        if (ans) {
            return ans;
        } else if (numberOfMoves === 9) {
            return "draw";
        } 
        return null;
    }

    return {compute};
})();

const roundController = (function() {
    const gameBoard = [];
    let gameEnd = false;
    let move = 'X';
    let playerMove = null;
    let numberOfMoves = 0;
    let gameType = null;

    function initBoard() {
        for (let i = 0; i < 3; i++) {
            gameBoard.push([null, null, null]);
        }
    }

    function addSquareEventListener() {
        const squareElements = document.querySelectorAll('.square');
        squareElements.forEach(squareElement => {
            squareElement.addEventListener('click', (e) => {
                if (squareElement.classList.contains('marked') || gameEnd || 
                (move !== playerMove && gameType !== 'pvp'))
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
        move = move === 'X' ? 'O' : 'X';
        squareElement.classList.add('marked');
    }

    function handleAIMove() {
        // ACCURACY IS 100 RIGHT NOW!
        const aiMove = AIController.getAIMove(gameBoard, 100, playerMove === 'X' ? 'O' : 'X');
        const { i, j } = aiMove;

        gameBoard[i][j] = move;

        const squareIndex = i * 3 + j;
        const squareElement = document.querySelectorAll('.square')[squareIndex];
        squareElement.textContent = move;
        squareElement.classList.add('marked');
        move = playerMove;
    }

    function checkGameState() {
        let winner = winChecker.compute(gameBoard);
        const headerElement = document.querySelector('.header');
        if (winner === 'draw') {
            headerElement.textContent = 'Draw!';
            gameEnd = true;
        } else if (winner) {
            headerElement.textContent = 'Winner is: ' + winner;
            gameEnd = true;
        }
    }

    async function playRound() {
        checkGameState();
        if (!gameEnd && gameType !== 'pvp') {
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate AI thinking time
            handleAIMove();
            checkGameState();
        }
    }

    async function startGame(_gameType, playersMove) {
        initBoard();
        gameType = _gameType;
        if (gameType === "pva") {
            addSquareEventListener();
            playerMove = playersMove;
            if (move !== playerMove) {
                await new Promise(resolve => setTimeout(resolve, 500)); // Simulate AI thinking time
                handleAIMove();
            } 
        } else if (gameType === "pvp") {
            addSquareEventListener();
            playersMove = playersMove;
        } else {
            playRound();
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

    function initGamemode() {
        unload();
        const headerElement = document.querySelector('.header');
        const containerElement = document.querySelector('.container');

        headerElement.textContent = 'Choose Your Gamemode!';
        const pvpDiv = document.createElement('button');
        pvpDiv.textContent = 'Player vs Player';
        pvpDiv.classList.add('pvp');

        const pvaDiv = document.createElement('button');
        pvaDiv.textContent = 'Player vs AI';
        pvaDiv.classList.add('pva');

        const avaDiv = document.createElement('button');
        avaDiv.textContent = 'AI vs AI';
        avaDiv.classList.add('ava');

        [pvpDiv, pvaDiv, avaDiv].forEach(typeElement => {
            typeElement.addEventListener('click', (e) => {
                const type = e.target.classList[e.target.classList.length - 1];
                if (type === 'pvp') {
                    initRound(type, 'X');
                } else if (type === 'pva') {
                    initStart();
                } else {
                    initRound(type, 'X');
                }
            })
            containerElement.appendChild(typeElement);
        })

        containerElement.classList.add('gamemode');
    }

    function initStart() {
        unload();
        const headerElement = document.querySelector('.header');
        const containerElement = document.querySelector('.container');

        headerElement.textContent = 'Choose Your Move!';

        const xButton = document.createElement('button');
        xButton.textContent = 'X';
        const yButton = document.createElement('button');
        yButton.textContent = 'O';
        [xButton, yButton].forEach(btn => {
            btn.addEventListener('click', (e) => {
                move = e.target.textContent;
                initRound('pva', move);
            })
            containerElement.appendChild(btn);
        })
        containerElement.classList.remove('gamemode');
        containerElement.classList.add('move');
    }

    function initRound(gameType, playerMove) {
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

        containerElement.classList.remove('gamemode', 'move');
        containerElement.classList.add('play');

        roundController.startGame(gameType, playerMove);
    }

    return {initGamemode};
})();

const gameController = (function() {
    //UI.initStart();
    UI.initGamemode();
})();
