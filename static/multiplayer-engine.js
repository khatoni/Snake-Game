function getWsUrl() {
	const domain = window.location.hostname;
	return domain === "localhost" ? `ws://${domain}:3000` : `wss://${domain}`;
}

const socket = new WebSocket(getWsUrl());
// TODO: socket.onopen !!!

const board = document.getElementById("game-board");
const boardSize = 20;
const gameSpeed = 500;

const players = {};

let food = { x: 5, y: 5 };

const gameState = Array.from({ length: 20 }, () => Array(20).fill(0));
let gameInterval;

let myMoveExecuted = true,
	otherMoveExecuted = true;
let myDirection, otherDirection;

let myGuid = "",
	otherGuid = "";

const messagesDiv = document.getElementById("messages");
function setMessage(message) {
	messagesDiv.innerHTML = message;
}

function initialize(initData) {
	setMessage("Game started!");
	players[myGuid] = {
		direction: {},
		snake: [],
	};

	otherGuid = initData.players.filter((guid) => guid !== myGuid)[0];
	players[otherGuid] = {
		direction: {},
		snake: [],
	};
	players[myGuid].direction = initData[myGuid].direction;
	players[otherGuid].direction = initData[otherGuid].direction;
	players[myGuid].snake.push(initData[myGuid].position);
	players[otherGuid].snake.push(initData[otherGuid].position);
	gameState[initData[myGuid].position.x][initData[myGuid].position.y] = 1;
	gameState[initData[otherGuid].position.x][
		initData[otherGuid].position.y
	] = 2;

	handleUserInput();

	gameInterval = setInterval(() => {
		sendMyDirectionEvent();
		moveSnake(gameState);
		if (hasCollision()) {
			endGame();
		}
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
				if (players[myGuid].direction.y === 1) return;
				players[myGuid].direction = { x: 0, y: -1 };
				break;
			case "ArrowDown":
				if (players[myGuid].direction.y === -1) return;
				players[myGuid].direction = { x: 0, y: 1 };
				break;
			case "ArrowLeft":
				if (players[myGuid].direction.x === 1) return;
				players[myGuid].direction = { x: -1, y: 0 };
				break;
			case "ArrowRight":
				if (players[myGuid].direction.x === -1) return;
				players[myGuid].direction = { x: 1, y: 0 };
				break;
		}
	});
}

function sendMyDirectionEvent() {
	const moveEvent = {
		name: "moveSnake",
		player: myGuid,
		direction: players[myGuid].direction,
	};

	if (socket && socket.readyState === WebSocket.OPEN) {
		socket.send(JSON.stringify(moveEvent));
	} else {
		console.warn("socket is not connected or ready:", socket?.readyState);
	}
}

function moveSnake() {
	if (!myMoveExecuted) {
		moveSnakeAction(players[myGuid]);
		myMoveExecuted = true;
	}

	if (!otherMoveExecuted) {
		moveSnakeAction(players[otherGuid]);
		otherMoveExecuted = true;
	}
}

function moveSnakeAction(player) {
	const currentSnakeHead = player.snake[0];
	const newSnakeHead = {
		x: currentSnakeHead.x + player.direction.x,
		y: currentSnakeHead.y + player.direction.y,
	};
	player.snake.unshift(newSnakeHead);
	player === players[myGuid]
		? (gameState[newSnakeHead.x][newSnakeHead.y] = 1)
		: (gameState[newSnakeHead.x][newSnakeHead.y] = 2);
	if (newSnakeHead.x === food.x && newSnakeHead.y === food.y) {
		generateFood(gameState);
	} else {
		const snakeTail = player.snake[player.snake.length - 1];
		gameState[snakeTail.x][snakeTail.y] = 0;
		player.snake.pop();
	}
}

function renderSnake(snake, player) {
	snake.forEach((position, i) => {
		const snakeElement = document.createElement("div");
		snakeElement.style.gridColumn = position.x;
		snakeElement.style.gridRow = position.y;
		snakeElement.classList.add(i === 0 ? `snake${player}-head` : `snake${player}`);
		board.appendChild(snakeElement);
	});
}

function renderFood() {
	const foodElement = document.createElement("div");
	foodElement.style.gridColumn = food.x;
	foodElement.style.gridRow = food.y;
	foodElement.classList.add("food");
	board.appendChild(foodElement);
}

function renderBoard() {
	board.innerHTML = "";
	renderSnake(players[myGuid].snake, 1);
	renderSnake(players[otherGuid].snake, 2);
	renderFood();
}

function hasCollision() {
	const mySnakeHead = players[myGuid].snake[0];
	const otherSnakeHead = players[otherGuid].snake[0];

	if (!isInsideBoard(mySnakeHead) || !isInsideBoard(otherSnakeHead)) {
		return true;
	}

	for (let i = 1; i < players[myGuid].snake.length; i++) {
		if (isSamePosition(mySnakeHead, players[myGuid].snake[i])) {
			return true;
		}
	}

	for (let i = 1; i < players[otherGuid].snake.length; i++) {
		if (isSamePosition(otherSnakeHead, players[otherGuid].snake[i])) {
			return true;
		}
	}

	return false;
}

function isSamePosition(position1, position2) {
	return position1.x === position2.x && position1.y === position2.y;
}

function isInsideBoard(position) {
	return (
		position.x >= 1 &&
		position.x <= boardSize &&
		position.y >= 1 &&
		position.y <= boardSize
	);
}

const eventHandlers = {
	connection: (event) => {
		myGuid = event.guid;
		setMessage(`Your guid: ${event.message}`);
	},
	startGame: (event) => {
		initialize(event.data);
	},
	generateFood: (event) => {
		food = event.food;
	},
	moveSnake: (event) => {
		moveEvent(event);
	},
};

// Listen for messages
socket.addEventListener("message", (event) => {
	event = JSON.parse(event.data);
	const handler = eventHandlers[event.name];
	handler(event);
});

function moveEvent(event) {
	let playerToMove = event.player;
	let direction = event.direction;
	if (playerToMove === myGuid) {
		myMoveExecuted = false;
		players[myGuid].direction = direction;
	} else {
		otherMoveExecuted = false;
		players[otherGuid].direction = direction;
	}

	moveSnake();
}

function generateFood(gameState) {
	const foodEvent = {
		name: "generateFood",
		gameState: gameState,
	};

	socket.send(JSON.stringify(foodEvent));
}

function registerEvents() {
	const searchRandomButton = document.getElementById("search-random");
	searchRandomButton.addEventListener("click", (_) => {
		document.getElementById("join-with-guid").style.display = "none";
		setMessage("Searching for opponent...");
		socket.send(
			JSON.stringify({
				name: "searchRandom",
			})
		);
	});

	const joinWithGuid = document.getElementById("join-with-guid-button");
	joinWithGuid.addEventListener("click", (_) => {
		// TODO: try again later until the socket loads
		const input = document.getElementById("messageInput");
		socket.send(
			JSON.stringify({
				name: "joinMeWith",
				data: input.value,
			})
		);
		input.value = "";
	});
}

registerEvents();
