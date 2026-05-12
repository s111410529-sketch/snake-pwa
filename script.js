const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayScore = document.getElementById('overlay-score');
const overlayBtn = document.getElementById('overlay-btn');

const GRID = 20;
const SIZE = Math.min(400, window.innerWidth - 40);
canvas.width = SIZE;
canvas.height = SIZE;
const CELL = SIZE / GRID;

let snake, food, dir, nextDir, score, highScore, running, gameLoop;

function init() {
  const mid = Math.floor(GRID / 2);
  snake = [{ x: mid, y: mid }, { x: mid - 1, y: mid }, { x: mid - 2, y: mid }];
  dir = { x: 1, y: 0 };
  nextDir = { x: 1, y: 0 };
  score = 0;
  highScore = parseInt(localStorage.getItem('snake-high') || '0', 10);
  highScoreEl.textContent = highScore;
  scoreEl.textContent = '0';
  spawnFood();
  overlay.classList.add('hidden');
  running = true;
}

function spawnFood() {
  const empty = [];
  for (let x = 0; x < GRID; x++)
    for (let y = 0; y < GRID; y++)
      if (!snake.some(s => s.x === x && s.y === y)) empty.push({ x, y });
  food = empty.length ? empty[Math.floor(Math.random() * empty.length)] : null;
}

function update() {
  if (!running) return;
  dir = { ...nextDir };
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID || snake.some(s => s.x === head.x && s.y === head.y)) {
    gameOver();
    return;
  }

  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreEl.textContent = score;
    spawnFood();
    if (!food) { win(); return; }
  } else {
    snake.pop();
  }
}

function gameOver() {
  running = false;
  clearInterval(gameLoop);
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('snake-high', String(highScore));
    highScoreEl.textContent = highScore;
    overlayTitle.textContent = '新紀錄! 🎉';
  } else {
    overlayTitle.textContent = '遊戲結束';
  }
  overlayScore.textContent = `得分: ${score}`;
  overlay.classList.remove('hidden');
}

function win() {
  running = false;
  clearInterval(gameLoop);
  overlayTitle.textContent = '你贏了! 🏆';
  overlayScore.textContent = `得分: ${score}`;
  overlay.classList.remove('hidden');
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('snake-high', String(highScore));
    highScoreEl.textContent = highScore;
  }
}

function draw() {
  ctx.clearRect(0, 0, SIZE, SIZE);

  for (let x = 0; x < GRID; x++)
    for (let y = 0; y < GRID; y++)
      if ((x + y) % 2 === 0) {
        ctx.fillStyle = '#1a2a44';
        ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
      }

  snake.forEach((s, i) => {
    const hue = i === 0 ? 150 : 140 + Math.min(i * 2, 30);
    const sat = i === 0 ? 100 : 80;
    const lit = i === 0 ? 55 : 40 + (1 - i / snake.length) * 20;
    ctx.fillStyle = `hsl(${hue}, ${sat}%, ${lit}%)`;
    const pad = i === 0 ? 1 : 2;
    const r = i === 0 ? 4 : 3;
    roundRect(ctx, s.x * CELL + pad, s.y * CELL + pad, CELL - pad * 2, CELL - pad * 2, r);

    if (i === 0) {
      ctx.fillStyle = 'white';
      const cx = s.x * CELL + CELL / 2;
      const cy = s.y * CELL + CELL / 2;
      ctx.beginPath();
      ctx.arc(cx - 3, cy - 2, 2.5, 0, Math.PI * 2);
      ctx.arc(cx + 3, cy - 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(cx - 3 + dir.x, cy - 2 + dir.y, 1.2, 0, Math.PI * 2);
      ctx.arc(cx + 3 + dir.x, cy - 2 + dir.y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  if (food) {
    ctx.fillStyle = '#ff4757';
    const fx = food.x * CELL + CELL / 2;
    const fy = food.y * CELL + CELL / 2;
    ctx.beginPath();
    ctx.arc(fx, fy, CELL / 2 - 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff6b81';
    ctx.beginPath();
    ctx.arc(fx, fy, CELL / 2 - 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

function setDir(dx, dy) {
  if (dir.x !== -dx || dir.y !== -dy) nextDir = { x: dx, y: dy };
}

document.addEventListener('keydown', (e) => {
  const map = {
    ArrowUp: [0, -1], ArrowDown: [0, 1],
    ArrowLeft: [-1, 0], ArrowRight: [1, 0],
    w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0],
  };
  if (map[e.key]) { e.preventDefault(); setDir(...map[e.key]); }
});

document.getElementById('btn-up').addEventListener('click', () => setDir(0, -1));
document.getElementById('btn-down').addEventListener('click', () => setDir(0, 1));
document.getElementById('btn-left').addEventListener('click', () => setDir(-1, 0));
document.getElementById('btn-right').addEventListener('click', () => setDir(1, 0));

overlayBtn.addEventListener('click', () => { init(); start(); });

let touchStartX = 0, touchStartY = 0;
canvas.addEventListener('touchstart', (e) => {
  const t = e.touches[0];
  touchStartX = t.clientX;
  touchStartY = t.clientY;
}, { passive: true });

canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

canvas.addEventListener('touchend', (e) => {
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStartX;
  const dy = t.clientY - touchStartY;
  if (Math.abs(dx) > Math.abs(dy)) {
    setDir(dx > 0 ? 1 : -1, 0);
  } else if (Math.abs(dy) > 10) {
    setDir(0, dy > 0 ? 1 : -1);
  }
}, { passive: true });

function tick() {
  update();
  draw();
}

function start() {
  gameLoop = setInterval(tick, 120);
}

init();
start();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}
