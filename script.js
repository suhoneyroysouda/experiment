const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const messageEl = document.getElementById("message");

const ROAD = {
  x: 70,
  y: 0,
  width: 280,
  laneCount: 3
};

const player = {
  width: 52,
  height: 92,
  x: canvas.width / 2 - 26,
  y: canvas.height - 130,
  color: "#38bdf8",
  speed: 7
};

let enemies = [];
let score = 0;
let gameOver = false;
let spawnTimer = 0;
let lastTime = 0;

const keys = {
  left: false,
  right: false
};

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
    keys.left = true;
  }
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
    keys.right = true;
  }
  if (event.key.toLowerCase() === "r" && gameOver) {
    resetGame();
  }
});

document.addEventListener("keyup", (event) => {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
    keys.left = false;
  }
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
    keys.right = false;
  }
});

function laneX(laneIndex) {
  const laneWidth = ROAD.width / ROAD.laneCount;
  return ROAD.x + laneIndex * laneWidth + (laneWidth - player.width) / 2;
}

function spawnEnemy() {
  const lane = Math.floor(Math.random() * ROAD.laneCount);
  const carWidth = 52;
  const carHeight = 92;
  const carColor = randomColor();

  enemies.push({
    lane,
    x: laneX(lane),
    y: -carHeight,
    width: carWidth,
    height: carHeight,
    color: carColor,
    speed: 4 + Math.random() * 2 + score * 0.08
  });
}

function randomColor() {
  const colors = ["#f87171", "#4ade80", "#fbbf24", "#c084fc", "#fb7185", "#2dd4bf"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function resetGame() {
  enemies = [];
  score = 0;
  gameOver = false;
  spawnTimer = 0;
  messageEl.classList.add("hidden");
  scoreEl.textContent = score;
  player.x = canvas.width / 2 - player.width / 2;
  lastTime = 0;
}

function update(delta) {
  if (gameOver) return;

  if (keys.left) {
    player.x -= player.speed * delta;
  }
  if (keys.right) {
    player.x += player.speed * delta;
  }

  const leftLimit = ROAD.x + 10;
  const rightLimit = ROAD.x + ROAD.width - player.width - 10;
  player.x = Math.max(leftLimit, Math.min(rightLimit, player.x));

  spawnTimer += delta;
  if (spawnTimer > 900) {
    spawnEnemy();
    spawnTimer = 0;
  }

  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].y += enemies[i].speed * delta;

    if (enemies[i].y > canvas.height) {
      enemies.splice(i, 1);
      score++;
      scoreEl.textContent = score;
      continue;
    }

    if (rectCollision(player, enemies[i])) {
      gameOver = true;
      messageEl.classList.remove("hidden");
    }
  }
}

function rectCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function drawCar(x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);

  // windows
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.fillRect(x + 8, y + 10, width - 16, 22);
  ctx.fillRect(x + 8, y + height - 32, width - 16, 22);

  // wheels
  ctx.fillStyle = "#111827";
  ctx.fillRect(x + 6, y + 6, 9, 18);
  ctx.fillRect(x + width - 15, y + 6, 9, 18);
  ctx.fillRect(x + 6, y + height - 24, 9, 18);
  ctx.fillRect(x + width - 15, y + height - 24, 9, 18);
}

function drawRoad() {
  // background
  ctx.fillStyle = "#374151";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // road
  ctx.fillStyle = "#1f2937";
  ctx.fillRect(ROAD.x, ROAD.y, ROAD.width, canvas.height);

  // road lines
  ctx.strokeStyle = "#f8fafc";
  ctx.lineWidth = 5;
  ctx.setLineDash([30, 20]);
  ctx.beginPath();
  ctx.moveTo(ROAD.x + ROAD.width / 3, 0);
  ctx.lineTo(ROAD.x + ROAD.width / 3, canvas.height);
  ctx.moveTo(ROAD.x + (ROAD.width * 2) / 3, 0);
  ctx.lineTo(ROAD.x + (ROAD.width * 2) / 3, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);

  // side borders
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(ROAD.x - 6, 0, 6, canvas.height);
  ctx.fillRect(ROAD.x + ROAD.width, 0, 6, canvas.height);
}

function draw() {
  drawRoad();

  drawCar(player.x, player.y, player.width, player.height, player.color);

  for (const enemy of enemies) {
    drawCar(enemy.x, enemy.y, enemy.width, enemy.height, enemy.color);
  }
}

function gameLoop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const delta = (timestamp - lastTime) / 16.67;
  lastTime = timestamp;

  update(delta);
  draw();

  requestAnimationFrame(gameLoop);
}

resetGame();
requestAnimationFrame(gameLoop);
