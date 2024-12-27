const express = require('express');
const http = require('http');
const path = require('path');
const WebSocket = require('ws');

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const webSocketServer = new WebSocket.Server({ server });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/pages'));

app.get('/', (req, res) => {
  res.render('home');
});

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

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}. Visit http://localhost:${PORT}`);
});
