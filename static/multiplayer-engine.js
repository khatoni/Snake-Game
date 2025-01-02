const board = document.getElementById("game-board");
const boardSize = 20;
const gameSpeed = 500;

var serverSocket;

const snake1 = [];
const snake2 = [];
let food = { x: 5, y: 5 };
var gameState1 = Array.from({ length: 20 }, () => Array(20).fill(0));
var gameState2 = Array.from({ length: 20 }, () => Array(20).fill(0));
let gameInterval;

let direction1 = { x: 1, y: 0 };
let direction2 = { x:-1, y: 0 };

initialize(gameState1, gameState2);

function initialize(gameState1, gameState2) {
	snake1.push({ x : 10, y : 10 });
    snake2.push({ x : 15, y : 10});
	gameState1[10][10] = 1;
    gameState2[15][10] = 1;
	handleUserInput();

	gameInterval = setInterval(() => {
		moveSnake(gameState1, gameState2);
        checkCollision();
		renderBoard();
	}, 1000);
}

function endGame() {
	clearInterval(gameInterval);
}

function handleUserInput() {
	document.addEventListener("keydown", (event) => {
		switch (event.key) {
			case "ArrowUp":
				if(direction1.y === 1) return;
				direction1 = { x: 0, y: -1 };
				break;
			case "ArrowDown":
				if(direction1.y === -1) return;
				direction1 = { x: 0, y: 1 };
				break;
			case "ArrowLeft":
				if(direction1.x === 1) return;
				direction1 = { x: -1, y: 0 };
				break;
			case "ArrowRight":
				if(direction1.x === -1) return;
				direction1 = { x: 1, y: 0 };
				break;
		}

        const moveEvent = {
            name: 'moveSnake',
            direction: direction1
        };

        if (serverSocket && serverSocket.readyState === WebSocket.OPEN) {
            serverSocket.send(JSON.stringify(moveEvent));
            console.log("Move event sent:", moveEvent);
        } else {
            console.warn("serverSocket is not connected or ready:", serverSocket?.readyState);
        }
	});
}

function moveSnake(gameState1, gameState2) {
	const head1 = snake1[0];
	const newHead1 = { x: head1.x + direction1.x, y: head1.y + direction1.y };
	snake1.unshift(newHead1);
	gameState1[newHead1.x][newHead1.y] = 1;
	if(newHead1.x === food.x && newHead1.y === food.y) {
		// Snake ate the food
		food = generateFood(gameState1);
	}
	else {
		const tailElement1 = snake1[snake1.length - 1];
		gameState1[tailElement1.x][tailElement1.y] = 0;
		snake1.pop();
	}
    const head2 = snake2[0];
	const newHead2 = { x: head2.x + direction2.x, y: head2.y + direction2.y };
	snake2.unshift(newHead2);
	gameState2[newHead2.x][newHead2.y] = 1;
	if(newHead2.x === food.x && newHead2.y === food.y) {
		// Snake ate the food
		food = generateFood(gameState2);
	}
	else {
		const tailElement2 = snake2[snake2.length - 1];
		gameState2[tailElement2.x][tailElement2.y] = 0;
		snake2.pop();
	}
}

function renderBoard() {
	board.innerHTML = "";

	snake1.forEach((position, i) => {
		const snakeElement = document.createElement("div");
		snakeElement.style.gridColumn = position.x;
		snakeElement.style.gridRow = position.y;
		snakeElement.classList.add(i === 0 ? "snake1-head" : "snake1");
		board.appendChild(snakeElement);
	});
    snake2.forEach((position, i) => {
		const snakeElement = document.createElement("div");
		snakeElement.style.gridColumn = position.x;
		snakeElement.style.gridRow = position.y;
		snakeElement.classList.add(i === 0 ? "snake2-head" : "snake2");
		board.appendChild(snakeElement);
	});

	const foodElement = document.createElement("div");
	foodElement.style.gridColumn = food.x;
	foodElement.style.gridRow = food.y;
	foodElement.classList.add("food");
	board.appendChild(foodElement);
}

function checkCollision() {
	const head1 = snake1[0];
    const head2 = snake2[0];

	if (!isInsideBoard(head1) || !isInsideBoard(head2)) {
		endGame();
        return;
	}

	for (let i = 1; i < snake1.length; i++) {
		if (head1.x === snake1[i].x && head1.y === snake1[i].y) {
			endGame();
            return;
		}
	}

    for (let i = 1; i < snake2.length; i++) {
		if (head2.x === snake2[i].x && head2.y === snake2[i].y) {
			endGame();
            return;
		}
	}
}

function isInsideBoard(position) {
    return position.x >= 1 && position.x <= boardSize && position.y >= 1 && position.y <= boardSize;
}

window.updateFood = (newFood) => {
    food = newFood;
    console.log('Food updated:', food);
};

window.updateFirstSnakeDirection = (newDirection) => {
    direction1 = newDirection;
    console.log('Direction1 changed', direction1);
}

window.updateSecondSnakeDirection = (newDirection) => {
    direction2 = newDirection;
    console.log('Direction1 changed', direction2);
}

window.updateSocket = (newSocket) => {
    serverSocket = newSocket;
}


// Assumes that gameState is matrix[20][20]
//TODO: Bug
function generateFood(gameState) {
	while(true) {
		let foodX = Math.round(Math.random() * 20);
		let foodY = Math.round(Math.random() * 20);
		if(!gameState[foodX][foodY]) {
			return {x: foodX, y: foodY};
		}
	}
}
