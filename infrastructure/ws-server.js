const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const Room = require("../models/room");
const { GAME_SPEED } = require("./utils");

// guids searching for random game
const searchRandom = new Set();
// key - user guid, value - socket
const guidToSocket = new Map();
// key - room guid, value - Room
const roomGuidToRoom = new Map();
// key - user guid, value - room guid
const userGuidToRoomGuid = new Map();

function configureWsServer(server) {
	const webSocketServer = new WebSocket.Server({ server });

	webSocketServer.on("connection", (ws) => {
		// create guid and send to client
		const myGuid = uuidv4();
		guidToSocket.set(myGuid, ws);

		const connectionEvent = {
			name: "connection",
			guid: myGuid,
			message: myGuid,
		};

		ws.send(JSON.stringify(connectionEvent));
		ws.on("message", (message) => {
			const event = JSON.parse(message);

			// TODO: create object of handlers
			if (event.name === "joinMeWith") {
				const otherGuid = event.data;
				if (!checkExistingGuid(otherGuid)) {
					// TODO: decide what to do ws.send(`There is not such guid existing: ${otherGuid}`);
					return;
				}
				if (myGuid === otherGuid) {
					// TODO: decide what to do ws.send(`You cannot enter the same guid`);
					return;
				}

				if (searchRandom.has(otherGuid) || searchRandom.has(myGuid)) {
					// TODO: decide what to do
					return;
				}

				if(userGuidToRoomGuid.has(myGuid) || userGuidToRoomGuid.has(otherGuid)) {
					// TODO: decide what to do
					return;
				}

				joinRoom(myGuid, otherGuid);
			} else if (event.name === "moveSnake") {
				const roomGuid = userGuidToRoomGuid.get(event.player);
				const room = roomGuidToRoom.get(roomGuid);
				room.updatePlayer(event.player, event.direction);
			} else if (event.name === "generateFood") {
				let gameState = event.gameState;
				generateFood(
					roomGuidToRoom.get(userGuidToRoomGuid.get(myGuid)),
					gameState
				);
			} else if (event.name === "searchRandom") {
				searchRandom.add(myGuid);
				if (searchRandom.size >= 2) {
					searchRandom.delete(myGuid);
					let otherGuid = "";
					// get some element from set
					for (let guid of searchRandom) {
						if (guid) {
							otherGuid = guid;
							break;
						}
					}
					searchRandom.delete(otherGuid);

					joinRoom(myGuid, otherGuid);
				}
			}
		});

		ws.on("close", () => {
			searchRandom.delete(myGuid);
			guidToSocket.delete(myGuid);
			if (userGuidToRoomGuid.has(myGuid)) {
				const roomGuid = userGuidToRoomGuid.get(myGuid);
				const room = roomGuidToRoom.get(roomGuid);
				clearRoom(room, userGuidToRoomGuid);

				const otherGuid =
					room.guids[0] === myGuid ? room.guids[1] : room.guids[0];
				if (guidToSocket.has(otherGuid)) {
					const event = {
						name: "endGame",
						winnerGuid: otherGuid,
					};
					guidToSocket.get(otherGuid).send(JSON.stringify(event));
				}
			}
		});
	});

	return webSocketServer;
}

function clearRoom(room) {
	room.clear();
	roomGuidToRoom.delete(room.id);
	userGuidToRoomGuid.delete(room.guids[0]);
	userGuidToRoomGuid.delete(room.guids[1]);
}

function joinRoom(myGuid, otherGuid) {
	const room = new Room(uuidv4(), [myGuid, otherGuid]);
	roomGuidToRoom.set(room.id, room);

	const event = {
		name: "startGame",
		data: {
			...room.data,
		},
	};

	for (let guid of room.guids) {
		guidToSocket.get(guid).send(JSON.stringify(event));
		userGuidToRoomGuid.set(guid, room.id);
	}

	room.timeoutId = setTimeout(() => {
		room.intervalId = setInterval(() => {
			// update board
			room.makeMove();
			let collision = room.hasCollision();
			if (collision) {
				clearRoom(room);

				const event = {
					name: "endGame",
					winnerGuid: collision.winner,
				};
				for (let guid of room.guids) {
					guidToSocket.get(guid).send(JSON.stringify(event));
				}
				return;
			}
			room.generateFood();

			const event = {
				name: "update",
				data: {
					newFoodPosition: room.data.food,
				},
			};

			for (let guid of room.guids) {
				event.data[guid] = room.data[guid].direction;
			}

			for (let guid of room.guids) {
				guidToSocket.get(guid).send(JSON.stringify(event));
			}
		}, GAME_SPEED);
	}, 5000);
}

function checkExistingGuid(guid) {
	return guidToSocket.has(guid);
}

function generateFoodCoordinates(gameState) {
	while (true) {
		const foodX = Math.round(Math.random() * 20);
		const foodY = Math.round(Math.random() * 20);
		if (!gameState[foodX][foodY]) {
			return { x: foodX, y: foodY };
		}
	}
}

function generateFood(room, gameState) {
	const foodCoordinates = generateFoodCoordinates(gameState);
	const event = {
		name: "generateFood",
		food: foodCoordinates,
	};
	room.guids.forEach((guid) => {
		if (guidToSocket.get(guid).readyState === WebSocket.OPEN) {
			guidToSocket.get(guid).send(JSON.stringify(event));
		}
	});
}

module.exports = configureWsServer;
