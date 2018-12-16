var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');

server.listen(8000);
// WARNING: app.listen(80) will NOT work here!

app.get('/', function (req, res) {
    res.sendFile(path.resolve(__dirname + '/../client/index.html'));
});
app.use('/dist', express.static(path.resolve(__dirname + '/../client/dist')));

const level = {
    players: {}
};

io.on('connection', function (socket) {
    socket.emit('id', socket.id);
    level.players[socket.id] = {x: 0, y: 0, z: 0};
    io.sockets.emit('level', level);

    socket.on('move', function (data) {
        level.players[socket.id].x += data.x;
        level.players[socket.id].y += data.y;
        io.sockets.emit('level', level);
    });
    socket.on('disconnect', function () {
        delete level.players[socket.id];
        io.sockets.emit('level', level);
    })
});