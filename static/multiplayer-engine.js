function getWsUrl() {
	const domain = window.location.hostname;
	return domain === "localhost" ? `ws://${domain}:3000` : `wss://${domain}`;
}

const banners = document.querySelectorAll(".banner");
banners.forEach((element) => {
	element.remove();
});

let socket;
let reconnectCount = 0;
const MAX_RECONNECT_COUNT = 5;

function connectWebSocket() {
	socket = new WebSocket(getWsUrl());

	socket.addEventListener("message", (event) => {
		event = JSON.parse(event.data);
		const handler = eventHandlers[event.name];
		handler(event);
	});

	// ping pong
	//setInterval(() => {
	//	socket.send(JSON.stringify("ping"));
	//}, 10000);

	// window.addEventListener("offline", () => {
	// 	//tryReconnect();
	// 	socket.close();
	// });

	socket.onerror = (event) => {
		console.error(event);
		setMessage("Server is not responding");
	};

	socket.onclose = (event) => {
		//tryReconnect(event);
	};
}

function tryReconnect(event) {
	if (reconnectCount >= MAX_RECONNECT_COUNT) {
		console.error(event);
		setMessage("Server is not responding");
		return;
	}
	reconnectCount++;
	setTimeout(() => {
		connectWebSocket();
	}, 1000);
}

connectWebSocket();

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
}

handleUserInput();

function handleUserInput() {
	document.addEventListener("keydown", (event) => {
		if (!isPlayingGame) return;
		switch (event.key) {
			case "ArrowUp":
				if (
					data[myGuid].direction.y === 1 ||
					data[myGuid].direction.y === -1
				)
					return;
				sendMyDirectionEventDebounced({ x: 0, y: -1 });
				break;
			case "ArrowDown":
				if (
					data[myGuid].direction.y === -1 ||
					data[myGuid].direction.y === 1
				)
					return;
				sendMyDirectionEventDebounced({ x: 0, y: 1 });
				break;
			case "ArrowLeft":
				if (
					data[myGuid].direction.x === 1 ||
					data[myGuid].direction.x === -1
				)
					return;
				sendMyDirectionEventDebounced({ x: -1, y: 0 });
				break;
			case "ArrowRight":
				if (
					data[myGuid].direction.x === -1 ||
					data[myGuid].direction.x === 1
				)
					return;
				sendMyDirectionEventDebounced({ x: 1, y: 0 });
				break;
		}
	});
}
function debounce(func, timeout = 200) {
	let timer;
	return (...args) => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			func.apply(this, args);
		}, timeout);
	};
}

const sendMyDirectionEventDebounced = debounce(sendMyDirectionEvent);

function sendMyDirectionEvent(direction) {
	const moveEvent = {
		name: "moveSnake",
		player: myGuid,
		direction: direction,
	};

	socket?.send(JSON.stringify(moveEvent));
}

function updateBoard() {
	moveSnakeAction(data[myGuid]);
	moveSnakeAction(data[otherGuid]);
}

function moveSnakeAction(player) {
	const currentSnakeHead = player.snake[0];
	const newSnakeHead = {
		x: currentSnakeHead.x + player.direction.x,
		y: currentSnakeHead.y + player.direction.y,
	};
	player.snake.unshift(newSnakeHead);
	if (newSnakeHead.x === food.x && newSnakeHead.y === food.y) {
		// you ate the food => you grow
	} else {
		player.snake.pop();
	}
}

function renderSnake(snake, player) {
	snake.forEach((position, i) => {
		const snakeElement = document.createElement("div");
		snakeElement.style.gridColumn = position.x;
		snakeElement.style.gridRow = position.y;
		snakeElement.classList.add(
			i === 0 ? `snake${player}-head` : `snake${player}`
		);
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

let isPlayingGame = false;

const eventHandlers = {
	connection: (event) => {
		myGuid = event.guid;
		setMessage(`Your guid: ${event.message}`);
	},
	startGame: (event) => {
		initialize(event.data);
		isPlayingGame = true;
	},
	update: (event) => {
		moveEvent(event);
	},
	endGame: (event) => {
		const winnerGuid = event.winnerGuid;
		finish(winnerGuid);
		isPlayingGame = false;
	},
	error: (event) => {
		const errorMessage = event.error;
		showErrorConnectGuid(errorMessage);
	},
};

function showErrorConnectGuid(errorMessage) {
	const element = document.querySelector("div#join-with-guid");
	const errorContainer = document.createElement("div");
	errorContainer.classList.add("banner");
	const error = document.createElement("p");
	error.textContent = errorMessage;
	error.style.fontSize = "14px";
	errorContainer.appendChild(error);
	element.insertAdjacentElement("afterend", errorContainer);
}

function moveEvent(event) {
	data[myGuid].direction = event.data[myGuid];
	data[otherGuid].direction = event.data[otherGuid];
	updateBoard();
	food = event.data.newFoodPosition;

	renderBoard();
}

function registerEvents() {
	const searchRandomButton = document.getElementById("search-random");
	searchRandomButton.addEventListener("click", (_) => {
		const banners = document.querySelectorAll(".banner");
		banners.forEach((element) => {
			element.remove();
		});
		document.getElementById("join-with-guid").style.display = "none";
		setMessage("Searching for opponent...");
		socket?.send(
			JSON.stringify({
				name: "searchRandom",
			})
		);
	});

	const joinWithGuid = document.getElementById("join-with-guid-button");
	joinWithGuid.addEventListener("click", (_) => {
		const input = document.getElementById("messageInput");
		socket?.send(
			JSON.stringify({
				name: "joinMeWith",
				data: input.value,
			})
		);
		input.value = "";
	});
}

function finish(winnerGuid) {
	if (winnerGuid === null) {
		showBanner("GAME OVER", "DRAW");
	} else if (winnerGuid == myGuid) {
		showBanner("Congratulations", "You are the winner");
	} else {
		showBanner("Unfortunately", "You lost the game");
	}
}

function showBanner(title, message) {
	const banner = document.createElement("div");
	banner.classList.add("banner");
	const bannerTitle = document.createElement("h1");
	bannerTitle.textContent = title;
	const text = document.createElement("p");
	text.textContent = message;
	text.style.fontSize = "18px";

	banner.appendChild(bannerTitle);
	banner.appendChild(text);

	banner.style.display = "flex";
	banner.style.flexDirection = "column";
	banner.style.alignItems = "center";

	document.body.prepend(banner);
}

registerEvents();
