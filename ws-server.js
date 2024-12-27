const WebSocket = require('ws');

function configureWsServer(server) {
    const webSocketServer = new WebSocket.Server({ server });

    webSocketServer.on('connection', (ws) => {
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
      
        ws.on('close', () => {
            console.log('Client disconnected');
        });
    });

    return webSocketServer;
}

module.exports = configureWsServer;