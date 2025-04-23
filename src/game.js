let lives = 3;
let gameScore = 0;
let gameTimer = 0;
let timerInterval;
let isPaused = false;
let isRespawn = false;
let isGameOver = false;
let moveLeft = false;
let moveRight = false;
let paddleSpeed = 10;
let currentLevel = 1;
let levelCompletedFlag = false;
let paddleX = 0;

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
    },
    {
        columns: 8,
        rows: 5,
        size: 50,
        tiles: [
            4, 3, 2, 1, 1, 2, 3, 4,
            3, 0, 0, 2, 2, 0, 0, 3,
            2, 0, 1, 3, 3, 1, 0, 2,
            1, 2, 3, 4, 4, 3, 2, 1,
            0, 0, 1, 2, 2, 1, 0, 0,
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

const story = [
    {
        level: 1,
        intro: "Welcome to Heavens Prison! Your mission is to break all the bricks and escape the prison.",
        outro: "Great job! You've completed the first level. Onward to the next challenge! will u survive? or will u be forever trapped in the prison?",
        fail: "You've failed to escape the prison. The Guards heard the noise and caught you. Try again!"
    },
    {
        level: 2,
        intro: "Level 2: This is getting harder. Can you handle the pressure?",
        outro: "Impressive! You're really getting the hang of this. Let's keep going!",
        fail: "You've failed to escape the prison, the building is shaking, the guards are getting closer. Try again!"
    },
    {
        level: 3,
        intro: "Level 3: The bricks are getting stronger. Can you break them all?",
        outro: "You did it! You've broken through all the bricks. You're almost there!",
        fail: "You've failed to escape the prison, the building is shaking, u can hear the guards footsteps. Try again!"
    },
    {
        level: 4,
        intro: "Level 4: The final level. Can you break the bricks and escape the prison?",
        outro: "Congratulations! You've broken all the bricks and escaped the prison. You're free!",
        fail: "You've failed to escape the prison, the Prison is collapsing, the guards are getting closer. Try again!"
    }
];

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
        showLevelMessage();
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

    livesImage.src = '/src/heart.png'
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
    levelSpan.id = 'level-span'

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
    generateBricks(currentLevel - 1);
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

let lastTime = 0;

function gameStart() {
    const gameArea = document.getElementById('game-area');
    const paddle = document.getElementById('paddle');
    const ball = document.getElementById('ball');
    const livesValue = document.getElementById('lives');

    paddleSpeed = 10;

    function movePaddle() {
        if (!isPaused && !isRespawn && !isGameOver) {
            const gameAreaRect = gameArea.getBoundingClientRect();
            const paddleWidth = paddle.offsetWidth;
            
            if (moveLeft) {
                paddleX -= paddleSpeed;
            }
            if (moveRight) {
                paddleX += paddleSpeed;
            }
            
            paddleX = Math.max(0, Math.min(gameAreaRect.width - paddleWidth, paddleX));
            paddle.style.transform = `translateX(${paddleX}px)`;
        }
        requestAnimationFrame(movePaddle);
    }

    resetBall();

    function moveBall(timestamp) {
        if (!lastTime) lastTime = timestamp;
        const deltaTime = (timestamp - lastTime) / 1000;
        lastTime = timestamp;

        if (!isPaused && !isRespawn && !isGameOver) {
            const ballRect = ball.getBoundingClientRect();
            const gameAreaRect = gameArea.getBoundingClientRect();
            const paddleRect = paddle.getBoundingClientRect();
            const score = document.getElementById('score');
            const bricks = document.querySelectorAll('.brick');

            if (ballX <= 0 || ballX + ballRect.width / 2 + 15 >= gameAreaRect.width) {
                ballSpeedX *= -1;
                ballX = Math.max(0, Math.min(gameAreaRect.width - ballRect.width, ballX));
            }

            if (ballY <= 0) {
                ballSpeedY *= -1;
                ballY = Math.max(0, ballY);
            }

            if (
                ballRect.bottom >= paddleRect.top &&
                ballRect.top < paddleRect.bottom &&
                ballRect.left < paddleRect.right &&
                ballRect.right > paddleRect.left
            ) {
                const paddleCenter = paddleRect.left + paddleRect.width / 2;
                const ballCenter = ballRect.left + ballRect.width / 2;
                const relativePosition = (ballCenter - paddleCenter) / (paddleRect.width / 2);
                ballSpeedX = relativePosition * 3;
                ballSpeedY *= -1.01;
            }

            let collision = 0;
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
                    levelCompletedFlag = true;
                    levelCompleted();
                }
            });

            if (ballY + ballRect.height >= gameAreaRect.height) {
                lives--;
                resetBall();
                livesValue.textContent = lives;
                if (lives <= 0) {
                    isGameOver = true;
                    gameOver();
                    return;
                } else {
                    isRespawn = true;
                    newLeft = gameAreaRect.width / 2 - ballRect.width;
                    newTop = gameAreaRect.height / 2 - ballRect.height;
                }
            }

            ballX += ballSpeedX * deltaTime * 60;
            ballY += ballSpeedY * deltaTime * 60;

            ball.style.transform = `translate(${ballX}px, ${ballY}px)`;
        }
        requestAnimationFrame(moveBall);
    }

    movePaddle();
    requestAnimationFrame(moveBall);
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
function resetBall() {
    const ball = document.getElementById('ball');
    const gameArea = document.getElementById('game-area');
    const paddle = document.getElementById('paddle');

    const paddleWidth = paddle.offsetWidth;
    const gameAreaWidth = gameArea.offsetWidth;
    
    paddleX = (gameAreaWidth - paddleWidth) / 2;
    paddle.style.transform = `translateX(${paddleX}px)`;

    const paddleRect = paddle.getBoundingClientRect();
    const gameAreaRect = gameArea.getBoundingClientRect();

    ballX = paddleRect.left + (paddleRect.width / 2) - (ball.offsetWidth / 2) - gameAreaRect.left;
    ballY = paddleRect.top - ball.offsetHeight - 5 - gameAreaRect.top;

    const baseSpeed = 3 + (currentLevel * 0.5);
    ballSpeedX = (Math.random() * 2 + 1) * (Math.random() < 0.5 ? -1 : 1);
    ballSpeedY = -baseSpeed;

    ball.style.transform = `translate(${ballX}px, ${ballY}px)`;
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
    gameScore = 0;
    gameTimer = 0;
    isPaused = false;
    currentLevel = 1;
    levelCompletedFlag = false;
    isGameOver = false;
    paddleSpeed = 10
    updateUI();
}

function updateUI() {
    document.getElementById('score').textContent = gameScore;
    document.getElementById('lives').textContent = lives;
    document.getElementById('timer').textContent = '0s';
    document.getElementById('level').textContent = currentLevel;
}

function showLevelMessage() {
    const gameArea = document.getElementById('game-area');

    const levelMessage = document.createElement('div');
    levelMessage.id = 'level-message';

    const levelTitle = document.createElement('h2');
    levelTitle.textContent = `Level ${currentLevel}`;
    levelMessage.appendChild(levelTitle);

    const storyText = document.createElement('p');
    storyText.textContent = story[currentLevel - 1].intro;
    levelMessage.appendChild(storyText);

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

    const storyText = document.createElement('p');
    storyText.textContent = story[currentLevel - 1].outro;
    levelDone.appendChild(storyText);

    const nextLevelButton = document.createElement('button');
    nextLevelButton.textContent = 'Next Level';
    levelDone.appendChild(nextLevelButton);
    gameArea.appendChild(levelDone);
    nextLevelButton.addEventListener('click', () => {
        if (currentLevel >= story.length) {
            gameFinish();
        } else {
            levelCompletedFlag = false;
            currentLevel++;
            document.getElementById('level').textContent = currentLevel;
            levelDone.remove();
            isPaused = false;
            gameArea.style.backgroundColor = getColor()
            generateBricks(currentLevel - 1);
            resetBall();
            showLevelMessage();
        }
    });
}


function gameFinish() {
    isPaused = true;
    clearInterval(timerInterval);

    const gameArea = document.getElementById('game-area');

    const finishMessage = document.createElement('div');
    finishMessage.id = 'finish-message';

    const finishTitle = document.createElement('h2');
    finishTitle.textContent = 'Game Completed!';

    const storyText = document.createElement('p');
    storyText.textContent = "Congratulations! You've completed the game. Thanks for playing!";
    finishMessage.appendChild(storyText);

    const restartButton = document.createElement('button');
    restartButton.id = 'restart-button';
    restartButton.textContent = 'Restart Game';
    restartButton.addEventListener('click', () => {
        location.reload()
    });

    finishMessage.appendChild(finishTitle);
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
    gameOverTitle.textContent = 'Game Over\n'
    const storyText = document.createElement('p');
    storyText.textContent = story[currentLevel - 1].fail;
    gameOverMessage.appendChild(storyText);
    gameOverMessage.appendChild(gameOverTitle);

    const finalScore = document.createElement('p');
    finalScore.textContent = `Final Score: ${gameScore}`;
    gameOverMessage.appendChild(finalScore);

    const restartButton = document.createElement('button');
    restartButton.id = 'restart-button';
    restartButton.textContent = 'Play Again';
    restartButton.addEventListener('click', () => {
        gameOverMessage.remove();
        resetGameState();
        generateBricks(0);
        showLevelMessage();
        gameStart();
    });
    gameOverMessage.appendChild(restartButton);
    gameArea.appendChild(gameOverMessage);
}