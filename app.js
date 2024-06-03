let board = [];
let currentPlayer = 'Red';
let redTime = 120;
let blueTime = 120;
let gameInterval;
let bullets = [];

const boardElement = document.getElementById('board');
const turnIndicator = document.getElementById('turn-indicator');
const redTimer = document.getElementById('red-timer');
const blueTimer = document.getElementById('blue-timer');
const winnerElement = document.getElementById('win-message');

function createBoard() {
    for (let i = 0; i < 8; i++) {
        board[i] = [];
        for (let j = 0; j < 8; j++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.dataset.row = i;
            tile.dataset.col = j;
            tile.addEventListener('click', () => onTileClick(i, j));
            tile.addEventListener('mouseover', () => onTileHover(i, j));
            tile.addEventListener('mouseout', () => clearHighlights());
            board[i][j] = null;
            boardElement.appendChild(tile);
        }
    }
}

function onTileHover(row, col) {
    const piece = board[row][col];
    if (piece && piece.player === currentPlayer) {
        const validMoves = getValidMoves(row, col, piece.type);
        highlightTiles(validMoves);
    }
}

function getValidMoves(row, col, type) {
    const moves = [];
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue; // Skipping the current tile
            const newRow = row + i;
            const newCol = col + j;
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                if (isValidMove(row, col, newRow, newCol, type) && !board[newRow][newCol]) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
    }
    return moves;
}


function highlightTiles(tiles) {
    tiles.forEach(tile => {
        const tileElement = document.querySelector(`.tile[data-row='${tile.row}'][data-col='${tile.col}']`);
        tileElement.classList.add('highlight');
    });
}

function clearHighlights() {
    document.querySelectorAll('.tile.highlight').forEach(tile => {
        tile.classList.remove('highlight');
    });
}

document.getElementById('pause-button').addEventListener('click', pauseGame);
document.getElementById('resume-button').addEventListener('click', resumeGame);
document.getElementById('reset-button').addEventListener('click', resetGame);
document.getElementById('rotate-button').addEventListener('click', rotatePiece);

function pauseGame() {
    clearInterval(gameInterval);
    document.getElementById('pause-button').style.display = 'none';
    document.getElementById('resume-button').style.display = 'inline-block';
}

function resumeGame() {
    startTimer();
    document.getElementById('pause-button').style.display = 'inline-block';
    document.getElementById('resume-button').style.display = 'none';
}

function resetGame() {
    clearInterval(gameInterval);
    // Clear the board array
    board = [];
    bullets = [];
    currentPlayer = 'Red';
    redTime = 120;
    blueTime = 120;
    redTimer.textContent = `Red: ${redTime}s`;
    blueTimer.textContent = `Blue: ${blueTime}s`;
    winnerElement.textContent = '';
    // Clear the boardElement and recreate the board
    boardElement.innerHTML = '';
    initializeGame();
}


function initializeGame() {
    createBoard();
    placePieces();
    updateTurnIndicator();
    startTimer();
}

function placePieces() {
    const redPieces = [
        { type: 'titan', player: 'Red' },
        { type: 'tank', player: 'Red' },
        { type: 'tank', player: 'Red' },
        { type: 'ricochet', player: 'Red' },
        { type: 'ricochet', player: 'Red' },
        { type: 'semi-ricochet', player: 'Red' }
    ];

    const bluePieces = [
        { type: 'titan', player: 'Blue' },
        { type: 'tank', player: 'Blue' },
        { type: 'tank', player: 'Blue' },
        { type: 'ricochet', player: 'Blue' },
        { type: 'ricochet', player: 'Blue' },
        { type: 'semi-ricochet', player: 'Blue' }
    ];

    // Generating all possible positions on the upper half of the board for Red excluding row 0
    const redPositions = [];
    for (let i = 1; i < 4; i++) {
        for (let j = 0; j < 8; j++) {
            redPositions.push({ row: i, col: j });
        }
    }

    // Generating all possible positions on the lower half of the board for Blue excluding row 7
    const bluePositions = [];
    for (let i = 4; i < 7; i++) {
        for (let j = 0; j < 8; j++) {
            bluePositions.push({ row: i, col: j });
        }
    }

    // Shuffling the positions arrays
    shuffleArray(redPositions);
    shuffleArray(bluePositions);

    // placing the red cannon at a random position in row 0
    const redCannonCol = Math.floor(Math.random() * 8);
    placePiece(0, redCannonCol, 'cannon', 'Red');

    // placing each remaining red piece at a random position in the upper half excluding row 0
    redPieces.forEach((piece, index) => {
        const position = redPositions[index];
        placePiece(position.row, position.col, piece.type, piece.player);
    });

    // placing the blue cannon at a random position in row 7
    const blueCannonCol = Math.floor(Math.random() * 8);
    placePiece(7, blueCannonCol, 'cannon', 'Blue');

    // placing each remaining blue piece at a random position in the lower half excluding row 7
    bluePieces.forEach((piece, index) => {
        const position = bluePositions[index];
        placePiece(position.row, position.col, piece.type, piece.player);
    });
}

// shuffle algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function placePiece(row, col, type, player) {
    const tile = document.querySelector(`.tile[data-row='${row}'][data-col='${col}']`);
    const piece = document.createElement('div');
    piece.classList.add('piece',type, player.toLowerCase());
    if (type === 'cannon' || type === 'titan' || type === 'tank') {
        piece.textContent = type.charAt(0).toUpperCase() + type.slice(1);
    } else if (type === 'semi-ricochet') {
        piece.classList.add('semi-ricochet');
    } else if (type === 'ricochet') {
        piece.classList.add('ricochet');
    }
    tile.appendChild(piece);
    board[row][col] = { type, player };
}

function updateTurnIndicator() {
    turnIndicator.textContent = `${currentPlayer}'s Turn`;
}

function startTimer() {
    gameInterval = setInterval(() => {
        if (currentPlayer === 'Red') {
            redTime--;
            redTimer.textContent = `Red: ${redTime}s`;
            if (redTime <= 0) {
                endGame('Blue');
            }
        } else {
            blueTime--;
            blueTimer.textContent = `Blue: ${blueTime}s`;
            if (blueTime <= 0) {
                endGame('Red');
            }
        }
    }, 1000);
}

function endGame(winner) {
    clearInterval(gameInterval);
    setTimeout(() => {
        const winMessage = document.getElementById('win-message');
        winMessage.textContent = `${winner} has won!`;
        const modal = document.getElementById('modal');
        modal.style.display = 'block';
    }, 1000);
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}

function onTileClick(row, col) {
    const selectedTile = board[row][col];
    if (selectedTile && selectedTile.player === currentPlayer) {
        document.querySelectorAll('.tile').forEach(tile => {
            tile.classList.remove('selected');
        });
        document.querySelector(`.tile[data-row='${row}'][data-col='${col}']`).classList.add('selected');
        document.querySelectorAll('.piece').forEach(piece => {
            piece.classList.remove('chosen');
        });
        const pieceElement = document.querySelector(`.tile[data-row='${row}'][data-col='${col}'] .piece`);
        if (pieceElement) {
            pieceElement.classList.add('chosen');
        }
    } else {
        movePiece(row, col);
    }
}


function rotatePiece() {
    const selectedTile = document.querySelector('.tile.selected');
    if (!selectedTile) return;

    const row = parseInt(selectedTile.dataset.row);
    const col = parseInt(selectedTile.dataset.col);
    const piece = board[row][col];

    if (piece && (piece.type === 'ricochet' || piece.type === 'semi-ricochet') && piece.player === currentPlayer) {
        // logic for rotation
        const pieceElement = selectedTile.querySelector(`.${piece.type}`);
        if (pieceElement) {
            if (pieceElement.classList.contains('rotated')) {
                pieceElement.classList.remove('rotated');
            } else {
                pieceElement.classList.add('rotated');
            }
            fireCannon(currentPlayer);
            switchPlayer();
        }
    }
}

function movePiece(newRow, newCol) {
    const selectedTile = document.querySelector('.tile.selected');
    if (!selectedTile) return;
    
    const [oldRow, oldCol] = [parseInt(selectedTile.dataset.row), parseInt(selectedTile.dataset.col)];
    const piece = board[oldRow][oldCol];

    if (isValidMove(oldRow, oldCol, newRow, newCol, piece.type)) {
        board[newRow][newCol] = piece;
        board[oldRow][oldCol] = null;
        selectedTile.classList.remove('selected');
        const newTile = document.querySelector(`.tile[data-row='${newRow}'][data-col='${newCol}']`);
        newTile.innerHTML = selectedTile.innerHTML;
        selectedTile.innerHTML = '';

        clearHighlights();
        fireCannon(piece.player);
        checkForWinConditions();
        switchPlayer();
    }
}

function isValidMove(oldRow, oldCol, newRow, newCol, type) {
    const rowDiff = Math.abs(newRow - oldRow);
    const colDiff = Math.abs(newCol - oldCol);
    if (type === 'cannon' && oldRow !== newRow) return false;
    return rowDiff <= 1 && colDiff <= 1;
}

function switchPlayer() {
    currentPlayer = currentPlayer === 'Red' ? 'Blue' : 'Red';
    updateTurnIndicator();
}

function moveBullet(bullet, bulletElement) {
    // Calculating the next position of the bullet
    const nextRow = bullet.row + bullet.direction.row;
    const nextCol = bullet.col + bullet.direction.col;
    
    // Checking if the bullet goes out of bounds
    if (nextRow < 0 || nextRow >= 8 || nextCol < 0 || nextCol >= 8) {
        bulletElement.remove(); // Removing the bullet if it goes out of bounds
        return;
    }

    const nextTile = document.querySelector(`.tile[data-row='${nextRow}'][data-col='${nextCol}']`);
    const nextTileRect = nextTile.getBoundingClientRect();
    const boardRect = boardElement.getBoundingClientRect();
    
    // Updating bullet position
    bullet.row = nextRow;
    bullet.col = nextCol;

    // Moving the bullet element to the next tile
    bulletElement.style.transform = `translate(${nextTileRect.left - boardRect.left + 20}px, ${nextTileRect.top - boardRect.top + 20}px)`;

    setTimeout(() => {
        const targetPiece = board[nextRow][nextCol];
        if (targetPiece) {
            if (handleBulletCollision(bullet, nextRow, nextCol, targetPiece)) {
                bulletElement.remove(); // Removing the bullet if it stops due to collision
                return;
            }
        }

        // Continue moving the bullet
        moveBullet(bullet, bulletElement);
    }, 500);
}


function fireCannon(player) {
    const row = player === 'Red' ? 0 : 7;
    const cannonCol = board[row].findIndex(piece => piece && piece.type === 'cannon' && piece.player === player);
    if (cannonCol !== -1) {
        const direction = player === 'Red' ? { row: 1, col: 0 } : { row: -1, col: 0 };
        const bullet = { row, col: cannonCol, direction };

        bullets.push(bullet);

        // Creating bullet element
        const bulletElement = document.createElement('div');
        bulletElement.classList.add('bullet', player.toLowerCase());

        const cannonTile = document.querySelector(`.tile[data-row='${row}'][data-col='${cannonCol}']`);
        const cannonTileRect = cannonTile.getBoundingClientRect();
        const boardRect = boardElement.getBoundingClientRect();

        bulletElement.style.transform = `translate(${cannonTileRect.left - boardRect.left + 20}px, ${cannonTileRect.top - boardRect.top + 20}px)`;

        boardElement.appendChild(bulletElement);

        // Starting moving the bullet
        moveBullet(bullet, bulletElement);
    }
}


function updateBullets() {
    const newBullets = [];
    bullets.forEach(bullet => {
        let { row, col, direction } = bullet;
        let newRow = row + direction;

        // Checking bounds and collisions
        if (newRow < 0 || newRow >= 8) return; // if bullet goes out of bounds

        const targetPiece = board[newRow][col];
        if (targetPiece) {
            if (handleBulletCollision(bullet, newRow, col, targetPiece)) {
                // if Bullet collides with a peice stop,not adding it to newBullets
                return;
            }
        } else {
            // bullet moves to the new row
            row = newRow;
        }

        // Adding bullet to newBullets if it does not stop
        newBullets.push({ row, col, direction });
    });

    bullets = newBullets;
}

function handleBulletCollision(bullet, row, col, piece) {
    const tile = document.querySelector(`.tile[data-row='${row}'][data-col='${col}']`);
    const pieceElement = tile.querySelector(`.${piece.type}`);
    
    if (piece.type === 'tank') {
        return true;
    } else if (piece.type === 'semi-ricochet') {
        const isRotated = pieceElement.classList.contains('rotated');
        const bulletDirection = bullet.direction;

        let hitsSlantedSide = false;

        if (piece.player.toLowerCase() === 'red') {
            if (isRotated) {
                if ((bulletDirection.row === 0 && bulletDirection.col === 1) || (bulletDirection.row === 1 && bulletDirection.col === 0)) {
                    hitsSlantedSide = true;
                }
            } else {
                if ((bulletDirection.row === 0 && bulletDirection.col === -1) || (bulletDirection.row === -1 && bulletDirection.col === 0)) {
                    hitsSlantedSide = true;
                }
            }
        } else if (piece.player.toLowerCase() === 'blue') {
            if (isRotated) {
                if ((bulletDirection.row === 0 && bulletDirection.col === -1) || (bulletDirection.row === -1 && bulletDirection.col === 0)) {
                    hitsSlantedSide = true;
                }
            } else {
                if ((bulletDirection.row === 0 && bulletDirection.col === 1) || (bulletDirection.row === 1 && bulletDirection.col === 0)) {
                    hitsSlantedSide = true;
                }
            }
        }

        if (hitsSlantedSide) {
            //Changing bullet direction by 90 degrees
            if (bulletDirection.row !== 0) {
                bullet.direction.col = isRotated ? bulletDirection.row: -bulletDirection.row;
                bullet.direction.row = 0;
            } else {
                bullet.direction.row = isRotated ? -bulletDirection.col: bulletDirection.col;
                bullet.direction.col = 0;
            }
        } else {
            // Destroying the Semi-Ricochet piece
            tile.innerHTML = '';
            board[row][col] = null;
        }
        return false;
    } else if (piece.type === 'titan') {
        endGame(bullet.direction.row === 1 ? 'Red' : 'Blue');
        return true;
    } else if (piece.type === 'ricochet') {
        const isRotated = pieceElement.classList.contains('rotated');

        if (isRotated) {
            if (bullet.direction.row !== 0) {
                bullet.direction.col = bullet.direction.row;
                bullet.direction.row = 0;
            } else {
                bullet.direction.row = -bullet.direction.col;
                bullet.direction.col = 0;
            }
        } else {
            if (bullet.direction.row !== 0) {
                bullet.direction.col = -bullet.direction.row;
                bullet.direction.row = 0;
            } else {
                bullet.direction.row = bullet.direction.col;
                bullet.direction.col = 0;
            }
        }
        return false;
    }else if (piece.type === 'cannon') {
        // Cannon collision logic
        if (piece.player !== bullet.player) {
            // If the cannon belongs to the opposing player, do nothing
            return true; // Stop the bullet without any effect
        }
    }

    // Destroying the piece
    tile.innerHTML = '';
    board[row][col] = null;
    return false;
}

// this is to update bullets
setInterval(updateBullets, 1000); 


function checkForWinConditions() {
    bullets.forEach(bullet => {
        const piece = board[bullet.row][bullet.col];
        if (piece && piece.type === 'titan') {
            // Checking if the titan belongs to the opposing team
            if (piece.player !== currentPlayer) {
                endGame(currentPlayer);
            }
        }
    });
}

initializeGame();