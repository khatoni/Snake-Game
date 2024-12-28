const WebSocket = require('ws');

function configureWsServer(server) {
    const webSocketServer = new WebSocket.Server({ server });

    // guid => socket
    const guidToSocket = new Map();
    const socketToGuid = new Map(); // ?
    // rooms object = {};
    // key -> room id, value -> array of guids/sockets

    // guid both 
    // first sends event => vtoriq guid
    // lobby s id 1: {guid1: 1, guid2: 2}

    webSocketServer.on('connection', (ws) => {
        // create guid and send to client
        const myGuid = "";
        let myRoom = -1;

        console.log('Client connected');
      
        ws.send('Welcome to the WebSocket server!');
        ws.on('message', (message) => {
            console.log('Received:', message.toString());
            
            // Broadcast to all clients
            webSocketServer.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(`Server broadcast: ${message}`);
                }
            });
        });
        // priority queue for maximum 20 rooms
        ws.on('joinMeWith', (tonyGuid) => {
            // create room with me and tonyGuid
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