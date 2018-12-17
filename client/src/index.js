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
controls.enablePan = false;

const directionalLight = new THREE.DirectionalLight('white', 0.8);
directionalLight.position.set(10, -15, 20);
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight('white', 0.2);
scene.add(ambientLight);

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
                for (let z = 0; z < localLevel.world.dimensions.z; z++) {
                    const tile = new THREE.Mesh(boxGeometry,
                        MATERIALS[
                            remoteLevel.world.tiles[
                            z * localLevel.world.dimensions.x * localLevel.world.dimensions.y +
                            y * localLevel.world.dimensions.x +
                            x]]);
                    tile.position.set(
                        x - localLevel.world.dimensions.x / 2,
                        y - localLevel.world.dimensions.y / 2,
                        -z - 0.5
                    );
                    scene.add(tile);
                    localLevel.world.tiles.push(tile);
                }
            }
        }
        const gh = new THREE.GridHelper(localLevel.world.dimensions.x, localLevel.world.dimensions.x, 'black', 'black');
        gh.rotation.x = Math.PI / 2;
        gh.position.x = -0.5;
        gh.position.y = -0.5;
        scene.add(gh);
    }

    Object.keys(localLevel.players).forEach(pID => {
        const pData = remoteLevel.players[pID];
        if (pData) {
            if (pID === myID) {
                // move the camera by the amount the player moved, so it follows the player
                camera.position.copy(
                    new THREE.Vector3(pData.position.x, pData.position.y, pData.position.z)
                        .sub(localLevel.players[pID].position)
                        .add(camera.position)
                );
            }
            localLevel.players[pID].position.set(pData.position.x, pData.position.y, pData.position.z);
            if (pID === myID) {
                camera.lookAt(localLevel.players[pID].position);
                controls.target = localLevel.players[pID].position;
                controls.update();
            }
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

    if (localLevel.players[myID]) {
        const v = localLevel.players[myID].position.clone().sub(camera.position);

        const moveEvent = {
            x: 0,
            y: 0
        };
        if (keysPressed.a) {
            moveEvent.x -= +v.y;
            moveEvent.y += +v.x;
        }
        if (keysPressed.d) {
            moveEvent.x += +v.y;
            moveEvent.y -= +v.x;
        }
        if (keysPressed.w) {
            moveEvent.x += v.x;
            moveEvent.y += v.y;
        }
        if (keysPressed.s) {
            moveEvent.x -= v.x;
            moveEvent.y -= v.y;
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