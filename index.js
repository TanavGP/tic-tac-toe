(function() {
    function setDynamicViewport() {
        let vh = window.innerHeight * 0.01;
        let vw = window.innerWidth * 0.01;
    
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        document.documentElement.style.setProperty('--vw', `${vw}px`);
    }
    
    window.addEventListener('resize', setDynamicViewport);
    window.addEventListener('load', setDynamicViewport);
    window.addEventListener('orientationchange', setDynamicViewport);
})();

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
    
        let winnerCompute = winChecker.compute(gameBoard);
        if (winnerCompute !== null) {
            return scores[winnerCompute.winner];
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
                return {winner: gameBoard[i][0], line: [[i, 0], [i, 1], [i, 2]]};
            }
        }
        return null;
    }
    
    function checkCol(gameBoard) {
        for (let i = 0; i < 3; i++) {
            if (match(gameBoard[0][i], gameBoard[1][i], gameBoard[2][i])) {
                return {winner: gameBoard[0][i], line: [[0, i], [1, i], [2, i]]};
            }
        }
        return null;
    }
    
    function checkDiagonals(gameBoard) {
        if (match(gameBoard[0][0], gameBoard[1][1], gameBoard[2][2])) {
            return {winner: gameBoard[1][1], line: [[0, 0], [1, 1], [2, 2]]};
        }
        if (match(gameBoard[0][2], gameBoard[1][1], gameBoard[2][0])) {
            return {winner: gameBoard[1][1], line: [[0, 2], [1, 1], [2, 0]]};
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
            return {winner: "draw", line: []};
        } 
        return null;
    }

    return {compute};
})();

function createPlayer(type, name, move, accuracy, speed) {
    function handleAIMove(gameBoard) {
        const aiMove = AIController.getAIMove(gameBoard, accuracy, move);
        const { i, j } = aiMove;
        gameBoard[i][j] = move;
        const squareElement = document.querySelectorAll('.square')[i * 3 + j];
        squareElement.classList.add('marked');
        const svgDiv = document.createElement('div');
        svgDiv.classList.add('svg', move === 'X' ? 'cross-svg' : 'circle-svg');
        setTimeout(() => {
            svgDiv.classList.add('expand');
        }, 10);
        squareElement.appendChild(svgDiv);
    }

    function handlePlayerMove(gameBoard, target, squareElement) {
        let val = target.value - 1;
        gameBoard[Math.floor(val / 3)][val % 3] = move;
        squareElement.classList.add('marked');
        const svgDiv = document.createElement('div');
        svgDiv.classList.add('svg', move === 'X' ? 'cross-svg' : 'circle-svg');
        setTimeout(() => {
            svgDiv.classList.add('expand');
        }, 10);
        squareElement.appendChild(svgDiv);
    }

    function isHuman() {
        return type === 'human';
    }

    function getName() {
        return name;
    }

    function isTurn(toCompare) {
        return move === toCompare;
    }

    function getSpeed() {
        return speed;
    }

    let handleMove = isHuman() ? handlePlayerMove : handleAIMove;

    return {
        handleMove,
        isHuman,
        getName,
        isTurn,
        ...(isHuman() ? {} : { getSpeed }) // Conditionally include getSpeed only if the player is not human
    };
}

const roundController = (function () {
    const gameBoard = [
        [null, null, null],
        [null, null, null],
        [null, null, null]
    ];
    let gameEnd = false;
    let currentPlayer = null;
    let player1, player2;
    let autoPlay = false;
    let scorePlayer1 = 0, scorePlayer2 = 0, drawCount = 0;
    const resetGameDelay = 1000; // in ms

    function switchPlayer() {
        currentPlayer = currentPlayer === player1 ? player2 : player1;
    }

    function addSquareEventListener() {
        const squareElements = document.querySelectorAll('.square');
        squareElements.forEach((squareElement) => {
            squareElement.addEventListener('click', (e) => {
                if (squareElement.classList.contains('marked') || gameEnd || !currentPlayer.isHuman())
                    return;

                currentPlayer.handleMove(gameBoard, e.target, squareElement);
                checkGameState();
                if (!gameEnd) {
                    switchPlayer();
                    if (!currentPlayer.isHuman()) {
                        aiTurn();
                    }
                }
            });
        });
    }

    async function aiTurn() {
        while (!gameEnd && !currentPlayer.isHuman()) {
            await new Promise((resolve) => setTimeout(resolve, 500 - 4 * currentPlayer.getSpeed())); // Simulate AI thinking time
            currentPlayer.handleMove(gameBoard);
            checkGameState();
            if (!gameEnd) {
                switchPlayer();
            }
        }
    }

    function checkGameState() {
        let winnerCompute = winChecker.compute(gameBoard);
        const headerElement = document.querySelector('.header');
        if (winnerCompute !== null && winnerCompute.winner === 'draw') {
            headerElement.textContent = 'Draw!';
            drawCount++;
            gameEnd = true;
        } else if (winnerCompute !== null) {
            headerElement.textContent = 'Winner is: ' + currentPlayer.getName();
            currentPlayer === player1 ? scorePlayer1++ : scorePlayer2++;
            gameEnd = true;
            drawWinnerLine(winnerCompute.line);
        }
        updateScoreboard();
        // auto play
        if (gameEnd && autoPlay) {
            resetGameWithDelay();
        }
    }

    function updateScoreboard() {
        const scoreboard = document.querySelector('.scoreboard');
        scoreboard.textContent = player1.getName() + ': ' + scorePlayer1 + ' Tie: ' + drawCount + ' '  + 
                                 player2.getName() + ': ' + scorePlayer2;
    }

    function drawWinnerLine(line) {
        const squareElements = document.querySelectorAll('.square');
        line.forEach(coords => {
            const value = 3 * coords[0] + coords[1];
            squareElements[value].classList.add('win-square');
            squareElements[value].children[0].classList.add('win-svg');
        })
    }

    async function resetGameWithDelay() {
        await new Promise((resolve) => setTimeout(resolve, resetGameDelay));
        resetGame();
    }

    async function resetGame() {
        for (let i = 0; i < 3; i++)
            gameBoard[i] = [null, null, null];

        const markedElements = document.querySelectorAll('.marked');
        markedElements.forEach(markedElement => {
            markedElement.classList.remove('marked', 'win-square');
            markedElement.replaceChildren();
        });

        const headerElement = document.querySelector('.header');
        headerElement.textContent = `${player1.getName()} vs ${player2.getName()}`;

        currentPlayer = player1;
        gameEnd = false;

        if (!currentPlayer.isHuman()) {
            await aiTurn();
        }
    }

    function resetScoreboard() {
        scorePlayer1 = 0;
        scorePlayer2 = 0;
        drawCount = 0;
    }

    async function startGame(p1, p2, autoPlaySetting) {
        player1 = p1;
        player2 = p2;
        currentPlayer = player1;
        gameEnd = false;
        autoPlay = autoPlaySetting;
        addSquareEventListener();
        updateScoreboard();
        const headerElement = document.querySelector('.header');
        headerElement.textContent = `${player1.getName()} vs ${player2.getName()}`;

        // Start the game loop for AI vs AI automatically
        if (!currentPlayer.isHuman()) {
            await aiTurn();
        }
    }

    return { startGame, resetGame, resetScoreboard };
})();

const UI = (function() {
    const defaultNames = {
        human : {
            1 : 'Adam',
            2 : 'Eve'
        },
        ai : {
            1 : 'SAL 9000',
            2 : 'HAL 9000'
        }
    };

    function unload() {
        const headerElement = document.querySelector('.header');
        const containerElement = document.querySelector('.container');

        headerElement.replaceChildren();
        containerElement.replaceChildren();
    }

    function initRound(player1, player2) {
        unload();
        const headerElement = document.querySelector('.header');
        const containerElement = document.querySelector('.container');
        const controlContainer = document.querySelector('.control-container');

        // Add 3 X 3 Grid
        headerElement.textContent = 'Play!';
        for (let i = 1; i <= 9; i++) {
            const buttonElement = document.createElement('button');
            buttonElement.classList.add('square');
            buttonElement.setAttribute('value', i);
            containerElement.appendChild(buttonElement);
        }

        // Add in-game class to control container
        controlContainer.classList.add('in-game');

        // Add back button
        const backButton = document.createElement('button');
        backButton.addEventListener('click', (event) => {
            document.querySelector('.container').replaceChildren();
            document.querySelector('.container').classList.replace('container', 'container-start');
            document.querySelector('.control-container').replaceChildren();
            document.querySelector('.control-container').classList.remove('in-game');
            roundController.resetGame();
            roundController.resetScoreboard();
            initGame();
        })
        const backSVGDiv = document.createElement('div');
        backSVGDiv.classList.add('svg', 'back-svg');
        backButton.appendChild(backSVGDiv);
        controlContainer.appendChild(backButton);

        // add reset button
        const resetButton = document.createElement('button');
        resetButton.addEventListener('click', roundController.resetGame);
        const resetSVGDiv = document.createElement('div');
        resetSVGDiv.classList.add('svg', 'reset-svg');
        resetButton.appendChild(resetSVGDiv);
        controlContainer.appendChild(resetButton);

        // add scoreboard
        const scoreboard = document.createElement('div');
        scoreboard.classList.add('scoreboard');
        controlContainer.appendChild(scoreboard);

        const autoPlay = document.querySelector('.auto-play-button').getAttribute('value') === 'ON';

        // delete the control buttons
        document.querySelector('.play-button').remove();
        document.querySelector('.auto-play-button').remove();

        roundController.startGame(player1, player2, autoPlay);
    }

    function startGame() {
        const containerElement = document.querySelector('.container-start');
        containerElement.classList.remove('container-start');
        containerElement.classList.add('container');

        const playerContainers = document.querySelectorAll('.player-container');

        const players = [];
        const turn = ['X', 'O'];
        playerContainers.forEach(playerContainer => {
            const playerNumber = playerContainer.getAttribute('value');
            const name = playerContainer.querySelector('.player-header').textContent;
            if (playerContainer.getAttribute('data-player-type') === 'human') {
                players.push(createPlayer('human', name, turn[playerNumber - 1]));
            } else {
                const accuracy = document.getElementById('accuracy-' + playerNumber).getAttribute('value');
                const speed = document.getElementById('speed-' + playerNumber).getAttribute('value');
                players.push(createPlayer('ai', name, turn[playerNumber - 1], accuracy, speed));
            }
        })

        initRound(players[0], players[1]);
    }

    function changePlayerForm(playerButton) {
        const playerContainer = playerButton.closest('.player-container');
        const playerNumber = playerContainer.getAttribute('value');
        const playerType = playerButton.getAttribute('value');
        
        setupPlayerContainer(playerContainer, playerType, playerNumber);
    }

    function setupPlayerContainer(playerContainer, playerType, playerNumber) {
        playerContainer.replaceChildren();
        playerContainer.classList.add('player-container');
        playerContainer.setAttribute('value', playerNumber);
        playerContainer.setAttribute('data-player-type', playerType);

        const playerHeader = document.createElement('div');
        playerHeader.classList.add('player-header');
        playerHeader.textContent = defaultNames[playerType][playerNumber];
        playerContainer.appendChild(playerHeader);
        
        const switchContainer = document.createElement('div');
        switchContainer.classList.add('switch-container');

        const humanButton = document.createElement('button'); // FOR HUMAN
        humanButton.classList.add('switch');
        humanButton.setAttribute('value', 'human');
        humanButton.disabled = playerType === 'human';
        const humanSVGDiv = document.createElement('div');
        humanSVGDiv.classList.add('svg', 'human-svg');
        humanButton.appendChild(humanSVGDiv);

        const aiButton = document.createElement('button');   // FOR if AI
        aiButton.classList.add('switch');
        aiButton.setAttribute('value', 'ai');
        aiButton.disabled = playerType !== 'human';
        const aiSVGDiv = document.createElement('div');
        aiSVGDiv.classList.add('svg', 'ai-svg');
        aiButton.appendChild(aiSVGDiv);

        [aiButton, humanButton].forEach(button => {
            button.addEventListener('click', (event) => {
                changePlayerForm(event.currentTarget);
            })
        })

        switchContainer.appendChild(humanButton);
        switchContainer.appendChild(aiButton);

        playerContainer.appendChild(switchContainer);

        // take care of inputs
        if (playerType === 'human') {
            const nameLabel = document.createElement('label');
            nameLabel.setAttribute('for', 'name-' + playerNumber);
            nameLabel.textContent = "Human's Name";
    
            const nameInput = document.createElement('input');
            nameInput.setAttribute('type', 'text');
            nameInput.setAttribute('id', 'name-' + playerNumber);
            nameInput.setAttribute('maxLength', '8');
            nameInput.addEventListener('input', (event) => {
                const playerHeaderElement = event.target.closest('.player-container')
                                                        .querySelector('.player-header');
                const trimmedText = event.target.value.trim();
                playerHeaderElement.textContent = trimmedText !== '' ? trimmedText : 
                defaultNames['human'][event.target.closest('.player-container').getAttribute('value')];
            })
            
            const inputElement = document.createElement('div');
            inputElement.classList.add('input-container');
            inputElement.appendChild(nameLabel);
            inputElement.appendChild(nameInput);
            playerContainer.appendChild(inputElement);
        } else if (playerType === 'ai') {
            // Create Accuracy scrollbar container
            const accuracyContainer = document.createElement('div');
            accuracyContainer.classList.add('scrollbar-container');

            const accuracyLabel = document.createElement('label');
            accuracyLabel.setAttribute('for', 'accuracy-' + playerNumber);
            accuracyLabel.textContent = "Accuracy - 50";

            const accuracyInput = document.createElement('input');
            accuracyInput.setAttribute('type', 'range');
            accuracyInput.setAttribute('id', 'accuracy-' + playerNumber);
            accuracyInput.setAttribute('min', '0');
            accuracyInput.setAttribute('max', '100');
            accuracyInput.value = '50'; // Default value
            accuracyInput.classList.add('custom-scrollbar');
            accuracyInput.addEventListener('input', function() {
                const value = this.value;
                this.previousElementSibling.textContent = "Accuracy - " + value;
                this.setAttribute('value', value);
            });

            // Create Speed scrollbar container
            const speedContainer = document.createElement('div');
            speedContainer.classList.add('scrollbar-container');

            const speedLabel = document.createElement('label');
            speedLabel.setAttribute('for', 'speed-' + playerNumber);
            speedLabel.textContent = "Speed - 50";

            const speedInput = document.createElement('input');
            speedInput.setAttribute('type', 'range');
            speedInput.setAttribute('id', 'speed-' + playerNumber);
            speedInput.setAttribute('min', '0');
            speedInput.setAttribute('max', '100');
            speedInput.value = '50'; // Default value
            speedInput.classList.add('custom-scrollbar');
            speedInput.addEventListener('input', function() {
                const value = this.value;
                this.previousElementSibling.textContent = "Speed - " + value;
                this.setAttribute('value', value);
            });

            const inputElement = document.createElement('div');
            inputElement.classList.add('input-container');
            inputElement.appendChild(accuracyLabel);
            inputElement.appendChild(accuracyInput);
            inputElement.appendChild(speedLabel);
            inputElement.appendChild(speedInput);
            playerContainer.appendChild(inputElement);
        }
    }

    function getAutoPlayButton() {
        const autoButton = document.createElement('button');
        autoButton.classList.add('auto-play-button');
        autoButton.textContent = 'AUTO PLAY: OFF';
        autoButton.setAttribute('value', 'OFF');
        autoButton.addEventListener('click', (event) => {
            if (event.target.getAttribute('value') === 'OFF') {
                event.target.setAttribute('value', 'ON');
                event.target.textContent = 'AUTO PLAY: ON';
            } else {
                event.target.setAttribute('value', 'OFF');
                event.target.textContent = 'AUTO PLAY: OFF';
            }
        });
        return autoButton;
    }

    function getPlayButton() {
        const playButton = document.createElement('button');
        playButton.classList.add('play-button');
        playButton.textContent = 'PLAY';
        playButton.addEventListener('click', (event) => {
            startGame();
        });
        return playButton;
    }

    function addControlButtons() {

        let controlElement = document.querySelector('.control-container');
        if (controlElement === null)
            controlElement = document.createElement('div');
        controlElement.classList.add('control-container');

        controlElement.appendChild(getAutoPlayButton());
        controlElement.appendChild(getPlayButton());

        // Insert before footer
        const footerElement = document.querySelector('.footer');
        footerElement.before(controlElement);
    }

    function addVSElement() {
        const containerElement = document.querySelector('.container-start');
        const vsDiv = document.createElement('div');
        vsDiv.classList.add('vs', 'svg', 'vs-svg');
        containerElement.appendChild(vsDiv);
    }

    const resetHeader = () => document.querySelector('.header').textContent = 'Tic-Tac-Toe';

    function initGame() {
        const containerElement = document.querySelector('.container-start');

        const playerForm1 = document.createElement('div');
        const playerForm2 = document.createElement('div');

        setupPlayerContainer(playerForm1, 'human', 1);
        setupPlayerContainer(playerForm2, 'ai', 2);

        containerElement.appendChild(playerForm1);
        containerElement.appendChild(playerForm2);
        
        resetHeader();

        // Handle control Elements
        addControlButtons();

        addVSElement();
    }

    initGame();
})();
