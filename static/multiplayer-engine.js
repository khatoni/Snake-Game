const domain = window.location.hostname;
const wsUrl = `ws://${domain}`;
// Create WebSocket connection
const socket = new WebSocket(wsUrl);
// TODO: socket.onopen !!!

const board = document.getElementById("game-board");
const boardSize = 20;
const gameSpeed = 500;

const players = {};

let food = { x: 5, y: 5 };

var gameState = Array.from({ length: 20 }, () => Array(20).fill(0));
let gameInterval;

var myMoveExecuted = true;
var otherMoveExecuted = true;
let myDirection;
let otherDirection;

let myGuid = "";
let otherGuid = "";

function initialize(initData) {
	players[myGuid] = {
		direction: {},
		snake: [],
   }
   
	otherGuid = initData.players.filter(guid => guid !== myGuid)[0];
	players[otherGuid] = {
		direction: {},
		snake: [],
	};
	players[myGuid].direction = initData[myGuid].direction;
	players[otherGuid].direction = initData[otherGuid].direction;
	players[myGuid].snake.push(initData[myGuid].position);
	players[otherGuid].snake.push(initData[otherGuid].position);
	gameState[initData[myGuid].position.x][initData[myGuid].position.y] = 1;
    gameState[initData[otherGuid].position.x][initData[otherGuid].position.y] = 2;

	handleUserInput();

	gameInterval = setInterval(() => {
		sendMyDirectionEvent();
		moveSnake(gameState);
        if(hasCollision()) {
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
				if(players[myGuid].direction.y === 1) return;
				players[myGuid].direction = { x: 0, y: -1 };
				break;
			case "ArrowDown":
				if(players[myGuid].direction.y === -1) return;
				players[myGuid].direction = { x: 0, y: 1 };
				break;
			case "ArrowLeft":
				if(players[myGuid].direction.x === 1) return;
				players[myGuid].direction = { x: -1, y: 0 };
				break;
			case "ArrowRight":
				if(players[myGuid].direction.x === -1) return;
				players[myGuid].direction = { x: 1, y: 0 };
				break;
		}
	});
}

function sendMyDirectionEvent() {
	const moveEvent = {
		name: 'moveSnake',
		player: myGuid,
		direction: players[myGuid].direction
	};

	if (socket && socket.readyState === WebSocket.OPEN) {
		socket.send(JSON.stringify(moveEvent));
		console.log("Move event sent:", moveEvent);
	} else {
		console.warn("socket is not connected or ready:", socket?.readyState);
	}
}

function moveSnake() {
	if(!myMoveExecuted) {
		moveSnakeAction(players[myGuid]);
		myMoveExecuted = true;
	} 

	if(!otherMoveExecuted) {
		moveSnakeAction(players[otherGuid]);
		otherMoveExecuted = true;
	}
}

function moveSnakeAction(player) {
	const currentSnakeHead = player.snake[0];
	const newSnakeHead = { x: currentSnakeHead.x + player.direction.x, y: currentSnakeHead.y + player.direction.y };
	player.snake.unshift(newSnakeHead);
	player === players[myGuid]? gameState[newSnakeHead.x][newSnakeHead.y] = 1 : gameState[newSnakeHead.x][newSnakeHead.y] = 2;
	if(newSnakeHead.x === food.x && newSnakeHead.y === food.y) {
		generateFood(gameState);
	} else {
		const snakeTail = player.snake[player.snake.length - 1];
		gameState[snakeTail.x][snakeTail.y] = 0;
		player.snake.pop();
	}
}

function renderBoard() {
	board.innerHTML = "";

	players[myGuid].snake.forEach((position, i) => {
		const snakeElement = document.createElement("div");
		snakeElement.style.gridColumn = position.x;
		snakeElement.style.gridRow = position.y;
		snakeElement.classList.add(i === 0 ? "snake1-head" : "snake1");
		board.appendChild(snakeElement);
	});
    players[otherGuid].snake.forEach((position, i) => {
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
    return position.x >= 1 && position.x <= boardSize && position.y >= 1 && position.y <= boardSize;
}

const eventHandlers = {
	"connection": (event) => {
		myGuid = event.guid;
		appendMessage(event.message);
	},
	"startGame": (event) => {
		initialize(event.data);
	},
	"generateFood": (event) => {
		food = event.food;
	},
	"moveSnake": (event) => {
		moveEvent(event);
	}
};

// Listen for messages
socket.addEventListener('message', (event) => {
	event = JSON.parse(event.data);
	const handler = eventHandlers[event.name];
	handler(event);
});

const joinWithGuid = document.getElementById('join-with-guid-button');
joinWithGuid.addEventListener('click', (event) => {
	// TODO: try again later until the socket loads
	const input = document.getElementById('messageInput');
	const message = input.value;
	const customEvent = {
		name: 'joinMeWith',
		data: message
	};
	socket.send(JSON.stringify(customEvent));
	input.value = '';
})

// Send message function
function sendMessage() {
	const input = document.getElementById('messageInput');
	const message = input.value;
	socket.send(message);
	input.value = '';
}

// Append message to div
function appendMessage(message) {
	const messagesDiv = document.getElementById('messages');
	messagesDiv.innerHTML += `<div>${message}</div>`;
}

function moveEvent(event) {
	let playerToMove = event.player;
	let direction = event.direction;
	if(playerToMove === myGuid) {
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
		name: 'generateFood',
		gameState: gameState,
	};

	socket.send(JSON.stringify(foodEvent));
}
