import io from 'socket.io-client'

import Renderer from './renderer';
import Controls from './controls';

let myID = null;

const renderer = new Renderer(document.getElementById('main_canvas'));

let localLevel = {
    world: {
        dimensions: {
            x: 0,
            y: 0
        },
        tiles: []
    },
    players: {}
};

const socket = io.connect('http://localhost:8000');
const controls = new Controls(socket);

socket.on('id', function (newID) {
    myID = newID;
});
socket.on('level', function (remoteLevel) {
    // TODO server should send a diff of the level
    localLevel = remoteLevel;

    renderer.updateWorld(localLevel, myID);
});

let lastTime = performance.now();
const animate = function () {
    requestAnimationFrame(animate);

    const now = performance.now();
    const dt = now - lastTime;

    if (localLevel.players[myID]) {
        controls.tick(dt, renderer.getViewVector(localLevel, myID));
    }

    renderer.render();

    lastTime = now;
};
animate();