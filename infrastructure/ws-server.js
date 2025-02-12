const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const Room = require("../models/room");

const searchRandom = new Set();

function configureWsServer(server) {
	const webSocketServer = new WebSocket.Server({ server });

	// key - user guid, value - socket
	const guidToSocket = new Map();
	// key - room guid, value - Room
	const roomGuidToRoom = new Map();
	// key - user guid, value - room guid
	const userGuidToRoomGuid = new Map();

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
				if (!checkExistingGuid(guidToSocket, otherGuid)) {
					ws.send(`There is not such guid existing: ${otherGuid}`);
					return;
				}
				if (myGuid === otherGuid) {
					ws.send(`You cannot enter the same guid`);
					return;
				}

				if (searchRandom.has(otherGuid) || searchRandom.has(myGuid)) {
					// TODO: decide what to do
					return;
				}

				joinRoom(
					roomGuidToRoom,
					userGuidToRoomGuid,
					guidToSocket,
					myGuid,
					otherGuid
				);
			} else if (event.name === "moveSnake") {
				const myRoom = userGuidToRoomGuid.get(myGuid);
				const player = event.player;
				const players = roomGuidToRoom.get(myRoom).guids;
				const direction = event.direction;
				const moveEvent = {
					name: "moveSnake",
					player: player,
					direction: direction,
				};
				players.forEach((player) => {
					if (
						guidToSocket.get(player).readyState === WebSocket.OPEN
					) {
						guidToSocket
							.get(player)
							.send(JSON.stringify(moveEvent));
					}
				});
			} else if (event.name === "generateFood") {
				let gameState = event.gameState;
				generateFood(
					roomGuidToRoom.get(userGuidToRoomGuid.get(myGuid)),
					gameState,
					guidToSocket
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

					joinRoom(
						roomGuidToRoom,
						userGuidToRoomGuid,
						guidToSocket,
						myGuid,
						otherGuid
					);
				}
			}
		});

		ws.on("close", () => {
			searchRandom.delete(myGuid);
		});
	});

	return webSocketServer;
}

function joinRoom(
	roomGuidToRoom,
	userGuidToRoomGuid,
	guidToSocket,
	myGuid,
	otherGuid
) {
	const room = new Room(uuidv4(), [myGuid, otherGuid]);
	roomGuidToRoom.set(room.id, room);

	const event = {
		name: "startGame",
		data: {
			roomId: room.id,
			startTime: new Date().getTime() + 5,
			players: [myGuid, otherGuid],
			...room.data,
		},
	};

	guidToSocket.get(otherGuid).send(JSON.stringify(event));
	guidToSocket.get(myGuid).send(JSON.stringify(event));

	userGuidToRoomGuid.set(myGuid, room.id);
	userGuidToRoomGuid.set(otherGuid, room.id);
}

function checkExistingGuid(guidToSocket, guid) {
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

function generateFood(room, gameState, guidToSocket) {
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
