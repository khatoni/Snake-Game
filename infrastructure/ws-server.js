const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const Room = require("../models/room");
const { GAME_SPEED, BOARD_SIZE } = require("./utils");

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
		};

		ws.send(JSON.stringify(connectionEvent));
		ws.on("message", (message) => {
			const event = JSON.parse(message);

			if (event.name === "joinMeWith") {
				const otherGuid = event.data;
				if (!checkExistingGuid(otherGuid)) {
					ws.send(
						JSON.stringify({
							name: "error",
							error: `There is not such guid existing: ${otherGuid}`,
						})
					);
					return;
				}
				if (myGuid === otherGuid) {
					ws.send(
						JSON.stringify({
							name: "error",
							error: `You cannot enter the same guid as yours`,
						})
					);
					return;
				}

				if (searchRandom.has(otherGuid) || searchRandom.has(myGuid)) {
					ws.send(
						JSON.stringify({
							name: "error",
							error: "One of the players is searching random opponent",
						})
					);
					return;
				}

				if (
					userGuidToRoomGuid.has(myGuid) ||
					userGuidToRoomGuid.has(otherGuid)
				) {
					ws.send(
						JSON.stringify({
							name: "error",
							error: "One of the players is already in a game",
						})
					);
					return;
				}

				joinRoom(myGuid, otherGuid);
			} else if (event.name === "moveSnake") {
				const roomGuid = userGuidToRoomGuid.get(event.player);
				const room = roomGuidToRoom.get(roomGuid);
				room.updatePlayer(event.player, event.direction);
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

module.exports = configureWsServer;
