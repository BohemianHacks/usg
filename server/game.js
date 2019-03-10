const Level = require('../shared/level.js');
const UUID = require('uuid');

class Game {
    constructor() {
        this._level = Level.createLevel();
        this._playerRequests = {};

        this._npcs = {};
    }

    get level() {
        return this._level;
    }

    get players() {
        return {players: this._level.players};
    }

    createPlayer(id) {
        this._level.players[id] = {position: {x: 0, y: 0, z: 0.5}};
    }

    removePlayer(id) {
        delete this._level.players[id];
    }

    createNPC() {
        const id = UUID.v1();
        this._level.players[id] = {position: {x: 0, y: 0, z: 0.05}};
        this._npcs[id] = this._level.players[id];
    }

    addPlayerRequest(id, data) {
        if (!this._playerRequests[id]) {
            this._playerRequests[id] = {
                moveDirection: {
                    x: 0,
                    y: 0
                }
            };
        }
        this._playerRequests[id].moveDirection.x += data.x;
        this._playerRequests[id].moveDirection.y += data.y;
    }

    tick(now, dt) {
        Object.values(this._npcs).forEach(npc => {
            npc.position = {
                x: Math.sin(now * 0.002) * 3 - 0.5,
                y: Math.cos(now * 0.002) * 3 - 0.5,
                z: 0.5
            };
        });

        Object.keys(this._playerRequests).forEach(pID => {
            Level.movePlayer(this._level, pID, dt, this._playerRequests[pID].moveDirection);
        });
        this._playerRequests = {};
    }
}

module.exports = Game;