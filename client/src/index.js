import io from 'socket.io-client'
import * as THREE from 'three';
import * as LEVEL from '../../shared/level';
import MATERIALS from './materials';

import './OrbitControls';

const keysPressed = {
    a: false,
    w: false,
    s: false,
    d: false
};

let myID = null;

const mainCanvas = document.getElementById('main_canvas');

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, mainCanvas.offsetWidth / mainCanvas.offsetHeight, 0.1, 1000);
camera.position.set(7, -15, 15);
camera.up.set(0, 0, 1);
camera.lookAt(new THREE.Vector3(0, 0, 0));

const controls = new THREE.OrbitControls(camera);

const light = new THREE.DirectionalLight('white', 1);
light.position.set(10, -15, 20);
scene.add(light);

const renderer = new THREE.WebGLRenderer({canvas: mainCanvas, antialias: true, alpha: true});
renderer.setSize(mainCanvas.offsetWidth, mainCanvas.offsetHeight);

const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const playerCube = new THREE.Mesh(boxGeometry, new THREE.MeshLambertMaterial({color: 'blue'}));
const otherCube = new THREE.Mesh(boxGeometry, new THREE.MeshLambertMaterial({color: 'orange'}));

const localLevel = {
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
socket.on('id', function (newID) {
    myID = newID;
});
socket.on('level', function (remoteLevel) {
    localLevel.world.dimensions = remoteLevel.world.dimensions;
    if (localLevel.world.tiles.length === 0) {
        // TODO server should send a diff of the level
        for (let x = 0; x < localLevel.world.dimensions.x; x++) {
            for (let y = 0; y < localLevel.world.dimensions.y; y++) {
                const tile = new THREE.Mesh(boxGeometry, MATERIALS[remoteLevel.world.tiles[y * 10 + x]]);
                tile.position.set(x - localLevel.world.dimensions.x / 2, y - localLevel.world.dimensions.y / 2, -0.5);
                scene.add(tile);
                localLevel.world.tiles.push(tile);
            }
        }
    }

    Object.keys(localLevel.players).forEach(pID => {
        const pData = remoteLevel.players[pID];
        if (pData) {
            localLevel.players[pID].position.set(pData.position.x, pData.position.y, pData.position.z);
        } else {
            scene.remove(localLevel.players[pID]);
            delete localLevel.players[pID];
        }
    });

    Object.keys(remoteLevel.players).forEach(pID => {
        if (!localLevel.players[pID]) {
            const pData = remoteLevel.players[pID];

            let pObject = null;
            if (pID === myID) {
                pObject = playerCube.clone();
            } else {
                pObject = otherCube.clone();
            }
            localLevel.players[pID] = pObject;
            pObject.position.set(pData.position.x, pData.position.y, pData.position.z);
            scene.add(pObject);
        }
    });
});

let lastTime = performance.now();
const animate = function () {
    requestAnimationFrame(animate);

    if (renderer.getSize().width !== mainCanvas.offsetWidth ||
        renderer.getSize().height !== mainCanvas.offsetHeight) {
        renderer.setSize(mainCanvas.offsetWidth, mainCanvas.offsetHeight);
        camera.aspect = mainCanvas.offsetWidth / mainCanvas.offsetHeight;
        camera.updateProjectionMatrix();
    }

    const now = performance.now();
    const dt = now - lastTime;

    if (localLevel.world) {
        const moveEvent = {
            x: 0,
            y: 0
        };
        if (keysPressed.a) {
            moveEvent.x -= (0.01 * dt);
        }
        if (keysPressed.d) {
            moveEvent.x += (0.01 * dt);
        }
        if (keysPressed.w) {
            moveEvent.y += (0.01 * dt);
        }
        if (keysPressed.s) {
            moveEvent.y -= (0.01 * dt);
        }

        if (moveEvent.x > 0 || moveEvent.x < 0 || moveEvent.y > 0 || moveEvent.y < 0) {
            // be optimistic and already move
            LEVEL.movePlayer(localLevel, myID, moveEvent);

            socket.emit("move", moveEvent);
        }
    }

    renderer.render(scene, camera);

    lastTime = now;
};
animate();

document.addEventListener("keydown", function (e) {
    keysPressed[e.key] = true;
});

document.addEventListener("keyup", function (e) {
    keysPressed[e.key] = false;
});