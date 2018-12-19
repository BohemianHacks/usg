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

const LEVEL = require('../shared/level.js');
const level = LEVEL.createLevel();

let playerRequests = {};

io.on('connection', function (socket) {
    socket.emit('id', socket.id);
    level.players[socket.id] = {position: {x: 0, y: 0, z: 0.5}};
    io.sockets.emit('level', level);

    socket.on('move', function (data) {
        if (!playerRequests[socket.id]) {
            playerRequests[socket.id] = {
                moveDirection: {
                    x: 0,
                    y: 0
                }
            };
        }
        playerRequests[socket.id].moveDirection.x += data.x;
        playerRequests[socket.id].moveDirection.y += data.y;
        io.sockets.emit('level', level);
    });
    socket.on('disconnect', function () {
        delete level.players[socket.id];
        io.sockets.emit('level', level);
    });
});

level.players['npc_0001'] = {position: {x: 0, y: 0, z: 0.05}};

let lastTime = performance.now();
setInterval(function () {
    const now = performance.now();
    const dt = now - lastTime;

    level.players['npc_0001'] = {
        position: {
            x: Math.sin(lastTime * 0.002) * 3 - 0.5,
            y: Math.cos(lastTime * 0.002) * 3 - 0.5,
            z: 0.5
        }
    };

    Object.keys(playerRequests).forEach(pID => {
        LEVEL.movePlayer(level, pID, dt, playerRequests[pID].moveDirection);
    });
    playerRequests = {};

    io.sockets.emit('level', level);

    lastTime = now;
}, 20);