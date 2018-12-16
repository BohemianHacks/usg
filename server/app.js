const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');
const LEVEL = require('../shared/level.js');

server.listen(8000);

app.get('/', function (req, res) {
    res.sendFile(path.resolve(__dirname + '/../client/index.html'));
});
app.use('/dist', express.static(path.resolve(__dirname + '/../client/dist')));

const level = LEVEL.createLevel();

io.on('connection', function (socket) {
    socket.emit('id', socket.id);
    level.players[socket.id] = {position: {x: 0, y: 0, z: 0.5}};
    io.sockets.emit('level', level);

    socket.on('move', function (data) {
        LEVEL.movePlayer(level, socket.id, data);
        io.sockets.emit('level', level);
    });
    socket.on('disconnect', function () {
        delete level.players[socket.id];
        io.sockets.emit('level', level);
    })
});