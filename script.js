// Winning combinations for a 3x3 board
const winningCombinations = [
    [0, 1, 2], // rows
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6], // columns
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8], // diagonals
    [2, 4, 6]
];

// Track game state
let gameOver = false;
let activeBigCell = null; // Tracks which big cell player must play in (null = any big cell)
let lastSmallCellIndex = null; // Tracks the index of the last small cell played

// Check if a player has won in a small board
function checkSmallBoardWin(bigCell) {
    const smallCells = bigCell.querySelectorAll('.small.cell');

    for (let combo of winningCombinations) {
        const [a, b, c] = combo;
        const cellA = smallCells[a].textContent;
        const cellB = smallCells[b].textContent;
        const cellC = smallCells[c].textContent;

        if (cellA && cellA === cellB && cellB === cellC) {
            return cellA; // Return the winning symbol (X or O)
        }
    }
    return null;
}

// Mark the big cell with the winning symbol
function markBigCell(bigCell, symbol) {
    bigCell.classList.add('won');
    bigCell.dataset.winner = symbol;

    // Add overlay with the symbol
    const overlay = document.createElement('div');
    overlay.className = 'big-cell-overlay';
    overlay.textContent = symbol;
    overlay.classList.add(symbol === 'X' ? 'x-mark' : 'o-mark');
    bigCell.appendChild(overlay);
}

// Get the index of a big cell (0-8)
function getBigCellIndex(bigCell) {
    const allBigCells = document.querySelectorAll('.big.cell');
    return Array.from(allBigCells).indexOf(bigCell);
}

// Get the index of a small cell within its big cell (0-8)
function getSmallCellIndex(smallCell) {
    const bigCell = smallCell.closest('.big.cell');
    const smallCells = bigCell.querySelectorAll('.small.cell');
    return Array.from(smallCells).indexOf(smallCell);
}

// Get the big cell at a given index
function getBigCellByIndex(index) {
    const allBigCells = document.querySelectorAll('.big.cell');
    return allBigCells[index];
}

// Update active big cell highlighting
function updateActiveBigCellDisplay() {
    const allBigCells = document.querySelectorAll('.big.cell');
    allBigCells.forEach(cell => {
        cell.classList.remove('active-region');
    });

    if (activeBigCell !== null) {
        const activeCell = getBigCellByIndex(activeBigCell);
        if (activeCell) {
            activeCell.classList.add('active-region');
        }
    }
}

// Check if a player has won on the big board (3x3 grid of boards)
function checkBigBoardWin() {
    const bigCells = document.querySelectorAll('.big.cell');

    // Convert big cells to array of winners (or null if not won)
    const bigBoardState = Array.from(bigCells).map(cell => cell.dataset.winner || null);

    // Check all winning combinations
    for (let combo of winningCombinations) {
        const [a, b, c] = combo;
        const cellA = bigBoardState[a];
        const cellB = bigBoardState[b];
        const cellC = bigBoardState[c];

        // Check if all three are the same symbol and not empty
        if (cellA && cellA === cellB && cellB === cellC) {
            return cellA; // Return the winning symbol (X or O)
        }
    }
    return null;
}

// Show congratulatory message when a player wins
function showWinnerMessage(symbol) {
    const modal = document.createElement('div');
    modal.className = 'win-modal';
    modal.innerHTML = `
        <div class="win-message">
            <h2>🎉 Congratulations! 🎉</h2>
            <p class="winner-text">${symbol} Wins the Game!</p>
            <p class="win-message-text">You've conquered the Ultimate Tic-Tac-Toe!</p>
            <button id="restart-in-modal" onclick="restartGame()">Play Again</button>
        </div>
    `;
    document.body.appendChild(modal);
    gameOver = true;
}

// Restart the game by clearing all cells
function restartGame() {
    const cells = document.querySelectorAll('.small.cell');
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x-mark', 'o-mark');
    });

    const bigCells = document.querySelectorAll('.big.cell');
    bigCells.forEach(bigCell => {
        bigCell.classList.remove('won', 'active-region');
        bigCell.dataset.winner = '';
        const overlay = bigCell.querySelector('.big-cell-overlay');
        if (overlay) {
            overlay.remove();
        }
    });

    // Remove win modal if it exists
    const winModal = document.querySelector('.win-modal');
    if (winModal) {
        winModal.remove();
    }

    gameOver = false;
    activeBigCell = null;
    lastSmallCellIndex = null;
}

// Add click event listeners to cells
document.addEventListener('DOMContentLoaded', function () {
    const cells = document.querySelectorAll('.small.cell');
    let isXNext = true;

    cells.forEach(cell => {
        cell.addEventListener('click', function () {
            if (this.textContent === '' && !gameOver) {
                const bigCell = this.closest('.big.cell');
                const bigCellIndex = getBigCellIndex(bigCell);

                // Check if this move is allowed based on the active region rule
                let isAllowedMove = false;

                if (activeBigCell === null) {
                    // First move: can play anywhere
                    isAllowedMove = true;
                } else {
                    // Get the big cell that the player is directed to
                    const directedBigCell = getBigCellByIndex(activeBigCell);

                    if (directedBigCell && directedBigCell.classList.contains('won')) {
                        // Directed big cell is already won
                        // Player can play in any other unwon big cell
                        isAllowedMove = !bigCell.classList.contains('won');
                    } else if (bigCellIndex === activeBigCell) {
                        // Playing in the required active big cell
                        isAllowedMove = true;
                    }
                }

                if (!isAllowedMove) {
                    return; // Ignore invalid move
                }

                // Make the move
                const symbol = isXNext ? 'X' : 'O';
                this.textContent = symbol;
                this.classList.add(symbol === 'X' ? 'x-mark' : 'o-mark');
                isXNext = !isXNext;

                // Track the position of this move within its big cell
                lastSmallCellIndex = getSmallCellIndex(this);

                // Update the active big cell for the next move
                activeBigCell = lastSmallCellIndex;
                updateActiveBigCellDisplay();

                // Check if the big cell containing this small cell has been won
                if (!bigCell.classList.contains('won')) {
                    const winner = checkSmallBoardWin(bigCell);
                    if (winner) {
                        markBigCell(bigCell, winner);

                        // Check if the big board has been won
                        const bigBoardWinner = checkBigBoardWin();
                        if (bigBoardWinner) {
                            showWinnerMessage(bigBoardWinner);
                        }
                    }
                }
            }
        });
    });

    // Initialize display
    updateActiveBigCellDisplay();
});
