const board = document.getElementsByClassName("game-board");
const boardSize = 20;
const gameSpeed = 500;

const snake = [];
let gameInterval;

let direction = { x: 1, y: 0 };

function initialize() {
	snakePositions.push({ x: 10, y: 10 });

	handleUserInput();

	gameInterval = setInterval(() => {
		moveSnake();
		renderSnake();
	}, 500);
}

function endGame() {
	clearInterval(gameInterval);
}

function handleUserInput() {
	document.addEventListener("keydown", (event) => {
		switch (event.key) {
			case "ArrowUp":
				direction = { x: 0, y: -1 };
				break;
			case "ArrowDown":
				direction = { x: 0, y: 1 };
				break;
			case "ArrowLeft":
				direction = { x: -1, y: 0 };
				break;
			case "ArrowRight":
				direction = { x: 1, y: 0 };
				break;
		}
	});
}

function moveSnake() {
	const head = snakePositions[0];
	const newHead = { x: head.x + direction.x, y: head.y + direction.y };

	snakePositions.unshift(newHead);
	snakePositions.pop();
}

function renderSnake() {
	board.innerHTML = "";

	snakePositions.forEach((position) => {
		const snakeElement = document.createElement("div");
		snakeElement.style.gridColumnStart = position.x;
		snakeElement.style.gridRowStart = position.y;
		snakeElement.classList.add("snake");
		board.appendChild(snakeElement);
	});
}

function checkCollision() {
	const head = snake[0];

	if (!isInsideBoard(head)) {
		endGame();
        return;
	}

	for (let i = 1; i < snake.length; i++) {
		if (head.x === snake[i].x && head.y === snake[i].y) {
			endGame();
            return;
		}
	}
}

function isInsideBoard(position) {
    return position.x >= 1 && position.x <= boardSize && position.y >= 1 && position.y <= boardSize;
}