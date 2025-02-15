function getWsUrl() {
	const domain = window.location.hostname;
	return domain === "localhost" ? `ws://${domain}:3000` : `wss://${domain}`;
}

const socket = new WebSocket(getWsUrl());
// TODO: socket.onopen !!!

const board = document.getElementById("game-board");
const boardSize = 20;

const data = {};

let food;

let myGuid = "",
	otherGuid = "";

const messagesDiv = document.getElementById("messages");
function setMessage(message) {
	messagesDiv.innerHTML = message;
}

function initialize(initData) {
	setMessage("Game started!");
	Object.assign(data, initData);
	otherGuid = data.guids.find((guid) => guid !== myGuid);
	food = data.food;
	renderBoard();

	handleUserInput();
}

function handleUserInput() {
	document.addEventListener("keydown", (event) => {
		switch (event.key) {
			case "ArrowUp":
				if (data[myGuid].direction.y === 1 || data[myGuid].direction.y === -1) return;
				sendMyDirectionEvent({ x: 0, y: -1 });
				break;
			case "ArrowDown":
				if (data[myGuid].direction.y === -1 || data[myGuid].direction.y === 1) return;
				sendMyDirectionEvent({ x: 0, y: 1 });
				break;
			case "ArrowLeft":
				if (data[myGuid].direction.x === 1 || data[myGuid].direction.x === -1) return;
				sendMyDirectionEvent({ x: -1, y: 0 });
				break;
			case "ArrowRight":
				if (data[myGuid].direction.x === -1 || data[myGuid].direction.x === 1) return;
				sendMyDirectionEvent({ x: 1, y: 0 });
				break;
		}
	});
}

function sendMyDirectionEvent(direction) {
	// TODO: debounce 200ms
	const moveEvent = {
		name: "moveSnake",
		player: myGuid,
		direction: direction,
	};

	if (socket && socket.readyState === WebSocket.OPEN) {
		socket.send(JSON.stringify(moveEvent));
	} else {
		console.warn("socket is not connected or ready:", socket?.readyState);
	}
}

function updateBoard() {
	moveSnakeAction(data[myGuid]);
	moveSnakeAction(data[otherGuid]);
	// TODO: check for food
	// TODO: check who grows
}

function moveSnakeAction(player) {
	const currentSnakeHead = player.snake[0];
	const newSnakeHead = {
		x: currentSnakeHead.x + player.direction.x,
		y: currentSnakeHead.y + player.direction.y,
	};
	player.snake.unshift(newSnakeHead);
	if (newSnakeHead.x === food.x && newSnakeHead.y === food.y) {

	} else {
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
	renderSnake(data[myGuid].snake, 1);
	renderSnake(data[otherGuid].snake, 2);
	renderFood();
}

const eventHandlers = {
	connection: (event) => {
		myGuid = event.guid;
		setMessage(`Your guid: ${event.message}`);
	},
	startGame: (event) => {
		initialize(event.data);
	},
	update: (event) => {
		moveEvent(event);
	},
	endGame: (event) => {
		const winnerGuid = event.winnerGuid;
		finish(winnerGuid);
	}
};

// Listen for messages
socket.addEventListener("message", (event) => {
	event = JSON.parse(event.data);
	const handler = eventHandlers[event.name];
	handler(event);
});

function moveEvent(event) {
	// TODO: handle who grows
	data[myGuid].direction = event.data[myGuid];
	data[otherGuid].direction = event.data[otherGuid];
	updateBoard();
	food = event.data.newFoodPosition;
	
	renderBoard();
}

function registerEvents() {
	const searchRandomButton = document.getElementById("search-random");
	searchRandomButton.addEventListener("click", (_) => {
		const banners = document.querySelectorAll('.banner');
    	banners.forEach((element) => {
        	element.remove();
    	});
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

function finish(winnerGuid) {
	if(winnerGuid === null) {
		showBanner("GAME OVER", "DRAW");
	}
	if(winnerGuid == myGuid) {
		showBanner("Congratulations", "You are the winner");
	} else {
		showBanner("Unfortunately", "You lost the game");
	}
}

function showBanner(title, message) {
	const banner = document.createElement('div');
	banner.classList.add('banner');
	const bannerTitle = document.createElement('h1');
	bannerTitle.textContent = title;
	const text = document.createElement('p');
	text.textContent = message;
	text.style.fontSize = '18px';

	banner.appendChild(bannerTitle);
	banner.appendChild(text);

	banner.style.display = 'flex';
	banner.style.flexDirection = 'column';
	banner.style.alignItems = 'center';

	document.body.prepend(banner);
}

registerEvents();
