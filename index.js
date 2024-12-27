const express = require('express');
const http = require('http');
const path = require('path');
const configureWsServer = require('./ws-server');

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const webSocketServer = configureWsServer(server);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/pages'));

app.get('/', (req, res) => {
  res.render('home');
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}. Visit http://localhost:${PORT}`);
});
