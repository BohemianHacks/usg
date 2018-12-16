import io from 'socket.io-client'
import * as THREE from 'three';
import * as LEVEL from '../../shared/level';

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
const renderer = new THREE.WebGLRenderer({canvas: mainCanvas, antialias: true});
renderer.setSize(mainCanvas.offsetWidth, mainCanvas.offsetHeight);

const plane = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshBasicMaterial({color: 'green'}));
const playerCube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({color: 'blue'}));
const otherCube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({color: 'orange'}));
scene.add(plane);

const localLevel = {
    world: null,
    players: {}
};

camera.position.x = 5;
camera.position.y = -5;
camera.position.z = 5;
camera.up.set(0, 0, 1);
camera.lookAt(new THREE.Vector3(0, 0, 0));

const socket = io.connect('http://localhost:8000');
socket.on('id', function (newID) {
    myID = newID;
});
socket.on('level', function (remoteLevel) {
    localLevel.world = remoteLevel.world;

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