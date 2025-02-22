let lives = 3;
let gameScore = 0;
let gameTimer = 0;
let timerInterval;
let isPaused = false;
let currentLevel = 1;

document.addEventListener('DOMContentLoaded', () => {
    const startMenu = document.getElementById('start-menu');
    const startButton = document.getElementById('start-button');

    startButton.addEventListener('click', () => {
        createGameUI();
        gameStart();
        startMenu.remove();
    });
});

function createGameUI() {
    const gameContainer = document.createElement('div');
    gameContainer.id = 'game-container';

    const gameInfo = document.createElement('div');
    gameInfo.id = 'game-info';

    const livesSpan = document.createElement('span');
    livesSpan.id = 'lives-span'

    const livesImage = document.createElement('img');

    livesImage.src = '/arkanoid-game/src/heart.png'
    livesImage.id = 'lives-img'
    livesImage.style.width = '20px'
    livesImage.style.height = '20px'

    const livesValue = document.createElement('span');
    livesValue.id = 'lives';
    livesValue.textContent = lives;

    livesSpan.appendChild(livesImage);
    livesSpan.appendChild(livesValue)

    const Scorespan = document.createElement('span')
    Scorespan.innerHTML = 'Score: <span id="score">0</span>'
    const timerSpan = document.createElement('span');
    timerSpan.innerHTML = 'Time: <span id="timer">0s</span>';
    const levelSpan = document.createElement('span');
    levelSpan.innerHTML = `Level: <span id="level">1</span>`;

    const pauseButton = document.createElement('button');
    pauseButton.id = 'pause-button';
    pauseButton.textContent = 'Pause';
    pauseButton.addEventListener('click', togglePause);

    gameInfo.appendChild(livesSpan);
    gameInfo.appendChild(Scorespan);
    gameInfo.appendChild(timerSpan);
    gameInfo.appendChild(levelSpan);
    gameInfo.appendChild(pauseButton);

    const gameArea = document.createElement('div');
    gameArea.id = 'game-area';

    const paddle = document.createElement('div');
    paddle.id = 'paddle';

    const ball = document.createElement('div');
    ball.id = 'ball';

    const bricks = document.createElement('div');
    bricks.id = 'bricks';

    gameArea.appendChild(paddle);
    gameArea.appendChild(ball);
    gameArea.appendChild(bricks);

    gameContainer.appendChild(gameInfo);
    gameContainer.appendChild(gameArea);

    document.body.appendChild(gameContainer);
    paddle.style.left = `44%`;
    generateBricks();
}

function generateBricks() {
    const brickArea = document.getElementById('bricks');
    const gameArea = document.getElementById('game-area');
    brickArea.innerHTML = '';

    const gameWidth = gameArea.clientWidth;
    const desiredBrickWidth = 50;
    const numBricksPerRow = Math.floor(gameWidth / desiredBrickWidth);
    const numRows = currentLevel === 1 ? 1 : currentLevel + 1;
    const colors = ['red', 'orange', 'yellow', 'green', 'blue'];

    brickArea.style.gridTemplateColumns = `repeat(${numBricksPerRow}, 1fr)`;

    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numBricksPerRow; col++) {
            const brick = document.createElement('div');
            brick.classList.add('brick');
            brick.style.backgroundColor = colors[row % colors.length];
            brick.setAttribute('data-hit', 'false');
            brickArea.appendChild(brick);
        }
    }
}

window.addEventListener('resize', () => {
    location.reload();
});

let ballX
let ballY
function gameStart() {
    const gameArea = document.getElementById('game-area');
    const paddle = document.getElementById('paddle');
    const ball = document.getElementById('ball');
    const livesValue = document.getElementById('lives');

    let paddleSpeed = 10;
    let moveLeft = false;
    let moveRight = false;

    document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') moveLeft = true;
        if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') moveRight = true;
    });

    document.addEventListener('keyup', (event) => {
        if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') moveLeft = false;
        if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') moveRight = false;
        if (event.key === ' ') togglePause();
    });

    function movePaddle() {
        if (!isPaused) {
            const gameAreaRect = gameArea.getBoundingClientRect();
            const paddleWidth = paddle.offsetWidth;
            let newLeft = paddle.offsetLeft;

            if (moveLeft) {
                newLeft -= paddleSpeed;
            }
            if (moveRight) {
                newLeft += paddleSpeed;
            }

            newLeft = Math.max(0, Math.min(gameAreaRect.width - paddleWidth - 3, newLeft));

            paddle.style.left = `${newLeft}px`;
        }
        requestAnimationFrame(movePaddle);
    }

    ballX = gameArea.offsetWidth / 2;
    ballY = gameArea.offsetHeight / 2;
    let ballSpeedX = (Math.random() * 4 + 2) * (Math.random() < 0.5 ? -1 : 1);
    let ballSpeedY = -(Math.random() * 2 + 3);

    function moveBall() {
        if (!isPaused) {
            const ballRect = ball.getBoundingClientRect();
            const gameAreaRect = gameArea.getBoundingClientRect();
            const paddleRect = paddle.getBoundingClientRect();
            const score = document.getElementById('score')
            const bricks = document.querySelectorAll('.brick');

            if (ballX <= 0 || ballX + ballRect.width >= gameAreaRect.width) {
                ballSpeedX *= -1;
            }

            if (ballY <= 0) {
                ballSpeedY *= -1;
            }

            if (
                ballRect.bottom >= paddleRect.top &&
                ballRect.top < paddleRect.bottom &&
                ballRect.left < paddleRect.right &&
                ballRect.right > paddleRect.left
            ) {
                const paddleCenter = paddleRect.left + paddleRect.width / 2;
                const ballCenter = ballRect.left + ballRect.width / 2;
                const relativePosition = (ballCenter - paddleCenter) / (paddleRect.width / 2)
                ballSpeedX = relativePosition * 5
                ballSpeedY *= -1.05;
            }

            bricks.forEach(brick => {
                const brickRect = brick.getBoundingClientRect();
                if (
                    ballRect.bottom >= brickRect.top &&
                    ballRect.top < brickRect.bottom &&
                    ballRect.left < brickRect.right &&
                    ballRect.right > brickRect.left &&
                    brick.getAttribute('data-hit') === 'false'
                ) {
                    brick.setAttribute('data-hit', 'true');
                    brick.style.visibility = 'hidden';
                    score.textContent = +score.textContent + 1
                    gameScore++
                    ballSpeedY *= -1;
                }
                if (Array.from(bricks).every(b => b.getAttribute('data-hit') === 'true')) {
                    // currentLevel++;
                    // document.getElementById('level').textContent = currentLevel;
                    gameFinish();
                }
            });

            if (ballY + ballRect.height >= gameAreaRect.height) {
                lives--;
                resetBall();
                livesValue.textContent = lives;
                if (lives <= 0) {
                    gameOver()
                    return;
                }
            }

            ballX += ballSpeedX
            ballY += ballSpeedY

            ball.style.transform = `translate(${ballX}px, ${ballY}px)`
        }
        requestAnimationFrame(moveBall);
    }

    function resetBall() {
        ballX = gameArea.offsetWidth / 2;
        ballY = gameArea.offsetHeight / 2;
        ballSpeedX = (Math.random() * 4 + 2) * (Math.random() < 0.5 ? -1 : 1);
        ballSpeedY = -(Math.random() * 2 + 3);
    }

    movePaddle()
    moveBall();
    timer();
}

function timer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (!isPaused) {
            gameTimer++;
            document.getElementById('timer').textContent = gameTimer + "s";
        }
    }, 1000);
}

function togglePause() {
    isPaused = !isPaused;

    const pauseButton = document.getElementById('pause-button');
    if (isPaused) {
        pauseButton.textContent = 'Resume';
        pauseMenu();
    } else {
        pauseButton.textContent = 'Pause';
        const pauseMenuElement = document.getElementById('pause-menu');
        if (pauseMenuElement) {
            pauseMenuElement.remove();
        }
    }
}

function pauseMenu() {
    const gameArea = document.getElementById('game-area');
    const pauseMenu = document.createElement('div');
    pauseMenu.id = 'pause-menu';

    const pauseTitle = document.createElement('h2');
    pauseTitle.textContent = 'Game Paused';
    pauseMenu.appendChild(pauseTitle);

    const resumeButton = document.createElement('button');
    resumeButton.id = 'resume-button';
    resumeButton.textContent = 'Resume Game';
    resumeButton.addEventListener('click', togglePause);
    const restartButton = document.createElement('button');
    restartButton.id = 'restart-button';
    restartButton.textContent = 'Restart Game';
    restartButton.addEventListener('click', () => {
        location.reload()
    });
    pauseMenu.appendChild(resumeButton);
    pauseMenu.appendChild(restartButton)

    gameArea.appendChild(pauseMenu);
}

function resetGameState() {
    lives = 3;
    score = 0;
    gameTimer = 0;
    isPaused = false;
    updateUI();
}

function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('timer').textContent = '0s'
}


function gameFinish() {
    isPaused = true;
    clearInterval(timerInterval);

    const gameArea = document.getElementById('game-area');

    const finishMessage = document.createElement('div');
    finishMessage.id = 'finish-message';

    const finishTitle = document.createElement('h2');
    finishTitle.textContent = 'Game Completed!';

    const finalScore = document.createElement('p');
    finalScore.textContent = `Final Score: ${gameScore}`;

    const restartButton = document.createElement('button');
    restartButton.id = 'restart-button';
    restartButton.textContent = 'Restart Game';
    restartButton.addEventListener('click', () => {
        finishMessage.remove();
        
        currentLevel++;
        document.getElementById('level').textContent = currentLevel;

        isPaused = false
        
        generateBricks();
        
        resetBall();
        gameStart();
        
        const ball = document.getElementById('ball');
        ball.style.transform = `translate(${ballX}px, ${ballY}px)`;
    });
    finishMessage.appendChild(finishTitle);
    finishMessage.appendChild(finalScore);
    finishMessage.appendChild(restartButton)
    gameArea.appendChild(finishMessage);

}

function gameOver() {
    isPaused = true;
    clearInterval(timerInterval);

    const gameArea = document.getElementById('game-area');

    const gameOverMessage = document.createElement('div');
    gameOverMessage.id = 'game-over';

    const gameOverTitle = document.createElement('h2');
    gameOverTitle.textContent = 'Game Over';
    gameOverMessage.appendChild(gameOverTitle);

    const finalScore = document.createElement('p');
    finalScore.textContent = `Final Score: ${gameScore}`;
    gameOverMessage.appendChild(finalScore);

    const restartButton = document.createElement('button');
    restartButton.id = 'restart-button';
    restartButton.textContent = 'Play Again';
    restartButton.addEventListener('click', () => {
        gameOverMessage.remove();
        resetGameState()
        gameStart()
        generateBricks()
        moveBall()
        movePaddle()
        timer()
    });
    gameOverMessage.appendChild(restartButton);
    gameArea.appendChild(gameOverMessage);
}