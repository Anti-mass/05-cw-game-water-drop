// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly

// New variables for score, timer, and messages
let score = 0;
let timeLeft = 30;
let timerInterval;

const winningMessages = [
  "Amazing! You’re a water drop master!",
  "Fantastic job! You win!",
  "You nailed it! Water drop champion!",
  "Incredible! You beat the game!",
  "Victory! You’re unstoppable!"
];
const losingMessages = [
  "Try again! You can do it!",
  "Almost there! Give it another shot!",
  "Don’t give up! Try once more!",
  "Keep practicing! You’ll get it!",
  "So close! Try again!"
];

const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const messageDisplay = document.getElementById("message");

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", startGame);

function startGame() {
  // Always reset game state, even if already running
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timerInterval);

  gameRunning = true;

  // Change button text to 'Restart Game'
  const startBtn = document.getElementById("start-btn");
  if (startBtn) startBtn.textContent = "Restart Game";

  // Reset score and timer
  score = 0;
  timeLeft = 30;
  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeLeft;
  if (messageDisplay) messageDisplay.textContent = '';
  document.getElementById("game-container").innerHTML = '';

  // Hide modal if open
  const modal = document.getElementById('cw-modal');
  if (modal) modal.style.display = 'none';

  // Start drop creation and timer
  dropMaker = setInterval(createDrop, 1000);
  timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
  timeLeft--;
  timeDisplay.textContent = timeLeft;
  if (timeLeft <= 0) {
    endGame();
  }
}

function endGame() {
  clearInterval(dropMaker);
  clearInterval(timerInterval);
  gameRunning = false;
  // Remove all drops
  document.querySelectorAll('.water-drop').forEach(drop => drop.remove());
  // Show message
  let messages, msg;
  if (score >= 12) {
    messages = winningMessages;
    launchConfetti();
  } else {
    messages = losingMessages;
  }
  msg = messages[Math.floor(Math.random() * messages.length)];
  if (messageDisplay) messageDisplay.textContent = msg;
  // Show charity: water modal after short delay
  setTimeout(() => {
    const modal = document.getElementById('cw-modal');
    if (modal) modal.style.display = 'flex';
  }, 900);
}

// Confetti effect for win
function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const container = document.getElementById('game-container');
  canvas.width = container.offsetWidth;
  canvas.height = container.offsetHeight;
  canvas.style.display = 'block';
  canvas.style.left = container.offsetLeft + 'px';
  canvas.style.top = container.offsetTop + 'px';
  const ctx = canvas.getContext('2d');
  const confettiCount = 120;
  const confetti = [];
  for (let i = 0; i < confettiCount; i++) {
    confetti.push({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * confettiCount,
      color: `hsl(${Math.random()*360},90%,60%)`,
      tilt: Math.random() * 10 - 10
    });
  }
  let angle = 0;
  let frame = 0;
  function drawConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    angle += 0.01;
    for (let i = 0; i < confettiCount; i++) {
      let c = confetti[i];
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2, false);
      ctx.fillStyle = c.color;
      ctx.fill();
      c.y += (Math.cos(angle + c.d) + 2 + c.r/2) * 0.9;
      c.x += Math.sin(angle) * 2;
      c.tilt = Math.sin(angle + i) * 15;
      if (c.y > canvas.height) {
        c.x = Math.random() * canvas.width;
        c.y = Math.random() * -20;
      }
    }
    frame++;
    if (frame < 70) {
      requestAnimationFrame(drawConfetti);
    } else {
      canvas.style.display = 'none';
    }
  }
  drawConfetti();
}

// Modal close logic
window.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('cw-modal');
  const closeBtn = document.getElementById('cw-modal-close');
  if (closeBtn && modal) {
    closeBtn.onclick = function() {
      modal.style.display = 'none';
    };
  }
  // Hide modal if user clicks outside content
  if (modal) {
    modal.onclick = function(event) {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    };
  }
});

function createDrop() {
  // Create a new div element that will be our water drop
  const drop = document.createElement("div");
  // Randomly decide if this is a bad drop (30% chance)
  const isBad = Math.random() < 0.3;
  drop.className = isBad ? "water-drop bad-drop" : "water-drop";

  // Make drops different sizes for visual variety
  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  // Position the drop randomly across the game width
  // Subtract 60 pixels to keep drops fully inside the container
  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";

  // Make drops fall for 4 seconds
  drop.style.animationDuration = "4s";

  // Add the new drop to the game screen
  document.getElementById("game-container").appendChild(drop);

  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    drop.remove(); // Clean up drops that weren't caught
  });
  // Add click event to increase or decrease score
  drop.addEventListener("click", function() {
    if (!gameRunning) return;
    if (isBad) {
      score = Math.max(0, score - 1);
      scoreDisplay.textContent = score;
      // Animate score feedback (red for bad)
      scoreDisplay.classList.add('score-shake');
      setTimeout(() => scoreDisplay.classList.remove('score-shake'), 250);
      // Animate drop feedback (red flash)
      drop.classList.add('drop-bad-caught');
      setTimeout(() => drop.remove(), 180);
    } else {
      score++;
      scoreDisplay.textContent = score;
      // Animate score feedback
      scoreDisplay.classList.add('score-bounce');
      setTimeout(() => scoreDisplay.classList.remove('score-bounce'), 250);
      // Animate drop feedback
      drop.classList.add('drop-caught');
      setTimeout(() => drop.remove(), 180);
    }
  });
}
