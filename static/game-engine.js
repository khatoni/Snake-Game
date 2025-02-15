const board = document.getElementById("game-board");
const boardSize = 21;
const gameSpeed = 400;

const snake = [];
let food = { x: 5, y: 5 };
let gameState = Array.from({ length: 22 }, () => Array(22).fill(0));
let gameInterval;

let direction = { x: 1, y: 0 };

initialize();

function initialize() {
	snake.push({ x: 10, y: 10 });
	gameState[10][10] = 1;
	handleUserInput();
	const select = document.getElementById("speed-select");
	select.addEventListener("change", (event) => {
		const selectedSpeed = event.target.value;
		changeSpeed(selectedSpeed);
	});

	gameInterval = setInterval(() => {
		moveSnake();
		checkCollision();
		renderBoard();
	}, gameSpeed);
}

function endGame() {
	clearInterval(gameInterval);
	showBanner("GAME OVER");
}

function handleUserInput() {
	document.addEventListener("keydown", (event) => {
		switch (event.key) {
			case "ArrowUp":
				if (direction.y === 1) return;
				direction = { x: 0, y: -1 };
				break;
			case "ArrowDown":
				if (direction.y === -1) return;
				direction = { x: 0, y: 1 };
				break;
			case "ArrowLeft":
				if (direction.x === 1) return;
				direction = { x: -1, y: 0 };
				break;
			case "ArrowRight":
				if (direction.x === -1) return;
				direction = { x: 1, y: 0 };
				break;
		}
	});
}

function moveSnake() {
	const head = snake[0];
	const newHead = { x: head.x + direction.x, y: head.y + direction.y };
	snake.unshift(newHead);
	gameState[newHead.x][newHead.y] = 1;
	if (newHead.x === food.x && newHead.y === food.y) {
		// Snake ate the food
		food = generateFood(gameState);
	} else {
		const tailElement = snake[snake.length - 1];
		gameState[tailElement.x][tailElement.y] = 0;
		snake.pop();
	}
}

function renderBoard() {
	board.innerHTML = "";

	snake.forEach((position, i) => {
		const snakeElement = document.createElement("div");
		snakeElement.style.gridColumn = position.x;
		snakeElement.style.gridRow = position.y;
		snakeElement.classList.add(i === 0 ? "snake-head" : "snake");
		board.appendChild(snakeElement);
	});

	const foodElement = document.createElement("div");
	foodElement.style.gridColumn = food.x;
	foodElement.style.gridRow = food.y;
	foodElement.classList.add("food");
	board.appendChild(foodElement);
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
	return (
		position.x >= 1 &&
		position.x < boardSize &&
		position.y >= 1 &&
		position.y < boardSize
	);
}

function generateFood(gameState) {
	while (true) {
		let foodX = Math.round(Math.random() * 20) + 1;
		let foodY = Math.round(Math.random() * 20) + 1;
		if (!gameState[foodX][foodY]) {
			return { x: foodX, y: foodY };
		}
	}
}

function changeSpeed(newSpeed) {
	clearInterval(gameInterval);
	gameInterval = setInterval(() => {
		moveSnake();
		checkCollision();
		renderBoard();
	}, newSpeed);
}

function showBanner(message) {
	const banner = document.getElementById("info-banner");
	banner.innerText = message;
}
