// script.js
const boardSize = 8; // Tamaño del tablero 8x8
const mineCount = 10; // Número de minas
let board = [];
let timer;
let timeElapsed = 0;
let bombClicked = false;
const boardElement = document.getElementById('board');
const messageElement = document.getElementById('message');
const timerElement = document.getElementById('timer');
const resetButton = document.getElementById('reset-button');

// Restricción de tiempo
const allowTesting = true; // Cambiar a false para habilitar solo en la fecha/hora real

function isGameAvailable() {
    const now = new Date();
    if (allowTesting) return false; // Siempre habilitado para pruebas
    return (
        now.getMonth() === 11 && // Diciembre (mes 11)
        now.getDate() === 25 &&
        now.getHours() >= 8 &&
        now.getHours() < 9
    );
}

// Mostrar cuenta regresiva si no está disponible
function showCountdown() {
    const now = new Date();
    const targetTime = new Date(now.getFullYear(), 11, 25, 8, 0, 0);
    const timeLeft = targetTime - now;

    if (timeLeft > 0) {
        const hours = Math.floor(timeLeft / 3600000);
        const minutes = Math.floor((timeLeft % 3600000) / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        messageElement.textContent = `El juego estará disponible en ${hours}h ${minutes}m ${seconds}s.`;
    } else {
        startGame();
    }
}

// Crear tablero
function createBoard() {
    boardElement.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
    boardElement.innerHTML = '';
    board = [];
    bombClicked = false;
    for (let row = 0; row < boardSize; row++) {
        board[row] = [];
        for (let col = 0; col < boardSize; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            board[row][col] = { hasMine: false, revealed: false, isFlagged: false, element: cell };
            boardElement.appendChild(cell);

            cell.addEventListener('click', () => revealCell(row, col));
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                toggleFlag(row, col);
            });
        }
    }
}

// Colocar minas
function placeMines() {
    let placedMines = 0;
    while (placedMines < mineCount) {
        const row = Math.floor(Math.random() * boardSize);
        const col = Math.floor(Math.random() * boardSize);
        if (!board[row][col].hasMine) {
            board[row][col].hasMine = true;
            placedMines++;
        }
    }
}

// Revelar celda
function revealCell(row, col) {
    const cell = board[row][col];
    if (cell.revealed || cell.isFlagged) return;
    cell.revealed = true;
    cell.element.classList.add('revealed');
    if (cell.hasMine) {
        cell.element.classList.add('mine');
        cell.element.textContent = '💣'; // Emoji de bomba
        bombClicked = true;
        endGame(false);
        return;
    }

    const mineCount = countAdjacentMines(row, col);
    if (mineCount > 0) {
        cell.element.textContent = mineCount;
        cell.element.style.color = getNumberColor(mineCount); // Colorear el número
    } else {
        revealAdjacentCells(row, col);
    }

    checkWin();
}

// Obtener color para los números
function getNumberColor(count) {
    const colors = ['blue', 'green', 'red', 'purple', 'maroon', 'turquoise', 'black', 'gray'];
    return colors[count - 1] || 'black';
}

// Contar minas adyacentes
function countAdjacentMines(row, col) {
    let count = 0;
    for (let r = -1; r <= 1; r++) {
        for (let c = -1; c <= 1; c++) {
            const newRow = row + r;
            const newCol = col + c;
            if (
                newRow >= 0 &&
                newRow < boardSize &&
                newCol >= 0 &&
                newCol < boardSize &&
                board[newRow][newCol].hasMine
            ) {
                count++;
            }
        }
    }
    return count;
}

// Revelar celdas adyacentes
function revealAdjacentCells(row, col) {
    for (let r = -1; r <= 1; r++) {
        for (let c = -1; c <= 1; c++) {
            const newRow = row + r;
            const newCol = col + c;
            if (
                newRow >= 0 &&
                newRow < boardSize &&
                newCol >= 0 &&
                newCol < boardSize &&
                !board[newRow][newCol].revealed
            ) {
                revealCell(newRow, newCol);
            }
        }
    }
}

// Marcar celda con bandera
function toggleFlag(row, col) {
    const cell = board[row][col];
    if (cell.revealed) return;
    cell.isFlagged = !cell.isFlagged;
    cell.element.textContent = cell.isFlagged ? '🚩' : '';
    cell.element.classList.toggle('flag', cell.isFlagged);
}

// Iniciar temporizador
function startTimer() {
    timeElapsed = 0;
    timer = setInterval(() => {
        timeElapsed++;
        timerElement.textContent = `Tiempo: ${timeElapsed}s`;
    }, 1000);
}

// Detener temporizador
function stopTimer() {
    clearInterval(timer);
}

// Verificar si se ganó
function checkWin() {
    const allCellsRevealed = board.flat().every(
        (cell) => cell.revealed || (cell.hasMine && cell.isFlagged)
    );
    if (allCellsRevealed) {
        endGame(true);
    }
}

// Terminar juego
function endGame(won) {
    stopTimer();
    if (won && !bombClicked) {
        messageElement.textContent = `🎉 ¡Ganaste! próxima contraseña= Número 25`;
    } else {
        messageElement.textContent = '💥 ¡Perdiste! ¡Inténtalo de nuevo!';
    }
    board.flat().forEach((cell) => {
        cell.element.removeEventListener('click', () => revealCell);
    });
}

// Reiniciar juego
function resetGame() {
    if (!isGameAvailable()) {
        setInterval(showCountdown, 1000);
        return;
    }
    messageElement.textContent = '';
    createBoard();
    placeMines();
    startTimer();
}

// Inicializar juego
resetButton.addEventListener('click', resetGame);
resetGame();
