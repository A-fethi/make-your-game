let lives = 3;
let gameScore = 0;
let gameTimer = 0;
let timerInterval;
let isPaused = false;
let isRespawn = false;
let isGameOver = false;
let moveLeft = false;
let moveRight = false;
let currentLevel = 1;
let levelCompletedFlag = false;

const tileMaps = [
    {
        columns: 5,
        rows: 2,
        size: 50,
        tiles: [
            1, 3, 4, 0, 2,
            1, 2, 0, 3, 4,
        ]
    },
    {
        columns: 6,
        rows: 3,
        size: 50,
        tiles: [
            1, 0, 4, 2, 3, 3,
            4, 2, 0, 3, 2, 0,
            1, 0, 2, 4, 1, 3,
        ]
    },
    {
        columns: 7,
        rows: 4,
        size: 50,
        tiles: [
            3, 3, 3, 3, 3, 3, 3,
            2, 0, 2, 2, 2, 0, 2,
            1, 0, 1, 0, 1, 0, 1,
            4, 4, 4, 4, 4, 4, 4,
        ]
    }
];

function getTile(map, col, row) {
    return map.tiles[row * map.columns + col] || 0;
}

const getColor = () => {
    let value = "#"
    const hex = "0123456789ABCDEF"
    for (let i = 0; i < 6; i++) {
        value += hex[Math.floor(Math.random(i) * hex.length)]
    }
    return value
}

document.addEventListener('DOMContentLoaded', () => {
    const startMenu = document.getElementById('start-menu');
    const startButton = document.getElementById('start-button');

    startButton.addEventListener('click', () => {
        createGameUI();
        document.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') moveLeft = true;
            if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') moveRight = true;
        });

        document.addEventListener('keyup', (event) => {
            if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') moveLeft = false;
            if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') moveRight = false;
            if (event.key === ' ' && !isGameOver) togglePause();
            if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') {
                if (isRespawn) {
                    isRespawn = false
                }
            };
        });
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

    livesImage.src = './src/heart.png';
    livesImage.id = 'lives-img'
    livesImage.style.width = '20px'
    livesImage.style.height = '20px'

    const livesValue = document.createElement('span');
    livesValue.id = 'lives';
    livesValue.textContent = lives;

    livesSpan.appendChild(livesImage);
    livesSpan.appendChild(livesValue)

    const scoreSpan = document.createElement('span')
    scoreSpan.innerHTML = 'Score: <span id="score">0</span>'
    const timerSpan = document.createElement('span');
    timerSpan.innerHTML = 'Time: <span id="timer">0s</span>';
    const levelSpan = document.createElement('span');
    levelSpan.innerHTML = `Level: <span id="level">1</span>`;
    levelSpan.id = 'level-span'

    const pauseButton = document.createElement('button');
    pauseButton.id = 'pause-button';
    pauseButton.textContent = 'Pause';
    pauseButton.addEventListener('click', togglePause);

    gameInfo.appendChild(livesSpan);
    gameInfo.appendChild(scoreSpan);
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

function generateBricks(mapIndex = 0) {
    const brickArea = document.getElementById('bricks');
    brickArea.innerHTML = '';

    const map = tileMaps[mapIndex]
    const colors = ['red', 'orange', 'yellow', 'green', 'blue'];

    brickArea.style.gridTemplateColumns = `repeat(${map.columns}, 1fr)`;

    for (let row = 0; row < map.rows; row++) {
        for (let col = 0; col < map.columns; col++) {
            const tileValue = getTile(map, col, row)
            const brick = document.createElement('div');
            brick.classList.add('brick');
            brick.style.backgroundColor = colors[tileValue];
            brick.setAttribute('data-hit', 'false');
            if (currentLevel > 1 && Math.random() < 0.2) {
                brick.dataset.hits = 2
                brick.style.backgroundColor = '#795548'
            }
            brickArea.appendChild(brick);
        }
    }
}

window.addEventListener('resize', () => {
    location.reload();
});

let ballX
let ballY
let ballSpeedX
let ballSpeedY

function gameStart() {
    const gameArea = document.getElementById('game-area');
    const paddle = document.getElementById('paddle');
    const ball = document.getElementById('ball');
    const livesValue = document.getElementById('lives');

    const paddleSpeed = 10;

    function movePaddle() {
        if (!isPaused && !isRespawn && !isGameOver) {
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

    movePaddle();

    resetBall()
    function moveBall() {
        if (!isPaused && !isRespawn && !isGameOver) {
            const ballRect = ball.getBoundingClientRect();
            const gameAreaRect = gameArea.getBoundingClientRect();
            const paddleRect = paddle.getBoundingClientRect();
            const score = document.getElementById('score')
            const bricks = document.querySelectorAll('.brick');

            if (ballX <= 0 || ballX + ballRect.width / 2 + 15 >= gameAreaRect.width) {
                ballSpeedX *= -1;
                ballX = Math.max(0, Math.min(gameAreaRect.width - ballRect.width, ballX));
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

            let collision = 0
            bricks.forEach(brick => {
                const brickRect = brick.getBoundingClientRect();
                if (
                    ballRect.bottom >= brickRect.top &&
                    ballRect.top < brickRect.bottom &&
                    ballRect.left < brickRect.right &&
                    ballRect.right > brickRect.left &&
                    brick.getAttribute('data-hit') === 'false' && collision === 0
                ) {
                    if (brick.dataset.hits && parseInt(brick.dataset.hits) > 0) {
                        let hitsLeft = parseInt(brick.dataset.hits) - 1
                        brick.dataset.hits = hitsLeft

                        if (hitsLeft > 0) {
                            brick.style.backgroundColor = '#b71c1c'
                        } else {
                            brick.setAttribute('data-hit', 'true')
                            brick.style.visibility = 'hidden'
                        }
                    } else {
                        brick.setAttribute('data-hit', 'true');
                        brick.style.visibility = 'hidden';
                    }
                    gameScore += 5
                    score.textContent = gameScore
                    ballSpeedY *= -1;
                    collision++
                }
                if (!levelCompletedFlag && Array.from(bricks).every(b => b.getAttribute('data-hit') === 'true')) {
                    levelCompletedFlag = true
                    if (currentLevel < 3) {
                        levelCompleted();
                    } else {
                        gameFinish()
                    }
                }
            });

            if (ballY + ballRect.height >= gameAreaRect.height) {
                lives--;
                resetBall();
                livesValue.textContent = lives;
                if (lives <= 0) {
                    isGameOver = true;
                    gameOver()
                    return;
                } else {
                    isRespawn = true;
                    resetBall()
                }
            }

            ballX += ballSpeedX
            ballY += ballSpeedY

            ball.style.transform = `translate(${ballX}px, ${ballY}px)`
        }
        requestAnimationFrame(moveBall);
    }

    moveBall();
    timer();
}

function resetBall() {
    const ball = document.getElementById('ball');
    const gameArea = document.getElementById('game-area');

    ballX = gameArea.offsetWidth / 2;
    ballY = gameArea.offsetHeight / 2;
    ballSpeedX = (Math.random() * 4 + 2) * (Math.random() < 0.5 ? -1 : 1);
    ballSpeedY = -(Math.random() * 2 + 3);

    ball.style.transform = `translate(${ballX}px, ${ballY}px)`;
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
    currentLevel = 1;
    isPaused = false;
    updateUI();
}

function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('timer').textContent = '0s';
}

function showLevelMessage() {
    const gameArea = document.getElementById('game-area');

    const levelMessage = document.createElement('div');
    levelMessage.id = 'level-message';

    const levelTitle = document.createElement('h2');
    levelTitle.textContent = `Level ${currentLevel}`;
    levelMessage.appendChild(levelTitle);

    gameArea.appendChild(levelMessage);
    isPaused = true;

    setTimeout(() => {
        levelMessage.remove();
        isPaused = false;
    }, 2000);
}

function levelCompleted() {
    isPaused = true;

    const gameArea = document.getElementById('game-area');

    const levelDone = document.createElement('div');
    levelDone.id = 'level-completed';

    const levelTitle = document.createElement('h2');
    levelTitle.textContent = `Level ${currentLevel} Completed!`;
    levelDone.appendChild(levelTitle);

    const nextLevelButton = document.createElement('button');
    nextLevelButton.textContent = 'Next Level';
    levelDone.appendChild(nextLevelButton);
    gameArea.appendChild(levelDone);

    nextLevelButton.addEventListener('click', () => {
        levelCompletedFlag = false;
        currentLevel++;
        levelDone.remove();
        isPaused = false;
        gameArea.style.backgroundColor = getColor()
        generateBricks(currentLevel-1);
        resetBall();
        showLevelMessage();
        document.getElementById('level-span').textContent = `Level: ${currentLevel}`;
    });
}

function gameFinish() {
    isPaused = true;
    clearInterval(timerInterval);

    const gameArea = document.getElementById('game-area');

    const finishMessage = document.createElement('div');
    finishMessage.id = 'finish-message';

    const cong = document.createElement('h1')
    cong.textContent = 'Congratulations, WOHOOOOO'
    const finishTitle = document.createElement('h2');
    finishTitle.textContent = 'Game Completed!';
    const finalScore = document.createElement('p');
    finalScore.textContent = `Final Score: ${gameScore}`;

    const restartButton = document.createElement('button');
    restartButton.id = 'restart-button';
    restartButton.textContent = 'Restart Game';
    restartButton.addEventListener('click', () => {
        location.reload()
    });

    finishMessage.appendChild(cong);
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
        const gameContainer = document.getElementById('game-container')
        gameContainer.remove()
        isGameOver = false;
        timer()
        createGameUI()
        resetGameState()
        gameStart()
    });
    gameOverMessage.appendChild(restartButton);
    gameArea.appendChild(gameOverMessage);
}