import * as THREE from 'three';

export default {
    STONE: new THREE.MeshLambertMaterial({color: '#696969'}),
    DIRT: new THREE.MeshLambertMaterial({color: '#6f3e2b'}),
    GRASS: new THREE.MeshLambertMaterial({color: '#556B2F'}),
    WATER: new THREE.MeshLambertMaterial({color: '#00CED1', opacity: 0.5, transparent: true})
};