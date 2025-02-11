const WebSocket = require("ws");
const PriorityQueue = require("./priority_queue");

const roomsIds = new PriorityQueue();
for (let i = 0; i < 20; i++) {
	roomsIds.push(i);
}

const searchRandom = new Set();

function configureWsServer(server) {
	const webSocketServer = new WebSocket.Server({ server });

	const generatedGUIDS = new Set();
	const guidToSocket = new Map();
	// rooms object = {};
	// key -> room id, value -> array of guids/sockets
	const rooms = [];
	const guidToRoom = new Map();

	webSocketServer.on("connection", (ws) => {
		// create guid and send to client
		const myGuid = createGUID(generatedGUIDS);
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

				joinRoom(rooms, guidToSocket, myGuid, otherGuid);
			} else if (event.name === "moveSnake") {
				const myRoom = guidToRoom.get(myGuid);
				let player = event.player;
				let players = rooms[myRoom].guids;
				let direction = event.direction;
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
					rooms,
					guidToRoom.get(myGuid),
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

					joinRoom(rooms, guidToRoom, guidToSocket, myGuid, otherGuid);
				}
			}
		});

		ws.on("close", () => {
			searchRandom.delete(myGuid);
		});
	});

	return webSocketServer;
}

function createGUID(generatedGUIDS) {
	const possibleSymbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	while (true) {
		let guid = "";
		for (let i = 0; i < 5; i++) {
			guid += possibleSymbols.charAt(
				Math.floor(Math.random() * possibleSymbols.length)
			);
		}
		if (!generatedGUIDS.has(guid)) {
			generatedGUIDS.add(guid);
			return guid;
		}
	}
}

function joinRoom(rooms, guidToRoom, guidToSocket, myGuid, otherGuid) {
	let freeRoomId = roomsIds.pop();
	let room = { id: freeRoomId, guids: [myGuid, otherGuid] };
	rooms.push(room);

	const event = {
		name: "startGame",
		data: {
			roomId: freeRoomId,
			startTime: new Date().getTime() + 5,
			players: [myGuid, otherGuid],
		},
	};
	event.data[myGuid] = {
		position: { x: 2, y: 2 },
		direction: { x: 1, y: 0 },
	};
	event.data[otherGuid] = {
		position: { x: 18, y: 18 },
		direction: { x: -1, y: 0 },
	};

	guidToSocket.get(otherGuid).send(JSON.stringify(event));
	guidToSocket.get(myGuid).send(JSON.stringify(event));

	const myRoom = rooms.length - 1;
	guidToRoom.set(myGuid, myRoom);
	guidToRoom.set(otherGuid, myRoom);
}

function checkExistingGuid(guidToSocket, guid) {
	return guidToSocket.has(guid);
}

function generateFoodCoordinates(gameState) {
	while (true) {
		let foodX = Math.round(Math.random() * 20);
		let foodY = Math.round(Math.random() * 20);
		if (!gameState[foodX][foodY]) {
			return { x: foodX, y: foodY };
		}
	}
}

function generateFood(rooms, roomIndex, gameState, guidToSocket) {
	let foodCoordinates = generateFoodCoordinates(gameState);
	const event = {
		name: "generateFood",
		food: foodCoordinates,
	};
	rooms[roomIndex].guids.forEach((guid) => {
		if (guidToSocket.get(guid).readyState === WebSocket.OPEN) {
			guidToSocket.get(guid).send(JSON.stringify(event));
		}
	});
}

module.exports = configureWsServer;
