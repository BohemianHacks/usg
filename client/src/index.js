import io from 'socket.io-client'
import * as THREE from 'three';

const keysPressed = {
    a: false,
    w: false,
    s: false,
    d: false
};

let level = null;
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

const players = {};

camera.position.x = 5;
camera.position.y = -5;
camera.position.z = 5;
camera.up.set(0, 0, 1);
camera.lookAt(new THREE.Vector3(0, 0, 0));

const socket = io.connect('http://localhost:8000');
socket.on('id', function (newID) {
    myID = newID;
});
socket.on('level', function (newLevel) {
    level = newLevel;

    Object.keys(players).forEach(pID => {
        const pData = level.players[pID];
        if (pData) {
            players[pID].position.set(pData.x, pData.y, pData.z);
        } else {
            scene.remove(players[pID]);
            delete players[pID];
        }
    });

    Object.keys(level.players).forEach(pID => {
        if (!players[pID]) {
            const pData = level.players[pID];

            let pObject = null;
            if (pID === myID) {
                pObject = playerCube.clone();
            } else {
                pObject = otherCube.clone();
            }
            players[pID] = pObject;
            pObject.position.set(pData.x, pData.y, pData.z);
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

    if (level) {
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