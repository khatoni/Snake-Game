const board = document.getElementById("game-board");
const boardSize = 21;
const gameSpeed = 400;

const snake = [];
let food = { x: 5, y: 5 };
let gameState = Array.from({ length: 22 }, () => Array(22).fill(0));
let gameInterval;

// []{x, y}
// brick code => 50
const bricks = [];

let direction = { x: 1, y: 0 };

initialize();

function isNearStart(x, y) {
	return 8 <= x && x <= 12 && 8 <= y && y <= 12
}

function generateBricks() {
	bricks.push({ x: 1, y: 2})
	gameState[1][2] = 50;
	for(let i = 0; i < 5; i++) {
		while(true) {
			const x = (Math.round(Math.random() * 20)) % 20 + 1;
			const y = (Math.round(Math.random() * 20)) % 20 + 1;
			if(gameState[x][y] == 0 && !isNearStart(x, y)) {
				gameState[x][y] = 50;
				bricks.push({ x, y });
				break;
			}
		}
	}
}

function initialize() {
	snake.push({ x: 10, y: 10 });
	gameState[10][10] = 1;
	gameState[food.x][food.y] = 49;
	handleUserInput();
	const select = document.getElementById("speed-select");
	select.addEventListener("change", (event) => {
		const selectedSpeed = event.target.value;
		changeSpeed(selectedSpeed);
	});
	generateBricks();

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

	bricks.forEach((brick) => {
		const brickElement = document.createElement("div");
		brickElement.style.gridColumn = brick.x;
		brickElement.style.gridRow = brick.y;
		brickElement.classList.add("brick");
		board.appendChild(brickElement);
	})
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

	for(let i = 0; i < bricks.length; i++) {
		if(head.x === bricks[i].x && head.y === bricks[i].y) {
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

// input new food x, new food y
function bricksAroundFood(x, y) {
	let brickSidesCount = 0;
	if(x - 1 <= 0 || gameState[x - 1][y] == 50) {
		brickSidesCount++;
	}
	if(x + 1 > 20 || gameState[x + 1][y] == 50) {
		brickSidesCount++;
	}
	if(y + 1 > 20 || gameState[x][y + 1] == 50) {
		brickSidesCount++;
	}
	if(y - 1 <= 0 || gameState[x][y - 1] == 50) {
		brickSidesCount++;
	}
	return brickSidesCount;
}

function generateFood(gameState) {
	while (true) {
		let foodX = (Math.round(Math.random() * 20)) % 20 + 1;
		let foodY = (Math.round(Math.random() * 20)) % 20 + 1;
		//foodX = 1; foodY = 1;
		if (!gameState[foodX][foodY] && bricksAroundFood(foodX, foodY) <= 2) {
			gameState[foodX][foodY] = 49;
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
