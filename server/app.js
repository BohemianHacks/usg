const {
    performance
} = require('perf_hooks');
const path = require('path');

const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

server.listen(8000);

app.get('/', function (req, res) {
    res.sendFile(path.resolve(__dirname + '/../client/index.html'));
});
app.use('/dist', express.static(path.resolve(__dirname + '/../client/dist')));

const Game = require('./game.js');
const game = new Game();
game.createNPC();

io.on('connection', function (socket) {
    socket.emit('id', socket.id);
    game.createPlayer(socket.id);
    io.sockets.emit('level', game.level);

    socket.on('move', function (data) {
        game.addPlayerRequest(socket.id, data);
        io.sockets.emit('level', game.players);
    });
    socket.on('disconnect', function () {
        game.removePlayer(socket.id);
        io.sockets.emit('level', game.players);
    });
});

let lastTime = performance.now();
setInterval(function () {
    const now = performance.now();
    const dt = now - lastTime;

    game.tick(now, dt);

    io.sockets.emit('level', game.players);

    lastTime = now;
}, 20);