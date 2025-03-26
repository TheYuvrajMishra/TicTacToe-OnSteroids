function isMobile() {
      return /Mobi|Android|iPhone/i.test(navigator.userAgent);
    }

    window.onload = function () {
      if (!isMobile()) {
        alert("This website is only accessible on mobile devices.");
      } else {
        document.querySelector(".content").style.display = "block";
      }
    };

//Two Player ->


document.getElementById("two-player-button").addEventListener("click", function () {
    const bigBoard = document.getElementById("big-board");
    const resetButton = document.getElementById("reset-button");
    const popup = document.getElementById("popup");
    const timerDisplay = document.getElementById("timer-display");  // Timer display element

    let originalBoardHTML = bigBoard.innerHTML;  // Save the original board state
    let currentPlayer = 'X';
    let nextBoardIndex = null;
    let bigBoardState = Array(9).fill(null);
    let startTime, timerInterval;

    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    const cellToBoardMap = {
        0: 0, 1: 3, 2: 6,
        3: 1, 4: 4, 5: 7,
        6: 2, 7: 5, 8: 8
    };

    function initializeAllBoards() {
        const smallBoards = document.querySelectorAll(".small-board");
        smallBoards.forEach((board, index) => {
            initializeSmallBoard(board, index);
        });
    }

    function initializeSmallBoard(board, index) {
        board.innerHTML = '';  // Clear any previous cells
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement("div");
            cell.dataset.cellIndex = i;  // Store the cell index as a data attribute
            cell.dataset.boardIndex = index;  // Store the board index as a data attribute
            board.appendChild(cell);
        }
    }

    function startTimer() {
        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 1000);
    }

    function updateTimer() {
        const elapsedTime = Date.now() - startTime;
        const minutes = Math.floor(elapsedTime / 60000);
        const seconds = Math.floor((elapsedTime % 60000) / 1000);
        timerDisplay.textContent = `Time: ${minutes}m ${seconds}s`;
        timerDisplay.style.display = 'block';
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    function handleCellClick(event) {
        const cell = event.target;
        const board = cell.parentElement;
        const boardIndex = parseInt(cell.dataset.boardIndex);
        const cellIndex = parseInt(cell.dataset.cellIndex);

        if (!cell || cell.textContent !== '') return;  // Ignore clicks on filled cells

        if (!startTime) {
            startTimer();  // Start the timer on the first move
        }

        if (nextBoardIndex !== null && boardIndex !== nextBoardIndex) {
            showPopup(`You must play on board ${nextBoardIndex + 1}`);
            return;
        }

        cell.textContent = currentPlayer;

        if (checkWinner(board)) {
            showPopup(`${currentPlayer} wins on board ${boardIndex + 1}`);
            updateBigBoard(boardIndex, currentPlayer);
            bigBoardState[boardIndex] = currentPlayer;

            if (checkBigBoardWinner()) {
                stopTimer();  // Stop the timer when the game ends
                showPopup(`${currentPlayer} wins the big board in ${timerDisplay.textContent.slice(6)}!`);
                resetAllBoards();
                return;
            }
            resetBoard(board);
        } else if (isBoardFull(board)) {
            showPopup(`Board ${boardIndex + 1} is a draw`);
            bigBoardState[boardIndex] = 'Draw';
            resetBoard(board);
        }

        nextBoardIndex = cellToBoardMap[cellIndex];
        highlightNextBoard();
        if (isBoardFull(document.querySelectorAll(".small-board")[nextBoardIndex])) {
            nextBoardIndex = null;
        }

        currentPlayer = currentPlayer === 'X' ? 'O' : 'X'; // Switch players
    }

    function getAvailableCells() {
        if (nextBoardIndex !== null) {
            return [...document.querySelectorAll(".small-board")[nextBoardIndex].children]
                .filter(cell => cell.textContent === '');
        }
        return [...document.querySelectorAll(".small-board")]
            .flatMap(board => [...board.children])
            .filter(cell => cell.textContent === '');
    }

    function checkWinner(board) {
        const cells = board.querySelectorAll("div");

        return winningCombinations.some(combination => 
            combination.every(index => cells[index].textContent === currentPlayer)
        );
    }

    function isBoardFull(board) {
        return [...board.children].every(cell => cell.textContent !== '');
    }

    function resetBoard(board) {
        [...board.children].forEach(cell => cell.textContent = '');
    }

    function updateBigBoard(boardIndex, winner) {
        const bigBoardCells = bigBoard.querySelectorAll(".small-board");
        bigBoardCells[boardIndex].textContent = winner;
    }

    function checkBigBoardWinner() {
        return winningCombinations.some(combination => {
            const [a, b, c] = combination;
            return bigBoardState[a] && bigBoardState[a] === bigBoardState[b] && bigBoardState[a] === bigBoardState[c];
        });
    }

    function resetAllBoards() {
        bigBoard.innerHTML = originalBoardHTML;  // Replace the board with the original state
        bigBoardState.fill(null);
        nextBoardIndex = null;
        currentPlayer = 'X';
        initializeAllBoards();  // Reinitialize all boards
        clearHighlight();
        stopTimer();  // Stop the timer when the game is reset
        timerDisplay.textContent = "Time: 0m 0s";  // Reset the timer display
        startTime = null;  // Reset the start time
    }

    function highlightNextBoard() {
        clearHighlight();
        if (nextBoardIndex !== null) {
            document.querySelectorAll(".small-board")[nextBoardIndex].classList.add("highlight");
        }
    }

    function clearHighlight() {
        document.querySelectorAll(".small-board").forEach(board => board.classList.remove("highlight"));
    }

    function showPopup(message) {
        popup.textContent = message;
        popup.classList.add("show");

        // Add the flicker effect to the highlighted board
        const highlightedBoard = document.querySelector(".small-board.highlight");
        if (highlightedBoard) {
            highlightedBoard.classList.add("highlight-flicker");
        }

        setTimeout(() => {
            popup.classList.remove("show");

            // Remove the flicker effect after the popup disappears
            if (highlightedBoard) {
                highlightedBoard.classList.remove("highlight-flicker");
            }
        }, 500);  // Popup duration
    }

    // Event delegation: listen to clicks on the entire big board
    bigBoard.addEventListener("click", handleCellClick);

    // Initialize the boards and set up the reset button
    initializeAllBoards();
    resetButton.addEventListener("click", resetAllBoards);
});

//<- Two Player
