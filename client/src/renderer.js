import * as THREE from 'three';
import OrbitControls from './OrbitControls';

import MATERIALS from './materials';

const CONSTANTS = require('../../shared/constants.js');

class Renderer {
    constructor(canvas) {
        this._scene = new THREE.Scene();

        this._worldGroup = new THREE.Group();
        this._scene.add(this._worldGroup);

        this._camera = new THREE.PerspectiveCamera(75, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000);
        this._camera.position.set(7, -15, 15);
        this._camera.up.set(0, 0, 1);
        this._camera.lookAt(new THREE.Vector3(0, 0, 0));

        this._controls = new OrbitControls(this._camera);
        this._controls.enablePan = false;

        this._directionalLight = new THREE.DirectionalLight('white', 0.8);
        this._directionalLight.position.set(10, -15, 20);
        this._scene.add(this._directionalLight);

        this._ambientLight = new THREE.AmbientLight('white', 0.2);
        this._scene.add(this._ambientLight);

        this._webGLRenderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true, alpha: true});
        this._webGLRenderer.setSize(canvas.offsetWidth, canvas.offsetHeight);

        this._boxGeometry = new THREE.BoxGeometry(1, 1, 1);
        this._blockMaterial = new THREE.MeshLambertMaterial({vertexColors: THREE.FaceColors});

        this._playerCube = new THREE.Mesh(this._boxGeometry, new THREE.MeshLambertMaterial({color: 'blue'}));
        this._otherCube = new THREE.Mesh(this._boxGeometry, new THREE.MeshLambertMaterial({color: 'orange'}));

        this._loadedPlayerIDs = {};
    }

    render() {
        if (this._webGLRenderer.getSize().width !== this._webGLRenderer.domElement.offsetWidth ||
            this._webGLRenderer.getSize().height !== this._webGLRenderer.domElement.offsetHeight) {
            this._webGLRenderer.setSize(this._webGLRenderer.domElement.offsetWidth, this._webGLRenderer.domElement.offsetHeight);
            this._camera.aspect = this._webGLRenderer.domElement.offsetWidth / this._webGLRenderer.domElement.offsetHeight;
            this._camera.updateProjectionMatrix();
        }

        this._webGLRenderer.render(this._scene, this._camera);
    }

    getViewVector(level, myID) {
        const p = level.players[myID].position;
        return new THREE.Vector3(p.x, p.y, p.z).clone().sub(this._camera.position);
    }

    updateWorld(level, myID) {
        if (level.world) {
            for (let xc = -level.world.dimensions.x; xc < level.world.dimensions.x; xc++) {
                for (let yc = -level.world.dimensions.y; yc < level.world.dimensions.y; yc++) {
                    const offset = {x: xc * CONSTANTS.chunkSize, y: yc * CONSTANTS.chunkSize};

                    const chunk = level.world.chunks[
                    (yc + level.world.dimensions.y) * level.world.dimensions.x
                    + xc + level.world.dimensions.x];

                    const chunkGeometry = new THREE.Geometry();

                    for (let x = 0; x < CONSTANTS.chunkSize; x++) {
                        for (let y = 0; y < CONSTANTS.chunkSize; y++) {
                            for (let z = 0; z < CONSTANTS.chunkHeight; z++) {
                                const vertexOffset = chunkGeometry.vertices.length;

                                this._boxGeometry.vertices.forEach(v => {
                                    chunkGeometry.vertices.push(new THREE.Vector3(
                                        v.x + x + offset.x,
                                        v.y + y + offset.y,
                                        v.z - z - 0.5
                                    ));
                                });
                                this._boxGeometry.faces.forEach(f => {
                                    chunkGeometry.faces.push(new THREE.Face3(
                                        f.a + vertexOffset,
                                        f.b + vertexOffset,
                                        f.c + vertexOffset,
                                        f.normal,
                                        MATERIALS[
                                            chunk[
                                            z * CONSTANTS.chunkSize * CONSTANTS.chunkSize +
                                            y * CONSTANTS.chunkSize +
                                            x]].color
                                    ));
                                });
                            }
                        }
                    }
                    this._worldGroup.add(new THREE.Mesh(chunkGeometry, this._blockMaterial));
                }
            }
        }

        const removeList = [];
        Object.keys(this._loadedPlayerIDs).forEach(pID => {
            const pObject = this._loadedPlayerIDs[pID];

            if (level.players[pID]) {
                const pData = level.players[pID];

                if (pID === myID) {
                    // move the camera by the amount the player moved, so it follows the player
                    this._camera.position.copy(
                        new THREE.Vector3(pData.position.x, pData.position.y, pData.position.z)
                            .sub(pObject.position)
                            .add(this._camera.position)
                    );
                }
                pObject.position.set(pData.position.x, pData.position.y, pData.position.z);
                if (pID === myID) {
                    this._camera.lookAt(pObject.position);
                    this._controls.target = pObject.position;
                    this._controls.update();
                }
            } else {
                removeList.push(pObject);
            }
        });

        removeList.forEach(playerObject => {
            delete this._loadedPlayerIDs[playerObject.userData.id];
            this._scene.remove(playerObject);
        });

        Object.keys(level.players).forEach(pID => {
            if (!this._loadedPlayerIDs[pID]) {
                const pData = level.players[pID];

                let pObject = null;
                if (pID === myID) {
                    pObject = this._playerCube.clone();
                } else {
                    pObject = this._otherCube.clone();
                }
                pObject.position.set(pData.position.x, pData.position.y, pData.position.z);
                pObject.userData.id = pID;
                this._scene.add(pObject);
                this._loadedPlayerIDs[pID] = pObject;
            }
        });
    }
}

export default Renderer;