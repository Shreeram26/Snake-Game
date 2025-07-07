const gameBoard = document.querySelector("#gameBoard");
const ctx = gameBoard.getContext("2d");
const scoreText = document.querySelector("#scoreText");
const resetBtn = document.querySelector("#resetBtn");
const aiToggleBtn = document.querySelector("#aiToggleBtn");

const gameWidth = gameBoard.width;
const gameHeight = gameBoard.height;
const boardBackground = "rgb(220, 237, 96)";
const snakeColor = "rgb(77,104,90)";
const foodColor = "red";
const snakeBorder = "black";
const unitSize = 25;

let running = false;
let xVelocity = unitSize;
let yVelocity = 0;
let foodX, foodY;
let score = 0;
let aiEnabled = false;
const highScoreText = document.querySelector("#highScoreText");
let highScore = localStorage.getItem("snakeHighScore") || 0;
highScore = parseInt(highScore);

let snake = [
  { x: unitSize * 4, y: 0 },
  { x: unitSize * 3, y: 0 },
  { x: unitSize * 2, y: 0 },
  { x: unitSize * 1, y: 0 },
  { x: 0, y: 0 },
];

window.addEventListener("keydown", changeDirection);
resetBtn.addEventListener("click", resetGame);
aiToggleBtn.addEventListener("click", () => {
  aiEnabled = !aiEnabled;
  aiToggleBtn.textContent = aiEnabled ? "Disable AI" : "Enable AI";
});

gameStart();

function gameStart() {
  running = true;
  scoreText.textContent = score;
  highScoreText.textContent = `High Score: ${highScore}`;
  createFood();
  drawFood();
  nextTick();
}

function nextTick() {
  if (running) {
    setTimeout(() => {
      clearBoard();
      drawFood();
      if (aiEnabled) {
        autoMoveSnake(); // AI move
      }
      moveSnake();
      drawSnake();
      checkGameOver();
      nextTick();
    }, 100);
  } else {
    displayGameOver();
  }
}

function clearBoard() {
  ctx.fillStyle = boardBackground;
  ctx.fillRect(0, 0, gameWidth, gameHeight);
}

function createFood() {
  const randomFood = (min, max) =>
    Math.round((Math.random() * (max - min) + min) / unitSize) * unitSize;
  foodX = randomFood(0, gameWidth - unitSize);
  foodY = randomFood(0, gameHeight - unitSize);
}

function drawFood() {
  ctx.fillStyle = foodColor;
  ctx.fillRect(foodX, foodY, unitSize, unitSize);
}

function moveSnake() {
  const head = {
    x: snake[0].x + xVelocity,
    y: snake[0].y + yVelocity,
  };
  snake.unshift(head);

  if (head.x === foodX && head.y === foodY) {
    score++;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("snakeHighScore", highScore);
      highScoreText.textContent = `High Score: ${highScore}`;
    }
    scoreText.textContent = score;
    createFood();
  } else {
    snake.pop();
  }
}

function drawSnake() {
  ctx.fillStyle = snakeColor;
  ctx.strokeStyle = snakeBorder;
  snake.forEach((part) => {
    ctx.fillRect(part.x, part.y, unitSize, unitSize);
    ctx.strokeRect(part.x, part.y, unitSize, unitSize);
  });
}

function changeDirection(event) {
  if (aiEnabled) return; // Disable manual control when AI is on

  const key = event.keyCode;
  const goingUp = yVelocity === -unitSize;
  const goingDown = yVelocity === unitSize;
  const goingLeft = xVelocity === -unitSize;
  const goingRight = xVelocity === unitSize;

  switch (key) {
    case 38: // Up
      if (!goingDown) {
        xVelocity = 0;
        yVelocity = -unitSize;
      }
      break;
    case 40: // Down
      if (!goingUp) {
        xVelocity = 0;
        yVelocity = unitSize;
      }
      break;
    case 37: // Left
      if (!goingRight) {
        xVelocity = -unitSize;
        yVelocity = 0;
      }
      break;
    case 39: // Right
      if (!goingLeft) {
        xVelocity = unitSize;
        yVelocity = 0;
      }
      break;
  }
}

function displayGameOver() {
  ctx.font = "50px MV Boli";
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER!", gameWidth / 2, gameHeight / 2);
}

function checkGameOver() {
  const head = snake[0];
  if (head.x < 0 || head.x >= gameWidth || head.y < 0 || head.y >= gameHeight)
    running = false;

  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      running = false;
    }
  }
}

function resetGame() {
  score = 0;
  xVelocity = unitSize;
  yVelocity = 0;
  scoreText.textContent = score;
  snake = [
    { x: unitSize * 4, y: 0 },
    { x: unitSize * 3, y: 0 },
    { x: unitSize * 2, y: 0 },
    { x: unitSize * 1, y: 0 },
    { x: 0, y: 0 },
  ];
  gameStart();
}

function isCollision(x, y) {
  if (x < 0 || y < 0 || x >= gameWidth || y >= gameHeight) return true;
  return snake.some((part) => part.x === x && part.y === y);
}

function autoMoveSnake() {
  const head = snake[0];

  const directions = [
    { x: 0, y: -unitSize, name: "UP" },
    { x: 0, y: unitSize, name: "DOWN" },
    { x: -unitSize, y: 0, name: "LEFT" },
    { x: unitSize, y: 0, name: "RIGHT" },
  ];

  const queue = [];
  const visited = new Set();
  const cameFrom = {};

  const startKey = `${head.x},${head.y}`;
  queue.push({ x: head.x, y: head.y });
  visited.add(startKey);

  let found = false;
  let endKey = "";

  while (queue.length > 0 && !found) {
    const current = queue.shift();

    for (const dir of directions) {
      const newX = current.x + dir.x;
      const newY = current.y + dir.y;
      const key = `${newX},${newY}`;

      if (
        newX < 0 ||
        newY < 0 ||
        newX >= gameWidth ||
        newY >= gameHeight ||
        visited.has(key) ||
        snake.some((part) => part.x === newX && part.y === newY)
      ) {
        continue;
      }

      queue.push({ x: newX, y: newY });
      visited.add(key);
      cameFrom[key] = { x: current.x, y: current.y };

      if (newX === foodX && newY === foodY) {
        found = true;
        endKey = key;
        break;
      }
    }
  }

  if (!found) return;

  let path = [];
  let currKey = endKey;

  while (currKey !== startKey) {
    const prev = cameFrom[currKey];
    path.unshift(currKey);
    currKey = `${prev.x},${prev.y}`;
  }

  if (path.length > 0) {
    const [nextX, nextY] = path[0].split(",").map(Number);
    xVelocity = nextX - head.x;
    yVelocity = nextY - head.y;
  }
}
