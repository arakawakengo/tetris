const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const scale = 20;
const delay = 1000;

const nextPieceCanvas = document.getElementById('next-piece');
const nextPieceCtx = nextPieceCanvas.getContext('2d');
const nextPieceScale = 20;

const pieces = [
    // I
    { shape: [[1, 1, 1, 1]], color: "#0f0" },
    // O
    { shape: [[1, 1], [1, 1]], color: "#f00" },
    // T
    { shape: [[1, 1, 1], [0, 1, 0]], color: "#00f" },
    // L
    { shape: [[1, 1, 1], [1, 0, 0]], color: "#0ff" },
    // J
    { shape: [[1, 1, 1], [0, 0, 1]], color: "#f0f" },
    // S
    { shape: [[0, 1, 1], [1, 1, 0]], color: "#ff0" },
    // Z
    { shape: [[1, 1, 0], [0, 1, 1]], color: "#800" },
  ];

const board = new Array(canvas.height / scale)
  .fill(null)
  .map(() => new Array(canvas.width / scale).fill({state:0, color: "#222"}));

let currentPiece = createPiece();
let currentPosition = { x: Math.floor(board[0].length / 2) - 1, y: 0 };
let nextPiece = createPiece();
let score = 0;
let startTime = performance.now();

let isRunning = false;
let isPaused = false;

function startGame() {
    if (!isRunning) {
        isRunning = true;
        isPaused = false;
        document.getElementById('start').innerText = '最初から';
        document.getElementById('pause').disabled = false;
        document.getElementById('pause').innerText = '一時停止';
        currentPiece = createPiece();
        currentPosition = { x: Math.floor(board[0].length / 2) - 1, y: 0 };
        nextPiece = createPiece();
        drawNextPiece();
        startTime = performance.now();
        update();
    } else {
        gameOver(true);
        isRunning = false;
        document.getElementById('start').innerText = 'ゲーム開始';
        document.getElementById('pause').disabled = true;
    }
}

function pauseGame() {
    if (!isPaused) {
        isPaused = true;
        document.getElementById('pause').innerText = '再開';
    } else {
        isPaused = false;
        document.getElementById('pause').innerText = '一時停止';
        startTime = performance.now();
        update();
    }
}
  
function createPiece() {
    return pieces[Math.floor(Math.random() * pieces.length)];
}

function rotate(piece, direction) {
    const newShape = [];
    for (let x = 0; x < piece.shape[0].length; x++) {
        if (direction === "right") {
            newShape[x] = [];
        } else {
            newShape[piece.shape[0].length - 1 - x] = [];
        }
        for (let y = piece.shape.length - 1; y >= 0; y--) {
          if (direction === "right") {
            newShape[x][piece.shape.length - 1 - y] = piece.shape[y][x];
          } else {
            newShape[piece.shape[0].length - 1 - x][y] = piece.shape[y][x];
          }
        }
    }
    return { shape: newShape, color: currentPiece.color };
}

function collide(piece, position) {
    if (position.x < 0 || position.x + piece.shape[0].length > board[0].length ||
        position.y + piece.shape.length > board.length) {
            return true
        }
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (
                (piece.shape[y][x] && board[position.y + y][position.x + x].state !== 0)
            ) {
                return true;
            }
        }
    }
    return false;
}

function rotatePiece(direction) {
    const newPiece = rotate(currentPiece, direction);
    if (!collide(newPiece, currentPosition)) {
        currentPiece = newPiece;
    }
}

function merge(piece, position) {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x]) {
                board[position.y + y][position.x + x] = {state:1, color:piece.color};
            }
        }
    }
}

function movePiece(direction) {
    const newPosition = {
        x: currentPosition.x + direction,
        y: currentPosition.y,
    };
    if (!collide(currentPiece, newPosition)) {
        currentPosition = newPosition;
    }
}

function dropPiece() {
    const newPosition = { x: currentPosition.x, y: currentPosition.y + 1 };
    if (collide(currentPiece, newPosition)) {
        merge(currentPiece, currentPosition);
        currentPiece = nextPiece; 
        nextPiece = createPiece(); 
        currentPosition = { x: Math.floor(board[0].length / 2) - 1, y: 0 };
        
        if (collide(currentPiece, currentPosition)) {
            gameOver(false);
        }

        clearLines();
        drawNextPiece();
    } else {
        currentPosition = newPosition;
    }
}

function clearLines() {
    outer: for (let y = 0; y <= board.length - 1; y++) {
        for (let x = 0; x < board[y].length; x++) {
            if (!board[y][x].state) {
                continue outer;
            }
        }
        board.splice(y, 1);
        board.unshift(new Array(canvas.width / scale).fill({state:0, color:"#222"}));
        score += 10;
        document.getElementById('score').innerText = `スコア: ${score}`;
    }
}

function gameOver(isRestart) {
    if (isRestart) {
        alert("リスタート");
    } else {
        alert('ゲームオーバー');
    }
    board.length = 0;
    board.push(...new Array(canvas.height / scale)
        .fill(null)
        .map(() => new Array(canvas.width / scale).fill({state:0, color: "#222"})));

    score = 0;
    document.getElementById('score').innerText = `スコア: ${score}`;
}

function drawPiece(ctx, piece, position, color) {
    ctx.fillStyle = color;
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
            ctx.fillRect((position.x + x) * scale, (position.y + y) * scale, scale, scale);
            ctx.strokeStyle = '#222';
            ctx.strokeRect((position.x + x) * scale, (position.y + y) * scale, scale, scale);
        }
        }
    }
}

function drawNextPiece() {
    nextPieceCtx.fillStyle = '#222';
    nextPieceCtx.fillRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
    drawPiece(nextPieceCtx, nextPiece, { x: 1, y: 1 }, nextPiece.color);
}
        
function draw() {
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    drawPiece(ctx, currentPiece, currentPosition, currentPiece.color);
  
    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[y].length; x++) {
        if (board[y][x].state) {
          ctx.fillStyle = board[y][x].color;
          ctx.fillRect(x * scale, y * scale, scale, scale);
          ctx.strokeStyle = '#222';
          ctx.strokeRect(x * scale, y * scale, scale, scale);
        }
      }
    }
    requestAnimationFrame(draw);
}

function update(time) {
    if (!isPaused && isRunning) {
      if (time - startTime >= delay) {
        dropPiece();
        startTime = time;
      }
      requestAnimationFrame(update);
    }
}

document.addEventListener('keydown', (event) => {
    if (isRunning && !isPaused) {
        if (event.key === 'd') {
            rotatePiece("right");
        } else if (event.key === 'a') {
            rotatePiece("left"); 
        } else if (event.key === 'ArrowRight') {
            movePiece(1);
        } else if (event.key === 'ArrowLeft') {
            movePiece(-1);
        } else if (event.key === 'ArrowDown') {
            dropPiece();
        } else if (event.key === 'ArrowUp') {
            while (!collide(currentPiece, { x: currentPosition.x, y: currentPosition.y + 1 })) {
                currentPosition.y++;
            }
            dropPiece();
        }
    }
});

document.getElementById('start').addEventListener('click', startGame);
document.getElementById('pause').addEventListener('click', pauseGame);

drawNextPiece();
draw();
update();
