const WebSocket = require('ws');
const PriorityQueue = require('./priority_queue');

const roomsIds = new PriorityQueue();
for(let i = 0; i < 20; i++) {
    roomsIds.push(i);
}
function configureWsServer(server) {
    const webSocketServer = new WebSocket.Server({ server });

    const generatedGUIDS = new Set();
    // guid => socket
    const guidToSocket = new Map();
    const socketToGuid = new Map(); // ?
    // rooms object = {};
    // key -> room id, value -> array of guids/sockets
    const rooms = [];
    // guid both 
    // first sends event => vtoriq guid
    // lobby s id 1: {guid1: 1, guid2: 2}

    // key - user guid
    // value - room id
    const guidToRoom = new Map();

    webSocketServer.on('connection', (ws) => {
        // create guid and send to client
        const myGuid = createGUID(generatedGUIDS);
        guidToSocket.set(myGuid, ws);

        const connectionEvent = {
            name: 'connection',
            guid: myGuid,
            message: 'Welcome to the WebSocket server!' + myGuid
        };

        ws.send(JSON.stringify(connectionEvent));
        ws.on('message', (message) => {
            const event = JSON.parse(message);

            // TODO: create object of handlers
            if (event.name === 'joinMeWith') {
                const otherGuid = event.data;
                if(!checkExistingGuid(guidToSocket, otherGuid)) {
                    ws.send(`There is not such guid existing: ${otherGuid}`);
                    return;
                }
                if(myGuid === otherGuid) {
                    ws.send(`You cannot enter the same guid`);
                    return;
                }

                const myRoom = joinRoom(rooms, guidToSocket, myGuid, otherGuid);
                guidToRoom.set(myGuid, myRoom);
                guidToRoom.set(otherGuid, myRoom);
            }

            if(event.name === 'moveSnake') {
                const myRoom = guidToRoom.get(myGuid);
                let player = event.player;
                let players = rooms[myRoom].guids;
                let direction = event.direction;
                const moveEvent = {
                    name: 'moveSnake',
                    player: player,
                    direction: direction
                };
                players.forEach((player) => {
                    if(guidToSocket.get(player).readyState === WebSocket.OPEN) {
                        guidToSocket.get(player).send(JSON.stringify(moveEvent));
                    }
                });
            }

            if(event.name === 'generateFood') {
                let gameState = event.gameState;
                generateFood(rooms, guidToRoom.get(myGuid), gameState, guidToSocket);
            }

        });
      
        ws.on('close', () => {
            console.log('Client disconnected');
        });
    });

    return webSocketServer;
}

module.exports = configureWsServer;

function createGUID(generatedGUIDS) {
    const possibleSymbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    while (true) {
        let guid="";
        for (let i = 0; i < 5; i++) {
            guid += possibleSymbols.charAt(Math.floor(Math.random() * possibleSymbols.length));
        }
        if (!generatedGUIDS.has(guid)) {
            generatedGUIDS.add(guid);
            return guid;
        }
    }
}

function joinRoom(rooms, guidToSocket, myGuid, otherGuid) {
    let freeRoomId = roomsIds.pop();
    let room = {id:freeRoomId, guids:[myGuid, otherGuid]};
    rooms.push(room);
 
    const event = {
        name: 'startGame',
        data: {
            roomId: freeRoomId,
            startTime: new Date().getTime() + 5,
            players: [myGuid, otherGuid]

        }
    };
    event.data[myGuid] = {
        position: {x: 2, y: 2},
        direction: {x: 1, y: 0}
    }
    event.data[otherGuid] = {
        position: {x: 18, y: 18},
        direction: {x: -1, y: 0}
    };
    
    guidToSocket.get(otherGuid).send(JSON.stringify(event));
    guidToSocket.get(myGuid).send(JSON.stringify(event));
    return rooms.length - 1;
}

function checkExistingGuid(guidToSocket, guid) {
    return guidToSocket.has(guid);
}

function generateFoodCoordinates(gameState) {
	while(true) {
		let foodX = Math.round(Math.random() * 20);
		let foodY = Math.round(Math.random() * 20);
		if(!gameState[foodX][foodY]) {
			return {x: foodX, y: foodY};
		}
	}
}

function generateFood(rooms, roomIndex, gameState, guidToSocket) {
    let foodCoordinates = generateFoodCoordinates(gameState);
    const event = {
        name: 'generateFood',
        food: foodCoordinates
    };
    rooms[roomIndex].guids.forEach((guid) =>{
        if(guidToSocket.get(guid).readyState === WebSocket.OPEN) {
            guidToSocket.get(guid).send(JSON.stringify(event))
        }
    });
}
