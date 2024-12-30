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

    webSocketServer.on('connection', (ws) => {
        // create guid and send to client
        const myGuid = createGUID(generatedGUIDS);
        guidToSocket.set(myGuid,ws);
        let myRoom = -1;

        console.log('Client connected');
      
        ws.send('Welcome to the WebSocket server!' + myGuid);
        ws.on('message', (message) => {
            console.log('Received:', message.toString());
            const event = JSON.parse(message);
            if (event.type === 'joinMeWith') {
                const otherGuid = event.data;
                if(!checkExistingGuid(guidToSocket, otherGuid)) {
                    ws.send(`There is not such guid existing: ${otherGuid}`);
                    return;
                }
                if(myGuid === otherGuid) {
                    ws.send(`You cannot enter the same guid`);
                    return;
                }
                joinRoom(rooms, guidToSocket, myGuid, otherGuid);
            }
            // Broadcast to all clients
            webSocketServer.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(`Server broadcast: ${message}`);
                }
            });
        });
        // priority queue for maximum 20 rooms
        ws.on('joinMeWith', (otherGuid) => {
            let freeRoomId = roomsIds.top();
            roomsIds.pop();
            let room = {id:freeRoomId, guids:[myGuid, otherGuid]};
            rooms.push(room);
            // rooms[i++] = [myGuid, tonyGuid];
            // myRoom = i - 1;

            // send to tony to he is starting game
            guidToSocket[tonyGuid].send('startGame', new Date().getTime() + 5);
            guidToSocket[myGuid].send('startGame', new Date().getTime() + 5);
        });

        ws.on('move', (direction) => {
            // get my room
            // rooms[myRoom].sendAll('move', direction);
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
    // rooms[i++] = [myGuid, tonyGuid];

    // send to tony to he is starting game
    const event = {
        type: 'startGame',
        roomId: freeRoomId,
        startTime: new Date().getTime() + 5
    };

    guidToSocket.get(otherGuid).send(JSON.stringify(event));
    guidToSocket.get(myGuid).send(JSON.stringify(event));
}

function checkExistingGuid(guidToSocket, guid) {
    return guidToSocket.has(guid);
}