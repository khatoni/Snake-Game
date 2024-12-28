const board = document.getElementById("game-board");
const boardSize = 20;
const gameSpeed = 500;

const snake = [];
let gameInterval;

let direction = { x: 1, y: 0 };

initialize();

function initialize() {
	snake.push({ x: 10, y: 10 });

	handleUserInput();

	gameInterval = setInterval(() => {
		moveSnake();
        checkCollision();
		renderSnake();
	}, 100);
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
	const head = snake[0];
	const newHead = { x: head.x + direction.x, y: head.y + direction.y };

	snake.unshift(newHead);
	snake.pop();
}

function renderSnake() {
	board.innerHTML = "";

	snake.forEach((position) => {
		const snakeElement = document.createElement("div");
		snakeElement.style.gridColumn = position.x;
		snakeElement.style.gridRow = position.y;
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