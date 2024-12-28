const board = document.getElementById("game-board");
const boardSize = 20;
const gameSpeed = 500;

const snake = [];
const food = { x: 5, y: 5 };

let gameInterval;

let direction = { x: 1, y: 0 };

initialize();

function initialize() {
	snake.push({ x: 10, y: 10 });

	handleUserInput();

	gameInterval = setInterval(() => {
		moveSnake();
        checkCollision();
		renderBoard();
	}, 200);
}

function endGame() {
	clearInterval(gameInterval);
}

function handleUserInput() {
	document.addEventListener("keydown", (event) => {
		switch (event.key) {
			case "ArrowUp":
				if(direction.y === 1) return;
				direction = { x: 0, y: -1 };
				break;
			case "ArrowDown":
				if(direction.y === -1) return;
				direction = { x: 0, y: 1 };
				break;
			case "ArrowLeft":
				if(direction.x === 1) return;
				direction = { x: -1, y: 0 };
				break;
			case "ArrowRight":
				if(direction.x === -1) return;
				direction = { x: 1, y: 0 };
				break;
		}
	});
}

function moveSnake() {
	const head = snake[0];
	const newHead = { x: head.x + direction.x, y: head.y + direction.y };

	snake.unshift(newHead);
	if(newHead.x === food.x && newHead.y === food.y) {
		// Snake ate the food
	}
	else {
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
    return position.x >= 1 && position.x <= boardSize && position.y >= 1 && position.y <= boardSize;
}