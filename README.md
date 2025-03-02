# Arkanoid Game

This is a simple implementation of the classic Arkanoid game using plain JavaScript, HTML, and CSS. The game runs at 60 FPS and does not use any frameworks or canvas.

## Project Structure

- **index.html**: Main HTML file that sets up the game environment and includes references to JavaScript and CSS files.
- **src/game.js**: Contains the game logic, including the game state, ball, paddle, and bricks.
- **src/styles/styles.css**: CSS styles for the game, including styles for the game area, paddle, ball, and bricks.
- **src/heart.png**: Image used to represent lives in the game.

## Features

- Playable Arkanoid game with a paddle, ball, and bricks.
- Score display and lives remaining.
- Pause menu with options to continue or restart the game.
- Smooth gameplay at 60 FPS.

## Game Mechanics
- **{{SOON}}**

### Controls

- **Left Arrow / 'A' Key**: Move the paddle to the left.
- **Right Arrow / 'D' Key**: Move the paddle to the right.
- **Space Bar**: Pause or resume the game.
- **Up Arrow / 'W' Key**: Respawn the ball after losing a life.

### Game Elements

- **Paddle**: Controlled by the player to bounce the ball.
- **Ball**: Moves around the game area, bouncing off walls, the paddle, and bricks.
- **Bricks**: Arranged in rows at the top of the game area. The ball breaks the bricks upon collision.
- **Lives**: Represented by heart icons. The player starts with 3 lives.
- **Score**: Increases by 5 points for each brick broken.
- **Timer**: Tracks the duration of the game.

### Game States

- **Start Menu**: Initial screen with a "Start Game" button.
- **Game Running**: Main gameplay state.
- **Paused**: Game is paused, and a pause menu is displayed.
- **Game Over**: Displayed when the player loses all lives.
- **Game Completed**: Displayed when all bricks are broken.

## How to Run the Game

1. Clone the repository or download the project files.
2. Open `index.html` in a web browser.
3. Use the left and right arrow keys to control the paddle.
4. Enjoy the game!

## Future Improvements

- Add sound effects and music.
- Implement different levels with increasing difficulty.
- Add power-ups for the player.

Feel free to contribute to the project or suggest improvements!

## License

This project is licensed under the MIT License.