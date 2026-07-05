// 1. DOM 요소 찾기
const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");
const scoreText = document.querySelector("#scoreText");
const timeText = document.querySelector("#timeText");
const stateText = document.querySelector("#stateText");
const overlay = document.querySelector("#overlay");
const overlayTitle = document.querySelector("#overlayTitle");
const overlayText = document.querySelector("#overlayText");
const overlayStartButton = document.querySelector("#overlayStartButton");
const startButton = document.querySelector("#startButton");
const pauseButton = document.querySelector("#pauseButton");
const restartButton = document.querySelector("#restartButton");
const muteButton = document.querySelector("#muteButton");
const touchButtons = document.querySelectorAll(".touch-button");

// 2. 게임 설정값
const gameConfig = {
  width: 360,
  height: 520,
  playerSize: 34,
  starSize: 24,
  playerSpeed: 235,
  gameSeconds: 30
};

// 3. 게임 상태 변수
let player = { x: 160, y: 430 };
let star = { x: 120, y: 120 };
let score = 0;
let timeLeft = gameConfig.gameSeconds;
let gameState = "ready";
let lastFrameTime = 0;
let timerId = null;
let isMuted = false;
const pressedKeys = new Set();
const pressedDirections = new Set();

// 나중에 멀티플레이로 확장할 때는 화면 전체를 보내지 말고,
// 입력값, 점수, 이벤트, 게임 상태처럼 작은 데이터만 보내야 합니다.
// 무료 클라우드는 방 만들기, 참가자 목록, 연결 정보 교환 정도에만 사용하고,
// 빠른 실시간 게임 데이터는 WebRTC DataChannel로 보내는 것을 권장합니다.

// 4. 초기화 함수
function initGame() {
  resizeCanvasForSharpDrawing();
  resetGame();
  drawGame();
}

function resizeCanvasForSharpDrawing() {
  canvas.width = gameConfig.width;
  canvas.height = gameConfig.height;
}

// 5. 게임 시작 함수
function startGame() {
  if (gameState === "playing") return;

  if (gameState === "gameover") {
    resetGame();
  }

  gameState = "playing";
  lastFrameTime = performance.now();
  overlay.classList.add("is-hidden");
  updateStateText();
  startTimer();
  requestAnimationFrame(gameLoop);
}

// 6. 일시정지 함수
function togglePause() {
  if (gameState === "ready" || gameState === "gameover") return;

  if (gameState === "paused") {
    gameState = "playing";
    overlay.classList.add("is-hidden");
    lastFrameTime = performance.now();
    startTimer();
    requestAnimationFrame(gameLoop);
  } else {
    gameState = "paused";
    stopTimer();
    showOverlay("일시정지", "다시 일시정지 버튼이나 P 키를 누르면 이어서 플레이합니다.");
  }

  updateStateText();
}

// 7. 다시 시작 함수
function resetGame() {
  stopTimer();
  player = { x: 160, y: 430 };
  score = 0;
  timeLeft = gameConfig.gameSeconds;
  gameState = "ready";
  pressedKeys.clear();
  pressedDirections.clear();
  createStar();
  updateScoreText();
  updateTimeText();
  updateStateText();
  showOverlay("별을 많이 모아보세요", "시작 버튼을 누르거나 Space 키를 누르면 게임이 시작됩니다.");
  drawGame();
}

function finishGame() {
  gameState = "gameover";
  stopTimer();
  updateStateText();
  showOverlay("게임오버", `최종 점수는 ${score}점입니다. 다시하기로 한 번 더 도전해보세요.`);
}

// 8. 플레이어 이동 함수
function movePlayer(deltaSeconds) {
  const direction = getMoveDirection();
  const distance = gameConfig.playerSpeed * deltaSeconds;

  player.x += direction.x * distance;
  player.y += direction.y * distance;

  player.x = clamp(player.x, 0, gameConfig.width - gameConfig.playerSize);
  player.y = clamp(player.y, 0, gameConfig.height - gameConfig.playerSize);
}

function getMoveDirection() {
  let x = 0;
  let y = 0;

  if (pressedKeys.has("ArrowLeft") || pressedKeys.has("a") || pressedDirections.has("left")) x -= 1;
  if (pressedKeys.has("ArrowRight") || pressedKeys.has("d") || pressedDirections.has("right")) x += 1;
  if (pressedKeys.has("ArrowUp") || pressedKeys.has("w") || pressedDirections.has("up")) y -= 1;
  if (pressedKeys.has("ArrowDown") || pressedKeys.has("s") || pressedDirections.has("down")) y += 1;

  if (x !== 0 && y !== 0) {
    x *= 0.707;
    y *= 0.707;
  }

  return { x, y };
}

// 9. 별 생성 함수
function createStar() {
  star = {
    x: randomInt(20, gameConfig.width - gameConfig.starSize - 20),
    y: randomInt(20, gameConfig.height - gameConfig.starSize - 20)
  };
}

// 10. 충돌 체크 함수
function checkCollision() {
  const playerCenterX = player.x + gameConfig.playerSize / 2;
  const playerCenterY = player.y + gameConfig.playerSize / 2;
  const starCenterX = star.x + gameConfig.starSize / 2;
  const starCenterY = star.y + gameConfig.starSize / 2;
  const distance = Math.hypot(playerCenterX - starCenterX, playerCenterY - starCenterY);

  if (distance < gameConfig.playerSize / 2 + gameConfig.starSize / 2) {
    score += 1;
    updateScoreText();
    createStar();
    // 나중에 소리를 넣는다면 여기에서 별 획득 효과음을 재생하면 됩니다.
  }
}

// 11. 점수 업데이트 함수
function updateScoreText() {
  scoreText.textContent = score;
}

function updateTimeText() {
  timeText.textContent = timeLeft;
}

function updateStateText() {
  const labels = {
    ready: "대기중",
    playing: "플레이중",
    paused: "일시정지",
    gameover: "게임오버"
  };

  stateText.textContent = labels[gameState];
}

// 12. 화면 그리기 함수
function drawGame() {
  ctx.clearRect(0, 0, gameConfig.width, gameConfig.height);
  drawBackground();
  drawStar();
  drawPlayer();
}

function drawBackground() {
  ctx.fillStyle = "#102142";
  ctx.fillRect(0, 0, gameConfig.width, gameConfig.height);

  ctx.fillStyle = "rgba(255,255,255,0.18)";
  for (let i = 0; i < 36; i += 1) {
    const x = (i * 73) % gameConfig.width;
    const y = (i * 47) % gameConfig.height;
    ctx.fillRect(x, y, 2, 2);
  }
}

function drawPlayer() {
  ctx.fillStyle = "#4f7cff";
  ctx.fillRect(player.x, player.y, gameConfig.playerSize, gameConfig.playerSize);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(player.x + 9, player.y + 10, 5, 5);
  ctx.fillRect(player.x + 20, player.y + 10, 5, 5);
}

function drawStar() {
  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.arc(star.x + gameConfig.starSize / 2, star.y + gameConfig.starSize / 2, gameConfig.starSize / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fff5c4";
  ctx.beginPath();
  ctx.arc(star.x + 8, star.y + 8, 4, 0, Math.PI * 2);
  ctx.fill();
}

// 13. 게임 루프
function gameLoop(currentTime) {
  if (gameState !== "playing") return;

  const deltaSeconds = Math.min((currentTime - lastFrameTime) / 1000, 0.05);
  lastFrameTime = currentTime;

  movePlayer(deltaSeconds);
  checkCollision();
  drawGame();

  requestAnimationFrame(gameLoop);
}

function startTimer() {
  stopTimer();
  timerId = window.setInterval(() => {
    timeLeft -= 1;
    updateTimeText();

    if (timeLeft <= 0) {
      finishGame();
    }
  }, 1000);
}

function stopTimer() {
  if (timerId) {
    window.clearInterval(timerId);
    timerId = null;
  }
}

// 14. 키보드 이벤트
window.addEventListener("keydown", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;

  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) {
    event.preventDefault();
  }

  if (key === " ") startGame();
  if (key === "p") togglePause();
  if (key === "r") resetGame();

  pressedKeys.add(key);
});

window.addEventListener("keyup", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  pressedKeys.delete(key);
});

// 15. 터치 버튼 이벤트
touchButtons.forEach((button) => {
  const direction = button.dataset.direction;

  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    pressedDirections.add(direction);
    button.classList.add("is-pressed");
  });

  button.addEventListener("pointerup", () => {
    pressedDirections.delete(direction);
    button.classList.remove("is-pressed");
  });

  button.addEventListener("pointercancel", () => {
    pressedDirections.delete(direction);
    button.classList.remove("is-pressed");
  });
});

startButton.addEventListener("click", startGame);
overlayStartButton.addEventListener("click", startGame);
pauseButton.addEventListener("click", togglePause);
restartButton.addEventListener("click", resetGame);
muteButton.addEventListener("click", () => {
  isMuted = !isMuted;
  muteButton.textContent = isMuted ? "소리 켜기" : "음소거";
  muteButton.setAttribute("aria-pressed", String(isMuted));
  // 실제 소리 파일을 추가하면 여기에서 모든 효과음의 볼륨을 켜고 끌 수 있습니다.
});

function showOverlay(title, text) {
  overlayTitle.textContent = title;
  overlayText.textContent = text;
  overlay.classList.remove("is-hidden");
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

initGame();
